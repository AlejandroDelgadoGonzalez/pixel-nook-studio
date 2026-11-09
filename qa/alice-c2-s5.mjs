import {officialLayouts,officialSizes} from './official-layouts.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {launch,openCase,preparePassage} from './helpers/browser.mjs';
import {storyCases} from './helpers/story-cases.mjs';
import {inspectViewport} from './checks/viewport-coverage.mjs';
const out=process.env.QA_OUTPUT_DIR||'.artifacts/qa/alice-c2-s5-v3';await fs.mkdir(out,{recursive:true});
const report={scope:'Approved full-room C2-S5: simulated desktop/360/390/430 and9:16, actual renderer/props, every intermediate action, authorized fold zoom, click locks, S4->S5 handoff and reconstruction. MP4 checked separately.',errors:[],resources:[],cases:[]};
const browser=await launch();
try{
 const item=(await storyCases()).find(c=>c.slug==='alice-in-wonderland'&&c.chapter.number===2);
 for(const layout of officialLayouts){
  const {page,context}=await openCase(browser,item,layout,report);await page.evaluate(code=>window.s5Viewport=(0,eval)('('+code+')'),inspectViewport.toString());
  const row=await page.evaluate(()=>{
   const s=qaScene,e=s.reader,steps=e.story.steps.filter(x=>x.sceneIndex===4),issues=[],frames=[],samples=[],rest=[],add=(kind,data)=>issues.push({kind,...data});let maxTeleport=0;
   for(const st of steps.filter(x=>x.type!=='end')){
    const count=st.type==='action'?Math.max(2,Math.ceil(st.duration/100)):1;
    for(let i=0;i<=count;i++){
     e.start(st.id);e.paused=false;if(st.type==='action')e.tick(st.duration*i/count*(1-1e-8));else{e.revealed=st.text.length;e.elapsed=st.readingDurationMs*.5;}e.paused=true;s.draw(0,true);s.game.step(performance.now(),0);s.cameras.main.preRender();
     const d=s5Viewport(s),stage=s.largeStage,f=s.framing;frames.push({moment:st.largeMoment,values:[f.x,f.y,f.z]});
     for(const issue of d.issues)if(!(st.largeMoment===1&&issue.kind==='body-clipped'))add('viewport',{step:st.id,fraction:i/count,issue});
     if(st.type==='action'){
      const before=JSON.stringify(e.model),pos=[e.model.actors.alice.x,e.model.actors.alice.y];const advanced=e.advance(100000+i*1000);if(advanced||JSON.stringify(e.model)!==before)add('action-click-advanced',{step:st.id});e.tick(50);if(JSON.stringify(e.model)!==before)add('pause-drift',{step:st.id});
     }
     const p=stage.props,table=stage.g.architecture.table;
     if(st.largeMoment>=4&&st.largeMoment<=7&&st.type==='text')for(const name of ['fan','gloves'])if(p[name].depth!==table.depth+1)add('prop-depth',{step:st.id,name,depth:p[name].depth});
     if(st.largeMoment>=11){const b=p.bottle;rest.push([b.x,b.y,b.scaleX,b.rotation,b.flipX,b.alpha,b.depth]);}
     if(st.largeMoment>=16){const src=stage.bg.texture.getSourceImage(),c=document.createElement('canvas');c.width=1664;c.height=936;const cx=c.getContext('2d');cx.drawImage(src,0,0);const blue=[...cx.getImageData(649,440,1,1).data],gray=[...cx.getImageData(798,551,1,1).data];if(blue[2]<=blue[0]||gray.slice(0,3).every(v=>v===0))add('bad-contact-background',{blue,gray});}
     samples.push({step:st.id,moment:st.largeMoment,fraction:i/count,captionClearance:Math.min(...d.bodies.map(b=>b.captionClearance)),frame:{...f}});
    }
   }
   const frame0=frames[0].values,final=frames.find(f=>f.moment>=14).values;for(const f of frames){const expected=f.moment<=12?frame0:f.moment>=14?final:null;if(expected&&f.values.some((v,i)=>Math.abs(v-expected[i])>1e-7))add('camera-drift-outside-authorized-fold',{f,expected});}
   const rest0=JSON.stringify(rest[0]);if(rest.some(x=>JSON.stringify(x)!==rest0))add('resting-bottle-changed',{});
   // Read the whole compiled chapter: no intermediate ending, both modes.
   const continuity=[];
   for(const auto of [false,true]){if(!document.querySelector('#ending').hidden)document.querySelector('#again').click();e.sceneGate=false;e.setAuto(auto);e.start();document.querySelector('#ending').hidden=true;const scenes=[];let guard=0;while(e.running){if(++guard>3000)throw Error('continuity loop');const p=e.step;if(scenes.at(-1)!==p.sceneIndex)scenes.push(p.sceneIndex);if(!document.querySelector('#ending').hidden)add('premature-ending',{id:p.id,auto});if(p.type==='action')e.tick(p.duration);else if(auto)e.tick(p.readingDurationMs||100000);else{e.revealed=p.text.length;if(e.visualMotionRemainingMs)e.tick(e.visualMotionRemainingMs);e.advance(guard*1000);}s.draw(0,true);s.game.step(performance.now(),0);s.cameras.main.preRender();}continuity.push({auto,scenes,last:e.step.id});if(JSON.stringify(scenes)!==JSON.stringify(e.story.scenes.map((_,i)=>i)))add('scene-order',{auto,scenes});}
   // Text clicks must not finish a hidden route or jump the actor.
   for(const st of steps.filter(x=>x.type==='text')){e.start(st.id);e.paused=false;e.revealed=st.text.length;s.draw(0,true);const before=[e.model.actors.alice.x,e.model.actors.alice.y];e.advance(999999);s.draw(0,true);const after=[e.model.actors.alice.x,e.model.actors.alice.y];const delta=Math.hypot(after[0]-before[0],after[1]-before[1]);maxTeleport=Math.max(maxTeleport,delta);if(delta>2.001)add('text-click-teleport',{id:st.id,delta});}
   return{issues,samples:samples.length,minimumCaptionClearance:Math.min(...samples.map(x=>x.captionClearance)),maxTeleport,frame:frame0,continuity};
  });
  await preparePassage(page,'alice-c2-large-04');await page.screenshot({path:out+'/'+layout.name+'-table.png'});
  await preparePassage(page,'alice-c2-large-21');await page.screenshot({path:out+'/'+layout.name+'-giant.png'});
  report.cases.push({layout,...row});await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));console.log(layout.name,row.samples,'samples',row.issues.length,'issues');assert.deepEqual(row.issues,[]);await context.close();
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.resources,[]);report.passed=true;
}catch(error){report.passed=false;report.failure=error.stack;console.error(error);process.exitCode=1;}
finally{await browser.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}
