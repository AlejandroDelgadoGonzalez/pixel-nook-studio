import {bindCompactAtlas,nativeAtlasFrame} from '../../../platform/rendering/compact-atlas.js';
import {VeryLargePuppy} from './very-large-puppy.js';
import {createPixelWalkFrames} from '../../../platform/rendering/character-art.js';
const ROOT='/stories/alice-in-wonderland/',P='alice-c3-s1';
const g=await fetch(ROOT+'shared/chapter-3-scene-1-geometry.json').then(r=>r.json());
const old=await fetch(ROOT+'shared/chapter-2-scene-8-geometry.json').then(r=>r.json());
const previous=await fetch(ROOT+'chapters/chapter-02.json').then(r=>r.json());
const clamp=v=>Math.max(0,Math.min(1,v)),smooth=v=>{const t=clamp(v);return t*t*(3-2*t);};
const mix=(a,b,t)=>a+(b-a)*t;
export class WhoAreYou extends Phaser.Scene{
 constructor(reader,ready){super(P);this.reader=reader;this.ready=ready;this.phase=0;}
 preload(){this.load.image(P+'-bg',ROOT+'assets/environments/moonlit-forest-c2-s8-v1.png');this.load.image(P+'-atlas',ROOT+'shared/caterpillar-master-atlas.png');this.load.image(P+'-alice',ROOT+'assets/atlases/alice-master-atlas.png');this.load.json(P+'-alice-meta',ROOT+'shared/alice-master-atlas.json');}
 create(){
  const meta=this.cache.json.get(P+'-alice-meta'),source=this.textures.get(P+'-alice').getSourceImage();bindCompactAtlas(source,meta);
  this.aliceCell=meta.poses.find(p=>p.pose==='back');this.aliceSource=nativeAtlasFrame(source,this.aliceCell.sourceBoundsExclusive).source;
  this.textures.addCanvas(P+'-alice-back',this.aliceSource);createPixelWalkFrames(this,P,'alice','back',4);
  this.surface=this.textures.createCanvas(P+'-surface',1664,936);this.background=this.add.image(0,0,P+'-surface').setOrigin(0).setDepth(-1000);this.environmentSurfaces=[this.background];
  this.portraits={alice:this.aliceSource.toDataURL(),caterpillar:this.crop('front-folded').toDataURL()};this.objects={};this.people={};this.draw();this.ready(this);
 }
 crop(name){const c=g.caterpillar.atlas.find(p=>p.id===name),b=c.sourceBoundsExclusive,out=document.createElement('canvas');out.width=b[2]-b[0];out.height=b[3]-b[1];out.getContext('2d').drawImage(this.textures.get(P+'-atlas').getSourceImage(),...b.slice(0,2),out.width,out.height,0,0,out.width,out.height);return out;}
 state(){const b=this.reader.step?.c3Beat||1,t=this.reader.elapsed||0;let root=g.anchors.climbHidden,mask=true,seated=b>2;
  if(b===2){const points=g.walkPaths.caterpillarCrest.waypoints;let u=clamp(t/4800)*3,i=Math.min(2,Math.floor(u)),f=u-i;root=points[i].map((v,k)=>mix(v,points[i+1][k],f));mask=u<2;seated=t>=4800;}
  if(seated){root=g.anchors.caterpillarSeat;mask=false;}
  const start=g.anchors.aliceInherited,end=g.anchors.aliceApproach;
  return {beat:b,elapsed:t,alice:b===1?start.map((v,i)=>mix(v,end[i],clamp(t/3000))):[...end],root,mask,seated,pose:seated?(b>=5||b===4&&t>=2500?'mouthpiece-low-right':'smoking-right'):'climb-carry-right'};
 }
 fit(state,entry=false){const w=this.scale.width,h=this.scale.height,rect=this.game.canvas.getBoundingClientRect(),panel=document.querySelector('#dialogue')?.getBoundingClientRect();
  const exportHost=this.game.canvas.closest('.export-render-host'),bottom=exportHost?(this.readingHeight||h*.68)+8:panel?(panel.top-rect.top)*h/rect.height-12:h*.68;
  const top=this.safeTopInset||24,groupTop=entry?220:288,groupBottom=g.anchors.aliceApproach[1]+1;
  const desired=w>=h?(entry?1:1.35)*w/1280:w/(entry?430:384),z=Math.max(w/1660,h/932,Math.min(desired,(bottom-top)/(groupBottom-groupTop)));
  let left=500-w/(2*z),up=444-(top+bottom)/(2*z);left=Math.max(2,Math.min(1662-w/z,left));up=Math.min(up,groupTop-top/z);up=Math.max(up,groupBottom-bottom/z);up=Math.max(2,Math.min(934-h/z,up));return{x:left+w/(2*z),y:up+h/(2*z),z};
 }
 inherited(){const proxy={scene:this,landscapeFrame:VeryLargePuppy.prototype.landscapeFrame};
  if(this.scale.width<this.scale.height)return VeryLargePuppy.prototype.fitFrame.call(proxy,old.cameras.finalX,646,true);
  const w=this.scale.width,h=this.scale.height,c=old.cameras.landscapeFocus,canvas=this.game.canvas.getBoundingClientRect(),panel=document.querySelector('#dialogue'),measure=document.querySelector('#measure'),text=document.querySelector('#text');
  const signature=[w,h,canvas.width,canvas.height,this.readingHeight].join(':');if(this.inheritedCache?.signature===signature)return this.inheritedCache.frame;
  let captionTop=h-200;
  if(panel&&measure&&text&&!this.game.canvas.closest('.export-render-host')){const before=measure.textContent,font=getComputedStyle(text),style=measure.getAttribute('style');measure.style.width=document.querySelector('#text-button').clientWidth+'px';measure.style.font=font.font;measure.style.lineHeight=font.lineHeight;let max=0;for(const scene of previous.scenes)for(const step of scene.steps)if(step.text){measure.textContent=typeof step.text==='string'?step.text:step.text.en;max=Math.max(max,measure.offsetHeight);}measure.textContent=before;if(style===null)measure.removeAttribute('style');else measure.setAttribute('style',style);const bottom=parseFloat(getComputedStyle(panel).bottom)||0;captionTop=(canvas.height-bottom-Math.ceil(max+118))*h/canvas.height;}
  else if(this.game.canvas.closest('.export-render-host'))captionTop=(this.readingHeight||h*.68)+20;
  const limit=captionTop-c.captionClearance,z=Math.max(w/1660,h/932,w/(c.puppyExclusionRight-2),Math.min(w/1280*c.finalZoom,(limit-c.topClearance)/(646-c.mushroomTop))),halfW=w/2/z,halfH=h/2/z;
  const x=Math.max(halfW+2,Math.min(1662-halfW,old.cameras.finalLandscapeX)),up=Math.min(646-limit/z,c.mushroomTop-c.minimumTopClearance/z),y=Math.max(halfH+2,Math.min(934-halfH,up+halfH)),frame={x,y,z};this.inheritedCache={signature,frame};return frame;
 }
 draw(){if(!this.surface)return;const s=this.state(),ctx=this.surface.context;ctx.clearRect(0,0,1664,936);ctx.imageSmoothingEnabled=false;const bg=this.textures.get(P+'-bg').getSourceImage();ctx.drawImage(bg,0,0);
  const c=g.caterpillar.atlas.find(p=>p.id===s.pose),b=c.sourceBoundsExclusive,local=c.contentBoundsInSourceCell,r=s.seated?g.caterpillar.rootSource:g.caterpillar.climbRootSource,scale=g.caterpillar.nativeScale;
  const x=s.root[0]-(r[0]-local[0])*scale,y=s.root[1]-(r[1]-local[1])*scale,cw=(b[2]-b[0])*scale,ch=(b[3]-b[1])*scale;
  ctx.drawImage(this.textures.get(P+'-atlas').getSourceImage(),b[0],b[1],b[2]-b[0],b[3]-b[1],x,y,cw,ch);
  if(s.mask){ctx.save();ctx.beginPath();g.occluders[0].polygon.forEach(([px,py],i)=>i?ctx.lineTo(px,py):ctx.moveTo(px,py));ctx.closePath();ctx.clip();ctx.drawImage(bg,0,0);ctx.restore();}
  const as=g.alice.nativeScale,[ax,ay]=g.alice.rootNative,ab={left:s.alice[0]-ax*as,top:s.alice[1]-ay*as,right:s.alice[0]+(this.aliceSource.width-ax)*as,bottom:s.alice[1]+(this.aliceSource.height-ay)*as};
  const walking=s.beat===1&&s.elapsed>0&&s.elapsed<3000,aliceImage=walking?this.textures.get(P+'-alice-walk-back-'+Math.floor(s.elapsed/180)%8).getSourceImage():this.aliceSource;
  ctx.drawImage(aliceImage,ab.left-(walking?24*as:0),ab.top,aliceImage.width*as,aliceImage.height*as);
  // A single subdued puff, entirely driven by the reader clock and frozen on pause.
  if(s.beat===4&&s.elapsed<2200){const u=clamp(s.elapsed/2200);ctx.globalAlpha=Math.sin(Math.PI*u)*.22;ctx.fillStyle='#c7d6dc';ctx.fillRect(506,318-u*14,2,4);ctx.fillRect(508,314-u*14,4,2);ctx.globalAlpha=1;}
  this.surface.refresh();let f=this.fit(s);if(s.beat===1)f=this.inherited();else if(s.beat===2){const a=this.inherited(),entry=this.fit(s,true),first=smooth(s.elapsed/1200);f=Object.fromEntries(['x','y','z'].map(k=>[k,mix(a[k],entry[k],first)]));if(s.elapsed>=4800){const u=smooth((s.elapsed-4800)/1200),end=this.fit(s);f=Object.fromEntries(['x','y','z'].map(k=>[k,mix(entry[k],end[k],u)]));}}
  this.framing={...f,lock:P,fits:true};this.cameras.main.setViewport(0,0,this.scale.width,this.scale.height).setZoom(f.z).centerOn(f.x,f.y);this.viewport={x:0,y:0,width:this.scale.width,height:this.scale.height};this.current={...s,aliceBounds:ab,caterpillarBounds:{left:x,top:y,right:x+cw,bottom:y+ch},hookahBase:s.seated?[525.6,369.6]:null};this.cameraReframing=s.beat===2;
 }
 update(_time,delta){const dt=Math.min(delta,100);this.reader.tick(dt);this.phase=this.reader.totalTime;if(this.reader.running&&!this.reader.paused&&!this.reader.buffering)this.onTick?.(dt);this.draw();}
 diagnostics(){const f=this.framing,w=this.scale.width,h=this.scale.height,s=this.current,project=(x,y)=>({x:(x-f.x)*f.z+w/2,y:(y-f.y)*f.z+h/2}),actor=(root,b,visible)=>({...project(...root),head:project(root[0],b.top),world:{x:root[0],y:root[1]},visible,bounds:{left:project(b.left,b.top).x,top:project(b.left,b.top).y,right:project(b.right,b.bottom).x,bottom:project(b.right,b.bottom).y}});
  return{width:w,height:h,environment:P,actors:{alice:actor(s.alice,s.aliceBounds,1),caterpillar:actor(s.root,s.caterpillarBounds,s.mask?0:1)},requiredActors:s.mask?['alice']:['alice','caterpillar'],props:{},requiredProps:[],viewport:this.viewport,cameraReframing:this.cameraReframing,cameraTracking:null,landmarks:[],ambientTime:this.phase,c3:s};}
}
