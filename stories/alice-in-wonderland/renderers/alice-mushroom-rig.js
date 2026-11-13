import {nativeAtlasFrame} from '../../../platform/rendering/compact-atlas.js';
import {createPixelWalkFrames} from '../../../platform/rendering/character-art.js';
export const clamp=t=>Math.max(0,Math.min(1,t));
export const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
export const lerp=(a,b,t)=>a+(b-a)*t;
const canvas=(w,h)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
// Native pixels only: isolate an authored forearm, rotate at its sleeve joint,
// and derive the eight footstep frames from the same complete pose.
export class AliceMushroomRig{
 constructor(scene,geometry,source){
  this.scene=scene;this.geometry=geometry;this.poses={};
  for(const cut of geometry.nativePoses){
   const image=nativeAtlasFrame(source,cut.storageCrop).source;
   this.poses[cut.pose]={image,root:cut.rootNative,hand:cut.handNative};
  }
  for(const [name,id]of [['alice-offer-right','offer'],['eat-cake','eat']]){
   const p=this.poses[name],spec=geometry.rig[id],body=canvas(p.image.width,p.image.height),part=canvas(p.image.width,p.image.height);
   const c=body.getContext('2d'),a=part.getContext('2d');c.drawImage(p.image,0,0);a.save();a.beginPath();
   if(spec.partRect){const[l,t,r,b]=spec.partRect;a.rect(l,t,r-l,b-t);}else spec.partPolygon.forEach(([x,y],i)=>i?a.lineTo(x,y):a.moveTo(x,y));
   a.closePath();a.clip();a.drawImage(p.image,0,0);a.restore();
   if(id==='eat')a.clearRect(84,0,part.width-84,330); // Face/jaw never belongs to the moving forearm.
   const pixels=a.getImageData(0,0,part.width,part.height);for(let i=3;i<pixels.data.length;i+=4)pixels.data[i]=pixels.data[i]>=128?255:0;a.putImageData(pixels,0,0);
   c.globalCompositeOperation='destination-out';c.drawImage(part,0,0);c.globalCompositeOperation='source-over';
   const[jx,jy]=spec.pivot;c.drawImage(p.image,jx-10,jy-10,20,20,jx-10,jy-10,20,20);
   p.body=body;p.part=part;p.pivot=spec.pivot;
  }
  for(const name of ['right','alice-offer-right','eat-cake']){
   const p=this.poses[name],key='alice-c3-s3-walk';
   scene.textures.addCanvas(`${key}-alice-${name}`,p.body||p.image);
   createPixelWalkFrames(scene,key,'alice',name,geometry.rig.walking.nativeUnits);
   p.walk=Array.from({length:8},(_,i)=>scene.textures.get(`${key}-alice-walk-${name}-${i}`).getSourceImage());
  }
 }
 localHand(pose,angle=0){const p=this.poses[pose];if(!p.part)return [...p.hand];const[x,y]=p.pivot,dx=p.hand[0]-x,dy=p.hand[1]-y;return[x+dx*Math.cos(angle)-dy*Math.sin(angle),y+dx*Math.sin(angle)+dy*Math.cos(angle)];}
 worldPoint(s,point){const p=this.poses[s.pose],k=.3*s.scale;return[s.alice[0]+(point[0]-p.root[0])*k*(s.mirror?-1:1),s.alice[1]+(point[1]-p.root[1])*k];}
 draw(ctx,s){
  const p=this.poses[s.pose],k=.3*s.scale,walking=s.walking,body=walking?p.walk[Math.floor(s.elapsed/this.geometry.rig.walking.frameMs)%8]:p.body||p.image;
  ctx.save();ctx.translate(...s.alice);ctx.scale(s.mirror?-k:k,k);ctx.imageSmoothingEnabled=false;
  const transform=ctx.getTransform();this.lastScale={x:Math.abs(transform.a),y:Math.abs(transform.d)};ctx.drawImage(body,-p.root[0]-(walking?24:0),-p.root[1]);
  if(p.part){const[x,y]=p.pivot;ctx.translate(x-p.root[0],y-p.root[1]);ctx.rotate(s.armAngle);ctx.drawImage(p.part,-x,-y);}
  ctx.restore();
  const hand=this.worldPoint(s,this.localHand(s.pose,s.armAngle));
  return {hand,bounds:{left:s.alice[0]-(s.mirror?p.image.width-p.root[0]:p.root[0])*k-(walking?2.304:0),top:s.alice[1]-p.root[1]*k,right:s.alice[0]+(s.mirror?p.root[0]:p.image.width-p.root[0])*k+(walking?2.304:0),bottom:s.alice[1]+(p.image.height-p.root[1])*k}};
 }
}
