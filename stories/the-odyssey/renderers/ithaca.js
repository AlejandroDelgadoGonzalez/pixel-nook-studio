import {drawCharacter} from '../../../platform/rendering/character-art.js';
import {ithacaHostCell} from '../shared/atlas-cells.js';
import {installShotDissolve} from '../../../platform/rendering/shot-dissolve.js';
import {preloadLandscape,fitEnvironment,prepareLandscapeShot,cameraCenterX,refreshEnvironmentEdges,keepCameraInsideEnvironment,landscapeView} from '../../../platform/rendering/environments.js';
// Chapter 2 uses the same reading engine, with its own rooms and persistent props.
export class Ithaca extends Phaser.Scene {
 constructor(engine,ready){super('ithaca');this.reader=engine;this.ready=ready;this.phase=0;this.framing=null;this.room=null;this.roomFade=900;}
 preload(){for(const [key,url]of Object.entries(this.reader.story.assets))this.load.image('ith-'+key,url);preloadLandscape(this);}
 cut(key,atlas,col,row,rows,height){
  const source=this.textures.get('ith-'+atlas).getSourceImage(),xs=atlas==='ithaca-atlas'?[0,321,643,967,1254].map(n=>Math.round(n*source.width/1254)):[0,1,2,3,4].map(n=>Math.round(n*source.width/4)),ys=atlas==='ithaca-atlas'?[0,337,645,950,1254].map(n=>Math.round(n*source.height/1254)):[0,380,736,1086].map(n=>Math.round(n*source.height/1086));
  const cell=atlas==='ithaca-hosts'?ithacaHostCell(source,col,row):{x:xs[col],y:ys[row],w:xs[col+1]-xs[col],h:ys[row+1]-ys[row]},cw=cell.w,ch=cell.h;
  const scan=document.createElement('canvas');scan.width=cw;scan.height=ch;const ctx=scan.getContext('2d',{willReadFrequently:true});ctx.drawImage(source,cell.x,cell.y,cw,ch,0,0,cw,ch);
  const pixels=ctx.getImageData(0,0,cw,ch).data;let l=cw,r=-1,t=ch,b=-1;
  for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(pixels[(y*cw+x)*4+3]>80){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
  if(r<l)throw new Error('Missing Ithaca sprite '+key);
  const w=r-l+1,h=b-t+1,tex=this.textures.createCanvas(key,Math.round(w/h*height),height);tex.context.imageSmoothingEnabled=false;if(atlas!=='ithaca-props')drawCharacter(tex.context,scan,l,t,w,h,tex.width,height);else tex.context.drawImage(scan,l,t,w,h,0,0,tex.width,height);tex.refresh();return {scan,l,t,w,h};
 }
 walkFrames(id,col){
  const source=this.textures.get(`ith-${id}-${col}`).getSourceImage(),w=source.width,h=source.height,leg=Math.floor(h*.79),split=Math.floor(w/2);
  for(let f=0;f<8;f++){const tex=this.textures.createCanvas(`ith-${id}-walk-${col}-${f}`,w+12,h),ctx=tex.context;ctx.imageSmoothingEnabled=false;const stride=Math.sin(f*Math.PI/4),shift=Math.round(stride*3);
   ctx.drawImage(source,0,leg,split,h-leg,6+shift,leg-Math.max(0,Math.round(stride*2)),split,h-leg);ctx.drawImage(source,split,leg,w-split,h-leg,6+split-shift,leg-Math.max(0,Math.round(-stride*2)),w-split,h-leg);ctx.drawImage(source,0,0,w,leg+2,6,0,w,leg+2);tex.refresh();}
 }
 create(){
  // Continue each room's own floor below the artwork for tall reading viewports.
  // This lets the camera fit the actors above captions without adding letterboxing.
  for(const[room,config]of Object.entries(this.reader.story.visuals?.rooms||{}))if(config.centralThird){const image=this.textures.get('ith-'+room).getSourceImage(),tex=this.textures.createCanvas('ith-'+room+'-native',image.width,image.height*3);tex.context.imageSmoothingEnabled=false;tex.context.drawImage(image,image.width/3,0,image.width/3,image.height,0,0,image.width,image.height*3);tex.refresh();}
  for(const room of Object.keys(this.landscapeRooms)){const source=this.textures.get(this.nativeTexture(room)).getSourceImage(),height=Math.round(192*1536/source.width),tex=this.textures.createCanvas('ith-floor-'+room,1536,height);tex.context.imageSmoothingEnabled=false;tex.context.drawImage(source,0,source.height-192,source.width,192,0,0,1536,height);tex.refresh();}
  this.floor=this.add.tileSprite(768,1534,4608,2200,'ith-floor-chamber').setOrigin(.5,0).setDepth(-1);
  this.previousFloor=this.add.tileSprite(768,1534,4608,2200,'ith-floor-chamber').setOrigin(.5,0).setDepth(-.5).setAlpha(0);
  this.background=this.add.image(768,0,'ith-chamber').setOrigin(.5,0).setDepth(0);this.previousBackground=this.add.image(768,0,'ith-chamber').setOrigin(.5,0).setDepth(1).setAlpha(0);
  this.sides=[-768,2304].map(x=>this.add.image(x,0,'ith-chamber').setOrigin(.5,0).setDepth(0));
  this.previousSides=[-768,2304].map(x=>this.add.image(x,0,'ith-chamber').setOrigin(.5,0).setDepth(1).setAlpha(0));
  this.people={};this.portraits={};
  for(const[i,id]of Object.keys(this.reader.story.characters).entries()){
   const atlas=i<4?'ithaca-atlas':'ithaca-hosts',row=i<4?i:i-4,rows=i<4?4:2;
   for(let col=0;col<4;col++){const part=this.cut(`ith-${id}-${col}`,atlas,col,row,rows,id==='penelope'&&col===3?112:136);if(col===0){const face=this.textures.createCanvas('ith-face-'+id,80,80);face.context.imageSmoothingEnabled=false;const body=this.textures.get(`ith-${id}-${col}`).getSourceImage();face.context.drawImage(body,0,0,body.width,body.height*.53,0,0,80,80);face.refresh();this.portraits[id]=face.getSourceImage().toDataURL();}}
   for(const col of [0,1,2])this.walkFrames(id,col);
   this.people[id]={actor:this.add.image(0,0,`ith-${id}-0`).setOrigin(.5,1),shadow:this.add.ellipse(0,0,60,12,0x241a15,.18),last:null,distance:0};
  }
  this.objects={};
  for(const[col,id,height]of [[0,'loom',180],[1,'table',120],[2,'boat',265],[3,'stool',42]]){this.cut('ith-'+id,'ithaca-props',col,2,3,height);this.objects[id]=this.add.image(0,0,'ith-'+id).setOrigin(.5,1);}
  this.cloth=this.add.graphics();this.smallProps=this.add.graphics();this.light=this.add.graphics();this.water=this.add.graphics().setDepth(2);this.plank=this.add.graphics().setDepth(690);
  installShotDissolve(this);this.ready(this);this.draw(0,true);
 }
 update(_,delta){const dt=Math.min(delta,100);if(!this.reader.paused){this.phase+=dt;this.reader.tick(dt);this.onTick?.(dt);}this.draw(this.reader.paused?0:dt);}
 nativeTexture(room){return 'ith-'+room+(this.reader.story.visuals?.rooms?.[room]?.centralThird?'-native':'');}
 bounds(){return this.reader.story.shots[this.reader.model.view]||this.reader.story.shots.loom;}
 actorPosition(id){const m=this.reader.model,a=m.actors[id];return id==='telemachus'&&m.boat.aboard>=.999?{x:m.boat.x+50,y:m.boat.y-60+Math.sin(this.phase/1900)*1.2}:a;}
 draw(dt,instant=false){
  const m=this.reader.model,w=this.scale.width,h=this.scale.height,top=this.safeTopInset||Math.min(65,h*.1),reading=(this.readingHeight||h)-(this.safeTopInset?0:top),target={...this.bounds()};
  if(m.view==='departing'){target.cx=m.boat.x;target.cy=m.boat.y-100;}
  prepareLandscapeShot(this,target);
  if(this.room!==m.room){const fit=(sprite,room,wing=null)=>{const image=this.textures.get(this.nativeTexture(room)).getSourceImage();fitEnvironment(this,sprite,room,this.nativeTexture(room),1536*image.height/image.width,wing);};if(this.room&&!instant){fit(this.previousBackground,this.room);this.previousSides.forEach((s,i)=>fit(s,this.room,i));this.previousFloor.setTexture('ith-floor-'+this.room).setPosition(768,this.previousBackground.displayHeight-2);this.previousBackground.setAlpha(1);this.roomFade=0;}else this.roomFade=900;fit(this.background,m.room);this.sides.forEach((s,i)=>fit(s,m.room,i));this.floor.setTexture('ith-floor-'+m.room).setPosition(768,this.background.displayHeight-2);this.room=m.room;}
  refreshEnvironmentEdges(this);this.roomFade=Math.min(900,this.roomFade+dt);this.previousBackground.setAlpha(instant?0:1-this.roomFade/900);this.previousFloor.setAlpha(this.previousBackground.alpha);for(const s of this.previousSides)s.setAlpha(this.previousBackground.alpha);
const step=this.reader.step,lookAhead=this.reader.story.steps.slice(this.reader.index+1,this.reader.index+5);let next=null;
  if(step?.effects?.view)for(const candidate of lookAhead){if(candidate.camera?.hold){next=candidate;break;}if(candidate.type!=='action'||candidate.duration>350||candidate.effects.view)break;}
  const walk=step?.camera?.hold?step:next;this.cameraWalk=walk;
  const visible=target.actors.filter(id=>m.actors[id].visible>.2).map(id=>this.actorPosition(id));
  const rectangles=visible.map(a=>({l:a.x-75,r:a.x+75,t:a.y-156,b:a.y+20}));
  for(const id of target.props||[]){const o=m[id],sprite=this.objects[id];if(o?.visible>.2){const pw=sprite?.width||70,ph=sprite?.height||(id==='oil'?120:32);rectangles.push({l:o.x-pw/2-12,r:o.x+pw/2+12,t:o.y-ph-12,b:o.y+12});}}
  if(walk)for(const id of target.actors){const from=walk===step?this.reader.startModel.actors[id]:m.actors[id],change=walk.effects.actors?.[id];if(!change||from.visible<.01&&!change.visible)continue;for(const p of [walk.presence?.[id]?.from||from,...(walk.paths?.[id]||[]),{x:change.x??from.x,y:change.y??from.y}])rectangles.push({l:p.x-75,r:p.x+75,t:p.y-156,b:p.y+20});}
  if(rectangles.length){const l=Math.min(...rectangles.map(a=>a.l)),r=Math.max(...rectangles.map(a=>a.r)),t=Math.min(...rectangles.map(a=>a.t)),b=Math.max(...rectangles.map(a=>a.b));target.w=Math.max(target.w,r-l);target.h=Math.max(target.h,b-t);target.cx=Math.max(r-target.w/2,Math.min(target.cx,l+target.w/2));target.cy=Math.max(b-target.h/2,Math.min(target.cy,t+target.h/2));}
  const nativeExterior=!landscapeView(this)&&this.reader.story.visuals?.rooms?.[m.room]?.nativeBounds,worldHeight=this.background.displayHeight+(nativeExterior?0:2200),z=Math.max(w/(nativeExterior?1536:4608),h/worldHeight,Math.min((this.safeWidth||w)/target.w,reading/target.h)),dest={x:cameraCenterX(this,target.cx+(this.safeCenterOffset||0)/z,z),y:Phaser.Math.Clamp(target.cy+(h-reading)/(2*z)-top/z,h/(2*z),worldHeight-h/(2*z)),z};
  keepCameraInsideEnvironment(this,dest,true);
  if(!this.framing||instant||this.oldWidth!==w||this.oldHeight!==h){this.framing={...dest};this.cameraMove=null;}
  else {
   if(this.cameraMove&&this.cameraMove.id!==step?.id){this.framing={...this.cameraMove.dest};this.cameraMove=null;}
   if(!step?.camera?.hold&&step?.type==='action'&&step.effects.view){if(!this.cameraMove)this.cameraMove={id:step.id,from:{...this.framing},dest};this.cameraMove.dest={...dest};const p=Math.min(1,this.reader.elapsed/step.duration),t=p*p*(3-2*p);for(const k of ['x','y','z'])this.framing[k]=this.cameraMove.from[k]+(dest[k]-this.cameraMove.from[k])*t;}
   else if(dt&&!step?.camera?.hold){const ease=1-Math.exp(-dt/750);for(const k of ['x','y','z'])this.framing[k]+=(dest[k]-this.framing[k])*ease;}
  }
  this.oldWidth=w;this.oldHeight=h;this.cameras.main.setZoom(this.framing.z).centerOn(this.framing.x,this.framing.y);
  for(const[id,sprite]of Object.entries(this.objects)){const o=m[id],bob=id==='boat'?Math.sin(this.phase/1900)*1.2:0;sprite.setPosition(o.x,o.y+bob).setAlpha(o.visible*((target.hiddenProps||[]).includes(id)?0:1)).setDepth(id==='table'?o.y-85:id==='boat'?o.y-90:id==='stool'?o.y-20:o.y-5);}
  // The ramp belongs to the pier, not to the departing boat.
  this.plank.clear();if(m.room==='harbor'&&m.boat.visible>.01&&!(target.hiddenProps||[]).includes('boat')){this.plank.setAlpha(m.boat.visible*(1-m.boat.departing));this.plank.lineStyle(20,0x39291d,1).lineBetween(800,687,657,657);this.plank.lineStyle(14,0xb6864d,1).lineBetween(800,687,657,657);}
  for(const[id,person]of Object.entries(this.people)){
   const a=m.actors[id],layer=(target.hiddenActors||[]).includes(id)?0:1,sitting=id==='penelope'&&a.seated>.5,reach=a.pose==='reach'||(id==='telemachus'&&m.cup.held>.5),col=sitting||reach?3:a.facing==='back'?2:a.facing==='front'?0:1;
   if(a.pose==='walk'&&person.last&&!instant){const moved=Math.hypot(a.x-person.last.x,a.y-person.last.y);if(moved<50)person.distance+=moved;}else if(a.pose!=='walk')person.distance=0;
   person.last={x:a.x,y:a.y};const walkCol=a.facing==='back'?2:a.facing==='front'?0:1,frame=Math.floor(person.distance/6)%8;
   const texture=a.pose==='walk'?`ith-${id}-walk-${walkCol}-${frame}`:`ith-${id}-${col}`,p=this.actorPosition(id),aboard=id==='telemachus'&&m.boat.aboard>=.999;
   person.actor.setTexture(texture).setFlipX(a.facing==='left').setPosition(p.x,p.y).setScale(1,1+(a.pose==='idle'?Math.sin(this.phase/2300)*.002:0)).setAlpha(a.visible*layer).setDepth(aboard?m.boat.y+1:p.y);
   person.shadow.setPosition(p.x,p.y-2).setAlpha(a.visible*layer*(aboard?0:.15)).setDepth(p.y-.5);
  }
  this.drawCloth(m);this.drawSmallProps(m);
  this.water.clear();if(m.room==='harbor'){
   for(let i=0;i<24;i++){const x=250+(i*97%1050),y=250+(i*59%430);if(x>665&&x<1020&&y>350)continue;this.water.fillStyle(0xe5fafa,.12+.07*Math.sin(this.phase/1700+i));this.water.fillRect(Math.round(x+Math.sin(this.phase/2000+i)*5),y,14+i%3*5,2);}
  }
  keepCameraInsideEnvironment(this);
 }
 drawCloth(m){
  const g=this.cloth,l=m.loom,x=l.x-32,y=l.y-142,w=78,height=Math.round(103*m.cloth);g.clear();g.setDepth(l.y-4).setAlpha(l.visible);
  for(let row=0;row<height;row+=2){const slant=Math.round(row*.08);g.fillStyle(row%8<2?0xc5ac87:0xe1cfac,1);g.fillRect(x-slant,y+row,w,2);}
  g.fillStyle(0x71647c,.75);g.fillRect(x-1,y+10,w,4);
  if(m.unpick>0){const hand=m.actors.penelope,working=this.reader.step?.effects?.unpick!==undefined;g.lineStyle(2,0xe7d6b0,.95);g.beginPath();g.moveTo(x,y+height);g.lineTo(x-22,y+height+20);g.lineTo(working?hand.x+44:l.x-100,working?hand.y-56:l.y+16);g.strokePath();}
 }
 drawSmallProps(m){
  const g=this.smallProps;g.clear();g.setDepth(1200);
  if(m.bread.visible>.01){const p=m.bread;g.fillStyle(0x493020,p.visible);g.fillRect(p.x-17,p.y-9,34,18);g.fillRect(p.x-13,p.y-13,26,24);g.fillStyle(0xdca85b,p.visible);g.fillRect(p.x-14,p.y-8,28,15);g.fillRect(p.x-10,p.y-11,20,19);g.fillStyle(0xf4d394,p.visible);for(let i=0;i<3;i++)g.fillRect(p.x-9+i*7,p.y-6,3,9);}
  if(m.cup.visible>.01){const p=m.cup;g.fillStyle(0x493026,p.visible);g.fillRect(p.x-13,p.y-13,26,24);g.fillRect(p.x+10,p.y-9,11,13);g.fillStyle(0xc58546,p.visible);g.fillRect(p.x-10,p.y-10,20,19);g.fillRect(p.x+13,p.y-6,5,7);g.fillStyle(0xefd0a0,p.visible);g.fillRect(p.x-10,p.y-13,20,4);g.fillStyle(0x513c2d,p.visible);g.fillRect(p.x-7,p.y-10,14,5);}
  const p=m.oil,base=p.y;this.light.clear().setDepth(1199);if(p.visible>.01){
   g.fillStyle(0x49301f,p.visible);g.fillRect(p.x-20,base-70,40,8);g.fillRect(p.x-14,base-62,7,62);g.fillRect(p.x+8,base-62,7,62);g.fillStyle(0x9e713e,p.visible);g.fillRect(p.x-18,base-72,36,6);
   g.fillStyle(0x453020,p.visible);g.fillRect(p.x-13,base-87,26,15);g.fillRect(p.x+11,base-92,9,10);g.fillStyle(0xc89345,p.visible);g.fillRect(p.x-9,base-85,20,9);
   const drift=Math.round(Math.sin(this.phase/1700));g.fillStyle(0xeab65b,p.visible);g.fillRect(p.x+13,base-105+drift,5,14);g.fillStyle(0xffe4a2,p.visible);g.fillRect(p.x+14,base-101+drift,3,10);
   this.light.fillStyle(0xf5bb61,p.visible*(.06+Math.sin(this.phase/1800)*.008));this.light.fillCircle(p.x+15,base-97,46);
  }
 }
 diagnostics(){
  const f=this.framing,z=f.z,project=(x,y)=>({x:(x-f.x)*z+this.scale.width/2,y:(y-f.y)*z+this.scale.height/2}),m=this.reader.model,shot=this.bounds();
  return {width:this.scale.width,height:this.scale.height,shot:m.view,room:m.room,marker:null,ambientTime:this.phase,requiredActors:shot.actors.filter(id=>m.actors[id].visible>.5),requiredProps:shot.props.filter(id=>m[id].visible>.5),landmarks:[],actors:Object.fromEntries(Object.entries(m.actors).map(([id,a])=>{const p=this.actorPosition(id);return[id,{...project(p.x,p.y),head:project(p.x,p.y-(id==='penelope'&&a.seated>.5?112:136)),visible:a.visible}];})),props:Object.fromEntries(['loom','stool','table','boat','oil','cup','bread'].map(id=>{const o=m[id],sprite=this.objects[id],pw=sprite?.width||70,ph=sprite?.height||(id==='oil'?120:32);return[id,{...project(o.x,o.y),top:project(o.x,o.y-ph),left:project(o.x-pw/2,o.y),right:project(o.x+pw/2,o.y),visible:o.visible}];})),cloth:m.cloth};
 }
}
