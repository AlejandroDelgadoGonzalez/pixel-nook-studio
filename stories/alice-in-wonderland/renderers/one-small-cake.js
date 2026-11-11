import {drawCharacter,createPixelWalkFrames} from '../../../platform/rendering/character-art.js';
import {depthScaleAt} from '../../../platform/reader/motion-speed.js';
const R='/stories/alice-in-wonderland/',P='alice-small-cake';
const G=await fetch(R+'shared/chapter-2-scene-7-geometry.json').then(r=>r.json());
const ART=await fetch(R+'shared/chapter-2-scene-7-atlas-cells.json').then(r=>r.json());
const clamp=x=>Math.max(0,Math.min(1,x)),mix=(a,b,t)=>a+(b-a)*t,smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
// All routes and attachment landmarks are measured in the scene's shared file.
export function along(points,t){const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));let d=clamp(t)*lengths.reduce((a,b)=>a+b,0);for(let i=0;i<lengths.length;i++){if(d<=lengths[i]||i===lengths.length-1){const q=lengths[i]?d/lengths[i]:0,a=points[i],b=points[i+1],dx=b[0]-a[0],dy=b[1]-a[1];return{x:mix(a[0],b[0],q),y:mix(a[1],b[1],q),facing:Math.abs(dy)>Math.abs(dx)?dy>0?'front':'back':dx>0?'right':'left'};}d-=lengths[i];}}
export class SmallCake{
 static preload(s){s.load.json(P+'-exterior-geometry',R+'shared/chapter-2-scene-4-geometry.json');}
 constructor(s){this.s=s;this.nodes=[];this.own=o=>(this.nodes.push(o),o);this.keys={...s.largeStage.keys};this.cells={...s.largeStage.cells};this.house=s.cache.json.get(P+'-exterior-geometry');for(const c of ART.poses){const[l,t,r,b]=c.sourceBoundsExclusive,[w,h]=c.normalizedSize,k=P+c.pose,tex=s.textures.createCanvas(k,w*4,h*4);drawCharacter(tex.context,s.emptyJar.source(c.asset||c.detailAsset),l,t,r-l,b-t,w*4,h*4);tex.refresh();this.keys[c.pose]=k;this.cells[c.pose]=c;}
 this.buildAnchoredReach();
 this.buildKneelingBite();
 for(const dir of ['right','front','back']){s.textures.addCanvas(`${P}-alice-${dir}`,s.textures.get(this.keys[dir]).getSourceImage());createPixelWalkFrames(s,P,'alice',dir,4);}
 this.alice=this.own(s.add.image(0,0,this.keys['standing-ready']));this.shadow=this.own(s.add.ellipse(0,0,30,5,0x211710,.12));this.items=G.opening.cakes.map(()=>this.own(s.add.graphics()));const bill=s.billStage;
 this.bg=this.own(s.add.image(0,0,bill.bg.texture.key).setOrigin(0).setDepth(-1000));this.rabbit=this.own(s.add.image(...G.anchors.waitingRabbit,bill.rabbitKeys['rabbit-canonical-ready'].key).setOrigin(.5,1).setScale(.175).setFlipX(true).setDepth(680));this.bill=this.own(s.add.image(...G.anchors.waitingBill,bill.keys['seated-dazed-left']).setOrigin(.5,1).setScale(bill.poseScales['seated-dazed-left']).setDepth(690));this.ladder=this.own(s.add.graphics().setDepth(660));
 const d=this.house.environments.rabbitHouse.door,[l,t,r,b]=d.closedLeafSourceBounds,k=P+'-door-leaf',tex=s.textures.createCanvas(k,r-l,b-t),ctx=tex.context;ctx.beginPath();d.openingPolygon.forEach(([x,y],i)=>i?ctx.lineTo(x-l,y-t):ctx.moveTo(x-l,y-t));ctx.closePath();ctx.clip();ctx.drawImage(this.bg.texture.getSourceImage(),l,t,r-l,b-t,0,0,r-l,b-t);tex.refresh();this.aperture=this.own(s.add.graphics().setDepth(d.interiorDepth));this.aperture.fillStyle(0x11111a).fillPoints(d.openingPolygon.map(([x,y])=>({x,y})),true);this.leaf=this.own(s.add.image(l,t,k).setOrigin(0).setDepth(d.leafDepth));this.hide();
 }
 buildAnchoredReach(){
  const cell=this.cells['collect-fan'];
  const source=this.s.textures.get(this.keys[cell.pose]).getSourceImage();
  const key=P+'-anchored-reach';
  const texture=this.s.textures.createCanvas(key,source.width,source.height);
  const ctx=texture.context,{polygon,pivot,angleDegrees}=G.pickupArm;
  const clipArm=context=>{
   context.beginPath();
   polygon.forEach(([x,y],i)=>i?context.lineTo(x*4,y*4):context.moveTo(x*4,y*4));
   context.closePath();
   context.clip();
  };
  const arm=document.createElement('canvas');
  arm.width=source.width;
  arm.height=source.height;
  const armContext=arm.getContext('2d');
  clipArm(armContext);
  armContext.drawImage(source,0,0);
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(source,0,0);
  ctx.save();
  clipArm(ctx);
  ctx.clearRect(0,0,source.width,source.height);
  ctx.restore();
  const [x,y]=pivot.map(value=>value*4);
  ctx.translate(x,y);
  ctx.rotate(angleDegrees*Math.PI/180);
  ctx.drawImage(arm,-x,-y);
  ctx.resetTransform();
  const rotated=document.createElement('canvas');
  rotated.width=source.width;
  rotated.height=source.height;
  rotated.getContext('2d').drawImage(texture.getSourceImage(),0,0);
  ctx.clearRect(0,0,source.width,source.height);
  drawCharacter(ctx,rotated,0,0,rotated.width,rotated.height,source.width,source.height);
  texture.refresh();
  this.keys['anchored-reach']=key;
  this.cells['anchored-reach']=cell;
 }
 buildKneelingBite(){
  const source=this.s.textures.get(this.keys['take-cake']).getSourceImage();
  const eating=this.s.textures.get(this.keys['eat-cake']).getSourceImage();
  const key=P+'-kneeling-bite',texture=this.s.textures.createCanvas(key,source.width,source.height);
  const ctx=texture.context,{source:crop,offset,removePolygon}=G.biteArm;
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(source,0,0);
  ctx.save();
  ctx.beginPath();
  removePolygon.forEach(([x,y],i)=>i?ctx.lineTo(x*4,y*4):ctx.moveTo(x*4,y*4));
  ctx.closePath();
  ctx.clip();
  ctx.clearRect(0,0,source.width,source.height);
  ctx.restore();
  const [x,y,w,h]=crop.map(value=>value*4);
  ctx.drawImage(eating,x,y,w,h,...offset.map(value=>value*4),w,h);
  texture.refresh();
  this.keys['kneeling-bite']=key;
  this.cells['kneeling-bite']=this.cells['take-cake'];
 }
 hide(){this.nodes.forEach(o=>o.setVisible(false));this.active=false;}
 interiorFrame(n,q){
  const s=this.s,frame=s.largeStage.frame(1);
  if(s.scale.width<s.scale.height){
   frame.z*=.91;
   const progress=n<=2?0:n===3?smooth(q):1;
   frame.x+=18*progress;
  }
  return frame;
 }
 exteriorFrame(n,q,pos){const s=this.s,w=s.scale.width,h=s.scale.height,portrait=w<h,cap=document.querySelector('#dialogue')?.getBoundingClientRect(),exporting=!!s.game.canvas.closest('.export-render-host'),safe=exporting?(s.readingHeight||h*.68)+20:h*G.cameras.captionSafeHeightRatio;
  const ground=mix(710,760,n===21?smooth(q):0);
  const z=Math.max(w/1666,h/938,portrait?w/400:.9,(h-safe+24)/(940-ground));const half=w/2/z;
  let x=835;
  if(portrait){
   const reactionCenter=(G.anchors.waitingRabbit[0]+G.anchors.waitingBill[0])/2;
   const onSteps=s.reader.step.id.endsWith('-steps');
   if(n<=15)x=754;
   else if(n===16)x=onSteps?mix(754,reactionCenter,smooth(q)):754;
   else if(n===17)x=reactionCenter;
   else if(n===18)x=mix(reactionCenter,pos.x,smooth(s.reader.elapsed/1000));
   else if(n<=20)x=pos.x;
   else x=mix(455,340,smooth(q));
  }
  x=Math.max(half+2,Math.min(1668-half,x));const y=Math.max(h/2/z+2,Math.min(940-h/2/z,ground-(safe-24-h/2)/z));return{x,y,z};
 }
 cake(o,pos,visible){o.setVisible(visible).clear().setPosition(...pos).setDepth(2000);if(visible)o.fillStyle(0x251b13).fillRect(-9,-13,18,14).fillStyle(0xdba159).fillRect(-7,-9,14,8).fillStyle(0xffefd2).fillRect(-7,-12,14,5).fillStyle(0xd75b58).fillRect(-2,-13,4,3);}
 draw(){const s=this.s,e=s.reader,n=e.step.cakeMoment||21,q=e.step.type==='action'?clamp(e.elapsed/e.step.duration):1,inside=n<15,L=s.largeStage;this.active=true;this.nodes.forEach(o=>o.setVisible(false));let pos={x:G.anchors.proposedPickupFeet[0],y:G.anchors.proposedPickupFeet[1],facing:'left'},pose=n<=4?G.anchors.pickupPose:n<=6?G.anchors.eatingPose:'standing-ready',size=n<=5?G.scaleStages[0]:e.model.cake.size,alpha=1,walk=false,door=e.model.cake.door;
  if(inside){L.draw();if(n<=2){this.current={n,inside,size:G.scaleStages[0],pose:'folded-trapped-right',cakeOwner:'floor',consumed:false,standing:false};const f=this.interiorFrame(n,q);this.applyFrame(f,false);G.opening.cakes.forEach((p,i)=>this.cake(this.items[i],p,true));this.people=s.people;this.artwork=[0,0,1664,1224];return true;}
   L.body.setVisible(false);L.alice.setVisible(false);L.shadow.setVisible(false);L.floorReuse.forEach(o=>o.setVisible(true));L.props.bottle.setPosition(...G.opening.props.bottle.anchor);L.leaf.setVisible(true).setDepth(650).setScale(Math.cos(smooth(door)*80*Math.PI/180),1).setAngle(0);L.aperture.setVisible(true);
   if(n===14){if(e.step.id.endsWith('-walk')){pos=along(G.walkPaths.insideToDoor,smooth(q));walk=true;}else if(e.step.id.endsWith('-open')){pos={x:G.anchors.interiorDoorFeet[0],y:G.anchors.interiorDoorFeet[1],facing:'right'};pose='alice-door-push-right';}else{pos=along(G.walkPaths.interiorThresholdCrossing,q);alpha=1-smooth(q);walk=true;}}
   this.applyFrame(this.interiorFrame(n,q),n===3);s.renderedBackdrop=L.bg.texture.key;this.artwork=[0,0,1664,1224];
  }else{
   s.children.list.forEach(o=>{if(!o.texture?.key?.startsWith('shot-dissolve-'))o.setVisible(false);});this.bg.setVisible(true);s.renderedBackdrop=this.bg.texture.key;s.environmentSurfaces=[this.bg];this.artwork=[0,0,1670,942];this.rabbit.setVisible(true).setFlipX(true);this.bill.setVisible(true);this.drawLadder();this.aperture.setVisible(true);this.leaf.setVisible(true).setScale(Math.cos(door*82*Math.PI/180),1);
   if(n===15){pos=along(G.walkPaths.exteriorEmergence,0);alpha=0;}
   else if(n===16){const emerging=e.step.id.endsWith('-emerge');pos=along(emerging?G.walkPaths.exteriorEmergence:G.walkPaths.exitSteps,q);alpha=emerging?smooth(q):1;walk=true;}
   else if(n===17)pos={...along(G.walkPaths.exitSteps,1),facing:'left'};
   else if(n===18){pos=along(G.walkPaths.yardToGate,q);walk=true;}
   else if(n<=20)pos={x:G.anchors.gatePause[0],y:G.anchors.gatePause[1],facing:'left'};
   else{pos=along(G.walkPaths.forestHook,q);walk=e.step.type!=='end';}
   this.applyFrame(this.exteriorFrame(n,q,pos),walk);size=.32;
  }
  const physical=inside?(n<=6?G.crouch.physicalGain:2.6041666666666665)*size:depthScaleAt(this.house.actors.alice.scaleKnots,pos.y)*this.house.actors.alice.physicalGain*.32,c=this.cells[pose],origin=c.groundAnchorNormalized?c.groundAnchorNormalized.map((v,i)=>v/c.normalizedSize[i]):c.origin||[.5,1],flip=c.facing&&c.facing!=='front'&&c.facing!=='back'&&c.facing!==pos.facing;
  this.alice.setVisible(alpha>0).setTexture(this.keys[pose]).setOrigin(flip?1-origin[0]:origin[0],origin[1]).setPosition(pos.x,pos.y).setScale(physical/4).setFlipX(flip).setAlpha(alpha).setDepth(inside?1000:pos.y);
  if(walk){const dir=['front','back'].includes(pos.facing)?pos.facing:'right';this.alice.setTexture(`${P}-alice-walk-${dir}-${Math.floor((e.elapsed+(n===16&&e.step.id.endsWith('-steps')?2000:0))/130)%8}`).setOrigin(.5,1).setFlipX(pos.facing==='left');pose='walk-'+dir;}
  this.shadow.setVisible(alpha>0).setPosition(pos.x,pos.y-1).setAlpha(alpha*.12).setScale(physical).setDepth(this.alice.depth-.1);
  let held=null;if(inside){for(let i=0;i<3;i++){let at=G.opening.cakes[i],visible=i!==G.anchors.selectedCakeIndex||n<=3;if(i===G.anchors.selectedCakeIndex&&[4,5].includes(n)){const hand=n===4?G.anchors.pickupFingerNormalized:G.anchors.biteHandNormalized,ground=c.groundAnchorNormalized;held=n===4?G.anchors.pickupHand:[pos.x+(hand[0]-ground[0])*physical,pos.y+(hand[1]-ground[1])*physical];at=held;visible=true;}this.cake(this.items[i],at,visible);}}
  this.people={alice:{actor:this.alice,shadow:this.shadow},...(!inside?{'white-rabbit':{actor:this.rabbit},bill:{actor:this.bill}}:{})};s.people=this.people;s.objects=inside?L.props:{};
  this.current={n,inside,size,physical,pose,standing:n>=7,alpha,feet:[pos.x,pos.y],cakeOwner:held?'alice':n>5?'consumed':'floor',heldCake:held,consumed:n>5,remainingCakeCount:2,cakeRest:G.anchors.remainingCakes,door,walking:walk,rabbitFacingLeft:!inside&&this.rabbit.flipX};return true;
 }
 applyFrame(f,moving){const s=this.s;s.framing={...f,fits:true,lock:f.lock||'one-small-cake-continuity'};s.viewport={x:0,y:0,width:s.scale.width,height:s.scale.height};s.cameras.main.setViewport(0,0,s.scale.width,s.scale.height).setZoom(f.z).centerOn(f.x,f.y);s.cameraReframing=moving;s.cameraTracking=moving?'alice':null;}
 drawLadder(){const o=this.ladder;o.setVisible(true).clear().setPosition(1020,668);for(const off of[-16,16]){o.lineStyle(7,0x251b13).lineBetween(off,0,-20+off,-266);o.lineStyle(3,0xb88b52).lineBetween(off,0,-20+off,-266);}for(let i=1;i<11;i++){const y=-266*i/11,x=-20*i/11;o.lineStyle(6,0x251b13).lineBetween(x-16,y,x+16,y);o.lineStyle(3,0xc3985a).lineBetween(x-15,y,x+15,y);}}
 diagnostics(){const s=this.s,f=s.framing,w=s.scale.width,h=s.scale.height,project=(x,y)=>({x:(x-f.x)*f.z+w/2,y:(y-f.y)*f.z+h/2}),actors={};for(const[id,p]of Object.entries(this.people||{})){const a=p.actor,b=a.getBounds();actors[id]={...project(a.x,a.y),world:{x:a.x,y:a.y},head:project(a.x,b.top),visible:a.visible?a.alpha:0,pose:a.texture.key,bounds:{left:project(b.left,b.top).x,right:project(b.right,b.bottom).x,top:project(b.left,b.top).y,bottom:project(b.right,b.bottom).y}};}return{width:w,height:h,environment:this.current.inside?'rabbit-house-interior':'rabbit-house',actors,requiredActors:s.reader.step.type==='text'?[s.reader.step.who]:[],props:{},requiredProps:[],viewport:s.viewport,cameraReframing:s.cameraReframing,cameraTracking:s.cameraTracking,cameraCoverage:{worldView:{left:f.x-w/2/f.z,right:f.x+w/2/f.z,top:f.y-h/2/f.z,bottom:f.y+h/2/f.z},artwork:this.artwork},landmarks:[],ambientTime:s.phase,smallCake:this.current};}
}
