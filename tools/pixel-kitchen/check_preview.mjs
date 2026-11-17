/* Read-only static-release QA. Writes evidence only below this checkout's .artifacts. */
import {chromium} from 'playwright';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import assert from 'node:assert/strict';

const base=(process.argv[2]||'http://127.0.0.1:8872').replace(/\/$/,'');
const root=path.resolve(import.meta.dirname,'../..');
const output=path.resolve(root,process.env.PIXEL_KITCHEN_QA_OUTPUT||'.artifacts/pixel-kitchen-preview');
assert.ok(output.startsWith(path.join(root,'.artifacts')+path.sep));
await mkdir(output,{recursive:true});
process.env.QA_BASE_URL=base;
const route='/app/pixel-kitchen-preview/';
const local=path.join(root,'app/pixel-kitchen-preview');
const manifest=JSON.parse(await readFile(path.join(local,'pilot.json'),'utf8'));
const expected={
  front:'0a5d8d1246c5e75cb9402d980a27385ed585f8825302bdff89ff8f9911fec6fb',
  side:'f8ce15878d929da93320d6a67d961160c72303a509901222bd5961020c3ffa59',
  back:'174f3782ace05be4a7e0ee85461f3451696f74e678b0a220f0bf7c21599bd3e5',
  object:'52f04595cfdbc72c3ea0b0ca46c25940997636d4a85f5660bf3298664716fa41',
  scene:'7363b4cc70133cfb146cbe2b7a22c7a4c009713c915a5a72da9c6ff7bf5af154'
};
const hash=b=>createHash('sha256').update(b).digest('hex');
const result={base,route,scope:'Static preview and existing library/reader smoke; emulated viewports, not physical phone QA',errors:[],resources:[],assets:[],preview:[],readers:[]};
async function get(url){const r=await fetch(url);assert.equal(r.status,200,url);return r;}
function watch(page){
  page.on('pageerror',e=>result.errors.push({message:e.message,url:page.url()}));
  page.on('console',m=>{if(m.type()==='error')result.errors.push({message:m.text(),url:page.url()});});
  page.on('response',r=>{if(r.status()>=400)result.resources.push({status:r.status(),url:r.url()});});
  page.on('requestfailed',r=>{if(!r.failure()?.errorText.includes('ERR_ABORTED'))result.errors.push({url:r.url(),message:r.failure()?.errorText});});
}
let browser;
try{
  assert.equal(manifest.validation.valid,true);assert.equal(manifest.validation.ready,false);
  assert.equal(manifest.validation.pending.length,4);assert.equal(manifest.adopted,false);
  assert.equal(manifest.sources.find(s=>s.id==='pilot.alice.source.side').review.state,'approved');
  for(const view of ['front','back'])assert.equal(manifest.sources.find(s=>s.id==='pilot.alice.source.'+view).review.state,'draft');
  assert.equal(manifest.visualApprovals[0].sha256,'52794c9e75e6a6e460207ebde435f1ce40582964f599878edf3be59be79c7bb2');
  for(const [view,m] of Object.entries(manifest.measurements.views)){
    for(let i=0;i<2;i++)assert.ok(Math.abs(m.sourceRoot[i]*m.transform.scale+m.transform.offset[i]-manifest.placement.root[i])<1e-9,view+' root');
  }
  for(const file of ['index.html','viewer.js','pilot.json']){
    const text=await readFile(path.join(local,file),'utf8');
    assert.ok(!/\.artifacts|localhost|127\.0\.0\.1|[A-Z]:[\\/]|\/tools\//i.test(text),'No private/local dependency in '+file);
    assert.equal(await (await get(base+route+file)).text(),text,'Served release matches source: '+file);
  }
  for(const [kind,pin] of Object.entries(manifest.assets)){
    const bytes=await readFile(path.join(local,pin.file));
    assert.equal(hash(bytes),expected[kind]);assert.equal(pin.sha256,expected[kind]);
    assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],pin.dimensions);
    assert.equal(hash(Buffer.from(await (await get(base+route+pin.file)).arrayBuffer())),expected[kind]);
    result.assets.push({kind,sha256:pin.sha256,dimensions:pin.dimensions,bytes:bytes.length});
  }
  browser=await chromium.launch({channel:process.env.QA_BROWSER_CHANNEL||'chrome',headless:true});
  for(const viewport of [{width:390,height:844},{width:1280,height:720}]){
    const page=await browser.newPage({viewport,deviceScaleFactor:1});watch(page);
    const requests=[];page.on('request',r=>requests.push(r.url()));
    await page.addInitScript(()=>{
      window.nativeDrawAudit={nearest:0,smoothed:0};const draw=CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.drawImage=function(im,...args){
        if((im.width===640&&im.height===360)||(im.width===64&&im.height===64)||(im.width===32&&im.height===32))window.nativeDrawAudit[this.imageSmoothingEnabled?'smoothed':'nearest']++;
        return draw.call(this,im,...args);
      };
    });
    await page.goto(base+'/#home');await page.waitForSelector('[data-save="the-first-path"]');
    const entry=page.getByRole('link',{name:'Pixel Kitchen Preview',exact:true});assert.equal(await entry.count(),1);
    await entry.click();await page.waitForFunction(()=>window.pixelKitchenPilot?.state.ready);
    const states=[];
    for(const zoom of [1,4]){
      await page.click(`[data-zoom="${zoom}"]`);
      for(const view of ['front','side','back']){
        await page.click(`[data-view="${view}"]`);
        await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
        const s=await page.evaluate(()=>window.pixelKitchenPilot.snapshot());
        assert.deepEqual(s.nativeCanvas,[640,360]);assert.deepEqual(s.alice.cell,[64,64]);assert.deepEqual(s.object.cell,[32,32]);
        assert.deepEqual(s.alice.scale,[1,1]);assert.deepEqual(s.object.scale,[1,1]);
        assert.deepEqual(s.alice.root,[395.5,300]);assert.deepEqual(s.object.root,[445,300]);
        assert.equal(s.alice.texture,view);assert.equal(s.zoom,zoom);assert.equal(s.rendererAntialias,false);
        assert.ok(Object.values(s.textureFilters).every(v=>v===1));assert.equal(s.documentOverflow,false);
        assert.ok(Math.abs(s.cssCanvas.width/640-s.cssCanvas.height/360)<1e-6);
        for(let i=0;i<2;i++)assert.ok(Math.abs(s.rootRoundTrip[i]-s.alice.root[i])<1e-7);
        for(const button of await page.locator('button').all())assert.ok((await button.boundingBox()).height>=44);
        states.push(s);
        if(view==='side')await page.screenshot({path:path.join(output,`preview-${viewport.width}x${viewport.height}-${zoom===1?'scene':'detail'}.png`)});
      }
    }
    const drawAudit=await page.evaluate(()=>window.nativeDrawAudit);assert.ok(drawAudit.nearest>0);assert.equal(drawAudit.smoothed,0);
    assert.ok(requests.every(u=>u.startsWith('data:')||new URL(u).origin===new URL(base).origin));
    assert.ok(requests.every(u=>!u.includes('.artifacts')));
    await page.getByRole('link',{name:'Back to library'}).click();await page.waitForSelector('[data-save="the-first-path"]');
    result.preview.push({viewport,states,drawAudit,sameOrigin:true});await page.close();
  }
  // Reuse the existing project regression for library/search/saved/preferences/legacy URL.
  const {library}=await import('../../qa/checks/reading-and-resume.mjs');
  result.library=await library(browser,result);
  const catalog=await (await get(base+'/stories/catalog.json')).json();
  for(const viewport of [{width:390,height:844},{width:1280,height:720}]){
    for(const item of catalog.stories){
      const story=await (await get(base+item.manifest)).json();
      const chapter=story.chapters.find(c=>c.status==='available');assert.ok(chapter);
      const page=await browser.newPage({viewport});watch(page);
      await page.goto(`${base}/reader.html?story=${item.slug}&chapter=${chapter.id}&start=1`);
      await page.waitForFunction(()=>window.reader&&!document.querySelector('#start').disabled);
      await page.click('#start');await page.waitForFunction(()=>document.querySelector('#intro').hidden);
      assert.equal(await page.locator('#stage canvas').count(),1);
      assert.ok(await page.evaluate(()=>reader.story.steps.length>0));
      result.readers.push({slug:item.slug,chapter:chapter.id,viewport,started:true});await page.close();
    }
  }
  assert.deepEqual(result.errors,[]);assert.deepEqual(result.resources,[]);result.passed=true;
  console.log(JSON.stringify({passed:true,assets:result.assets.length,previewStates:12,readerStarts:result.readers.length,library:result.library,base},null,2));
}catch(error){result.passed=false;result.failure=error.stack;console.error(error);process.exitCode=1;}
finally{await browser?.close();await writeFile(path.join(output,'results.json'),JSON.stringify(result,null,2)+'\n');}
