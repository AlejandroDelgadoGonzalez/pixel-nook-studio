// Subtle motion sampled from the supplied painting, in its own world space.
// No weather overlay: this is a sunny village. Motion freezes with the reader.
export class VillageAmbient{
 constructor(scene){
  this.scene=scene;this.streams=[];this.foliage=[];
  const tex=scene.textures.get('village');
  for(const[i,r]of [[35,425,32,130],[70,451,33,126],[98,496,22,96]].entries()){
   tex.add('flow-'+i,0,...r);const flow=scene.add.tileSprite(r[0]+r[2]/2,r[1]+r[3]/2,r[2],r[3],'village','flow-'+i).setDepth(1).setAlpha(.36);this.streams.push(flow);
  }
  for(const[i,r]of [[917,180,66,70],[1240,291,62,51],[363,337,69,55],[889,754,58,69]].entries()){
   tex.add('leaves-'+i,0,...r);this.foliage.push({x:r[0],y:r[1],sprite:scene.add.image(r[0],r[1],'village','leaves-'+i).setOrigin(0).setDepth(1)});
  }
  this.foam=scene.add.graphics().setDepth(2);
  this.glows=[[1067,279],[1042,578]].map(([x,y])=>scene.add.circle(x,y,18,0xffd687,.05).setBlendMode(Phaser.BlendModes.ADD).setDepth(2));
 }
 update(ms){const t=ms/1000;
  this.streams.forEach((s,i)=>{s.tilePositionY=-t*(9+i*2);s.alpha=.32+Math.sin(t*.8+i)*.04;});
  this.foliage.forEach((v,i)=>v.sprite.setPosition(v.x+Math.sin(t*1.1+i*1.8)*.65,v.y+Math.sin(t*.8+i)*.25));
  this.glows.forEach((g,i)=>g.setAlpha(.045+Math.sin(t*.7+i)*.016));
  this.foam.clear();
  for(let i=0;i<11;i++){const x=28+(i*19)%104,y=604+(i*11)%42;this.foam.fillStyle(0xc9f4ec,.10+Math.sin(t*1.25+i)*.05);this.foam.fillEllipse(x+Math.sin(t*.7+i)*2,y+Math.cos(t*.9+i),8+Math.sin(t+i)*2,2);}
  for(let i=0;i<5;i++){this.foam.fillStyle(0xa5e4e8,.07);this.foam.fillEllipse(28+i*24+Math.sin(t*.3+i)*3,685+i*9,15,1);}
 }
}
