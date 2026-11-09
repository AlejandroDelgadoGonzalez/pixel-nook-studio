import {officialLayouts,officialSizes} from './official-layouts.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {launch,openCase,preparePassage} from './helpers/browser.mjs';
import {storyCases} from './helpers/story-cases.mjs';
const out=process.env.QA_OUTPUT_DIR||'.artifacts/qa/alice-in-wonderland/ui-layout-lock/ui';
await fs.mkdir(out,{recursive:true});const b=await launch(),report={errors:[],resources:[],layouts:[],scope:'User selected usual viewports; original panorama retained. UI metrics compared with original Scene1.'};
try{
 const item=(await storyCases()).find(x=>x.slug==='alice-in-wonderland'),{page,context}=await openCase(b,item,{width:390,height:844},report);
 for(const [width,height]of officialSizes){
  await page.setViewportSize({width,height});await preparePassage(page,item.story.steps.find(x=>x.type==='text').id);
  const row=await page.evaluate(()=>{
   const s=qaScene,e=s.reader,issues=[],cameraStates=new Set(),rect=()=>{
    const d=document.querySelector('#dialogue'),r=d.getBoundingClientRect(),c=getComputedStyle(d),t=getComputedStyle(document.querySelector('#text'));
    return{x:r.x,y:r.y,width:r.width,height:r.height,padding:c.padding,fontSize:t.fontSize,lineHeight:t.lineHeight};
   },reference=rect();let samples=0;e.sceneGate=false;
   if(Math.abs(reference.x+reference.width/2-innerWidth/2)>.5||reference.y+reference.height/2<innerHeight/2)issues.push({kind:'reference-not-bottom-centred',reference});
   const expectedWidth=innerWidth<=700?innerWidth-28:Math.min(760,innerWidth-40),expectedBottom=innerHeight*(innerWidth<=700?.08:.09),expectedFont=innerWidth<=700?18:Math.max(18,Math.min(22,innerWidth*.0165));
   if(Math.abs(reference.width-expectedWidth)>.5||Math.abs(innerHeight-reference.y-reference.height-expectedBottom)>1||Math.abs(parseFloat(reference.fontSize)-expectedFont)>.1)issues.push({kind:'original-ui-dimensions-changed',reference,expectedWidth,expectedBottom,expectedFont});
   const draw=()=>{e.paused=true;e.onChange('back');s.draw(0,true);s.game.step(performance.now(),0);};
   e.start('alice-c1-hall-hook-bottle');e.paused=false;e.tick(e.step.duration*.999999);draw();const fromS3=JSON.stringify([s.framing.x,s.framing.y,s.framing.z]);
   for(const step of e.story.steps.filter(x=>[3,4].includes(x.sceneIndex)&&x.type!=='end'))for(const fraction of step.type==='action'?[0,.5,.999999]:[0]){
    e.start(step.id);e.paused=false;if(step.type==='action')e.tick(step.duration*fraction);else e.revealed=step.text.length;draw();
    const now=rect();if(JSON.stringify(now)!==JSON.stringify(reference))issues.push({kind:'ui-layout-changed',id:step.id,fraction,reference,now});
    const camera=JSON.stringify([s.framing.x,s.framing.y,s.framing.z]);cameraStates.add(camera);if(camera!==fromS3)issues.push({kind:'room-camera-not-inherited',id:step.id});
    samples++;
   }
   return{reference,samples,issues,cameraStates:cameraStates.size};
  });report.layouts.push({width,height,...row});console.log(JSON.stringify({width,height,samples:row.samples,issues:row.issues.slice(0,2)}));
  if(width===1366&&height===641||width===390&&height===844)for(const id of ['alice-c1-drink-warning','alice-c1-eat-tears']){
   await preparePassage(page,id);await page.evaluate(()=>{qaScene.draw(0,true);qaScene.game.step(performance.now(),0);});await page.screenshot({path:out+'/'+width+'x'+height+'-'+id+'.png'});
  }
 }
 await context.close();report.passed=!report.errors.length&&!report.resources.length&&report.layouts.every(x=>!x.issues.length&&x.cameraStates===1);
}finally{await b.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}
assert(report.passed);console.log('PASS original lower centred UI in every S4/S5 beat; same final S3 room camera');
