import {drawCharacter} from '../../../platform/rendering/character-art.js';
import {installShotDissolve} from '../../../platform/rendering/shot-dissolve.js';
// Terrace staging is authored around phone shots; wider screens reveal context.
export class Terrace extends Phaser.Scene {
 constructor(engine,ready){super('terrace');this.reader=engine;this.ready=ready;this.phase=0;this.framing=null;}
 preload(){this.load.image('tea-background',this.reader.story.assets.terrace);this.load.image('tea-atlas',this.reader.story.assets.atlas);this.load.image('tea-people',this.reader.story.assets.people);}
 cut(key,col,row,height){
  const source=this.textures.get(row<2?'tea-people':'tea-atlas').getSourceImage(),cw=source.width/4,ys=row<2?[0,source.height/2,source.height]:[0,426,823,1086];
  const scan=document.createElement('canvas');scan.width=Math.floor(cw);scan.height=ys[row+1]-ys[row];const ctx=scan.getContext('2d',{willReadFrequently:true});ctx.drawImage(source,col*cw,ys[row],cw,scan.height,0,0,scan.width,scan.height);
  const pixels=ctx.getImageData(0,0,scan.width,scan.height).data;let l=scan.width,r=0,t=scan.height,b=0;
  for(let y=0;y<scan.height;y++)for(let x=0;x<scan.width;x++)if(pixels[(y*scan.width+x)*4+3]>80){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
  const w=r-l+1,h=b-t+1,tex=this.textures.createCanvas(key,Math.round(w/h*height),height);tex.context.imageSmoothingEnabled=false;if(row<2)drawCharacter(tex.context,scan,l,t,w,h,tex.width,height);else tex.context.drawImage(scan,l,t,w,h,0,0,tex.width,height);tex.refresh();return {scan,l,t,w,h};
 }
 makeWalkFrames(who,col){
  // Articulate the existing sprite's legs; keep one shoe planted each step.
  const source=this.textures.get('tea-'+who+'-'+col).getSourceImage(),w=source.width,h=source.height,split=Math.round(w*.53),legTop=112;
  for(let frame=0;frame<8;frame++){
   const tex=this.textures.createCanvas(`tea-${who}-walk-${col}-${frame}`,w+16,h),ctx=tex.context;ctx.imageSmoothingEnabled=false;
   const stride=Math.sin(frame*Math.PI/4),shift=Math.round(stride*(col===0?3:6));
   ctx.drawImage(source,0,legTop,split,h-legTop,8+shift,legTop-Math.max(0,Math.round(stride*3)),split,h-legTop);
   ctx.drawImage(source,split,legTop,w-split,h-legTop,8+split-shift,legTop-Math.max(0,Math.round(-stride*3)),w-split,h-legTop);
   ctx.drawImage(source,0,0,w,119,8,frame%4===2?1:0,w,119);tex.refresh();
  }
 }
 create(){
  this.add.image(724,543,'tea-background').setDisplaySize(1448,1086).setDepth(0);
  this.people={};this.portraits={};
  for(const[row,who]of ['ellis','mara'].entries()){
   for(let col=0;col<4;col++){
    const part=this.cut('tea-'+who+'-'+col,col,row,142);
    if(col===0){const face=this.textures.createCanvas('tea-'+who+'-portrait',80,80);face.context.imageSmoothingEnabled=false;const body=this.textures.get('tea-'+who+'-'+col).getSourceImage();face.context.drawImage(body,0,0,body.width,body.height*.58,0,0,80,80);face.refresh();this.portraits[who]=face.getSourceImage().toDataURL();}
   }
   for(const col of [0,1])this.makeWalkFrames(who,col);
   this.people[who]={distance:0,last:null,shadow:this.add.ellipse(0,0,54,12,0x252115,1),actor:this.add.image(0,0,'tea-'+who+'-0').setOrigin(.5,1)};
  }
  for(const[col,key,h]of [[0,'blue',29],[1,'amber',29],[2,'pot',43],[3,'table',202]])this.cut('tea-'+key,col,2,h);
  this.table=this.add.image(700,615,'tea-table').setOrigin(.5,1).setDepth(550);
  this.add.ellipse(700,606,190,22,0x221a12,.19).setDepth(549);
  this.props={};for(const key of ['blue','amber','pot'])this.props[key]=this.add.image(0,0,'tea-'+key).setDepth(700);
  this.effects=this.add.graphics().setDepth(701);
  this.glows=[[1073,153],[427,330],[169,711]].map(([x,y])=>this.add.circle(x,y,22,0xffc874,.04).setBlendMode(Phaser.BlendModes.ADD).setDepth(2));
  this.leaves=[];const bg=this.textures.get('tea-background');
  for(const[i,r]of [[510,24,85,72],[813,178,70,61],[949,833,79,64]].entries()){bg.add('tea-leaf-'+i,0,...r);this.leaves.push({x:r[0],y:r[1],sprite:this.add.image(r[0],r[1],'tea-background','tea-leaf-'+i).setOrigin(0).setDepth(1)});}
  installShotDissolve(this);this.ready(this);this.draw(0,true);
 }
 update(_,delta){const dt=Math.min(delta,100);if(!this.reader.paused){this.phase+=dt;this.reader.tick(dt);this.onTick?.(dt);}this.draw(this.reader.paused?0:dt);}
 bounds(){return this.reader.story.shots[this.reader.model.view]||this.reader.story.shots.conversation;}
 draw(dt,instant=false){
  const m=this.reader.model,target={...this.bounds()},w=this.scale.width,h=this.scale.height,reading=this.readingHeight||h;
  if(m.view==='arrival'){target.cx=m.actors.ellis.x;target.cy=m.actors.ellis.y-72;}
  const visible=target.actors.map(id=>m.actors[id]).filter(a=>a.visible>.2);
  if(visible.length){const left=Math.min(...visible.map(a=>a.x))-68,right=Math.max(...visible.map(a=>a.x))+68;target.w=Math.max(target.w,right-left);target.cx=Math.max(right-target.w/2,Math.min(target.cx,left+target.w/2));}
  const z=Math.max(w/1448,h/1086,Math.min(w/target.w,reading/target.h));
  const dest={x:Phaser.Math.Clamp(target.cx+(this.safeCenterOffset||0)/z,w/(2*z),1448-w/(2*z)),y:Phaser.Math.Clamp(target.cy+(h-reading)/(2*z)-(this.safeTopInset||0)/z,h/(2*z),1086-h/(2*z)),z};
  if(!this.framing||instant||this.oldWidth!==w||this.oldHeight!==h)this.framing={...dest};
  else if(dt){const ease=1-Math.exp(-dt/700);for(const k of ['x','y','z'])this.framing[k]+=(dest[k]-this.framing[k])*ease;}
  this.oldWidth=w;this.oldHeight=h;this.cameras.main.setZoom(this.framing.z).centerOn(this.framing.x,this.framing.y);
  for(const[who,person]of Object.entries(this.people)){
   const {actor,shadow}=person;
   const a=m.actors[who],holding=Object.values(m.props).some(p=>p.owner===who),col=a.pose==='reach'||holding?3:a.facing==='back'?2:a.facing==='front'?0:1;
   const walk=a.pose==='walk';if(walk&&person.last&&!instant){const moved=Math.hypot(a.x-person.last.x,a.y-person.last.y);if(moved<40)person.distance+=moved;}
   if(!walk)person.distance=0;person.last={x:a.x,y:a.y};
   const walkCol=a.facing==='front'?0:1,frame=Math.floor(person.distance/6)%8;
   actor.setTexture(walk?`tea-${who}-walk-${walkCol}-${frame}`:'tea-'+who+'-'+col).setFlipX(a.facing==='left').setPosition(a.x,a.y).setAlpha(a.visible).setDepth(a.y).setRotation(0);
   shadow.setPosition(a.x,a.y-2).setAlpha(a.visible*.20).setDepth(a.y-.1);
  }
  this.effects.clear();
  for(const[key,sprite]of Object.entries(this.props)){
   const p=m.props[key];sprite.setPosition(p.x,p.y).setRotation(p.tilt||0).setFlipX(key==='blue'&&p.handleLeft>.5);
   if(key!=='pot'){
    if(p.filled<1){this.effects.fillStyle(0xd5c59c,1-p.filled);this.effects.fillEllipse(p.x-1,p.y-6,24,7);}
    for(let i=0;i<2;i++){const t=this.phase/1000,drift=Math.sin(t*.65+i)*1.5;this.effects.lineStyle(1,0xffedcf,.30*p.filled);this.effects.beginPath();this.effects.moveTo(p.x-4+i*7,p.y-13);this.effects.lineTo(p.x-4+i*7+drift,p.y-23);this.effects.lineTo(p.x-3+i*7-drift,p.y-34);this.effects.strokePath();}
   }
  }
  if(m.pour>.05){const p=m.props.pot,c=m.props.amber;this.effects.lineStyle(2,0xcda568,.5*m.pour);this.effects.beginPath();this.effects.moveTo(p.x+25,p.y+5);this.effects.lineTo(c.x,c.y-6);this.effects.strokePath();}
  this.glows.forEach((g,i)=>g.setAlpha(.037+Math.sin(this.phase/2400+i)*.008));
  this.leaves.forEach((leaf,i)=>leaf.sprite.setPosition(leaf.x+Math.sin(this.phase/2800+i)*.45,leaf.y));
 }
 diagnostics(){const c=this.cameras.main,project=(x,y)=>({x:(x-this.framing.x)*c.zoom+this.scale.width/2,y:(y-this.framing.y)*c.zoom+this.scale.height/2}),m=this.reader.model,shot=this.bounds();return {width:this.scale.width,height:this.scale.height,shot:m.view,marker:null,requiredActors:shot.actors.filter(id=>m.actors[id].visible>.5),requiredProps:shot.props||[],landmarks:shot.points.map(p=>({...project(p.x,p.y),name:p.name})),ambientTime:this.phase,actors:Object.fromEntries(Object.entries(m.actors).map(([id,a])=>[id,{...project(a.x,a.y),head:project(a.x,a.y-142),visible:a.visible}])),props:Object.fromEntries(Object.entries(m.props).map(([id,p])=>[id,{...project(p.x,p.y),owner:p.owner,filled:p.filled}])),table:project(700,535)};}
}
