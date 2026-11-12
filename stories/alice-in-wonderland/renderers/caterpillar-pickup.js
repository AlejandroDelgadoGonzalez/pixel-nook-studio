// Reuse the native poses; interpolate measured parts on the two-world-pixel grid.
// No new raster asset, opacity fade, duplicate vessel or displaced body root.
const blend=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const ease=t=>t*t*(3-2*t);
function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function distanceField(p){
 const inside=new Float32Array(250000),outside=new Float32Array(250000),nearest=new Int32Array(250000);
 for(let i=0;i<250000;i++){const solid=p[i*4+3]>0;inside[i]=solid?10000:0;outside[i]=solid?0:10000;nearest[i]=solid?i:-1;}
 function pass(reverse){const first=reverse?499:0,last=reverse?-1:500,dir=reverse?-1:1,neighbors=[[-dir,0,1],[0,-dir,1],[-dir,-dir,Math.SQRT2],[dir,-dir,Math.SQRT2]];
  for(let y=first;y!==last;y+=dir)for(let x=first;x!==last;x+=dir){const i=y*500+x;
   for(const[dx,dy,cost]of neighbors){
    const X=x+dx,Y=y+dy;if(X<0||X>=500||Y<0||Y>=500)continue;const j=Y*500+X;
    inside[i]=Math.min(inside[i],inside[j]+cost);
    if(outside[j]+cost<outside[i]){outside[i]=outside[j]+cost;nearest[i]=nearest[j];}
   }
  }
 }pass(false);pass(true);
 return{signed:inside.map((d,i)=>p[i*4+3]?d:-outside[i]),nearest};
}
function affine(src,dst){
 const [[x0,y0],[x1,y1],[x2,y2]]=src,[[u0,v0],[u1,v1],[u2,v2]]=dst;
 const det=(x1-x0)*(y2-y0)-(x2-x0)*(y1-y0);if(Math.abs(det)<1e-7)return null;
 const a=((u1-u0)*(y2-y0)-(u2-u0)*(y1-y0))/det,c=((x1-x0)*(u2-u0)-(x2-x0)*(u1-u0))/det;
 const b=((v1-v0)*(y2-y0)-(v2-v0)*(y1-y0))/det,d=((x1-x0)*(v2-v0)-(x2-x0)*(v1-v0))/det;
 return[a,b,c,d,u0-a*x0-c*y0,v0-b*x0-d*y0];
}
export class CaterpillarPickup{
 constructor(atlas,g,mesh){
  this.g=g;this.mesh=mesh;this.a=this.source(atlas,mesh.poseA,g.caterpillar.rootSource);this.b=this.source(atlas,mesh.poseB,g.caterpillar.climbRootSource);
  this.pixels=[this.a,this.b].map(c=>c.getContext('2d').getImageData(0,0,500,500).data);
  this.fields=this.pixels.map(distanceField);this.palette=g.caterpillar.atlas.find(c=>c.id===mesh.poseB).nativePixelContract.paletteRGB;
  const keys=new Map(this.palette.map((c,i)=>[(c[0]<<16)|(c[1]<<8)|c[2],i]));
  this.colorIndices=this.fields.map((field,k)=>Uint8Array.from(field.nearest,j=>{const p=this.pixels[k],i=j*4;return keys.get((p[i]<<16)|(p[i+1]<<8)|p[i+2])??0;}));
  this.output=canvas(500,500);this.last=-1;
 }
 source(atlas,name,root){const c=this.g.caterpillar.atlas.find(c=>c.id===name),b=c.sourceBoundsExclusive,o=c.contentBoundsInSourceCell;
  const out=canvas(500,500),ctx=out.getContext('2d');ctx.imageSmoothingEnabled=false;
  ctx.drawImage(atlas,b[0],b[1],b[2]-b[0],b[3]-b[1],(o[0]-root[0])+200,(o[1]-root[1])+425,b[2]-b[0],b[3]-b[1]);return out;
 }
 render(ms){
  const stamp=Math.round(Math.max(0,Math.min(3000,ms))/25);if(stamp===this.last)return this.output;this.last=stamp;
  const m=this.mesh,reach=ms<1000,u=ease(Math.max(0,Math.min(1,reach?ms/1000:(ms-1000)/2000)));
  const dst=m.start.map((_,i)=>blend(reach?m.start[i]:m.grasp[i],reach?m.grasp[i]:m.end[i],u));
  const ctx=this.output.getContext('2d'),out=ctx.createImageData(500,500);
  // Interpolate the aligned part contours, then select exact native palette colors.
  // Signed distances avoid dissolves, speckled dithering and doubled silhouettes.
  const amount=reach?u:1;
  const count=this.palette.length,colors=new Uint8Array(count*count*3);
  for(let a=0;a<count;a++)for(let b=0;b<count;b++){
   const A=this.palette[a],B=this.palette[b],r=A[0]*(1-amount)+B[0]*amount,g=A[1]*(1-amount)+B[1]*amount,blue=A[2]*(1-amount)+B[2]*amount;
   let color=this.palette[0],best=Infinity;
   for(const c of this.palette){const d=(r-c[0])**2+(g-c[1])**2+(blue-c[2])**2;if(d<best){best=d;color=c;}}
   const i=(a*count+b)*3;colors[i]=color[0];colors[i+1]=color[1];colors[i+2]=color[2];
  }
  for(const tri of m.triangles){
   const to=tri.map(i=>[(dst[i][0]+40)*5,(dst[i][1]+85)*5]),unit=affine(to,[[0,0],[1,0],[0,1]]);
   const maps=[m.start,m.end].map(src=>affine(to,tri.map(i=>[(src[i][0]+40)*5,(src[i][1]+85)*5])));
   if(!unit||!maps[0]||!maps[1])continue;
   const minX=Math.max(0,Math.floor(Math.min(...to.map(p=>p[0])))),maxX=Math.min(499,Math.ceil(Math.max(...to.map(p=>p[0]))));
   const minY=Math.max(0,Math.floor(Math.min(...to.map(p=>p[1])))),maxY=Math.min(499,Math.ceil(Math.max(...to.map(p=>p[1]))));
   for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
    const px=x+.5,py=y+.5,u=unit[0]*px+unit[2]*py+unit[4],v=unit[1]*px+unit[3]*py+unit[5];if(u<-.00001||v<-.00001||u+v>1.00001)continue;
    const fa=maps[0],fb=maps[1],ax=Math.max(0,Math.min(499,Math.floor(fa[0]*px+fa[2]*py+fa[4]+1e-7))),ay=Math.max(0,Math.min(499,Math.floor(fa[1]*px+fa[3]*py+fa[5]+1e-7))),bx=Math.max(0,Math.min(499,Math.floor(fb[0]*px+fb[2]*py+fb[4]+1e-7))),by=Math.max(0,Math.min(499,Math.floor(fb[1]*px+fb[3]*py+fb[5]+1e-7))),ia=ay*500+ax,ib=by*500+bx;
    const sd=this.fields[0].signed[ia]*(1-amount)+this.fields[1].signed[ib]*amount;if(sd<0)continue;
    const i=(y*500+x)*4,j=(this.colorIndices[0][ia]*count+this.colorIndices[1][ib])*3;
    out.data[i]=sd<4?33:colors[j];out.data[i+1]=sd<4?26:colors[j+1];out.data[i+2]=sd<4?44:colors[j+2];out.data[i+3]=255;
   }
  }
  ctx.putImageData(out,0,0);return this.output;
 }
}
