import {drawCharacter} from '../../../platform/rendering/character-art.js';
const PREFIX='alice-riverbank',snap=n=>Math.round(n/2)*2,clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),smooth=t=>t*t*(3-2*t);
const union=boxes=>[Math.min(...boxes.map(b=>b[0])),Math.min(...boxes.map(b=>b[1])),Math.max(...boxes.map(b=>b[2])),Math.max(...boxes.map(b=>b[3]))];

// A measured environment layer inside the existing scene. Durable positions and
// timing remain in chapter data, shared by reading, reconstruction and export.
export class TunnelWell {
 constructor(scene,geometry,cells){
  this.scene=scene;this.document=geometry;this.geometry=geometry.environments['tunnel-well'];this.cells=cells;this.normalized={...scene.normalized.alice};this.people={};this.objects={};
  const g=this.geometry,[x,y,w,h]=g.worldBounds;
  // The first jar is a single prop at the accessible shelf edge, in S3 and S4.
  const clean=scene.textures.createCanvas('alice-upper-jar-free',1672,941),plate=scene.textures.get(PREFIX+'-source-s4-2').getSourceImage();clean.context.imageSmoothingEnabled=false;clean.context.drawImage(scene.textures.get(PREFIX+'-source-tunnel-well').getSourceImage(),0,0);clean.context.drawImage(plate,1158,636,38,38,1158,636,38,38);clean.refresh();
  this.background=scene.add.image(x,y,'alice-upper-jar-free').setOrigin(0).setDisplaySize(w,h).setDepth(0);
  const jar=scene.textures.createCanvas('alice-upper-edge-jar',74,82);drawCharacter(jar.context,scene.textures.get(PREFIX+'-source-s4-1').getSourceImage(),207,163,394,438,74,82);jar.refresh();
  this.edgeJar=scene.add.image(...scene.cache.json.get(PREFIX+'-s4-geometry').anchors['J0-upper-base'].point,'alice-upper-edge-jar').setOrigin(.5,1).setScale(.732).setDepth(990);
  for(const cell of [...cells.characters.alice.poses,...cells.props]){
   const [l,t,r,b]=cell.sourceBoundsExclusive,[pw,ph]=cell.normalizedSize,key='alice-tunnel-'+cell.pose,tex=scene.textures.createCanvas(key,pw,ph);
   drawCharacter(tex.context,scene.textures.get(PREFIX+'-source-'+(cell.masterCharacter?cell.asset:'alice-s3')).getSourceImage(),l,t,r-l,b-t,pw,ph);tex.refresh();
   this.normalized[cell.pose]={key,width:pw,height:ph};
  }
  for(const id of ['alice','white-rabbit']){
   this.people[id]={actor:scene.add.image(0,0,scene.normalized[id].right.key).setOrigin(.5,1),shadow:scene.add.ellipse(0,0,g.depthScaling.referenceStandingHeights[id]*.32,g.depthScaling.referenceStandingHeights[id]*.065,0x271a10,1)};
  }
  this.clods=cells.props.map(c=>scene.add.image(0,0,this.normalized[c.pose].key).setOrigin(.5,1).setDepth(990));
  this.buttress=this.foreground('buttress',g.occluders.find(o=>o.id==='rabbit-receding-buttress'));
  this.lip=this.foreground('lip',g.occluders.find(o=>o.id==='crumbly-lip-foreground'));
  this.hide();
 }
 foreground(id,definition){
  const s=this.scene,source=s.textures.get(PREFIX+'-source-tunnel-well').getSourceImage(),key='alice-tunnel-foreground-'+id,tex=s.textures.createCanvas(key,source.width,source.height),ctx=tex.context;
  ctx.save();ctx.beginPath();const points=definition.sourceForegroundPolygon;ctx.moveTo(...points[0]);for(const p of points.slice(1))ctx.lineTo(...p);ctx.closePath();
  if(definition.sourceUpperCoverageBounds)ctx.rect(...definition.sourceUpperCoverageBounds);
  ctx.clip();ctx.drawImage(source,0,0);ctx.restore();tex.refresh();
  const [x,y,w,h]=this.geometry.worldBounds;return s.add.image(x,y,key).setOrigin(0).setDisplaySize(w,h).setDepth(1000);
 }
 hide(){this.background.setVisible(false);this.edgeJar.setVisible(false);for(const p of Object.values(this.people)){p.actor.setVisible(false);p.shadow.setVisible(false);}for(const p of this.clods)p.setVisible(false);this.buttress.setVisible(false);this.lip.setVisible(false);}
 terrainScale(y){const d=this.geometry.depthScaling,c=d.terrainCurve;return clamp(c.scaleAtReference+(y/2-c.sourceReferenceY)*c.slopePerSourceY,c.min,c.max);}
 scale(id){return this.scene.reader.model.s3.falling&&id==='alice'?this.geometry.depthScaling.fallScaleLocked:this.terrainScale(this.scene.reader.model.actors[id].y)*this.geometry.depthScaling.actorGain[id];}
 pose(id){const s=this.scene.reader.step,m=this.scene.reader.model,p=s?.duration?this.scene.reader.elapsed/s.duration:1;
  if(id==='white-rabbit')return m.actors[id].pose==='walk'?m.actors[id].facing:'right';
  if(s?.id==='alice-c1-s3-rise')return p<.35?'crawl-inside':p<.78?'burrow-kneel':'standing-ready';
  return m.actors.alice.pose==='walk'?m.actors.alice.facing:m.staging.alice;
 }
 hookTime(){const e=this.scene.reader,s=e.step;return s?.motion?.hookFromMs!==undefined?s.motion.hookFromMs+Math.min(s.duration,e.elapsed):e.model.s3.hookMs;}
 dimensions(id,pose){return id==='alice'?(this.normalized[pose]||this.normalized.right):this.scene.normalized[id][pose]||this.scene.normalized[id].right;}
 body(id,point,pose,fall=false){const size=this.dimensions(id,pose),scale=fall?this.geometry.depthScaling.fallScaleLocked:this.terrainScale(point[1])*this.geometry.depthScaling.actorGain[id];return[point[0]-size.width*scale/2,point[1]-size.height*scale,point[0]+size.width*scale/2,point[1]];}
 requiredRect(view){
  const g=this.geometry,m=this.scene.reader.model,A=k=>g.anchors[k].point;
  if(view==='s3-arrival'){
   const poly=g.occluders.find(o=>o.id==='interior-entry-lintel').worldAperturePolygon;
   const aperture=[Math.min(...poly.map(p=>p[0])),Math.min(...poly.map(p=>p[1])),Math.max(...poly.map(p=>p[0])),Math.max(...poly.map(p=>p[1]))];
   return union([this.body('alice',A('A0-crawl-clear'),'standing-ready'),this.body('white-rabbit',A('R0-ahead'),'right'),aperture]);
  }
  if(view==='s3-question')return union([this.body('alice',A('A0-crawl-clear'),'standing-ready'),this.body('white-rabbit',A('R0-ahead'),'right')]);
  if(view==='s3-travel')return union(['alice','white-rabbit'].map(id=>{const a=m.actors[id],b=this.body(id,[snap(a.x),snap(a.y)],this.pose(id)),extra=6*this.scale(id);return[b[0]-extra,b[1],b[2]+extra,b[3]];}));
  if(['s3-lip','s3-drop'].includes(view))return union([this.body('alice',A('A1-lip-support'),'support-loss',true),this.body('alice',A('A2-clear-of-earth'),'support-loss',true),this.body('alice',A('A3-first-drop'),'slow-descent',true)]);
  if(view==='s3-hook-end')return union([this.body('alice',A('A5-hook-end'),'slow-descent',true),g.cameras.hookEndRevealBoundsSource.map(v=>v*2)]);
  return this.body('alice',A('A4-slow-fall'),'slow-descent',true);
 }
 frame(view,caption=true){
  const s=this.scene,w=s.scale.width,h=s.scale.height,[ax,ay,aw,ah]=this.geometry.worldBounds,[l,t,r,b]=this.requiredRect(view);
  const padding=12,coverage=1,reading=caption?Math.min(h,s.readingHeight||h):h;
  const sw=s.safeWidth||w,offset=s.safeCenterOffset||0,sl=w/2-offset-sw/2+padding,sr=w/2-offset+sw/2-padding;
  const st=Math.max(77,s.safeTopInset||0)+padding,sb=Math.max(st+1,reading-padding);
  const min=Math.max((w+2*coverage)/aw,(h+2*coverage)/ah,(sl+coverage)/(l-ax),(w-sr+coverage)/(ax+aw-r),(st+coverage)/(t-ay),(h-sb+coverage)/(ay+ah-b));
  const max=Math.min((sr-sl)/(r-l),(sb-st)/(b-t)),fits=min<=max+.00001,z=view==='s3-hook-end'&&s.emptyJar?s.emptyJar.lockedZoom():Math.max(min,Math.min(max,h/1200));
  let minX=ax+(w/2+coverage)/z,maxX=ax+aw-(w/2+coverage)/z,minY=ay+(h/2+coverage)/z,maxY=ay+ah-(h/2+coverage)/z;
  if(fits){minX=Math.max(minX,r+(w/2-sr)/z);maxX=Math.min(maxX,l+(w/2-sl)/z);minY=Math.max(minY,b+(h/2-sb)/z);maxY=Math.min(maxY,t+(h/2-st)/z);}
  const preferredX=w/h>=1.6?1600:(l+r)/2,top=view==='s3-hook-end'?180:0;
  return{x:clamp(preferredX+offset/z,minX,maxX),y:clamp(top+h/(2*z),minY,maxY),z,fits,minimum:min,maximum:max,view};
 }
 mix(from,to,p){const t=smooth(clamp(p,0,1)),h=this.scene.scale.height,viewH=h/from.z+(h/to.z-h/from.z)*t;return{x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t,z:h/viewH,fits:from.fits&&to.fits};}
 frameViewport(){
  const s=this.scene,e=s.reader,m=e.model,step=e.step,view=m.view,caption=['s3-question','s3-lip','s3-drop','s3-last-text'].includes(view),hook=view==='s3-hook'||this.hookTime()>0;
  let f;
  if(hook){const ms=this.hookTime();f=this.mix(this.frame('s3-last-text',true),this.frame('s3-hook-end',false),Math.max(0,(ms-1200)/1800));}
  else if(step?.camera?.reframe){const before=e.startModel.view,beforeCaption=['s3-question','s3-lip','s3-drop','s3-last-text'].includes(before);f=this.mix(this.frame(before,beforeCaption),this.frame(view,caption),e.elapsed/step.duration);}
  else f=this.frame(view,caption);
  s.cameraReframing=!!step?.camera?.reframe;s.cameraTracking=view==='s3-travel'?{id:'s3-corridor',departingStationaryActors:[]}:null;s.framing=f;s.activeShot=view;
  s.environmentCameraIssue=f.fits?null:{view,minimum:f.minimum,maximum:f.maximum};
  const w=s.scale.width,h=s.scale.height;s.viewport={x:0,y:0,width:w,height:h};s.cameraSourceRect=[f.x-w/(2*f.z),f.y-h/(2*f.z),w/f.z,h/f.z];
  s.cameras.main.setViewport(0,0,w,h).setZoom(f.z).centerOn(f.x,f.y);
 }
 draw(){
  const s=this.scene,e=s.reader,m=e.model;this.background.setVisible(true);this.edgeJar.setVisible(true);s.people=this.people;s.objects=this.objects;s.background=this.background;
  this.frameViewport();
  for(const[id,person]of Object.entries(this.people)){
   const a=m.actors[id],pose=this.pose(id),size=this.dimensions(id,pose);let key=size.key;
   if(a.pose==='walk'){
    const start=e.startModel.actors[id],points=[[start.x,start.y],...(e.step.paths?.[id]||[]).map(p=>[p.x,p.y])],progress=clamp(e.elapsed/e.step.duration,0,1),knots=e.step.pathProgress?.[id];let distance=0;
    for(let i=1;i<points.length;i++){const lo=knots?.[i-1]??(i-1)/(points.length-1),hi=knots?.[i]??i/(points.length-1);distance+=Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1])*clamp((progress-lo)/(hi-lo),0,1);}
    key=`${PREFIX}-${id}-walk-${a.facing}-${Math.floor(distance/6)%8}`;
   }
   const scale=this.scale(id),flip=id==='alice'&&pose==='slow-descent'&&this.hookTime()<2400;
   person.actor.setVisible(true).setTexture(key).setOrigin(.5,1).setPosition(snap(a.x),snap(a.y)).setScale(scale).setFlipX(flip).setAlpha(a.visible).setDepth(a.y);
   person.shadow.setVisible(!m.s3.falling).setPosition(snap(a.x),snap(a.y)-2*scale).setScale(scale).setAlpha(a.visible*.14).setDepth(a.y-.1);
  }
  const route=this.geometry.walkPaths['rabbit-inner-bend'],turn=this.geometry.anchors['R1-inner-turn'].point;
  const turnIndex=route.waypoints.findIndex(p=>p[0]===turn[0]&&p[1]===turn[1]),turnProgress=route.commonProgressKnots[turnIndex];
  const walking=e.step?.id==='alice-c1-s3-paired-travel',hidden=this.geometry.anchors['R2-hidden'].point;
  this.buttress.setVisible(walking?e.elapsed/e.step.duration>=turnProgress:m.actors['white-rabbit'].x===hidden[0]&&m.actors['white-rabbit'].y===hidden[1]);
  this.lip.setVisible(['alice-c1-s3-clear-edge','alice-c1-s3-first-drop'].includes(e.step?.id));
  const points=this.geometry.fallPaths['alice-support-loss-and-fall'].waypoints.slice(0,3),q=m.s3.clodFall;
  for(const[i,clod]of this.clods.entries()){
   const f=clamp(q*(i?1.2:1),0,1),seg=f<.5?0:1,t=(f-seg*.5)*2,a=points[seg],b=points[seg+1];
   clod.setVisible(m.s3.clodsVisible).setPosition(a[0]+(b[0]-a[0])*t+(i?this.cells.props[i].normalizedSize[0]/2:0),a[1]+(b[1]-a[1])*t).setScale(this.geometry.depthScaling.fallScaleLocked);
  }
 }
 diagnostics(){
  const s=this.scene,m=s.reader.model,f=s.framing,project=(x,y)=>({x:(x-f.x)*f.z+s.scale.width/2,y:(y-f.y)*f.z+s.scale.height/2});
  const actors={};for(const[id,p]of Object.entries(this.people)){const b=p.actor.getBounds(),a=m.actors[id];actors[id]={...project(p.actor.x,p.actor.y),head:project(p.actor.x,b.top),visible:a.visible,pose:this.pose(id),scale:this.scale(id),world:{x:p.actor.x,y:p.actor.y},bounds:{left:project(b.left,b.top).x,right:project(b.right,b.top).x,top:project(b.left,b.top).y,bottom:project(b.left,b.bottom).y}};}
  const c=this.geometry.depthScaling.terrainCurve,reference={alice:this.geometry.anchors['A0-crawl-clear'].point[1],'white-rabbit':this.geometry.anchors['R0-ahead'].point[1]};
  const depthScaling={curve:{referenceY:c.sourceReferenceY*2,referenceScale:c.scaleAtReference,slopePerWorldY:c.slopePerSourceY/2,minScale:c.min,maxScale:c.max},actorReferenceY:reference,actorGain:Object.fromEntries(Object.entries(reference).map(([id,y])=>[id,this.terrainScale(y)*this.geometry.depthScaling.actorGain[id]]))};
  if(m.s3.falling)depthScaling.lockedScaleByActor={alice:this.geometry.depthScaling.fallScaleLocked};
  const [x,y,w,h]=s.cameraSourceRect;return{width:s.scale.width,height:s.scale.height,shot:m.view,environment:'tunnel-well',requiredActors:m.view==='s3-arrival'?['alice']:['alice',...(m.actors['white-rabbit'].visible>.5?['white-rabbit']:[])],requiredProps:[],actors,props:{},depthScaling,landmarks:[],cameraReframing:s.cameraReframing,cameraTracking:s.cameraTracking,viewport:s.viewport,ambientTime:s.phase,cameraCoverage:{worldView:{left:x,right:x+w,top:y,bottom:y+h},artwork:this.geometry.worldBounds},hookMs:this.hookTime(),offstage:{sister:{environment:'riverbank',point:[m.actors.sister.x,m.actors.sister.y],pose:'seated-reading',bookOwner:m.book.owner}}};
 }
}
