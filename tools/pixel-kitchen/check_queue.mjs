/* Static touch-editor QA; browser actions cannot write to the PC. */
import {chromium} from 'playwright';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const base=process.argv[2]||'http://127.0.0.1:8872';
const output=path.resolve('.artifacts/pixel-kitchen-chef',process.argv[3]||'dist');await mkdir(output,{recursive:true});
const report={base,viewports:[],errors:[],scope:'emulated mobile/desktop, not physical phone'};
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 for(const viewport of [{width:390,height:844},{width:1280,height:720}]){
 const page=await browser.newPage({viewport,hasTouch:true});page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)report.errors.push(r.url()+':'+r.status());});
 await page.addInitScript(()=>{Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('denied for fallback test');}}});});
 await page.goto(base+'/app/pixel-kitchen-preview/');await page.waitForFunction(()=>!document.querySelector('#copy-handoff').disabled);
 assert.equal(await page.locator('#task-select option').count(),2);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.screenshot({path:path.join(output,`queue-${viewport.width}x${viewport.height}.png`),fullPage:true});
 for(const button of await page.locator('#kitchen button').all())assert.ok((await button.boundingBox()).height>=44);
 await page.locator('#paint-color').fill('#c6b496');
 const c=page.locator('#pixel-editor');await c.scrollIntoViewIfNeeded();let r=await c.boundingBox();
 const before=await page.evaluate(()=>({x:scrollX,y:scrollY,top:document.querySelector('#editor-scroll').scrollTop}));
 await page.touchscreen.tap(r.x+31.5*r.width/64,r.y+37.5*r.height/64);
 const after=await page.evaluate(()=>({x:scrollX,y:scrollY,top:document.querySelector('#editor-scroll').scrollTop}));assert.deepEqual(after,before);
 await page.click('#undo');await page.click('#redo');await page.click('#copy-handoff');
 await page.waitForFunction(()=>document.querySelector('#handoff').value.length>20);
 const h=JSON.parse(await page.locator('#handoff').inputValue());assert.equal(h.changes.length,1);assert.deepEqual(h.changes[0],{x:31,y:37,hex:'#C6B496FF'});assert.equal(h.editedFrom,'chef');
 assert.match(await page.locator('#queue-status').textContent(),/Clipboard unavailable/);
 await writeFile(path.join(output,`handoff-${viewport.width}.json`),JSON.stringify(h,null,2));
 const download=page.waitForEvent('download');await page.click('#download-handoff');assert.ok((await download).suggestedFilename().endsWith('.json'));
 await page.click('[data-tool=pan]');await page.locator('#pixel-zoom').fill('12');await page.locator('#pixel-zoom').dispatchEvent('input');
 const sc=page.locator('#editor-scroll');await sc.scrollIntoViewIfNeeded();const box=await sc.boundingBox();
 await page.mouse.move(box.x+100,box.y+100);await page.mouse.down();await page.mouse.move(box.x+50,box.y+50,{steps:4});await page.mouse.up();
 assert.ok(await sc.evaluate(el=>el.scrollLeft>0&&el.scrollTop>0));
 await page.locator('#pixel-zoom').fill('2');await page.locator('#pixel-zoom').dispatchEvent('input');
 page.on('dialog',d=>d.accept());await page.selectOption('#base-select','cook');await page.waitForFunction(()=>document.querySelector('#native-size').textContent.startsWith('Pure Cook'));
 await page.click('#copy-handoff');await page.waitForFunction(()=>{try{return JSON.parse(document.querySelector('#handoff').value).editedFrom==='cook';}catch{return false;}});
 assert.deepEqual(JSON.parse(await page.locator('#handoff').inputValue()).changes,[]);
 await page.selectOption('#task-select','drink-me-v1');await page.waitForFunction(()=>document.querySelector('#pixel-editor').width===32);assert.equal(await page.locator('#copy-handoff').isDisabled(),true);
 report.viewports.push({viewport,touchPixel:true,undoRedo:true,noScrollJump:true,clipboardFallback:true,jsonDownload:true,directCook:true,waitingObject32:true});await page.close();
 }
 const q=await (await fetch(base+'/app/pixel-kitchen-preview/queue/queue.json')).json();
 for(const t of q.tasks){for(const pin of [t.original,...Object.values(t.bases)]){const r=await fetch(base+'/app/pixel-kitchen-preview/queue/'+(pin.url));assert.equal(r.status,200);assert.equal(createHash('sha256').update(Buffer.from(await r.arrayBuffer())).digest('hex'),pin.sha256);}}
 assert.deepEqual(report.errors,[]);report.passed=true;
}finally{await browser.close();await writeFile(path.join(output,'results.json'),JSON.stringify(report,null,2));}
console.log(JSON.stringify(report,null,2));
