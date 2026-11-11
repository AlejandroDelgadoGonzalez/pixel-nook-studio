// Recolor only existing dark floor pixels; retain the authored aperture alpha.
// Two-pixel bands preserve the room's pixel grid without a geometric overlay.
export function lightThresholdFloor(context, floorSource, sourceLeft, sourceFloorY, falloffPx = 12, floorEdge = context.canvas.height) {
 const {width, height} = context.canvas, step = 2;
 const sample = document.createElement('canvas'); sample.width = width; sample.height = step;
 const source = sample.getContext('2d', {willReadFrequently:true});
 source.drawImage(floorSource, sourceLeft, sourceFloorY, width, step, 0, 0, width, step);
 const floor = source.getImageData(0,0,width,step).data, image = context.getImageData(0,0,width,height);
 const begin = floorEdge - falloffPx, bands = falloffPx / step;
 for(let y=begin; y<floorEdge; y+=step) for(let x=step; x<width-step; x+=step){
  const at=(y*width+x)*4;
  if(!image.data[at+3] || Math.max(...image.data.slice(at,at+3))>48)continue;
  const blend=(1+Math.floor((y-begin)/step))/bands, pin=x*4;
  const rgb=[0,1,2].map(channel=>Math.round(image.data[at+channel]*(1-blend)+floor[pin+channel]*blend));
  for(let dy=0;dy<step&&y+dy<height;dy++)for(let dx=0;dx<step;dx++){
   const i=((y+dy)*width+x+dx)*4;
   if(image.data[i+3] && Math.max(...image.data.slice(i,i+3))<=48)image.data.set(rgb,i);
  }
 }
 context.putImageData(image,0,0);
}
