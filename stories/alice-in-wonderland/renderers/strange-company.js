import {VeryLargePuppy} from './very-large-puppy.js';
import{SmallCake}from'./one-small-cake.js';
import{BillChimney}from'./bill-and-chimney.js';
import{FarTooMuch}from'./far-too-much.js';
import {MaryAnn} from './mary-ann.js';
import {Prizes} from './prizes.js';
import {Clearing} from './clearing.js';
import {Riverbank} from './riverbank.js';
import {drawCharacter,createPixelWalkFrames} from '../../../platform/rendering/character-art.js';
const ROOT='/stories/alice-in-wonderland/',PREFIX='alice-c2-company',snap=n=>Math.round(n/2)*2,clamp=v=>Math.max(0,Math.min(1,v));

// One authorized scene. Its chapter JSON owns every clock, position and phase;
// this renderer consumes approved shared geometry and reuses the actual Hall.
export class StrangeCompany extends Riverbank{
 constructor(engine,ready){super(engine,()=>{});this.companyReady=ready;}
 preload(){super.preload();Clearing.preload(this);Prizes.preload(this);MaryAnn.preload(this);FarTooMuch.preload(this);BillChimney.preload(this);SmallCake.preload(this);VeryLargePuppy.preload(this);this.load.json(PREFIX+'-geometry',ROOT+'shared/chapter-2-scene-1-geometry.json');this.load.json(PREFIX+'-cells',ROOT+'shared/chapter-2-scene-1-atlas-cells.json');}
 create(){super.create();this.companyGeometry=this.cache.json.get(PREFIX+'-geometry');this.companyCells=Object.fromEntries(this.cache.json.get(PREFIX+'-cells').poses.map(p=>[p.pose,p]));this.companyTextures={};
  for(const p of Object.values(this.companyCells)){const [l,t,r,b]=p.sourceBoundsExclusive,[w,h]=p.normalizedSize,key=PREFIX+'-'+p.pose,tex=this.textures.createCanvas(key,w,h);drawCharacter(tex.context,this.emptyJar.source(p.asset),l,t,r-l,b-t,w,h);tex.refresh();this.companyTextures[p.pose]={key,width:w,height:h,origin:p.origin};}
  for(const id of ['dodo','lory','eaglet'])for(const dir of ['front','right','back']){const p=this.companyTextures[id+'-'+dir+'-wet'];this.textures.addCanvas(PREFIX+'-'+id+'-'+dir,this.textures.get(p.key).getSourceImage());createPixelWalkFrames(this,PREFIX,id,dir);}
  for(const [dir,name]of [['right','mouse-walk-0'],['back','mouse-back']]){const p=this.companyTextures[name]||this.poolOfTears.normalized[name],key=PREFIX+'-mouse-'+dir;if(!this.textures.exists(key))this.textures.addCanvas(key,this.textures.get(p.key).getSourceImage());createPixelWalkFrames(this,PREFIX,'mouse',dir);}
  this.companyPeople={alice:this.hall.people.alice,mouse:{actor:this.poolOfTears.mouse,shadow:this.add.ellipse(0,0,16,4,0x291909)}};
  for(const id of ['dodo','lory','eaglet']){this.companyPeople[id]={actor:this.add.image(0,0,this.companyTextures[id+'-front-wet'].key),shadow:this.add.ellipse(0,0,this.companyGeometry.actors[id].standingHeightWorld*.42,5,0x291909)};this.portraits[id]=this.textures.get(this.companyTextures[id+'-front-wet'].key).getSourceImage().toDataURL();}
  this.portraits.mouse=this.textures.get(this.poolOfTears.normalized['mouse-walk-0'].key).getSourceImage().toDataURL();
  const wood=this.companyGeometry.doorPush,height=wood.woodLeafBottomSourceY-224,key=PREFIX+'-door-leaf';this.companyDoorTexture=this.textures.createCanvas(key,96,height);this.companyDoor=this.add.image(1344,448,key).setOrigin(0).setScale(2).setDepth(1000).setVisible(false);this.companyDoorProgress=null;
  const apertureKey=PREFIX+'-dark-aperture',aperture=this.textures.createCanvas(apertureKey,96,height),ac=aperture.context;ac.drawImage(this.poolOfTears.doorclosed.texture.getSourceImage(),0,0,96,height,0,0,96,height);ac.globalCompositeOperation='source-in';ac.fillStyle='#080403';ac.fillRect(0,0,96,height);ac.globalCompositeOperation='source-over';aperture.refresh();this.companyAperture=this.add.image(1344,448,apertureKey).setOrigin(0).setScale(2).setDepth(4).setVisible(false);
  const stage=(key,build,active)=>{let instance;this[key]=new Proxy({},{get:(_target,property)=>{if(!instance&&property==='hide')return()=>{};if(!instance&&property==='active')return false;if(!instance&&property==='draw'&&!active())return()=>false;instance??=build();const value=instance[property];return typeof value==='function'?value.bind(instance):value;},set:(_target,property,value)=>{instance??=build();instance[property]=value;return true;}});};stage('clearingStage',()=>new Clearing(this),()=>this.reader.model.clearing?.active);stage('prizesStage',()=>new Prizes(this,this.clearingStage),()=>this.reader.model.prizes?.active);stage('maryAnnStage',()=>new MaryAnn(this,this.clearingStage,this.prizesStage),()=>!!this.reader.model.maryAnn?.place);stage('largeStage',()=>new FarTooMuch(this),()=>this.reader.model.large?.active);stage('billStage',()=>new BillChimney(this),()=>!!this.reader.step?.billMoment);stage('puppyStage',()=>new VeryLargePuppy(this),()=>!!(this.reader.step?.puppyMoment||this.reader.model.puppyScene?.active));stage('cakeStage',()=>new SmallCake(this),()=>!!(this.reader.step?.cakeMoment||this.reader.model.cake?.active));this.companyAliceDrops=this.add.image(0,0,this.companyTextures['mouse-back'].key).setVisible(false);this.companyReadyFlag=true;this.draw(0,true);this.companyReady(this);
 }
 draw(){
  this.companyAliceDrops?.setVisible(false);
  if(!this.poolOfTears)return;
  // Intro rendering uses the first descriptor only. Do not start the engine,
  // append history or write a checkpoint before the reader presses Start.
  const e=this.reader,intro=e.index<0,oldIndex=e.index;if(intro)e.index=0;
  try{if(this.companyReadyFlag&&(e.step?.puppyMoment||e.model.puppyScene?.active)){this.cakeStage?.hide();this.billStage?.hide();this.largeStage?.hide();this.puppyStage.draw();return;}this.puppyStage?.hide();if(this.companyReadyFlag&&(e.step?.cakeMoment||e.model.cake?.active)){this.billStage?.hide();this.cakeStage.draw();return;}this.cakeStage?.hide();if(this.companyReadyFlag&&e.step?.billMoment){this.billStage.draw();return;}this.billStage?.hide();if(this.companyReadyFlag&&e.model.large?.active){this.largeStage.draw();return;}this.largeStage?.hide();if(this.companyReadyFlag&&e.model.maryAnn?.place==='house'&&this.maryAnnStage.enabled){this.maryAnnStage.hide();this.maryAnnStage.drawHouse();return;}if(this.companyReadyFlag&&e.model.clearing?.active){this.drawCompany();return;}super.draw();if(this.companyReadyFlag){this.drawCompany();if(!this.reader.model.clearing?.active){this.cameraTrial?.apply();this.drawCompanyDrops();}}}finally{if(intro)e.index=oldIndex;}
 }
 infoFor(id){const e=this.reader,a=e.model.actors[id],c=e.model.company,phase=e.step?.companyStage?.phase||c.phase,g=this.companyGeometry.actors[id],scale=this.hall.scaleAt(a.y)*g.bodyScale*g.physicalGain,swim=phase==='inherit'||phase==='swim'||phase==='wade'&&c.wadeProgress<.3;let key,origin=[.5,1],flip=false,pose,walking=a.pose==='walk'||['alice','mouse'].includes(id)&&phase==='wade'&&c.wadeProgress>=.55&&c.wadeProgress<1;
  if(id==='alice'){
   if(swim){pose='swim-'+(Math.floor((c.motionClockMs||e.elapsed)/550)%2?'b':'a');key=this.poolOfTears.normalized[pose].key;origin=[.5,.65];}
   else if(phase==='wade'&&c.wadeProgress<.55){pose='rising';key=this.normalized.alice.rising.key;flip=true;}
   else if(c.gesture==='alice-sleeve'){pose='sleeve-inspect';key=this.eatMe.normalized['take-key-low'].key;origin=[...this.eatMe.cells['take-key-low'].origin];}
   else {const dir=a.facing||'left',col=dir==='left'?'right':dir;pose=walking?'walk-'+col:col;key=walking?'alice-riverbank-alice-walk-'+col+'-'+Math.floor(c.motionClockMs/140)%8:this.normalized.alice[col].key;flip=dir==='left';}
  }else if(id==='mouse'){
   if(phase==='wade'){pose='mouse-back';key=walking?PREFIX+'-mouse-walk-back-'+Math.floor(c.motionClockMs/140)%8:this.companyTextures[pose].key;origin=[.5,.65+.35*clamp(c.wadeProgress/.55)];}
   else if(swim){pose='mouse-swim-'+(Math.floor((c.motionClockMs||e.elapsed)/650)%2?'b':'a');key=this.poolOfTears.normalized[pose].key;origin=[.5,.65];flip=a.facing==='left'||phase==='swim';}
   else {const dir=a.facing==='back'?'back':'right';pose=dir==='back'?'mouse-back':'mouse-walk-0';key=walking?PREFIX+'-mouse-walk-'+dir+'-'+Math.floor(c.motionClockMs/140)%8:(this.companyTextures[pose]||this.poolOfTears.normalized[pose]).key;flip=a.facing==='left';}
  }else{
   const dir=a.facing||'right',col=dir==='left'?'right':dir;pose=id+'-'+col+'-wet';
   // Door contact retains the clean canonical idle pose.

   const p=this.companyTextures[pose];key=p.key;origin=[...p.origin];flip=dir==='left'&&!pose.includes('push-left');
   if(walking){key=PREFIX+'-'+id+'-walk-'+col+'-'+Math.floor(c.motionClockMs/140)%8;const size=this.textures.get(key).getSourceImage();origin=[(this.companyCells[pose].groundAnchorNormalized[0]+6)/size.width,1];}
  }
  if(flip)origin=[1-origin[0],origin[1]];
  return{id,x:a.x,y:a.y,key,pose,origin,flip,scale,alpha:a.visible,swim,walking};
 }
 pinRestingProps(){const map={...this.hall.objects,...this.drinkMe.props,'curtain-open':this.hall.curtains.open,'curtain-closed':this.hall.curtains.closed,'door-0':this.hall.doors[0],table:this.hall.tableForeground,tears:this.eatMe.pool,fan:this.poolOfTears.fan,gloves:this.poolOfTears.gloves};
  for(const [id,p]of Object.entries(map)){const v=this.companyGeometry.inherited.restingLayers[id];if(!v)continue;p.setTexture(v.texture).setPosition(v.x,v.y).setOrigin(v.originX,v.originY).setScale(v.scaleX,v.scaleY).setDepth(v.depth).setVisible(v.visible).setAlpha(v.alpha).setFlip(v.flipX,v.flipY).setRotation(v.rotation);if(v.crop)p.setCrop(v.crop.x,v.crop.y,v.crop.width,v.crop.height);else p.setCrop();}
  this.objects=map;
 }
 drawCompanyDrops(){const phase=this.reader.step?.companyStage?.phase||this.reader.model.company.phase;
  const alice=this.companyPeople.alice.actor;
  if(!['inherit','swim','wade'].includes(phase)){
   const key=alice.texture.key+'-c2-s1-wet';if(!this.textures.exists(key)){const image=alice.texture.getSourceImage(),tex=this.textures.createCanvas(key,image.width,image.height),ctx=tex.context,resolution=this.cameraDetail?.alice?.resolution||1,R=resolution*Math.max(1,Math.round(1/(alice.scaleX*resolution)));for(const[u,v]of [[.46,.55],[.61,.66]]){const x=Math.round(image.width*u/(2*R))*2*R,y=Math.round(image.height*v/(2*R))*2*R;ctx.fillStyle='#07547a';ctx.fillRect(x,y,2*R,4*R);ctx.fillStyle='#59cfff';ctx.fillRect(x,y+R,2*R,3*R);ctx.fillStyle='#e2ffff';ctx.fillRect(x,y+R,R,R);}ctx.globalCompositeOperation='destination-in';ctx.drawImage(image,0,0);ctx.globalCompositeOperation='source-over';tex.refresh();}
   this.companyAliceDrops.setTexture(key).setPosition(alice.x,alice.y).setOrigin(alice.originX,alice.originY).setScale(alice.scaleX,alice.scaleY).setFlipX(alice.flipX).setDepth(alice.depth+.1).setAlpha(alice.alpha).setVisible(alice.visible);
  }
 }
 drawCompany(){this.maryAnnStage?.hide();this.prizesStage?.hide();if(this.clearingStage?.draw()){this.prizesStage?.draw();this.maryAnnStage?.drawClearing();return;}this.pinRestingProps();this.people=this.companyPeople;this.companyInfo={};const c=this.reader.model.company,phase=this.reader.step?.companyStage?.phase||c.phase;
  for(const [id,person]of Object.entries(this.people)){const i=this.infoFor(id),p=person.actor,im=this.textures.get(i.key).getSourceImage();this.companyInfo[id]=i;p.setVisible(i.alpha>0).setTexture(i.key).setOrigin(...i.origin).setPosition(snap(i.x),snap(i.y)).setScale(i.scale).setFlipX(i.flip).setAlpha(i.alpha).setRotation(0).setDepth(id==='dodo'&&i.y<1020?Math.max(1001,i.y):i.y).setCrop();
   if(phase==='entry'&&['dodo','lory','eaglet'].includes(id)&&i.y>1400)p.setCrop(0,0,im.width,Math.ceil(im.height*(.65+.35*clamp((1436-i.y)/36))/2)*2);
   if(i.swim&&id==='alice')p.setCrop(0,0,im.width,Math.ceil(im.height*.83/2)*2);if(i.swim&&id==='mouse')p.setCrop(0,0,im.width,Math.ceil(im.height*.7/2)*2);
   person.shadow.setVisible(i.alpha>0&&!i.swim).setPosition(snap(i.x),snap(i.y)-2*i.scale).setScale(i.scale).setAlpha(i.alpha*.12).setDepth(i.y-.2);
  }
  this.poolOfTears.dooropen.setVisible(false);this.companyAperture.setVisible(phase==='door-push'&&c.doorPush>1/3);this.companyDoor.setVisible(phase==='door-push'&&c.doorPush>1/3);if(this.companyDoor.visible){const progress=clamp((c.doorPush-1/3)*1.5),cfg=this.companyGeometry.doorPush;if(this.companyDoorProgress!==progress+(this.reader.model.clearing?.opening||0)){const t=this.companyDoorTexture,ctx=t.context,h=t.height,cosine=1-progress*(cfg.freeEdgeTravelSourcePx+(this.reader.model.clearing?.opening||0)*61)/(cfg.closedLeafRightX-cfg.sourceHingeX),open=this.poolOfTears.dooropen.texture.getSourceImage(),closed=this.poolOfTears.doorclosed.texture.getSourceImage();ctx.clearRect(0,0,96,h);ctx.imageSmoothingEnabled=false;ctx.drawImage(closed,0,0,96,h,2-2*cosine,0,96*cosine,h);t.refresh();this.companyDoorProgress=progress+(this.reader.model.clearing?.opening||0);}}
  this.cameraReframing=false;this.cameraTracking=null;this.shotDissolve?.clear();
 }
 diagnostics(){if(this.puppyStage?.active)return this.puppyStage.diagnostics();if(this.cakeStage?.active)return this.cakeStage.diagnostics();if(this.billStage?.active)return this.billStage.diagnostics();if(this.largeStage?.active)return this.largeStage.diagnostics();if(this.maryAnnStage?.active)return this.maryAnnStage.diagnostics();if(this.prizesStage?.active)return this.prizesStage.diagnostics();if(this.reader.model.clearing?.active&&this.clearingStage)return this.clearingStage.diagnostics();if(!this.companyReadyFlag)return super.diagnostics();const f=this.framing,w=this.scale.width,h=this.scale.height,project=(x,y)=>({x:(x-f.x)*f.z+w/2,y:(y-f.y)*f.z+h/2}),actors={},anchorByActor={},actorReferenceY={},actorGain={};
  for(const [id,person]of Object.entries(this.companyPeople)){const i=this.companyInfo[id]||this.infoFor(id),p=person.actor,b=p.getBounds(),im=p.texture.getSourceImage();actors[id]={...project(i.x,i.y),head:project(i.x,b.top),world:{x:i.x,y:i.y},visible:i.alpha,pose:i.pose,scale:i.scale,textureResolution:this.cameraDetail?.[id]?.resolution||1,bounds:{left:project(b.left,b.top).x,top:project(b.left,b.top).y,right:project(b.right,b.bottom).x,bottom:project(b.right,b.bottom).y}};anchorByActor[id]={sourceBoundsExclusive:[0,0,im.width,im.height],sourceAnchor:[im.width*i.origin[0],im.height*i.origin[1]],origin:i.origin};actorReferenceY[id]=852;actorGain[id]=.5267*this.companyGeometry.actors[id].physicalGain;}
  const props={};for(const[id,p]of Object.entries(this.objects)){const b=p.getBounds();props[id]={...project(p.x,p.y),visible:p.visible?p.alpha:0,owner:null,world:{x:p.x,y:p.y},top:project(p.x,b.top),left:project(b.left,p.y),right:project(b.right,p.y)};}
  const phase=this.reader.step?.companyStage?.phase||this.reader.model.company.phase,frameEntrances=phase==='entry'?Object.fromEntries(['dodo','lory','eaglet'].map(id=>[id,{edge:'right'}])):{};
  return this.cameraTrial.diagnostics({width:w,height:h,environment:'hall-of-doors',shot:'c2-s1-fixed-hall',actors,props,requiredActors:Object.keys(actors).filter(id=>actors[id].visible>.1),requiredProps:['key','bottle','box','fan','gloves'],frameEntrances,depthScaling:{curve:{knots:this.companyGeometry.depthScaling.sourceYToScale.map(([y,z])=>[y*2,z])},actorReferenceY,actorGain,anchorByActor,bodyScaleByActor:{alice:{statePath:['drink','magicScale'],value:.32}}},cameraReframing:false,cameraTracking:null,viewport:this.viewport,cameraCoverage:{worldView:{left:f.x-w/(2*f.z),right:f.x+w/(2*f.z),top:f.y-h/(2*f.z),bottom:f.y+h/(2*f.z)},artwork:[0,0,3328,1872]},landmarks:[],ambientTime:this.phase,company:{phase,maximumPoolOccupancy:2,silent:true},offstage:{sister:{environment:'riverbank'},rabbit:{environment:'beyond-hall'}}});
 }
}
