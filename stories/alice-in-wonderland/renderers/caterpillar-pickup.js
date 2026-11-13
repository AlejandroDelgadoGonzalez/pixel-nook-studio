// Compatibility preview: intact atlas cells only, matching the live S2 swap.
export class CaterpillarPickup{
 constructor(atlas,g){this.frames=['mouthpiece-low-right','climb-carry-right'].map((name,i)=>{
  const c=g.caterpillar.atlas.find(c=>c.id===name),b=c.sourceBoundsExclusive,o=c.contentBoundsInSourceCell,root=i?g.caterpillar.climbRootSource:g.caterpillar.rootSource;
  const canvas=Object.assign(document.createElement('canvas'),{width:500,height:500}),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
  ctx.drawImage(atlas,b[0],b[1],b[2]-b[0],b[3]-b[1],o[0]-root[0]+200,o[1]-root[1]+425,b[2]-b[0],b[3]-b[1]);return canvas;
 });}
 render(ms){this.output=this.frames[ms<1500?0:1];return this.output;}
}
