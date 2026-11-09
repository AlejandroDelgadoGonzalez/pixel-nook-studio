import {drawCharacter} from '../../../platform/rendering/character-art.js';
const snap=n=>Math.round(n/2)*2,clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const union=boxes=>[Math.min(...boxes.map(b=>b[0])),Math.min(...boxes.map(b=>b[1])),Math.max(...boxes.map(b=>b[2])),Math.max(...boxes.map(b=>b[3]))];

// One approved ground plane and durable chapter clock, shared by reader/export.
export class SolidGround {
 constructor(scene,geometry,cells){
  this.scene=scene;this.geometry=geometry;this.cells=Object.fromEntries(cells.poses.map(p=>[p.pose,p]));this.normalized={...scene.emptyJar.normalized};
  for(const c of cells.poses){const[l,t,r,b]=c.sourceBoundsExclusive,[w,h]=c.normalizedSize,key='alice-solid-'+c.pose,tex=scene.textures.createCanvas(key,w,h);drawCharacter(tex.context,scene.emptyJar.source(c.asset),l,t,r-l,b-t,w,h);tex.refresh();this.normalized[c.pose]={key,width:w,height:h};}
  const src=scene.emptyJar.source(geometry.panorama.asset),[x,y,w,h]=geometry.panorama.worldBounds;
  this.background=scene.add.image(x,y,'alice-riverbank-source-s5-ground').setOrigin(0).setDisplaySize(w,h).setDepth(-1);
  // The approved common plate is also present before S4 lands. No boundary swap.
  // The generated plate's first 2px row is a light crop-edge gutter. Leave
  // the existing continuous shaft rock underneath it instead of importing
  // that horizontal edge into S4. Keep source/destination registration 1:1.
  const [sx,sy,sw,sh]=geometry.panorama.s4IntegrationSourceBounds;
  for(const image of Object.values(scene.emptyJar.backgrounds)){const tex=image.texture;tex.context.drawImage(src,sx,sy,sw,sh,48+sx,974+sy,sw,sh);tex.refresh();}
  const key='alice-s5-root-foreground',tex=scene.textures.createCanvas(key,3344,942),ctx=tex.context,poly=geometry.occluders[0].sourcePolygon;
  const inside=(x,y)=>{let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;};
  ctx.drawImage(src,0,0);const raster=ctx.getImageData(0,0,3344,942);
  for(let y=0;y<942;y+=2)for(let x=0;x<3344;x+=2)if(x<2530||!inside(x+1,y+1))for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++){const j=((y+dy)*3344+x+dx)*4;raster.data.fill(0,j,j+4);}
  ctx.putImageData(raster,0,0);tex.refresh();
  this.corner=scene.add.image(x,y,key).setOrigin(0).setDisplaySize(w,h).setDepth(5000);
  this.people={alice:{actor:scene.add.image(0,0,this.normalized['seated-braced'].key).setOrigin(.5,1),shadow:scene.add.ellipse(0,0,58,12,0x271a10,1)},'white-rabbit':{actor:scene.add.image(0,0,scene.normalized['white-rabbit'].right.key).setOrigin(.5,1),shadow:scene.add.ellipse(0,0,39,8,0x271a10,1)}};
  this.objects={jar:scene.add.image(0,0,this.normalized['jar-upright'].key).setOrigin(.5,1).setScale(.732)};
  // Resolve deferred canvas paints before the export clock starts.
  for(const image of [...Object.values(scene.emptyJar.backgrounds),...scene.emptyJar.leaves.map(l=>l.sprite)])image.texture.getSourceImage().getContext('2d').getImageData(0,0,1,1);
  for(const c of Object.values(this.normalized)){const im=scene.textures.get(c.key).getSourceImage();im.getContext('2d').getImageData(0,0,im.width,im.height);}
  for(const id of ['alice','white-rabbit'])for(const dir of ['front','right','back','left'])for(let i=0;i<8;i++){const im=scene.textures.get(`alice-riverbank-${id}-walk-${dir}-${i}`).getSourceImage();im.getContext('2d').getImageData(0,0,im.width,im.height);}
  this.hide();
 }
 hide(){this.background.setVisible(false);this.corner.setVisible(false);for(const p of Object.values(this.people)){p.actor.setVisible(false);p.shadow.setVisible(false);}this.objects.jar.setVisible(false);}
 progress(){const e=this.scene.reader;return e.step?.type==='action'?clamp(e.elapsed/e.step.duration,0,1):0;}
 sourcePoint(id){const a=this.scene.reader.model.actors[id];return[a.x/2-48,a.y/2-974];}
 scaleAtWorldY(y){const knots=this.geometry.depthScaling.sourceYToScale,sy=y/2-974;for(let i=1;i<knots.length;i++)if(sy<=knots[i][0]){const a=knots[i-1],b=knots[i],q=clamp((sy-a[0])/(b[0]-a[0]),0,1);return a[1]+(b[1]-a[1])*q;}return knots.at(-1)[1];}
 pose(id){const e=this.scene.reader,m=e.model;
  if(id==='white-rabbit')return m.actors[id].pose==='walk'?m.actors[id].facing:'right';
  if(e.step?.id==='alice-c1-s5-rise'){const p=this.progress();return p<.2?'seated-braced':p<.48?'rise-supported':p<.76?'rise-halfway':'standing-steady';}
  if(e.step?.id==='alice-c1-s5-hook-relax')return this.progress()<.45?'brush-palms':'standing-steady';
  return m.actors.alice.pose==='walk'?m.actors.alice.facing:m.staging.alice;
 }
 size(id,pose=this.pose(id)){return id==='alice'?(this.normalized[pose]||this.scene.normalized.alice[pose]||this.normalized['standing-steady']):this.scene.normalized[id][pose];}
 body(id,point=null,pose=null){const a=this.scene.reader.model.actors[id],[x,y]=point||[a.x,a.y],z=this.scaleAtWorldY(y),sz=this.size(id,pose||this.pose(id));return[snap(x)-sz.width*z/2,snap(y)-sz.height*z,snap(x)+sz.width*z/2,snap(y)];}
 landingFrame(){const e=this.scene.reader,m=e.model,a=m.actors.alice,old={x:a.x,y:a.y,pose:m.staging.alice};try{Object.assign(a,{x:2160,y:3328});m.staging.alice='seated-braced';return this.scene.emptyJar.frame('landing');}finally{a.x=old.x;a.y=old.y;m.staging.alice=old.pose;}}
 lockedZoom(){return this.scene.emptyJar.lockedZoom();}
 lineSolo(){const s=this.scene,z=this.lockedZoom(),a=this.body('alice',this.geometry.anchors['A5-observe'].point,'standing-steady'),r=this.body('white-rabbit',this.geometry.anchors['R1-visible-line'].point,'right'),u=union([a,r]);return(u[3]-u[1])*z>Math.min(s.scale.height-12,(s.readingHeight||s.scale.height)-12)-(Math.max(46,s.safeTopInset||0)+12);}
 frameFor(kind){const s=this.scene,w=s.scale.width,h=s.scale.height,z=this.lockedZoom(),[ax,ay,aw,ah]=this.geometry.panorama.worldBounds,sw=s.safeWidth||w,sl=w/2-(s.safeCenterOffset||0)-sw/2+12,sr=sl+sw-24,baseTop=Math.max(46,s.safeTopInset||0)+12,caption=['line','close'].includes(kind),sb=caption?Math.min(h-12,(s.readingHeight||h)-12):h-12;
  const solo=kind==='line'&&this.lineSolo();let boxes=kind==='rabbit'||solo?[this.body('white-rabbit')]:[this.body('alice')];
  if(kind==='arrival')boxes.push(this.body('white-rabbit',this.geometry.anchors['R0-side-passage'].point,'right'),this.body('white-rabbit',this.geometry.anchors['R1-visible-line'].point,'right'));
  if(kind==='line'&&!solo)boxes.push(this.body('white-rabbit',this.geometry.anchors['R1-visible-line'].point,'right'));
  const[l,t,r,b]=union(boxes),st=baseTop,lx=Math.max(ax+(w/2+1)/z,r+(w/2-sr)/z),rx=Math.min(ax+aw-(w/2+1)/z,l+(w/2-sl)/z),ty=Math.max(ay+(h/2+1)/z,b+(h/2-sb)/z),by=Math.min(ay+ah-(h/2+1)/z,t+(h/2-st)/z);
  const desiredX=solo?this.body('alice',this.geometry.anchors['A5-observe'].point,'standing-steady')[2]+2+w/(2*z):(l+r)/2+(s.safeCenterOffset||0)/z;
  return{x:clamp(desiredX,solo?Math.max(ax+(w/2+1)/z,r+(w/2-(w-8))/z):lx,solo?Math.min(ax+aw-(w/2+1)/z,l+(w/2-8)/z):rx),y:clamp((t+b)/2+(h/2-(st+sb)/2)/z,ty,by),z,fits:lx<=rx&&ty<=by};
 }
 fixedFrame(kind){const m=this.scene.reader.model,a=m.actors.alice,r=m.actors['white-rabbit'],save=[a.x,a.y,r.x,r.y];try{[a.x,a.y]=this.geometry.anchors['A5-observe'].point;[r.x,r.y]=this.geometry.anchors[kind==='rabbit'?'R5-behind-corner':'R1-visible-line'].point;return this.frameFor(kind);}finally{[a.x,a.y,r.x,r.y]=save;}}
 frame(){const e=this.scene.reader,id=e.step?.id,q=this.progress(),mix=(a,b,p)=>this.scene.tunnel.mix(a,b,p);
  if(id==='alice-c1-hall-corridor')return mix(this.fixedFrame('close'),this.frameFor('alice'),Math.min(1,q/.2));
  if(['alice-c1-s5-open','alice-c1-s5-rise','alice-c1-s5-brush','alice-c1-s5-safe'].includes(id))return this.landingFrame();
  if(id==='alice-c1-s5-walk')return mix(this.landingFrame(),this.frameFor('alice'),Math.min(1,q/.2));
  if(id==='alice-c1-s5-establish')return mix(this.fixedFrame('alice'),this.fixedFrame('arrival'),q);
  if(['alice-c1-s5-arrival','alice-c1-s5-arrival-visible'].includes(id))return this.fixedFrame('arrival');
  if(id==='alice-c1-s5-frame-line')return mix(this.fixedFrame('arrival'),this.fixedFrame('line'),q);
  if(id==='alice-c1-s5-rabbit')return this.fixedFrame('line');
  if(id==='alice-c1-s5-exit')return mix(this.fixedFrame('line'),this.frameFor('rabbit'),Math.min(1,q/.25));
  if(id==='alice-c1-s5-return')return mix(this.fixedFrame('rabbit'),this.fixedFrame('close'),q);
  return this.fixedFrame('close');
 }
 draw(){const s=this.scene,e=s.reader,m=e.model;s.people=this.people;s.objects=this.objects;s.background=s.emptyJar.backgrounds['empty-upper'];s.background.setVisible(true);s.sides=[this.background];this.background.setVisible(true);this.corner.setVisible(true);
  for(const[id,p]of Object.entries(this.people)){const a=m.actors[id],pose=this.pose(id),sz=this.size(id,pose),z=this.scaleAtWorldY(a.y),walk=a.pose==='walk',key=walk?`alice-riverbank-${id}-walk-${a.facing}-${Math.floor(e.elapsed/(e.step?.motion?.actors?.[id]?.mode==='run'?80:130))%8}`:sz.key;
   p.actor.setVisible(a.visible>0).setTexture(s.textures.exists(key)?key:sz.key).setOrigin(.5,1).setPosition(snap(a.x),snap(a.y)).setScale(z).setAlpha(a.visible).setDepth(4000);
   // Preserve the shadow-free seated S4 contact, then ground the new walk.
   const ground=!['alice-c1-s5-open','alice-c1-s5-rise'].includes(e.step?.id);p.shadow.setVisible(ground&&a.visible>0).setPosition(snap(a.x),snap(a.y)-2*z).setScale(z).setAlpha(a.visible*.12).setDepth(3999);
  }
  for(const leaf of s.emptyJar.leaves)leaf.sprite.setVisible(true).setPosition(leaf.point[0]+snap(leaf.shiftSource[0]*2),leaf.point[1]+snap(leaf.shiftSource[1]*2));
  this.objects.jar.setVisible(true).setPosition(...this.geometry.heldProps.jar.worldBase).setDepth(4001);
  const f=this.frame();f.z=this.lockedZoom();s.framing=f;s.activeShot=m.s5.shot;s.cameraReframing=e.step?.type==='action'&&!['alice-c1-s5-open','alice-c1-s5-rise','alice-c1-s5-brush'].includes(e.step.id);s.cameraTracking={id:e.step?.camera?.tracking,departingStationaryActors:['alice']};s.environmentCameraIssue=f.fits?null:{view:m.s5.shot};
  const w=s.scale.width,h=s.scale.height;s.viewport={x:0,y:0,width:w,height:h};s.cameraSourceRect=[f.x-w/(2*f.z),f.y-h/(2*f.z),w/f.z,h/f.z];s.cameras.main.setViewport(0,0,w,h).setZoom(f.z).centerOn(f.x,f.y);
 }
 diagnostics(){const s=this.scene,e=s.reader,m=e.model,f=s.framing,project=(x,y)=>({x:(x-f.x)*f.z+s.scale.width/2,y:(y-f.y)*f.z+s.scale.height/2}),actors={};
  for(const[id,p]of Object.entries(this.people)){const b=this.body(id),a=m.actors[id];actors[id]={...project(p.actor.x,p.actor.y),head:project(p.actor.x,b[1]),world:{x:p.actor.x,y:p.actor.y},visible:a.visible,pose:this.pose(id),scale:this.scaleAtWorldY(a.y),bounds:{left:project(b[0],b[1]).x,top:project(b[0],b[1]).y,right:project(b[2],b[3]).x,bottom:project(b[2],b[3]).y}};}
  const follow=e.step?.id==='alice-c1-s5-exit',required=e.step?.id==='alice-c1-s5-return'?[]:e.step?.id==='alice-c1-s5-frame-line'&&this.lineSolo()?['white-rabbit']:follow?['white-rabbit']:e.step?.id==='alice-c1-s5-rabbit'?(this.lineSolo()?['white-rabbit']:['alice','white-rabbit']):['alice'],[x,y,w,h]=s.cameraSourceRect,knots=this.geometry.depthScaling.sourceYToScale.map(([y,z])=>[(y+974)*2,z]);
  return{width:s.scale.width,height:s.scale.height,environment:'solid-ground',shot:m.s5.shot,requiredActors:required,requiredProps:[],actors,props:{jar:{owner:null,visible:1,state:'lower-fixed',world:{x:2228,y:2288}}},depthScaling:{curve:{knots,minScale:knots[0][1],maxScale:knots.at(-1)[1]},actorReferenceY:{alice:3328,'white-rabbit':2828},actorGain:{alice:.732,'white-rabbit':.525}},cameraCoverage:{worldView:{left:x,right:x+w,top:y,bottom:y+h},artwork:this.geometry.panorama.worldBounds},cameraReframing:s.cameraReframing,cameraTracking:s.cameraTracking,viewport:s.viewport,ambientTime:s.phase,landmarks:[],offstage:{sister:{environment:'riverbank',point:[m.actors.sister.x,m.actors.sister.y],pose:'seated-reading',bookOwner:m.book.owner}}};
 }
}
