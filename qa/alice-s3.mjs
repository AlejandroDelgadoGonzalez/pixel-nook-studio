import {officialLayouts,officialSizes} from './official-layouts.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {launch,openCase,preparePassage} from './helpers/browser.mjs';
import {storyCases} from './helpers/story-cases.mjs';
import {output} from './config.mjs';
await fs.mkdir(output,{recursive:true});
const report={errors:[],resources:[],layouts:[],issues:[]},browser=await launch();
try{
 const item=(await storyCases()).find(c=>c.slug==='alice-in-wonderland');assert(item);
 for(const layout of officialLayouts){
  const {page,context}=await openCase(browser,item,layout,report);
  const result=await page.evaluate(async()=>{
   const s=qaScene,e=s.reader,issues=[],rows=[];
   const sample=(id,p)=>{e.start(id);e.paused=false;e.tick(e.step.duration*p*(1-1e-9));e.paused=true;e.onChange('back');s.draw(0,true);s.game.step(performance.now(),0);};
   const pixels=texture=>{const im=texture.getSourceImage();return{w:im.width,h:im.height,data:im.getContext('2d').getImageData(0,0,im.width,im.height).data};};
   const coverage=(actor,mask,map)=>{
    const sprite=s.people[actor].actor,tex=pixels(sprite.texture),rim=pixels(mask.texture);let visible=0,opaque=0,roofLeaks=0;
    for(let y=0;y<tex.h;y++)for(let x=0;x<tex.w;x++)if(tex.data[(y*tex.w+x)*4+3]>80){
     const wx=sprite.x+(x+.5-tex.w/2)*sprite.scaleX,wy=sprite.y+(y+.5-tex.h)*sprite.scaleY,sx=Math.floor((wx-map.translateX)/map.scaleX),sy=Math.floor((wy-map.translateY)/map.scaleY);
     const a=mask.visible&&sx>=0&&sy>=0&&sx<rim.w&&sy<rim.h?rim.data[(sy*rim.w+sx)*4+3]:0;opaque++;if(a<255)visible++;
     if(actor==='alice'&&wx>=s.s3.exteriorContinuation.occluder.crossingPlaneWorldX&&sy<211&&a<255)roofLeaks++;
    }
    return{visible,opaque,roofLeaks};
   };
   let entrySamples=0,entryRoofLeaks=0,entryFirst,entryLast;
   for(let i=0;i<=100;i++){sample('alice-c1-s3-finish-entry',i/100);const r=coverage('alice',s.entryContinuation,s.s2.mapping.sourceToWorld);entryRoofLeaks+=r.roofLeaks;if(i===0)entryFirst=r.visible;if(i===100)entryLast=r.visible;entrySamples++;}
   if(entryFirst<=0||entryLast!==0||entryRoofLeaks)issues.push({kind:'entry-occlusion',entryFirst,entryLast,entryRoofLeaks});
   let turnFirstHidden=null,reappearances=0,earlyOcclusion=0,turnLast;
   const route=s.tunnel.geometry.walkPaths['rabbit-inner-bend'],turn=s.tunnel.geometry.anchors['R1-inner-turn'].point,turnIndex=route.waypoints.findIndex(p=>p[0]===turn[0]&&p[1]===turn[1]),threshold=route.commonProgressKnots[turnIndex];
   for(let i=0;i<=200;i++){
    const f=i/200;sample('alice-c1-s3-paired-travel',f);const r=coverage('white-rabbit',s.tunnel.buttress,{scaleX:2,scaleY:2,translateX:0,translateY:0});
    if(f<threshold&&s.tunnel.buttress.visible)earlyOcclusion++;if(r.visible===0&&turnFirstHidden===null)turnFirstHidden=f;if(turnFirstHidden!==null&&r.visible>0)reappearances++;if(i===200)turnLast=r.visible;
   }
   if(earlyOcclusion||reappearances||turnLast!==0||turnFirstHidden<threshold)issues.push({kind:'rabbit-bend',earlyOcclusion,reappearances,turnLast,turnFirstHidden,threshold});
   // Actual renderer continuity: the last S2 image and first S3 image must match.
   sample('alice-c1-s2-hook-torso',1);const before=new Uint8ClampedArray(s.game.canvas.getContext('2d').getImageData(0,0,s.scale.width,s.scale.height).data);
   e.paused=false;e.tick(.01);e.paused=true;s.draw(0,false);s.game.step(performance.now(),0);const after=s.game.canvas.getContext('2d').getImageData(0,0,s.scale.width,s.scale.height).data;
   let changed=0;for(let i=0;i<before.length;i++)if(before[i]!==after[i])changed++;
   if(changed||e.step.id!=='alice-c1-s3-finish-entry'||s.shotDissolve.active)issues.push({kind:'boundary-reset',changed,id:e.step.id,dissolve:s.shotDissolve.active});
   // Advance with real drawing between ticks, so the whole-shot snapshot is
   // taken from a completely crossed exterior, not an arbitrary cached frame.
   while(e.step.id!=='alice-c1-s3-interior'){
    const dt=Math.min(20,e.step.duration-e.elapsed);e.paused=false;e.tick(dt);e.paused=true;s.draw(0,false);s.game.step(performance.now(),0);
   }
   const dissolveStart=s.shotDissolve.alpha;
   e.paused=false;e.tick(350);e.paused=true;s.draw(0,false);s.game.step(performance.now(),0);const dissolveMid=s.shotDissolve.alpha;
   const frozen=JSON.stringify(e.model),frozenAlpha=s.shotDissolve.alpha;e.tick(100);s.draw(0,false);if(JSON.stringify(e.model)!==frozen||s.shotDissolve.alpha!==frozenAlpha)issues.push({kind:'dissolve-pause'});
   e.paused=false;e.tick(350);e.paused=true;s.draw(0,false);s.game.step(performance.now(),0);const dissolveEnd=s.shotDissolve.alpha;
   if(dissolveStart<.99||Math.abs(dissolveMid-.5)>.001||dissolveEnd!==0)issues.push({kind:'whole-shot-clock',dissolveStart,dissolveMid,dissolveEnd});
   const {ReaderEngine}=await import('/platform/reader/engine.js'),{videoSequence}=await import('/platform/video/video-sequence.js'),sequence=videoSequence(e.story,1);
   for(const id of ['alice-c1-s3-question','alice-c1-s3-oh','alice-c1-s3-astonishment']){
    const reading=new ReaderEngine(e.story),exported=new ReaderEngine(sequence.story);reading.start(id);exported.start(id);if(JSON.stringify(reading.model)!==JSON.stringify(exported.model))issues.push({kind:'export-reconstruction',id});
    e.start(id);e.paused=true;const checkpoint=e.checkpoint(),restored=new ReaderEngine(e.story);restored.start(checkpoint.line,checkpoint.audioTime);if(JSON.stringify(e.model)!==JSON.stringify(restored.model))issues.push({kind:'saved-reconstruction',id});
   }
   const authored=[...s.tunnel.cells.characters.alice.poses,...s.tunnel.cells.props];let checkedPixels=0;
   for(const cell of authored){const tex=s.textures.get(s.tunnel.normalized[cell.pose].key),im=pixels(tex);for(let y=0;y<im.h;y++)for(let x=0;x<im.w;x++){
    const index=(y*im.w+x)*4,anchor=((y-y%2)*im.w+x-x%2)*4;checkedPixels++;
    if(im.data[index+3]!==0&&im.data[index+3]!==255)issues.push({kind:'pose-partial-alpha',pose:cell.pose});
    for(let c=0;c<4;c++)if(im.data[index+c]!==im.data[anchor+c])issues.push({kind:'pose-grid',pose:cell.pose});
   }}
   let prehookSamples=0,prematureShelf=0;
   const surfaces=s.tunnel.geometry.surfaces,objects=[surfaces['first-shelf'].sourcePlatformBounds,surfaces['first-shelf'].sourceJarBounds];
   for(const step of e.story.steps.filter(x=>x.id.startsWith('alice-c1-s3-')&&x.type==='action'&&!x.id.includes('-hook-'))){
    for(let i=0;i<=20;i++){
     sample(step.id,i/20);if(e.model.environment!=='tunnel-well')continue;const [x,y,w,h]=s.cameraSourceRect.map(v=>v/2);prehookSamples++;
     if(objects.some(([l,t,ow,oh])=>x<l+ow&&x+w>l&&y<t+oh&&y+h>t))prematureShelf++;
    }
   }
   if(prematureShelf)issues.push({kind:'premature-shelf',samples:prematureShelf});
   return{entrySamples,entryRoofLeaks,entryFirst,entryLast,turnFirstHidden,turnLast,earlyOcclusion,reappearances,boundaryPixelChanges:changed,dissolveStart,dissolveMid,dissolveEnd,normalizedPoseCells:authored.length,checkedPixels,prehookSamples,prematureShelf,issues};
  });
  report.layouts.push({layout:layout.name,...result});report.issues.push(...result.issues.map(i=>({layout:layout.name,...i})));
  await preparePassage(page,'alice-c1-s3-astonishment');await page.screenshot({path:path.join(output,`${layout.name}-s3.png`)});await context.close();
 }
 report.passed=report.issues.length===0&&report.errors.length===0&&report.resources.length===0;
}finally{await browser.close();await fs.writeFile(path.join(output,'s3-continuity.json'),JSON.stringify(report,null,2));}
console.log(JSON.stringify(report));assert(report.passed);
