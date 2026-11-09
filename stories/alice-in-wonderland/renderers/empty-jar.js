import {drawCharacter} from '../../../platform/rendering/character-art.js';
const P='alice-riverbank',snap=n=>Math.round(n/2)*2,clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),smooth=t=>t*t*(3-2*t);
const union=boxes=>[Math.min(...boxes.map(b=>b[0])),Math.min(...boxes.map(b=>b[1])),Math.max(...boxes.map(b=>b[2])),Math.max(...boxes.map(b=>b[3]))];

// S4 is the same fixed shaft. Every support, origin, mask and hand pin comes
// from the approved03 measurements; chapter data owns all narrative state.
export class EmptyJar {
 constructor(scene,geometry,cells){
  this.scene=scene;this.geometry=geometry;this.cells=Object.fromEntries(cells.poses.map(c=>[c.pose,c]));this.normalized={...scene.tunnel.normalized};this.scale=geometry.coordinateSystem.actorFallScale;
  const source=url=>scene.textures.get(P+'-source-'+Object.keys(scene.reader.story.assets).find(id=>scene.reader.story.assets[id]===url)).getSourceImage();
  this.source=source;
  for(const c of cells.poses){const[l,t,r,b]=c.sourceBoundsExclusive,[w,h]=c.normalizedSize,key='alice-empty-jar-'+c.pose,tex=scene.textures.createCanvas(key,w,h);drawCharacter(tex.context,source(c.asset),l,t,r-l,b-t,w,h);tex.refresh();this.normalized[c.pose]={key,width:w,height:h};}
  this.backgrounds={};
  for(const state of ['upper-fixed','empty-upper']){
   const key='alice-s4-background-'+state,tex=scene.textures.createCanvas(key,1720,1916),ctx=tex.context;ctx.imageSmoothingEnabled=false;
   ctx.drawImage(source(geometry.assets['well-bottom-panorama-s4-v1.png'].url),...geometry.coordinateSystem.continuationSourceOrigin);
   ctx.save();ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(1672,0);for(const p of [...geometry.panorama.upperCoverageBoundarySource].reverse())ctx.lineTo(...p);ctx.closePath();ctx.clip();ctx.drawImage(scene.tunnel.background.texture.getSourceImage(),0,0);
   ctx.restore();
   const j=geometry.panorama.junction,[sx,sy,w,h]=j.sourceCrop,[dx,dy]=j.destinationSource,m=j.staticMask,bridge=source(geometry.assets[j.asset].url);
   // Hard2x2 static art coverage. No blur, moving noise or scene dissolve.
   for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2){const gy=dy+y,coverage=Math.min(clamp((gy-m.rise[0])/(m.rise[1]-m.rise[0]),0,1),clamp((m.fall[1]-gy)/(m.fall[1]-m.fall[0]),0,1)),noise=Number((BigInt(x/2)*BigInt(m.hashX)^BigInt(Math.floor(gy/2))*BigInt(m.hashY)^BigInt(m.seed))%BigInt(m.modulus))/m.modulus;if(noise<coverage)ctx.drawImage(bridge,sx+x,sy+y,2,2,dx+x,dy+y,2,2);}
   // A generated repair follows measured texture contours; no noise blend in this wall.
   const repair=source(geometry.assets['well-wall-clean-s4-v1.png'].url);for(const [x,y,w,h]of scene.cache.json.get(P+'-s4-wall-mask').spans)ctx.drawImage(repair,x,y,w,h,x,y,w,h);
   tex.refresh();this.backgrounds[state]=scene.add.image(0,0,key).setOrigin(0).setDisplaySize(3440,3832).setDepth(0);
  }
  this.people={alice:{actor:scene.add.image(0,0,this.normalized['slow-descent'].key),shadow:scene.add.ellipse(0,0,1,1,0,0).setScale(this.scale)}};
  this.objects={jar:scene.add.image(0,0,this.normalized['jar-upright'].key).setOrigin(.5,1)};
  this.leaves=geometry.landingLeafClusters.map(leaf=>{
   const poly=leaf.sourcePolygon,l=Math.min(...poly.map(p=>p[0])),t=Math.min(...poly.map(p=>p[1])),r=Math.max(...poly.map(p=>p[0])),b=Math.max(...poly.map(p=>p[1])),key='alice-s4-'+leaf.id,tex=scene.textures.createCanvas(key,r-l,b-t),ctx=tex.context,src=source(geometry.assets['well-bottom-panorama-s4-v1.png'].url);
   const inside=(x,y)=>{let found=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])found=!found;}return found;};
   for(let y=t;y<b;y+=2)for(let x=l;x<r;x+=2)if(inside(x+1,y+1))ctx.drawImage(src,x,y,2,2,x-l,y-t,2,2);
   tex.refresh();return{...leaf,point:[(l+geometry.coordinateSystem.continuationSourceOrigin[0])*2,(t+geometry.coordinateSystem.continuationSourceOrigin[1])*2],sprite:scene.add.image(0,0,key).setOrigin(0).setScale(2).setDepth(4002)};
  });
  this.hide();
 }
 hide(){for(const b of Object.values(this.backgrounds))b.setVisible(false);this.people.alice.actor.setVisible(false);this.people.alice.shadow.setVisible(false);this.objects.jar.setVisible(false);for(const l of this.leaves)l.sprite.setVisible(false);}
 pose(){const e=this.scene.reader,id=e.step?.id,p=clamp(e.elapsed/(e.step?.duration||1),0,1),st=e.model.staging.alice;
  if(id==='alice-c1-s4-approach'&&p>.55)return 'pass-arm-'+Math.max(0,3-Math.floor((p-.55)/.45*4));
  if(id==='alice-c1-s4-clear-upper'||id==='alice-c1-s4-withdraw')return 'pass-arm-'+Math.min(7,Math.floor(p*8));
  if(id==='alice-c1-s4-place-approach')return 'pass-arm-'+Math.max(0,7-Math.floor(p*8));
  if(id==='alice-c1-s4-clear-lower'&&p<.8)return 'pass-arm-'+Math.max(3,7-Math.floor(p/.8*5));
  return st==='reach-registered'?'pass-arm-0':st==='hold-registered'?'pass-arm-7':st;
 }
 size(){return this.normalized[this.pose()]||this.normalized['slow-descent'];}
 origin(){return this.cells[this.pose()]?.origin||[.5,1];}
 body(){const a=this.scene.reader.model.actors.alice,z=this.scale,{width:w,height:h}=this.size(),o=this.origin();return[snap(a.x)-w*z*o[0],snap(a.y)-h*z*o[1],snap(a.x)+w*z*(1-o[0]),snap(a.y)+h*z*(1-o[1])];}
 placementProgress(){const e=this.scene.reader;return e.step?.id==='alice-c1-s4-place-approach'?smooth(clamp(e.elapsed/e.step.duration,0,1)):e.step?.id==='alice-c1-s4-place-contact'?1:0;}
 handAnchor(){const c=this.cells[this.pose()],h=[...c.handAnchorNormalized],q=this.placementProgress(),d=this.geometry.heldProps.jar.lowerPlacementGrip.handOffsetNormalized;return h.map((v,i)=>v+d[i]*q);}
 prop(){const m=this.scene.reader.model,g=this.geometry,a=m.actors.alice,held=m.jar.owner==='alice',pose=held&&m.jar.orientation==='tilted'?'jar-inspect':held?'jar-upright':'jar-upright',sz=this.normalized[pose],o=held?g.heldProps.jar.gripOnJarNormalized.map((v,i)=>v+(g.heldProps.jar.lowerPlacementGrip.gripOnJarNormalized[i]-v)*this.placementProgress()):[.5,1];let p;
  if(held){const c=this.cells[this.pose()],origin=this.origin(),h=this.handAnchor();p=[snap(a.x)+(h[0]-c.normalizedSize[0]*origin[0])*this.scale,snap(a.y)+(h[1]-c.normalizedSize[1]*origin[1])*this.scale];}
  else p=g.anchors[m.jar.state==='lower-fixed'?'J1-lower-base':'J0-upper-base'].point;
  p=p.map(snap);return{pose,owner:m.jar.owner,point:p,origin:o,bounds:[p[0]-sz.width*this.scale*o[0],p[1]-sz.height*this.scale*o[1],p[0]+sz.width*this.scale*(1-o[0]),p[1]+sz.height*this.scale*(1-o[1])],visible:true};
 }
 required(shot=this.scene.reader.model.s4.shot){const m=this.scene.reader.model,g=this.geometry,boxes=[this.body()],p=this.prop();if(p.visible&&m.jar.owner==='alice')boxes.push(p.bounds);
  if(shot==='upper')boxes.push([1108*2,636*2,1210*2,697*2]);
  if(shot==='lower'&&this.scene.reader.step?.id!=='alice-c1-s4-choice')boxes.push([1110*2,1108*2,1314*2,1174*2]);
  if((shot==='leaves'||shot==='landing')&&this.scene.reader.step?.id!=='alice-c1-s4-leaves')boxes.push([1036*2,1650*2,1130*2,1680*2]);return union(boxes);
 }
 // Scene zoom is planned once for the complete layout, never for the current beat.
 zoomPlan(){const s=this.scene,g=this.geometry,c=g.camera.zoomLock,[ax,ay,aw,ah]=g.coordinateSystem.worldBounds,w=s.scale.width,h=s.scale.height,sw=s.safeWidth||w,offset=s.safeCenterOffset||0,top=s.safeTopInset||0,key=[w,h,sw,offset,top].join(':');
  if(this.zoomLayout?.key===key)return this.zoomLayout;
  const reading=Math.min(h,s.readingHeight||h),sl=w/2-offset-sw/2+12,sr=w/2-offset+sw/2-12,st=Math.max(77,top)+12,sb=Math.max(st+1,reading-12),minimum=Math.max((w+2)/aw,(h+2)/Math.min(ah,c.openingArtworkHeightWorld),(st+1)/(c.minimumProtectedTopWorld-ay),(h-sb+1)/(ay+ah-c.maximumProtectedBottomWorld)),contextMaximum=Math.min((sr-sl)/c.maximumContextSizeWorld[0],(sb-st)/c.maximumContextSizeWorld[1]),z=Math.max(minimum,Math.min(h/1200,contextMaximum)),plan={key,z,sl,sr,st,sb,minimum,contextMaximum};
  if(Number.isFinite(s.readingHeight))this.zoomLayout=plan;return plan;
 }
 lockedZoom(){return this.zoomPlan().z;}
 protected(shot){const m=this.scene.reader.model,p=this.prop(),boxes=[this.body()];if(p.owner==='alice'||shot==='upper'&&m.jar.state==='upper-fixed'||shot==='lower'&&m.jar.state==='lower-fixed')boxes.push(p.bounds);if(shot==='landing')boxes.push([2072,3300,2260,3360]);return union(boxes);}
 frame(shot=this.scene.reader.model.s4.shot){const s=this.scene,[ax,ay,aw,ah]=this.geometry.coordinateSystem.worldBounds,w=s.scale.width,h=s.scale.height,{z,sl,sr,st,sb:reservedBottom}=this.zoomPlan(),context=this.required(shot),hard=this.protected(shot),step=s.reader.step;
  // A clear caption can lend vertical room to the protected entrance; zoom stays locked.
  const sb=step?.caption==='clear'?Math.min(h-12,Math.max(reservedBottom,st+(hard[3]-hard[1])*z+1)):reservedBottom,contextFits=z*(context[2]-context[0])<=sr-sl&&z*(context[3]-context[1])<=sb-st,[l,t,r,b]=contextFits?context:hard;
  const base=context,reveal=step?.id==='alice-c1-s4-choice'?[2220,2216,2628,2348]:step?.id==='alice-c1-s4-leaves'?[2072,3300,2260,3360]:null,q=reveal?smooth(clamp(s.reader.elapsed/step.duration,0,1)):0,target=reveal?union([base,reveal]):base,composition=base.map((v,i)=>v+(target[i]-v)*q);
  const minimum=Math.max((w+2)/aw,(h+2)/ah,(sl+1)/(l-ax),(w-sr+1)/(ax+aw-r),(st+1)/(t-ay),(h-sb+1)/(ay+ah-b)),maximum=Math.min((sr-sl)/(r-l),(sb-st)/(b-t)),fits=z>=minimum-1e-8&&z<=maximum+1e-8;
  let lx=Math.max(ax+(w/2+1)/z,r+(w/2-sr)/z),rx=Math.min(ax+aw-(w/2+1)/z,l+(w/2-sl)/z),ty=Math.max(ay+(h/2+1)/z,b+(h/2-sb)/z),by=Math.min(ay+ah-(h/2+1)/z,t+(h/2-st)/z);
  return{x:clamp((composition[0]+composition[2])/2+(s.safeCenterOffset||0)/z,lx,rx),y:clamp((composition[1]+composition[3])/2+(h/2-(st+sb)/2)/z,ty,by),z,fits,minimum,maximum};
 }

 draw(){const s=this.scene,e=s.reader,m=e.model,p=this.prop();s.people=this.people;s.objects=this.objects;
  const active=m.jar.owner==='alice'||m.jar.state==='lower-fixed'?'empty-upper':'upper-fixed';for(const[k,b]of Object.entries(this.backgrounds))b.setVisible(k===active);s.background=this.backgrounds[active];
  const a=m.actors.alice,size=this.size();this.people.alice.actor.setVisible(true).setTexture(size.key).setOrigin(...this.origin()).setPosition(snap(a.x),snap(a.y)).setScale(this.scale).setFlipX(false).setAlpha(a.visible).setDepth(4000);this.people.alice.shadow.setVisible(false);
  this.objects.jar.setVisible(p.visible).setTexture(this.normalized[p.pose].key).setOrigin(...p.origin).setPosition(...p.point).setScale(this.scale).setAlpha(a.visible).setDepth(4001);
  const compression=e.step?.id==='alice-c1-s4-hook-compress',settling=e.step?.id==='alice-c1-s4-hook-settle',leafProgress=compression?smooth(clamp(e.elapsed/e.step.duration,0,1)):m.s4.landed?1:0;
  for(const leaf of this.leaves)leaf.sprite.setVisible(compression||settling||m.s4.landed).setPosition(leaf.point[0]+snap(leaf.shiftSource[0]*2*leafProgress),leaf.point[1]+snap(leaf.shiftSource[1]*2*leafProgress));
  let f=this.frame();if(e.step?.id==='alice-c1-s4-clear-upper-end')f=s.tunnel.mix(this.frame('upper'),f,e.elapsed/e.step.duration);if(e.step?.id==='alice-c1-s4-clear-lower')f=s.tunnel.mix(this.frame('lower'),f,e.elapsed/e.step.duration);if(e.step?.id==='alice-c1-s4-approach')f=s.tunnel.mix(s.tunnel.frame('s3-hook-end',false),f,Math.min(1,e.elapsed/e.step.duration));
  f.z=this.lockedZoom();s.framing=f;s.activeShot=m.s4.shot;s.cameraReframing=false;s.cameraTracking={id:'s4-continuous-descent',departingStationaryActors:[]};s.environmentCameraIssue=f.fits?null:{view:m.s4.shot,minimum:f.minimum,maximum:f.maximum};
  const w=s.scale.width,h=s.scale.height;s.viewport={x:0,y:0,width:w,height:h};s.cameraSourceRect=[f.x-w/(2*f.z),f.y-h/(2*f.z),w/f.z,h/f.z];s.cameras.main.setViewport(0,0,w,h).setZoom(f.z).centerOn(f.x,f.y);
 }
 diagnostics(){const s=this.scene,m=s.reader.model,f=s.framing,project=(x,y)=>({x:(x-f.x)*f.z+s.scale.width/2,y:(y-f.y)*f.z+s.scale.height/2}),b=this.body(),a=m.actors.alice,p=this.prop(),[x,y,w,h]=s.cameraSourceRect;
  return{width:s.scale.width,height:s.scale.height,environment:'well-bottom',shot:m.s4.shot,requiredActors:['alice'],requiredProps:p.visible&&p.owner==='alice'?['jar']:[],actors:{alice:{...project(a.x,a.y),head:project(a.x,b[1]),world:{x:snap(a.x),y:snap(a.y)},pose:this.pose(),visible:a.visible,scale:this.scale,bounds:{left:project(b[0],b[1]).x,right:project(b[2],b[1]).x,top:project(b[0],b[1]).y,bottom:project(b[0],b[3]).y}}},props:{jar:{...project(...p.point),owner:p.owner,visible:p.visible?1:0,world:{x:p.point[0],y:p.point[1]},top:project(p.point[0],p.bounds[1]),left:project(p.bounds[0],p.point[1]),right:project(p.bounds[2],p.point[1]),state:m.jar.owner==='alice'?'carried':m.jar.state,orientation:m.jar.orientation}},depthScaling:{curve:{referenceY:0,referenceScale:this.scale,slopePerWorldY:0,minScale:this.scale,maxScale:this.scale},actorReferenceY:{alice:0},actorGain:{alice:this.scale},lockedScaleByActor:{alice:this.scale},anchorByActor:this.cells[this.pose()]?.sourceRegistrationAnchor?{alice:{sourceBoundsExclusive:(this.cells[this.pose()].nativeFrame?.sourceBoundsExclusive||this.cells[this.pose()].sourceBoundsExclusive),sourceAnchor:this.cells[this.pose()].sourceRegistrationAnchor,origin:this.origin()}}:this.cells[this.pose()]?.sourceShoeAnchor?{alice:{sourceBoundsExclusive:(this.cells[this.pose()].nativeFrame?.sourceBoundsExclusive||this.cells[this.pose()].sourceBoundsExclusive),sourceAnchor:this.cells[this.pose()].sourceShoeAnchor,origin:this.origin()}}:{}},cameraCoverage:{worldView:{left:x,right:x+w,top:y,bottom:y+h},artwork:this.geometry.coordinateSystem.worldBounds},cameraReframing:false,cameraTracking:s.cameraTracking,viewport:s.viewport,ambientTime:s.phase,landmarks:[],offstage:{sister:{environment:'riverbank',point:[m.actors.sister.x,m.actors.sister.y],pose:'seated-reading',bookOwner:m.book.owner},rabbit:{environment:'beyond-upper-bend',visible:0}}};
 }
}
