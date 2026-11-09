// Opt-in locomotion: a fixed body-reference speed times the ground-depth scale.
// Integrate ds/scale exactly on each linear route/depth-curve segment. Existing
// stories without motion.actors retain their original engine timing untouched.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function depthScaleAt(knots,y){
 for(let i=1;i<knots.length;i++)if(y<=knots[i][0]){const a=knots[i-1],b=knots[i];return a[1]+(b[1]-a[1])*clamp((y-a[0])/(b[0]-a[0]),0,1);}
 return knots.at(-1)[1];
}
export function speedPath(points,spec){
 const knots=spec.scaleKnots;
 const bodyScale=spec.bodyScale??1;
 if(!Number.isFinite(bodyScale)||bodyScale<=0)throw Error('Invalid locomotion body scale');
 if(!['walk','run'].includes(spec.mode)||!Number.isFinite(spec.speed)||spec.speed<=0||!Array.isArray(knots)||knots.length<2||knots.some((p,i)=>p.length!==2||!p.every(Number.isFinite)||p[1]<=0||(i&&p[0]<=knots[i-1][0])))throw Error('Invalid constant locomotion profile');
 if(points.length<2||points.some(p=>![p.x,p.y].every(Number.isFinite)))throw Error('Invalid locomotion route');
 const legs=[];let distance=0;
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);if(!length)continue;
  const cuts=[0,...knots.map(p=>(p[0]-a.y)/dy).filter(t=>Number.isFinite(t)&&t>0&&t<1),1].sort((a,b)=>a-b);
  for(let j=1;j<cuts.length;j++){
   const l=cuts[j-1],r=cuts[j],from={x:a.x+dx*l,y:a.y+dy*l},to={x:a.x+dx*r,y:a.y+dy*r},size=length*(r-l),z0=depthScaleAt(knots,from.y),z1=depthScaleAt(knots,to.y),dz=z1-z0;
   const weight=Math.abs(dz)<1e-12?size/z0:size*Math.log1p(dz/z0)/dz;
   legs.push({from,to,length:size,z0,z1,start:distance,end:distance+weight,facing:Math.abs(dy)>Math.abs(dx)?(dy>0?'front':'back'):(dx>0?'right':'left')});distance+=weight;
  }
 }
 if(!legs.length)throw Error('A locomotion route must move');
 return{legs,distance,speed:spec.speed,bodyScale,mode:spec.mode,durationMs:distance/(spec.speed*bodyScale)*1000};
}
export function speedPosition(plan,fraction){
 const target=clamp(fraction,0,1)*plan.distance;
 let lo=0,hi=plan.legs.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(target<plan.legs[mid].end)hi=mid;else lo=mid+1;}
 const leg=plan.legs[lo],d=clamp(target-leg.start,0,leg.end-leg.start),dz=leg.z1-leg.z0;
 const t=clamp(Math.abs(dz)<1e-12?d*leg.z0/leg.length:leg.z0*Math.expm1(d*dz/leg.length)/dz,0,1);
 return{x:leg.from.x+(leg.to.x-leg.from.x)*t,y:leg.from.y+(leg.to.y-leg.from.y)*t,facing:leg.facing};
}
