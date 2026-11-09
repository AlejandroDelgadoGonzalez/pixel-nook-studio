import * as textIntegrity from './checks/text-integrity.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {output,layouts,base} from './config.mjs';
import {storyCases} from './helpers/story-cases.mjs';
import {launch,openCase,preparePassage} from './helpers/browser.mjs';
import * as contract from './checks/story-contract.mjs';
import * as assets from './checks/asset-references.mjs';
import * as reading from './checks/reading-and-resume.mjs';
import * as text from './checks/text-reveal.mjs';
import * as motion from './checks/staging-and-motion.mjs';
import * as depthMotion from './checks/depth-and-simultaneity.mjs';
import * as camera from './checks/camera-and-orientation.mjs';
import * as viewport from './checks/viewport-coverage.mjs';
import * as art from './checks/character-art.mjs';
import * as density from './checks/pixel-density.mjs';
import * as characterMaster from './checks/character-master.mjs';
import * as completion from './checks/completion-controls.mjs';
import * as handoff from './checks/sequential-scene-handoff.mjs';
import * as stateInheritance from './checks/state-inheritance.mjs';
import * as video from './checks/video-export.mjs';
import * as duration from './checks/scene-duration.mjs';
import * as speed from './checks/locomotion-speed.mjs';
await fs.mkdir(output,{recursive:true});
const report={startedAt:new Date().toISOString(),base,scope:'Local Edge/Chromium simulated viewports; no physical phone or Safari claim',errors:[],resources:[],checks:{},cases:[]};
let browser;
async function save(){await fs.writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2));}
try{
 const cases=(await storyCases()).filter(c=>!process.env.QA_CASE_FILTER||`${c.slug}/${c.chapter.id}`===process.env.QA_CASE_FILTER);report.checks.sourceText=await textIntegrity.sourceFiles(cases);
 if(!process.argv.includes('--browser-only')){
report.checks.contract=await contract.check(cases);report.checks.assets=await assets.check();report.checks.pixelDensity=await density.check(cases);report.checks.exportSequences=video.sequences(cases);report.checks.sceneDuration=duration.check(cases);report.checks.locomotionSpeed=speed.check(cases);console.log('PASS static contracts, assets, golden-master density, export sequences and scene duration');
 report.checks.characterMasters=await characterMaster.check(cases);
 report.checks.stateInheritance=await stateInheritance.check(cases);
 }else report.checks.static={skipped:true,reason:'Browser-only run; use separate completed static gate evidence. This report alone is not full QA.'};
 browser=await launch();report.checks.library=await reading.library(browser,report);console.log('PASS library, preferences and legacy slug');
 for(const item of cases){for(const layout of layouts){const row={story:item.slug,chapter:item.chapter.id,layout:layout.name};const {context,page,introViewport}=await openCase(browser,item,layout,report);try{row.introViewport=introViewport;row.text=await text.check(page);row.camera=await camera.check(page);if(item.manifest.stageGeometry&&layout.name==='desktop')row.viewportResize=await viewport.responsive(page);if(['phone-390','desktop'].includes(layout.name)){row.motion=await motion.check(page);row.depthMotion=await depthMotion.check(page);await preparePassage(page,item.story.steps.find(s=>s.type==='text').id);row.rotation=await camera.rotation(page);}row.art=await art.check(page);await preparePassage(page,item.story.steps.find(s=>s.type==='text').id);if(layout.name==='phone-390'||layout.name==='desktop')await page.screenshot({path:path.join(output,`${item.slug}-${item.chapter.id}-${layout.name}.png`)});row.handoff=await handoff.check(page);row.completion=await completion.check(page);if(layout.name==='phone-390'){row.reading=await reading.check(page,item);row.exports=await video.previews(page,item);if(item.chapter.number===1)row.recording=item.story.sceneDurationPolicy?.measurement==='automatic-only'?{skipped:true,reason:'Automatic-only acceptance; authorized revisions may exceed85s. Technical MP4 checks are separate; never re-export to tune duration.'}:await video.recording(page,item);}report.cases.push(row);console.log('PASS',item.slug,item.chapter.id,layout.name);}catch(error){report.errors.push({story:item.slug,chapter:item.chapter.id,layout:layout.name,message:error.message,stack:error.stack});await page.screenshot({path:path.join(output,`failure-${item.slug}-${item.chapter.id}-${layout.name}.png`)});if(!process.argv.includes('--continue-on-error'))throw error;console.log('FAIL',item.slug,item.chapter.id,layout.name,error.message.split('\n')[0]);}finally{await context.close();await save();}}
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.resources,[]);report.passed=true;console.log(process.argv.includes('--browser-only')?'PASS browser QA:':'PASS all QA:',report.cases.length,'chapter/layout combinations, 0 errors, 0 missing resources');
}catch(error){report.passed=false;if(!report.errors.some(e=>e.message===error.message))report.errors.push({message:error.message,stack:error.stack});console.error(error);process.exitCode=1;}finally{await browser?.close();report.finishedAt=new Date().toISOString();await save();}
