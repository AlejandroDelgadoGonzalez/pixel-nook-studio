import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {launch,watch} from './helpers/browser.mjs';
import {base} from './config.mjs';
import {storyCases} from './helpers/story-cases.mjs';
import {officialLayouts} from './official-layouts.mjs';
const out=process.env.QA_OUTPUT_DIR||'.artifacts/qa/c3-s1/text-position/live-text';await fs.mkdir(out,{recursive:true});
const browser=await launch(),report={errors:[],resources:[],cases:[],scope:'Actual Phaser loop updates DOM. Never seed revealed, paint, draw or invoke onTick to make assertions pass.'};
try{const item=(await storyCases()).find(c=>c.slug==='alice-in-wonderland'&&c.chapter.number===3);
 for(const layout of officialLayouts.filter(l=>!process.env.QA_LAYOUT||l.name===process.env.QA_LAYOUT)){
 const context=await browser.newContext({viewport:{width:layout.width,height:layout.height}}),page=await context.newPage();watch(page,report);
 await context.addInitScript(()=>{localStorage.setItem('entrelineas:muted','true');localStorage.setItem('betweenlines:auto','false');});
 if(process.env.QA_BEFORE)await page.route('**/renderers/who-are-you.js',route=>route.fulfill({path:'.artifacts/backups/c3-s1-text-position-20261111/who-are-you.js',contentType:'text/javascript'}));
 await page.goto(base+'/reader.html?story=alice-in-wonderland&chapter=chapter-3');await page.waitForFunction(()=>!document.querySelector('#start').disabled);await page.click('#start');
 await page.evaluate(()=>{window.qaScene=Phaser.Display.Canvas.CanvasPool.pool.find(p=>p.parent?.scene?.getScene).parent.scene.scenes[0];qaScene.reader.setAuto(false);});
 const rows=[];
 for(const step of item.story.steps.filter(s=>s.sceneIndex===0&&s.type==='text')){
  await page.evaluate(id=>{qaScene.reader.start(id);qaScene.reader.paused=false;},step.id);
  await page.waitForFunction(()=>document.querySelectorAll('#text .is-revealed').length>=3,null,{timeout:2000});
  const partial=await page.evaluate(()=>({shown:qaScene.reader.revealed,visible:document.querySelectorAll('#text .is-revealed').length,length:qaScene.reader.step.text.length,text:document.querySelector('#text').textContent}));
  assert(partial.visible>0&&partial.shown>0&&partial.text===step.text);
  if(item.story.captionPresentation==='ready-complete')await page.waitForFunction(()=>getComputedStyle(document.querySelector('#dialogue')).opacity==='1'&&!document.querySelector('#text-button').disabled,null,{timeout:10000});
  else await page.click('#text-button');
  await page.waitForFunction(()=>document.querySelectorAll('#text .is-revealed').length===Array.from(qaScene.reader.step.text).length);
  const before=await page.evaluate(()=>qaScene.reader.step.id);
  await page.click('#quick-pause');
  const frozen=await page.evaluate(()=>({elapsed:qaScene.reader.elapsed,visible:document.querySelectorAll('#text .is-revealed').length}));
  await page.waitForTimeout(150);
  assert.deepEqual(await page.evaluate(()=>({elapsed:qaScene.reader.elapsed,visible:document.querySelectorAll('#text .is-revealed').length})),frozen);
  rows.push({id:before,partial,pauseStable:true});
 }
 await page.screenshot({path:out+'/'+layout.name+'.png'});
 let automatic;
 if(layout.name==='phone-390'&&!process.env.QA_SKIP_AUTO){
  await page.evaluate(()=>{window.qaVisibleLines=[];window.qaTextWatch=setInterval(()=>{const s=qaScene.reader.step;if(s?.type==='text'&&getComputedStyle(document.querySelector('#dialogue')).opacity==='1'&&document.querySelectorAll('#text .is-revealed').length>0&&document.querySelector('#text').textContent===s.text&&!qaVisibleLines.includes(s.id))qaVisibleLines.push(s.id);},25);qaScene.reader.setAuto(true);qaScene.reader.start();});
  await page.waitForFunction(()=>!qaScene.reader.running||qaScene.reader.step.sceneIndex>0,null,{timeout:90000,polling:100});
  automatic=await page.evaluate(()=>{clearInterval(qaTextWatch);return{visibleLines:qaVisibleLines,elapsedMs:qaScene.reader.totalTime};});
  assert.equal(automatic.visibleLines.length,9);assert(automatic.elapsedMs>=55000&&automatic.elapsedMs<=85000);
 }
 report.cases.push({layout,rows,automatic});await context.close();console.log('PASS live DOM reveal',layout.name);
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.resources,[]);report.passed=true;
}finally{await browser.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}
