import {nativeAtlasFrame} from '../../../platform/rendering/compact-atlas.js';
export const clamp=t=>Math.max(0,Math.min(1,t));
export const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
export const lerp=(a,b,t)=>a+(b-a)*t;
// Only complete authored cells: no anatomical masks, extra limbs or joint transforms.
export class AliceMushroomRig{
 constructor(scene,geometry,source){this.geometry=geometry;this.poses={};for(const c of geometry.nativePoses)this.poses[c.pose]={image:nativeAtlasFrame(source,c.storageCrop).source,root:c.rootNative,hand:c.handNative};}
 draw(ctx,s){
  const name=s.walking?this.geometry.rig.walking.fullPoseCells[Math.floor(s.elapsed/this.geometry.rig.walking.frameMs)%4]:s.pose,p=this.poses[name],k=.3*s.scale;
  ctx.save();ctx.translate(...s.alice);ctx.scale(s.mirror?-k:k,k);ctx.imageSmoothingEnabled=false;
  const m=ctx.getTransform();this.lastScale={x:Math.abs(m.a),y:Math.abs(m.d)};ctx.drawImage(p.image,-p.root[0],-p.root[1]);ctx.restore();
  s.renderedPose=name;s.fullSpriteOnly=true;
  const hand=[s.alice[0]+(p.hand[0]-p.root[0])*k*(s.mirror?-1:1),s.alice[1]+(p.hand[1]-p.root[1])*k];
  return{hand,bounds:{left:s.alice[0]-(s.mirror?p.image.width-p.root[0]:p.root[0])*k,top:s.alice[1]-p.root[1]*k,right:s.alice[0]+(s.mirror?p.root[0]:p.image.width-p.root[0])*k,bottom:s.alice[1]+(p.image.height-p.root[1])*k}};
 }
}
