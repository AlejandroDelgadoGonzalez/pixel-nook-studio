import {drawCharacter,createPixelWalkFrames} from '../../../platform/rendering/character-art.js';
import {odysseyCharacterCell} from '../shared/atlas-cells.js';
import {installShotDissolve} from '../../../platform/rendering/shot-dissolve.js';
import {preloadLandscape,fitEnvironment,prepareLandscapeShot,cameraCenterX,refreshEnvironmentEdges,keepCameraInsideEnvironment,landscapeView} from '../../../platform/rendering/environments.js';

export class Aeaea extends Phaser.Scene {
 constructor(engine,ready){super('aeaea');this.reader=engine;this.ready=ready;this.phase=0;this.framing=null;this.room=null;this.roomFade=900;}
 preload(){for(const[key,url]of Object.entries(this.reader.story.assets))this.load.image('ae-'+key,url);preloadLandscape(this);}
 cut(key,atlas,col,row,height,character=false){
  const source=this.textures.get('ae-'+atlas).getSourceImage();
  const grids={hero:{x:[0,321,641,962,1254],y:[0,337,643,970,1254],w:1254,h:1254},crew:{x:[0,298,620,912,1227],y:[0,337,640,939,1281],w:1227,h:1281},people:{x:[0,399,770,1130,1536],y:[0,346,691,1024],w:1536,h:1024},props:{x:row===0?[0,423,894,1302,1774]:[0,442,847,1295,1774],y:[0,482,887],w:1774,h:887},boatAtlas:{x:[0,525,922,1267,1774],y:[0,491,887],w:1774,h:887},actions:{x:[0,850,1774],y:[0,887],w:1774,h:887}};
  grids.fleetCrew={x:[0,.5,1],y:[0,.5,1],w:1,h:1};
  const grid=grids[atlas],xs=grid.x.map(n=>Math.round(n*source.width/grid.w)),ys=grid.y.map(n=>Math.round(n*source.height/grid.h));
  const cell=character&&atlas==='hero'?odysseyCharacterCell(source,col,row):{x:xs[col],y:ys[row],w:xs[col+1]-xs[col],h:ys[row+1]-ys[row]},w=cell.w,h=cell.h;
  const scan=document.createElement('canvas');scan.width=w;scan.height=h;const c=scan.getContext('2d',{willReadFrequently:true});c.drawImage(source,cell.x,cell.y,w,h,0,0,w,h);
  const pixels=c.getImageData(0,0,w,h).data;let left=w,right=-1,top=h,bottom=-1;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(pixels[(y*w+x)*4+3]>80){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
  if(right<left)throw new Error('Missing Aeaea sprite '+key);
  const sw=right-left+1,sh=bottom-top+1,width=Math.max(2,Math.round(sw/sh*height/2)*2),texture=this.textures.createCanvas(key,width,height);texture.context.imageSmoothingEnabled=false;
  if(character)drawCharacter(texture.context,scan,left,top,sw,sh,width,height);else texture.context.drawImage(scan,left,top,sw,sh,0,0,width,height);
  texture.refresh();return texture;
 }
 walkFrames(id,col){createPixelWalkFrames(this,'ae',id,col);}
 create(){
  for(const [room,config] of Object.entries(this.reader.story.visuals?.rooms||{})){
   const source=this.textures.get('ae-'+room).getSourceImage(),texture=this.textures.createCanvas('ae-'+room+'-native',source.width,source.height*3);
   texture.context.imageSmoothingEnabled=false;texture.context.drawImage(source,source.width/3,0,source.width/3,source.height,0,0,source.width,source.height*3);texture.refresh();
  }
  this.background=this.add.image(768,0,'ae-court').setOrigin(.5,0).setDepth(0);this.previousBackground=this.add.image(768,0,'ae-court').setOrigin(.5,0).setDepth(1).setAlpha(0);this.roomHeights={};
  this.sides=[-768,2304].map(x=>this.add.image(x,0,'ae-court').setOrigin(.5,0).setDepth(0));
  this.previousSides=[-768,2304].map(x=>this.add.image(x,0,'ae-court').setOrigin(.5,0).setDepth(1).setAlpha(0));
  for(const room of Object.keys(this.landscapeRooms)){const im=this.textures.get(this.nativeTexture(room)).getSourceImage();this.roomHeights[room]=1536*im.height/im.width;const floor=this.textures.createCanvas('ae-floor-'+room,1536,192);floor.context.imageSmoothingEnabled=false;floor.context.drawImage(im,0,Math.max(0,im.height-192),im.width,Math.min(192,im.height),0,0,1536,192);floor.refresh();}
  this.floor=this.add.tileSprite(768,1534,4608,1200,'ae-floor-court').setOrigin(.5,0).setDepth(-1);this.previousFloor=this.add.tileSprite(768,1534,4608,1200,'ae-floor-court').setOrigin(.5,0).setDepth(-.5).setAlpha(0);
  this.people={};this.portraits={};
  const cast={odysseus:['hero',0],eurylochus:['crew',1],aeolus:['people',0],circe:['people',1],polites:['people',2],hermes:['hero',2]};
  for(const[id,[atlas,row]]of Object.entries(cast)){
   for(let col=0;col<4;col++){const texture=this.cut(`ae-${id}-${col}`,atlas,col,row,id==='odysseus'&&col===3?112:136,true);if(col===0){const face=this.textures.createCanvas('ae-face-'+id,80,80);face.context.imageSmoothingEnabled=false;face.context.drawImage(texture.getSourceImage(),0,0,texture.width,texture.height*.53,0,0,80,80);face.refresh();this.portraits[id]=face.getSourceImage().toDataURL();}}
   for(const col of [0,1,2])this.walkFrames(id,col);
   this.people[id]={actor:this.add.image(0,0,`ae-${id}-0`).setOrigin(.5,1),shadow:this.add.ellipse(0,0,60,12,0x241e18,.16),last:null,distance:0};
  }
  this.cut('ae-odysseus-sleep','actions',0,0,104,true);this.cut('ae-giant','actions',1,0,170,true);this.giants=[635,900].map((x,i)=>this.add.image(x,285,'ae-giant').setOrigin(.5,1).setAlpha(0).setDepth(2).setFlipX(!!i));this.giant=this.giants[0];
  this.objects={};
  for(const[col,row,id,height]of [[0,0,'bag',50],[1,0,'bag-open',50],[2,0,'moly',50],[3,0,'pig',78],[0,1,'cup',30],[1,1,'wand',62],[2,1,'table',130],[3,1,'wreck1',100]])this.cut('ae-'+id,'props',col,row,height);
  this.cut('ae-ship','boatAtlas',0,0,232);this.cut('ae-stone','boatAtlas',3,0,44);
  for(const id of ['ship','bag','moly','cup','wand','table','wreck1','stone'])this.objects[id]=this.add.image(0,0,'ae-'+id).setOrigin(.5,1);
  this.objects.ship.setScale(1.65,1);
  for(const id of ['fleet1','fleet2'])this.objects[id]=this.add.image(0,0,'ae-ship').setOrigin(.5,1).setScale(.68);
  this.objects.wreck2=this.add.image(0,0,'ae-wreck1').setOrigin(.5,1);
  this.objects.stone2=this.add.image(0,0,'ae-stone').setOrigin(.5,1);
  this.people.polites.pig=this.add.image(0,0,'ae-pig').setOrigin(.5,1).setAlpha(0);
  const ship=this.textures.get('ae-ship').getSourceImage(),hull=this.textures.createCanvas('ae-hull',ship.width,50);hull.context.imageSmoothingEnabled=false;hull.context.drawImage(ship,0,ship.height-50,ship.width,50,0,0,ship.width,50);hull.refresh();this.hull=this.add.image(0,0,'ae-hull').setOrigin(.5,1).setScale(1.65,1);
  this.fleetSailors={};
  for(let row=0;row<2;row++)for(let col=0;col<2;col++)this.cut(`ae-sailor-${row*2+col}`,'fleetCrew',col,row,136,true);
  for(const [index,id]of ['fleet1','fleet2'].entries())this.fleetSailors[id]={sailors:[0,1].map(i=>{const s=this.add.image(0,0,`ae-sailor-${index*2+i}`).setOrigin(.5,1).setScale(.46);return s.setCrop(0,0,s.width,s.height*.75);}),hull:this.add.image(0,0,'ae-hull').setOrigin(.5,1).setScale(.68)};
  this.water=this.add.graphics().setDepth(2);this.wind=this.add.graphics().setDepth(1500);this.magic=this.add.graphics().setDepth(1500);installShotDissolve(this);this.ready(this);this.draw(0,true);
 }
 update(_,delta){const dt=Math.min(delta,100);if(!this.reader.paused){this.phase+=dt;this.reader.tick(dt);this.onTick?.(dt);}this.draw(this.reader.paused?0:dt);}
 bounds(){return this.reader.story.shots[this.reader.model.view];}
 nativeTexture(room){return 'ae-'+room+(this.reader.story.visuals?.rooms?.[room]?.nativeBounds?'-native':'');}
 actorHeight(id){const a=this.reader.model.actors[id];return a.sleeping>.5?104:a.pig>.5?78:136;}
 actorPosition(id){const a=this.reader.model.actors[id];return{x:a.x,y:a.y+(a.onboard>.5?Math.sin(this.phase/1450)*(2+this.reader.model.storm*2):0)};}
 actorFootOffset(id){const a=this.reader.model.actors[id],next=this.cameraWalk?.effects.actors?.[id]||{};return Math.max(a.bow,next.bow??a.bow)*4;}
 propOpacity(id){const p=this.reader.model[id];return p.visible*(p.owner?this.reader.model.actors[p.owner].visible:1);}
 hand(id,prop){const a=this.reader.model.actors[id];if(!a)return null;const position=this.actorPosition(id),direction=a.facing==='left'?-1:1;
  if(prop==='cup'){const reach=a.pose==='reach',front=a.facing==='front'||a.facing==='back';return{x:position.x+direction*(reach?46:front?25:27),y:position.y-(reach?46:43)-(this.reader.model[prop]?.lift||0)};}
  if(prop==='moly'&&this.reader.model.cup.owner===id)return{x:position.x-direction*34,y:position.y-26};
  return{x:position.x+direction*(prop==='moly'?34:prop==='wand'?68:40),y:position.y-(prop==='bag'?14:prop==='moly'?26:prop==='wand'?25:56)-(this.reader.model[prop]?.lift||0)};
 }
 propPosition(id){
  const p=this.reader.model[id],s=this.reader.step,change=s?.type==='action'?s.effects[id]:null;
  if(change&&Object.hasOwn(change,'owner')&&change.owner!==this.reader.startModel[id].owner){const start=this.hand(this.reader.startModel[id].owner,id)||this.reader.startModel[id],end=this.hand(change.owner,id)||{x:change.x??p.x,y:change.y??p.y},progress=Math.min(1,this.reader.elapsed/s.duration),t=progress*progress*(3-2*progress);return{x:start.x+(end.x-start.x)*t,y:start.y+(end.y-start.y)*t-Math.sin(progress*Math.PI)*3};}
  return this.hand(p.owner,id)||p;
 }
 draw(dt,instant=false){
  const m=this.reader.model,w=this.scale.width,h=this.scale.height,target={...this.bounds()},top=landscapeView(this)&&target.safeTop!==undefined?target.safeTop:this.safeTopInset||Math.min(65,h*.1),reading=(this.readingHeight||h)-(this.safeTopInset?0:top);
  prepareLandscapeShot(this,target);
  if(this.room!==m.room){if(this.room&&!instant){fitEnvironment(this,this.previousBackground,this.room,this.nativeTexture(this.room),this.roomHeights[this.room]);this.previousBackground.setAlpha(1);this.previousSides.forEach((s,i)=>fitEnvironment(this,s,this.room,this.nativeTexture(this.room),this.roomHeights[this.room],i));this.previousFloor.setTexture('ae-floor-'+this.room).setY(this.roomHeights[this.room]-2).setAlpha(1);this.roomFade=0;}else this.roomFade=900;fitEnvironment(this,this.background,m.room,this.nativeTexture(m.room),this.roomHeights[m.room]);this.sides.forEach((s,i)=>fitEnvironment(this,s,m.room,this.nativeTexture(m.room),this.roomHeights[m.room],i));this.floor.setTexture('ae-floor-'+m.room).setY(this.roomHeights[m.room]-2);this.room=m.room;}
  refreshEnvironmentEdges(this);this.roomFade=Math.min(900,this.roomFade+dt);this.previousBackground.setAlpha(instant?0:1-this.roomFade/900);this.previousFloor.setAlpha(this.previousBackground.alpha);
  for(const s of this.previousSides)s.setAlpha(this.previousBackground.alpha);
  const step=this.reader.step,lookAhead=this.reader.story.steps.slice(this.reader.index+1,this.reader.index+5);let next=null;
  if(step?.effects?.view)for(const candidate of lookAhead){if(candidate.camera?.hold){next=candidate;break;}if(candidate.type!=='action'||candidate.duration>350||candidate.effects.view)break;}
  const walk=step?.camera?.hold?step:next,rects=[];this.cameraWalk=walk;
  for(const id of target.actors){const a=this.actorPosition(id),change=walk?.effects.actors?.[id],start=walk===step?this.reader.startModel.actors[id]:m.actors[id];if(m.actors[id].visible<.1&&!change?.visible)continue;const points=change?[walk.presence?.[id]?.from||start,...(walk.paths?.[id]||[]),{x:change.x??start.x,y:change.y??start.y}]:[a];for(const p of points)rects.push({l:p.x-76,r:p.x+76,t:p.y-this.actorHeight(id)-18,b:p.y+Math.max(18,this.actorFootOffset(id)+8)});}
  for(const id of target.props){
   const p=m[id],change=walk?.effects[id],s=this.objects[id],owner=p.owner&&m.actors[p.owner],ownerChange=walk?.effects.actors?.[p.owner];
   if(this.propOpacity(id)<.1&&!change?.visible&&!ownerChange?.visible)continue;
   const position=this.propPosition(id),points=[];
   if(owner){
    const start=walk===step?this.reader.startModel.actors[p.owner]:owner,origin=walk?.presence?.[p.owner]?.from||start,offset={x:position.x-owner.x,y:position.y-owner.y};
    for(const point of [origin,...(walk?.paths?.[p.owner]||[]),{x:ownerChange?.x??origin.x,y:ownerChange?.y??origin.y}])points.push({x:point.x+offset.x,y:point.y+offset.y});
   }else points.push(position);
   if(change&&(change.x!==undefined||change.y!==undefined))points.push({x:change.x??p.x,y:change.y??p.y});
   for(const point of points)rects.push({l:point.x-s.displayWidth/2-30,r:point.x+s.displayWidth/2+30,t:point.y-s.displayHeight-24,b:point.y+24});
  }
  for(const id of target.landmarks){const p=this.reader.story.landmarks[id];rects.push({l:p.x-p.w/2,r:p.x+p.w/2,t:p.y-p.h/2,b:p.y+p.h/2});}
  if(rects.length){const l=Math.min(...rects.map(r=>r.l)),r=Math.max(...rects.map(r=>r.r)),t=Math.min(...rects.map(r=>r.t)),b=Math.max(...rects.map(r=>r.b));target.w=Math.max(target.w,r-l);target.h=Math.max(target.h,b-t);target.cx=Math.max(r-target.w/2,Math.min(target.cx,l+target.w/2));target.cy=Math.max(b-target.h/2,Math.min(target.cy,t+target.h/2));}
  const nativeExterior=!landscapeView(this)&&this.reader.story.visuals?.rooms?.[m.room]?.nativeBounds,worldHeight=nativeExterior?this.background.displayHeight:Math.max(2734,this.roomHeights[m.room]+600),z=Math.max(w/(nativeExterior?1536:4608),h/worldHeight,Math.min((this.safeWidth||w)/target.w,reading/target.h)),dest={x:cameraCenterX(this,target.cx+(this.safeCenterOffset||0)/z,z),y:Phaser.Math.Clamp(target.cy+(h-reading)/(2*z)-top/z,h/(2*z),worldHeight-h/(2*z)),z};
  if(!landscapeView(this)&&rects.length){const safeW=this.safeWidth||w,left=w/2-safeW/2+(this.safeCenterOffset||0),right=left+safeW,bottom=this.readingHeight||h,l=Math.max(...rects.map(r=>r.r))+(w/2-right)/z,r=Math.min(...rects.map(r=>r.l))+(w/2-left)/z,t=Math.max(...rects.map(r=>r.b))+(h/2-bottom)/z,b=Math.min(...rects.map(r=>r.t))+(h/2-top)/z;if(l<=r)dest.x=Phaser.Math.Clamp(dest.x,l,r);if(t<=b)dest.y=Phaser.Math.Clamp(dest.y,t,b);}
  keepCameraInsideEnvironment(this,dest,true);
  if(!this.framing||instant||this.oldWidth!==w||this.oldHeight!==h){this.framing={...dest};this.cameraMove=null;}
  else {
   if(this.cameraMove&&this.cameraMove.id!==step?.id){this.framing={...this.cameraMove.dest};this.cameraMove=null;}
   if(!step?.camera?.hold&&step?.type==='action'&&step.effects.view){if(!this.cameraMove)this.cameraMove={id:step.id,from:{...this.framing},dest};this.cameraMove.dest={...dest};const p=Math.min(1,this.reader.elapsed/step.duration),t=p*p*(3-2*p);for(const k of ['x','y','z'])this.framing[k]=this.cameraMove.from[k]+(dest[k]-this.cameraMove.from[k])*t;}
   else if(dt&&!step?.camera?.hold){const ease=1-Math.exp(-dt/750);for(const k of ['x','y','z'])this.framing[k]+=(dest[k]-this.framing[k])*ease;}
  }
  this.oldWidth=w;this.oldHeight=h;this.cameras.main.setZoom(this.framing.z).centerOn(this.framing.x,this.framing.y);
  this.objects.bag.setTexture(m.bagOpen>.5?'ae-bag-open':'ae-bag');
  for(const[id,s]of Object.entries(this.objects)){const p=this.propPosition(id),v=m[id],boat=id==='ship'||id.startsWith('fleet'),onTable=['cup','moly','wand'].includes(id)&&!v.owner&&m.room==='forest'&&m.table.visible>.5,bob=boat?Math.sin(this.phase/1450)*(2+m.storm*2):0;s.setPosition(p.x,p.y+bob).setAlpha(v.visible*(v.owner?m.actors[v.owner].visible:1)).setDepth(v.owner?m.actors[v.owner].y+1:boat?p.y-180:id==='table'?p.y-55:onTable?m.table.y-54:p.y-1);s.setRotation(boat?Math.sin(this.phase/1700)*(.012+m.storm*.055):0);s.setFlipX(v.owner?m.actors[v.owner].facing==='left':false);}
  for(const[id,group]of Object.entries(this.fleetSailors)){const boat=this.objects[id];group.sailors.forEach((s,i)=>s.setPosition(boat.x+(i?23:-23),boat.y-34).setAlpha(boat.alpha).setDepth(boat.y-32));group.hull.setPosition(boat.x,boat.y).setAlpha(boat.alpha).setRotation(boat.rotation).setDepth(boat.y+1);}
  const boat=this.objects.ship;this.hull.setPosition(boat.x,boat.y).setRotation(boat.rotation).setAlpha(m.ship.visible).setDepth(Math.max(m.ship.y,...Object.values(m.actors).filter(a=>a.onboard>.5).map(a=>a.y))+2);
  for(const[id,p]of Object.entries(this.people)){
   const a=m.actors[id],holding=['bag','cup','wand'].some(key=>m[key].owner===id&&m[key].visible>.5),col=a.pose==='reach'||holding?3:a.facing==='back'?2:a.facing==='front'?0:1;
   if(a.pose==='walk'&&p.last&&!instant){const d=Math.hypot(a.x-p.last.x,a.y-p.last.y);if(d<60)p.distance+=d;}else if(a.pose!=='walk')p.distance=0;p.last={x:a.x,y:a.y};
   const walking=a.pose==='walk',walkCol=a.facing==='back'?2:a.facing==='front'?0:1,base=a.sleeping>.5?'ae-odysseus-sleep':walking?`ae-${id}-walk-${walkCol}-${Math.floor(p.distance/6)%8}`:`ae-${id}-${col}`,pos=this.actorPosition(id),s=p.actor;
   s.setTexture(base).setFlipX(a.facing==='left').setPosition(pos.x,pos.y+a.bow*4).setScale(1,1-a.bow*.06).setRotation(a.bow*(a.facing==='left'?-.04:.04)).setAlpha(a.visible*(1-a.pig)).setDepth(pos.y);
   if(a.onboard>.01&&a.sleeping<.5)s.setCrop(0,0,s.width,s.height*(1-.25*a.onboard));else s.setCrop();
   p.pig?.setPosition(pos.x,pos.y).setFlipX(a.facing==='left').setAlpha(a.visible*a.pig).setDepth(pos.y);
   p.shadow.setPosition(pos.x,pos.y-2).setDepth(pos.y-.5).setAlpha(a.onboard>.5?0:a.visible*.16);
  }
  // The authored overhead rock leaves the hands when the falling rock starts.
  for(const giant of this.giants){giant.setAlpha(m.giant).setY(285);if(m.throwing>.01)giant.setCrop(0,43,giant.width,giant.height-43);else giant.setCrop();}
  this.ambient(m);
  keepCameraInsideEnvironment(this);
 }
 ambient(m){
  this.water.clear();if(['home','sea','harbor'].includes(m.room))for(let i=0;i<34;i++){const x=420+i*53%690,y=680+i*37%750;this.water.fillStyle(0xe0f7ed,.06+.04*Math.sin(this.phase/1900+i));this.water.fillRect(Math.round(x+Math.sin(this.phase/2600+i)*5),y,12+(i%4)*6,2);}
  this.wind.clear();if(m.storm>.01){const p=this.propPosition('bag');for(let n=0;n<8;n++){const q=(this.phase/3600+n/8)%1,x=p.x+(q-.2)*410,y=p.y-32-n*20-Math.sin(q*5+n)*15;this.wind.fillStyle(0xe5ede4,m.storm*.3*(1-q));this.wind.fillRect(Math.round(x/2)*2,Math.round(y/2)*2,28+n*3,2);}}
  this.magic.clear();if(m.spell>.01&&m.room==='forest'){const a=m.actors.polites;for(let n=0;n<9;n++){const x=a.x+Math.cos(this.phase/2100+n)*49,y=a.y-40+Math.sin(this.phase/2300+n)*40;this.magic.fillStyle(0xf9d699,.32*m.spell);this.magic.fillRect(Math.round(x/2)*2,Math.round(y/2)*2,4,4);}}
  if(m.room==='forest')for(let n=0;n<8;n++){this.water.fillStyle(0xf8d889,.11+.035*Math.sin(this.phase/2700+n));this.water.fillRect(470+n*86,670+n%3*52,4,2);}
 }
 diagnostics(){
  const f=this.framing,z=f.z,m=this.reader.model,shot=this.bounds(),project=(x,y)=>({x:(x-f.x)*z+this.scale.width/2,y:(y-f.y)*z+this.scale.height/2});
  return{width:this.scale.width,height:this.scale.height,room:m.room,shot:m.view,marker:null,ambientTime:this.phase,requiredActors:shot.actors.filter(id=>m.actors[id].visible>.5),requiredProps:shot.props.filter(id=>m[id].visible>.5),landmarks:shot.landmarks.map(id=>{const p=this.reader.story.landmarks[id];return{id,top:project(p.x,p.y-p.h/2),bottom:project(p.x,p.y+p.h/2),left:project(p.x-p.w/2,p.y),right:project(p.x+p.w/2,p.y)}}),actors:Object.fromEntries(Object.entries(m.actors).map(([id,a])=>{const p=this.actorPosition(id);return[id,{...project(p.x,p.y),head:project(p.x,p.y-this.actorHeight(id)),visible:a.visible}];})),props:Object.fromEntries(Object.keys(this.objects).map(id=>{const p=this.propPosition(id),s=this.objects[id];return[id,{...project(p.x,p.y),top:project(p.x,p.y-s.displayHeight),left:project(p.x-s.displayWidth/2,p.y),right:project(p.x+s.displayWidth/2,p.y),visible:m[id].visible}];})),bagOpen:m.bagOpen};
 }
}
