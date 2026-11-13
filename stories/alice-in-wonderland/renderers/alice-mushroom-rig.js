import {nativeAtlasFrame} from '../../../platform/rendering/compact-atlas.js';
import {createPixelWalkFrames} from '../../../platform/rendering/character-art.js';
export const clamp=t=>Math.max(0,Math.min(1,t));
export const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
export const lerp=(a,b,t)=>a+(b-a)*t;
// Intact interaction poses; shared canonical upright locomotion cache.
// No custom anatomical masks, reaching rigs, extra limbs or joint transforms.
export class AliceMushroomRig{
 constructor(scene,geometry,source){
  this.geometry=geometry;this.poses={};for(const c of geometry.nativePoses)this.poses[c.pose]={image:nativeAtlasFrame(source,c.storageCrop).source,root:c.rootNative,hand:c.handNative};
  const prefix='alice-c3-canonical',units=geometry.rig.walking.nativeUnits;
  scene.textures.addCanvas(prefix+'-alice-right',this.poses.right.image);
  createPixelWalkFrames(scene,prefix,'alice','right',units);
  this.walkFrames=Array.from({length:8},(_,i)=>scene.textures.get(prefix+'-alice-walk-right-'+i).getSourceImage());
 }
 draw(ctx,s){
  const name=s.walking?'right':s.pose,p=this.poses[name],k=.3*s.scale,padding=s.walking?6*this.geometry.rig.walking.nativeUnits:0;
  const image=s.walking?this.walkFrames[Math.floor(s.elapsed/this.geometry.rig.walking.frameMs)%8]:p.image;
  ctx.save();ctx.translate(...s.alice);ctx.scale(s.mirror?-k:k,k);ctx.imageSmoothingEnabled=false;
  const m=ctx.getTransform();this.lastScale={x:Math.abs(m.a),y:Math.abs(m.d)};ctx.drawImage(image,-p.root[0]-padding,-p.root[1]);ctx.restore();
  s.renderedPose=name;s.fullSpriteOnly=true;
  const hand=[s.alice[0]+(p.hand[0]-p.root[0])*k*(s.mirror?-1:1),s.alice[1]+(p.hand[1]-p.root[1])*k];
  return{hand,bounds:{left:s.alice[0]-(s.mirror?p.image.width-p.root[0]:p.root[0])*k-padding*k,top:s.alice[1]-p.root[1]*k,right:s.alice[0]+(s.mirror?p.root[0]:p.image.width-p.root[0])*k+padding*k,bottom:s.alice[1]+(p.image.height-p.root[1])*k}};
 }
}
