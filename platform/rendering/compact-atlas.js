const caches=new WeakMap();
export function bindCompactAtlas(source,metadata){if(metadata?.storageEncoding==='lossless-axis-runs-v1')source.pixelNookAtlas=metadata;}
// Decode a requested native crop once; authored RGBA and pixel-center sampling stay exact.
export function nativeAtlasFrame(source,box){
 const metadata=source.pixelNookAtlas;if(!metadata)return {source,box};
 let cache=caches.get(source);if(!cache){cache=new Map();caches.set(source,cache);}
 const key=box.join(',');if(cache.has(key))return cache.get(key);
 const pose=metadata.poses.find(p=>p.sourceBoundsExclusive.every((v,i)=>v===box[i]));if(!pose)throw Error('Unregistered compact atlas crop: '+key);
 const info=pose.nativeFrame,[l,t,r,b]=box,small=document.createElement('canvas');small.width=r-l;small.height=b-t;const g=small.getContext('2d',{willReadFrequently:true});g.drawImage(source,l,t,r-l,b-t,0,0,r-l,b-t);const pixels=g.getImageData(0,0,r-l,b-t).data;
 const canvas=document.createElement('canvas');[canvas.width,canvas.height]=info.size;const ctx=canvas.getContext('2d'),image=ctx.createImageData(canvas.width,canvas.height),data=image.data;
 let y=0;for(let j=0;j<info.yRuns.length;j++){const row=new Uint8ClampedArray(canvas.width*4);let x=0;for(let i=0;i<info.xRuns.length;i++){const k=(j*small.width+i)*4;for(let n=0;n<info.xRuns[i];n++){row.set(pixels.subarray(k,k+4),x*4);x++;}}for(let n=0;n<info.yRuns[j];n++)data.set(row,y++*canvas.width*4);}
 ctx.putImageData(image,0,0);const result={source:canvas,box:[0,0,canvas.width,canvas.height]};cache.set(key,result);return result;
}

const packedPixels=new WeakMap();
export function compactGrid(source,box,width,height){
 const meta=source.pixelNookAtlas;if(!meta)return null;
 let data=packedPixels.get(source);if(!data){const c=document.createElement('canvas');c.width=source.width;c.height=source.height;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(source,0,0);data=g.getImageData(0,0,c.width,c.height).data;packedPixels.set(source,data);}
 const pose=meta.poses.find(p=>p.sourceBoundsExclusive.every((v,i)=>v===box[i]));if(!pose)throw Error('Unregistered packed crop');const info=pose.nativeFrame;
 const lookup=(runs,count,nativeSize,start,vertical=false)=>{
  // Ask the same Canvas NN transform for its source indices, including tie rules.
  const labels=document.createElement('canvas');labels.width=vertical?1:start+nativeSize;labels.height=vertical?start+nativeSize:1;const g=labels.getContext('2d',{willReadFrequently:true}),indices=g.createImageData(labels.width,labels.height);for(let i=0;i<start+nativeSize;i++){indices.data[i*4]=i&255;indices.data[i*4+1]=i>>8;indices.data[i*4+3]=255;}g.putImageData(indices,0,0);
  const target=document.createElement('canvas');target.width=vertical?1:count;target.height=vertical?count:1;const ctx=target.getContext('2d',{willReadFrequently:true});ctx.imageSmoothingEnabled=false;if(vertical)ctx.drawImage(labels,0,start,1,nativeSize,0,0,1,count);else ctx.drawImage(labels,start,0,nativeSize,1,0,0,count,1);const pixels=ctx.getImageData(0,0,target.width,target.height).data;
  const result=[];let i=0,end=runs[0];for(let j=0;j<count;j++){const pixel=pixels[j*4]+pixels[j*4+1]*256-start;while(pixel>=end)end+=runs[++i];result.push(i);}return result;
 };
 pose.pixelNookLookups??=new Map();const key=width+','+height;let maps=pose.pixelNookLookups.get(key);if(!maps){maps=[lookup(info.xRuns,width,info.size[0],info.sourceBoundsExclusive[0]),lookup(info.yRuns,height,info.size[1],info.sourceBoundsExclusive[1],true)];pose.pixelNookLookups.set(key,maps);}const [xs,ys]=maps,image=new ImageData(width,height);
 const input=new Uint32Array(data.buffer,data.byteOffset,data.length/4),output=new Uint32Array(image.data.buffer);for(let y=0;y<height;y++)for(let x=0;x<width;x++)output[y*width+x]=input[(ys[y]+box[1])*source.width+xs[x]+box[0]];return image;
}
