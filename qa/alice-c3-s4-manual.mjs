import fs from 'node:fs/promises';import assert from 'node:assert/strict';
import {launch,watch} from './helpers/browser.mjs';import {base} from './config.mjs';
const out=process.env.QA_OUTPUT_DIR||'.artifacts/qa/c3-s4/manual';await fs.mkdir(out,{recursive:true});const browser=await launch(),report={errors:[],resources:[],beats:[],scope:'Actual UI manual chronological C3-S1→S2→S3→S4 and real saved continuation'};
try{
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();watch(page,report);await context.addInitScript(()=>{localStorage.setItem('entrelineas:muted','true');localStorage.setItem('betweenlines:auto','false');});
 await page.goto(base+'/reader.html?story=alice-in-wonderland&chapter=chapter-3');await page.waitForFunction(()=>!document.querySelector('#start').disabled);await page.click('#start');await page.evaluate(()=>{window.qaScene=Phaser.Display.Canvas.CanvasPool.pool.find(p=>p.parent?.scene?.getScene).parent.scene.scenes[0];});
 let last='',swapPaused=false,growthPaused=false;const start=Date.now();
 while(Date.now()-start<180000){
  const s=await page.evaluate(()=>{const e=qaScene.reader;return{id:e.step.id,type:e.step.type,beat:e.step.s3Beat,elapsed:e.elapsed,ended:!e.running,shown:getComputedStyle(document.querySelector('#dialogue')).opacity==='1',disabled:document.querySelector('#text-button').disabled,endVisible:!document.querySelector('#ending').hidden};});
  if(s.ended){assert.equal(s.id,'alice-c3-branches-end');break;}assert(!s.endVisible,'Premature ending between scenes');if(s.id!==last){report.beats.push(s);last=s.id;}if(s.type==='action')assert(!s.shown);if(s.shown)assert(!s.disabled);
  if((s.beat===12&&s.elapsed>900&&!swapPaused)||(s.beat===15&&s.elapsed>3800&&!growthPaused)){
   await page.click('#quick-pause');const before=await page.evaluate(()=>JSON.stringify({t:qaScene.reader.elapsed,total:qaScene.reader.totalTime,s:qaScene.current,pixels:qaScene.trialLayer.toDataURL()}));await page.waitForTimeout(450);assert.equal(await page.evaluate(()=>JSON.stringify({t:qaScene.reader.elapsed,total:qaScene.reader.totalTime,s:qaScene.current,pixels:qaScene.trialLayer.toDataURL()})),before);await page.click('#quick-pause');if(s.beat===12)swapPaused=true;else growthPaused=true;
  }
  if(s.shown&&!s.disabled)await page.click('#text-button');await page.waitForTimeout(70);
 }
 assert.equal(report.beats.length,56);assert(swapPaused&&growthPaused);report.pocketPauseFrozen=true;report.growthPauseFrozen=true;
 report.saved=[];
 for(const beat of [10,13,16]){
  await page.evaluate(beat=>{const e=qaScene.reader;e.start('alice-c3-little-'+beat);e.paused=true;qaScene.draw();},beat);
  const before=await page.evaluate(()=>({id:qaScene.reader.step.id,trial:structuredClone(qaScene.reader.model.mushroomTrial),scale:qaScene.current.scale,held:qaScene.current.held}));
  await page.goto(base+'/reader.html?story=alice-in-wonderland&chapter=chapter-3&resume=1');await page.waitForFunction(()=>window.reader&&document.querySelector('#intro').hidden);
  const after=await page.evaluate(()=>{window.qaScene=Phaser.Display.Canvas.CanvasPool.pool.find(p=>p.parent?.scene?.getScene).parent.scene.scenes[0];qaScene.reader.paused=true;qaScene.draw();return{id:qaScene.reader.step.id,trial:structuredClone(qaScene.reader.model.mushroomTrial),scale:qaScene.current.scale,held:qaScene.current.held};});assert.deepEqual(after,before);report.saved.push(after);
 }
 for(const beat of [2,11,14,16]){
  await page.evaluate(beat=>{qaScene.reader.start('alice-c3-branches-'+String(beat).padStart(2,'0'));qaScene.reader.paused=true;qaScene.draw();},beat);
  const before=await page.evaluate(()=>({id:qaScene.reader.step.id,trial:structuredClone(qaScene.reader.model.mushroomTrial),state:structuredClone(qaScene.current)}));
  await page.goto(base+'/reader.html?story=alice-in-wonderland&chapter=chapter-3&resume=1');await page.waitForFunction(()=>window.reader&&document.querySelector('#intro').hidden);
  const after=await page.evaluate(()=>{window.qaScene=Phaser.Display.Canvas.CanvasPool.pool.find(p=>p.parent?.scene?.getScene).parent.scene.scenes[0];qaScene.reader.paused=true;qaScene.draw();return{id:qaScene.reader.step.id,trial:structuredClone(qaScene.reader.model.mushroomTrial),state:structuredClone(qaScene.current)};});
  // A saved paragraph resumes from its opening; compare stable geometry/inventory.
  for(const key of ['elapsed']){delete before.state[key];delete after.state[key];}
  assert.deepEqual(after,before);report.saved.push(after);
 }
 await page.screenshot({path:out+'/saved-final-growth.png'});await context.close();assert.deepEqual(report.errors,[]);assert.deepEqual(report.resources,[]);report.passed=true;
}finally{await browser.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}
console.log('PASS manual whole C3, paused swaps/growth, seven real saved checkpoints');
