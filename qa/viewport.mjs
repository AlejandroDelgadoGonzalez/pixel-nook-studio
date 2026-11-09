import {officialLayouts,officialSizes} from './official-layouts.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {base,output} from './config.mjs';
import {launch,watch,preparePassage} from './helpers/browser.mjs';
import {storyCases} from './helpers/story-cases.mjs';
import {snapshot} from './checks/viewport-coverage.mjs';

// Dedicated continuous-resize audit, in addition to the per-passage assertions
// in qa/run.mjs. --story=<slug> selects the corrected story; no filter audits all.
const representative=officialLayouts;
const usualOnly=process.argv.includes('--usual-layouts'),usual=l=>!usualOnly||(l.width>=360&&l.height>=600&&l.height/l.width<=2.6&&l.width/l.height<=2.4);
const swept=[];
const report={startedAt:new Date().toISOString(),scope:'Local Edge/Chromium simulated viewports; actual browser viewport resize, not physical phones or Safari',errors:[],resources:[],samples:[],representative,cases:[]};
const browser=await launch();await fs.mkdir(output,{recursive:true});
try{for(const item of await storyCases()){
 const context=await browser.newContext({viewport:representative[0]});
 await context.addInitScript(()=>{localStorage.setItem('entrelineas:muted','true');localStorage.setItem('betweenlines:auto','false');});
 const page=await context.newPage();watch(page,report);await page.goto(`${base}/reader.html?story=${item.slug}&chapter=${item.chapter.id}&start=1`);
 await page.waitForFunction(()=>window.reader&&!document.querySelector('#start').disabled);
 await page.evaluate(()=>{window.qaScene=Phaser.Display.Canvas.CanvasPool.pool.find(p=>p.parent?.scene?.getScene).parent.scene.scenes[0];qaScene.game.loop.stop();});
 const texts=item.story.steps.filter(s=>s.type==='text'),summary={story:item.slug,chapter:item.chapter.id,introSamples:0,readingSamples:0,minimumCaptionClearance:Infinity};
 async function size(layout){await page.setViewportSize({width:layout.width,height:layout.height});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.evaluate(()=>{qaScene.draw(0,true);qaScene.game.step(performance.now(),0);});}
 async function sample(layout,intro,id){const data=await snapshot(page,{intro});const row={story:item.slug,chapter:item.chapter.id,layout:layout.name,width:layout.width,height:layout.height,phase:intro?'intro':id,issues:data.issues,minimumCaptionClearance:Math.min(...data.bodies.map(b=>b.captionClearance))};report.samples.push(row);if(intro)summary.introSamples++;else{summary.readingSamples++;summary.minimumCaptionClearance=Math.min(summary.minimumCaptionClearance,row.minimumCaptionClearance);}if(data.issues.length){report.errors.push({...row,evidence:data});if(report.errors.length<=12)await page.screenshot({path:path.join(output,`viewport-failure-${item.slug}-${report.errors.length}.png`)});}return data;}
 for(const layout of [...representative,...swept].filter(usual)){await size(layout);await sample(layout,true);if(['wide','halfscreen-square','narrow-tall','phone-390'].includes(layout.name))await page.screenshot({path:path.join(output,`${item.slug}-${item.chapter.id}-intro-${layout.name}.png`)});}
 await page.click('#start');await page.evaluate(()=>{qaScene.reader.paused=true;});
 for(const layout of [...representative,...swept].filter(usual)){await size(layout);for(const s of texts){await preparePassage(page,s.id);await sample(layout,false,s.id);if(['wide','halfscreen-square','narrow-tall','phone-390','portrait-9x16'].includes(layout.name))await page.screenshot({path:path.join(output,`${item.slug}-${item.chapter.id}-${layout.name}-${s.id}.png`)});}}
 report.cases.push(summary);await context.close();await fs.writeFile(path.join(output,'viewport-report.json'),JSON.stringify(report,null,2));console.log('Viewport audited',item.slug,item.chapter.id,summary);
 }}catch(error){report.errors.push({message:error.message,stack:error.stack});}finally{await browser.close();report.passed=report.errors.length===0&&report.resources.length===0;report.finishedAt=new Date().toISOString();await fs.writeFile(path.join(output,'viewport-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,samples:report.samples.length,errors:report.errors.length,resources:report.resources.length}));if(!report.passed)process.exitCode=1;}
