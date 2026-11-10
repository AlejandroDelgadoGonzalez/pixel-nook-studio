import {hallRoomFrame} from './hall-room-frame.js';
import {drawCharacter,createPixelWalkFrames} from '../../../platform/rendering/character-art.js';
const snap=n=>Math.round(n/2)*2,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

// Approved Hall measurements, one durable reader/export clock and one zoom.
export class HallOfDoors {
 constructor(scene,g,cells){
  this.scene=scene;this.geometry=g;this.cells=Object.fromEntries(cells.poses.map(c=>[c.pose,c]));this.normalized={};
  for(const c of cells.poses){const[l,t,r,b]=c.sourceBoundsExclusive,[w,h]=c.normalizedSize,key='alice-hall-'+c.pose,tex=scene.textures.createCanvas(key,w,h);drawCharacter(tex.context,scene.emptyJar.source(c.asset),l,t,r-l,b-t,w,h);tex.refresh();this.normalized[c.pose]={key,width:w,height:h};}
  for(const [dir,pose] of [['right','carry-key'],['front','walk-front'],['back','walk-back']]){scene.textures.addCanvas('alice-hall-carry-'+dir,scene.textures.get(this.normalized[pose].key).getSourceImage());createPixelWalkFrames(scene,'alice-hall','carry',dir);}
  this.background=scene.add.image(0,0,'alice-riverbank-source-hall-background').setOrigin(0).setScale(2).setDepth(0);
  this.tableGroundY=g.supportPlanes.table.groundYWorld;
  this.tablePropDepth=this.tableGroundY+1; // Stable local order above furniture, below foreground feet.
  const [fl,ft,fr,fb]=g.supportPlanes.table.sourceBoundsExclusive,foreground=scene.textures.createCanvas('alice-hall-table-foreground',fr-fl,fb-ft),tableSource=scene.emptyJar.source(g.hall.panorama);
  for(const[y,x0,x1]of g.supportPlanes.table.sourceOpaqueRunsYX0X1)foreground.context.drawImage(tableSource,x0,y,x1-x0,1,x0-fl,y-ft,x1-x0,1);foreground.refresh();
  this.tableForeground=scene.add.image(fl*2,ft*2,'alice-hall-table-foreground').setOrigin(0).setScale(2).setDepth(this.tableGroundY);
  this.people={alice:{actor:scene.add.image(0,0,this.normalized['carry-key'].key),shadow:scene.add.ellipse(0,0,54,10,0x291909)}};
  this.objects={key:scene.add.image(0,0,this.normalized['golden-key'].key),bottle:scene.add.image(0,0,this.normalized['bottle-upright'].key).setOrigin(.5,1)};
  const boxCell=scene.cache.json.get('alice-riverbank-drink-cells').poses.find(p=>p.pose==='box-closed'),[bl,bt,br,bb]=boxCell.sourceBoundsExclusive,[bw,bh]=boxCell.normalizedSize,boxTexture=scene.textures.createCanvas('alice-hall-box-closed',bw,bh);
  drawCharacter(boxTexture.context,scene.emptyJar.source(boxCell.asset),bl,bt,br-bl,bb-bt,bw,bh);boxTexture.refresh();this.objects.box=scene.add.image(0,0,'alice-hall-box-closed').setOrigin(.5,1);
  this.curtains={};for(const state of ['closed','open'])this.curtains[state]=scene.add.image(0,0,this.normalized['curtain-'+state].key).setOrigin(0).setDepth(5);
  this.doors={};const poly=g.surfaces.tinyOpeningSourcePolygon,inside=(x,y)=>{let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;};
  // Palette-grade only the existing garden pixels inside the measured opening.
  // Preserve all authored detail and alpha; no geometric opening overlay.
  const nightKey='alice-hall-lunar-garden',night=scene.textures.createCanvas(nightKey,1664,936),nc=night.context;
  nc.drawImage(scene.textures.get('alice-riverbank-source-hall-background').getSourceImage(),0,0);
  const image=nc.getImageData(0,0,1664,936);
  for(let y=0;y<936;y++)for(let x=0;x<1664;x++)if(inside(x,y)){const k=(y*1664+x)*4,v=(image.data[k]+image.data[k+1]+image.data[k+2])/3;image.data[k]=Math.round(v*.14);image.data[k+1]=Math.round(v*.28);image.data[k+2]=Math.round(v*.52);}
  nc.putImageData(image,0,0);night.refresh();this.background.setTexture(nightKey);
  // Nine authored-state hinge views through a hard2x2 aperture. Only the leaf
  // changes: the panorama's stone jambs and roof are never replaced.
  const left=Math.floor(Math.min(...poly.map(p=>p[0]))/2)*2,top=Math.floor(Math.min(...poly.map(p=>p[1]))/2)*2,right=Math.ceil(Math.max(...poly.map(p=>p[0]))/2)*2,bottom=Math.ceil(Math.max(...poly.map(p=>p[1]))/2)*2;
  for(let frame=0;frame<=8;frame++){const q=frame/8,state=frame===8?'open':'closed',c=this.cells['tiny-door-'+state],sz=this.normalized[c.pose],v=g.props.tinyDoor[state+'Leaf'],key='alice-hall-door-'+frame,tex=scene.textures.createCanvas(key,right-left,bottom-top),ctx=tex.context,factor=frame===8?1:1-q*.5;ctx.imageSmoothingEnabled=false;ctx.drawImage(scene.textures.get(sz.key).getSourceImage(),v.sourceLeft-left,v.sourceBaseY-top-sz.height*v.scale/2,sz.width*v.scale/2*factor,sz.height*v.scale/2);const pix=ctx.getImageData(0,0,right-left,bottom-top);for(let y=0;y<bottom-top;y+=2)for(let x=0;x<right-left;x+=2)if(!inside(left+x+1,top+y+1))for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++){const i=((y+dy)*(right-left)+x+dx)*4;pix.data.fill(0,i,i+4);}ctx.putImageData(pix,0,0);tex.refresh();this.doors[frame]=scene.add.image(left*2,top*2,key).setOrigin(0).setScale(2).setDepth(3);}
  this.hide();
 }
 hide(){for(const p of [this.background,this.tableForeground,...Object.values(this.curtains),...Object.values(this.doors),...Object.values(this.objects),this.people.alice.actor,this.people.alice.shadow])p.setVisible(false);}
 scaleAt(y){const k=this.geometry.depthScaling.sourceYToScale,sy=y/2;for(let i=1;i<k.length;i++)if(sy<=k[i][0])return k[i-1][1]+(k[i][1]-k[i-1][1])*clamp((sy-k[i-1][0])/(k[i][0]-k[i-1][0]),0,1);return k.at(-1)[1];}
 pose(){const e=this.scene.reader,h=e.model.hall;if(e.step?.id==='alice-c1-hall-kneel')return e.elapsed/e.step.duration<.5?'rise-halfway':'kneel-peek';if(e.step?.id==='alice-c1-hall-rise')return e.elapsed/e.step.duration<.6?'rise-halfway':'carry-key';return h.pose;}
 actorInfo(){const s=this.scene,e=s.reader,a=e.model.actors.alice,z=this.scaleAt(a.y),walking=a.pose==='walk'&&e.step?.id!=='alice-c1-hall-kneel',held=e.model.hall.key.owner==='alice',dir=a.facing||'right',c=this.cells[walking&&held?(['front','back'].includes(dir)?'walk-'+dir:'carry-key'):this.pose()];let size=this.normalized[c.pose],origin=c.origin||[.5,1],flip=walking?held&&a.facing==='left':(c.facing==='right'&&dir==='left'||c.facing==='left'&&dir==='right'),key=size.key;
  if(walking&&!held){const dir=a.facing||'right';size=s.normalized.alice[dir];key=`alice-riverbank-alice-walk-${dir}-${Math.floor(e.elapsed/130)%8}`;origin=[.5,1];}
  if(walking&&held){key=`alice-hall-carry-walk-${['front','back'].includes(dir)?dir:'right'}-${Math.floor(e.elapsed/130)%8}`;size={width:c.normalizedSize[0]+12,height:c.normalizedSize[1]};origin=[(c.groundAnchorNormalized[0]+6)/size.width,1];}
  if(flip)origin=[1-origin[0],origin[1]];
  return{c,size,key,origin,flip,z,walking,x:snap(a.x),y:snap(a.y),alpha:a.visible};
 }
 prop(info=this.actorInfo()){const h=this.scene.reader.model.hall,g=this.geometry,held=h.key.owner==='alice',c=info.c;let point=g.props.key.restGripSource.map(v=>v*2),z=g.props.key.restScale;
  if(held){const dx=c.handAnchorNormalized[0]-c.groundAnchorNormalized[0],dy=c.handAnchorNormalized[1]-c.groundAnchorNormalized[1];point=[info.x+dx*info.z*(info.flip?-1:1),info.y+dy*info.z];z=info.z;}
  const origin=g.props.key.ringGripNormalized.map((v,i)=>v/this.cells['golden-key'].normalizedSize[i]);if(held&&info.flip)origin[0]=1-origin[0];return{owner:h.key.owner,point,z,flip:held&&info.flip,origin};
 }
 frame(){const s=this.scene,e=s.reader;if(e.step?.id==='alice-c1-hall-room-frame'){const saved=e.model.hall.roomLock;e.model.hall.roomLock=0;const from=this.actorFrame();e.model.hall.roomLock=saved;const to=hallRoomFrame(s),p=Math.min(1,e.elapsed/e.step.duration),q=p*p*(3-2*p);return{x:from.x+(to.x-from.x)*q,y:from.y+(to.y-from.y)*q,z:from.z+(to.z-from.z)*q,fits:from.fits&&to.fits};}if(e.model.hall.roomLock>0)return hallRoomFrame(s);return this.actorFrame();}
 actorFrame(){const s=this.scene,info=this.actorInfo(),plan=s.emptyJar.zoomPlan(),z=plan.z,w=s.scale.width,h=s.scale.height,sl=plan.sl,sr=plan.sr,st=plan.st-4; // Keep 8 px above the body inside the reserved toolbar band.
  // Fixed conservative full-body envelope prevents pose/caption-driven reframes.
  const l=info.x-100*info.z,r=info.x+94*info.z,t=info.y-180*info.z,b=info.y,sb=s.reader.step?.type!=='text'?Math.min(h-12,Math.max(plan.sb,st+(b-t)*z+1)):Math.min(h-12,(s.readingHeight||h)-12);
  const lx=Math.max((w/2+1)/z,r+(w/2-sr)/z),rx=Math.min(3328-(w/2+1)/z,l+(w/2-sl)/z),ty=Math.max((h/2+1)/z,b+(h/2-sb)/z),by=Math.min(1872-(h/2+1)/z,t+(h/2-st)/z);
  return{x:clamp(info.x+(s.safeCenterOffset||0)/z,lx,rx),y:clamp((t+b)/2+(h/2-(st+sb)/2)/z,ty,by),z,fits:lx<=rx&&ty<=by};
 }
 draw(options={}){const s=this.scene,e=s.reader,h=e.model.hall,i=options.actorInfo||this.actorInfo(),p=this.prop(i);s.people=this.people;s.objects=this.objects;s.background=this.background;s.sides=[];this.background.setVisible(true);
  const c=h.curtain;for(const [state,sprite] of Object.entries(this.curtains)){const v=this.geometry.props.curtain[state];sprite.setVisible(true).setPosition(v.topLeftSource[0]*2,v.topLeftSource[1]*2).setScale(v.staticScale*(state==='closed'?1-c*.8:1),v.staticScale).setX(v.topLeftSource[0]*2-(state==='closed'?c*40:0)).setAlpha(state==='open'?c:1-c);}
  for(const[frame,sprite]of Object.entries(this.doors))sprite.setVisible(Number(frame)===Math.round(h.door*8)).setAlpha(1);
  const actor=this.people.alice.actor;actor.setVisible(i.alpha>0).setTexture(i.key).setOrigin(...i.origin).setPosition(i.x,i.y).setScale(i.z).setFlipX(i.flip).setAlpha(i.alpha).setDepth(i.y);
  this.people.alice.shadow.setVisible(i.alpha>0).setPosition(i.x,i.y-2*i.z).setScale(i.z).setAlpha(.12*i.alpha).setDepth(i.y-.2);
  this.tableForeground.setVisible(true).setDepth(this.tableGroundY);
  if(actor.depth===this.tableGroundY)s.children.moveAbove(actor,this.tableForeground); // Resolve equal support depth deterministically after reconstruction.
  this.objects.key.setVisible(true).setTexture(this.normalized['golden-key'].key).setOrigin(...p.origin).setPosition(...p.point).setScale(p.z).setAlpha(p.owner==='alice'?i.alpha:1).setDepth(p.owner==='alice'?i.y+.2:this.tablePropDepth).setFlipX(p.flip).setRotation(p.owner==='alice'&&e.step?.id==='alice-c1-hall-hook-lower'?-.2*Math.sin(Math.PI*Math.min(1,e.elapsed/e.step.duration)):p.owner==='alice'&&i.walking&&['front','back'].includes(e.model.actors.alice.facing)?Math.PI/2:0);
  const bottle=this.geometry.props.bottle;this.objects.bottle.setVisible(true).setTexture(this.normalized['bottle-upright'].key).setOrigin(.5,1).setFlipX(false).setRotation(0).setPosition(...bottle.baseSource.map(v=>v*2)).setScale(bottle.scale).setDepth(this.tablePropDepth);
  const box=this.geometry.props.box;this.objects.box.setVisible(true).setTexture('alice-hall-box-closed').setOrigin(.5,1).setPosition(...box.baseSource.map(v=>v*2)).setScale(box.scale).setDepth(box.groundYSource*2).setAlpha(1);
  const f=options.frame||this.frame();s.framing=f;s.activeShot=h.shot;s.cameraReframing=e.step?.type==='action';s.cameraTracking={id:'hall-measured-walk',departingStationaryActors:[]};s.environmentCameraIssue=f.fits?null:{view:h.shot};const w=s.scale.width,height=s.scale.height;s.viewport={x:0,y:0,width:w,height};s.cameraSourceRect=[f.x-w/(2*f.z),f.y-height/(2*f.z),w/f.z,height/f.z];s.cameras.main.setViewport(0,0,w,height).setZoom(f.z).centerOn(f.x,f.y);
 }
 diagnostics(options={}){const s=this.scene,e=s.reader,i=options.actorInfo||this.actorInfo(),a=this.people.alice.actor,b=a.getBounds(),f=s.framing,proj=(x,y)=>({x:(x-f.x)*f.z+s.scale.width/2,y:(y-f.y)*f.z+s.scale.height/2}),l=proj(b.left,b.top),r=proj(b.right,b.bottom),p=this.prop(i),k=this.geometry.depthScaling.sourceYToScale.map(([y,z])=>[y*2,z]),[x,y,w,h]=s.cameraSourceRect;
  return{width:s.scale.width,height:s.scale.height,environment:'hall-of-doors',shot:e.model.hall.shot,requiredActors:i.alpha>.1?['alice']:[],requiredProps:p.owner==='alice'?['key']:[],actors:{alice:{...proj(i.x,i.y),head:proj(i.x,b.top),world:{x:i.x,y:i.y},visible:i.alpha,pose:this.pose(),scale:i.z,bounds:{left:l.x,top:l.y,right:r.x,bottom:r.y}}},props:{key:{...proj(...p.point),owner:p.owner,visible:1,world:{x:p.point[0],y:p.point[1]},state:p.owner?'held':'table'},bottle:{owner:null,visible:1,world:{x:this.objects.bottle.x,y:this.objects.bottle.y}}},depthScaling:{curve:{knots:k,minScale:k[0][1],maxScale:k.at(-1)[1]},actorReferenceY:{alice:852},actorGain:{alice:.5267},anchorByActor:i.origin[0]!==.5?{alice:{sourceBoundsExclusive:[0,0,i.size.width,i.size.height],sourceAnchor:[i.size.width*i.origin[0],i.size.height*i.origin[1]],origin:i.origin}}:{}},cameraCoverage:{worldView:{left:x,right:x+w,top:y,bottom:y+h},artwork:[0,0,3328,1872]},cameraReframing:s.cameraReframing,cameraTracking:s.cameraTracking,viewport:s.viewport,ambientTime:s.phase,landmarks:[],offstage:{sister:{environment:'riverbank',point:[810,650],pose:'seated-reading',bookOwner:'sister'},rabbit:{environment:'beyond-hall',visible:0}}};
 }
}
