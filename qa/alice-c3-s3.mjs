import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {launch,openCase} from './helpers/browser.mjs';
import {storyCases} from './helpers/story-cases.mjs';
import {officialLayouts} from './official-layouts.mjs';
const out=process.env.QA_OUTPUT_DIR||'.artifacts/qa/c3-s3/staging';await fs.mkdir(out,{recursive:true});
const browser=await launch(),report={scope:'Phaser sampled staging, exact hand/root/scene seam and aspect/reconstruction; live1x and MP4 separate',errors:[],resources:[],cases:[]};
try{
 const item=(await storyCases()).find(c=>c.slug==='alice-in-wonderland'&&c.chapter.number===3);
 for(const layout of officialLayouts){
  const {page,context}=await openCase(browser,item,layout,report);
  const result=await page.evaluate(()=>{
   const e=qaScene.reader;e.setAuto(false);let count=0,minGap=Infinity,minTop=Infinity;const frames=[],actionFrames=[];
   function sample(id,t=0){e.start(id);e.paused=false;if(t)e.tick(t);e.paused=true;e.onChange('back');qaScene.draw();qaScene.game.step(performance.now(),0);return structuredClone(qaScene.current);}
   sample('alice-c3-side-13');const seamFrame=JSON.stringify(qaScene.framing),prior=qaScene.surface.getSourceImage().toDataURL();
   const opening=sample('alice-c3-little-01');if(prior!==qaScene.surface.getSourceImage().toDataURL()||JSON.stringify(qaScene.framing)!==seamFrame)throw Error('S2 to S3 seam mismatch');
   if(JSON.stringify(opening.alice)!=='[535,615]'||opening.pose!=='back')throw Error('Wrong inherited support');
   const steps=e.story.steps.filter(s=>s.sceneIndex===2&&s.type!=='end');
   for(const step of steps)for(let t=0;t<(step.duration||step.readingDurationMs);t+=100){
    const s=sample(step.id,t),f=qaScene.framing,w=qaScene.scale.width,h=qaScene.scale.height,canvas=qaScene.game.canvas.getBoundingClientRect(),card=document.querySelector('#dialogue'),r=card.getBoundingClientRect(),top=(r.top-canvas.top)*h/canvas.height;
    const shown=getComputedStyle(card).opacity==='1';if(shown!==(step.type==='text'))throw Error('Wrong card visibility '+step.id);
    if(shown&&(document.querySelector('#text-button').disabled||getComputedStyle(document.querySelector('#text-button')).cursor!=='pointer'||e.revealed!==step.text.length))throw Error('Blocked/incomplete dialogue');
    if(s.scale<.32-1e-8||s.scale>1.1+1e-8)throw Error('Invalid scale');
    if(s.beat>=8&&JSON.stringify(s.alice)!=='[500,615]')throw Error('Transformation root drift');
    if(s.beat===3&&JSON.stringify(s.alice)!=='[575,608]')throw Error('A pickup root drift');
    if(s.beat===6&&JSON.stringify(s.alice)!=='[411,608]')throw Error('B pickup root drift');
    if(s.fragments.length>1||s.hookahInstances!==0)throw Error('Duplicate/visible hidden prop');
    for(const p of s.fragments){if(p.owner!=='alice'||Math.hypot(p.anchor[0]-s.hand[0],p.anchor[1]-s.hand[1])>.001)throw Error('Detached held piece');}
    for(const b of [s.aliceBounds,...s.fragments.map(p=>p.bounds)]){
     const left=(b.left-f.x)*f.z+w/2,right=(b.right-f.x)*f.z+w/2,bt=(b.top-f.y)*f.z+h/2,bottom=(b.bottom-f.y)*f.z+h/2;
     if(left<-.5||right>w+.5||bt<-.5||bottom>h+.5)throw Error('Clipped silhouette '+step.id+' '+t);
     minTop=Math.min(minTop,bt);minGap=Math.min(minGap,top-bottom);if(top-bottom<11.5)throw Error('Dialogue reserve collision '+step.id+' '+t+' '+(top-bottom));
    }
    if(s.biting&&s.armAngle!==0)throw Error('Bite before mouth contact');
    if(shown){e.paused=false;if(!e.advance(performance.now()+100000)||e.step.id===step.id)throw Error('No instant caption advance');e.paused=true;}else{e.paused=false;if(e.advance(performance.now()+100000))throw Error('Action was skippable');e.paused=true;}
    frames.push(f);if(step.type==='action')actionFrames.push({beat:s.beat,t,root:s.alice,scale:s.scale,pose:s.pose,hand:s.hand,held:s.held,remainingA:s.remainingA,remainingB:s.remainingB,locations:s.locations,walking:s.walking});count++;
   }
   if(new Set(frames.map(f=>JSON.stringify([f.x,f.y,f.z]))).size!==1)throw Error('Scene camera moved');
   for(const [beat,point]of [[3,[545.546,568.421]],[6,[440.454,568.421]]]){const s=sample('alice-c3-little-'+String(beat).padStart(2,'0'),100);if(Math.hypot(s.hand[0]-point[0],s.hand[1]-point[1])>.01)throw Error('Missed stem contact');}
   const checkpoints=[];
   for(const beat of [2,8,10,11,13,14,16,17]){const s=sample('alice-c3-little-'+String(beat).padStart(2,'0'));checkpoints.push({beat,staging:s,model:structuredClone(e.model.mushroomTrial)});}
   sample('alice-c3-little-17');if(e.model.mushroomTrial.A.remaining!==.92||e.model.mushroomTrial.B.remaining!==.78||e.model.mushroomTrial.scale!==1.1)throw Error('Durable inventory/scale missing');
   return{samples:count,minGap,minTop,fixedFrame:frames[0],opening,checkpoints,actionFrames};
  });
  const modes=[];
  for(const mode of ['portrait','landscape','auto']){
   await page.evaluate(()=>{const e=qaScene.reader;e.start('alice-c3-little-15');e.paused=false;e.tick(3800);e.paused=true;qaScene.draw();});
   const before=await page.evaluate(()=>JSON.stringify({m:qaScene.reader.model,t:qaScene.reader.elapsed,p:qaScene.reader.paused}));
   await page.click('#show-controls');await page.selectOption('#aspect-ratio',mode);await page.click('#close-settings');
   const after=await page.evaluate(()=>JSON.stringify({m:qaScene.reader.model,t:qaScene.reader.elapsed,p:qaScene.reader.paused}));assert.equal(after,before);
   const fit=await page.evaluate(()=>{qaScene.draw();const s=qaScene.current,f=qaScene.framing;return{scale:s.scale,root:s.alice,frame:f,w:qaScene.scale.width,h:qaScene.scale.height};});modes.push({mode,...fit});
  }
  for(const [beat,time]of [[3,1800],[6,2000],[9,2200],[12,900],[15,4200],[17,0]]){
   await page.evaluate(([beat,t])=>{const e=qaScene.reader;e.start('alice-c3-little-'+String(beat).padStart(2,'0'));e.paused=false;e.tick(t);e.paused=true;e.onChange('back');qaScene.draw();qaScene.game.step(performance.now(),0);},[beat,time]);
   await page.screenshot({path:`${out}/${layout.name}-beat${beat}.png`});
  }
  report.cases.push({layout,...result,modes});await context.close();console.log('PASS C3-S3 sampled',layout.name);
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.resources,[]);report.passed=true;
}finally{await browser.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}
