import fs from 'node:fs/promises';import assert from 'node:assert/strict';
import {launch,openCase} from './helpers/browser.mjs';import {storyCases} from './helpers/story-cases.mjs';import {officialLayouts} from './official-layouts.mjs';
const out=process.env.QA_OUTPUT_DIR||'.artifacts/qa/c3-s5/staging';await fs.mkdir(out,{recursive:true});const browser=await launch(),report={scope:'Actual Phaser scene5:18 combinations,100ms sampled paths, complete-shot projection, letters, native gait, pause and action reconstruction',errors:[],resources:[],cases:[]};
try{
 const item=(await storyCases()).find(c=>c.slug==='alice-in-wonderland'&&c.chapter.number===3);
 for(const layout of officialLayouts){const {page,context}=await openCase(browser,item,layout,report);
 for(const mode of ['auto','portrait','landscape']){
  await page.click('#show-controls');await page.selectOption('#aspect-ratio',mode);await page.click('#close-settings');
  const row=await page.evaluate(async()=>{
   const e=qaScene.reader,id=n=>'alice-c3-door-'+String(n).padStart(2,'0'),sample=(name,t=0)=>{e.start(name);e.paused=false;if(t)e.tick(t);e.paused=true;e.onChange('back');qaScene.draw();qaScene.game.step(performance.now(),0);return structuredClone(qaScene.current);};
   sample('alice-c3-branches-16');const prior=qaScene.surface.context.getImageData(0,0,1664,936).data.slice(),oldFrame={...qaScene.framing};let initial=sample(id(1));const actual=qaScene.surface.context.getImageData(0,0,1664,936).data;
   if(prior.some((n,i)=>n!==actual[i]))throw Error('S4/S5 opening pixel seam');for(const k of ['x','y','z'])if(oldFrame[k]!==qaScene.framing[k])throw Error('Opening camera jump');
   let count=0,minGap=Infinity,minSide=Infinity,minTop=Infinity;const stages=[];
   for(const st of e.story.steps.filter(s=>s.sceneIndex===4&&s.type!=='end')){
    const duration=st.duration||st.readingDurationMs;let held;
    for(const t of [...Array.from({length:Math.ceil(duration/100)},(_,i)=>i*100),duration-.01]){
     const s=sample(st.id,t),w=qaScene.scale.width,h=qaScene.scale.height,card=document.querySelector('#dialogue'),button=document.querySelector('#text-button'),canvas=qaScene.game.canvas.getBoundingClientRect(),top=(card.getBoundingClientRect().top-canvas.top)*h/canvas.height,shown=getComputedStyle(card).opacity==='1',spoken=st.type==='text';
     if(shown!==spoken||shown&&(button.disabled||getComputedStyle(button).cursor!=='pointer'||e.revealed!==st.text.length||qaScene.cameraReframing))throw Error('Ready-complete blocked '+st.id);
     const frameKey=JSON.stringify(s.frames.house);if(held&&held!==frameKey)throw Error('House camera moved');held=frameKey;
     if(s.frames.house.z!==oldFrame.z||s.frames.forest.z!==oldFrame.z)throw Error('Zoom changed');
     if(s.scale!==.46||s.A!==.84||s.B!==.78||!s.pockets||s.fragments.length||s.hookahInstances)throw Error('Lost inherited inventory');
     if(Math.abs(s.uniformScale.x-s.uniformScale.y)>1e-7||!s.fullSpriteOnly)throw Error('Nonuniform/body parts');
     if(s.frog[0]!==1000.0372662166412||s.frog[1]!==648.8830066263821)throw Error('Frog root moved');
     if((e.model.doorVisit.invitationTransfer>=.5)!==(s.letterOwner==='frog-footman'))throw Error('Model/render ownership diverged');
     if(s.letter.instances!==1||s.letter.owner!==(s.beat<3||s.beat===3&&t<1500?'fish-footman':'frog-footman'))throw Error('Wrong/duplicate invitation');
     const owner=s.letter.owner==='fish-footman'?s.fishArt:s.frogArt,offset=s.letter.owner==='fish-footman'?18:-18;
     if(Math.hypot(s.letter.center[0]-owner.hand[0]-offset,s.letter.center[1]-owner.hand[1])>1e-8)throw Error('Floating letter');
     if(s.beat>=10&&s.fishArt.visible)throw Error('Fish not hidden by hedge');
     if(s.fishArt.walking&&(!s.fishMirror||s.fishPose!=='idle-right'))throw Error('Fish moonwalk/run');
     if(s.walking&&(s.renderedPose!=='right'||s.mirror))throw Error('Alice moonwalk/run');
     const layers=[];if(s.oldOpacity>0)layers.push({f:s.frames.forest,boxes:[s.oldAliceArt.bounds]});if(s.newOpacity>0)layers.push({f:s.frames.house,boxes:[s.houseAliceArt.bounds,s.frogArt.bounds,s.letter.bounds,...(s.fishArt.visible?[s.fishArt.visibleBounds]:[])]});
     for(const{f,boxes}of layers){if(f.x-w/2/f.z<0||f.x+w/2/f.z>1664.01||f.y-h/2/f.z<0||f.y+h/2/f.z>936.01)throw Error('Background uncovered');for(const b of boxes){const l=(b.left-f.x)*f.z+w/2,r=(b.right-f.x)*f.z+w/2,head=(b.top-f.y)*f.z+h/2,bottom=(b.bottom-f.y)*f.z+h/2;minGap=Math.min(minGap,top-bottom);minSide=Math.min(minSide,l,w-r);minTop=Math.min(minTop,head);if(l<-.5||r>w+.5||head<-.5||bottom>h+.5||top-bottom<11.3)throw Error('Clipped '+st.id+' '+t+' '+JSON.stringify({l,r,head,bottom,top,w,h}));}}
     e.paused=false;const before=e.index,advanced=e.advance(performance.now()+100000);e.paused=true;if(spoken?(!advanced||e.index!==before+1):advanced)throw Error('Wrong tap gating');count++;
    }
   }
   const a=sample(id(3),1499),b=sample(id(3),1500);if(Math.hypot(...a.letter.center.map((x,i)=>x-b.letter.center[i]))>1e-8)throw Error('Letter transfer jumps');
   if(Math.abs(b.letter.center[0]-950.006469115192)>1e-6||Math.abs(b.letter.center[1]-607.0974540901502)>1e-6)throw Error('Missed measured hand contact');
   for(const [beat,t]of [[1,700],[1,2100],[1,3500],[3,1499],[3,1500],[9,3000],[15,600]]){const before=sample(id(beat),t);e.tick(1000);qaScene.draw();if(JSON.stringify(qaScene.current)!==JSON.stringify(before))throw Error('Paused action moved');e.seek(id(beat));e.paused=false;e.tick(t);e.paused=true;e.onChange('back');qaScene.draw();if(JSON.stringify(qaScene.current)!==JSON.stringify(before))throw Error('Action reconstruct failed');stages.push(before);}
   const {ReaderEngine}=await import('/platform/reader/engine.js');for(const beat of [2,4,8,10,14,16]){sample(id(beat));const fresh=new ReaderEngine(e.story);fresh.start(e.checkpoint().line);if(JSON.stringify(fresh.model)!==JSON.stringify(e.model))throw Error('Saved model mismatch');}
   const end=sample(id(16));if(JSON.stringify(end.alice)!=='[846,640]'||end.pose!=='back'||end.fishArt.visible||end.frogPose!=='sit-right'||e.model.mushroomTrial.x!==846||e.model.doorVisit.invitationTransfer!==1)throw Error('Bad ending');
   // Cache must never retain courtyard pixels when returning to S4.
   sample('alice-c3-branches-16');const seam=qaScene.surface.context.getImageData(0,0,1664,936).data;if(prior.some((x,i)=>x!==seam[i]))throw Error('Previous scene cache corrupted');
   return{count,minGap,minSide,minTop,initial,end,stages,openingExactPixelParity:true,letterContactExact:true};
  });report.cases.push({layout,mode,...row});
  for(const [beat,t,label]of [[1,2100,'dissolve'],[3,1500,'handoff'],[9,5499,'hedge'],[16,0,'threshold']]){await page.evaluate(([b,t])=>{const e=qaScene.reader;e.start('alice-c3-door-'+String(b).padStart(2,'0'));e.paused=false;e.tick(t);e.paused=true;e.onChange('back');qaScene.draw();qaScene.game.step(performance.now(),0);},[beat,t]);await page.screenshot({path:`${out}/${layout.name}-${mode}-${label}.jpg`,type:'jpeg',quality:88});}
  console.log('PASS S5',layout.name,mode,row.count);await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));
 }
 await context.close();}
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.resources,[]);report.passed=true;
}finally{await browser.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}
