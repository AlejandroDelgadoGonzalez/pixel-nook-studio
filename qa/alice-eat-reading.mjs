import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {launch,openCase} from './helpers/browser.mjs';
import {storyCases} from './helpers/story-cases.mjs';
const out=process.env.QA_OUTPUT_DIR||'.artifacts/qa/alice-in-wonderland/eat-me/reading-normal';
await fs.mkdir(out,{recursive:true});const b=await launch(),report={errors:[],resources:[],clockMultiplier:1};
try{
 const item=(await storyCases()).find(x=>x.slug==='alice-in-wonderland');
 const {page,context}=await openCase(b,item,{width:390,height:844},report);
 await page.evaluate(()=>{
  const s=qaScene,e=s.reader,original=e.onChange;
  window.eatReadingTrace={started:performance.now(),steps:[],texts:[],camera:[],done:null};
  e.onChange=(...args)=>{original(...args);const q=window.eatReadingTrace,id=e.step?.id;
   if(q.steps.at(-1)?.id!==id){q.steps.push({id,time:performance.now()-q.started});if(e.step?.type==='text')q.texts.push(e.step.text);}
   if(!e.running&&e.step?.type==='end'&&!q.done)q.done={elapsed:performance.now()-q.started,totalTime:e.totalTime,final:structuredClone(e.model)};
  };
  e.sceneGate=false;e.setAuto(true);e.start('alice-c1-eat-inherit');e.paused=false;s.game.loop.start(s.game.step.bind(s.game));
 });
 for(let n=0;n<12;n++){await page.waitForTimeout(10000);const q=await page.evaluate(()=>({done:window.eatReadingTrace.done,step:qaScene.reader.step.id}));console.log('Automatic Reading:',q.step);if(q.done)break;}
 report.reading=await page.evaluate(()=>window.eatReadingTrace);
 assert(report.reading.done,'Normal-speed automatic reading did not finish');
 assert.equal(report.reading.texts.length,9);assert.equal(report.reading.steps.at(-1).id,'alice-c1-eat-end');
 assert(report.reading.done.elapsed>=55000&&report.reading.done.elapsed<=85000);
 assert.equal(report.reading.done.final.eat.face,'left');
 await page.screenshot({path:out+'/final-reader.png'});await context.close();report.passed=!report.errors.length&&!report.resources.length;
}finally{await b.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}
assert(report.passed);console.log('PASS normal-speed Automatic Reading');
