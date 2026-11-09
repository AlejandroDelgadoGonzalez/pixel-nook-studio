import {officialLayouts,officialSizes} from './official-layouts.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {launch,watch}from './helpers/browser.mjs';
import {base}from './config.mjs';
import {storyCases}from './helpers/story-cases.mjs';
import {inspectViewport}from './checks/viewport-coverage.mjs';
const out=process.env.QA_OUTPUT_DIR||'.artifacts/qa/alice-in-wonderland/chapter-2-scene-1/viewport';await fs.mkdir(out,{recursive:true});
const usual=l=>l[0]>=360&&l[1]>=600&&l[1]/l[0]<=2.6&&l[0]/l[1]<=2.4;
const report={scope:'C2-S1 current full sweep; acceptance retains Alejandro usual-layout choice recorded in ui-layout-lock/gate-4-verdict.json. Extreme observations remain explicit, not certified. Simulated Edge/Chromium.',errors:[],resources:[],intro:[],cases:[]},browser=await launch();
const sizes=officialSizes;

try{const item=(await storyCases()).find(x=>x.slug==='alice-in-wonderland'&&x.chapter.number===2),context=await browser.newContext({viewport:{width:390,height:844}});await context.addInitScript(()=>{localStorage.setItem('entrelineas:muted','true');localStorage.setItem('betweenlines:auto','false');});const page=await context.newPage();watch(page,report);await page.goto(`${base}/reader.html?story=${item.slug}&chapter=${item.chapter.id}&start=1`);await page.waitForFunction(()=>window.reader&&!document.querySelector('#start').disabled);await page.evaluate(code=>{window.qaScene=Phaser.Display.Canvas.CanvasPool.pool.find(p=>p.parent?.scene?.getScene).parent.scene.scenes[0];qaScene.game.loop.stop();window.inspectC2Viewport=(0,eval)('('+code+')');},inspectViewport.toString());
 for(const [width,height]of sizes){await page.setViewportSize({width,height});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));const issues=await page.evaluate(()=>{qaScene.draw(0,true);qaScene.game.step(performance.now(),0);return inspectC2Viewport(qaScene,{intro:true}).issues;});report.intro.push({width,height,issues});}
 await page.click('#start');await page.evaluate(()=>qaScene.reader.paused=true);
 for(const [width,height]of sizes){await page.setViewportSize({width,height});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const data=await page.evaluate(()=>{const s=qaScene,e=s.reader,rows=[];for(const t of e.story.steps.filter(s=>s.type==='text')){e.start(t.id);e.paused=true;e.revealed=t.text.length;e.onChange('back');s.draw(0,true);s.game.step(performance.now(),0);const r=inspectC2Viewport(s);rows.push({id:t.id,issues:r.issues,minimumCaptionClearance:Math.min(...r.bodies.map(b=>b.captionClearance))});}return rows;});
  report.cases.push({width,height,passages:data.length,minimumCaptionClearance:Math.min(...data.map(r=>r.minimumCaptionClearance)),issues:data.filter(r=>r.issues.length)});
 }
 await context.close();report.totalObservedIssueCount=[...report.intro,...report.cases].reduce((n,c)=>n+c.issues.length,0);report.acceptedLayouts=report.cases.filter(c=>usual([c.width,c.height])).length;report.issueCount=[...report.intro,...report.cases].filter(c=>usual([c.width,c.height])).reduce((n,c)=>n+c.issues.length,0);report.excludedExtremeIssues=[...report.intro,...report.cases].filter(c=>!usual([c.width,c.height])&&c.issues.length);report.passed=!report.issueCount&&!report.errors.length&&!report.resources.length;
}finally{await browser.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}
assert(report.passed,JSON.stringify(report.cases.filter(c=>usual([c.width,c.height])&&c.issues.length).slice(0,2)));console.log(JSON.stringify({passed:true,layouts:report.cases.length,acceptedLayouts:report.acceptedLayouts,passages:report.cases.reduce((n,c)=>n+c.passages,0),acceptedIssues:report.issueCount,excludedExtremeCases:report.excludedExtremeIssues.length}));
