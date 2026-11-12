import {WhoAreYou} from './who-are-you.js';
import {CaterpillarPickup} from './caterpillar-pickup.js';
const ROOT='/stories/alice-in-wonderland/',P='alice-c3-s1';
const g=await fetch(ROOT+'shared/chapter-3-scene-2-geometry.json').then(r=>r.json());
const mesh=await fetch(ROOT+'shared/chapter-3-scene-2-pickup.json').then(r=>r.json());
const clamp=v=>Math.max(0,Math.min(1,v)),smooth=v=>{const t=clamp(v);return t*t*(3-2*t);};
const mix=(a,b,t)=>a+(b-a)*t;
function sealAnimatedSilhouette(ctx){
 // Native part interpolation can leave a few detached transition pixels.
 // Keep the complete connected body/hand/vessel silhouette, never floating debris.
 const im=ctx.getImageData(450,285,110,100),p=im.data,seen=new Uint8Array(11000),groups=[];
 for(let i=0;i<11000;i++)if(p[i*4+3]>=128&&!seen[i]){
  const group=[],stack=[i];seen[i]=1;
  while(stack.length){const n=stack.pop();group.push(n);const x=n%110,y=Math.floor(n/110);
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy,j=Y*110+X;if(X>=0&&X<110&&Y>=0&&Y<100&&!seen[j]&&p[j*4+3]>=128){seen[j]=1;stack.push(j);}}
  }groups.push(group);
 }
 groups.sort((a,b)=>b.length-a.length);const keep=new Uint8Array(11000);for(const i of groups[0]||[])keep[i]=1;
 for(let i=0;i<11000;i++)if(!keep[i])p[i*4+3]=0;
 ctx.putImageData(im,450,285);
 const main=groups[0]||[];return{left:450+Math.min(...main.map(i=>i%110)),top:285+Math.min(...main.map(i=>Math.floor(i/110))),right:451+Math.max(...main.map(i=>i%110)),bottom:286+Math.max(...main.map(i=>Math.floor(i/110)))};
}
export class OneSideOther extends WhoAreYou{
 create(){super.create();this.pickupArt=new CaterpillarPickup(this.textures.get(P+'-atlas').getSourceImage(),g,mesh);}
 sceneTwo(){const s=this.reader.step;return !!(s?.s2Beat||s?.sceneIndex===1&&s?.exportPhase);}
 state(){
  if(!this.sceneTwo()){
   if(this.reader.step?.exportPhase&&!this.reader.step.c3Beat)return{beat:12,elapsed:this.reader.elapsed||0,alice:[...g.anchors.aliceInherited],root:[...g.anchors.caterpillarSeat],mask:false,seated:true,pose:'mouthpiece-low-right'};
   return super.state();
  }
  const b=this.reader.step.s2Beat||14,t=this.reader.elapsed||0;let root=[...g.anchors.caterpillarSeat],mask=false;
  if(b===12){const points=g.walkPaths.caterpillarRetreat.waypoints,u=clamp(t/4000)*3,i=Math.min(2,Math.floor(u));root=points[i].map((v,k)=>mix(v,points[i+1][k],u-i));mask=u>=1;}
  if(b>=13){root=[...g.anchors.climbHidden];mask=true;}
  const lift=b===11?smooth((t-1000)/2000):b>=12?1:0;
  return{scene:2,beat:b,elapsed:t,alice:[...g.anchors.aliceInherited],root,mask,seated:b<=10,pose:b<=10?'mouthpiece-low-right':'climb-carry-right',
   pickup:b===11,contact:b>11||b===11&&t>=1000,hookahBase:b<=10?[...g.anchors.hookahBase]:g.pickup.vesselBaseStart.map((v,k)=>mix(v,g.pickup.vesselBaseEnd[k],lift)+(root[k]-g.anchors.caterpillarSeat[k])),
   cameraProgress:b<10?0:b===10?smooth((t-4800)/1200):1};
 }
 draw(){
  if(!this.sceneTwo()||!this.surface)return super.draw();
  const s=this.state(),main=this.surface.context,bg=this.textures.get(P+'-bg').getSourceImage(),atlas=this.textures.get(P+'-atlas').getSourceImage();
  this.actorLayer??=Object.assign(document.createElement('canvas'),{width:1664,height:936});
  const ctx=this.actorLayer.getContext('2d');ctx.clearRect(0,0,1664,936);ctx.imageSmoothingEnabled=false;
  main.clearRect(0,0,1664,936);main.imageSmoothingEnabled=false;main.drawImage(bg,0,0);
  const c=g.caterpillar.atlas.find(c=>c.id===s.pose),b=c.sourceBoundsExclusive,local=c.contentBoundsInSourceCell,r=s.seated?g.caterpillar.rootSource:g.caterpillar.climbRootSource,scale=g.caterpillar.nativeScale;
  let cb={left:s.root[0]-(r[0]-local[0])*scale,top:s.root[1]-(r[1]-local[1])*scale,right:s.root[0]-(r[0]-local[0])*scale+(b[2]-b[0])*scale,bottom:s.root[1]-(r[1]-local[1])*scale+(b[3]-b[1])*scale};
  if(s.pickup&&s.elapsed>0&&s.elapsed<3000){
   this.pickupArt??=new CaterpillarPickup(atlas,g,mesh);
   ctx.drawImage(this.pickupArt.render(s.elapsed),s.root[0]-40,s.root[1]-85,100,100);
   cb=sealAnimatedSilhouette(ctx);
  }else{
   const pose=s.pickup&&s.elapsed===0?g.caterpillar.atlas.find(c=>c.id==='mouthpiece-low-right'):c;
   if(pose!==c){const q=pose.sourceBoundsExclusive,l=pose.contentBoundsInSourceCell;cb={left:490-(150-l[0])*.2,top:370-(452-l[1])*.2,right:490-(150-l[0])*.2+(q[2]-q[0])*.2,bottom:370-(452-l[1])*.2+(q[3]-q[1])*.2};ctx.drawImage(atlas,q[0],q[1],q[2]-q[0],q[3]-q[1],cb.left,cb.top,cb.right-cb.left,cb.bottom-cb.top);}
   else ctx.drawImage(atlas,b[0],b[1],b[2]-b[0],b[3]-b[1],cb.left,cb.top,cb.right-cb.left,cb.bottom-cb.top);
  }
  if(s.mask){ctx.save();ctx.globalCompositeOperation='destination-out';ctx.beginPath();g.occluders[0].polygon.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();ctx.restore();}
  main.drawImage(this.actorLayer,0,0);
  const as=g.alice.nativeScale,[ax,ay]=g.alice.rootNative,ab={left:s.alice[0]-ax*as,top:s.alice[1]-ay*as,right:s.alice[0]+(this.aliceSource.width-ax)*as,bottom:s.alice[1]+(this.aliceSource.height-ay)*as};
  main.drawImage(this.aliceSource,ab.left,ab.top,this.aliceSource.width*as,this.aliceSource.height*as);this.surface.refresh();
  const a=super.fit(s,false),end=super.fit(s,true),f=Object.fromEntries(['x','y','z'].map(k=>[k,mix(a[k],end[k],s.cameraProgress)]));
  this.framing={...f,lock:P,fits:true};this.cameras.main.setViewport(0,0,this.scale.width,this.scale.height).setZoom(f.z).centerOn(f.x,f.y);this.viewport={x:0,y:0,width:this.scale.width,height:this.scale.height};
  this.current={...s,aliceBounds:ab,caterpillarBounds:cb,hookahInstances:1,rootFixedDuringPickup:true};this.cameraReframing=s.beat===10&&s.elapsed>=4800&&s.elapsed<6000;
 }
 diagnostics(){const d=super.diagnostics();if(this.current?.scene===2){d.environment='alice-c3-s2';d.s2=this.current;}return d;}
}
