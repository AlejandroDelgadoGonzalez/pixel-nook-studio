import fs from 'node:fs/promises';import assert from 'node:assert/strict';
import {launch,watch} from './helpers/browser.mjs';import {officialLayouts} from './official-layouts.mjs';import {base} from './config.mjs';
const out='.artifacts/qa/c3-s3/live';await fs.mkdir(out,{recursive:true});const browser=await launch(),report={scope:'Unmodified Phaser1x: complete chronological C3 in first layout; full S3 in remaining five via actual scene selector; S1/S2 six-format regression separate',errors:[],resources:[],cases:[]};
try{
 for(const [i,layout]of officialLayouts.entries()){
  const context=await browser.newContext({viewport:{width:layout.width,height:layout.height}}),page=await context.newPage();watch(page,report);await context.addInitScript(()=>{localStorage.setItem('entrelineas:muted','true');localStorage.setItem('betweenlines:auto','true');});
  await page.goto(base+'/reader.html?story=alice-in-wonderland&chapter=chapter-3');await page.waitForFunction(()=>!document.querySelector('#start').disabled);
  if(i){await page.click('#show-controls');await page.selectOption('#episode-scene','2');}
  await page.evaluate(()=>{
   window.log={samples:[],transitions:[],errors:[],visible:[]};window.interval=setInterval(()=>{
    const scene=Phaser.Display.Canvas.CanvasPool.pool.find(p=>p.parent?.scene?.getScene)?.parent.scene.scenes[0],e=scene?.reader;if(!e?.running)return;const s=e.step,card=document.querySelector('#dialogue'),shown=getComputedStyle(card).opacity==='1',row={id:s.id,scene:s.sceneIndex,beat:s.s3Beat,total:e.totalTime,t:e.elapsed,wall:performance.now(),shown,frame:structuredClone(scene.framing)};
    if(log.transitions.at(-1)?.id!==s.id)log.transitions.push(row);
    if(shown&&(document.querySelector('#text-button').disabled||getComputedStyle(document.querySelector('#text-button')).cursor!=='pointer'||e.revealed!==s.text?.length||scene.cameraReframing))log.errors.push('Visible blocked/incomplete/moving card '+s.id);
    if(shown&&!log.visible.includes(s.id))log.visible.push(s.id);
    if(s.type==='action'&&(shown||!document.querySelector('#text-button').disabled))log.errors.push('Silent action interaction '+s.id);
    if(!document.querySelector('#ending').hidden)log.errors.push('Premature ending');
    if(s.s3Beat){const a=scene.current,b=a.aliceBounds,f=scene.framing;row.staging=structuredClone(a);if(Math.abs(a.uniformScale.x-a.uniformScale.y)>1e-8)log.errors.push('Scale deformation');if((b.top-f.y)*f.z+scene.scale.height/2<0)log.errors.push('Head clipped');if(a.beat>=8&&JSON.stringify(a.alice)!=='[500,615]')log.errors.push('Root drift');if(a.fragments.some(p=>Math.hypot(p.anchor[0]-a.hand[0],p.anchor[1]-a.hand[1])>.001))log.errors.push('Detached prop');}
    log.samples.push(row);
   },100);
  });
  if(i)await page.click('#jump-scene');else await page.click('#start');
  await page.waitForFunction(()=>{const s=Phaser.Display.Canvas.CanvasPool.pool.find(p=>p.parent?.scene?.getScene)?.parent.scene.scenes[0];return s?.reader.step?.id==='alice-c3-little-end'&&!s.reader.running;},null,{timeout:300000,polling:100});
  const result=await page.evaluate(()=>{clearInterval(interval);return log;});assert.deepEqual(result.errors,[]);assert.equal(result.transitions.length,i?17:40);assert.equal(result.visible.filter(id=>id.startsWith('alice-c3-little-')).length,9);
  const scene3=result.samples.filter(s=>s.scene===2),first=scene3[0],last=scene3.at(-1),engineMs=last.total-first.total,wallMs=last.wall-first.wall;
  assert(engineMs>=76500&&engineMs<=77500);assert(wallMs>=55000&&wallMs<=85000,'S3 actual1x duration '+wallMs);assert.equal(new Set(scene3.map(s=>JSON.stringify([s.frame.x,s.frame.y,s.frame.z]))).size,1);
  assert(scene3.filter(s=>[9,12,15].includes(s.beat)).length>100);
  await page.screenshot({path:out+'/'+layout.name+'-end.png'});report.cases.push({layout,fullChapter:i===0,engineMs,wallMs,...result});await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));await context.close();console.log('PASS real1x C3-S3',layout.name,Math.round(wallMs)+'ms');
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.resources,[]);report.passed=true;
}finally{await browser.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}
