import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {launch,openCase} from './helpers/browser.mjs';
import {storyCases} from './helpers/story-cases.mjs';
import {officialLayouts} from './official-layouts.mjs';
import {snapshot} from './checks/viewport-coverage.mjs';
const out=process.env.QA_OUTPUT_DIR||'.artifacts/qa/c3-s1/aspect';await fs.mkdir(out,{recursive:true});
const browser=await launch(),report={errors:[],resources:[],cases:[]};
try{const all=await storyCases(),c2=all.find(c=>c.slug==='alice-in-wonderland'&&c.chapter.number===2),c3=all.find(c=>c.slug==='alice-in-wonderland'&&c.chapter.number===3);
 for(const layout of officialLayouts){

 const {page,context}=await openCase(browser,c3,layout,report);const initial=await page.evaluate(()=>{qaScene.reader.start();qaScene.reader.paused=true;qaScene.draw();return qaScene.framing;});
 const prior=await page.evaluate(()=>{qaScene.reader.start('alice-c3-who-05');qaScene.reader.paused=true;qaScene.draw();return qaScene.framing;});
 for(const k of ['x','y','z'])assert(Math.abs(prior[k]-initial[k])<.01,`${layout.name} fixed conversation frame ${k}`);
 const modes=[];
 for(const mode of ['portrait','landscape','auto']){
 await page.evaluate(()=>{qaScene.reader.start('alice-c3-who-05');qaScene.reader.paused=true;document.querySelector('#settings-modal').showModal();});
 const before=await page.evaluate(()=>JSON.stringify(qaScene.reader.model));
 await page.selectOption('#aspect-ratio',mode);await page.click('#close-settings');
 await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 await page.evaluate(()=>{qaScene.draw();qaScene.game.step(performance.now(),0);});
 assert.equal(await page.evaluate(()=>JSON.stringify(qaScene.reader.model)),before);
 const view=await snapshot(page);assert.deepEqual(view.issues,[]);modes.push({mode,view});
 }
 report.cases.push({layout,prior,initial,modes});await context.close();console.log('PASS seam / aspects',layout.name);
 }assert.deepEqual(report.errors,[]);assert.deepEqual(report.resources,[]);report.passed=true;
}finally{await browser.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}
