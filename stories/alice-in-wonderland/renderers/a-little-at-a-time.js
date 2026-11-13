import {OneSideOther} from './one-side-other.js';
import {AliceMushroomRig,clamp,smooth,lerp} from './alice-mushroom-rig.js';
const ROOT='/stories/alice-in-wonderland/',P='alice-c3-s1';
const g=await fetch(ROOT+'shared/chapter-3-scene-3-geometry.json').then(r=>r.json());
export class ALittleAtATime extends OneSideOther{
 sceneThree(){const s=this.reader.step;return !!(s?.s3Beat||s?.sceneIndex===2&&(s?.exportPhase||s?.type==='end'));}
 state(){
  if(!this.sceneThree())return super.state();
  const b=this.reader.step.s3Beat||17,t=this.reader.elapsed||0;
  const s={scene:3,beat:b,elapsed:t,alice:[500,615],root:[470,430],mask:true,seated:false,pose:'eat-cake',mirror:true,scale:.32,armAngle:g.rig.eat.holdAngle,walking:false,held:null,shownFraction:1,remainingA:1,remainingB:1,locations:{A:'stem',B:'stem'}};
  if(b===1){s.alice=[lerp(535,575,clamp(t/3000)),lerp(615,608,clamp(t/3000))];s.pose=t===0?'back':t>=2700?'alice-offer-right':'right';s.mirror=t>=2700;s.armAngle=0;s.walking=t>0&&t<3000;}
  if(b===2||b===3){s.alice=[575,608];s.pose='alice-offer-right';s.mirror=true;s.armAngle=b===3?g.rig.offer.pocketAngle*smooth((t-600)/1800):0;if(b===3){s.held='A';s.shownFraction=t<600?smooth(t/600):1-smooth((t-2500)/500);s.locations.A=t>=3000?'pocket':'hand';}}
  if(b>=4)s.locations.A='pocket';
  if(b===4){s.alice=[lerp(575,411,clamp(t/3000)),608];s.pose='alice-offer-right';s.mirror=t<2700;s.armAngle=t<2700?g.rig.offer.pocketAngle:0;s.walking=t<3000;}
  if(b===5||b===6){s.alice=[411,608];s.pose='alice-offer-right';s.mirror=false;s.armAngle=b===6?g.rig.offer.holdAngle*smooth((t-700)/2300):0;if(b===6){s.held='B';s.shownFraction=smooth(t/700);s.locations.B='hand';}}
  if(b>=7){s.locations.B='hand';s.held='B';}
  if(b===7){s.alice=[lerp(411,500,clamp(t/3000)),lerp(608,615,clamp(t/3000))];s.pose=t<2700?'alice-offer-right':'eat-cake';s.mirror=t>=2700;s.armAngle=t<2700?g.rig.offer.holdAngle:g.rig.eat.holdAngle;s.walking=t<3000;}
  if(b>=10){s.scale=.56;s.remainingB=g.rig.consumption.BFirst;s.pose='growth-surprise';s.armAngle=0;}
  if(b===11){s.pose='eat-cake';s.armAngle=g.rig.eat.holdAngle;}
  if(b>=13){s.scale=.36;s.remainingA=g.rig.consumption.AFirst;s.locations.B='pocket';s.locations.A='hand';s.held='A';s.pose=b===14?'eat-cake':'growth-surprise';s.armAngle=b===14?g.rig.eat.holdAngle:0;}
  if(b>=16){s.scale=1.1;s.remainingB=g.rig.consumption.BSecond;s.locations.A='pocket';s.locations.B='hand';s.held='B';s.pose='growth-surprise';s.armAngle=0;}
  if([9,12,15].includes(b)){
   const swap=b!==9,from=b===9?.32:b===12?.56:.36,to=b===9?.56:b===12?.36:1.1;
   s.scale=lerp(from,to,smooth((t-2600)/2400));s.pose=t<3000?'eat-cake':'growth-surprise';s.armAngle=0;
   s.remainingA=b===15?g.rig.consumption.AFirst:1;s.remainingB=b===15?g.rig.consumption.BFirst:b===12?g.rig.consumption.BFirst:1;
   if(swap&&t<1500){
    const outgoing=b===12?'B':'A',incoming=b===12?'A':'B';
    s.held=t<750?outgoing:incoming;s.armAngle=t<750?lerp(g.rig.eat.holdAngle,g.rig.eat.pocketAngle,smooth(t/750)):g.rig.eat.pocketAngle;
    s.shownFraction=t<750?1-smooth((t-500)/250):smooth((t-750)/350);
    s.locations[outgoing]=t<750?'hand':'pocket';s.locations[incoming]=t<750?'pocket':'hand';
   }else{
    s.held=b===12?'A':'B';s.locations.A=s.held==='A'?'hand':'pocket';s.locations.B=s.held==='B'?'hand':'pocket';
    if(t<2100)s.armAngle=lerp(swap?g.rig.eat.pocketAngle:g.rig.eat.holdAngle,0,smooth((t-(swap?1100:0))/(swap?1000:1500)));
    else if(t<3000)s.armAngle=lerp(0,g.rig.eat.holdAngle,smooth((t-2300)/700));
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
