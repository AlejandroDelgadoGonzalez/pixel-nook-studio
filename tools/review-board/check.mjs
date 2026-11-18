import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {officialSizes} from '../../qa/official-layouts.mjs';

const output=resolve('.artifacts/pixel-kitchen-transition/review-board-phase-e');
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({offline:true,viewport:{width:1280,height:900}});
const requests=[];
const errors=[];
context.on('request',r=>{if(/^https?:/i.test(r.url()))requests.push(r.url());});
const results=[];
try{
 for(const phase of ['pre-cook','post-cook']){
  const file=resolve(output,phase,'REVIEW-BOARD.html');
  const html=await readFile(file,'utf8');
  const receipt=JSON.parse(await readFile(resolve(output,phase,'REVIEW-BOARD.receipt.json'),'utf8'));
  assert.equal(createHash('sha256').update(html).digest('hex'),receipt.htmlSha256);
  assert.doesNotMatch(html,/\bfetch\s*\(|\bXMLHttpRequest\b|400\s*%|\batlas\b/i);
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pathToFileURL(file).href);
  await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
  assert.deepEqual(await page.locator('section > h2').allTextContents(),[
    'Overview','Narrative','Scene & Geometry','Reused Assets','New Precooked Sources',
    'Cook in Pixel Kitchen','Optional Finishing','Evidence & Decisions']);
  assert.match(await page.locator('#section-1').textContent(),/PAUSED \/ NON-BLOCKING/);
  assert.match(await page.locator('#section-7').textContent(),/NOT REQUESTED/);
  const data=await page.locator('#board-data').evaluate(e=>JSON.parse(e.textContent));
  for(const [key,a] of Object.entries(data.assets)){
   const raw=Buffer.from(a.data.split(',')[1],'base64');
   assert.equal(createHash('sha256').update(raw).digest('hex'),receipt.inputs[key]);
  }
  assert.ok(data.precooked.every(k=>data.assets[k].dimensions[0]>64));
  assert.equal(await page.locator('#section-5 a[download]').count(),4);
  if(phase==='pre-cook'){
   assert.match(await page.locator('#section-6').textContent(),/NOT RUN/);
   assert.equal(Object.keys(data.assets).some(key=>key.endsWith('.cook')),false);
  }else{
   assert.equal(data.cook.length,5);
   const section=page.locator('#section-6');
   assert.doesNotMatch(await section.textContent(),/NOT RUN/);
   const first=section.locator('select').first();
   const native=section.locator('.sample img').first();
   for(const z of [1,4,8]){
    await first.selectOption(z+'×');
    assert.equal(await native.evaluate(i=>i.width),nativeSize(data)*z);
   }
   await first.selectOption('4×');
  }
  const frame=page.locator('#section-3');
  const [vp,mode]=await frame.locator('select').all();
  for(const [width,height] of officialSizes){
   await page.setViewportSize({width,height});
   await vp.selectOption(width+' × '+height);
   for(const m of ['Auto','9:16','16:9']){
    await mode.selectOption(m);
    const expected=data.measure.frames.find(f=>f.viewport[0]===width&&f.viewport[1]===height&&f.mode===m);
    assert.equal(await frame.locator('[data-layer=frame] rect').first().getAttribute('width'),String(expected.frustum[2]));
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   }
  }
  const roots=frame.getByLabel('Body roots');
  await roots.uncheck();assert.equal(await frame.locator('[data-layer=roots]').isVisible(),false);
  await roots.check();
  await page.setViewportSize({width:1280,height:900});
  await vp.selectOption('390 × 844');await mode.selectOption('9:16');
  if(phase==='pre-cook'){
   await frame.screenshot({path:resolve(output,'measure.png')});
   await page.locator('#section-5').screenshot({path:resolve(output,'precooked.png')});
   await page.setViewportSize({width:390,height:844});
   await frame.scrollIntoViewIfNeeded();
   await page.screenshot({path:resolve(output,'mobile-390x844.png')});
  }else{
   await page.locator('#section-6 .pair').first().screenshot({path:resolve(output,'native-cook.png')});
  }
  results.push({phase,layouts:18,embeddedInputs:Object.keys(data.assets).length});
  await page.close();
 }
 assert.deepEqual(requests,[]);
 assert.deepEqual(errors,[]);
 await writeFile(resolve(output,'results.json'),JSON.stringify({passed:true,externalRequests:requests,errors,results},null,2));
 console.log('PASS: two offline revisions, 36 layout selections, pinned images, truthful states, native zoom and no external requests.');
}finally{await browser.close();}
function nativeSize(data){return data.assets[data.cook[0].native].dimensions[0];}
