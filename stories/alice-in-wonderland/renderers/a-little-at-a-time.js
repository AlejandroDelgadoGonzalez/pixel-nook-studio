import {OneSideOther} from './one-side-other.js';
import {AliceMushroomRig,clamp,smooth,lerp} from './alice-mushroom-rig.js';
const ROOT='/stories/alice-in-wonderland/',P='alice-c3-s1';
const g=await fetch(ROOT+'shared/chapter-3-scene-3-geometry.json').then(r=>r.json());
export class ALittleAtATime extends OneSideOther{
 sceneThree(){const s=this.reader.step;return !!(s?.s3Beat||s?.sceneIndex===2&&(s?.exportPhase||s?.type==='end'));}
 state(){
  if(!this.sceneThree())return super.state();
  const b=this.reader.step.s3Beat||17,t=this.reader.elapsed||0;
  const s={scene:3,beat:b,elapsed:t,alice:[500,615],root:[470,430],mask:true,seated:false,pose:'eat-cake',mirror:true,scale:.32,walking:false,held:null,shownFraction:1,remainingA:1,remainingB:1,locations:{A:'stem',B:'stem'}};
  if(b===1){s.alice=[lerp(535,575,clamp(t/3000)),lerp(615,608,clamp(t/3000))];s.pose='right';s.mirror=false;s.walking=true;}
  if(b===2||b===3){s.alice=[575,608];s.pose=b===3&&t>=1800?'right':'alice-offer-right';s.mirror=true;if(b===3&&t<1800){s.held='A';s.locations.A='hand';}if(b===3&&t>=1800)s.locations.A='pocket';}
  if(b>=4)s.locations.A='pocket';
  if(b===4){s.alice=[lerp(575,411,clamp(t/3000)),608];s.pose='right';s.mirror=true;s.walking=true;}
  if(b===5||b===6){s.alice=[411,608];s.pose='alice-offer-right';s.mirror=false;if(b===6&&t>=300){s.held='B';s.locations.B='hand';}}
  if(b>=7){s.locations.B='hand';s.held='B';}
  if(b===7){s.alice=[lerp(411,500,clamp(t/3000)),lerp(608,615,clamp(t/3000))];s.pose='right';s.mirror=false;s.walking=true;}
  if(b>=10){s.scale=.56;s.remainingB=g.rig.consumption.BFirst;s.pose='growth-surprise';}
  if(b===11)s.pose='eat-cake';
  if(b>=13){s.scale=.36;s.remainingA=g.rig.consumption.AFirst;s.locations.B='pocket';s.locations.A='hand';s.held='A';s.pose=b===14?'eat-cake':'growth-surprise';}
  if(b>=16){s.scale=1.1;s.remainingB=g.rig.consumption.BSecond;s.locations.A='pocket';s.locations.B='hand';s.held='B';s.pose='growth-surprise';}
  if([9,12,15].includes(b)){
   const swap=b!==9,from=b===9?.32:b===12?.56:.36,to=b===9?.56:b===12?.36:1.1;
   s.scale=lerp(from,to,smooth((t-2600)/2400));s.pose=t<3000?'eat-cake':'growth-surprise';
   s.remainingA=b===15?g.rig.consumption.AFirst:1;s.remainingB=b>=12?g.rig.consumption.BFirst:1;
   const incoming=b===12?'A':'B',outgoing=b===12?'B':'A';
   if(swap&&t<1100){s.pose='right';s.held=t<500?outgoing:null;s.locations[outgoing]=t<500?'hand':'pocket';s.locations[incoming]='pocket';}
   else{
    s.held=incoming;s.locations.A=incoming==='A'?'hand':'pocket';s.locations.B=incoming==='B'?'hand':'pocket';
    const consumed=smooth((t-2100)/250);
    if(b===12)s.remainingA=lerp(1,g.rig.consumption.AFirst,consumed);
    else s.remainingB=lerp(b===9?1:g.rig.consumption.BFirst,b===9?g.rig.consumption.BFirst:g.rig.consumption.BSecond,consumed);
   }
   s.atMouth=t>=2000&&t<=2300;s.biting=t>=2100&&t<=2350;
  }
  return s;
 }
 draw(){
  if(!this.sceneThree()||!this.surface)return super.draw();
  this.trialRig??=new AliceMushroomRig(this,g,this.textures.get(P+'-alice').getSourceImage());
  const s=this.state(),main=this.surface.context;main.clearRect(0,0,1664,936);main.imageSmoothingEnabled=false;main.drawImage(this.textures.get(P+'-bg').getSourceImage(),0,0);
  this.trialLayer??=Object.assign(document.createElement('canvas'),{width:1664,height:936});const ctx=this.trialLayer.getContext('2d');ctx.clearRect(0,0,1664,936);ctx.imageSmoothingEnabled=false;
  const rig=this.trialRig.draw(ctx,s);s.uniformScale=this.trialRig.lastScale;s.hand=rig.hand;s.aliceBounds=rig.bounds;s.caterpillarBounds={left:470,top:430,right:470,bottom:430};s.hookahInstances=0;s.fragments=[];
  if(s.held&&s.shownFraction>0){
   const index=s.held==='A'?0:1,cut=g.fragmentCuts[index].atlasBounds,[l,t,r,b]=cut,remaining=s.held==='A'?s.remainingA:s.remainingB,k=.06*(s.scale/.32)*remaining,w=(r-l)*k,h=(b-t)*k;
   ctx.save();ctx.beginPath();ctx.rect(s.hand[0]-w*s.shownFraction/2,s.hand[1]-h/2,w*s.shownFraction,h);ctx.clip();ctx.drawImage(this.textures.get(P+'-atlas').getSourceImage(),l,t,r-l,b-t,s.hand[0]-w/2,s.hand[1]-h/2,w,h);ctx.restore();
   s.fragments.push({id:s.held,owner:'alice',location:'hand',anchor:[...s.hand],remaining,visibleFraction:s.shownFraction,bounds:{left:s.hand[0]-w/2,top:s.hand[1]-h/2,right:s.hand[0]+w/2,bottom:s.hand[1]+h/2}});
  }
  main.drawImage(this.trialLayer,0,0);this.surface.refresh();const f=super.fit(s,false);this.framing={...f,lock:P,fits:true};this.cameras.main.setViewport(0,0,this.scale.width,this.scale.height).setZoom(f.z).centerOn(f.x,f.y);this.viewport={x:0,y:0,width:this.scale.width,height:this.scale.height};
  this.current=s;this.cameraReframing=false;
 }
 diagnostics(){const d=super.diagnostics();if(this.current?.scene===3){d.environment='alice-c3-s3';d.s3=this.current;d.requiredActors=['alice'];d.requiredProps=[];d.cameraReframing=false;}return d;}
}
