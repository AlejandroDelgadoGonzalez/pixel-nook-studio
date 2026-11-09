import assert from 'node:assert/strict';

// Optional renderer contract: lowRoofOccluders contains source/world mapping,
// roofSourceY, and clips with actorId, actual mask sprite and optional crossing
// plane. Inspect real sprite/mask alpha rather than declared geometry alone.
export async function check(page) {
 const result=await page.evaluate(()=>{
  const scene=qaScene,e=scene.reader,config=scene.lowRoofOccluders;
  if(!config)return{scope:'no low-roof occluders declared',samples:0,roofPixels:0,exteriorPixels:0,issues:[]};
  const cache=new Map(),pixels=texture=>{
   if(!cache.has(texture.key)){const image=texture.getSourceImage();cache.set(texture.key,{width:image.width,height:image.height,data:image.getContext('2d').getImageData(0,0,image.width,image.height).data});}
   return cache.get(texture.key);
  };
  const m=config.mapping,issues=[];let samples=0,roofPixels=0,exteriorPixels=0;
  // Also inspect the whole roof column, including empty pixels above the
  // current hairstyle/ears: future taller poses must have no uncovered gap.
  if(config.sourceColumnBounds)for(const clip of config.clips){
   const mask=pixels(clip.mask.texture),[left,top,right]=config.sourceColumnBounds;
   const crossedLeft=clip.crossingPlaneWorldX===undefined?left:Math.max(left,(clip.crossingPlaneWorldX-m.translateX)/m.scaleX);
   for(let y=Math.ceil(top);y<config.roofSourceY;y++)for(let x=Math.ceil(crossedLeft);x<right;x++)if(mask.data[(y*mask.width+x)*4+3]!==255)issues.push({actor:clip.actorId,kind:'incomplete-upper-column',x,y});
  }
  for(const action of e.story.steps.filter(s=>s.type==='action')){
   const n=Math.ceil(action.duration/10);
   for(let i=0;i<=n;i++){
    e.start(action.id);e.paused=false;e.tick(action.duration*(i/n)*(1-1e-8));e.paused=true;scene.draw(0,true);
    for(const clip of config.clips){
     if(!clip.mask.visible)continue;
     const actor=scene.people[clip.actorId].actor,t=pixels(actor.texture),mask=pixels(clip.mask.texture);let leaks=0,hiddenOutside=0;samples++;
     for(let y=0;y<t.height;y++)for(let x=0;x<t.width;x++)if(t.data[(y*t.width+x)*4+3]>80){
      const wx=actor.x+(x+.5-t.width*actor.originX)*actor.scaleX,wy=actor.y+(y+.5-t.height*actor.originY)*actor.scaleY;
      const sx=Math.floor((wx-m.translateX)/m.scaleX),sy=Math.floor((wy-m.translateY)/m.scaleY);
      const alpha=sx>=0&&sy>=0&&sx<mask.width&&sy<mask.height?mask.data[(sy*mask.width+sx)*4+3]:0;
      const crossed=clip.crossingPlaneWorldX===undefined||wx>=clip.crossingPlaneWorldX;
      if(crossed&&sy<config.roofSourceY){roofPixels++;if(alpha<255)leaks++;}
      if(!crossed){exteriorPixels++;if(alpha>0)hiddenOutside++;}
     }
     if(leaks||hiddenOutside)issues.push({action:action.id,actor:clip.actorId,fraction:i/n,leakingRoofPixels:leaks,hiddenExteriorPixels:hiddenOutside});
    }
   }
  }
  return{scope:'actual low-roof alpha through every action at10ms intervals',samples,roofPixels,exteriorPixels,issues};
 });
 assert.deepEqual(result.issues,[]);return result;
}
