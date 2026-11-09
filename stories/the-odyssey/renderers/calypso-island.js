import {drawCharacter} from '../../../platform/rendering/character-art.js';
import {odysseyCharacterCell} from '../shared/atlas-cells.js';
import {installShotDissolve} from '../../../platform/rendering/shot-dissolve.js';
// Vertical shots put the action above the reading panel; desktop reveals more coast.
export class Odyssey extends Phaser.Scene {
 constructor(engine,ready){super('odyssey');this.reader=engine;this.ready=ready;this.phase=0;this.framing=null;}
 preload(){this.load.image('odyssey-island',this.reader.story.assets.island);this.load.image('odyssey-atlas',this.reader.story.assets.atlas);}
 cut(key,col,row,height){
  const source=this.textures.get('odyssey-atlas').getSourceImage(),xs=[0,321,641,932,1254].map(n=>Math.round(n*source.width/1254)),ys=[0,337,643,970,1254].map(n=>Math.round(n*source.height/1254));
  const cell=row<3?odysseyCharacterCell(source,col,row):{x:xs[col],y:ys[row],w:xs[col+1]-xs[col],h:ys[row+1]-ys[row]},cw=cell.w,ch=cell.h;
  const scan=document.createElement('canvas');scan.width=cw;scan.height=ch;const ctx=scan.getContext('2d',{willReadFrequently:true});ctx.drawImage(source,cell.x,cell.y,cw,ch,0,0,cw,ch);
  const pixels=ctx.getImageData(0,0,cw,ch).data;let l=cw,r=-1,t=ch,b=-1;
  for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(pixels[(y*cw+x)*4+3]>80){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
  if(r<l)throw new Error('Missing Odyssey sprite '+key);
  const w=r-l+1,h=b-t+1,tex=this.textures.createCanvas(key,Math.round(w/h*height),height);tex.context.imageSmoothingEnabled=false;if(row<3)drawCharacter(tex.context,scan,l,t,w,h,tex.width,height);else tex.context.drawImage(scan,l,t,w,h,0,0,tex.width,height);tex.refresh();return {scan,l,t,w,h};
 }
 walkFrames(id,col){
  const source=this.textures.get(`od-${id}-${col}`).getSourceImage(),w=source.width,h=source.height,leg=Math.floor(h*.79),split=Math.floor(w/2);
  for(let f=0;f<8;f++){const tex=this.textures.createCanvas(`od-${id}-walk-${col}-${f}`,w+12,h),ctx=tex.context;ctx.imageSmoothingEnabled=false;const stride=Math.sin(f*Math.PI/4),shift=Math.round(stride*3);
   ctx.drawImage(source,0,leg,split,h-leg,6+shift,leg-Math.max(0,Math.round(stride*2)),split,h-leg);
   ctx.drawImage(source,split,leg,w-split,h-leg,6+split-shift,leg-Math.max(0,Math.round(-stride*2)),w-split,h-leg);
   ctx.drawImage(source,0,0,w,leg+2,6,0,w,leg+2);tex.refresh();}
 }
 create(){
  this.add.image(768,768,'odyssey-island').setDisplaySize(1536,1536).setDepth(0);this.people={};this.portraits={};
  // Reuse the exact background pixels as a foreground layer. The tree hides
  // an approaching person until they step out onto the sand.
  for(const occluder of this.reader.story.foregroundOccluders||[]){
   const mask=this.make.graphics({x:0,y:0,add:false});mask.fillStyle(0xffffff);mask.fillPoints(occluder.points.map(([x,y])=>({x,y})),true);
   this.add.image(768,768,'odyssey-island').setDisplaySize(1536,1536).setDepth(occluder.depth).setMask(mask.createGeometryMask());
  }
  for(const[row,id]of ['odysseus','calypso','hermes'].entries()){
   for(let col=0;col<4;col++){const part=this.cut(`od-${id}-${col}`,col,row,id==='odysseus'&&col===3?110:136);if(col===0){const face=this.textures.createCanvas('od-face-'+id,80,80);face.context.imageSmoothingEnabled=false;const body=this.textures.get(`od-${id}-${col}`).getSourceImage();face.context.drawImage(body,0,0,body.width,body.height*.53,0,0,80,80);face.refresh();this.portraits[id]=face.getSourceImage().toDataURL();}}
   for(const col of [0,1])this.walkFrames(id,col);
   this.people[id]={actor:this.add.image(0,0,`od-${id}-0`).setOrigin(.5,1),shadow:this.add.ellipse(0,0,65,14,0x4f412c,.2),last:null,distance:0};
  }
  for(const[col,id,height]of [[0,'logs',95],[1,'sail',250],[2,'axe',65],[3,'supplies',62]])this.cut('od-'+id,col,3,height);
  this.sail=this.add.image(0,0,'od-sail').setOrigin(.5,1);this.logs=this.add.image(0,0,'od-logs').setOrigin(.5,1);this.logs.setScale(this.sail.displayWidth/this.logs.width);
  this.axe=this.add.image(0,0,'od-axe').setOrigin(.5,1);this.supplies=this.add.image(0,0,'od-supplies').setOrigin(.5,1);
  this.water=this.add.graphics().setDepth(1);this.sparks=this.add.graphics().setDepth(1600);
  installShotDissolve(this);this.ready(this);this.draw(0,true);
 }
 update(_,delta){const dt=Math.min(delta,100);if(!this.reader.paused){this.phase+=dt;this.reader.tick(dt);this.onTick?.(dt);}this.draw(this.reader.paused?0:dt);}
 bounds(){return this.reader.story.shots[this.reader.model.view]||this.reader.story.shots.shore;}
 draw(dt,instant=false){
  const m=this.reader.model,w=this.scale.width,h=this.scale.height,reading=this.readingHeight||h,target={...this.bounds()};
  if(m.view==='departure'){target.cx=m.raft.x;target.cy=m.raft.y-120;}
  const z=Math.max(w/1536,h/1536,Math.min(w/target.w,reading/target.h));
  const dest={x:Phaser.Math.Clamp(target.cx+(this.safeCenterOffset||0)/z,w/(2*z),1536-w/(2*z)),y:Phaser.Math.Clamp(target.cy+(h-reading)/(2*z)-(this.safeTopInset||0)/z,h/(2*z),1536-h/(2*z)),z};
  if(!this.framing||instant||this.oldWidth!==w||this.oldHeight!==h)this.framing={...dest};else if(dt&&!this.reader.step?.camera?.hold){const ease=1-Math.exp(-dt/800);for(const k of ['x','y','z'])this.framing[k]+=(dest[k]-this.framing[k])*ease;}
  this.oldWidth=w;this.oldHeight=h;this.cameras.main.setZoom(this.framing.z).centerOn(this.framing.x,this.framing.y);
  const bob=m.raft.afloat?Math.sin(this.phase/1900)*1.8:0;
  // The deck is a ground surface. A worker beside its front edge stays in front.
  this.logs.setPosition(m.raft.x,m.raft.y).setAlpha(m.raft.visible*(1-m.raft.rigged)).setDepth(m.raft.y-90);
  this.sail.setPosition(m.raft.x,m.raft.y+bob).setAlpha(m.raft.visible*m.raft.rigged).setDepth(m.raft.y-90);
  this.axe.setPosition(m.tools.x,m.tools.y).setVisible(m.tools.visible>.01).setAlpha(m.tools.visible).setDepth(m.tools.y-12);
  this.supplies.setPosition(m.raft.x+48,m.raft.y-20+bob).setAlpha(m.supplies.visible).setDepth(m.raft.y-1);
  for(const[id,person]of Object.entries(this.people)){
   const a=m.actors[id],aboard=id==='odysseus'&&m.raft.aboard>.5,working=id==='odysseus'&&m.working>.5,pose=working?3:a.facing==='back'?2:a.facing==='front'?0:1;
   if(a.pose==='walk'&&person.last&&!instant){const distance=Math.hypot(a.x-person.last.x,a.y-person.last.y);if(distance<40)person.distance+=distance;}else if(a.pose!=='walk')person.distance=0;
   person.last={x:a.x,y:a.y};const col=a.facing==='front'?0:1,frame=Math.floor(person.distance/6)%8;
   const texture=a.pose==='walk'?`od-${id}-walk-${col}-${frame}`:`od-${id}-${pose}`;
   const x=aboard?m.raft.x-35:a.x,y=aboard?m.raft.y-52+bob:a.y;
   const scale=working?.92:1,breath=a.pose==='idle'&&!working&&!aboard?Math.sin(this.phase/2200)*.0025:0;
   person.actor.setTexture(texture).setFlipX(a.facing==='left').setPosition(x,y).setScale(scale,scale*(1+breath)).setAlpha(a.visible).setDepth(aboard?m.raft.y:y);
   person.shadow.setPosition(x,y-2).setAlpha(aboard?0:a.visible*.17).setDepth(y-.1);
  }
  this.water.clear();
  // Far-water glints complement the visible near-shore movement below.
  for(let i=0;i<20;i++){const x=490+(i*83%510),y=190+(i*61%370),drift=Math.sin(this.phase/2500+i)*5;this.water.fillStyle(0xd4ffff,.08+.045*Math.sin(this.phase/2100+i));this.water.fillRect(Math.round(x+drift),y,12+(i%3)*7,2);}
  const nearWater=[[660,690],[785,710],[905,730],[1040,720],[830,790],[970,810],[1100,805],[725,760],[585,625],[930,590],[790,600],[670,555]];
  for(const[i,[x,y]]of nearWater.entries()){
   const cycle=this.phase/1700+i*.8,drift=Math.sin(cycle*.65)*7;
   this.water.fillStyle(0xe2ffff,.14+.11*Math.sin(cycle));
   this.water.fillRect(Math.round(x+drift),Math.round(y+Math.sin(cycle*.5)*2),18+(i%3)*7,3);
   this.water.fillRect(Math.round(x+drift+5),Math.round(y+5+Math.sin(cycle*.5)*2),10,2);
  }
  // A narrow pixel wash traces the actual curved shore, with a slow six-second cycle.
  const coast=[[480,678],[545,728],[620,770],[695,798],[775,819],[855,835],[935,839],[1015,837],[1095,829],[1170,810],[1240,788]];
  const wash=(Math.sin(this.phase/1100)+1)/2;
  this.water.fillStyle(0xf0ffef,.12+wash*.23);
  for(let i=0;i<coast.length-1;i++){
   const [x,y]=coast[i],[nx,ny]=coast[i+1],steps=Math.ceil((nx-x)/9);
   for(let j=0;j<steps;j++){const f=j/steps;this.water.fillRect(Math.round(x+(nx-x)*f),Math.round(y+(ny-y)*f-9+wash*7),8,2+(j%3===0?1:0));}
  }
  if(m.raft.afloat){this.water.lineStyle(2,0xe0f9ea,.18);this.water.strokeEllipse(m.raft.x,m.raft.y-14,160,24);}
  this.sparks.clear();if(m.working>.5){const p=this.phase/800;this.sparks.fillStyle(0xf0d29c,.4);for(let i=0;i<3;i++)this.sparks.fillRect(m.actors.odysseus.x+36+i*8,m.actors.odysseus.y-24-(Math.sin(p+i)+1)*3,3,2);}
 }
 diagnostics(){const f=this.framing,z=f.z,project=(x,y)=>({x:(x-f.x)*z+this.scale.width/2,y:(y-f.y)*z+this.scale.height/2}),m=this.reader.model,shot=this.bounds();return {width:this.scale.width,height:this.scale.height,shot:m.view,marker:null,ambientTime:this.phase,requiredActors:shot.actors.filter(id=>m.actors[id].visible>.5),requiredProps:shot.props||[],landmarks:[],actors:Object.fromEntries(Object.entries(m.actors).map(([id,a])=>{const aboard=id==='odysseus'&&m.raft.aboard>.5,x=aboard?m.raft.x-35:a.x,y=aboard?m.raft.y-52:a.y;return[id,{...project(x,y),head:project(x,y-136),visible:a.visible}]})),props:{raft:{...project(m.raft.x,m.raft.y),visible:m.raft.visible,rigged:m.raft.rigged,aboard:m.raft.aboard},tools:{...project(m.tools.x,m.tools.y),visible:m.tools.visible}}};}
}
