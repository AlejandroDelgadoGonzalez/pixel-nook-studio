import {WhoAreYou} from './who-are-you.js';
const ROOT='/stories/alice-in-wonderland/',P='alice-c3-s1';
const g=await fetch(ROOT+'shared/chapter-3-scene-2-geometry.json').then(r=>r.json());
const clamp=v=>Math.max(0,Math.min(1,v)),smooth=v=>{const t=clamp(v);return t*t*(3-2*t);};
const mix=(a,b,t)=>a+(b-a)*t;
export class OneSideOther extends WhoAreYou{
 sceneTwo(){const s=this.reader.step;return !!(s?.s2Beat||s?.sceneIndex===1&&(s?.exportPhase||s?.type==='end'));}
 state(){
  if(!this.sceneTwo()){
   if((this.reader.step?.exportPhase||this.reader.step?.type==='end')&&!this.reader.step.c3Beat)return{beat:11,elapsed:this.reader.elapsed||0,alice:[...g.anchors.aliceInherited],root:[...g.anchors.caterpillarSeat],mask:false,seated:true,pose:'mouthpiece-low-right'};
   return super.state();
  }
  const b=this.reader.step.s2Beat||13,t=this.reader.elapsed||0;let root=[...g.anchors.caterpillarSeat],mask=false;
  if(b===12){const points=g.walkPaths.caterpillarRetreat.waypoints,u=clamp(t/4000)*3,i=Math.min(2,Math.floor(u));root=points[i].map((v,k)=>mix(v,points[i+1][k],u-i));mask=u>=1;}
  if(b>=13){root=[...g.anchors.climbHidden];mask=true;}
  const lift=b===11?(t<1500?0:1):b>=12?1:0;
  return{scene:2,beat:b,elapsed:t,alice:[...g.anchors.aliceInherited],root,mask,seated:b<=10||b===11&&t<1500,pose:b<=10||b===11&&t<1500?'mouthpiece-low-right':'climb-carry-right',
   pickup:b===11,contact:b>11||b===11&&t>=1500,hookahBase:b<=10?[...g.anchors.hookahBase]:g.pickup.vesselBaseStart.map((v,k)=>mix(v,g.pickup.vesselBaseEnd[k],lift)+(root[k]-g.anchors.caterpillarSeat[k])),
   cameraProgress:b===12?(t<1200?smooth(t/1200):1-smooth((t-2000)/2000)):0};
 }
 draw(){
  if(!this.sceneTwo()||!this.surface)return super.draw();
  const s=this.state(),main=this.surface.context,bg=this.textures.get(P+'-bg').getSourceImage(),atlas=this.textures.get(P+'-atlas').getSourceImage();
  this.actorLayer??=Object.assign(document.createElement('canvas'),{width:1664,height:936});
  const ctx=this.actorLayer.getContext('2d');ctx.clearRect(0,0,1664,936);ctx.imageSmoothingEnabled=false;
  main.clearRect(0,0,1664,936);main.imageSmoothingEnabled=false;main.drawImage(bg,0,0);
  const c=g.caterpillar.atlas.find(c=>c.id===s.pose),b=c.sourceBoundsExclusive,local=c.contentBoundsInSourceCell,r=s.seated?g.caterpillar.rootSource:g.caterpillar.climbRootSource,scale=g.caterpillar.nativeScale;
  let cb={left:s.root[0]-(r[0]-local[0])*scale,top:s.root[1]-(r[1]-local[1])*scale,right:s.root[0]-(r[0]-local[0])*scale+(b[2]-b[0])*scale,bottom:s.root[1]-(r[1]-local[1])*scale+(b[3]-b[1])*scale};
  ctx.drawImage(atlas,b[0],b[1],b[2]-b[0],b[3]-b[1],cb.left,cb.top,cb.right-cb.left,cb.bottom-cb.top);
  if(s.mask){ctx.save();ctx.globalCompositeOperation='destination-out';ctx.beginPath();g.occluders[0].polygon.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();ctx.restore();}
  main.drawImage(this.actorLayer,0,0);
  const as=g.alice.nativeScale,[ax,ay]=g.alice.rootNative,ab={left:s.alice[0]-ax*as,top:s.alice[1]-ay*as,right:s.alice[0]+(this.aliceSource.width-ax)*as,bottom:s.alice[1]+(this.aliceSource.height-ay)*as};
  main.drawImage(this.aliceSource,ab.left,ab.top,this.aliceSource.width*as,this.aliceSource.height*as);this.surface.refresh();
  const a=super.fit(s,false),up=super.fit(s,true),f={...a,y:mix(a.y,up.y,s.cameraProgress)};
  this.framing={...f,lock:P,fits:true};this.cameras.main.setViewport(0,0,this.scale.width,this.scale.height).setZoom(f.z).centerOn(f.x,f.y);this.viewport={x:0,y:0,width:this.scale.width,height:this.scale.height};
  this.current={...s,aliceBounds:ab,caterpillarBounds:cb,hookahInstances:1,rootFixedDuringPickup:true};this.cameraReframing=s.beat===12;
 }
 diagnostics(){const d=super.diagnostics();if(this.current?.scene===2){d.environment='alice-c3-s2';d.s2=this.current;}return d;}
}
