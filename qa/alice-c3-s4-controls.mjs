import fs from 'node:fs/promises';import assert from 'node:assert/strict';
import {launch,watch} from './helpers/browser.mjs';import {base} from './config.mjs';
const out=process.env.QA_OUTPUT_DIR||'.artifacts/qa/c3-s4/controls';await fs.mkdir(out,{recursive:true});
const browser=await launch(),report={errors:[],resources:[],actions:[]};
try{
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();watch(page,report);
 await context.addInitScript(()=>{localStorage.setItem('entrelineas:muted','true');localStorage.setItem('betweenlines:auto','false');});
 await page.goto(base+'/reader.html?story=alice-in-wonderland&chapter=chapter-3');await page.waitForFunction(()=>!document.querySelector('#start').disabled);await page.click('#start');
 await page.evaluate(()=>{window.qaScene=Phaser.Display.Canvas.CanvasPool.pool.find(p=>p.parent?.scene?.getScene).parent.scene.scenes[0];});
 const snapshot=()=>page.evaluate(()=>{
  const state=structuredClone(qaScene.current);for(const k of ['x','y'])state.uniformScale[k]=Math.round(state.uniformScale[k]*1e6)/1e6;
  const pixels=qaScene.surface.context.getImageData(0,0,1664,936).data;let hash=2166136261;for(const n of pixels)hash=Math.imul(hash^n,16777619);
  return{elapsed:qaScene.reader.elapsed,model:structuredClone(qaScene.reader.model),state,rgbaHash:hash>>>0};
 });
 for(const [beat,seed]of [[1,600],[10,2800],[13,1500],[15,1200]]){
  await page.evaluate(([b,t])=>{const e=qaScene.reader;e.start('alice-c3-branches-'+String(b).padStart(2,'0'));e.setAuto(false);e.tick(t);},[beat,seed]);
  await page.waitForTimeout(240);await page.click('#quick-pause');
  assert(await page.evaluate(()=>qaScene.reader.paused));
  const before=await snapshot();assert(before.elapsed>seed,'Unmodified game clock must run before pause');await page.waitForTimeout(400);assert.deepEqual(await snapshot(),before,'Actual pause must freeze pixels, camera state, body and inventory');
  for(const mode of ['portrait','landscape','auto']){await page.click('#show-controls');await page.selectOption('#aspect-ratio',mode);await page.click('#close-settings');assert.deepEqual(await snapshot(),before,'Aspect change altered paused world/action');}
  const stopped=await page.evaluate(()=>qaScene.reader.elapsed);await page.click('#quick-pause');await page.waitForTimeout(240);assert((await page.evaluate(()=>qaScene.reader.elapsed))>stopped,'Resume must progress');
  await page.click('#quick-pause');report.actions.push({beat,pausePixelsFrozen:true,aspectModes:['portrait','landscape','auto'],resumeProgresses:true});
 }
 await context.close();assert.deepEqual(report.errors,[]);assert.deepEqual(report.resources,[]);report.passed=true;
}finally{await browser.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}
console.log('PASS real UI pause/resume and aspect round trips during flight, shrink, occlusion and canonical walk');
