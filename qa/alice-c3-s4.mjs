import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {launch,openCase} from './helpers/browser.mjs';
import {storyCases} from './helpers/story-cases.mjs';
import {officialLayouts} from './official-layouts.mjs';
const out=process.env.QA_OUTPUT_DIR||'.artifacts/qa/c3-s4/staging';await fs.mkdir(out,{recursive:true});
const browser=await launch(),report={scope:'Phaser C3-S4 sampled at100ms, six viewports x three aspect modes; S1..S3 regression and MP4 separately',errors:[],resources:[],cases:[]};
try{
 const item=(await storyCases()).find(c=>c.slug==='alice-in-wonderland'&&c.chapter.number===3);
 for(const layout of officialLayouts){
  const {page,context}=await openCase(browser,item,layout,report);
  for(const mode of ['auto','portrait','landscape']){
   await page.click('#show-controls');await page.selectOption('#aspect-ratio',mode);await page.click('#close-settings');
   const row=await page.evaluate(async()=>{
    const e=qaScene.reader;let samples=0,minTop=Infinity,minGap=Infinity,birdSamples=0;const frames=[],snapshots=[];
    const sample=(id,t=0)=>{e.start(id);e.paused=false;if(t)e.tick(t);e.paused=true;e.onChange('back');qaScene.draw();qaScene.game.step(performance.now(),0);return structuredClone(qaScene.current);};
    const id=n=>'alice-c3-branches-'+String(n).padStart(2,'0');
    sample('alice-c3-little-17');const prior=qaScene.surface.context.getImageData(0,0,1664,936).data.slice(),priorFrame=JSON.stringify(qaScene.framing);
    const first=sample(id(1)),next=qaScene.surface.context.getImageData(0,0,1664,936).data;
    if(prior.some((v,i)=>v!==next[i])||JSON.stringify(qaScene.framing)!==priorFrame)throw Error('S3/S4 opening pixels or camera changed');
    if(!first.mirror||first.scale!==1.1||first.held!=='B'||first.remainingA!==.92||first.remainingB!==.78||first.birdVisible)throw Error('Bad inherited opening');
    for(const step of e.story.steps.filter(s=>s.sceneIndex===3&&s.type!=='end')){
     const duration=step.duration||step.readingDurationMs;let spokenFrame;
     for(const time of [...Array.from({length:Math.ceil(duration/100)},(_,i)=>i*100),duration-1]){
      const s=sample(step.id,time),f=qaScene.framing,w=qaScene.scale.width,h=qaScene.scale.height,card=document.querySelector('#dialogue'),button=document.querySelector('#text-button'),canvas=qaScene.game.canvas.getBoundingClientRect(),top=(card.getBoundingClientRect().top-canvas.top)*h/canvas.height;
      const spoken=step.type==='text',shown=getComputedStyle(card).opacity==='1';
      if(shown!==spoken||spoken&&(button.disabled||getComputedStyle(button).cursor!=='pointer'||e.revealed!==step.text.length||qaScene.cameraReframing))throw Error('Invalid ready-complete '+step.id);
      if(spoken){const key=JSON.stringify(f);if(spokenFrame&&key!==spokenFrame)throw Error('Moving dialogue camera');spokenFrame=key;}
      if(s.beat<=14&&JSON.stringify(s.alice)!=='[500,615]')throw Error('Root drift');
      if(Math.abs(s.uniformScale.x-s.uniformScale.y)>1e-10||s.scale<.32||!s.fullSpriteOnly)throw Error('Deformed sprite');
      if(s.hookahInstances||s.fragments.length>1)throw Error('Duplicate prop');
      if(s.fragments.some(p=>p.location!=='hand'||p.owner!=='alice'||Math.hypot(p.anchor[0]-s.hand[0],p.anchor[1]-s.hand[1])>.001))throw Error('Floating fragment');
      if([2,4,6,8,11].includes(s.beat)&&JSON.stringify(s.birdRoot)!=='[350,391]')throw Error('Perch foot drift');
      if(s.beat===13&&(!s.birdMirror||s.birdOpacity!==1||!s.birdMask))throw Error('Artificial exit fade');
      if(s.beat>=14&&s.birdVisible)throw Error('Residual bird after foliage entry');
      if(s.walking&&(s.renderedPose!=='right'||s.mirror||!qaScene.branchRig.walkFrames.length||qaScene.branchRig.geometry.rig.walking.frameMs!==130))throw Error('Noncanonical/reversed walk');
      if(s.beat===15&&time<500&&s.alice[0]!==500)throw Error('Pocket root moved');
      for(const b of [s.aliceBounds,...s.fragments.map(p=>p.bounds),...(s.birdVisible?[s.birdBounds]:[])]){
       const l=(b.left-f.x)*f.z+w/2,r=(b.right-f.x)*f.z+w/2,t=(b.top-f.y)*f.z+h/2,bottom=(b.bottom-f.y)*f.z+h/2;
       if(l<-.5||r>w+.5||t<-.5||bottom>h+.5||top-bottom<11.5)throw Error('Silhouette/caption clipping '+step.id+' '+time+' '+JSON.stringify({l,r,t,bottom,top,w,h}));
       minTop=Math.min(minTop,t);minGap=Math.min(minGap,top-bottom);
      }
      if(s.birdVisible)birdSamples++;
      if(f.x-w/2/f.z<0||f.x+w/2/f.z>1664||f.y-h/2/f.z<0||f.y+h/2/f.z>936)throw Error('Uncovered panorama');
      frames.push({beat:s.beat,t:time,...f});
      const before=e.index;e.paused=false;const advanced=e.advance(performance.now()+100000);e.paused=true;
      if(spoken?(!advanced||e.index!==before+1):advanced)throw Error('Wrong advance gating');samples++;
     }
    }
    if(new Set(frames.map(f=>f.z)).size!==1||new Set(frames.map(f=>f.y)).size!==1)throw Error('Zoom/Y drift');
    const {ReaderEngine}=await import('/platform/reader/engine.js');
    for(const beat of [2,9,11,12,14,16]){const s=sample(id(beat)),model=structuredClone(e.model),saved=e.checkpoint(),restored=new ReaderEngine(e.story);restored.start(saved.line);if(JSON.stringify(restored.model)!==JSON.stringify(model))throw Error('Saved model mismatch');const before=JSON.stringify(s);e.tick(900);qaScene.draw();if(JSON.stringify(qaScene.current)!==before)throw Error('Pause did not freeze');snapshots.push({beat,model,saved});}
    for(const [beat,t]of [[1,750],[10,2200],[13,1700],[15,1550]]){const s=sample(id(beat),t),before=JSON.stringify(s);e.seek(id(beat));e.paused=false;e.tick(t);e.paused=true;e.onChange('back');qaScene.draw();if(JSON.stringify(qaScene.current)!==before)throw Error('Action seek reconstruction');}
    const end=sample(id(16));if(JSON.stringify(end.alice)!=='[640,615]'||end.scale!==.46||end.held||end.locations.A!=='pocket'||end.locations.B!=='pocket'||end.remainingA!==.84||end.remainingB!==.78)throw Error('Wrong ending');
    if(JSON.stringify(e.model.mushroomTrial)!==JSON.stringify(snapshots.at(-1).model.mushroomTrial))throw Error('Ending model mismatch');
    return{samples,minTop,minGap,birdSamples,frames,snapshots,openingExactPixelParity:true,ending:end};
   });
   for(const [beat,t,label]of [[2,0,'conversation'],[10,3500,'shrink'],[13,2200,'foliage'],[16,0,'end']]){
    await page.evaluate(([b,t])=>{const e=qaScene.reader;e.start('alice-c3-branches-'+String(b).padStart(2,'0'));e.paused=false;e.tick(t);e.paused=true;e.onChange('back');qaScene.draw();qaScene.game.step(performance.now(),0);},[beat,t]);
    await page.screenshot({path:`${out}/${layout.name}-${mode}-${label}.jpg`,type:'jpeg',quality:88});
   }
   report.cases.push({layout,mode,...row});console.log('PASS S4',layout.name,mode,row.samples);
  }
  // Round trip aspect changes preserves a paused action, model and clock.
  const before=await page.evaluate(()=>JSON.stringify({id:qaScene.reader.step.id,t:qaScene.reader.elapsed,m:qaScene.reader.model,p:qaScene.reader.paused}));
  for(const mode of ['portrait','landscape','auto']){await page.click('#show-controls');await page.selectOption('#aspect-ratio',mode);await page.click('#close-settings');assert.equal(await page.evaluate(()=>JSON.stringify({id:qaScene.reader.step.id,t:qaScene.reader.elapsed,m:qaScene.reader.model,p:qaScene.reader.paused})),before);}
  await context.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.resources,[]);report.passed=true;
}finally{await browser.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}
