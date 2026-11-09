import assert from 'node:assert/strict';
import {ReaderEngine} from '../../platform/reader/engine.js';

// Independent numerical reference. This deliberately does not import the
// engine's logarithmic/exponential locomotion implementation.
function scale(knots,y){for(let i=1;i<knots.length;i++)if(y<=knots[i][0]){const a=knots[i-1],b=knots[i],t=Math.max(0,Math.min(1,(y-a[0])/(b[0]-a[0])));return a[1]+(b[1]-a[1])*t;}return knots.at(-1)[1];}
function weight(a,b,knots){const length=Math.hypot(b.x-a.x,b.y-a.y),cuts=[0,...knots.map(p=>(p[0]-a.y)/(b.y-a.y)).filter(t=>Number.isFinite(t)&&t>0&&t<1),1].sort((a,b)=>a-b);let integral=0;
 for(let i=1;i<cuts.length;i++){const l=cuts[i-1],r=cuts[i],n=64,h=(r-l)/n;let sum=0;for(let j=0;j<=n;j++)sum+=(j===0||j===n?1:j%2?4:2)/scale(knots,a.y+(b.y-a.y)*(l+j*h));integral+=sum*h/3;}
 return length*integral;
}
export function check(cases){const rows=[],profiles=new Map();let samples=0,maxSpeedError=0;
 for(const {slug,story}of cases)for(const[index,scene]of story.scenes.entries()){
  if(!scene.locomotion)continue;
  for(const[environment,actors]of [[scene.locomotionEnvironment||'default',scene.locomotion],...Object.entries(scene.locomotionByEnvironment||{})])for(const[actor,profile]of Object.entries(actors)){assert.deepEqual(Object.keys(profile).sort(),['runSpeed','walkSpeed']);assert(profile.walkSpeed>0&&profile.runSpeed>profile.walkSpeed,actor+' needs exactly two positive speed modes');const key=slug+'/'+environment+'/'+actor;if(profiles.has(key))assert.deepEqual(profile,profiles.get(key),'A character/environment must keep its two speeds');else profiles.set(key,profile);}
  const e=new ReaderEngine(story);
  for(const raw of story.steps.filter(s=>s.sceneIndex===index&&(s.type==='action'||s.during?.motion))){const step=raw.during?{...raw,...raw.during}:raw;for(const[actor,route]of Object.entries(step.paths||{})){
   e.start(step.id);const a=e.startModel.actors[actor],points=[{x:a.x,y:a.y},...route],distance=points.slice(1).reduce((v,p,i)=>v+Math.hypot(p.x-points[i].x,p.y-points[i].y),0);if(distance<1e-8)continue;
   const spec=step.motion?.actors?.[actor];assert(spec,'Missing constant-speed contract: '+step.id);assert(['walk','run'].includes(spec.mode));const environment=e.startModel.environment,profile=scene.locomotionByEnvironment?.[environment]?.[actor]||scene.locomotion[actor],body=spec.bodyScale??1;assert.equal(spec.speed,profile[spec.mode+'Speed']);assert(Number.isFinite(body)&&body>0);if(spec.bodyScalePath)assert.equal(body,spec.bodyScalePath.reduce((v,k)=>v[k],e.startModel),'Locomotion must match durable body size');
   const weights=points.slice(1).map((b,i)=>weight(points[i],b,spec.scaleKnots)),expectedMs=weights.reduce((a,b)=>a+b,0)/(spec.speed*body)*1000;assert(Math.abs(expectedMs-step.duration)<.001,'Duration differs from independent integral: '+step.id);
   const sampledIndex=e.index,sampledModel=structuredClone(e.model);
   // Reuse the exact prepared speed plans; saved reconstruction is separately audited.
   const at=ms=>{e.index=sampledIndex;e.model=structuredClone(sampledModel);e.elapsed=0;e.running=true;e.paused=false;e.tick(ms+(step.delayMs||0));return structuredClone(e.model.actors[actor]);};let cursor=0,error=0;
   for(const [legIndex,w]of weights.entries()){const ms=w/(spec.speed*body)*1000;if(ms<1e-8)continue;
    for(const fraction of [.001,.1,.5,.9,.999]){const t=cursor+ms*fraction,dt=Math.min(.01,ms*.0001),l=at(t-dt),r=at(t+dt),m=at(t),actual=Math.hypot(r.x-l.x,r.y-l.y)/(2*dt/1000)/scale(spec.scaleKnots,m.y)/body,delta=Math.abs(actual-spec.speed);const a=points[legIndex],b=points[legIndex+1],dx=b.x-a.x,dy=b.y-a.y,expectedFacing=Math.abs(dy)>Math.abs(dx)?(dy<0?'back':'front'):(dx<0?'left':'right');assert.equal(m.facing,expectedFacing,'45degree sprite facing mismatch: '+step.id);error=Math.max(error,delta);samples++;assert(delta<.001,'Acceleration/deceleration or waypoint pause: '+step.id+' '+actual+' vs '+spec.speed);}
    cursor+=ms;
   }
   maxSpeedError=Math.max(maxSpeedError,error);rows.push({story:slug,scene:index+1,id:step.id,actor,mode:spec.mode,referencePxPerSecond:spec.speed,bodyScale:body,environment,durationMs:step.duration,maximumReferenceSpeedError:error});
  }
 }
 }
 return{scope:'Exactly two speed modes per opted-in actor; independent Simpson duration and actual engine derivative on every route leg, including both sides of corners and45degree-facing classification',samples,maximumReferenceSpeedError:maxSpeedError,actions:rows};
}
