import {bindCompactAtlas} from '../../../platform/rendering/compact-atlas.js';
import {AliceCameraTrial} from './camera-trial.js';
import{PoolOfTears}from'./pool-of-tears.js';
import {DrinkMe} from './drink-me.js';
import {EatMe} from './eat-me.js';
import {drawCharacter,createPixelWalkFrames} from '../../../platform/rendering/character-art.js';
import {installShotDissolve} from '../../../platform/rendering/shot-dissolve.js';
import {TunnelWell} from './tunnel-well.js';
import {EmptyJar} from './empty-jar.js';
import {SolidGround} from './solid-ground.js';
import {HallOfDoors} from './hall-of-doors.js';

// All world positions, sizes, cuts and prop contacts come from the approved
// shared measurements. S1 and S2 share one continuous exterior and durable state.
const ROOT='/stories/alice-in-wonderland/';
const PREFIX='alice-riverbank';
const snap=n=>Math.round(n/2)*2;
export class Riverbank extends Phaser.Scene {
 constructor(engine,ready){super('alice-riverbank');this.reader=engine;this.ready=ready;this.phase=0;}
 preload(){for(const who of ['alice','dodo','eaglet','lory','mouse','sister','white-rabbit'])this.load.json(PREFIX+'-compact-'+who,ROOT+'shared/'+who+'-master-atlas.json');AliceCameraTrial.preload(this);this.load.json(PREFIX+'-pool-geometry',ROOT+'shared/chapter-1-scene-6-geometry.json');this.load.json(PREFIX+'-pool-cells',ROOT+'shared/chapter-1-scene-6-atlas-cells.json');
  this.load.json(PREFIX+'-eat-geometry',ROOT+'shared/chapter-1-scene-5-geometry.json');
  this.load.json(PREFIX+'-eat-cells',ROOT+'shared/chapter-1-scene-5-atlas-cells.json');
  this.load.json(PREFIX+'-drink-geometry',ROOT+'shared/chapter-1-scene-4-geometry.json');
  this.load.json(PREFIX+'-drink-cells',ROOT+'shared/chapter-1-scene-4-atlas-cells.json');
  this.load.json(PREFIX+'-geometry',ROOT+'shared/stage-geometry.json');
  this.load.json(PREFIX+'-s2-cells',ROOT+'shared/scene-2-atlas-cells.json');
  this.load.json(PREFIX+'-s2-geometry',ROOT+'shared/scene-2-geometry.json');
  this.load.json(PREFIX+'-cells',ROOT+'shared/atlas-cells.json');
  this.load.json(PREFIX+'-s3-cells',ROOT+'shared/scene-3-atlas-cells.json');
  this.load.json(PREFIX+'-s3-geometry',ROOT+'shared/scene-3-geometry.json');
  this.load.json(PREFIX+'-s4-cells',ROOT+'shared/scene-4-atlas-cells.json');
  this.load.json(PREFIX+'-s4-geometry',ROOT+'shared/scene-4-geometry.json');
  this.load.json(PREFIX+'-s4-wall-mask',ROOT+'shared/scene-4-wall-mask.json');
  this.load.json(PREFIX+'-s5-cells',ROOT+'shared/scene-5-atlas-cells.json');
  this.load.json(PREFIX+'-s5-geometry',ROOT+'shared/scene-5-geometry.json');
  this.load.json(PREFIX+'-hall-geometry',ROOT+'shared/chapter-1-scene-3-hall-geometry.json');
  this.load.json(PREFIX+'-hall-cells',ROOT+'shared/chapter-1-scene-3-hall-atlas-cells.json');
  const inactive=this.reader.story.availableChapter==='chapter-2'?new Set(['tunnel-well','s4-2','s4-3','s4-5','s4-wall-clean','s5-ground','large-91']):new Set(),seen=new Set();for(const[id,url]of Object.entries(this.reader.story.assets)){if(inactive.has(id)||seen.has(url))continue;seen.add(url);this.load.image(PREFIX+'-source-'+id,url);}
 }
 create(){
  const originals=new Map();for(const [id,url]of Object.entries(this.reader.story.assets)){const key=PREFIX+'-source-'+id;if(this.textures.exists(key))originals.set(url,this.textures.get(key).getSourceImage());}
  for(const [id,url]of Object.entries(this.reader.story.assets)){const key=PREFIX+'-source-'+id;if(originals.has(url)&&!this.textures.exists(key))this.textures.addImage(key,originals.get(url));}
  for(const [id,url] of Object.entries(this.reader.story.assets)){const who=url.match(/([^/]+)-master-atlas.png$/)?.[1];if(who)bindCompactAtlas(this.textures.get(PREFIX+'-source-'+id).getSourceImage(),this.cache.json.get(PREFIX+'-compact-'+who));}
  // Master cells use explicit shared URLs; retain legacy asset IDs for props.
  for(const[id,url]of Object.entries(this.reader.story.assets)){if(!this.textures.exists(PREFIX+'-source-'+id))continue;const alias=PREFIX+'-source-'+url;if(!this.textures.exists(alias))this.textures.addImage(alias,this.textures.get(PREFIX+'-source-'+id).getSourceImage());}
  this.geometry=this.cache.json.get(PREFIX+'-geometry');this.stage=this.geometry.environments.riverbank;
  this.s2=this.cache.json.get(PREFIX+'-s2-geometry').environments.riverbank;
  this.cells=this.cache.json.get(PREFIX+'-cells');this.normalized={};this.portraits={};this.people={};
  const entry=this.cache.json.get(PREFIX+'-s2-cells');
  if(entry?.characters?.alice?.poses)this.cells.characters.alice.poses.push(...entry.characters.alice.poses.map(p=>({...p,asset:p.asset||'alice-s2-entry'})));
  const [x,y,w,h]=this.stage.worldBounds;
  this.background=this.add.image(x,y,PREFIX+'-source-riverbank').setOrigin(0).setDisplaySize(w,h).setDepth(0);
  for(const[id,owner]of Object.entries(this.cells.characters)){
   this.normalized[id]={};
   for(const pose of owner.poses){
    const [l,t,r,b]=pose.sourceBoundsExclusive;let [pw,ph]=pose.normalizedSize;
    if(id==='white-rabbit'||(id!=='props'&&!pose.pose.startsWith('seated')&&pose.pose!=='rising'&&!pose.pose.startsWith('burrow-'))){ph=owner.standingHeightWorld;pw=snap((pose.nativeFrame?(pose.nativeFrame.size[0]/pose.nativeFrame.size[1]):(r-l)/(b-t))*ph);}
    const key=`${PREFIX}-${id}-${pose.pose}`,tex=this.textures.createCanvas(key,pw,ph);
    drawCharacter(tex.context,this.textures.get(PREFIX+'-source-'+(pose.asset||owner.asset)).getSourceImage(),l,t,r-l,b-t,pw,ph);tex.refresh();
    this.normalized[id][pose.pose]={key,width:pw,height:ph};
   }
   if(id==='props')continue;
   for(const dir of ['front','right','back'])createPixelWalkFrames(this,PREFIX,id,dir);
   const right=this.normalized[id].right,leftKey=`${PREFIX}-${id}-left`;
   const left=this.textures.createCanvas(leftKey,right.width,right.height);
   left.context.translate(right.width,0);left.context.scale(-1,1);
   left.context.drawImage(this.textures.get(right.key).getSourceImage(),0,0);left.refresh();
   this.normalized[id].left={key:leftKey,width:right.width,height:right.height};
   createPixelWalkFrames(this,PREFIX,id,'left');
   this.portraits[id]=this.textures.get(this.normalized[id].front.key).getSourceImage().toDataURL('image/png');
   this.people[id]={shadow:this.add.ellipse(0,0,owner.standingHeightWorld*.32,owner.standingHeightWorld*.065,0x263322,1),actor:this.add.image(0,0,this.normalized[id].front.key).setOrigin(.5,1)};
  }
  this.objects={book:this.add.image(0,0,this.normalized.props['book-open'].key).setOrigin(.5,1),watch:this.add.image(0,0,this.normalized.props['watch-face'].key).setOrigin(.5,1)};
  this.createBurrowRims();
  this.riverPeople=this.people;this.riverObjects=this.objects;this.riverBackground=this.background;
  this.s3=this.cache.json.get(PREFIX+'-s3-geometry');
  const source=url=>this.textures.get(PREFIX+'-source-'+Object.keys(this.reader.story.assets).find(id=>this.reader.story.assets[id]===url)).getSourceImage();
  const lazy=(key,build,facade={})=>{let instance;this[key]=new Proxy(facade,{get:(target,property)=>{if(property==='hide')return()=>instance?.hide();if(property in target)return target[property];instance??=build();const value=instance[property];return typeof value==='function'?value.bind(instance):value;}});};
  lazy('tunnel',()=>new TunnelWell(this,this.s3,this.cache.json.get(PREFIX+'-s3-cells')));
  const jarPlan={scene:this,geometry:this.cache.json.get(PREFIX+'-s4-geometry')};
  lazy('emptyJar',()=>new EmptyJar(this,this.cache.json.get(PREFIX+'-s4-geometry'),this.cache.json.get(PREFIX+'-s4-cells')),{source,sourceKey:()=>undefined,zoomPlan:()=>EmptyJar.prototype.zoomPlan.call(jarPlan),lockedZoom:()=>EmptyJar.prototype.zoomPlan.call(jarPlan).z});
  lazy('solidGround',()=>new SolidGround(this,this.cache.json.get(PREFIX+'-s5-geometry'),this.cache.json.get(PREFIX+'-s5-cells')));
  // Chapter 1 retains its approved shared shaft/landing composite before playback.
  if(!this.reader.model.company)void this.solidGround.background;
  this.drinkGeometry=this.cache.json.get(PREFIX+'-drink-geometry');
  this.hall=new HallOfDoors(this,this.cache.json.get(PREFIX+'-hall-geometry'),this.cache.json.get(PREFIX+'-hall-cells'));
  this.drinkMe=new DrinkMe(this,this.drinkGeometry,this.cache.json.get(PREFIX+'-drink-cells'));
  this.eatMe=new EatMe(this,this.cache.json.get(PREFIX+'-eat-geometry'),this.cache.json.get(PREFIX+'-eat-cells'));
  this.poolOfTears=new PoolOfTears(this,this.cache.json.get(PREFIX+'-pool-geometry'),this.cache.json.get(PREFIX+'-pool-cells'));
  this.createEntryContinuation();
  installShotDissolve(this);
  this.cameraTrial=new AliceCameraTrial(this);
  this.draw(0,true);this.ready(this);
 }
 createEntryContinuation(){
  const rim=this.s3.exteriorContinuation.occluder,source=this.textures.get(PREFIX+'-source-riverbank').getSourceImage(),key=PREFIX+'-s3-entry-continuation',texture=this.textures.createCanvas(key,source.width,source.height),ctx=texture.context;
  ctx.save();ctx.beginPath();ctx.rect(0,0,source.width,source.height);ctx.moveTo(...rim.sourceAperturePolygon[0]);for(const p of rim.sourceAperturePolygon.slice(1))ctx.lineTo(...p);ctx.closePath();ctx.clip('evenodd');
  // Intersect AFTER subtracting the aperture. Its left half lies outside the
  // crossing column; a single even-odd path would incorrectly fill that half.
  ctx.beginPath();ctx.rect(...rim.sourceCoverageBounds);ctx.clip();ctx.drawImage(source,0,0);ctx.restore();texture.refresh();
  const [x,y,w,h]=this.stage.worldBounds;this.entryContinuation=this.add.image(x,y,key).setOrigin(0).setDisplaySize(w,h).setDepth(1001).setVisible(false);
 }
 createBurrowRims(){
  const rim=this.s2.occluders[0],source=this.textures.get(PREFIX+'-source-riverbank').getSourceImage();
  const [wx,wy,ww,wh]=this.stage.worldBounds,mapping=this.s2.mapping.sourceToWorld;
  const trace=(ctx,points)=>{ctx.moveTo(...points[0]);for(const p of points.slice(1))ctx.lineTo(...p);ctx.closePath();};
  const left=Math.min(...rim.sourceOuterPolygon.map(p=>p[0])),right=Math.max(...rim.sourceOuterPolygon.map(p=>p[0]));
  const bottom=Math.max(...rim.sourceOuterPolygon.map(p=>p[1]));
  this.burrowRims={};
  for(const kind of ['rabbit','alice']){
   const key=PREFIX+'-burrow-rim-'+kind,texture=this.textures.createCanvas(key,source.width,source.height),ctx=texture.context;
   // Cover the complete column ABOVE the low roof, not just the earth arch.
   // Tall ears/hair can rise beyond that polygon during the inward walk.
   // Repaint the exact background pixels; the approved aperture stays open.
   ctx.save();ctx.beginPath();ctx.rect(left,0,right-left,bottom);trace(ctx,rim.sourceAperturePolygon);ctx.clip('evenodd');
   if(kind==='alice'){
    // The back half of Alice remains outside, in front of the rim. 03 measured
    // the x=1620 crossing plane against real alpha: every leg stays visible.
    const crossing=(rim.activation.aliceCrossingPlaneWorldX-mapping.translateX)/mapping.scaleX;
    ctx.beginPath();ctx.rect(crossing,0,source.width-crossing,source.height);ctx.clip();
   }
   ctx.drawImage(source,0,0);ctx.restore();texture.refresh();
   this.burrowRims[kind]=this.add.image(wx,wy,key).setOrigin(0).setDisplaySize(ww,wh).setDepth(1000).setVisible(false);
  }
  this.lowRoofOccluders={mapping,sourceColumnBounds:[left,0,right,bottom],roofSourceY:Math.min(...rim.sourceAperturePolygon.map(p=>p[1])),clips:[
   {actorId:'white-rabbit',mask:this.burrowRims.rabbit},
   {actorId:'alice',mask:this.burrowRims.alice,crossingPlaneWorldX:rim.activation.aliceCrossingPlaneWorldX}
  ]};
 }
 update(_,delta){const dt=Math.min(delta,100);if(!this.reader.paused){this.reader.tick(dt);if(this.reader.running&&!this.reader.buffering)this.phase+=dt;this.onTick?.(dt);}this.draw(0);}
 // Discrete authored poses preserve silhouettes; every prop remains at the
 // measured hand of the active pose, including pocket and return frames.
 poseFor(id){
  const m=this.reader.model,s=this.reader.step,p=s?.duration?this.reader.elapsed/s.duration:0;
  if(id==='alice')return s?.id==='alice-c1-s1-hook-rise'?(p<.8?'rising':'standing-ready'):m.staging.alice;
  if(id==='sister')return 'seated-reading';
  if(s?.id==='alice-c1-s1-watch-extract')return p<.3?'pocket':p<.75?'extract':'consult';
  if(s?.id==='alice-c1-s1-hook-watch')return p<.65?'return':'pocket';
  if(s?.id==='alice-c1-s1-hook-turn')return p<.5?'front':'ready';
  return m.staging.rabbit;
 }
 actorPosition(id){const a=this.reader.model.actors[id];return{x:snap(a.x),y:snap(a.y)};}
 actorScale(id){
  const {curve,actorReferenceY,actorGain}=this.s2.depthScaling;
  const at=y=>Phaser.Math.Clamp(curve.referenceScale+(y-curve.referenceY)*curve.slopePerWorldY,curve.minScale,curve.maxScale);
  // Scale follows the durable world position, so pauses, saved passages,
  // interaction poses and independent export reconstruct the same perspective.
  return at(this.reader.model.actors[id].y)/at(actorReferenceY[id])*(actorGain?.[id]??1);
 }
 actorHeight(id){return this.normalized[id][this.poseFor(id)]?.height||this.cells.characters[id].standingHeightWorld;}
 propPosition(id){
  const owner=id==='book'?'sister':'white-rabbit',a=this.reader.model.actors[owner],pose=this.poseFor(owner);
  const table=this.stage.props[id].byOwnerPose,entry=table[pose]||table[id==='book'?'seated-reading':'pocket'];
  const base=this.stage.anchors[id==='book'?'sister-fixed':'rabbit-watch-stop'].point;
  const [x,y]=entry.worldPropBottomCenter||entry.worldHand;
  const scale=this.actorScale(owner);
  return{x:snap(a.x+(x-base[0])*scale),y:snap(a.y+(y-base[1])*scale),owner,pose,scale};
 }
 bounds(){return{actors:this.requiredActors(),props:['book',...(this.watchVisible()?['watch']:[])],points:[],fullPanorama:true};}
 watchVisible(){const s=this.reader.step,p=s?.duration?this.reader.elapsed/s.duration:0;
  if(s?.id==='alice-c1-s1-watch-extract')return p>=.3;
  if(s?.id==='alice-c1-s1-hook-watch')return p<1;
  return this.reader.model.watch.visible>.5;
 }
 shotFor(view){
  if(!view||view==='s1-held')return this.stage.cameras.responsive;
  const shots=this.s2.cameras.shots;
  const tracking=this.s2.cameras.continuousTracking;
  const broad=['tall-first','tall-second','tall-third',tracking.id].includes(view)?'travel':'entrance';
  const fitWithVisibleSister=source=>{
   const shot={...source,screenPaddingPx:this.stage.cameras.responsive.screenPaddingPx};
   const frame=this.frameFor(shot,view),[sx,sy]=this.stage.anchors['sister-fixed'].point;
   const size=this.normalized.sister['seated-reading'],left=sx-size.width/2,right=sx+size.width/2,top=sy-size.height;
   const wl=frame.x-this.scale.width/(2*frame.z),wr=frame.x+this.scale.width/(2*frame.z),wt=frame.y-this.scale.height/(2*frame.z),wb=frame.y+this.scale.height/(2*frame.z);
   // 03 permits this exact union of measured anchor/crop bounds. A stationary
   // distant actor naturally outside the crop stays in the world; if any part
   // is visible, fit her complete silhouette above the actual dialogue.
   if(right>wl&&left<wr&&sy>wt&&top<wb){
    const [l,t,w,h]=shot.requiredWorldRect,r=Math.max(l+w,right),b=Math.max(t+h,sy);
    shot.requiredWorldRect=[Math.min(l,left),Math.min(t,top),r-Math.min(l,left),b-Math.min(t,top)];
   }
   return shot;
  };
  const base=fitWithVisibleSister(shots[broad]);
  if(this.frameFor(base,broad).fits)return base;
  if(view===tracking.id){
   const a=shots[tracking.fromShot],b=shots[tracking.toShot];
   const p=Phaser.Math.Clamp((this.reader.model.actors[tracking.driverActor][tracking.driverAxis]-tracking.from)/(tracking.through-tracking.from),0,1);
   const mix=(x,y)=>x+(y-x)*p;
   // One measured following shot, driven by actual world travel. It starts
   // exactly at the held join shot and finishes at the held call shot. The
   // stationary sister can leave the horizontal crop naturally in this phase.
   return{...a,requiredWorldRect:a.requiredWorldRect.map((v,i)=>mix(v,b.requiredWorldRect[i])),preferredCenter:a.preferredCenter.map((v,i)=>mix(v,b.preferredCenter[i])),preferredViewHeight:mix(a.preferredViewHeight,b.preferredViewHeight),screenPaddingPx:this.stage.cameras.responsive.screenPaddingPx};
  }
  return fitWithVisibleSister(shots[view]);
 }
 requiredActors(){
  const view=this.reader.model.view||'s1-held';
  return view==='s1-held'||view==='tall-first'?['alice','sister','white-rabbit']:['alice','white-rabbit'];
 }
 frameFor(shot,view){
  const w=this.scale.width,h=this.scale.height,[ax,ay,aw,ah]=this.stage.worldBounds;

  if(!shot)throw new Error('Riverbank needs measured responsive camera geometry');
  const [l,t,rw,rh]=shot.requiredWorldRect,r=l+rw,b=t+rh;
  const padding=shot.screenPaddingPx,reading=Math.min(h,this.readingHeight||h);
  const safeWidth=this.safeWidth||w,offset=this.safeCenterOffset||0;
  const safeLeft=w/2-offset-safeWidth/2+padding,safeRight=w/2-offset+safeWidth/2-padding;
  const safeTop=Math.max(this.safeTopInset||0,Math.min(65,h*.1))+padding;
  const safeBottom=Math.max(safeTop+1,reading-padding);
  // The camera fills the complete canvas. Its zoom is bounded by both the
  // actual painted panorama and the complete held shot, including the rabbit
  // route and every approved pose. No aspect-ratio breakpoint changes shots.
  // Phaser rounds its render transform to physical pixels. Keep one painted
  // pixel beyond each canvas edge so rounding never exposes a background bar.
  const coveragePadding=1;
  const minimum=Math.max((w+2*coveragePadding)/aw,(h+2*coveragePadding)/ah,(safeLeft+coveragePadding)/(l-ax),(w-safeRight+coveragePadding)/(ax+aw-r),(safeTop+coveragePadding)/(t-ay),(h-safeBottom+coveragePadding)/(ay+ah-b));
  const maximum=Math.min((safeRight-safeLeft)/rw,(safeBottom-safeTop)/rh);
  const fits=minimum<=maximum+.0001;
  const z=Math.max(minimum,Math.min(maximum,h/shot.preferredViewHeight));
  let minX=ax+(w/2+coveragePadding)/z,maxX=ax+aw-(w/2+coveragePadding)/z,minY=ay+(h/2+coveragePadding)/z,maxY=ay+ah-(h/2+coveragePadding)/z;
  if(fits){
   minX=Math.max(minX,r+(w/2-safeRight)/z);maxX=Math.min(maxX,l+(w/2-safeLeft)/z);
   minY=Math.max(minY,b+(h/2-safeBottom)/z);maxY=Math.min(maxY,t+(h/2-safeTop)/z);
  }
  const [cx,cy]=shot.preferredCenter;
  const framing={x:Phaser.Math.Clamp(cx+offset/z,minX,maxX),y:Phaser.Math.Clamp(cy+(h-reading)/(2*z)-(this.safeTopInset||0)/z,minY,maxY),z};
  return{...framing,fits,view,minimum,maximum};
 }
 frameViewport(){
  const view=this.reader.model.view||'s1-held',step=this.reader.step;
  const shot=this.shotFor(view),target=this.frameFor(shot,view);
  this.cameraReframing=!!step?.camera?.reframe;
  const tracking=this.s2.cameras.continuousTracking;
  this.cameraTracking=step?.camera?.tracking===tracking.id?{id:tracking.id,progress:Phaser.Math.Clamp((this.reader.model.actors[tracking.driverActor][tracking.driverAxis]-tracking.from)/(tracking.through-tracking.from),0,1),departingStationaryActors:['sister']}:null;
  if(this.cameraTracking){this.cameraTracking.from=this.frameFor(this.shotFor(tracking.fromShot),tracking.fromShot);this.cameraTracking.to=this.frameFor(this.shotFor(tracking.toShot),tracking.toShot);}
  if(['alice-c1-s3-finish-entry','alice-c1-s3-entry-clear'].includes(step?.id)){
   const continuation=this.s3.exteriorContinuation,[l,t,rw,rh]=shot.requiredWorldRect,half=this.normalized.alice['burrow-entry'].width*continuation.scale/2;
   const right=Math.max(l+rw,continuation.through[0]+half),to=this.frameFor({...shot,requiredWorldRect:[l,t,right-l,rh]},view),p=step.id==='alice-c1-s3-entry-clear'?1:Math.min(1,this.reader.elapsed/step.duration),q=p*p*(3-2*p);
   const width=this.scale.width/target.z+(this.scale.width/to.z-this.scale.width/target.z)*q;
   this.framing={x:target.x+(to.x-target.x)*q,y:target.y+(to.y-target.y)*q,z:this.scale.width/width};
   this.cameraTracking={id:'s3-exterior-entry',progress:p,departingStationaryActors:['sister'],from:target,to};
   if(!to.fits)target.fits=false;
  }else if(this.cameraReframing){
   const before=this.reader.startModel.view||'s1-held',from=this.frameFor(this.shotFor(before),before);
   const p=Math.min(1,this.reader.elapsed/step.duration),t=p*p*(3-2*p);
   // Interpolate the world-view rectangle, preserving painted coverage while
   // both travelers are stationary. Motion actions keep this result held.
   const a={w:this.scale.width/from.z,h:this.scale.height/from.z},b={w:this.scale.width/target.z,h:this.scale.height/target.z};
   const width=a.w+(b.w-a.w)*t;
   this.framing={x:from.x+(target.x-from.x)*t,y:from.y+(target.y-from.y)*t,z:this.scale.width/width};
  }else this.framing=target;
  this.activeShot=view;
  this.environmentCameraIssue=target.fits?null:{view,minimum:target.minimum,maximum:target.maximum};
  const {x,y,z}=this.framing,w=this.scale.width,h=this.scale.height;
  this.viewport={x:0,y:0,width:w,height:h};this.cameraSourceRect=[x-w/(2*z),y-h/(2*z),w/z,h/z];
  this.cameras.main.setViewport(0,0,w,h).setZoom(z).centerOn(x,y);
 }

 draw(){
  if(!this.people)return;const m=this.reader.model;
  this.emptyJar?.hide();this.solidGround?.hide();this.hall?.hide();this.drinkMe?.hide();this.eatMe?.hide();this.poolOfTears?.hide();
  if(m.environment==='hall-of-doors'){
   this.riverBackground.setVisible(false);for(const p of Object.values(this.riverPeople)){p.actor.setVisible(false);p.shadow.setVisible(false);}for(const p of Object.values(this.riverObjects))p.setVisible(false);for(const p of Object.values(this.burrowRims))p.setVisible(false);this.entryContinuation.setVisible(false);this.tunnel.hide();if(m.pool?.active)this.poolOfTears.draw();else if(m.eat?.active)this.eatMe.draw();else if(m.drink?.active)this.drinkMe.draw();else this.hall.draw();if(!m.company)this.cameraTrial?.apply();return;
  }
  if(m.environment==='solid-ground'){
   this.riverBackground.setVisible(false);for(const p of Object.values(this.riverPeople)){p.actor.setVisible(false);p.shadow.setVisible(false);}for(const p of Object.values(this.riverObjects))p.setVisible(false);for(const p of Object.values(this.burrowRims))p.setVisible(false);this.entryContinuation.setVisible(false);this.tunnel.hide();this.solidGround.draw();return;
  }
  if(m.environment==='well-bottom'){
   this.riverBackground.setVisible(false);for(const p of Object.values(this.riverPeople)){p.actor.setVisible(false);p.shadow.setVisible(false);}for(const p of Object.values(this.riverObjects))p.setVisible(false);for(const p of Object.values(this.burrowRims))p.setVisible(false);this.entryContinuation.setVisible(false);this.tunnel.hide();this.emptyJar.draw();return;
  }
  if(m.environment==='tunnel-well'){
   this.riverBackground.setVisible(false);for(const p of Object.values(this.riverPeople)){p.actor.setVisible(false);p.shadow.setVisible(false);}for(const p of Object.values(this.riverObjects))p.setVisible(false);for(const p of Object.values(this.burrowRims))p.setVisible(false);this.entryContinuation.setVisible(false);this.tunnel.draw();return;
  }
  this.tunnel?.hide();this.people=this.riverPeople||this.people;this.objects=this.riverObjects||this.objects;this.background=this.riverBackground||this.background;this.background.setVisible(true);
  for(const p of Object.values(this.people)){p.actor.setVisible(true);p.shadow.setVisible(true);}for(const p of Object.values(this.objects))p.setVisible(true);
  this.entryContinuation?.setVisible(['alice-c1-s3-finish-entry','alice-c1-s3-entry-clear'].includes(this.reader.step?.id));this.frameViewport();
  for(const[id,person]of Object.entries(this.people)){
   const a=m.actors[id],pos=this.actorPosition(id),pose=this.poseFor(id),moving=a.pose==='walk';
   let key=this.normalized[id][pose]?.key||this.normalized[id].right.key;
   if(moving){
    const step=this.reader.step,start=this.reader.startModel.actors[id];
    const route=[[start.x,start.y],...(step.paths[id]||[]).map(p=>[p.x,p.y])];
    const length=route.slice(1).reduce((v,p,i)=>v+Math.hypot(p[0]-route[i][0],p[1]-route[i][1]),0);
    const previous=step.id==='alice-c1-s1-rabbit-arrive'?this.stage.walkPaths['s1-rabbit-arrival'].waypoints.slice(0,3):[];
    const already=previous.slice(1).reduce((v,p,i)=>v+Math.hypot(p[0]-previous[i][0],p[1]-previous[i][1]),0);
    const distance=already+length*Math.min(1,this.reader.elapsed/this.reader.step.duration);
    const direction=a.facing||'right';
    key=`${PREFIX}-${id}-walk-${direction}-${Math.floor(distance/6)%8}`;
   }
   const depthScale=this.actorScale(id);
   person.actor.setTexture(key).setScale(depthScale).setFlipX(false).setPosition(pos.x,pos.y).setAlpha(a.visible).setDepth(pos.y);
   person.shadow.setScale(depthScale).setPosition(pos.x,pos.y-2*depthScale).setAlpha(a.visible*.16).setDepth(pos.y-.1);
  }
  this.burrowRims.rabbit.setVisible(m.staging.rabbit==='back'&&m.actors['white-rabbit'].visible>0);
  this.burrowRims.alice.setVisible(this.poseFor('alice')==='burrow-entry'&&!this.entryContinuation?.visible);
  for(const[id,sprite]of Object.entries(this.objects)){
   const p=this.propPosition(id),owner=m.actors[p.owner],visible=id==='book'||this.watchVisible();
   const pose=id==='book'?(p.pose==='seated-reply-left'?'book-tilted':'book-open'):'watch-face';
   sprite.setTexture(this.normalized.props[pose].key).setScale(p.scale).setPosition(p.x,p.y).setAlpha(visible?owner.visible:0).setDepth(owner.y+.1);
  }
 }
 diagnostics(){
  if(this.reader.model.environment==='hall-of-doors'){const d=this.reader.model.pool?.active?this.poolOfTears.diagnostics():this.reader.model.eat?.active?this.eatMe.diagnostics():this.reader.model.drink?.active?this.drinkMe.diagnostics():this.hall.diagnostics();return this.cameraTrial?.diagnostics(d)||d;}
  if(this.reader.model.environment==='solid-ground')return this.solidGround.diagnostics();
  if(this.reader.model.environment==='well-bottom')return this.emptyJar.diagnostics();
  if(this.reader.model.environment==='tunnel-well')return this.tunnel.diagnostics();
  const f=this.framing,project=(x,y)=>({x:(x-f.x)*f.z+this.scale.width/2,y:(y-f.y)*f.z+this.scale.height/2});
  const actors={},props={};
  for(const[id,a]of Object.entries(this.reader.model.actors)){
   const p=this.actorPosition(id),sprite=this.people[id].actor,b=sprite.getBounds();
   actors[id]={...project(p.x,p.y),head:project(p.x,p.y-sprite.displayHeight),visible:a.visible,pose:this.poseFor(id),scale:this.actorScale(id),world:p,bounds:{left:project(b.left,b.top).x,right:project(b.right,b.top).x,top:project(b.left,b.top).y,bottom:project(b.left,b.bottom).y}};
  }
  for(const[id,sprite]of Object.entries(this.objects)){const p=this.propPosition(id),b=sprite.getBounds();props[id]={...project(p.x,p.y),owner:p.owner,visible:sprite.alpha,top:project(p.x,b.top),left:project(b.left,p.y),right:project(b.right,p.y),world:p};}
  const [x,y,w,h]=this.cameraSourceRect;
  return{depthScaling:this.s2.depthScaling,width:this.scale.width,height:this.scale.height,shot:this.activeShot,cameraReframing:this.cameraReframing,cameraTracking:this.cameraTracking,marker:null,requiredActors:this.requiredActors().filter(id=>actors[id].visible>.5),requiredProps:[...(this.requiredActors().includes('sister')?['book']:[]),...(this.watchVisible()?['watch']:[])],actors,props,landmarks:[],ambientTime:this.phase,viewport:this.viewport,cameraCoverage:{worldView:{left:x,right:x+w,top:y,bottom:y+h},artwork:this.stage.worldBounds}};
 }
}
