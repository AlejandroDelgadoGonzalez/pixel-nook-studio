import {drawCharacter,createPixelWalkFrames} from '../../../platform/rendering/character-art.js';
import {ithacaHostCell} from '../shared/atlas-cells.js';
import {installShotDissolve} from '../../../platform/rendering/shot-dissolve.js';
import {preloadLandscape,fitEnvironment,prepareLandscapeShot,cameraCenterX,refreshEnvironmentEdges,keepCameraInsideEnvironment,landscapeView} from '../../../platform/rendering/environments.js';

// Shared staging for the final five chapters. Assets and shot requirements live in story data.
export class Homecoming extends Phaser.Scene {
 constructor(engine,ready){super('homecoming');this.reader=engine;this.ready=ready;this.phase=0;this.framing=null;this.room=null;this.roomFade=900;}
 preload(){for(const[key,url]of Object.entries(this.reader.story.assets))this.load.image('hc-'+key,url);preloadLandscape(this);}
 cut(key,atlas,col,row,height,character=false){
  const source=this.textures.get('hc-'+atlas).getSourceImage(),grid=this.reader.story.visuals.grids[atlas];
  const xs=grid.x.map(n=>Math.round(n*source.width/grid.w)),ys=grid.y.map(n=>Math.round(n*source.height/grid.h)),cell=atlas==='ithHosts'?ithacaHostCell(source,col,row):{x:xs[col],y:ys[row],w:xs[col+1]-xs[col],h:ys[row+1]-ys[row]},w=cell.w,h=cell.h;
  const scan=document.createElement('canvas');scan.width=w;scan.height=h;const c=scan.getContext('2d',{willReadFrequently:true});c.drawImage(source,cell.x,cell.y,w,h,0,0,w,h);
  const pixels=c.getImageData(0,0,w,h).data;let l=w,r=-1,t=h,b=-1;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(pixels[(y*w+x)*4+3]>80){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
  if(r<l)throw new Error('Missing homecoming sprite '+key);
  const sw=r-l+1,sh=b-t+1,width=Math.max(2,Math.round(sw/sh*height/2)*2),tex=this.textures.createCanvas(key,width,height);tex.context.imageSmoothingEnabled=false;
  if(character)drawCharacter(tex.context,scan,l,t,sw,sh,width,height);else{tex.context.drawImage(scan,l,t,sw,sh,0,0,width,height);const flat=tex.context.getImageData(0,0,width,height);for(let i=3;i<flat.data.length;i+=4)flat.data[i]=flat.data[i]>80?255:0;tex.context.putImageData(flat,0,0);}tex.refresh();return tex;
 }
 walkFrames(id,col){createPixelWalkFrames(this,'hc',id,col);}
 create(){
  const v=this.reader.story.visuals;this.roomHeights={};
  for(const[key,room]of Object.entries(v.rooms)){
   const image=this.textures.get('hc-'+room.atlas).getSourceImage(),cell=room.cell||[0,0,1,1],sx=image.width*cell[0],sy=image.height*cell[1],sw=image.width*cell[2],sh=image.height*cell[3];
   const width=Math.round(sw),height=Math.round(sh*(room.centralThird?3:1)),texture=this.textures.createCanvas('hc-room-'+key,width,height);texture.context.imageSmoothingEnabled=false;if(room.centralThird)texture.context.drawImage(image,sw/3,0,sw/3,sh,0,0,width,height);else texture.context.drawImage(image,sx,sy,sw,sh,0,0,width,height);texture.refresh();this.roomHeights[key]=1536*height/width;
  }
  const first=this.reader.model.room;this.background=this.add.image(768,0,'hc-room-'+first).setOrigin(.5,0).setDepth(0);this.previousBackground=this.add.image(768,0,'hc-room-'+first).setOrigin(.5,0).setDepth(1).setAlpha(0);
  this.sides=[-768,2304].map(x=>this.add.image(x,0,'hc-room-'+first).setOrigin(.5,0).setDepth(0));this.previousSides=[-768,2304].map(x=>this.add.image(x,0,'hc-room-'+first).setOrigin(.5,0).setDepth(1).setAlpha(0));
  this.people={};this.portraits={};this.disguisePortrait=null;
  for(const[id,spec]of Object.entries(v.cast)){
   for(let col=0;col<4;col++){const texture=this.cut(`hc-${id}-${col}`,spec.atlas,col,spec.row,col===3?(spec.reachHeight||136):136,true);if(col===0)this.makePortrait(id,texture);}
   for(const col of [0,1,2])this.walkFrames(id,col);
   this.people[id]={actor:this.add.image(0,0,`hc-${id}-0`).setOrigin(.5,1),shadow:this.add.ellipse(0,0,60,12,0x211c19,.16),last:null,distance:0};
  }
  if(v.disguise){for(let col=0;col<4;col++)this.cut('hc-disguise-'+col,v.disguise.atlas,col,v.disguise.row,136,true);for(const col of [0,1,2])this.walkFrames('disguise',col);this.disguiseActor=this.add.image(0,0,'hc-disguise-0').setOrigin(.5,1);this.makePortrait('disguise',this.textures.get('hc-disguise-0'));this.disguisePortrait=this.portraits.disguise;}
  for(const[id,spec]of Object.entries(v.poses||{}))this.cut('hc-pose-'+id,spec.atlas,spec.col,spec.row,spec.height,true);
  for(const[id,spec]of Object.entries(v.variants||{}))this.cut('hc-variant-'+id,spec.atlas,spec.col,spec.row,spec.height);
  this.objects={};
  for(const[id,spec]of Object.entries(v.objects)){
   this.cut('hc-object-'+id,spec.atlas,spec.col,spec.row,spec.height,!!spec.character);
   this.objects[id]=this.add.image(0,0,'hc-object-'+id).setOrigin(.5,1).setScale(spec.scaleX||1,spec.scaleY||1);
  }
  if(this.objects.axes){
   // One authored axe head, repeated in a single shooting line rather than the source's two rows.
   const source=this.textures.get('hc-object-axes').getSourceImage(),tex=this.textures.createCanvas('hc-axes-line',228,54),c=tex.context;c.imageSmoothingEnabled=false;
   for(let i=0;i<12;i++)c.drawImage(source,0,0,source.width/6,source.height/2,i*19,0,19,54);tex.refresh();this.objects.axes.setTexture('hc-axes-line');
  }
  if(this.objects.ship){const source=this.textures.get('hc-object-ship').getSourceImage(),hull=this.textures.createCanvas('hc-hull',source.width,50);hull.context.imageSmoothingEnabled=false;hull.context.drawImage(source,0,source.height-50,source.width,50,0,0,source.width,50);hull.refresh();this.hull=this.add.image(0,0,'hc-hull').setOrigin(.5,1).setScale(this.objects.ship.scaleX,this.objects.ship.scaleY);}
  this.crewShadows=this.people.eurylochus?Array.from({length:6},()=>this.add.image(0,0,'hc-eurylochus-0').setOrigin(.5,1).setScale(.52).setTint(0x728378).setAlpha(0)):[];
  this.returnSailors=this.reader.story.characters.telemachus&&this.objects.ship?Array.from({length:2},(_,i)=>this.add.image(0,0,'hc-telemachus-1').setOrigin(.5,1).setScale(.52).setTint(i?0x90acbb:0xbba985).setAlpha(0)):[];
  this.ambientInk=this.add.graphics().setDepth(2);this.effectsInk=this.add.graphics().setDepth(1500);installShotDissolve(this);this.ready(this);this.draw(0,true);
 }
 makePortrait(id,texture){const face=this.textures.createCanvas('hc-face-'+id,80,80);face.context.imageSmoothingEnabled=false;face.context.drawImage(texture.getSourceImage(),0,0,texture.width,texture.height*.53,0,0,80,80);face.refresh();this.portraits[id]=face.getSourceImage().toDataURL();if(id==='odysseus')this.heroPortrait=this.portraits[id];}
 update(_,delta){const dt=Math.min(delta,100);if(!this.reader.paused){this.phase+=dt;this.reader.tick(dt);this.onTick?.(dt);}this.draw(this.reader.paused?0:dt);}
 bounds(){return this.reader.story.shots[this.reader.model.view];}
 portraitKey(id){return id==='odysseus'&&this.reader.model.actors[id].disguise>.5?'disguise':id;}
 portraitFor(id){const key=this.portraitKey(id);return key==='odysseus'?this.heroPortrait:this.portraits[key];}
 actorHeight(id){const a=this.reader.model.actors[id];return this.reader.story.visuals.poses?.[a.mode]?.height||136;}
 actorWidth(id){const a=this.reader.model.actors[id],tex=a.mode&&this.textures.exists('hc-pose-'+a.mode)?this.textures.get('hc-pose-'+a.mode):this.textures.get(`hc-${id}-0`);return tex.getSourceImage().width;}
 actorPosition(id){const a=this.reader.model.actors[id],m=this.reader.model;return{x:a.x,y:a.y+(a.onboard>.5?Math.sin(this.phase/1650)*(1.4+m.storm*2):0)+Math.sin(this.phase/1200)*a.ghost*2};}
 hand(id,key){const a=this.reader.model.actors[id];if(!a)return null;const direction=a.facing==='left'?-1:1;return{x:a.x+direction*(key==='lyre'?29:key==='staff'||key==='oar'?53:43),y:a.y-(key==='lyre'?19:key==='staff'||key==='oar'?8:55)-(this.reader.model[key]?.lift||0)};}
 propPosition(id){
  const p=this.reader.model[id],s=this.reader.step,change=s?.type==='action'?s.effects[id]:null;
  if(change&&Object.hasOwn(change,'owner')&&change.owner!==this.reader.startModel[id].owner){const start=this.hand(this.reader.startModel[id].owner,id)||this.reader.startModel[id],end=this.hand(change.owner,id)||{x:change.x??p.x,y:change.y??p.y},progress=Math.min(1,this.reader.elapsed/s.duration),t=progress*progress*(3-2*progress);return{x:start.x+(end.x-start.x)*t,y:start.y+(end.y-start.y)*t-Math.sin(progress*Math.PI)*3};}
  return this.hand(p.owner,id)||p;
 }
 draw(dt,instant=false){
  const m=this.reader.model,w=this.scale.width,h=this.scale.height,top=this.safeTopInset||Math.min(65,h*.1),reading=(this.readingHeight||h)-(this.safeTopInset?0:top),target={...this.bounds()};
  prepareLandscapeShot(this,target);
  if(this.room!==m.room){const fit=(sprite,key,wing=null)=>fitEnvironment(this,sprite,key,'hc-room-'+key,this.roomHeights[key],wing);if(this.room&&!instant){fit(this.previousBackground,this.room);this.previousSides.forEach((s,i)=>fit(s,this.room,i));this.roomFade=0;}else this.roomFade=900;fit(this.background,m.room);this.sides.forEach((s,i)=>fit(s,m.room,i));this.room=m.room;}
  refreshEnvironmentEdges(this);this.roomFade=Math.min(900,this.roomFade+dt);this.previousBackground.setAlpha(instant?0:1-this.roomFade/900);for(const s of this.previousSides)s.setAlpha(this.previousBackground.alpha);
  const shade=Math.round(255-m.storm*82),tint=Phaser.Display.Color.GetColor(shade,shade,Math.min(255,shade+6));for(const s of [this.background,...this.sides])s.setTint(tint);
const step=this.reader.step,lookAhead=this.reader.story.steps.slice(this.reader.index+1,this.reader.index+5);let next=null;
  if(step?.effects?.view)for(const candidate of lookAhead){if(candidate.camera?.hold){next=candidate;break;}if(candidate.type!=='action'||candidate.duration>350||candidate.effects.view)break;}
  const walk=step?.camera?.hold?step:next;this.cameraWalk=walk;
  const rects=[];
  for(const id of target.actors){const a=this.actorPosition(id),change=walk?.effects.actors?.[id],from=walk===step?this.reader.startModel.actors[id]:m.actors[id];if(m.actors[id].visible<.1&&!change?.visible)continue;const points=change?[walk.presence?.[id]?.from||from,...(walk.paths?.[id]||[]),{x:change.x??from.x,y:change.y??from.y}]:[a],pad=Math.max(76,this.actorWidth(id)/2+18);for(const p of points)rects.push({l:p.x-pad,r:p.x+pad,t:p.y-this.actorHeight(id)-20,b:p.y+18});}
  for(const id of target.props||[]){const p=m[id],s=this.objects[id],change=walk?.effects[id],owner=p.owner&&m.actors[p.owner],ownerChange=walk?.effects.actors?.[p.owner];if(p.visible*(owner?owner.visible:1)<.1&&!change?.visible&&!ownerChange?.visible)continue;const position=this.propPosition(id),points=[];
   if(owner){const from=walk===step?this.reader.startModel.actors[p.owner]:owner,origin=walk?.presence?.[p.owner]?.from||from,offset={x:position.x-owner.x,y:position.y-owner.y};for(const v of [origin,...(walk?.paths?.[p.owner]||[]),{x:ownerChange?.x??origin.x,y:ownerChange?.y??origin.y}])points.push({x:v.x+offset.x,y:v.y+offset.y});}else points.push(position);if(change&&(change.x!==undefined||change.y!==undefined))points.push({x:change.x??p.x,y:change.y??p.y});for(const v of points)rects.push({l:v.x-s.displayWidth/2-26,r:v.x+s.displayWidth/2+26,t:v.y-s.displayHeight-22,b:v.y+22});
  }
  for(const id of target.landmarks||[]){const p=this.reader.story.landmarks[id];rects.push({l:p.x-p.w/2,r:p.x+p.w/2,t:p.y-p.h/2,b:p.y+p.h/2});}
  if(rects.length){const l=Math.min(...rects.map(r=>r.l)),r=Math.max(...rects.map(r=>r.r)),t=Math.min(...rects.map(r=>r.t)),b=Math.max(...rects.map(r=>r.b));target.w=Math.max(target.w,r-l);target.h=Math.max(target.h,b-t);target.cx=Math.max(r-target.w/2,Math.min(target.cx,l+target.w/2));target.cy=Math.max(b-target.h/2,Math.min(target.cy,t+target.h/2));}
  const worldHeight=this.roomHeights[m.room],z=Math.max(w/(!landscapeView(this)&&this.reader.story.visuals.rooms[m.room]?.nativeBounds?1536:4608),h/worldHeight,Math.min((this.safeWidth||w)/target.w,reading/target.h)),dest={x:cameraCenterX(this,target.cx+(this.safeCenterOffset||0)/z,z),y:Phaser.Math.Clamp(target.cy+(h-reading)/(2*z)-top/z,h/(2*z),worldHeight-h/(2*z)),z};
  if(!landscapeView(this)&&rects.length){const safeW=this.safeWidth||w,left=w/2-safeW/2+(this.safeCenterOffset||0),right=left+safeW,bottom=(this.readingHeight||h)-12,l=Math.max(...rects.map(r=>r.r))+(w/2-right)/z,r=Math.min(...rects.map(r=>r.l))+(w/2-left)/z,t=Math.max(...rects.map(r=>r.b))+(h/2-bottom)/z,b=Math.min(...rects.map(r=>r.t))+(h/2-top)/z;if(l<=r)dest.x=Phaser.Math.Clamp(dest.x,l,r);if(t<=b)dest.y=Phaser.Math.Clamp(dest.y,t,b);}
  keepCameraInsideEnvironment(this,dest,true);
  if(!this.framing||instant||this.oldWidth!==w||this.oldHeight!==h){this.framing={...dest};this.cameraMove=null;}
  else {
   if(this.cameraMove&&this.cameraMove.id!==step?.id){this.framing={...this.cameraMove.dest};this.cameraMove=null;}
   if(!step?.camera?.hold&&step?.type==='action'&&step.effects.view){if(!this.cameraMove)this.cameraMove={id:step.id,from:{...this.framing},dest};this.cameraMove.dest={...dest};const p=Math.min(1,this.reader.elapsed/step.duration),t=p*p*(3-2*p);for(const k of ['x','y','z'])this.framing[k]=this.cameraMove.from[k]+(dest[k]-this.cameraMove.from[k])*t;}
   else if(dt&&!step?.camera?.hold){const ease=1-Math.exp(-dt/750);for(const k of ['x','y','z'])this.framing[k]+=(dest[k]-this.framing[k])*ease;}
  }
  this.oldWidth=w;this.oldHeight=h;this.cameras.main.setZoom(this.framing.z).centerOn(this.framing.x,this.framing.y);
  for(const[id,s]of Object.entries(this.objects)){
   s.layerAlpha=(target.hiddenProps||[]).includes(id)?0:1;
   if(id==='bow')s.setTexture(m.bowStrung>.5?'hc-object-bow':'hc-variant-bowLoose');
   const p=this.propPosition(id),v=m[id],owner=m.actors[v.owner],onTable=v.surface==='table'&&m.table?.visible>.5,boat=id==='ship',aimed=id==='bow'&&owner?.disguise<.5&&['aim','string','released'].includes(owner?.mode),bob=boat?Math.sin(this.phase/1650)*(1.4+m.storm*2):id==='siren'?Math.sin(this.phase/2100)*1.2:0;
   const integrated=id==='wreck'&&m.actors.odysseus.mode==='cling',depthOffset=this.reader.story.visuals.objects[id].depthOffset,tableOffset=this.reader.story.visuals.objects.table?.depthOffset??55;s.setPosition(p.x,p.y+bob).setAlpha(aimed||integrated?0:v.visible*s.layerAlpha*(owner?owner.visible:1)*((target.hiddenActors||[]).includes(v.owner)?0:1)).setDepth(owner?owner.y+1:boat?p.y-180:depthOffset!==undefined?p.y-depthOffset:id==='table'?p.y-55:onTable?m.table.y-tableOffset+1:id==='bed'?p.y-48:p.y-1).setRotation(boat?Math.sin(this.phase/1900)*(.008+m.storm*.05):0).setFlipX(owner?.facing==='left'||v.flip>.5);
  }
  if(this.hull){const boat=this.objects.ship;this.hull.setPosition(boat.x,boat.y).setRotation(boat.rotation).setAlpha(boat.alpha).setDepth(Math.max(m.ship.y,...Object.values(m.actors).filter(a=>a.onboard>.5).map(a=>a.y))+2);}
  for(const[i,s]of this.returnSailors.entries()){s.setPosition(m.ship.x+(i?120:-170),m.ship.y-52).setAlpha(m.ship.visible*(m.ship.crew||0)).setDepth(m.ship.y-48);}
  if(this.objects.ship){const boat=this.objects.ship;if(m.actors.odysseus.mode==='bound')boat.setCrop(0,100,boat.width,boat.height-100);else boat.setCrop();}
  for(const[i,s]of this.crewShadows.entries()){const loss=Phaser.Math.Clamp((m.lostCrew-i*.11)/.45,0,1),x=m.ship.x-100+i*38;s.setPosition(x+(690-x)*loss,m.ship.y-140-90*loss).setAlpha(m.room==='strait'?(this.objects.ship?.alpha||0)*.85*(1-loss):0).setDepth(m.ship.y-80);}
  for(const[id,p]of Object.entries(this.people)){
   // A camera cut reveals people already present; it is not a new entrance.
   p.layerAlpha=(target.hiddenActors||[]).includes(id)?0:1;
   const a=m.actors[id],held=Object.entries(this.objects).some(([key])=>m[key].owner===id&&m[key].visible>.5),col=a.mode==='reach'||a.pose==='reach'||held?3:a.facing==='back'?2:a.facing==='front'?0:1;
   if(a.pose==='walk'&&p.last&&!instant){const d=Math.hypot(a.x-p.last.x,a.y-p.last.y);if(d<60)p.distance+=d;}else if(a.pose!=='walk')p.distance=0;p.last={x:a.x,y:a.y};
   const walking=a.pose==='walk',walkCol=a.facing==='back'?2:a.facing==='front'?0:1,base=a.mode&&this.textures.exists('hc-pose-'+a.mode)?'hc-pose-'+a.mode:walking?`hc-${id}-walk-${walkCol}-${Math.floor(p.distance/6)%8}`:`hc-${id}-${col}`,pos=this.actorPosition(id),s=p.actor;
   s.setTexture(base).setFlipX(a.facing==='left').setPosition(pos.x,pos.y+a.bow*4).setScale(1,1-a.bow*.04).setRotation(a.bow*(a.facing==='left'?-.035:.035)).setAlpha(a.visible*p.layerAlpha*(id==='odysseus'&&a.mode!=='beggarSeated'?1-a.disguise:1)).setDepth(pos.y);
   if(a.onboard>.5&&a.mode!=='sleep')s.setCrop(0,0,s.width,s.height*.78);else s.setCrop();p.shadow.setPosition(pos.x,pos.y-2).setDepth(pos.y-.5).setAlpha(a.onboard>.5||a.ghost>.5?0:a.visible*p.layerAlpha*.16);
   if(id==='odysseus'&&this.disguiseActor){this.disguiseActor.setTexture(walking?`hc-disguise-walk-${walkCol}-${Math.floor(p.distance/6)%8}`:'hc-disguise-'+col).setFlipX(a.facing==='left').setPosition(pos.x,pos.y+a.bow*4).setAlpha(a.mode==='beggarSeated'?0:a.visible*p.layerAlpha*a.disguise).setDepth(pos.y+.01);}
  }
  this.ambient(m);
  keepCameraInsideEnvironment(this);
 }
 ambient(m){
  const g=this.ambientInk;g.clear();const room=this.reader.story.visuals.rooms[m.room];
  if(room.water)for(let i=0;i<30;i++){const x=520+i*47%560,y=750+i*59%1050;g.fillStyle(0xdaefed,.06+.025*Math.sin(this.phase/2100+i));g.fillRect(Math.round(x+Math.sin(this.phase/2900+i)*3),y,12+i%4*5,2);}
  if(room.leaves)for(let i=0;i<8;i++){g.fillStyle(0xe6dca4,.08+.03*Math.sin(this.phase/2900+i));g.fillRect(520+i*81,1000+i%4*43,4,2);}
  const e=this.effectsInk;e.clear();if(m.storm>.01)for(let i=0;i<12;i++){const x=500+i*71%640+Math.sin(this.phase/1300+i)*5,y=1100+i*43;e.fillStyle(0xe5ece7,m.storm*.2);e.fillRect(Math.round(x/2)*2,y,30,2);}
  if(m.dogSleep>.5&&m.dog?.visible>.5){const s=this.objects.dog;const x=s.x+s.displayWidth*.28,y=s.y-s.displayHeight*.7;e.fillStyle(0xb68b56,m.dog.visible);e.fillRect(x-4,y-2,8,5);e.fillStyle(0x402c20,m.dog.visible);e.fillRect(x-3,y,7,2);}
  if(this.reader.step?.id.endsWith('the-ship-breaks')&&this.reader.elapsed<650){const opacity=.35*Math.sin(Math.PI*this.reader.elapsed/650);e.lineStyle(4,0xf3ebd4,opacity);e.beginPath();e.moveTo(m.ship.x+20,m.ship.y-360);e.lineTo(m.ship.x-10,m.ship.y-280);e.lineTo(m.ship.x+25,m.ship.y-285);e.lineTo(m.ship.x,m.ship.y-160);e.strokePath();}
  if(m.brazier?.visible>.5){const p=m.brazier;e.fillStyle(0xe8b770,.09+.02*Math.sin(this.phase/1900));e.fillRect(p.x-22,p.y-67,44,6);}
 }
 diagnostics(){
  const f=this.framing,z=f.z,m=this.reader.model,shot=this.bounds(),project=(x,y)=>({x:(x-f.x)*z+this.scale.width/2,y:(y-f.y)*z+this.scale.height/2});
  return{width:this.scale.width,height:this.scale.height,room:m.room,shot:m.view,marker:null,ambientTime:this.phase,requiredActors:shot.actors.filter(id=>m.actors[id].visible>.5),requiredProps:(shot.props||[]).filter(id=>m[id].visible>.5),landmarks:(shot.landmarks||[]).map(id=>{const p=this.reader.story.landmarks[id];return{id,top:project(p.x,p.y-p.h/2),bottom:project(p.x,p.y+p.h/2),left:project(p.x-p.w/2,p.y),right:project(p.x+p.w/2,p.y)}}),actors:Object.fromEntries(Object.entries(m.actors).map(([id,a])=>{const p=this.actorPosition(id),pad=this.actorWidth(id)/2;return[id,{...project(p.x,p.y),head:project(p.x,p.y-this.actorHeight(id)),left:project(p.x-pad,p.y),right:project(p.x+pad,p.y),visible:a.visible*(this.people[id]?.layerAlpha??1),disguise:a.disguise,mode:a.mode}];})),props:Object.fromEntries(Object.keys(this.objects).map(id=>{const p=this.propPosition(id),s=this.objects[id];return[id,{...project(p.x,p.y),top:project(p.x,p.y-s.displayHeight),left:project(p.x-s.displayWidth/2,p.y),right:project(p.x+s.displayWidth/2,p.y),visible:m[id].visible}];}))};
 }
}
