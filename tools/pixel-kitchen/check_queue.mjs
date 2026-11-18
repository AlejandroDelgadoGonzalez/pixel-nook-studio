import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const base=process.argv[2]||'http://127.0.0.1:8872';
const output=resolve('.artifacts/pixel-kitchen-chef',process.argv[3]||'current-queue');
const url=base+'/app/pixel-kitchen-preview/';
await mkdir(output,{recursive:true});
const queue=await (await fetch(url+'queue/queue.json')).json();
const ready=queue.tasks.filter(t=>t.status==='complete'&&t.adoptedFinal);
assert.ok(ready.length);
const browser=await chromium.launch({channel:'chrome',headless:true});
const errors=[];
try{
 for(const viewport of [{width:390,height:844},{width:1280,height:720}]){
  const phone=viewport.width<769;
  const page=await browser.newPage({viewport,hasTouch:true});
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('response',r=>{if(r.status()>=400)errors.push(r.url()+': '+r.status());});
  await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('denied for test');}}}));
  await page.goto(url);
  await page.waitForFunction(()=>document.querySelector('#task-select').options.length>0);
  if(phone)await page.click('#tools-toggle');
  for(const t of ready){
   const pin=t.bases.final;
   const bytes=Buffer.from(await (await fetch(url+'queue/'+pin.url)).arrayBuffer());
   assert.equal(createHash('sha256').update(bytes).digest('hex'),pin.sha256);
   await page.selectOption('#task-select',t.taskId);
   await page.waitForFunction(([w,h])=>{
    const canvas=document.querySelector('#pixel-editor');
    return canvas.width===w&&canvas.height===h&&document.querySelector('#base-select').value==='final'&&!document.querySelector('#copy-handoff').disabled;
   },pin.dimensions);
   const canvas=page.locator('#pixel-editor');
   const [w,h]=pin.dimensions,x=Math.floor(w/2),y=Math.floor(h/2);
   await page.locator('#paint-color').fill('#123456');
   if(phone)await page.click('#tools-toggle');
   await canvas.scrollIntoViewIfNeeded();
   const box=await canvas.boundingBox();
   const scroll=await page.evaluate(()=>[scrollX,scrollY]);
   await page.touchscreen.tap(box.x+(x+.5)*box.width/w,box.y+(y+.5)*box.height/h);
   assert.deepEqual(await page.evaluate(()=>[scrollX,scrollY]),scroll);
   if(phone)await page.click('#tools-toggle');
   await page.click('#undo');await page.click('#redo');
   await page.click('#copy-handoff');
   await page.waitForFunction(()=>document.querySelector('#handoff').value.length>0);
   const handoff=JSON.parse(await page.locator('#handoff').inputValue());
   assert.equal(handoff.editedFrom,'final');
   assert.equal(handoff.baseRevision,pin.revision);
   assert.equal(handoff.baseSha256,pin.sha256);
   assert.deepEqual(handoff.expectedCurrent,t.expectedCurrent);
   assert.deepEqual(handoff.changes,[{x,y,hex:'#123456FF'}]);
   assert.match(await page.locator('#handoff-message').textContent(),/Clipboard unavailable/);
   const download=page.waitForEvent('download');
   await page.click('#download-handoff');
   assert.ok((await download).suggestedFilename().endsWith('.json'));
   if(phone)await page.click('#close-handoff');
   await page.click('#undo');
  }
  await page.close();
 }
 assert.deepEqual(errors,[]);
 const report={passed:true,base,tasks:ready.map(t=>t.taskId),errors};
 await writeFile(resolve(output,'results.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report));
}finally{await browser.close();}
