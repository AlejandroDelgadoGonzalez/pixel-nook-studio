import {AmongTheBranches} from './among-the-branches.js';
import {AliceMushroomRig} from './alice-mushroom-rig.js';
import {createPixelWalkFrames} from '../../../platform/rendering/character-art.js';
const ROOT='/stories/alice-in-wonderland/',P='alice-c3-s1',B='alice-c3-s5';
const g=await fetch(ROOT+'shared/chapter-3-scene-5-geometry.json').then(r=>r.json());
const aliceGeometry=await fetch(ROOT+'shared/chapter-3-scene-3-geometry.json').then(r=>r.json());
const D={geometry:g},clamp=t=>Math.max(0,Math.min(1,t)),ease=t=>{t=clamp(t);return t*t*(3-2*t)},mix=(a,b,t)=>a+(b-a)*t;
const canvas=()=>Object.assign(document.createElement('canvas'),{width:1664,height:936});
function state(beat,t){
 const g=D.geometry,s={beat,t,alice:[790,660],alicePose:'right',aliceMirror:false,fish:[...g.anchors.fishRoot],fishPose:'idle-right',fishMirror:false,fishMask:false,frog:[...g.anchors.frogRoot],frogPose:beat>=9?'sit-right':'idle-right',frogMirror:true,letterOwner:beat<3?'fish-footman':'frog-footman',oldAlice:[640,615],oldFocus:500,oldOpacity:0,newOpacity:1,scale:.46,A:.84,B:.78,pockets:true};
 if(beat===1){const a=clamp(t/1200);s.oldAlice=[mix(640,696,a),615];s.oldFocus=mix(500,556,ease(a));s.oldOpacity=1-ease((t-1200)/1800);s.newOpacity=ease((t-1200)/1800);s.alice=[mix(720,790,clamp((t-3000)/1500)),660];s.letterOwner='fish-footman';}
 if(beat===3){s.fishPose=t<1800?'offer-right':'idle-right';s.frogPose=t>=500&&t<2500?'offer-right':'idle-right';s.letterOwner=t<1500?'fish-footman':'frog-footman';}
 if(beat>=9){const u=beat===9?clamp(t/5500):1;s.fish=s.fish.map((v,i)=>mix(v,D.geometry.anchors.fishHidden[i],u));s.fishMirror=true;s.fishMask=true;}
 if(beat>=15){s.alice=[mix(790,846,beat===15?clamp(t/1200):1),mix(660,640,beat===15?clamp(t/1200):1)];s.alicePose='right';if(beat===16||t>=1200)s.alicePose='back';}
 return s;
}

export class ADoorInTheWood extends AmongTheBranches{
 preload(){super.preload();this.load.image(B+'-house',ROOT+'assets/environments/duchess-house-c3-s5.png');for(const who of ['fish-footman','frog-footman','invitation'])this.load.image(B+'-'+who,ROOT+'shared/'+who+'-master-atlas.png');}
 create(){
  this.footArt={};for(const[who,d]of Object.entries(g.characters)){this.footArt[who]={};for(const p of d.poses){const [l,t,r,b]=p.bounds,c=document.createElement('canvas');c.width=r-l;c.height=b-t;c.getContext('2d').drawImage(this.textures.get(B+'-'+who).getSourceImage(),l,t,r-l,b-t,0,0,r-l,b-t);this.footArt[who][p.id]={...p,image:c};}}
  this.textures.addCanvas(B+'-fish-right',this.footArt['fish-footman']['idle-right'].image);createPixelWalkFrames(this,B,'fish','right',4);this.fishWalk=Array.from({length:8},(_,i)=>this.textures.get(B+'-fish-walk-right-'+i).getSourceImage());
  this.courtWorld=canvas();this.forestWorld=canvas();this.courtFish=canvas();this.courtAlice=canvas();
  const ready=this.ready;this.ready=scene=>{for(const who of ['fish-footman','frog-footman'])this.portraits[who]=this.footArt[who]['idle-right'].image.toDataURL();ready(scene);};super.create();this.ready=ready;
 }
 sceneFive(){const s=this.reader.step;return !!(s?.s5Beat||s?.sceneIndex===4&&(s?.exportPhase||s?.type==='end'));}
 state(){if(!this.sceneFive())return super.state();const s=state(this.reader.step.s5Beat||16,this.reader.elapsed||0);s.scene=5;s.letterOwner=this.reader.model.doorVisit.invitationTransfer>=.5?'frog-footman':'fish-footman';s.elapsed=s.t;s.houseAlice=[...s.alice];s.inForest=s.beat===1&&s.t<3000;s.alice=s.inForest?[...s.oldAlice]:[...s.houseAlice];s.root=[470,430];s.mask=true;s.scale=.46;s.gain=1.2;s.pose=s.inForest?'right':s.alicePose;s.mirror=false;s.fragments=[];s.hookahInstances=0;s.caterpillarBounds={left:470,top:430,right:470,bottom:430};return s;}
 frames(s){
  const base=super.fit(s,false),w=this.scale.width,h=this.scale.height,rect=this.game.canvas.getBoundingClientRect(),panel=document.querySelector('#dialogue')?.getBoundingClientRect(),exporting=this.game.canvas.closest('.export-render-host'),top=this.safeTopInset||24,bottom=exporting?(this.readingHeight||h*.68)+8:panel?(panel.top-rect.top)*h/rect.height-12:h*.68,z=base.z;
  const x=focus=>Math.max(2+w/2/z,Math.min(1662-w/2/z,focus));let up=550-(top+bottom)/(2*z);up=Math.min(up,402-top/z);up=Math.max(up,662-bottom/z);up=Math.max(2,Math.min(934-h/z,up));return{forest:{...base,x:x(s.oldFocus)},house:{x:x(860),y:up+h/2/z,z}};
 }
 drawAlice(ctx,root,pose,walking,elapsed){const v={alice:root,pose,mirror:false,scale:.46,walking,elapsed},out=this.trialRig.draw(ctx,v);return{...out,uniformScale:this.trialRig.lastScale,fullSpriteOnly:v.fullSpriteOnly,renderedPose:v.renderedPose,walking,root};}
 drawFoot(ctx,who,pose,root,mirror,walking=false,t=0){const p=this.footArt[who][pose],k=p.worldScale,im=walking?this.fishWalk[Math.floor(t/130)%8]:p.image,padding=walking?24:0;ctx.save();ctx.translate(...root);ctx.scale(mirror?-k:k,k);ctx.drawImage(im,-p.rootNative[0]-padding,-p.rootNative[1]);ctx.restore();return{hand:[root[0]+(p.handNative[0]-p.rootNative[0])*k*(mirror?-1:1),root[1]+(p.handNative[1]-p.rootNative[1])*k],bounds:{left:root[0]-(mirror?p.nativeSize[0]-p.rootNative[0]:p.rootNative[0])*k-padding*k,top:root[1]-p.rootNative[1]*k,right:root[0]+(mirror?p.rootNative[0]:p.nativeSize[0]-p.rootNative[0])*k+padding*k,bottom:root[1]+(p.nativeSize[1]-p.rootNative[1])*k},root,pose,mirror,walking};}
 draw(){
  if(!this.sceneFive()||!this.surface){this.lastCourt=null;return super.draw();}
  this.lastBranchImage=null;this.trialRig??=new AliceMushroomRig(this,aliceGeometry,this.textures.get(P+'-alice').getSourceImage());
  const s=this.state(),frames=this.frames(s),oldWalk=s.beat===1&&s.t>0&&s.t<1200,newWalk=s.beat===1&&s.t>=3000&&s.t<4500||s.beat===15&&s.t<1200,fishWalk=s.beat===9&&s.t<5500;
  const key=JSON.stringify([s.oldAlice,s.houseAlice,s.alicePose,s.fish,s.fishPose,s.fishMirror,s.fishMask,s.frogPose,s.letterOwner,s.newOpacity,oldWalk?Math.floor(s.t/130)%8:null,newWalk?Math.floor((s.beat===1?s.t-3000:s.t)/130)%8:null,fishWalk?Math.floor(s.t/130)%8:null,s.inForest?frames:null]);
  if(this.lastCourt?.key===key){Object.assign(s,this.lastCourt.art);this.showCourt(s,frames);return;}
  const old=this.forestWorld.getContext('2d');old.clearRect(0,0,1664,936);old.imageSmoothingEnabled=false;old.drawImage(this.textures.get(P+'-bg').getSourceImage(),0,0);
  const ac=this.courtAlice.getContext('2d');ac.clearRect(0,0,1664,936);ac.imageSmoothingEnabled=false;const oldAlice=this.drawAlice(ac,s.oldAlice,'right',oldWalk,s.t);old.drawImage(this.courtAlice,0,0);
  const c=this.courtWorld.getContext('2d');c.clearRect(0,0,1664,936);c.imageSmoothingEnabled=false;c.drawImage(this.textures.get(B+'-house').getSourceImage(),0,0);
  const fc=this.courtFish.getContext('2d');fc.clearRect(0,0,1664,936);fc.imageSmoothingEnabled=false;const fish=this.drawFoot(fc,'fish-footman',s.fishPose,s.fish,s.fishMirror,fishWalk,s.t);
  if(s.fishMask){fc.save();fc.globalCompositeOperation='destination-out';fc.beginPath();g.occluders[0].polygon.forEach(([x,y],i)=>i?fc.lineTo(x,y):fc.moveTo(x,y));fc.closePath();fc.fill();fc.restore();}
  c.drawImage(this.courtFish,0,0);const frog=this.drawFoot(c,'frog-footman',s.frogPose,s.frog,true),owner=s.letterOwner==='fish-footman'?fish:frog,center=[owner.hand[0]+(s.letterOwner==='fish-footman'?18:-18),owner.hand[1]],p=this.footArt.invitation.invitation,w=36,h=p.nativeSize[1]*w/p.nativeSize[0];c.drawImage(p.image,center[0]-w/2,center[1]-h/2,w,h);
  const houseAlice=this.drawAlice(c,s.houseAlice,s.alicePose,newWalk,s.beat===1?s.t-3000:s.t);
  const l=Math.floor(fish.bounds.left)-2,t=Math.floor(fish.bounds.top)-2,bw=Math.ceil(fish.bounds.right-l)+2,bh=Math.ceil(fish.bounds.bottom-t)+2,a=fc.getImageData(l,t,bw,bh).data;let x0=bw,y0=bh,x1=-1,y1=-1;for(let j=0;j<a.length/4;j++)if(a[j*4+3]){const x=j%bw,y=Math.floor(j/bw);x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}fish.visible=x1>=0;fish.visibleBounds=fish.visible?{left:l+x0,top:t+y0,right:l+x1+1,bottom:t+y1+1}:null;
  const main=this.surface.context;main.clearRect(0,0,1664,936);main.imageSmoothingEnabled=false;
  if(s.inForest){main.drawImage(this.forestWorld,0,0);if(s.newOpacity>0){main.save();main.globalAlpha=s.newOpacity;main.drawImage(this.courtWorld,frames.forest.x-frames.house.x,frames.forest.y-frames.house.y);main.restore();}}
  else main.drawImage(this.courtWorld,0,0);this.surface.refresh();
  const alice=s.inForest?oldAlice:houseAlice,art={oldAliceArt:oldAlice,houseAlice:houseAlice.root,houseAliceArt:houseAlice,fishArt:fish,frogArt:frog,letter:{owner:s.letterOwner,center,instances:1,bounds:{left:center[0]-18,top:center[1]-h/2,right:center[0]+18,bottom:center[1]+h/2}},aliceBounds:alice.bounds,walking:alice.walking,renderedPose:alice.renderedPose,fullSpriteOnly:true,uniformScale:alice.uniformScale};
  this.lastCourt={key,art};Object.assign(s,art);this.showCourt(s,frames);
 }
 showCourt(s,frames){const f=s.inForest?frames.forest:frames.house;this.framing={...f,lock:B,fits:true};this.cameras.main.setViewport(0,0,this.scale.width,this.scale.height).setZoom(f.z).centerOn(f.x,f.y);this.viewport={x:0,y:0,width:this.scale.width,height:this.scale.height};this.current=s;this.current.frames=frames;this.cameraReframing=s.beat===1&&s.t<3000;}
 diagnostics(){if(this.current?.scene!==5)return super.diagnostics();const s=this.current,w=this.scale.width,h=this.scale.height,project=(r,b,f,visible)=>{const p=(x,y)=>({x:(x-f.x)*f.z+w/2,y:(y-f.y)*f.z+h/2});return{...p(...r),head:p(r[0],b.top),world:{x:r[0],y:r[1]},visible,bounds:{left:p(b.left,b.top).x,top:p(b.left,b.top).y,right:p(b.right,b.bottom).x,bottom:p(b.right,b.bottom).y}};},actors={alice:project(s.alice,s.aliceBounds,this.framing,1)},required=['alice'];
  if(s.newOpacity>0){if(s.fishArt.visible){actors['fish-footman']=project(s.fish,s.fishArt.visibleBounds,s.frames.house,s.newOpacity);required.push('fish-footman');}actors['frog-footman']=project(s.frog,s.frogArt.bounds,s.frames.house,s.newOpacity);required.push('frog-footman');}
  return{width:w,height:h,environment:B,actors,requiredActors:required,props:s.newOpacity>0?{invitation:{...project(s.letter.center,s.letter.bounds,s.frames.house,s.newOpacity),owner:s.letterOwner}}:{},requiredProps:s.newOpacity>0?['invitation']:[],viewport:this.viewport,cameraReframing:this.cameraReframing,cameraTracking:null,landmarks:[],ambientTime:this.phase,s5:s};
 }
}
