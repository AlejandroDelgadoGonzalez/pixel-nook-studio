import fs from 'node:fs/promises';import assert from 'node:assert/strict';
import {launch,openCase} from './helpers/browser.mjs';import {storyCases} from './helpers/story-cases.mjs';import {officialLayouts} from './official-layouts.mjs';
const out=process.env.QA_OUTPUT_DIR||'.artifacts/qa/c3-s4/regression';await fs.mkdir(out,{recursive:true});const browser=await launch(),report={errors:[],resources:[],cases:[]};
try{
 const item=(await storyCases()).find(c=>c.slug==='alice-in-wonderland'&&c.chapter.number===3);
 for(const layout of officialLayouts){const {page,context}=await openCase(browser,item,layout,report);
 for(const mode of ['auto','portrait','landscape']){
  await page.click('#show-controls');await page.selectOption('#aspect-ratio',mode);await page.click('#close-settings');
  const result=await page.evaluate(()=>{
   const e=qaScene.reader,scenes=[0,1,2].map(scene=>({scene,samples:0,spoken:0}));
   for(const st of e.story.steps.filter(s=>s.sceneIndex<3&&s.type!=='end'))for(const fraction of [0,.001,.2,.5,.8,.999]){
    e.start(st.id);e.paused=false;e.tick((st.duration||st.readingDurationMs)*fraction);e.paused=true;e.onChange('back');qaScene.draw();
    const s=qaScene.current,f=qaScene.framing,w=qaScene.scale.width,h=qaScene.scale.height,card=document.querySelector('#dialogue'),shown=getComputedStyle(card).opacity==='1',button=document.querySelector('#text-button');
    const expected=st.type==='text'&&e.elapsed>=(st.captionStartMs||0)&&!e.visualMotionRemainingMs;
    if(shown!==expected||shown&&(button.disabled||getComputedStyle(button).cursor!=='pointer'||e.revealed!==st.text.length||qaScene.cameraReframing))throw Error('Regression card '+st.id);
    for(const b of [s.aliceBounds,...(!s.mask?[s.caterpillarBounds]:[])]){
     const l=(b.left-f.x)*f.z+w/2,r=(b.right-f.x)*f.z+w/2,t=(b.top-f.y)*f.z+h/2,bottom=(b.bottom-f.y)*f.z+h/2;
     if(l<-.5||r>w+.5||t<-.5||bottom>h+.5)throw Error('Regression clipping '+st.id);
    }
    if(s.scene===3&&s.walking&&(s.renderedPose!=='right'||s.mirror!==(s.beat===4)))throw Error('Regression moonwalk/run');
    const row=scenes[st.sceneIndex];row.samples++;if(shown)row.spoken++;
   }
   return scenes;
  });report.cases.push({layout,mode,scenes:result});
 }
 await context.close();console.log('PASS regression S1..S3 three aspects',layout.name);
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.resources,[]);report.passed=true;
}finally{await browser.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}
