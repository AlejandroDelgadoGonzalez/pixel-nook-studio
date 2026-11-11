import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {launch,openCase} from './helpers/browser.mjs';
import {storyCases} from './helpers/story-cases.mjs';
import {officialLayouts} from './official-layouts.mjs';
import {snapshot} from './checks/viewport-coverage.mjs';
const out='.artifacts/qa/c3-s1/targeted';await fs.mkdir(out,{recursive:true});
const browser=await launch(),report={errors:[],resources:[],cases:[]};
try{const item=(await storyCases()).find(c=>c.slug==='alice-in-wonderland'&&c.chapter.number===3);
 for(const layout of officialLayouts){const {page,context}=await openCase(browser,item,layout,report);
 const result=await page.evaluate(()=>{const e=qaScene.reader;let count=0;const signatures=[];
 for(const step of e.story.steps.filter(s=>s.type!=='end')){e.start(step.id);e.paused=false;
 for(let t=0;t<(step.duration||step.readingDurationMs);t+=100){e.elapsed=t;qaScene.draw();const s=qaScene.current;
 if(step.c3Beat===1&&Math.abs(s.alice[0]-535)>1e-6)throw Error('Nonstraight Alice step');
 if(step.c3Beat>=3){if(JSON.stringify(s.alice)!=='[535,615]')throw Error('Revised Alice anchor');if(JSON.stringify(s.root)!=='[490,370]'||JSON.stringify(s.hookahBase)!=='[525.6,369.6]')throw Error('Root drift');signatures.push(JSON.stringify(qaScene.framing));}
 if(step.type==='action'){if(e.advance(performance.now()+10000))throw Error('Action tap advanced');}
 if(step.c3Beat===2&&t<6000){e.revealed=step.text.length;if(e.advance(performance.now()+10000))throw Error('Ascent tap advanced');}
 count++;}
 }
 if(new Set(signatures).size!==1)throw Error('Conversation camera drift');
 e.start();e.setAuto(true);e.paused=false;let guard=0;while(e.running&&guard++<90000)e.tick(1);
 if(e.totalTime<55000||e.totalTime>85000)throw Error('Duration '+e.totalTime);
 const automaticMs=e.totalTime;e.start('alice-c3-who-05');e.paused=true;qaScene.draw();return{samples:count,automaticMs,elapsedAutomatic:guard};});
 await page.evaluate(()=>{document.querySelector('#ending').hidden=true;qaScene.game.step(performance.now(),0);});
 const viewport=await snapshot(page);assert.deepEqual(viewport.issues,[]);
 await page.screenshot({path:`${out}/${layout.name}.png`});report.cases.push({layout,...result,viewport});
 await context.close();console.log('PASS C3-S1',layout.name);
 }assert.deepEqual(report.errors,[]);assert.deepEqual(report.resources,[]);report.passed=true;
}finally{await browser.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}
