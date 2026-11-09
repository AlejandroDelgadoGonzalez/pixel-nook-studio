import {officialLayouts,officialSizes} from './official-layouts.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {launch,openCase} from './helpers/browser.mjs';
import {storyCases} from './helpers/story-cases.mjs';
const out=process.env.QA_OUTPUT_DIR||'.artifacts/qa/alice-in-wonderland/eat-me/boundary';
await fs.mkdir(out,{recursive:true});
const browser=await launch(),report={errors:[],resources:[],cases:[]};
try {
 const item=(await storyCases()).find(x=>x.slug==='alice-in-wonderland');
 const {page,context}=await openCase(browser,item,{width:390,height:844},report);
 for(const [width,height] of officialSizes) {
  await page.setViewportSize({width,height});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const row=await page.evaluate(()=>{
   const s=qaScene,e=s.reader;
   const draw=()=>{e.paused=true;e.onChange('back');s.draw();s.game.step(performance.now(),0);return new Uint8ClampedArray(s.game.canvas.getContext('2d').getImageData(0,0,s.scale.width,s.scale.height).data);};
   e.start('alice-c1-drink-hook-hold');e.paused=false;e.tick(e.step.duration*.99999999);
   const before=draw(),beforeAlice=structuredClone(e.model.actors.alice),beforeCamera={...s.framing};
   e.start('alice-c1-eat-inherit');const after=draw();let changed=0;
   for(let i=0;i<before.length;i+=4)if(before[i]!==after[i]||before[i+1]!==after[i+1]||before[i+2]!==after[i+2]||before[i+3]!==after[i+3])changed++;
   return{changed,beforeAlice,afterAlice:e.model.actors.alice,beforeCamera,afterCamera:s.framing};
  });
  assert.equal(row.changed,0);assert.deepEqual(row.beforeAlice,row.afterAlice);assert.deepEqual(row.beforeCamera,row.afterCamera);
  report.cases.push({width,height,...row});
 }
 report.ending=await page.evaluate(()=>{const s=qaScene;s.reader.start('alice-c1-eat-end');s.draw(0,true);s.game.step(performance.now(),0);return document.querySelector('#ending h2').textContent;});
 assert.equal(report.ending,'Scenes 1–5 complete. Chapter 1 continues in preparation.');
 await page.screenshot({path:out+'/final-ending.png'});
 await context.close();report.passed=!report.errors.length&&!report.resources.length;
} finally {await browser.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}
assert(report.passed);console.log('PASS pixel-identical S4/S5 boundary in five layouts');
