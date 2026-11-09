import {drawCharacter} from '../../../platform/rendering/character-art.js';
import {installShotDissolve} from '../../../platform/rendering/shot-dissolve.js';
import {keepCameraInsideEnvironment} from '../../../platform/rendering/environments.js';

// Chapter 3: the same cast grid and reading engine, staged for portrait first.
export class Scheria extends Phaser.Scene {
 constructor(engine,ready){super('scheria');this.reader=engine;this.ready=ready;this.phase=0;this.framing=null;this.room=null;this.roomFade=900;}
 preload(){for(const[key,url]of Object.entries(this.reader.story.assets))this.load.image('sch-'+key,url);}
 cut(key,atlas,col,row,height,character=false){
  const source=this.textures.get('sch-'+atlas).getSourceImage();
  // Generated object gutters differ per row; uniform cuts would pick up neighbors.
  const xs=(atlas==='hero'?(row===3?[0,321,641,932,1254]:[0,321,641,962,1254]):atlas==='people'?[0,322,645,968,1254]:row===0?[0,514,931,1376,1774]:[0,555,931,1333,1774]).map(n=>Math.round(n*source.width/(atlas==='props'?1774:1254)));
  const ys=(atlas==='hero'?[0,337,643,970,1254]:atlas==='people'?[0,339,664,970,1254]:[0,498,887]).map(n=>Math.round(n*source.height/(atlas==='props'?887:1254))),w=xs[col+1]-xs[col],h=ys[row+1]-ys[row];
  const scan=document.createElement('canvas');scan.width=w;scan.height=h;const context=scan.getContext('2d',{willReadFrequently:true});context.drawImage(source,xs[col],ys[row],w,h,0,0,w,h);
  const pixels=context.getImageData(0,0,w,h).data;let left=w,right=-1,top=h,bottom=-1;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(pixels[(y*w+x)*4+3]>80){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
  if(right<left)throw new Error('Missing Scheria sprite '+key);
  const sw=right-left+1,sh=bottom-top+1,width=Math.max(2,Math.round(sw/sh*height/2)*2),texture=this.textures.createCanvas(key,width,height);
  texture.context.imageSmoothingEnabled=false;
  if(character)drawCharacter(texture.context,scan,left,top,sw,sh,width,height);else texture.context.drawImage(scan,left,top,sw,sh,0,0,width,height);
  texture.refresh();return texture;
 }
 walkFrames(id,col){
  const source=this.textures.get(`sch-${id}-${col}`).getSourceImage(),w=source.width,h=source.height;
  // Cuts and offsets must stay on the same two-pixel grid as drawCharacter.
  // Splitting Nausicaa's 86px front pose at x=43 sliced a foot-outline block
  // in half and left a thin black strip between her feet during walking.
  const snap=value=>Math.round(value/2)*2,leg=snap(h*.79),split=snap(w/2);
  for(let frame=0;frame<8;frame++){
   const texture=this.textures.createCanvas(`sch-${id}-walk-${col}-${frame}`,w+12,h),c=texture.context;c.imageSmoothingEnabled=false;
   const stride=Math.sin(frame*Math.PI/4),shift=snap(stride*3);
   c.drawImage(source,0,leg,split,h-leg,6+shift,leg-Math.max(0,snap(stride*2)),split,h-leg);
   c.drawImage(source,split,leg,w-split,h-leg,6+split-shift,leg-Math.max(0,snap(-stride*2)),w-split,h-leg);
   c.drawImage(source,0,0,w,leg+2,6,0,w,leg+2);texture.refresh();
  }
 }
 create(){
  this.background=this.add.image(768,768,'sch-sea').setDisplaySize(1536,1536).setDepth(0);
  this.previousBackground=this.add.image(768,768,'sch-sea').setDisplaySize(1536,1536).setDepth(1).setAlpha(0);
  for(const room of ['sea','river','hall']){const image=this.textures.get('sch-'+room).getSourceImage(),floor=this.textures.createCanvas('sch-floor-'+room,1536,192);floor.context.imageSmoothingEnabled=false;floor.context.drawImage(image,0,image.height-192,image.width,192,0,0,1536,192);floor.refresh();}
  this.floor=this.add.tileSprite(768,1534,1536,1200,'sch-floor-sea').setOrigin(.5,0).setDepth(-1);
  this.previousFloor=this.add.tileSprite(768,1534,1536,1200,'sch-floor-sea').setOrigin(.5,0).setDepth(-.5).setAlpha(0);
  this.people={};this.portraits={};
  for(const[index,id]of Object.keys(this.reader.story.characters).entries()){
   for(let col=0;col<4;col++){
    const texture=this.cut(`sch-${id}-${col}`,index===0?'hero':'people',col,index===0?0:index-1,col===3&&(id==='odysseus'||id==='demodocus')?112:136,true);
    if(col===0){const face=this.textures.createCanvas('sch-face-'+id,80,80);face.context.imageSmoothingEnabled=false;face.context.drawImage(texture.getSourceImage(),0,0,texture.width,texture.height*.53,0,0,80,80);face.refresh();this.portraits[id]=face.getSourceImage().toDataURL();}
   }
   for(const col of [0,1,2])this.walkFrames(id,col);
   this.people[id]={actor:this.add.image(0,0,`sch-${id}-0`).setOrigin(.5,1),shadow:this.add.ellipse(0,0,60,12,0x241e18,.16),last:null,distance:0};
  }
  this.objects={};
  for(const[col,row,id,height]of [[0,0,'wreck',74],[1,0,'basket',66],[2,0,'bread',28],[3,0,'lyre',60],[0,1,'table',112],[1,1,'stool',35],[2,1,'oil',28],[3,1,'cloak',35]]){
   this.cut('sch-'+id,'props',col,row,height);this.objects[id]=this.add.image(0,0,'sch-'+id).setOrigin(.5,1);
  }
  this.cut('sch-sail','hero',1,3,240);this.sail=this.add.image(0,0,'sch-sail').setOrigin(.5,1);
  this.water=this.add.graphics().setDepth(2);this.reactions=this.add.graphics().setDepth(1500);this.glow=this.add.graphics().setDepth(1199);
  installShotDissolve(this);this.ready(this);this.draw(0,true);
 }
 update(_,delta){const dt=Math.min(delta,100);if(!this.reader.paused){this.phase+=dt;this.reader.tick(dt);this.onTick?.(dt);}this.draw(this.reader.paused?0:dt);}
 bounds(){return this.reader.story.shots[this.reader.model.view];}
 actorPosition(id){const a=this.reader.model.actors[id];return{x:a.x,y:a.y+(id==='odysseus'&&this.reader.model.room==='sea'?Math.sin(this.phase/1450)*2:0)};}
 propOpacity(id){const p=this.reader.model[id],owner=this.reader.model.actors[p.owner];return p.visible*(owner?owner.visible:1)*(id==='bread'&&owner?.facing==='back'?0:1);}
 propPosition(id){
  const p=this.reader.model[id],owner=p.owner,a=this.reader.model.actors[owner];
  const hand=who=>{const actor=this.reader.model.actors[who];if(!actor)return null;if(id==='bread')return{x:actor.x+(actor.facing==='left'?-26:actor.facing==='right'?26:0),y:actor.y-36};return id==='lyre'?{x:actor.x+(actor.facing==='left'?-29:29),y:actor.y-19}:{x:actor.x+(actor.facing==='left'?-40:40),y:actor.y-56};};
  const step=this.reader.step,change=step?.type==='action'?step.effects[id]:null;
  if(change&&Object.hasOwn(change,'owner')&&change.owner!==this.reader.startModel[id].owner){
   const start=hand(this.reader.startModel[id].owner)||this.reader.startModel[id],end=hand(change.owner)||{x:change.x??p.x,y:change.y??p.y},progress=Math.min(1,this.reader.elapsed/step.duration),t=progress*progress*(3-2*progress);
   return{x:start.x+(end.x-start.x)*t,y:start.y+(end.y-start.y)*t-Math.sin(progress*Math.PI)*3};
  }
  return a?hand(owner):p;
 }
 draw(dt,instant=false){
  const m=this.reader.model,w=this.scale.width,h=this.scale.height,top=this.safeTopInset||Math.min(65,h*.1),reading=(this.readingHeight||h)-(this.safeTopInset?0:top),target={...this.bounds()};
  if(this.room!==m.room){
   if(this.room&&!instant){this.previousBackground.setTexture('sch-'+this.room).setAlpha(1);this.previousFloor.setTexture('sch-floor-'+this.room).setAlpha(1);this.roomFade=0;}else this.roomFade=900;
   this.background.setTexture('sch-'+m.room);this.floor.setTexture('sch-floor-'+m.room);this.room=m.room;
  }
  this.roomFade=Math.min(900,this.roomFade+dt);this.previousBackground.setAlpha(instant?0:1-this.roomFade/900);this.previousFloor.setAlpha(this.previousBackground.alpha);
const step=this.reader.step,lookAhead=this.reader.story.steps.slice(this.reader.index+1,this.reader.index+5);let next=null;
  if(step?.effects?.view)for(const candidate of lookAhead){if(candidate.camera?.hold){next=candidate;break;}if(candidate.type!=='action'||candidate.duration>350||candidate.effects.view)break;}
  const walk=step?.camera?.hold?step:next;this.cameraWalk=walk;
  const rects=target.actors.filter(id=>m.actors[id].visible>.2).map(id=>{const a=this.actorPosition(id);return{l:a.x-76,r:a.x+76,t:a.y-154,b:a.y+18};});
  for(const id of target.props){const p=m[id];if(this.propOpacity(id)<.2)continue;const position=id==='raft'?p:this.propPosition(id),sprite=id==='raft'?(p.broken>.5?this.objects.wreck:this.sail):this.objects[id];rects.push({l:position.x-sprite.width/2-10,r:position.x+sprite.width/2+10,t:position.y-sprite.height-12,b:position.y+12});}
  if(rects.length){const l=Math.min(...rects.map(r=>r.l)),r=Math.max(...rects.map(r=>r.r)),t=Math.min(...rects.map(r=>r.t)),b=Math.max(...rects.map(r=>r.b));target.w=Math.max(target.w,r-l);target.h=Math.max(target.h,b-t);target.cx=Math.max(r-target.w/2,Math.min(target.cx,l+target.w/2));target.cy=Math.max(b-target.h/2,Math.min(target.cy,t+target.h/2));}
  // This opt-in walk follows the two travelers without stopping at route cards.
  if(step?.camera?.follow){const group=step.camera.follow.map(id=>m.actors[id]);target.cx=(Math.min(...group.map(a=>a.x))+Math.max(...group.map(a=>a.x)))/2;target.cy=(Math.min(...group.map(a=>a.y-154))+Math.max(...group.map(a=>a.y+18)))/2;}
  const worldHeight=2734,fitZ=Math.max(w/1536,h/worldHeight,Math.min((this.safeWidth||w)/target.w,reading/target.h));
  const z=step?.camera?.follow&&!instant&&this.framing?this.framing.z:fitZ;
  const dest={x:Phaser.Math.Clamp(target.cx+(this.safeCenterOffset||0)/z,w/(2*z),1536-w/(2*z)),y:Phaser.Math.Clamp(target.cy+(h-reading)/(2*z)-top/z,h/(2*z),worldHeight-h/(2*z)),z};
  if(rects.length){const bottom=(this.readingHeight||h)-12,t=Math.max(...rects.map(r=>r.b))+(h/2-bottom)/z,b=Math.min(...rects.map(r=>r.t))+(h/2-top)/z;if(t<=b)dest.y=Phaser.Math.Clamp(dest.y,t,b);}
  if(!this.framing||instant||this.oldWidth!==w||this.oldHeight!==h){this.framing={...dest};this.cameraMove=null;}
  else {
   if(this.cameraMove&&this.cameraMove.id!==step?.id){this.framing={...this.cameraMove.dest};this.cameraMove=null;}
   if(!step?.camera?.hold&&!step?.camera?.follow&&step?.type==='action'&&step.effects.view){if(!this.cameraMove)this.cameraMove={id:step.id,from:{...this.framing},dest};this.cameraMove.dest={...dest};const p=Math.min(1,this.reader.elapsed/step.duration),t=p*p*(3-2*p);for(const k of ['x','y','z'])this.framing[k]=this.cameraMove.from[k]+(dest[k]-this.cameraMove.from[k])*t;}
   else if(dt&&!step?.camera?.hold){const ease=1-Math.exp(-dt/750);for(const k of ['x','y','z'])this.framing[k]+=(dest[k]-this.framing[k])*ease;}
  }
  this.oldWidth=w;this.oldHeight=h;this.cameras.main.setZoom(this.framing.z).centerOn(this.framing.x,this.framing.y);
  const raft=m.raft,bob=m.room==='sea'?Math.sin(this.phase/1450)*(2+m.swell*2):0;
  this.sail.setPosition(raft.x,raft.y+bob).setAlpha(raft.visible*(1-raft.broken)).setRotation(m.room==='sea'?Math.sin(this.phase/1700)*(.012+m.swell*.015):0).setDepth(raft.y-90);
  this.objects.wreck.setPosition(raft.x,raft.y+bob).setAlpha(raft.visible*raft.broken).setDepth(raft.y-60);
  for(const[id,sprite]of Object.entries(this.objects)){
   if(id==='wreck')continue;const p=this.propPosition(id),value=m[id];sprite.setPosition(p.x,p.y).setAlpha(this.propOpacity(id)).setDepth(value.owner?m.actors[value.owner].y+1:id==='table'?p.y-86:id==='stool'?p.y-22:p.y-1);
  }
  for(const[id,person]of Object.entries(this.people)){
   const a=m.actors[id],seated=a.seated>.5,swimming=id==='odysseus'&&m.room==='sea'&&m.raft.broken>.8,col=seated||a.pose==='reach'?3:a.facing==='back'?2:a.facing==='front'?0:1;
   if(a.pose==='walk'&&person.last&&!instant){const distance=Math.hypot(a.x-person.last.x,a.y-person.last.y);if(distance<60)person.distance+=distance;}else if(a.pose!=='walk')person.distance=0;
   person.last={x:a.x,y:a.y};const walking=a.pose==='walk',walkCol=a.facing==='back'?2:a.facing==='front'?0:1,texture=walking?`sch-${id}-walk-${walkCol}-${Math.floor(person.distance/6)%8}`:`sch-${id}-${swimming?3:col}`,p=this.actorPosition(id),actor=person.actor;
   actor.setTexture(texture).setFlipX(a.facing==='left').setPosition(p.x,p.y+a.bow*4).setScale(1,1-a.bow*.08).setRotation(a.bow*(a.facing==='left'?-.05:.05)).setAlpha(a.visible).setDepth(p.y);
   if(swimming)actor.setCrop(0,0,actor.width,actor.height*.72);else actor.setCrop();
   person.shadow.setPosition(p.x,p.y-2).setDepth(p.y-.5).setAlpha(m.room==='sea'?0:a.visible*.16);
  }
  this.ambient(m);this.drawReactions(m);
  keepCameraInsideEnvironment(this);
 }
 ambient(m){
  this.water.clear();if(m.room==='sea'||m.room==='river'){
   for(let i=0;i<32;i++){
    const x=m.room==='river'?280+i*59%380:240+i*79%1110,y=m.room==='river'?510+i*97%850:450+i*47%950;
    this.water.fillStyle(0xe0f7ed,.08+.06*Math.sin(this.phase/1900+i));this.water.fillRect(Math.round(x+Math.sin(this.phase/2400+i)*7),y,12+(i%4)*6,2);
   }
  }
  this.glow.clear();const oil=this.propPosition('oil');if(m.oil.visible>.01){this.glow.fillStyle(0xf4c574,m.oil.visible*(.07+.009*Math.sin(this.phase/1900)));this.glow.fillCircle(oil.x+6,oil.y-22,28);}
 }
 drawReactions(m){
  const g=this.reactions;g.clear();
  if(m.tears>.01){const a=m.actors.odysseus,x=a.x+(a.facing==='left'?-20:20),y=a.y-82+Math.round(Math.sin(this.phase/1400)*2);g.fillStyle(0xa7dce5,m.tears*.85);g.fillRect(x,y,3,5);g.fillStyle(0xe2f5f3,m.tears*.7);g.fillRect(x,y,2,2);}
  if(m.singing>.01&&m.lyre.visible>.5){const p=this.propPosition('lyre'),a=m.actors.demodocus,x=p.x+(a.facing==='left'?3:-3),y=p.y-28;g.fillStyle(0xf8cda2,.8);g.fillRect(Math.round(x+Math.sin(this.phase/900)*2),y,7,5);}
 }
 diagnostics(){
  const f=this.framing,z=f.z,m=this.reader.model,shot=this.bounds(),project=(x,y)=>({x:(x-f.x)*z+this.scale.width/2,y:(y-f.y)*z+this.scale.height/2});
  return{width:this.scale.width,height:this.scale.height,room:m.room,shot:m.view,marker:null,ambientTime:this.phase,requiredActors:shot.actors.filter(id=>m.actors[id].visible>.5),requiredProps:shot.props.filter(id=>this.propOpacity(id)>.5),landmarks:[],actors:Object.fromEntries(Object.entries(m.actors).map(([id,a])=>{const p=this.actorPosition(id);return[id,{...project(p.x,p.y),head:project(p.x,p.y-(a.seated>.5?112:136)),visible:a.visible}];})),props:Object.fromEntries(['raft','basket','bread','lyre','table','stool','oil','cloak'].map(id=>{const p=id==='raft'?m.raft:this.propPosition(id),sprite=id==='raft'?(m.raft.broken>.5?this.objects.wreck:this.sail):this.objects[id];return[id,{...project(p.x,p.y),top:project(p.x,p.y-sprite.height),left:project(p.x-sprite.width/2,p.y),right:project(p.x+sprite.width/2,p.y),visible:this.propOpacity(id)}];})),brokenRaft:m.raft.broken,singing:m.singing};
 }
}


