import {drawCharacter,createPixelWalkFrames} from '../../../platform/rendering/character-art.js';
import {installShotDissolve} from '../../../platform/rendering/shot-dissolve.js';
import {preloadLandscape,fitEnvironment,prepareLandscapeShot,cameraCenterX,refreshEnvironmentEdges,landscapeView,keepCameraInsideEnvironment} from '../../../platform/rendering/environments.js';

// The flashback uses the existing reader clock and the same character pixel grid.
export class Cyclops extends Phaser.Scene {
 constructor(engine,ready){super('cyclops');this.reader=engine;this.ready=ready;this.phase=0;this.framing=null;this.room=null;this.roomFade=900;}
 preload(){for(const[key,url]of Object.entries(this.reader.story.assets))this.load.image('cy-'+key,url);preloadLandscape(this);}
 cut(key,atlas,col,row,height,character=false){
  const source=this.textures.get('cy-'+atlas).getSourceImage();
  const original=atlas==='hero',people=atlas==='people',extra=atlas==='under'||atlas==='giantActions';
  const xs=(original?[0,321,641,962,1254]:people?[0,298,620,912,1227]:extra?[0,.5,1]:row===0?[0,525,922,1267,1774]:[0,444,920,1338,1774]).map(n=>Math.round(n*source.width/(original?1254:people?1227:extra?1:1774)));
  const ys=(original?[0,337,643,970,1254]:people?[0,337,640,939,1281]:extra?[0,1]:[0,491,887]).map(n=>Math.round(n*source.height/(original?1254:people?1281:extra?1:887))),w=xs[col+1]-xs[col],h=ys[row+1]-ys[row];
  const scan=document.createElement('canvas');scan.width=w;scan.height=h;const c=scan.getContext('2d',{willReadFrequently:true});c.drawImage(source,xs[col],ys[row],w,h,0,0,w,h);
  const pixels=c.getImageData(0,0,w,h).data;let left=w,right=-1,top=h,bottom=-1;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(pixels[(y*w+x)*4+3]>80){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
  if(right<left)throw new Error('Missing Cyclops sprite '+key);
  const sw=right-left+1,sh=bottom-top+1,width=Math.max(2,Math.round(sw/sh*height/2)*2),texture=this.textures.createCanvas(key,width,height);texture.context.imageSmoothingEnabled=false;
  if(character)drawCharacter(texture.context,scan,left,top,sw,sh,width,height);else texture.context.drawImage(scan,left,top,sw,sh,0,0,width,height);
  texture.refresh();return texture;
 }
 walkFrames(id,col){createPixelWalkFrames(this,'cy',id,col);}
 closeEye(key){
  const image=this.textures.get(key).getSourceImage(),w=image.width,h=image.height,texture=this.textures.createCanvas(key+'-blind',w,h),c=texture.context;c.imageSmoothingEnabled=false;c.drawImage(image,0,0);
  const pixels=c.getImageData(0,0,w,h).data;let l=w,r=-1,t=h,b=-1;
  for(let y=Math.floor(h*.14);y<h*.49;y++)for(let x=Math.floor(w*.25);x<w*.85;x++){const i=(y*w+x)*4;if(pixels[i+3]>80&&pixels[i]>215&&pixels[i+1]>215&&pixels[i+2]>180){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}}
  if(r>=l){l=Math.max(0,Math.floor(l/2)*2-2);t=Math.max(0,Math.floor(t/2)*2-2);const width=Math.ceil((r-l+3)/2)*2,height=Math.ceil((b-t+3)/2)*2;c.fillStyle='#d3945e';c.fillRect(l,t,width,height);c.fillStyle='#38251b';c.fillRect(l,t+Math.floor(height*.55/2)*2,width,4);}
  texture.refresh();
 }
 create(){
  this.background=this.add.image(768,0,'cy-coast').setOrigin(.5,0).setDisplaySize(1536,1536).setDepth(0);
  this.previousBackground=this.add.image(768,0,'cy-coast').setOrigin(.5,0).setDisplaySize(1536,1536).setDepth(1).setAlpha(0);
  this.sides=[-768,2304].map(x=>this.add.image(x,0,'cy-coast').setOrigin(.5,0).setDepth(0));
  this.previousSides=[-768,2304].map(x=>this.add.image(x,0,'cy-coast').setOrigin(.5,0).setDepth(1).setAlpha(0));
  this.roomHeights={};
  // The vertical crop and desktop view share exactly the same new cave exterior.
  const exterior=this.textures.get('cy-caveBeach').getSourceImage(),side=Math.round(exterior.width/3);this.textures.remove('cy-caveBeach');
  const native=this.textures.createCanvas('cy-caveBeach',side,exterior.height);native.context.imageSmoothingEnabled=false;native.context.drawImage(exterior,exterior.width*.38,0,exterior.width/3,exterior.height,0,0,side,exterior.height);native.refresh();
  for(const room of ['coast','lotus','cave','sea','caveBeach']){const image=this.textures.get('cy-'+room).getSourceImage();this.roomHeights[room]=1536*image.height/image.width;const floor=this.textures.createCanvas('cy-floor-'+room,1536,192);floor.context.imageSmoothingEnabled=false;floor.context.drawImage(image,0,image.height-192,image.width,192,0,0,1536,192);floor.refresh();}
  this.floor=this.add.tileSprite(768,1534,4608,1200,'cy-floor-coast').setOrigin(.5,0).setDepth(-1);
  this.previousFloor=this.add.tileSprite(768,1534,4608,1200,'cy-floor-coast').setOrigin(.5,0).setDepth(-.5).setAlpha(0);
  this.people={};this.portraits={};
  for(const[index,id]of Object.keys(this.reader.story.characters).entries()){
   for(let col=0;col<4;col++){
    const height=id==='polyphemus'?(col===3?180:242):id==='odysseus'&&col===3?112:136;
    const texture=this.cut(`cy-${id}-${col}`,index===0?'hero':'people',col,index===0?0:index-1,height,true);
    if(col===0){const face=this.textures.createCanvas('cy-face-'+id,80,80);face.context.imageSmoothingEnabled=false;face.context.drawImage(texture.getSourceImage(),0,0,texture.width,texture.height*.53,0,0,80,80);face.refresh();this.portraits[id]=face.getSourceImage().toDataURL();}
   }
   for(const col of [0,1,2])this.walkFrames(id,col);
   this.people[id]={actor:this.add.image(0,0,`cy-${id}-0`).setOrigin(.5,1),shadow:this.add.ellipse(0,0,id==='polyphemus'?106:60,id==='polyphemus'?18:12,0x241e18,.16),last:null,distance:0};
  }
  for(const col of [0,1]){this.closeEye(`cy-polyphemus-${col}`);for(let frame=0;frame<8;frame++)this.closeEye(`cy-polyphemus-walk-${col}-${frame}`);}
  this.cut('cy-polyphemus-offer','giantActions',0,0,242,true);this.closeEye('cy-polyphemus-offer');this.cut('cy-polyphemus-prayer','giantActions',1,0,242,true);
  for(const [col,id]of ['odysseus','eurylochus'].entries()){this.cut('cy-under-'+id,'under',col,0,74,true);this.people[id].under=this.add.image(0,0,'cy-under-'+id).setOrigin(.5,1).setAlpha(0);}
  this.objects={};
  for(const[col,row,id,height]of [[0,0,'ship',232],[1,0,'flower',30],[2,0,'cup',28],[3,0,'boulder',546],[0,1,'stake',110],[1,1,'ram',106],[2,1,'cheese',48],[3,1,'jar',66]]){this.cut('cy-'+id,'props',col,row,height);this.objects[id]=this.add.image(0,0,'cy-'+id).setOrigin(.5,1);}
  this.objects.boulder.setScale(1.04,1);
  const cup=this.textures.get('cy-cup').getSourceImage(),empty=this.textures.createCanvas('cy-cup-empty',cup.width,cup.height),ec=empty.context;ec.imageSmoothingEnabled=false;ec.drawImage(cup,0,0);const liquid=ec.getImageData(0,0,cup.width,cup.height);
  for(let y=0;y<cup.height*.27;y++)for(let x=Math.ceil(cup.width*.2);x<cup.width*.8;x++){const i=(y*cup.width+x)*4;if(liquid.data[i+3]>80&&liquid.data[i]>liquid.data[i+1]*1.5&&liquid.data[i]>liquid.data[i+2]*1.5){liquid.data[i]=62;liquid.data[i+1]=42;liquid.data[i+2]=28;}}
  ec.putImageData(liquid,0,0);empty.refresh();
  this.objects.ship.setScale(1.55,1);
  this.objects.ram2=this.add.image(0,0,'cy-ram').setOrigin(.5,1);
  this.textures.addCanvas('cy-ram-1',this.textures.get('cy-ram').getSourceImage());this.walkFrames('ram',1);this.ramMotion={ram:{distance:0,last:null},ram2:{distance:0,last:null}};this.ramShadows={};for(const id of ['ram','ram2'])this.ramShadows[id]=this.add.ellipse(0,0,92,12,0x241e18,.14);
  // A cropped copy of the actual hull occludes feet only after boarding.
  const ship=this.textures.get('cy-ship').getSourceImage(),hull=this.textures.createCanvas('cy-hull',ship.width,50);hull.context.imageSmoothingEnabled=false;hull.context.drawImage(ship,0,ship.height-50,ship.width,50,0,0,ship.width,50);hull.refresh();
  this.hull=this.add.image(0,0,'cy-hull').setOrigin(.5,1).setScale(1.55,1);
  this.water=this.add.graphics().setDepth(2);this.reactions=this.add.graphics().setDepth(1499);this.glow=this.add.graphics().setDepth(2);installShotDissolve(this);this.ready(this);this.draw(0,true);
 }
 update(_,delta){const dt=Math.min(delta,100);if(!this.reader.paused){this.phase+=dt;this.reader.tick(dt);this.onTick?.(dt);}this.draw(this.reader.paused?0:dt);}
 bounds(){return this.reader.story.shots[this.reader.model.view];}
 actorHeight(id){const a=this.reader.model.actors[id];return id==='polyphemus'?(a.seated>.5?180:242):136;}
 actorFootOffset(id){const a=this.reader.model.actors[id],change=this.cameraWalk?.effects.actors?.[id]||{};return Math.max(a.bow,change.bow??a.bow)*4+Math.max(a.hiddenUnder,change.hiddenUnder??a.hiddenUnder)*24;}
 actorPosition(id){const a=this.reader.model.actors[id],bob=a.onboard>.5&&this.reader.model.room==='sea'?Math.sin(this.phase/1450)*2:0;return{x:a.x,y:a.y+bob};}
 hand(id,prop){const a=this.reader.model.actors[id];if(!a)return null;const giant=id==='polyphemus',wine=giant&&this.reader.model.takingWine>.5,direction=a.facing==='left'?-1:1;
  if(prop==='cup'&&!giant){const reach=a.pose==='reach',front=a.facing==='front'||a.facing==='back';return{x:a.x+direction*(reach?46:front?25:27),y:a.y-(reach?46:43)-(this.reader.model[prop]?.lift||0)};}
  return{x:a.x+direction*(giant?(wine?90:72):40),y:a.y-(giant?(wine?96:62):56)-(this.reader.model[prop]?.lift||0)};
 }
 propOpacity(id){const p=this.reader.model[id],owner=this.reader.model.actors[p.owner];return p.visible*(owner?owner.visible:1);}
 propPosition(id){
  const p=this.reader.model[id],step=this.reader.step,change=step?.type==='action'?step.effects[id]:null;
  if(change&&Object.hasOwn(change,'owner')&&change.owner!==this.reader.startModel[id].owner){
   const start=this.hand(this.reader.startModel[id].owner,id)||this.reader.startModel[id],end=this.hand(change.owner,id)||{x:change.x??p.x,y:change.y??p.y},progress=Math.min(1,this.reader.elapsed/step.duration),t=progress*progress*(3-2*progress);
   return{x:start.x+(end.x-start.x)*t,y:start.y+(end.y-start.y)*t-Math.sin(progress*Math.PI)*3};
  }
  return this.hand(p.owner,id)||p;
 }
 draw(dt,instant=false){
  const m=this.reader.model,w=this.scale.width,h=this.scale.height,top=this.safeTopInset||Math.min(65,h*.1),reading=(this.readingHeight||h)-(this.safeTopInset?0:top),target={...this.bounds()};
  prepareLandscapeShot(this,target);
  if(this.room!==m.room){
   if(this.room&&!instant){fitEnvironment(this,this.previousBackground,this.room,'cy-'+this.room,this.roomHeights[this.room]);this.previousBackground.setAlpha(1);this.previousSides.forEach((s,i)=>fitEnvironment(this,s,this.room,'cy-'+this.room,this.roomHeights[this.room],i));this.previousFloor.setTexture('cy-floor-'+this.room).setY(this.roomHeights[this.room]-2).setAlpha(1);this.roomFade=0;}else this.roomFade=900;
   fitEnvironment(this,this.background,m.room,'cy-'+m.room,this.roomHeights[m.room]);this.floor.setTexture('cy-floor-'+m.room).setY(this.roomHeights[m.room]-2);this.room=m.room;
   this.sides.forEach((s,i)=>fitEnvironment(this,s,m.room,'cy-'+m.room,this.roomHeights[m.room],i));
  }
  refreshEnvironmentEdges(this);this.roomFade=Math.min(900,this.roomFade+dt);this.previousBackground.setAlpha(instant?0:1-this.roomFade/900);this.previousFloor.setAlpha(this.previousBackground.alpha);
  for(const s of this.previousSides)s.setAlpha(this.previousBackground.alpha);
  const step=this.reader.step,lookAhead=this.reader.story.steps.slice(this.reader.index+1,this.reader.index+5);let next=null;
  if(step?.effects?.view)for(const candidate of lookAhead){if(candidate.camera?.hold){next=candidate;break;}if(candidate.type!=='action'||candidate.duration>350||candidate.effects.view)break;}
  const walk=step?.camera?.hold?step:next,rects=[];this.cameraWalk=walk;
  for(const id of target.actors){const a=this.actorPosition(id),change=walk?.effects.actors?.[id],start=walk===step?this.reader.startModel.actors[id]:m.actors[id];if(m.actors[id].visible<.1&&!change?.visible)continue;const points=change?[walk.presence?.[id]?.from||start,...(walk.paths?.[id]||[]),{x:change.x??start.x,y:change.y??start.y}]:[a],large=id==='polyphemus',pad=large?165:76;
   for(const p of points)rects.push({l:p.x-pad,r:p.x+pad,t:p.y-this.actorHeight(id)-18,b:p.y+Math.max(18,this.actorFootOffset(id)+8)});
  }
  for(const id of target.props){const p=m[id],change=walk?.effects[id],s=this.objects[id];if(this.propOpacity(id)<.1&&!change?.visible)continue;const pos=this.propPosition(id),points=[pos];if(change&&(change.x!==undefined||change.y!==undefined))points.push({x:change.x??p.x,y:change.y??p.y});for(const point of points)rects.push({l:point.x-s.displayWidth/2-30,r:point.x+s.displayWidth/2+30,t:point.y-s.displayHeight-24,b:point.y+24});}
  if(rects.length){const l=Math.min(...rects.map(r=>r.l)),r=Math.max(...rects.map(r=>r.r)),t=Math.min(...rects.map(r=>r.t)),b=Math.max(...rects.map(r=>r.b));target.w=Math.max(target.w,r-l);target.h=Math.max(target.h,b-t);target.cx=Math.max(r-target.w/2,Math.min(target.cx,l+target.w/2));target.cy=Math.max(b-target.h/2,Math.min(target.cy,t+target.h/2));}
  if(step?.camera?.followProp){const prop=m[step.camera.followProp];target.cx=prop.x;target.cy=prop.y-120;}
  // The coast panorama includes continuous foreground below the original art.
  // Keep its desktop camera inside that ground without changing vertical shots.
  const coastDesktop=landscapeView(this)&&['coast','caveBeach'].includes(m.room),nativeExterior=!landscapeView(this)&&m.room==='caveBeach',worldHeight=coastDesktop||nativeExterior?this.background.displayHeight:Math.max(2734,this.roomHeights[m.room]+600),z=Math.max(w/(nativeExterior?1536:4608),h/worldHeight,Math.min((this.safeWidth||w)/target.w,reading/target.h));
  const dest={x:cameraCenterX(this,target.cx+(this.safeCenterOffset||0)/z,z),y:Phaser.Math.Clamp(target.cy+(h-reading)/(2*z)-top/z,h/(2*z),worldHeight-h/(2*z)),z};
  if(!landscapeView(this)&&rects.length){
   const safeW=this.safeWidth||w,left=w/2-safeW/2+(this.safeCenterOffset||0),right=left+safeW,bottom=this.readingHeight||h;
   const l=Math.max(...rects.map(r=>r.r))+(w/2-right)/z,r=Math.min(...rects.map(r=>r.l))+(w/2-left)/z,t=Math.max(...rects.map(r=>r.b))+(h/2-bottom)/z,b=Math.min(...rects.map(r=>r.t))+(h/2-top)/z;
   if(l<=r)dest.x=Phaser.Math.Clamp(dest.x,l,r);if(t<=b)dest.y=Phaser.Math.Clamp(dest.y,t,b);
  }
  // Constrain the destination before interpolation, so an edge correction does
  // not abruptly snap halfway through an otherwise gentle zoom.
  keepCameraInsideEnvironment(this,dest,true);
  if(!this.framing||instant||this.oldWidth!==w||this.oldHeight!==h){this.framing={...dest};this.cameraMove=null;}
  else {
   if(this.cameraMove&&this.cameraMove.id!==step?.id){this.framing={...this.cameraMove.dest};this.cameraMove=null;}
   if(!step?.camera?.hold&&step?.type==='action'&&step.effects.view){
    if(!this.cameraMove)this.cameraMove={id:step.id,from:{...this.framing},dest};this.cameraMove.dest={...dest};
    const p=Math.min(1,this.reader.elapsed/step.duration),t=p*p*(3-2*p);for(const k of ['x','y','z'])this.framing[k]=this.cameraMove.from[k]+(dest[k]-this.cameraMove.from[k])*t;
   }else if(dt&&!step?.camera?.hold){const ease=1-Math.exp(-dt/(step?.camera?.followProp?300:750));for(const k of ['x','y','z'])this.framing[k]+=(dest[k]-this.framing[k])*ease;}
  }
  if(coastDesktop)this.framing.y=Phaser.Math.Clamp(this.framing.y,h/(2*this.framing.z),worldHeight-h/(2*this.framing.z));
  this.floor.setVisible(!coastDesktop);
  this.previousFloor.setVisible(!(landscapeView(this)&&this.previousBackground.environment?.room==='coast'));
  this.oldWidth=w;this.oldHeight=h;this.cameras.main.setZoom(this.framing.z).centerOn(this.framing.x,this.framing.y);
  for(const[id,s]of Object.entries(this.objects)){
   const p=this.propPosition(id),v=m[id],bob=id==='ship'&&m.room==='sea'?Math.sin(this.phase/1450)*2:0;
   if(this.ramMotion[id]){const motion=this.ramMotion[id],moving=this.reader.step?.type==='action'&&(this.reader.step.effects[id]?.x!==undefined||this.reader.step.effects[id]?.y!==undefined);if(motion.last&&!instant&&moving){const d=Math.hypot(p.x-motion.last.x,p.y-motion.last.y);if(d<60)motion.distance+=d;}if(instant||!moving)motion.distance=0;motion.last={x:p.x,y:p.y};s.setTexture(moving?`cy-ram-walk-1-${Math.floor(motion.distance/5)%8}`:'cy-ram');this.ramShadows[id].setPosition(p.x,p.y-2).setDepth(p.y-.5).setAlpha(v.visible*.14);}
   if(id==='cup')s.setTexture(m.wineLevel<.5?'cy-cup-empty':'cy-cup');
   if(id==='ram'||id==='ram2')s.setFlipX(v.facing==='left');
   s.setPosition(p.x,p.y+bob).setAlpha(this.propOpacity(id)).setDepth(v.owner?m.actors[v.owner].y+(id==='stake'?-1:1):id==='ship'?p.y-180:id==='ram'||id==='ram2'?p.y+1:p.y-1);
   s.setRotation(id==='ship'&&m.room==='sea'?Math.sin(this.phase/1700)*.012:0);
  }
  const boat=this.objects.ship;this.hull.setPosition(boat.x,boat.y).setRotation(boat.rotation).setAlpha(m.ship.visible).setDepth(Math.max(m.ship.y,...Object.values(m.actors).filter(a=>a.onboard>.5).map(a=>a.y))+2);
  for(const[id,p]of Object.entries(this.people)){
   const a=m.actors[id],seated=a.seated>.5,hidden=a.hiddenUnder,col=seated||a.pose==='reach'?3:a.facing==='back'?2:a.facing==='front'?0:1;
   if(a.pose==='walk'&&p.last&&!instant){const distance=Math.hypot(a.x-p.last.x,a.y-p.last.y);if(distance<60)p.distance+=distance;}else if(a.pose!=='walk')p.distance=0;
   p.last={x:a.x,y:a.y};const walking=a.pose==='walk'&&!seated,walkCol=a.facing==='back'?2:a.facing==='front'?0:1,base=id==='polyphemus'&&m.praying>.5?'cy-polyphemus-prayer':id==='polyphemus'&&m.takingWine>.5&&!seated?'cy-polyphemus-offer':walking?`cy-${id}-walk-${walkCol}-${Math.floor(p.distance/6)%8}`:`cy-${id}-${col}`,texture=id==='polyphemus'&&m.blind>.5&&this.textures.exists(base+'-blind')?base+'-blind':base,pos=this.actorPosition(id),s=p.actor;
   s.setTexture(texture).setFlipX(a.facing==='left').setPosition(pos.x,pos.y+a.bow*4+hidden*22).setScale(1,1-a.bow*.08).setRotation(a.bow*(a.facing==='left'?-.05:.05)).setAlpha(a.visible*(1-hidden)).setDepth(pos.y);
   // Authored hanging poses keep heads and bodies intact beneath the wool.
   p.under?.setPosition(pos.x-6,pos.y+24).setAlpha(a.visible*hidden).setDepth(pos.y+.5);
   if(a.onboard>.01)s.setCrop(0,0,s.width,s.height*(1-.34*a.onboard));else s.setCrop();
   p.shadow.setPosition(pos.x,pos.y-2).setDepth(pos.y-.5).setAlpha(a.onboard>.5?0:a.visible*.16*(1-hidden));
  }
  this.ambient(m);this.drawReactions(m);
  keepCameraInsideEnvironment(this);
 }
 ambient(m){
  this.water.clear();if(!['cave','caveBeach'].includes(m.room))for(let i=0;i<30;i++){
   const x=250+i*79%1000,y=m.room==='lotus'?340+i*43%830:300+i*43%490;
   this.water.fillStyle(0xe0f7ed,.07+.05*Math.sin(this.phase/1900+i));this.water.fillRect(Math.round(x+Math.sin(this.phase/2600+i)*5),y,12+(i%4)*6,2);
  }
  this.glow.clear();if(m.room==='cave'){this.glow.fillStyle(0xf4b55c,.075+.008*Math.sin(this.phase/2200));this.glow.fillCircle(455,615,65);}
 }
 drawReactions(m){
  // The authored seated hands provide the contact. Never draw a stretched
  // connector between the giant's face and a passing animal.
  this.reactions.clear();
 }
 diagnostics(){
  const f=this.framing,z=f.z,m=this.reader.model,shot=this.bounds(),project=(x,y)=>({x:(x-f.x)*z+this.scale.width/2,y:(y-f.y)*z+this.scale.height/2});
  return{width:this.scale.width,height:this.scale.height,room:m.room,shot:m.view,marker:null,ambientTime:this.phase,requiredActors:shot.actors.filter(id=>m.actors[id].visible>.5),requiredProps:shot.props.filter(id=>m[id].visible>.5),landmarks:[],actors:Object.fromEntries(Object.entries(m.actors).map(([id,a])=>{const p=this.actorPosition(id);return[id,{...project(p.x,p.y),head:project(p.x,p.y-this.actorHeight(id)),visible:a.visible}];})),props:Object.fromEntries(Object.keys(this.objects).map(id=>{const p=this.propPosition(id),s=this.objects[id];return[id,{...project(p.x,p.y),top:project(p.x,p.y-s.height),left:project(p.x-s.width/2,p.y),right:project(p.x+s.width/2,p.y),visible:m[id].visible}];})),blind:m.blind};
 }
}
