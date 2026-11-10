// Export-only edits. The reader's story, steps and checkpoints stay untouched.
export function videoSequence(story, selected) {
 if(!story.scenes[selected])throw new Error('Unknown scene');
 const chapter={...story.scenes[selected],steps:story.steps.filter(s=>s.sceneIndex===selected)};
 const options=story.videoExport||{},next=story.scenes[selected+1];
 const opening=[];
 // Reuse real opening actions, stopping before any of the next scene's prose.
 for(const step of next?story.steps.filter(s=>s.sceneIndex===selected+1):[]){
  if(step.type!=='action')break;
  opening.push(step);
  if(step.id===next.videoExport?.openingThrough)break;
 }
 const fadeMs=options.captionFadeMs??450,holdMs=options.previewHoldMs??900;
 const sceneStart=story.steps.findIndex(s=>s.id===chapter.steps[0].id);
 let prefix=story.steps.slice(0,sceneStart),intro=[];
 const replay=chapter.videoExport?.openingReplay;
 let replayIds=[],replayDurationMs=0,logoHoldMs=0;
 if(replay){
  const from=story.steps.findIndex(s=>s.id===replay.from),through=story.steps.findIndex(s=>s.id===replay.through);
  const previous=story.scenes[selected-1]?.videoExport?.closingHook;
  if(from<0||through<from||through>=sceneStart||!previous||previous.from!==replay.from||previous.through!==replay.through||previous.durationMs!==replay.durationMs)throw Error('Invalid opening replay range');
  const actions=story.steps.slice(from,through+1);
  replayDurationMs=actions.reduce((sum,s)=>sum+s.duration,0);
  if(actions.some(s=>s.type!=='action'||s.sceneIndex!==selected-1)||!Number.isFinite(replayDurationMs)||replayDurationMs<=0||replayDurationMs!==replay.durationMs)throw Error('Invalid opening replay duration');
  // Reconstruct the world BEFORE the previous closing hook. The reader keeps
  // that hook only once; an independent export explicitly replays its source.
  prefix=story.steps.slice(0,from);
  replayIds=actions.map(s=>s.id);
  logoHoldMs=options.logo?.durationMs??options.logoDurationMs??3000;
  if(!Number.isFinite(logoHoldMs)||logoHoldMs<=0)throw Error('Invalid opening replay logo duration');
  intro=[{id:chapter.id+'-export-opening-logo',type:'action',duration:logoHoldMs,effects:{},sceneIndex:selected-1,caption:'clear',exportPhase:'logo'},
   ...actions.map(s=>({...s,caption:'clear',exportPhase:'openingReplay'}))];
 }
 const replayInfo={openingReplayIds:replayIds,openingReplayDurationMs:replayDurationMs,logoHoldMs};
 const body=[...intro,...chapter.steps.filter(s=>s.type!=='end')];
 const fade={id:chapter.id+'-export-fade',type:'action',duration:fadeMs,effects:{},sceneIndex:selected,exportPhase:'fade'};
 // An authored closing hook can already belong to the active scene. Export it
 // once, after its final caption fades, without inventing an unavailable scene.
 if(chapter.videoExport?.endAtLastBeat){
  const end={id:chapter.id+'-export-end',type:'end',sceneIndex:selected};
  return{story:{...story,steps:[...prefix,...body,fade,end]},startId:body[0].id,steps:[...body,fade],openingIds:[],closingIds:[],nextScene:null,fadeMs,holdMs:0,endingHoldMs:0,...replayInfo};
 }
 const closing=chapter.videoExport?.closingHook;
 if(closing){
  const from=body.findIndex(s=>s.id===closing.from),through=body.findIndex(s=>s.id===closing.through);
  if(from<0||through<from||through!==body.length-1)throw Error('Invalid closing hook range');
  const actions=body.slice(from,through+1);
  if(actions.some(s=>s.type!=='action'))throw Error('Closing hook must contain only actions');
  const duration=actions.reduce((sum,s)=>sum+s.duration,0);
  if(!Number.isFinite(duration)||duration<=0||duration!==closing.durationMs)throw Error('Invalid closing hook duration');
  const preview=actions.map(s=>({...s,exportPhase:'preview',caption:'clear'}));
  const steps=[...body.slice(0,from),fade,...preview];
  const end={id:chapter.id+'-export-end',type:'end',sceneIndex:selected,exportPhase:'preview'};
  return{story:{...story,steps:[...prefix,...steps,end]},startId:steps[0].id,
   steps,openingIds:[],closingIds:actions.map(s=>s.id),closingDurationMs:duration,
   nextScene:null,fadeMs,holdMs:0,endingHoldMs:0,...replayInfo};
 }
 const preview=opening.map(s=>({...s,sceneIndex:selected+1,exportPhase:'preview'}));
 const hold={id:chapter.id+'-export-hold',type:'action',duration:holdMs,effects:{},sceneIndex:opening.length?selected+1:selected,exportPhase:'preview'};
 const end={id:chapter.id+'-export-end',type:'end',sceneIndex:hold.sceneIndex,exportPhase:'preview'};
 return {story:{...story,steps:[...prefix,...body,fade,...preview,hold,end]},startId:body[0].id,
  steps:[...body,fade,...preview,hold],openingIds:opening.map(s=>s.id),nextScene:opening.length?selected+1:null,fadeMs,holdMs,endingHoldMs:800,...replayInfo};
}

export function videoDuration(story,steps){
 const t=story.timing||{},char=t.characterMs||27;
 return steps.reduce((sum,s)=>sum+(s.type==='action'?s.duration:s.type==='text'?(s.readingDurationMs??(s.text.length*char+Math.max(t.minimumHoldMs||1800,s.text.split(/\s+/).length*(t.wordMs||330)-s.text.length*char+(s.pauseMs??t.linePauseMs??1300)))):0),0);
}

export function logoOpacity(elapsed,duration=3000){
 const p=Math.max(0,Math.min(1,(elapsed-Math.min(500,duration*.2))/(duration-Math.min(500,duration*.2))));
 return 1-p*p*(3-2*p);
}
