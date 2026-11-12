import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {launch,openCase} from './helpers/browser.mjs';
import {storyCases} from './helpers/story-cases.mjs';
import {officialLayouts} from './official-layouts.mjs';
import {snapshot} from './checks/viewport-coverage.mjs';
const out=process.env.QA_OUTPUT_DIR||'.artifacts/qa/c3-s2/targeted';await fs.mkdir(out,{recursive:true});
const browser=await launch(),report={errors:[],resources:[],cases:[],scope:'Deterministic 100ms staging samples and source/pixel comparisons, complementary to real-clock playback'};
try{
 const item=(await storyCases()).find(c=>c.slug==='alice-in-wonderland'&&c.chapter.number===3);
 const prior=JSON.parse(await fs.readFile('.artifacts/backups/c3-s2-before/chapter-03.json','utf8'));
 assert.deepEqual(await fs.readFile('stories/alice-in-wonderland/renderers/who-are-you.js'),await fs.readFile('.artifacts/backups/c3-s2-before/who-are-you.js'),'Original S1 renderer byte-identical');
 assert.deepEqual(item.data.scenes[0].steps,prior.scenes[0].steps.filter(s=>s.type!=='end'),'S1 dialogue, beats and timings must remain identical');
 for(const layout of officialLayouts){
  const {page,context}=await openCase(browser,item,layout,report);
  const result=await page.evaluate(baselineTexts=>{
   const e=qaScene.reader,rows=[],cameras=[],pickup=[],panelHeights=[];
   const measure=document.querySelector('#measure'),saved=measure.textContent;
   let oldMax=0,newMax=0;for(const text of baselineTexts){measure.textContent=text;oldMax=Math.max(oldMax,measure.offsetHeight);}for(const s of e.story.steps)if(s.text){measure.textContent=s.text;newMax=Math.max(newMax,measure.offsetHeight);}measure.textContent=saved;
   if(oldMax!==newMax)throw Error('S2 changed S1 caption reserve');
   const sample=(id,t)=>{e.start(id);e.paused=false;e.tick(t);e.paused=true;e.onChange('back');qaScene.draw();qaScene.game.step(performance.now(),0);return structuredClone(qaScene.current);};
   const last=sample('alice-c3-who-12',0),oldFrame=JSON.stringify(qaScene.framing),oldPixels=qaScene.surface.context.getImageData(0,0,1664,936).data.slice();
   const first=sample('alice-c3-side-01',0);
   if(JSON.stringify(qaScene.framing)!==oldFrame)throw Error('S1/S2 camera seam');
   const nextPixels=qaScene.surface.context.getImageData(0,0,1664,936).data;
   if(oldPixels.some((v,i)=>v!==nextPixels[i]))throw Error('S1/S2 pixel seam');
   if(JSON.stringify(last.alice)!==JSON.stringify(first.alice)||JSON.stringify(last.root)!==JSON.stringify(first.root))throw Error('Actor seam');
   for(const step of e.story.steps.filter(s=>s.s2Beat&&s.type!=='end')){
    const duration=step.duration||step.readingDurationMs;
    for(let t=0;t<duration;t+=100){
     const s=sample(step.id,t),d=document.querySelector('#dialogue'),css=getComputedStyle(d),visible=css.opacity!=='0';
     if(JSON.stringify(s.alice)!=='[535,615]')throw Error('Alice drift');
     if(s.beat<=11&&JSON.stringify(s.root)!=='[490,370]')throw Error('Body root drift');
     if(s.beat<=10&&JSON.stringify(s.hookahBase)!=='[525.6,369.6]')throw Error('Vessel slid');
     if(s.hookahInstances!==1)throw Error('Duplicate hookah');
     const ready=step.type==='text'&&e.revealed>=step.text.length;
     if(visible!==ready)throw Error('Caption readiness '+step.id+' '+t);
     if(visible&&(document.querySelectorAll('#text .is-revealed').length!==Array.from(step.text).length||getComputedStyle(document.querySelector('#text-button')).opacity!=='1'))throw Error('Incomplete or grey caption');
     if(step.type==='action'){e.paused=false;if(e.advance(performance.now()+10000))throw Error('Action tap skipped');e.paused=true;}
     panelHeights.push(d.getBoundingClientRect().height);
     if(s.beat<10||s.beat===10&&t<=4800)cameras.push(['conversation',JSON.stringify(qaScene.framing)]);
     if(s.beat>=11)cameras.push(['retreat',JSON.stringify(qaScene.framing)]);
     if(s.beat===11)pickup.push({t,root:s.root,base:s.hookahBase,contact:s.contact});
     rows.push({beat:s.beat,t,captionVisible:visible,mask:s.mask,zoom:qaScene.framing.z});
    }
   }
   for(const kind of ['conversation','retreat'])if(new Set(cameras.filter(c=>c[0]===kind).map(c=>c[1])).size!==1)throw Error('Camera drift '+kind);
   if(new Set(panelHeights).size!==1)throw Error('Dialogue reserve changed');
   if(pickup.some(p=>p.t<=1000&&JSON.stringify(p.base)!=='[525.6,369.6]'))throw Error('Lift before hand contact');
   const end=sample('alice-c3-side-12',0);if(JSON.stringify(end.hookahBase)!=='[516.6,352]')throw Error('Pickup endpoint');
   // Actual raster at full occlusion must contain no Caterpillar or hookah pixels.
   sample('alice-c3-side-13',0);const actual=qaScene.surface.context.getImageData(440,280,120,200).data;
   const c=document.createElement('canvas');c.width=1664;c.height=936;const x=c.getContext('2d');x.drawImage(qaScene.textures.get('alice-c3-s1-bg').getSourceImage(),0,0);const expected=x.getImageData(440,280,120,200).data;
   if(actual.some((v,i)=>v!==expected[i]))throw Error('Residual pixels behind cap');
   const duration=[];for(const index of [0,1]){e.start(e.story.scenes[index].steps[0].id);e.sceneGate=false;e.setAuto(true);let n=0;while(e.running&&e.step.sceneIndex===index&&n++<85000)e.tick(1);duration.push(e.totalTime);}
   if(duration[0]!==75000||duration[1]!==72000)throw Error('Duration regression '+duration);
   return{samples:rows.length,rows,pickup,durationMs:duration,seamPixelIdentical:true,occlusionPixelIdentical:true,captionReserveFixed:true};
  },prior.scenes[0].steps.filter(s=>s.type==='text').map(s=>s.text));
  for(const [beat,t]of [[10,5400],[11,0],[11,500],[11,1000],[11,1500],[11,2000],[11,2900],[12,0],[12,1333],[12,2500],[12,3999],[13,2500]]){
   await page.evaluate(({beat,t})=>{const e=qaScene.reader;e.start('alice-c3-side-'+String(beat).padStart(2,'0'));e.paused=false;e.tick(t);e.paused=true;e.onChange('back');qaScene.draw();qaScene.game.step(performance.now(),0);},{beat,t});
   const view=await snapshot(page);assert.deepEqual(view.issues,[]);
   if(layout.width===390||layout.width===1280)await page.screenshot({path:`${out}/${layout.name}-b${beat}-${t}.png`});
  }
  const modes=[];for(const mode of ['portrait','landscape','auto']){
   await page.evaluate(()=>{qaScene.reader.start('alice-c3-side-11');qaScene.reader.elapsed=1500;qaScene.reader.paused=true;qaScene.draw();});
   await page.click('#show-controls');const before=await page.evaluate(()=>JSON.stringify({model:qaScene.reader.model,index:qaScene.reader.index,time:qaScene.reader.elapsed,paused:qaScene.reader.paused}));
   await page.selectOption('#aspect-ratio',mode);await page.click('#close-settings');
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.evaluate(()=>{qaScene.draw();qaScene.game.step(performance.now(),0);});
   assert.equal(await page.evaluate(()=>JSON.stringify({model:qaScene.reader.model,index:qaScene.reader.index,time:qaScene.reader.elapsed,paused:qaScene.reader.paused})),before);
   const view=await snapshot(page);assert.deepEqual(view.issues,[]);modes.push({mode,view});
  }
  const exportHolds=await page.evaluate(async()=>{
   const {videoSequence}=await import('/platform/video/video-sequence.js'),{ReaderEngine}=await import('/platform/reader/engine.js'),original=qaScene.reader,rows=[];
   try{for(const index of [0,1]){
    original.start(index?'alice-c3-side-14':'alice-c3-who-12');qaScene.draw();const frame=JSON.stringify(qaScene.framing),pixels=qaScene.surface.context.getImageData(0,0,1664,936).data.slice();
    const seq=videoSequence(original.story,index),fade=seq.story.steps.find(s=>s.sceneIndex===index&&s.exportPhase==='fade'),e=new ReaderEngine(seq.story);e.start(fade.id);qaScene.reader=e;qaScene.draw();
    const actual=qaScene.surface.context.getImageData(0,0,1664,936).data;if(pixels.some((v,i)=>v!==actual[i])||JSON.stringify(qaScene.framing)!==frame)throw Error('Export fade resets scene '+index);
    rows.push({scene:index+1,fadeHoldsFinalPixels:true});qaScene.reader=original;
   }}finally{qaScene.reader=original;}return rows;
  });
  report.cases.push({layout,...result,modes,exportHolds});await context.close();console.log('PASS C3-S2',layout.name);
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.resources,[]);report.passed=true;
}finally{await browser.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}
