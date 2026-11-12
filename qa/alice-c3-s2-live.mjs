import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {launch,watch} from './helpers/browser.mjs';
import {officialLayouts} from './official-layouts.mjs';
import {base} from './config.mjs';
const out=process.env.QA_OUTPUT_DIR||'.artifacts/qa/c3-s2/live';await fs.mkdir(out,{recursive:true});
const browser=await launch(),report={scope:'Actual Phaser clock, whole chapter at1x, six official viewports; no seeded elapsed/revealed or forced rendering',errors:[],resources:[],cases:[]};
try{
 // Bound browser load while retaining one real-time pass per official layout.
 for(let offset=0;offset<officialLayouts.length;offset+=3){
  const rows=await Promise.all(officialLayouts.slice(offset,offset+3).map(async layout=>{
   const context=await browser.newContext({viewport:{width:layout.width,height:layout.height}}),page=await context.newPage();watch(page,report);
   await context.addInitScript(()=>{localStorage.setItem('entrelineas:muted','true');localStorage.setItem('betweenlines:auto','true');});
   await page.goto(base+'/reader.html?story=alice-in-wonderland&chapter=chapter-3');await page.waitForFunction(()=>!document.querySelector('#start').disabled);
   await page.evaluate(()=>{
    window.qaLog={samples:[],transitions:[],visible:[],errors:[]};
    window.qaInterval=setInterval(()=>{
     const scene=Phaser.Display.Canvas.CanvasPool.pool.find(p=>p.parent?.scene?.getScene)?.parent.scene.scenes[0];if(!scene?.reader?.running)return;
     const e=scene.reader,s=e.step,panel=document.querySelector('#dialogue'),shown=getComputedStyle(panel).opacity==='1';
     const row={id:s.id,scene:s.sceneIndex,beat:s.s2Beat||s.c3Beat,t:e.elapsed,total:e.totalTime,wall:performance.now(),shown};
     if(qaLog.transitions.at(-1)?.id!==s.id)qaLog.transitions.push(row);
     if(shown){if(s.type!=='text'||document.querySelectorAll('#text .is-revealed').length!==Array.from(s.text).length||getComputedStyle(document.querySelector('#text-button')).opacity!=='1')qaLog.errors.push('Incomplete/grey visible card '+s.id);if(!qaLog.visible.includes(s.id))qaLog.visible.push(s.id);}
     if(s.type==='action'&&(shown||!document.querySelector('#text-button').disabled))qaLog.errors.push('Silent action has interactive caption '+s.id);
     if(!document.querySelector('#ending').hidden)qaLog.errors.push('Premature ending '+s.id);
     if(s.s2Beat===11||s.s2Beat===12){row.staging=structuredClone(scene.current);row.frame=structuredClone(scene.framing);}
     qaLog.samples.push(row);
    },100);
   });
   await page.click('#start');
   await page.waitForFunction(()=>{const sc=Phaser.Display.Canvas.CanvasPool.pool.find(p=>p.parent?.scene?.getScene)?.parent.scene.scenes[0];return sc?.reader.step?.id==='alice-c3-side-end'&&!sc.reader.running;},null,{timeout:205000,polling:100});
   const result=await page.evaluate(()=>{clearInterval(qaInterval);return qaLog;});
   assert.deepEqual(result.errors,[]);assert.equal(result.visible.length,19);
   const scene0=result.transitions.find(t=>t.scene===0),scene1=result.transitions.find(t=>t.scene===1),s2last=result.samples.at(-1);
   assert(Math.abs(scene1.total-scene0.total-75000)<350,'S1 real duration');assert(Math.abs(s2last.total-scene1.total-72000)<450,'S2 real duration');
   const wallSceneMs=[scene1.wall-scene0.wall,s2last.wall-scene1.wall];
   assert(wallSceneMs.every(t=>t>=55000&&t<=85000),'Actual unpaused wall-clock reading must stay within55–85s: '+wallSceneMs);
   assert.equal(result.transitions.length,26,'12 + 14 real beats');
   const pickup=result.samples.filter(s=>s.scene===1&&s.beat===11),exit=result.samples.filter(s=>s.scene===1&&s.beat===12);
   const muteWallMs=result.transitions.find(t=>t.scene===1&&t.beat===13).wall-result.transitions.find(t=>t.scene===1&&t.beat===11).wall;
   assert(muteWallMs<=8000,'Pickup and retreat must remain one silent sequence under8s');
   assert(pickup.length>=15&&exit.length>=25,'Actual intermediate action frames required');
   assert(pickup.every(s=>JSON.stringify(s.staging.root)==='[490,370]'));
   assert(exit.some(s=>s.staging.mask)&&exit.some(s=>!s.staging.mask));
   await page.screenshot({path:out+'/'+layout.name+'-end.png'});await context.close();console.log('PASS real1x full C3',layout.name);
   return{layout,...result,measuredSceneMs:[scene1.total-scene0.total,s2last.total-scene1.total],wallSceneMs,muteWallMs,pickupSamples:pickup.length,retreatSamples:exit.length};
  }));report.cases.push(...rows);await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.resources,[]);report.passed=true;
}finally{await browser.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}
