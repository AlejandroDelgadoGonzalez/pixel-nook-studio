import assert from 'node:assert/strict';

// An airborne reaching hand can be lower than the raised shoe. Validate the
// measured source pin rather than assuming the PNG's bottom is always a foot.
export function measuredOrigin(anchor){
 if(!anchor)return [.5,1];
 const b=anchor.sourceBoundsExclusive,p=anchor.sourceAnchor,o=anchor.origin;
 if(!Array.isArray(b)||b.length!==4||!Array.isArray(p)||p.length!==2||!Array.isArray(o)||o.length!==2||![...b,...p,...o].every(Number.isFinite)||b[2]<=b[0]||b[3]<=b[1])return null;
 const expected=[(p[0]-b[0])/(b[2]-b[0]),(p[1]-b[1])/(b[3]-b[1])];
 return expected.every((v,i)=>v>=0&&v<=1&&Math.abs(v-o[i])<1e-8)?expected:null;
}

// Opt in through diagnostics().depthScaling and authored motion.continuousActors.
// Physical actor scale is distinct from camera zoom; inspect both the model and
// the actual sprite rather than trusting diagnostic claims alone.
export async function check(page) {
 const result=await page.evaluate(originSource=>{
  const measuredOrigin=(0,eval)('('+originSource+')');
  const scene=qaScene,e=scene.reader,issues=[],actions=[];
  let issueCount=0;const addIssue=issue=>{issueCount++;if(issues.length<100)issues.push(issue);};
  scene.draw(0,true);
  const config=scene.diagnostics()?.depthScaling;
  if(!config)return{scope:'no authored depth-scaling contract',samples:0,actions:[],issues:[]};
  let samples=0;
  for(const action of e.story.steps.filter(s=>s.type==='action')){
   const pair=action.motion?.continuousActors||[],n=Math.max(20,Math.ceil(action.duration/20));
   let previous;
   const row={id:action.id,duration:action.duration,continuousActors:pair,samples:0,actorRanges:{}};
   for(let i=0;i<=n;i++){
    // Keep the final sample inside the action, avoiding automatic advancement.
    const fraction=i/n*(1-1e-7);e.start(action.id);e.paused=false;e.tick(action.duration*fraction);e.paused=true;
    e.onChange('back');scene.draw(0,true);scene.game.step(performance.now(),0);
    const d=scene.diagnostics(),current={};samples++;row.samples++;
    // Environments may have different measured terrain curves. A vertical
    // shaft changes height, not ground depth, and can lock a terrain scale.
    if(!d.depthScaling){
     if(pair.length||Object.keys(action.motion?.actors||{}).length)addIssue({kind:'declared-motion-missing-depth-contract',action:action.id});
     row.depthContract='not opted in for this location; specialized scene checks cover authored routes and anatomical scales';
     const frozen=JSON.stringify(e.model),time=e.totalTime;e.tick(37);scene.draw(0);if(JSON.stringify(e.model)!==frozen||e.totalTime!==time)addIssue({kind:'depth-pause-drift',action:action.id,fraction});
     continue;
    }
    const {curve,actorReferenceY,actorGain={},lockedScaleByActor={},bodyScaleByActor={}}=d.depthScaling;
    const at=y=>{if(curve.knots){const k=curve.knots;for(let i=1;i<k.length;i++)if(y<=k[i][0]){const a=k[i-1],b=k[i],p=Math.max(0,Math.min(1,(y-a[0])/(b[0]-a[0])));return a[1]+(b[1]-a[1])*p;}return k.at(-1)[1];}return Math.max(curve.minScale,Math.min(curve.maxScale,curve.referenceScale+(y-curve.referenceY)*curve.slopePerWorldY));};
    for(const[id,ref]of Object.entries(actorReferenceY)){
     const body=bodyScaleByActor[id],factor=body?body.statePath.reduce((v,k)=>v?.[k],e.model):1;if(!Number.isFinite(factor)||factor<=0||body&&Math.abs(body.value-factor)>1e-9)addIssue({kind:'invalid-body-scale',id,action:action.id});
     const actor=e.model.actors[id],sprite=scene.people[id].actor,resolution=sprite.texture.key.startsWith('alice-camera-detail-')?(scene.cameraDetail?.[id]?.resolution||1):1,expected=(lockedScaleByActor[id]??at(actor.y)/at(ref)*(actorGain[id]??1))*factor,actual=sprite.scaleX*resolution;
     if(!Number.isFinite(actual)||Math.abs(actual-expected)>1e-8||Math.abs(sprite.scaleY*resolution-expected)>1e-8||Math.abs(d.actors[id].scale-expected)>1e-8)addIssue({kind:'depth-scale-mismatch',id,action:action.id,fraction,y:actor.y,expected,actual});
     current[id]={x:actor.x,y:actor.y,scale:actual,terrainScale:actual/factor};
     const origin=measuredOrigin(d.depthScaling.anchorByActor?.[id]);
     if(!origin||Math.abs(sprite.originX-origin[0])>1e-8||Math.abs(sprite.originY-origin[1])>1e-8||Math.abs(sprite.x-Math.round(actor.x/2)*2)>1e-8||Math.abs(sprite.y-Math.round(actor.y/2)*2)>1e-8)addIssue({kind:'foot-anchor-depth-drift',id,action:action.id,fraction});
     const range=row.actorRanges[id]||={minY:actor.y,maxY:actor.y,minScale:actual,maxScale:actual};
     range.minY=Math.min(range.minY,actor.y);range.maxY=Math.max(range.maxY,actor.y);range.minScale=Math.min(range.minScale,actual);range.maxScale=Math.max(range.maxScale,actual);
     if(previous?.[id]){const dy=actor.y-previous[id].y,ds=actual/factor-previous[id].terrainScale;if(dy*ds<-1e-9)addIssue({kind:'scale-opposes-depth',id,action:action.id,fraction});if(Math.abs(dy)<1e-9&&Math.abs(ds)>1e-8)addIssue({kind:'pose-scale-reset',id,action:action.id,fraction});}
     const shadow=scene.people[id].shadow;if(Math.abs(shadow.scaleX-expected)>1e-8)addIssue({kind:'shadow-depth-mismatch',id,action:action.id,fraction});
    }
    for(const[id,p]of Object.entries(d.props||{}))if(p.owner&&p.visible){const sprite=scene.objects?.[id],owner=current[p.owner],physical=d.depthScaling.propScaleById?.[id],expected=physical??owner?.scale;if(sprite&&(!Number.isFinite(expected)||expected<=0||Math.abs(sprite.scaleX-expected)>1e-8||Math.abs(sprite.scaleY-expected)>1e-8))addIssue({kind:'prop-depth-mismatch',id,action:action.id,fraction});}
    if(previous&&pair.length)for(const id of pair)if(Math.hypot(current[id].x-previous[id].x,current[id].y-previous[id].y)<1e-7)addIssue({kind:'paired-walker-paused',id,action:action.id,fraction});
    const frozen=JSON.stringify(e.model),time=e.totalTime;e.tick(37);scene.draw(0);if(JSON.stringify(e.model)!==frozen||e.totalTime!==time)addIssue({kind:'depth-pause-drift',action:action.id,fraction});
    previous=current;
   }
   actions.push(row);
  }
  return{scope:'authored measured depth and continuous simultaneous motion',samples,actions,issues,issueCount};
 },measuredOrigin.toString());
 assert.deepEqual(result.issues,[]);return result;
}
