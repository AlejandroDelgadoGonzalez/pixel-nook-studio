import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {launch,openCase} from './helpers/browser.mjs';
import {storyCases} from './helpers/story-cases.mjs';
import {officialLayouts} from './official-layouts.mjs';
import {snapshot} from './checks/viewport-coverage.mjs';
const out='.artifacts/qa/c3-conversation';await fs.mkdir(out,{recursive:true});
const browser=await launch(),report={errors:[],resources:[],cases:[]};
try{
 const item=(await storyCases()).find(c=>c.slug==='alice-in-wonderland'&&c.chapter.number===3);
 const prior=JSON.parse(await fs.readFile('qa/fixtures/alice-c3-approved-dialogue.json','utf8'));
 const old=prior.steps,now=item.story.steps,removed=old.filter(s=>!now.some(b=>b.id===s.id)).map(s=>s.id);
 assert.deepEqual(removed,['alice-c3-who-12','alice-c3-side-01','alice-c3-side-14']);
 for(const s of now.filter(s=>s.type!=='end')){const p=old.find(b=>b.id===s.id);for(const k of ['type','who','text','duration','readingDurationMs'])assert.deepEqual(s[k],p[k],s.id+' '+k);}
 for(const layout of officialLayouts){
  const {page,context}=await openCase(browser,item,layout,report);
  const r=await page.evaluate(async()=>{
   const e=qaScene.reader;e.setAuto(false);let count=0;const frames=[],pan=[],heights=[];
   function sample(id,t){e.start(id);e.paused=false;e.tick(t);e.paused=true;e.onChange('back');qaScene.draw();qaScene.game.step(performance.now(),0);return qaScene.current;}
   for(const step of e.story.steps.filter(s=>s.type!=='end'))for(let t=0;t<(step.duration||step.readingDurationMs);t+=100){
    const s=sample(step.id,t),f=qaScene.framing,w=qaScene.scale.width,h=qaScene.scale.height,card=document.querySelector('#dialogue'),visible=getComputedStyle(card).opacity==='1';
    if((step.sceneIndex===1||step.c3Beat>=3)&&JSON.stringify(s.alice)!=='[535,615]')throw Error('Alice root drift');
    if(step.s2Beat<=11&&JSON.stringify(s.root)!=='[490,370]')throw Error('Pickup body root drift');
    if(step.s2Beat<=10&&JSON.stringify(s.hookahBase)!=='[525.6,369.6]')throw Error('Seated vessel drift');
    if(step.s2Beat&&s.hookahInstances!==1)throw Error('Duplicate hookah');
    const expected=step.type==='text'&&(!step.during||t>=(step.captionStartMs||0));
    if(visible!==expected)throw Error('Caption timing '+step.id+' '+t);
    if(visible){if(document.querySelector('#text-button').disabled||getComputedStyle(document.querySelector('#text-button')).cursor!=='pointer')throw Error('Visible blocked caption');if(document.querySelectorAll('#text .is-revealed').length!==Array.from(step.text).length)throw Error('Incomplete text');}
    for(const [name,b]of [['Alice',s.aliceBounds],['Caterpillar',s.caterpillarBounds]]){
     const l=(b.left-f.x)*f.z+w/2,r=(b.right-f.x)*f.z+w/2,top=(b.top-f.y)*f.z+h/2,bot=(b.bottom-f.y)*f.z+h/2;
     if(l<-.5||r>w+.5||top<-.5||bot>h+.5)throw Error('Clipped '+name+' '+step.id+' '+t+' '+JSON.stringify({l,r,top,bot,w,h}));
     if(name==='Caterpillar'&&((step.c3Beat===2&&!s.seated)||step.s2Beat===12)&&top<24-.5)throw Error('No headroom on crest');
     const canvas=qaScene.game.canvas.getBoundingClientRect(),panel=card.getBoundingClientRect();if(visible&&name==='Alice'&&canvas.top+bot*canvas.height/h>=panel.top-1)throw Error('Feet in dialogue');
    }
    if(visible){e.paused=false;const index=e.index;if(!e.advance(performance.now()+100000)||e.index!==index+1)throw Error('Visible caption cannot advance immediately');e.paused=true;}
    else{e.paused=false;if(e.advance(performance.now()+100000))throw Error('Hidden action allowed advance');e.paused=true;}
    heights.push(card.getBoundingClientRect().height);frames.push({id:step.id,t,...f,visible});if(step.c3Beat===2||step.s2Beat===11||step.s2Beat===12)pan.push({id:step.id,t,x:f.x,y:f.y,z:f.z});count++;
   }
   if(new Set(frames.map(f=>f.z)).size!==1||new Set(frames.map(f=>f.x)).size!==1)throw Error('Zoom/X drift');
   if(new Set(heights).size!==1)throw Error('Caption reserve changed');
   // Exact crests fall between100ms samples; inspect those too.
   for(const [id,t]of [['alice-c3-who-02',3200],['alice-c3-side-12',4000/3]]){const s=sample(id,t),f=qaScene.framing,top=(s.caterpillarBounds.top-f.y)*f.z+qaScene.scale.height/2;if(top<23.5)throw Error('Crest headroom at exact route knot '+top);}
   const base=sample('alice-c3-who-11',0),f0={...qaScene.framing},pixels=qaScene.surface.context.getImageData(0,0,1664,936).data.slice();
   e.paused=false;e.advance(performance.now()+100000);e.paused=true;qaScene.draw();e.onChange('back');
   if(e.step.id!=='alice-c3-side-02'||document.querySelector('#text-button').disabled||getComputedStyle(document.querySelector('#dialogue')).opacity!=='1')throw Error('Static conversation bridge remains');
   const nextPixels=qaScene.surface.context.getImageData(0,0,1664,936).data;
   if(pixels.some((v,i)=>v!==nextPixels[i]))throw Error('Seam changed pixels');
   const textFrames=frames.filter(f=>f.visible);if(textFrames.some(f=>f.y!==f0.y))throw Error('Camera moved with visible card');
   sample('alice-c3-side-13',0);const occluded=qaScene.surface.context.getImageData(440,280,120,200).data,c=document.createElement('canvas');c.width=1664;c.height=936;const ctx=c.getContext('2d');ctx.drawImage(qaScene.textures.get('alice-c3-s1-bg').getSourceImage(),0,0);const bg=ctx.getImageData(440,280,120,200).data;if(occluded.some((v,i)=>v!==bg[i]))throw Error('Residual hidden pixels');
   const {ReaderEngine}=await import('/platform/reader/engine.js'),{videoSequence}=await import('/platform/video/video-sequence.js');
   for(const index of [0,1]){const seq=videoSequence(e.story,index);if(seq.holdMs!==0||seq.closingIds.length)throw Error('Export static padding');const final=index?'alice-c3-side-13':'alice-c3-who-11';sample(final,0);const view=JSON.stringify(qaScene.framing),p=qaScene.surface.context.getImageData(0,0,1664,936).data.slice();
    try{for(const step of seq.story.steps.filter(s=>s.exportPhase==='fade'||s.type==='end')){if(step.sceneIndex!==index)continue;const copy=new ReaderEngine(seq.story);copy.start(step.id);qaScene.reader=copy;qaScene.draw();const image=qaScene.surface.context.getImageData(0,0,1664,936).data;if(image.some((v,i)=>v!==p[i])||JSON.stringify(qaScene.framing)!==view)throw Error('Export close resets scene');}}finally{qaScene.reader=e;}
   }
   return{count,zoom:frames[0].z,pan,samples:frames,instantConversationSeam:true};
  });
  const modes=[];for(const mode of ['portrait','landscape','auto']){
   await page.evaluate(()=>{qaScene.reader.start('alice-c3-side-12');qaScene.reader.elapsed=1350;qaScene.reader.paused=true;qaScene.draw();});await page.click('#show-controls');
   const frozen=await page.evaluate(()=>JSON.stringify({m:qaScene.reader.model,t:qaScene.reader.elapsed,paused:qaScene.reader.paused}));await page.selectOption('#aspect-ratio',mode);await page.click('#close-settings');await page.waitForTimeout(100);await page.evaluate(()=>{qaScene.draw();qaScene.game.step(performance.now(),0);});
   assert.equal(await page.evaluate(()=>JSON.stringify({m:qaScene.reader.model,t:qaScene.reader.elapsed,paused:qaScene.reader.paused})),frozen);const view=await snapshot(page);assert.deepEqual(view.issues,[]);modes.push(mode);
  }
  if(layout.width===1280)assert.equal(r.zoom,1.35);
  await page.screenshot({path:`${out}/${layout.name}.png`});report.cases.push({layout,...r,modes});await context.close();console.log('PASS fixed zoom, pan, instant enabled text',layout.name);
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.resources,[]);report.passed=true;
}finally{await browser.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}
