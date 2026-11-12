import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {launch,watch} from './helpers/browser.mjs';
import {base} from './config.mjs';
const out='.artifacts/qa/c3-s2/manual';await fs.mkdir(out,{recursive:true});
const browser=await launch(),report={errors:[],resources:[],beats:[],scope:'Actual manual UI from chapter opening to real terminal step; unmodified Phaser clock'};
try{
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();watch(page,report);
 await context.addInitScript(()=>{localStorage.setItem('entrelineas:muted','true');localStorage.setItem('betweenlines:auto','false');});
 await page.goto(base+'/reader.html?story=alice-in-wonderland&chapter=chapter-3');await page.waitForFunction(()=>!document.querySelector('#start').disabled);await page.click('#start');
 await page.evaluate(()=>{window.qaScene=Phaser.Display.Canvas.CanvasPool.pool.find(p=>p.parent?.scene?.getScene).parent.scene.scenes[0];});
 const started=Date.now();let last='',pausedPickup=false;
 while(Date.now()-started<180000){
  const state=await page.evaluate(()=>({id:qaScene.reader.step.id,type:qaScene.reader.step.type,beat:qaScene.reader.step.s2Beat,scene:qaScene.reader.step.sceneIndex,elapsed:qaScene.reader.elapsed,ended:!qaScene.reader.running,ready:getComputedStyle(document.querySelector('#dialogue')).opacity==='1'&&!document.querySelector('#text-button').disabled,endVisible:!document.querySelector('#ending').hidden,card:getComputedStyle(document.querySelector('#dialogue')).opacity}));
  if(state.ended){assert.equal(state.id,'alice-c3-side-end');break;}
  assert.equal(state.endVisible,false,'No ending between S1 and S2');
  if(state.id!==last){report.beats.push(state);last=state.id;}
  if(state.type==='action')assert.equal(state.card,'0');
  if(state.scene===1&&state.beat===11&&state.elapsed>1200&&!pausedPickup){
   await page.click('#quick-pause');const before=await page.evaluate(()=>({t:qaScene.reader.elapsed,total:qaScene.reader.totalTime,root:qaScene.current.root,pipe:qaScene.current.hookahBase,pixels:qaScene.actorLayer.toDataURL()}));
   await page.waitForTimeout(400);assert.deepEqual(await page.evaluate(()=>({t:qaScene.reader.elapsed,total:qaScene.reader.totalTime,root:qaScene.current.root,pipe:qaScene.current.hookahBase,pixels:qaScene.actorLayer.toDataURL()})),before);
   await page.click('#quick-pause');pausedPickup=true;report.pickupPauseFrozen=true;
  }
  if(state.type==='text'&&state.ready)await page.click('#text-button');
  await page.waitForTimeout(70);
 }
 assert.equal(await page.evaluate(()=>qaScene.reader.step.id),'alice-c3-side-end');assert.equal(report.beats.length,26);assert(pausedPickup);
 await page.screenshot({path:out+'/complete.png'});
 // Actual saved continuation into S2, with the original browser checkpoint path.
 await page.reload();await page.waitForFunction(()=>!document.querySelector('#start').disabled);await page.click('#start');
 await page.evaluate(()=>{window.qaScene=Phaser.Display.Canvas.CanvasPool.pool.find(p=>p.parent?.scene?.getScene).parent.scene.scenes[0];qaScene.reader.start('alice-c3-side-13');});
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('#dialogue')).opacity==='1');
 const checkpoint=await page.evaluate(()=>qaScene.reader.checkpoint());
 await page.goto(base+'/reader.html?story=alice-in-wonderland&chapter=chapter-3&resume=1');
 await page.waitForFunction(()=>window.reader&&document.querySelector('#intro').hidden);
 const resumed=await page.evaluate(()=>{const s=Phaser.Display.Canvas.CanvasPool.pool.find(p=>p.parent?.scene?.getScene).parent.scene.scenes[0];return {id:s.reader.step.id,root:s.current.alice,caterpillarHidden:s.current.mask};});
 assert.equal(resumed.id,checkpoint.line);assert.deepEqual(resumed.root,[535,615]);assert.equal(resumed.caterpillarHidden,true);report.savedContinuation=resumed;
 await context.close();assert.deepEqual(report.errors,[]);assert.deepEqual(report.resources,[]);report.passed=true;
}finally{await browser.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}
console.log('PASS actual manual chapter, pickup pause and saved S2 continuation');
