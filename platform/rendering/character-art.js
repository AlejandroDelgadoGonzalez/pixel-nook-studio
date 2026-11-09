import {compactGrid} from './compact-atlas.js';
export function drawCharacter(ctx,source,sx,sy,sw,sh,width,height){
 const grid=document.createElement('canvas');grid.width=Math.max(1,Math.round(width/2));grid.height=Math.max(1,Math.round(height/2));
 const g=grid.getContext('2d',{willReadFrequently:true});g.imageSmoothingEnabled=false;const packed=compactGrid(source,[sx,sy,sx+sw,sy+sh],grid.width,grid.height);if(!packed)g.drawImage(source,sx,sy,sw,sh,0,0,grid.width,grid.height);
 const pixels=packed||g.getImageData(0,0,grid.width,grid.height);for(let i=3;i<pixels.data.length;i+=4)pixels.data[i]=pixels.data[i]>80?255:0;g.putImageData(pixels,0,0);
 ctx.imageSmoothingEnabled=false;ctx.drawImage(grid,0,0,grid.width,grid.height,0,0,width,height);
}

// Derived movement must preserve the same complete two-pixel clusters.
export function createPixelWalkFrames(scene,prefix,id,col,units=1){
 const source=scene.textures.get(`${prefix}-${id}-${col}`).getSourceImage(),w=source.width,h=source.height,snap=n=>Math.round(n/(2*units))*2*units,leg=snap(h*.79),split=snap(w/2);
 for(let frame=0;frame<8;frame++){
  const texture=scene.textures.createCanvas(`${prefix}-${id}-walk-${col}-${frame}`,w+12*units,h),ctx=texture.context,stride=Math.sin(frame*Math.PI/4),shift=snap(stride*3*units);ctx.imageSmoothingEnabled=false;
  ctx.drawImage(source,0,leg,split,h-leg,6*units+shift,leg-Math.max(0,snap(stride*2*units)),split,h-leg);
  ctx.drawImage(source,split,leg,w-split,h-leg,6*units+split-shift,leg-Math.max(0,snap(-stride*2*units)),w-split,h-leg);
  ctx.drawImage(source,0,0,w,leg+2*units,6*units,0,w,leg+2*units);texture.refresh();
 }
}
