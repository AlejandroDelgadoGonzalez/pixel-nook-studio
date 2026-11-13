import {ALittleAtATime} from './a-little-at-a-time.js';
import {AliceMushroomRig,clamp,smooth,lerp} from './alice-mushroom-rig.js';
const ROOT='/stories/alice-in-wonderland/',P='alice-c3-s1',B='alice-c3-s4';
const g=await fetch(ROOT+'shared/chapter-3-scene-4-geometry.json').then(r=>r.json());
const aliceGeometry=await fetch(ROOT+'shared/chapter-3-scene-3-geometry.json').then(r=>r.json());
export class AmongTheBranches extends ALittleAtATime{
 preload(){super.preload();this.load.image(B+'-pigeon',ROOT+'shared/pigeon-master-atlas.png');}
 create(){
  const ready=this.ready;
  this.ready=scene=>{const p=g.pigeon.poses[0],b=p.bounds,c=document.createElement('canvas');c.width=b[2]-b[0];c.height=b[3]-b[1];c.getContext('2d').drawImage(this.textures.get(B+'-pigeon').getSourceImage(),b[0],b[1],c.width,c.height,0,0,c.width,c.height);this.portraits.pigeon=c.toDataURL();ready(scene);};
  super.create();this.ready=ready;
 }
 sceneFour(){const s=this.reader.step;return !!(s?.s4Beat||s?.sceneIndex===3&&(s?.exportPhase||s?.type==='end'));}
 state(){
  if(!this.sceneFour())return super.state();
  const b=this.reader.step.s4Beat||16,t=this.reader.elapsed||0;
  const s={scene:4,beat:b,elapsed:t,alice:[...g.anchors.aliceConversation],root:[470,430],mask:true,seated:false,pose:'growth-surprise',mirror:false,scale:1.1,walking:false,held:'B',shownFraction:1,remainingA:.92,remainingB:.78,locations:{A:'pocket',B:'hand'},birdRoot:[...g.anchors.pigeonPerch],birdPose:[2,4,6,8,11].includes(b)&&Math.floor(t/360)%2===0?'speak-right':'perch-right',birdMirror:false,birdMask:false,birdOpacity:1,focusX:475};
  if(b===1){
   s.focusX=lerp(500,475,smooth(t/1200));s.mirror=t===0;
   s.birdRoot=this.flight(g.walkPaths[1].waypoints,t/5000);s.birdMask=t<5000;s.birdOpacity=clamp(t/5000);
   s.birdPose=t<5000?this.flightPose(t):'perch-right';
  }
  if(b===10){
   s.pose=t<1100?'right':t<3000?'eat-cake':'growth-surprise';s.mirror=t<1100;
   s.held=t<500?'B':t<1100?null:'A';s.locations={A:t<1100?'pocket':'hand',B:t<500?'hand':'pocket'};
   s.scale=lerp(1.1,.46,smooth((t-2600)/2400));s.remainingA=lerp(.92,.84,smooth((t-2100)/250));s.biting=t>=2100&&t<=2350;
  }
  if(b>=11){s.scale=.46;s.held='A';s.remainingA=.84;s.locations={A:'hand',B:'pocket'};}
  if(b>=13){s.birdRoot=this.flight(g.walkPaths[2].waypoints,b===13?t/3000:1);s.birdPose=this.flightPose(t);s.birdMirror=true;s.birdMask=true;}
  if(b>=15){
   s.pose='right';s.mirror=false;s.held=b===15&&t<500?'A':null;s.locations.A=s.held?'hand':'pocket';
   const u=b===16?1:clamp((t-500)/3000);s.alice=[lerp(500,640,u),615];s.focusX=lerp(475,500,smooth(u));s.walking=b===15&&t>=500&&t<3500;
   // The canonical gait clock starts when X starts, after the pocket action.
   s.elapsed=s.walking?t-500:t;
  }
  return s;
 }
 flight(points,fraction){const u=clamp(fraction)*2,i=Math.min(1,Math.floor(u));return points[i].map((x,k)=>lerp(x,points[i+1][k],u-i));}
 flightPose(t){return Math.floor(t/180)%2?'fly-down-right':'fly-up-right';}
 draw(){
  if(!this.sceneFour()||!this.surface){this.lastBranchImage=null;return super.draw();}
  this.trialRig??=new AliceMushroomRig(this,aliceGeometry,this.textures.get(P+'-alice').getSourceImage());this.branchRig=this.trialRig;
  const s=this.state(),key=JSON.stringify([s.alice,s.pose,s.mirror,s.scale,s.held,s.remainingA,s.remainingB,s.birdRoot,s.birdPose,s.birdMirror,s.birdMask,s.birdOpacity,s.walking?Math.floor(s.elapsed/130)%8:null]);
  if(this.lastBranchImage?.key===key){Object.assign(s,this.lastBranchImage.geometry);this.present(s);return;}
  const main=this.surface.context;main.clearRect(0,0,1664,936);main.imageSmoothingEnabled=false;main.drawImage(this.textures.get(P+'-bg').getSourceImage(),0,0);
  this.birdLayer??=Object.assign(document.createElement('canvas'),{width:1664,height:936});const bc=this.birdLayer.getContext('2d');bc.clearRect(0,0,1664,936);bc.imageSmoothingEnabled=false;
  const p=g.pigeon.poses.find(p=>p.id===s.birdPose),[l,t,r,b]=p.bounds,k=p.worldScale;
  bc.save();bc.translate(...s.birdRoot);bc.scale(s.birdMirror?-k:k,k);bc.drawImage(this.textures.get(B+'-pigeon').getSourceImage(),l,t,r-l,b-t,-p.rootNative[0],-p.rootNative[1],r-l,b-t);bc.restore();
  if(s.birdMask){bc.save();bc.globalCompositeOperation='destination-out';bc.beginPath();g.occluders[0].polygon.forEach(([x,y],i)=>i?bc.lineTo(x,y):bc.moveTo(x,y));bc.closePath();bc.fill();bc.restore();}
  main.save();main.globalAlpha=s.birdOpacity;main.drawImage(this.birdLayer,0,0);main.restore();
  this.branchAliceLayer??=Object.assign(document.createElement('canvas'),{width:1664,height:936});const ac=this.branchAliceLayer.getContext('2d');ac.clearRect(0,0,1664,936);ac.imageSmoothingEnabled=false;
  const rig=this.branchRig.draw(ac,s);s.hand=rig.hand;s.aliceBounds=rig.bounds;s.uniformScale=this.branchRig.lastScale;s.fragments=[];
  if(s.held){const index=s.held==='A'?0:1,[l,t,r,b]=aliceGeometry.fragmentCuts[index].atlasBounds,remaining=index?s.remainingB:s.remainingA,scale=.06*(s.scale/.32)*remaining,w=(r-l)*scale,h=(b-t)*scale,bounds={left:s.hand[0]-w/2,top:s.hand[1]-h/2,right:s.hand[0]+w/2,bottom:s.hand[1]+h/2};ac.save();ac.beginPath();ac.rect(bounds.left,bounds.top,w,h);ac.clip();ac.drawImage(this.textures.get(P+'-atlas').getSourceImage(),l,t,r-l,b-t,bounds.left,bounds.top,w,h);ac.restore();s.fragments.push({id:s.held,owner:'alice',location:'hand',anchor:[...s.hand],remaining,bounds});}
  main.drawImage(this.branchAliceLayer,0,0);this.surface.refresh();
  s.caterpillarBounds={left:470,top:430,right:470,bottom:430};s.hookahInstances=0;
  // Measure the pixels actually left by the foliage; bounds never imply a hidden bird is visible.
  const pixels=bc.getImageData(230,270,180,170).data;let x0=180,y0=170,x1=-1,y1=-1;
  for(let j=0;j<pixels.length/4;j++)if(pixels[j*4+3]){const x=j%180,y=Math.floor(j/180);x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
  s.birdVisible=x1>=0&&s.birdOpacity>0;s.birdBounds=s.birdVisible?{left:230+x0,top:270+y0,right:231+x1,bottom:271+y1}:null;
  this.lastBranchImage={key,geometry:Object.fromEntries(['hand','aliceBounds','uniformScale','fragments','caterpillarBounds','hookahInstances','birdVisible','birdBounds','renderedPose','fullSpriteOnly'].map(k=>[k,s[k]]))};this.present(s);
 }
 present(s){
  const f=super.fit(s,false),half=this.scale.width/(2*f.z);f.x=Math.max(2+half,Math.min(1662-half,s.focusX));
  this.framing={...f,lock:P,fits:true};this.cameras.main.setViewport(0,0,this.scale.width,this.scale.height).setZoom(f.z).centerOn(f.x,f.y);this.viewport={x:0,y:0,width:this.scale.width,height:this.scale.height};
  this.current=s;this.cameraReframing=s.beat===1&&s.elapsed<1200||s.beat===15&&s.walking;
 }
 diagnostics(){const d=super.diagnostics();if(this.current?.scene===4){const s=this.current,f=this.framing,w=this.scale.width,h=this.scale.height,project=(x,y)=>({x:(x-f.x)*f.z+w/2,y:(y-f.y)*f.z+h/2});d.environment=B;d.s4=s;d.requiredActors=['alice'];d.requiredProps=[];d.cameraReframing=this.cameraReframing;if(s.birdVisible){const b=s.birdBounds;d.actors.pigeon={...project(...s.birdRoot),head:project(s.birdRoot[0],b.top),world:{x:s.birdRoot[0],y:s.birdRoot[1]},visible:s.birdOpacity,bounds:{left:project(b.left,b.top).x,top:project(b.left,b.top).y,right:project(b.right,b.bottom).x,bottom:project(b.right,b.bottom).y}};d.requiredActors.push('pigeon');}}return d;}
}
