import {officialLayouts,officialSizes} from './official-layouts.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {launch,openCase,preparePassage} from './helpers/browser.mjs';
import {storyCases} from './helpers/story-cases.mjs';
import {inspectViewport} from './checks/viewport-coverage.mjs';
import {output} from './config.mjs';
await fs.mkdir(output,{recursive:true});
const report={errors:[],resources:[],layouts:[],issues:[]},browser=await launch();
try{
 const item=(await storyCases()).find(c=>c.slug==='alice-in-wonderland');assert(item);
 for(const layout of officialLayouts){
  const {page,context}=await openCase(browser,item,layout,report);
  await page.evaluate(code=>window.qaInspectViewport=(0,eval)('('+code+')'),inspectViewport.toString());
  const result=await page.evaluate(async()=>{
   const s=qaScene,e=s.reader,issues=[],rows=[];const zooms=new Set();let samples=0,collisions=0,captionClearance=Infinity,jarDistance=0,headResidual=0,jarShelfHits=0,eyeOcclusions=0;
   const sample=(id,p)=>{e.start(id);e.paused=false;if(e.step.type==='action')e.tick(e.step.duration*p*(1-1e-9));e.paused=true;e.onChange('back');s.draw(0,true);s.game.step(performance.now(),0);};
   sample('alice-c1-s3-hook-3',1);const before=new Uint8ClampedArray(s.game.canvas.getContext('2d').getImageData(0,0,s.scale.width,s.scale.height).data),prior=structuredClone(e.model);
   e.paused=false;e.tick(.01);e.paused=true;s.draw(0,true);s.game.step(performance.now(),0);const after=s.game.canvas.getContext('2d').getImageData(0,0,s.scale.width,s.scale.height).data;let changed=0;for(let i=0;i<before.length;i++)if(before[i]!==after[i])changed++;
   if(changed||s.shotDissolve.active)issues.push({kind:'S3-S4-boundary',changed,dissolve:s.shotDissolve.active});
   for(const action of e.story.steps.filter(x=>x.id.startsWith('alice-c1-s4-')&&x.type==='action')){
    const n=Math.max(2,Math.ceil(action.duration/40));
    for(let i=0;i<=n;i++){
     sample(action.id,i/n);if(e.model.environment!=='well-bottom')continue;samples++;const d=s.diagnostics(),m=e.model,p=s.emptyJar.prop(),sprite=s.people.alice.actor,im=sprite.texture.getSourceImage(),data=im.getContext('2d').getImageData(0,0,im.width,im.height).data;
     if(!action.id.includes('hook-compress')&&!action.id.includes('hook-settle')){
      let sumX=0,sumY=0,n=0;for(let y=35;y<72;y++)for(let x=85;x<135;x++){const j=(y*im.width+x)*4;if(data[j+3]>80&&data[j]<35&&data[j+1]<35&&data[j+2]<35){sumX+=x+.5;sumY+=y+.5;n++;}}
      const offset=[(sumX/n-im.width*sprite.originX)*.732,(sumY/n-im.height*sprite.originY)*.732],expected=[(110.36619718309859-85)*.732,(54.41549295774648-182)*.732];headResidual=Math.max(headResidual,Math.hypot(offset[0]-expected[0],offset[1]-expected[1]));
      if(['approach','pickup','clear-upper','clear-upper-end','inspect','choice','place-approach','place-contact','withdraw','clear-lower','careful'].some(k=>action.id==='alice-c1-s4-'+k)&&Math.abs(m.actors.alice.x-s.emptyJar.geometry.interactionContinuity.columnSourceX*2)>1e-8)issues.push({kind:'lateral-prop-detour',action:action.id});
     }
     if(p.owner==='alice'){const jar=s.objects.jar,im=jar.texture.getSourceImage(),eye=[sprite.x+(110.36619718309859-85)*.732,sprite.y+(54.41549295774648-182)*.732],tx=Math.floor((eye[0]-jar.x)/.732+im.width*jar.originX),ty=Math.floor((eye[1]-jar.y)/.732+im.height*jar.originY);if(tx>=0&&ty>=0&&tx<im.width&&ty<im.height&&im.getContext('2d').getImageData(tx,ty,1,1).data[3]>80)eyeOcclusions++;}
     if(p.owner==='alice'&&['alice-c1-s4-clear-upper','alice-c1-s4-clear-upper-end','alice-c1-s4-place-approach'].includes(action.id)){
      const prop=s.objects.jar,img=prop.texture.getSourceImage(),pixels=img.getContext('2d').getImageData(0,0,img.width,img.height).data;
      for(let y=0;y<img.height;y++)for(let x=0;x<img.width;x++)if(pixels[(y*img.width+x)*4+3]>80){const wx=(prop.x+(x+.5-img.width*prop.originX)*.732)/2,wy=(prop.y+(y+.5-img.height*prop.originY)*.732)/2;for(const[l,t,r,b]of [[1108,666,1312,697],[1110,1148,1314,1176]])if(wx>=l&&wx<r&&wy>t+.5&&wy<b)jarShelfHits++;}
     }
     zooms.add(s.cameras.main.zoom);const v=qaInspectViewport(s);if(v.issues.length)issues.push({kind:'viewport',action:action.id,p:i/n,issues:v.issues});if(v.panelVisible)captionClearance=Math.min(captionClearance,...v.bodies.map(b=>b.captionClearance));
     if(sprite.scaleX!==.732||sprite.scaleY!==.732)issues.push({kind:'scale',action:action.id});
     for(let y=0;y<im.height;y++)for(let x=0;x<im.width;x++)if(data[(y*im.width+x)*4+3]>80){const wx=(sprite.x+(x+.5-im.width*sprite.originX)*sprite.scaleX)/2,wy=(sprite.y+(y+.5-im.height*sprite.originY)*sprite.scaleY)/2;for(const [l,t,r,b]of [[1108,666,1312,697],[1110,1148,1314,1176]])if(wx>=l&&wx<r&&wy>=t&&wy<b)collisions++;}
     if(p.visible&&p.owner==='alice'){
      const c=s.emptyJar.cells[s.emptyJar.pose()],o=s.emptyJar.origin(),hand=s.emptyJar.handAnchor(),target=[sprite.x+(hand[0]-c.normalizedSize[0]*o[0])*.732,sprite.y+(hand[1]-c.normalizedSize[1]*o[1])*.732];jarDistance=Math.max(jarDistance,Math.hypot(target[0]-p.point[0],target[1]-p.point[1]));
      if(!s.objects.jar.visible||s.background!==s.emptyJar.backgrounds['empty-upper'])issues.push({kind:'held-representation',action:action.id});
     }
     if(m.actors.sister.x!==810||m.actors.sister.y!==650||m.book.owner!=='sister'||m.actors['white-rabbit'].visible!==0)issues.push({kind:'offstage-presence'});
     const frozen=JSON.stringify(m),time=e.totalTime;e.tick(50);s.draw(0);if(JSON.stringify(m)!==frozen||e.totalTime!==time)issues.push({kind:'pause'});
    }
    rows.push({id:action.id,samples:n+1});
   }
   if(eyeOcclusions)issues.push({kind:'held-jar-covers-alice-eye',samples:eyeOcclusions});if(headResidual>1.5)issues.push({kind:'visual-head-position-snap',maximumWorld:headResidual});if(jarShelfHits)issues.push({kind:'carried-jar-through-shelf',opaquePixelHits:jarShelfHits});
   const transfers=[];for(const id of ['alice-c1-s4-pickup','alice-c1-s4-place-contact']){sample(id,0);const from=s.emptyJar.prop().bounds;sample(id,1);e.paused=false;e.tick(.001);e.paused=true;s.draw(0,true);const to=s.emptyJar.prop().bounds,delta=Math.max(...from.map((v,i)=>Math.abs(to[i]-v)));transfers.push({id,maximumBoundDeltaWorld:delta});if(delta>2)issues.push({kind:'jar-contact-snap',id,delta});}
   const cameraBoundaries=[];for(const [from,to]of [['clear-upper','clear-upper-end'],['clear-upper-end','inspect'],['withdraw','clear-lower'],['clear-lower','careful']]){sample('alice-c1-s4-'+from,1);const a={...s.framing};sample('alice-c1-s4-'+to,0);const b=s.framing,delta={x:Math.abs(a.x-b.x),y:Math.abs(a.y-b.y),zoom:Math.abs(a.z-b.z)};cameraBoundaries.push({from,to,delta});if(delta.x>1e-4||delta.y>1e-4||delta.zoom>1e-6)issues.push({kind:'prop-interaction-camera-cut',from,to,delta});}
   if(collisions)issues.push({kind:'body-through-shelf',opaquePixelHits:collisions});if(jarDistance>Math.SQRT2+.00001)issues.push({kind:'jar-hand-distance',jarDistance});
   const {ReaderEngine}=await import('/platform/reader/engine.js'),{videoSequence}=await import('/platform/video/video-sequence.js'),seq=videoSequence(e.story,1);
   for(const step of e.story.steps.filter(x=>x.id.startsWith('alice-c1-s4-')&&x.type==='text')){const a=new ReaderEngine(e.story),b=new ReaderEngine(seq.story);a.start(step.id);b.start(step.id);if(JSON.stringify(a.model)!==JSON.stringify(b.model))issues.push({kind:'export-reconstruction',id:step.id});sample(step.id,0);zooms.add(s.cameras.main.zoom);e.revealed=e.step.text.length;e.onChange('back');s.draw(0,true);s.game.step(performance.now(),0);const inspection=qaInspectViewport(s);if(inspection.issues.length)issues.push({kind:'text-viewport',id:step.id,issues:inspection.issues});captionClearance=Math.min(captionClearance,...inspection.bodies.map(b=>b.captionClearance));const checkpoint=e.checkpoint(),c=new ReaderEngine(e.story);c.start(checkpoint.line,checkpoint.audioTime);if(JSON.stringify(c.model)!==JSON.stringify(e.model))issues.push({kind:'save-reconstruction',id:step.id});}
   if(zooms.size!==1)issues.push({kind:'intra-scene-zoom-change',values:[...zooms]});
   const duration=e.story.steps.filter(x=>x.id.startsWith('alice-c1-s4-hook')).reduce((a,b)=>a+b.duration,0);if(duration!==3000)issues.push({kind:'hook-duration',duration});
   e.start('alice-c1-well-end');s.draw(0,true);if(e.model.jar.owner!==null||e.model.jar.state!=='lower-fixed'||e.model.staging.alice!=='seated-braced'||e.model.actors.alice.x!==2160||e.model.actors.alice.y!==3328)issues.push({kind:'final-state'});
   return{samples,rows,sceneZooms:[...zooms],maximumRegisteredHeadResidualWorld:headResidual,carriedJarShelfOpaquePixelHits:jarShelfHits,heldJarEyeOcclusions:eyeOcclusions,transfers,cameraBoundaries,boundaryPixelChanges:changed,bodyShelfOpaquePixelHits:collisions,maximumHandPinRoundingWorld:jarDistance,minimumCaptionClearance:captionClearance,openingReplayDuration:seq.openingReplayDurationMs,closingDuration:duration,issues};
  });
  report.layouts.push({layout:layout.name,...result});report.issues.push(...result.issues.map(x=>({layout:layout.name,...x})));
  for(const id of ['alice-c1-s4-empty','alice-c1-s4-stay','alice-c1-s4-narration']){await preparePassage(page,id);if(['phone390','desktop'].includes(layout.name))await page.screenshot({path:path.join(output,`${layout.name}-${id}.png`)});}
  await context.close();
 }
 report.passed=!report.issues.length&&!report.errors.length&&!report.resources.length;
}finally{await browser.close();await fs.writeFile(path.join(output,'s4-motion-continuity.json'),JSON.stringify(report,null,2));}
console.log(JSON.stringify({passed:report.passed,layouts:report.layouts.map(x=>({layout:x.layout,samples:x.samples,boundaryPixelChanges:x.boundaryPixelChanges,bodyShelfOpaquePixelHits:x.bodyShelfOpaquePixelHits,minimumCaptionClearance:x.minimumCaptionClearance})),issues:report.issues.slice(0,10),errors:report.errors}));assert(report.passed);
