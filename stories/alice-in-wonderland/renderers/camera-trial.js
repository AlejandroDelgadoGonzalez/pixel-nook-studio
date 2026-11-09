import {drawCharacter} from '../../../platform/rendering/character-art.js';
import {hallRoomFrame} from './hall-room-frame.js';
const CONFIG='alice-camera-trial',clamp=t=>Math.max(0,Math.min(1,t)),smooth=t=>{t=clamp(t);return t*t*t*(t*(t*6-15)+10);};
const sceneNames={'c1-s4':'C1 · S4 · Drink Me','c1-s5':'C1 · S5 · Eat Me','c1-s6':'C1 · S6 · The Pool of Tears','c2-s1':'C2 · S1 · A Way Out'};
export const cameraPreset=name=>Object.fromEntries(Object.keys(sceneNames).map(id=>[id,name==='all'||name==='late'&&['c1-s6','c2-s1'].includes(id)]));

// Reversible camera/detail experiment expressly authorized by Alejandro.
// Shared measurements and the durable reading clock drive every frame.
export class AliceCameraTrial{
 static preload(s){s.load.json(CONFIG,'/stories/alice-in-wonderland/shared/camera-trial.json');}
 constructor(s){this.s=s;this.config=s.cache.json.get(CONFIG);this.raw=new Map();this.hd=new Map();this.state=null;this.modes=this.readModes();this.installControls();}
 readModes(){const c=this.config;let modes={...c.defaultModes};try{modes={...modes,...JSON.parse(localStorage.getItem(CONFIG+':'+c.revision)||'{}')};}catch{}const p=new URLSearchParams(location.search).get('camera');return ['all','late','original'].includes(p)?cameraPreset(p):modes;}
 installControls(){const s=this.s,menu=document.querySelector('#settings-modal');if(!menu||s.game.canvas.closest('.export-render-host'))return;
  document.querySelector('#alice-camera-preview')?.remove();const section=document.createElement('section');section.id='alice-camera-preview';section.className='export-settings';section.innerHTML='<h3>Camera preview</h3><label>Camera style <select aria-label="Camera preview" id="alice-camera-preset"><option value="all">Zoom in all four scenes</option><option value="late">Zoom only in S6 and A Way Out</option><option value="original">Original camera</option><option value="custom" disabled>Custom scenes</option></select></label><details><summary>Individual scenes</summary></details><p>You can change this preview at any time. Your reading progress stays the same.</p>';
  for(const[id,name]of Object.entries(sceneNames)){const label=document.createElement('label'),box=document.createElement('input');box.type='checkbox';box.dataset.cameraScene=id;label.append(document.createTextNode(name+' '),box);section.querySelector('details').append(label);box.onchange=()=>save({...this.modes,[id]:box.checked});}
  const paint=()=>{for(const box of section.querySelectorAll('input'))box.checked=!!this.modes[box.dataset.cameraScene];section.querySelector('select').value=['all','late','original'].find(p=>JSON.stringify(cameraPreset(p))===JSON.stringify(this.modes))||'custom';};
  const save=modes=>{this.modes=modes;try{localStorage.setItem(CONFIG+':'+this.config.revision,JSON.stringify(modes));}catch{}const url=new URL(location.href);url.searchParams.delete('camera');history.replaceState(null,'',url);paint();s.draw(0,true);};section.querySelector('select').onchange=e=>save(cameraPreset(e.target.value));menu.insertBefore(section,menu.querySelector('.menu-actions'));paint();
 }
 sceneID(){const e=this.s.reader;return e.model.company?'c2-s1':({3:'c1-s4',4:'c1-s5',5:'c1-s6'})[e.step?.sceneIndex];}
 focus([l,t,r,b],z){const s=this.s,w=s.scale.width,h=s.scale.height,top=Math.max(8,s.safeTopInset||0),bottom=Math.min(h-12,(s.readingHeight||h)+8),x=(l+r)/2+(s.safeCenterOffset||0)/z,y=(t+b)/2+(h/2-(top+bottom)/2)/z;
  return{x:Math.max((w/2+1)/z,Math.min(3328-(w/2+1)/z,x)),y:Math.max((h/2+1)/z,Math.min(1872-(h/2+1)/z,y)),z,fits:true,lock:'alice-camera-trial'};
 }
 follow(z){const a=this.s.reader.model.actors.alice,[l,t,r,b]=this.config.focus.aliceOffsets,c=this.config.followContext,bias=c?smooth((a.y-c.fromWorldY)/(c.throughWorldY-c.fromWorldY))*c.leftShiftWorld:0;return this.focus([a.x+l-bias,a.y+t,a.x+r-bias,a.y+b],z);}
 mix(a,b,q){return{x:a.x+(b.x-a.x)*q,y:a.y+(b.y-a.y)*q,z:a.z+(b.z-a.z)*q,fits:true,lock:'alice-camera-trial'};}
 frame(){const s=this.s,e=s.reader,c=this.config,id=this.sceneID(),base=hallRoomFrame(s),step=e.step,name=step?.id||'',steps=e.story.steps,index=e.index,at=key=>steps.findIndex(p=>p.id===key),z=base.z*c.zoomMultiplier;let f=base,moving=false;
  if(!this.modes[id])return{id,base,frame:f,active:false,moving};
  if(id==='c1-s4'&&index>=at('alice-c1-drink-to-door')){const q=name==='alice-c1-drink-to-door'?smooth(e.elapsed/c.zoomInMs):1;f=this.mix(base,this.follow(z),q);moving=step.type==='action';}
  if(id==='c1-s5'&&this.modes['c1-s4']){const growth=clamp((e.model.drink.magicScale-.32)/1.18);f=this.mix(this.follow(z),base,growth);moving=step.type==='action'&&growth<1;}
  if(id==='c1-s6'&&index>=at('alice-c1-pool-walk-to-water')){const q=name==='alice-c1-pool-walk-to-water'?smooth(e.elapsed/c.zoomInMs):1;f=this.mix(base,this.focus(c.focus.pool,z),q);moving=q<1;}
  if(id==='c2-s1'){const start=this.modes['c1-s6']?this.focus(c.focus.pool,z):base,walk=steps.filter(p=>p.id.startsWith('alice-c2-way-out-door-walk-')),first=steps.indexOf(walk[0]),last=steps.indexOf(walk.at(-1)),total=walk.reduce((n,p)=>n+p.duration,0),before=walk.filter(p=>steps.indexOf(p)<index).reduce((n,p)=>n+p.duration,0),q=index<first?0:index>last?1:smooth((before+e.elapsed)/total);f=this.mix(start,this.focus(c.focus.leftDoor,z),q);moving=q>0&&q<1;}
  if(id==='c2-s1'){const phase=step?.companyStage?.phase;if(['entry-view-in','entry','entry-view-out'].includes(phase)){const wide=this.focus([1440,1080,2050,1500],Math.min(z,s.scale.width/660)),close=this.focus(c.focus.pool,z);f=phase==='entry'?wide:this.mix(phase==='entry-view-in'?close:wide,phase==='entry-view-in'?wide:close,smooth(e.elapsed/2000));moving=phase!=='entry';}}
  return{id,base,frame:f,active:f!==base&&(f.z>base.z+1e-8||id==='c2-s1'&&['entry-view-in','entry','entry-view-out'].includes(step?.companyStage?.phase)),moving};
 }
 apply(){const s=this.s;if(!this.config||s.reader.model.environment!=='hall-of-doors')return;this.state=this.frame();const {frame:f,active,moving}=this.state;
  if(active){const w=s.scale.width,h=s.scale.height;s.framing=f;s.cameraSourceRect=[f.x-w/(2*f.z),f.y-h/(2*f.z),w/f.z,h/f.z];s.cameras.main.setViewport(0,0,w,h).setZoom(f.z).centerOn(f.x,f.y);s.cameraReframing=moving;s.cameraTracking=moving?{id:'alice-authorized-camera-trial',departingStationaryActors:[]}:null;if(this.state.id==='c1-s6'&&s.poolOfTears.mouse.visible&&s.poolOfTears.mouse.alpha>.1)s.people.mouse={actor:s.poolOfTears.mouse};}
  s.cameraDetail={};if(active||['c1-s6','c2-s1'].includes(this.state.id))for(const[id,person]of Object.entries(s.people))if(['alice','mouse','dodo','lory','eaglet'].includes(id)&&person.actor.visible&&person.actor.alpha>.1)this.detail(id,person.actor);
 }
 registerSources(){if(this.raw.size&&(!this.s.companyCells||this.companyRegistered))return;const s=this.s,add=(key,c,asset)=>{if(c?.sourceBoundsExclusive)this.raw.set(key,{...c,asset:c.asset||asset});};
  for(const p of s.cells.characters.alice.poses)add(s.normalized.alice[p.pose]?.key,p,s.reader.story.assets.alice);this.raw.set(s.normalized.alice.left.key,{...this.raw.get(s.normalized.alice.right.key),mirror:true});
  for(const owner of [s.hall,s.drinkMe,s.eatMe])for(const c of Object.values(owner.cells))if(c.human)add(owner.normalized[c.pose]?.key,{...c,mirror:c.pose==='box-open'});
  for(const c of Object.values(s.poolOfTears.cells))if(/^(collect-fan|fan-cheek|float-safe|swim-|mouse-)/.test(c.pose))add(s.poolOfTears.normalized[c.pose]?.key,c);
  for(const dir of ['front','back','left','right']){const owner=['front','back'].includes(dir)?s.hall:s.drinkMe,c=owner.cells[['front','back'].includes(dir)?'walk-'+dir:'examine-bottle'];add('drink-carry-alice-'+dir,{...c,mirror:dir==='right'});}
  if(s.companyCells){this.companyRegistered=true;for(const c of Object.values(s.companyCells))add(s.companyTextures[c.pose].key,c);for(const id of ['dodo','lory','eaglet'])for(const dir of ['front','back','right'])this.raw.set('alice-c2-company-'+id+'-'+dir,this.raw.get(s.companyTextures[id+'-'+dir+'-wet'].key));this.raw.set('alice-c2-company-mouse-right',this.raw.get(s.companyTextures['mouse-walk-0']?.key||s.poolOfTears.normalized['mouse-walk-0'].key));this.raw.set('alice-c2-company-mouse-back',this.raw.get(s.companyTextures['mouse-back'].key));}
 }
 texture(key){if(this.hd.has(key))return this.hd.get(key);this.registerSources();const s=this.s,R=this.config.detailResolution,normal=s.textures.get(key).getSourceImage(),hdKey='alice-camera-detail-'+key,match=key.match(/^(.*)-walk-(front|back|left|right)-(\d)$/);let source=this.raw.get(key),tex;
  if(match){const base=this.texture(match[1]+'-'+match[2]);if(!base)return null;const im=s.textures.get(base).getSourceImage(),w=im.width/R,h=im.height/R,leg=Math.round(h*.79/2)*2,split=Math.round(w/4)*2,stride=Math.sin(Number(match[3])*Math.PI/4),shift=Math.round(stride*3/2)*2;tex=s.textures.createCanvas(hdKey,normal.width*R,normal.height*R);const ctx=tex.context;ctx.imageSmoothingEnabled=false;ctx.drawImage(im,0,leg*R,split*R,(h-leg)*R,(6+shift)*R,(leg-Math.max(0,Math.round(stride)*2))*R,split*R,(h-leg)*R);ctx.drawImage(im,split*R,leg*R,(w-split)*R,(h-leg)*R,(6+split-shift)*R,(leg-Math.max(0,Math.round(-stride)*2))*R,(w-split)*R,(h-leg)*R);ctx.drawImage(im,0,0,w*R,(leg+2)*R,6*R,0,w*R,(leg+2)*R);
  }else if(source){const url=s.reader.story.assets[source.asset]||source.asset,i=Object.keys(this.config.sources).indexOf(url),raw=s.emptyJar.source(url),[l,t,r,b]=source.sourceBoundsExclusive;tex=s.textures.createCanvas(hdKey,normal.width*R,normal.height*R);if(source.mirror){tex.context.translate(tex.width,0);tex.context.scale(-1,1);}drawCharacter(tex.context,raw,l,t,r-l,b-t,tex.width,tex.height);
  }else return null;
  if(/(?:alice-c2-company-(?:dodo|lory|eaglet|mouse)|alice-pool-mouse)/.test(key)){
   const ctx=tex.context,mask=document.createElement('canvas');mask.width=tex.width;mask.height=tex.height;const m=mask.getContext('2d');
   for(const [u,v] of [[.48,.5],[.6,.61]]){const x=Math.round(tex.width*u/4)*4,y=Math.round(tex.height*v/4)*4;m.fillStyle='#07547a';m.fillRect(x,y,8,12);m.fillStyle='#59cfff';m.fillRect(x,y+4,8,8);m.fillStyle='#e2ffff';m.fillRect(x,y+4,4,4);}
   m.globalCompositeOperation='destination-in';m.drawImage(tex.getSourceImage(),0,0);ctx.drawImage(mask,0,0);
  }
  tex.refresh();this.hd.set(key,hdKey);return hdKey;
 }
 detail(id,p){const key=this.texture(p.texture.key);if(!key)return;const R=this.config.detailResolution,crop=p.isCropped?{...p._crop}:null,x=p.scaleX,y=p.scaleY;p.setTexture(key).setScale(x/R,y/R);if(crop)p.setCrop(crop.x*R,crop.y*R,crop.width*R,crop.height*R);this.s.cameraDetail[id]={resolution:R,logicalScale:x,sourceTexture:key.slice('alice-camera-detail-'.length)};}
 diagnostics(d){if(!this.state?.active&&!Object.keys(this.s.cameraDetail||{}).length)return d;for(const[id,person]of Object.entries(this.s.people)){const sprite=person.actor;if(d.actors[id]&&sprite.texture.key.startsWith('alice-camera-detail-')){d.actors[id].scale=sprite.scaleX*this.config.detailResolution;d.actors[id].textureResolution=this.config.detailResolution;}}
  const s=this.s,f=s.framing,w=s.scale.width,h=s.scale.height,project=(x,y)=>({x:(x-f.x)*f.z+w/2,y:(y-f.y)*f.z+h/2});
  for(const[id,person]of Object.entries(s.people))if(!d.actors[id]&&id==='mouse'){const p=person.actor,b=p.getBounds();d.actors[id]={...project(p.x,p.y),head:project(p.x,b.top),world:{x:p.x,y:p.y},visible:p.visible?p.alpha:0,scale:p.scaleX*(s.cameraDetail[id]?.resolution||1),bounds:{left:project(b.left,b.top).x,top:project(b.left,b.top).y,right:project(b.right,b.bottom).x,bottom:project(b.right,b.bottom).y}};if(p.visible&&p.alpha>.1&&d.actors[id].bounds.right>0)d.requiredActors.push(id);}
  if(s.reader.step?.id==='alice-c1-pool-mouse-enter')d.frameEntrances={...d.frameEntrances,mouse:{edge:'left',controller:'poolOfTears',path:'mouseToWater'}};
  if(this.state.active)d.requiredProps=(d.requiredProps||[]).filter(id=>d.props?.[id]?.owner);d.cameraReframing=this.state.moving;d.cameraTracking=s.cameraTracking;d.cameraTrial={...this.state,detail:s.cameraDetail};return d;
 }
}
