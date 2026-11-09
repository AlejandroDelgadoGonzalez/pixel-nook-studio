import {carriedLetterPosition} from './prop-anchors.js';
import {drawCharacter} from '../../../platform/rendering/character-art.js';
import {installShotDissolve} from '../../../platform/rendering/shot-dissolve.js';

import {VillageAmbient} from './village-ambient.js';
// The stage uses the user's village and characters, with world-space blocking.
export class Workshop extends Phaser.Scene{
 constructor(engine,ready){super('village');this.reader=engine;this.ready=ready;this.phase=0;this.framing=null;}
 preload(){const a=this.reader.story.assets;this.load.image('village',a.village);this.load.image('people-sheet',a.people);this.load.image('letter',a.letter);}
 create(){
  this.add.image(724,543,'village').setDisplaySize(1448,1086).setDepth(0);
  const ground=this.textures.get('village').getSourceImage(),floor=this.textures.createCanvas('village-floor',1448,192);floor.context.imageSmoothingEnabled=false;floor.context.drawImage(ground,0,ground.height-192,ground.width,192,0,0,1448,192);floor.refresh();this.add.tileSprite(724,1084,1448,770,'village-floor').setOrigin(.5,0).setDepth(-1);
  this.ambient=new VillageAmbient(this);
  this.people={};this.portraits={};const source=this.textures.get('people-sheet').getSourceImage(),cw=Math.floor(source.width/4),ch=Math.floor(source.height/2);
  // Tight alpha bounds retain consistent feet and dimensions across generated cells.
  for(const[row,who]of ['teo','ines'].entries()){
   for(let col=0;col<4;col++){
    const scan=document.createElement('canvas');scan.width=cw;scan.height=ch;const ctx=scan.getContext('2d',{willReadFrequently:true});ctx.drawImage(source,col*cw,row*ch,cw,ch,0,0,cw,ch);const pixels=ctx.getImageData(0,0,cw,ch).data;let l=cw,r=0,t=ch,b=0;
    for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(pixels[(y*cw+x)*4+3]>80){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
    if(r<=l){l=0;r=cw-1;t=0;b=ch-1;}const h=b-t+1,w=r-l+1,tex=this.textures.createCanvas(who+'-'+col,Math.round(w/h*118),118);tex.context.imageSmoothingEnabled=false;drawCharacter(tex.context,scan,l,t,w,h,tex.width,118);tex.refresh();
    if(col===0){const face=this.textures.createCanvas(who+'-face',80,80);face.context.imageSmoothingEnabled=false;face.context.drawImage(tex.getSourceImage(),0,0,tex.width,118*.58,0,0,80,80);face.refresh();this.portraits[who]=face.getSourceImage().toDataURL();}
   }
   this.people[who]={shadow:this.add.ellipse(0,0,66,19,0x253220,.25),actor:this.add.image(0,0,who+'-0').setOrigin(.5,1)};
  }
  this.textures.get('letter').add('envelope',0,350,443,558,400);
  this.letter=this.add.image(0,0,'letter','envelope').setDisplaySize(36,26).setOrigin(.5,.5).setDepth(1000);
  installShotDissolve(this);this.ready(this);this.draw(0,true);
 }
 update(_,delta){const dt=Math.min(delta,100);if(!this.reader.paused){this.phase+=dt;this.reader.tick(dt);this.onTick?.(dt);}this.draw(this.reader.paused?0:dt);}
 bounds(){const shot=this.reader.story.shots[this.reader.model.view]||this.reader.story.shots.close;return {...shot};}
 draw(dt,instant=false){
  const m=this.reader.model,target=this.bounds(),w=this.scale.width,h=this.scale.height;
  // Include both actors throughout travel, then settle into the authored shot.
  const actors=target.actors.map(id=>m.actors[id]).filter(a=>a.visible>.1),left=actors.length?Math.min(...actors.map(a=>a.x))-64:target.cx-target.w/2,right=actors.length?Math.max(...actors.map(a=>a.x))+64:target.cx+target.w/2;
  target.w=Math.max(target.w,right-left);target.cx=Math.max(right-target.w/2,Math.min(target.cx,left+target.w/2));
  if(actors.length){const top=Math.min(...actors.map(a=>a.y-134)),bottom=Math.max(...actors.map(a=>a.y+20));target.h=Math.max(target.h,bottom-top);target.cy=Math.max(bottom-target.h/2,Math.min(target.cy,top+target.h/2));}
  const worldHeight=1854,reading=this.readingHeight||h,feet=actors.length?Math.max(...actors.map(a=>a.y)):0;
  const z=Math.max(w/1448,h/worldHeight,Math.min(w/target.w,reading/target.h),actors.length?(h-reading+16)/Math.max(1,worldHeight-feet):0);
  const dest={x:Phaser.Math.Clamp(target.cx+(this.safeCenterOffset||0)/z,w/(2*z),1448-w/(2*z)),y:Phaser.Math.Clamp(Math.max(target.cy+(h-reading)/(2*z)-(this.safeTopInset||0)/z,actors.length?feet+(h/2-reading+16)/z:0),h/(2*z),worldHeight-h/(2*z)),z};
  if(!this.framing||instant||this.oldWidth!==w||this.oldHeight!==h)this.framing={...dest};
  else if(dt){const f=1-Math.exp(-dt/480);for(const k of ['x','y','z'])this.framing[k]+=(dest[k]-this.framing[k])*f;}
  this.oldWidth=w;this.oldHeight=h;this.cameras.main.setZoom(this.framing.z).centerOn(this.framing.x,this.framing.y);
  for(const[who,{actor,shadow}]of Object.entries(this.people)){
   const a=m.actors[who],walk=a.pose==='walk',holding=m.lamp.owner===who&&['left','right'].includes(a.facing),col=a.pose==='reach'||holding?3:a.facing==='back'?2:a.facing==='front'||a.pose==='smile'?0:1;
   const bob=walk?Math.abs(Math.sin(this.phase/125))*4:a.pose==='down'?3:0;
   actor.setTexture(who+'-'+col).setFlipX(a.facing==='left').setPosition(a.x,a.y-bob).setAlpha(a.visible).setDepth(a.y).setRotation(walk?Math.sin(this.phase/125)*.025:a.pose==='down'?.05:0);
   shadow.setPosition(a.x,a.y-3).setAlpha(a.visible*.28).setDepth(a.y-.1);
  }
  const point=carriedLetterPosition(this.reader);this.letter.setPosition(point.x,point.y).setRotation(m.actors[m.lamp.owner].facing==='left'?-.12:.12);
  const s=this.reader.step;this.speaker=this.reader.running&&s?.type==='text'&&!s.kind?s.who:null;
  this.ambient.update(this.phase);
 }
 diagnostics(){const c=this.cameras.main,project=(x,y)=>({x:(x-this.framing.x)*c.zoom+this.scale.width/2,y:(y-this.framing.y)*c.zoom+this.scale.height/2});return {width:this.scale.width,height:this.scale.height,speaker:this.speaker,marker:null,shot:this.reader.model.view,requiredActors:this.bounds().actors,landmarks:this.bounds().points.map(p=>({...project(p.x,p.y),name:p.name})),ambientTime:this.phase,actors:Object.fromEntries(Object.entries(this.reader.model.actors).map(([k,a])=>[k,{...project(a.x,a.y),head:project(a.x,a.y-118),visible:a.visible}])),lamp:project(this.letter.x,this.letter.y),table:null};}
}
