import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {launch,openCase,preparePassage} from './helpers/browser.mjs';
import {storyCases} from './helpers/story-cases.mjs';
const out=process.env.QA_OUTPUT_DIR||'.artifacts/qa/alice-in-wonderland/chapter-2-scene-1/locks';await fs.mkdir(out,{recursive:true});
const report={scope:'Current C2-S1 actual cropped prop signatures and full texture pixels; UI lock; action input rejection; scene-only completion',errors:[],resources:[]},browser=await launch();
try{
 const cases=await storyCases(),old=await openCase(browser,cases.find(x=>x.slug==='alice-in-wonderland'&&x.chapter.number===1),{width:390,height:844},report);
 const metrics=()=>{const el=document.querySelector('#dialogue'),r=el.getBoundingClientRect(),c=getComputedStyle(el),t=getComputedStyle(document.querySelector('#text'));return{x:r.x,y:r.y,w:r.width,h:r.height,padding:c.padding,font:t.fontSize,lineHeight:t.lineHeight};};
 await preparePassage(old.page,await old.page.evaluate(()=>qaScene.reader.story.steps.find(x=>x.type==='text').id));
 // Use the actual original first-scene DOM as the UI reference.
 report.originalUI=await old.page.evaluate(metrics);await old.context.close();
 const {page,context}=await openCase(browser,cases.find(x=>x.slug==='alice-in-wonderland'&&x.chapter.number===2),{width:390,height:844},report);
 report.locks=await page.evaluate(({reference,metrics})=>{
  const ui=(0,eval)('('+metrics+')'),e=qaScene.reader,s=qaScene,ids=['key','cork','box','lid','bottle','fan','gloves','table','tears'],issues=[];
  const signature=p=>{const im=p.texture.getSourceImage(),c=document.createElement('canvas');c.width=im.width;c.height=im.height;c.getContext('2d').drawImage(im,0,0);const bytes=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let hash=2166136261;for(const v of bytes)hash=Math.imul(hash^v,16777619)>>>0;return JSON.stringify({texture:p.texture.key,frame:p.frame.name,origin:[p.originX,p.originY],xy:[p.x,p.y],scale:[p.scaleX,p.scaleY],rotation:p.rotation,flip:[p.flipX,p.flipY],alpha:p.alpha,visible:p.visible,depth:p.depth,crop:p.isCropped?{x:p._crop.x,y:p._crop.y,width:p._crop.width,height:p._crop.height}:null,pixelHash:hash});};
  const draw=()=>{e.onChange('back');s.draw(0,true);s.game.step(performance.now(),0);};e.start();e.paused=true;draw();const initial=Object.fromEntries(ids.map(id=>[id,signature(s.objects[id])]));let samples=0,rejectedActionClicks=0;
  for(const step of e.story.steps.filter(x=>x.type!=='end')){
   const n=step.type==='action'?Math.max(1,Math.ceil(step.duration/100)):0;
   for(let i=0;i<=n;i++){
    e.start(step.id);e.paused=false;if(n)e.tick(step.duration*i/n*(1-1e-8));else e.revealed=step.text.length;e.paused=true;draw();samples++;
    for(const id of ids)if(signature(s.objects[id])!==initial[id])issues.push({kind:'prop-full-signature-or-pixel-change',id,step:step.id,i});
    if(JSON.stringify(ui())!==JSON.stringify(reference))issues.push({kind:'original-ui-lock',step:step.id});
    if(step.type==='action'){const before=JSON.stringify(e.model);e.paused=false;e.lastTap=-Infinity;const accepted=e.advance(100000+samples*1000);e.paused=true;if(accepted||before!==JSON.stringify(e.model)||!document.querySelector('#dialogue').classList.contains('inactive'))issues.push({kind:'action-advance-exposed',step:step.id});else rejectedActionClicks++;}
   }
  }
  e.start(e.story.steps.at(-1).id);const story=e.story,completion={label:document.querySelector('#ending .eyebrow').textContent,sceneFlag:localStorage.getItem('betweenlines:scene-finished:'+story.id+':chapter-2:alice-c2-a-way-out'),chapterFlag:localStorage.getItem('betweenlines:chapter-finished:'+story.id+':chapter-2'),storyFlag:localStorage.getItem('betweenlines:finished:'+story.id)};
  if(completion.label!=='SCENE COMPLETE'||completion.sceneFlag!=='true'||completion.chapterFlag||completion.storyFlag)issues.push({kind:'false-chapter-or-story-completion',completion});
  return{samples,fullPropComparisons:samples*ids.length,rejectedActionClicks,completion,issues};
 },{reference:report.originalUI,metrics:metrics.toString()});
 assert.deepEqual(report.locks.issues,[]);assert.deepEqual(report.errors,[]);assert.deepEqual(report.resources,[]);report.passed=true;await context.close();
}finally{await browser.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}
assert(report.passed);console.log(JSON.stringify({passed:true,...report.locks}));
