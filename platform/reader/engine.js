import {speedPath,speedPosition} from './motion-speed.js';
const clone=x=>structuredClone(x);
function merge(target,values){for(const [k,v] of Object.entries(values||{})){if(v&&typeof v==='object')merge(target[k],v);else target[k]=v;}}
function tween(target,from,to,t){for(const[k,v]of Object.entries(to||{})){if(v&&typeof v==='object')tween(target[k],from[k],v,t);else if(typeof v==='number')target[k]=from[k]+(v-from[k])*t;else if(k!=='owner'||t===1)target[k]=v;}}
function timedLeg(points,t,knots){
 if(!knots)return null;
 if(knots.length!==points.length||knots[0]!==0||knots.at(-1)!==1||knots.some((v,i)=>!Number.isFinite(v)||(i&&v<=knots[i-1])))throw Error('Invalid path progress knots');
 const i=Math.min(points.length-2,Math.max(0,knots.findIndex((v,i)=>i>0&&t<=v)-1));
 return{index:i,fraction:Math.max(0,Math.min(1,(t-knots[i])/(knots[i+1]-knots[i])))};
}
function followPath(points,t,knots){const timed=timedLeg(points,t,knots);if(timed){const a=points[timed.index],b=points[timed.index+1];return{x:a.x+(b.x-a.x)*timed.fraction,y:a.y+(b.y-a.y)*timed.fraction};}const lengths=points.slice(1).map((p,i)=>Math.hypot(p.x-points[i].x,p.y-points[i].y));let distance=lengths.reduce((a,b)=>a+b,0)*t;for(let i=0;i<lengths.length;i++){if(distance<=lengths[i]||i===lengths.length-1){const f=lengths[i]?Math.min(1,distance/lengths[i]):1;return{x:points[i].x+(points[i+1].x-points[i].x)*f,y:points[i].y+(points[i+1].y-points[i].y)*f};}distance-=lengths[i];}return points.at(-1);}
function travelDirection(points,t,knots){
 const timed=timedLeg(points,t,knots);if(timed){const a=points[timed.index],b=points[timed.index+1],dx=b.x-a.x,dy=b.y-a.y;return Math.abs(dy)>Math.abs(dx)+.000001?dy>0?'front':'back':dx>0?'right':'left';}
 // Use the authored leg, not a difference between two interpolated samples.
 // Equal diagonals otherwise flicker between front and side through rounding.
 const lengths=points.slice(1).map((p,i)=>Math.hypot(p.x-points[i].x,p.y-points[i].y));let distance=lengths.reduce((a,b)=>a+b,0)*t;
 for(let i=0;i<lengths.length;i++){if(!lengths[i])continue;if(distance<=lengths[i]+.000001||i===lengths.length-1){const dx=points[i+1].x-points[i].x,dy=points[i+1].y-points[i].y;return Math.abs(dy)>Math.abs(dx)+.000001?dy>0?'front':'back':dx>0?'right':'left';}distance-=lengths[i];}
 return null;
}
function hasVisualMotion(from,to){for(const[k,v]of Object.entries(to||{})){if(v&&typeof v==='object'){if(hasVisualMotion(from?.[k],v))return true;}else if(typeof v==='number'&&['x','y','scale','scaleX','scaleY','size','magicScale','fold','zoom'].includes(k)&&v!==from?.[k])return true;}return false;}
export class ReaderEngine{
 constructor(story,onChange=()=>{}){this.story=story;this.onChange=onChange;this.model=clone(this.story.initialState||{actors:{},chapter:0});this.index=-1;this.running=false;this.paused=false;this.auto=false;this.elapsed=0;this.revealed=0;this.hold=0;this.history=[];this.totalTime=0;this.lastTap=-Infinity;this.transitionSerial=0;this.shotTransition=null;}
 get step(){return this.story.steps[this.index];}
 get visualMotionRemainingMs(){const s=this.step,d=s?.during;if(s?.type!=='text'||!d)return 0;const moving=d.lockUntilComplete||Object.keys(d.paths||{}).length||hasVisualMotion(this.concurrentFrom,d.effects);return moving?Math.max(0,(d.delayMs||0)+d.duration-this.elapsed):0;}
 get text(){return this.step?.text?.slice(0,this.revealed)||'';}
 orient(s){if(s.who){const a=this.model.actors[s.who],other=s.listener?this.model.actors[s.listener]:Object.entries(this.model.actors).find(([id,a])=>id!==s.who&&a.visible>.5)?.[1];if(!a||!other)return;a.facing=other.x<a.x?'left':'right';other.facing=a.x<other.x?'left':'right';if(s.mood)a.pose=s.mood;}}
 start(id,audioTime=0){this.model=clone(this.story.initialState||{actors:{},chapter:0});this.index=-1;this.boundaryPending=null;this.history=[];this.totalTime=audioTime;this.shotTransition=null;this.paused=false;this.running=true;this.lastTap=-Infinity;let n=Math.max(0,this.story.steps.findIndex(s=>s.id===id));for(let i=0;i<n;i++){const s=this.story.steps[i];if(s.type==='action')merge(this.model,s.effects);if(s.type==='text'){this.orient(s);if(s.during){merge(this.model,s.during.initial);merge(this.model,s.during.effects);}this.history.push(s.id);}}this.enter(n);}
 enter(n,bypass=false){if(this.step?.type==='text'&&this.step.during)merge(this.model,this.step.during.effects);const next=this.story.steps[n];if(!bypass&&this.sceneGate&&this.step&&next?.type!=='end'&&next?.sceneIndex!==this.step.sceneIndex){this.boundaryPending=n;this.paused=true;this.onChange('boundary');return;}this.boundaryPending=null;this.index=n;this.elapsed=0;this.revealed=0;this.hold=0;const s=this.step;if(s?.transition?.kind==='shot'){merge(this.model,s.effects);this.shotTransition={serial:++this.transitionSerial,id:s.id,time:this.totalTime,durationMs:s.transition.durationMs||700};}
 for(const[id,presence]of Object.entries(s?.presence||{}))if(presence.kind==='enter'&&presence.from&&this.model.actors[id].visible<.01)Object.assign(this.model.actors[id],presence.from);
 this.startModel=clone(this.model);this.speedPlans={};for(const[who,spec]of Object.entries(s?.motion?.actors||{})){const a=this.startModel.actors[who],route=s.paths?.[who];if(!route)throw Error('Constant locomotion requires a measured path');const plan=speedPath([{x:a.x,y:a.y},...route],spec);if(Math.abs(plan.durationMs-s.duration)>.001)throw Error('Locomotion duration must equal distance / speed: '+s.id);this.speedPlans[who]=plan;}for(const a of Object.values(this.model.actors))a.pose='idle';if(!s||s.type==='end'){this.running=false;this.onChange('end');return;}
 if(s.type==='text'){
  if(s.sceneIndex!==undefined)this.model.chapter=s.sceneIndex;
  this.orient(s);
  this.history.push(s.id);
  if(s.during){
   merge(this.model,s.during.initial);this.concurrentFrom=clone(this.model);this.concurrentPlans={};
   for(const[id,spec]of Object.entries(s.during.motion?.actors||{})){const a=this.model.actors[id];this.concurrentPlans[id]=speedPath([{x:a.x,y:a.y},...s.during.paths[id]],spec);if(Math.abs(this.concurrentPlans[id].durationMs-s.during.duration)>.001)throw Error('Concurrent locomotion duration mismatch');}
   for(const[id,a]of Object.entries(s.during.effects?.actors||{}))if(a.pose)this.model.actors[id].pose=a.pose;
  }
 }else {for(const[who,a]of Object.entries(s.effects.actors||{})){if(a.pose)this.model.actors[who].pose=a.pose;if(a.facing)this.model.actors[who].facing=a.facing;}
  for(const who of s.travelFacing||[]){const a=this.startModel.actors[who],end=s.effects.actors[who],points=[{x:a.x,y:a.y},...(s.paths?.[who]||[{x:end.x??a.x,y:end.y??a.y}])],facing=this.speedPlans[who]?speedPosition(this.speedPlans[who],0).facing:travelDirection(points,0,s.pathProgress?.[who]);if(facing)this.model.actors[who].facing=facing;}
 }
 this.onChange('step');}
 tick(dt){if(!this.running||this.paused||this.buffering)return;this.elapsed+=dt;this.totalTime+=dt;const s=this.step;
 if(s.type==='text'){if(s.during){const d=s.during,p=Math.max(0,Math.min(1,(this.elapsed-(d.delayMs||0))/d.duration));tween(this.model,this.concurrentFrom,d.effects,d.linear?p:p*p*(3-2*p));for(const[id,plan]of Object.entries(this.concurrentPlans))Object.assign(this.model.actors[id],speedPosition(plan,p));if(p===1)merge(this.model,d.effects);}if(s.readingDurationMs){this.revealed=Math.max(this.revealed,Math.min(s.text.length,Math.floor(this.elapsed/(this.story.timing?.characterMs||27))));if(this.auto&&this.elapsed>=s.readingDurationMs&&this.visualMotionRemainingMs===0)this.enter(this.index+1);return;}const timing=this.story.timing||{},charMs=timing.characterMs||27;this.revealed=Math.max(this.revealed,Math.min(s.text.length,Math.floor(this.elapsed/charMs)));if(this.revealed===s.text.length){this.hold+=dt;const wait=Math.max(timing.minimumHoldMs||1800,s.text.split(/\s+/).length*(timing.wordMs||330)-s.text.length*charMs+(s.pauseMs??timing.linePauseMs??1300));if(this.auto&&this.hold>=wait&&this.visualMotionRemainingMs===0)this.enter(this.index+1);}return;}
 const p=Math.min(1,this.elapsed/s.duration);tween(this.model,this.startModel,s.effects,s.linearMotion?p:p*p*(3-2*p));for(const[who,points]of Object.entries(s.paths||{}))Object.assign(this.model.actors[who],this.speedPlans[who]?speedPosition(this.speedPlans[who],p):followPath([{x:this.startModel.actors[who].x,y:this.startModel.actors[who].y},...points],p,s.pathProgress?.[who]));
 for(const who of s.travelFacing||[]){const a=this.startModel.actors[who],end=s.effects.actors[who],points=[{x:a.x,y:a.y},...(s.paths?.[who]||[{x:end.x??a.x,y:end.y??a.y}])],facing=this.speedPlans[who]?speedPosition(this.speedPlans[who],p).facing:travelDirection(points,p,s.pathProgress?.[who]);if(facing)this.model.actors[who].facing=facing;}
 for(const[id,presence]of Object.entries(s.presence||{})){if(!['enter','exit','loss'].includes(presence.kind))continue;const from=this.startModel.actors[id].visible,to=s.effects.actors?.[id]?.visible??from,fade=Math.min(s.duration,presence.fadeMs||350),t=Math.max(0,Math.min(1,(this.elapsed-(presence.kind==='enter'?0:s.duration-fade))/fade));this.model.actors[id].visible=from+(to-from)*t*t*(3-2*t);}
 if(p===1){merge(this.model,s.effects);this.enter(this.index+1);}}
 advance(now){if(!this.running||this.paused||this.buffering||this.step?.type!=='text'||now-this.lastTap<260)return false;if(this.revealed>=this.step.text.length&&this.visualMotionRemainingMs>0)return false;this.lastTap=now;
 if(this.revealed<this.step.text.length){this.revealed=this.step.text.length;this.elapsed=this.step.during?this.elapsed:this.revealed*(this.story.timing?.characterMs||27);this.hold=0;}
 else this.enter(this.index+1);return true;}
 seek(id){if(!this.story.steps.some(s=>s.id===id))return false;const paused=this.paused,time=this.totalTime;this.start(id,time);this.paused=paused;this.onChange('seek');return true;}
 previous(now){if(this.buffering||now-this.lastTap<300)return false;const limit=this.step?.type==='text'?this.index:this.index+1;const previous=this.story.steps.slice(0,limit).findLast(s=>s.type==='text');if(!previous)return false;const paused=this.paused,time=this.totalTime;this.start(previous.id,time);this.paused=paused;this.lastTap=now;this.onChange('back');return true;}
 setAuto(value){this.auto=value;this.hold=0;}
 continueScene(){if(this.boundaryPending===null||this.boundaryPending===undefined)return;const next=this.boundaryPending;this.paused=false;this.enter(next,true);}
 changeLanguage(change){const s=this.step,ratio=s?.text?this.revealed/s.text.length:0;change();if(s?.text){this.revealed=Math.ceil(s.text.length*ratio);this.elapsed=this.revealed*27;this.hold=0;}this.onChange('language');}
 checkpoint(){const id=this.step?.type==='text'?this.step.id:this.history.at(-1);return id?{v:2,line:id,auto:this.auto,audioTime:this.totalTime}:null;}
}
