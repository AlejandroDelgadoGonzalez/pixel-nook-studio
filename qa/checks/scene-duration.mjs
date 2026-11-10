import assert from 'node:assert/strict';
import {videoDuration,videoSequence} from '../../platform/video/video-sequence.js';
import {ReaderEngine} from '../../platform/reader/engine.js';

// Legacy stories keep their approved timing until an authorized restructure.
export function check(cases){
 const rows=[];
 for(const {slug,story,manifest} of cases){
  const policy=story.sceneDurationPolicy;
  if(!policy){assert(!manifest?.stageGeometry||manifest.migratedGeometry,`${slug}: new measured stories must declare sceneDurationPolicy`);continue;}
  for(const [index,scene] of story.scenes.entries()){
   const steps=story.steps.filter(s=>s.sceneIndex===index),sequence=videoSequence(story,index);
   const automaticMs=videoDuration(story,steps),exportMs=videoDuration(story,sequence.steps)+(sequence.endingHoldMs||0);
   assert.equal(policy.measurement,'automatic-only','Scene duration must be measured only in automatic reading');
   assert.deepEqual(policy.idealRangeMs,[60000,80000]);
   assert.deepEqual(policy.automaticRangeMs,[55000,85000]);
   assert.equal(policy.exportDurationGate,false,'MP4 duration cannot gate acceptance');
   assert.equal(policy.preserveValidTiming,true,'Valid automatic timing must retain natural pauses');
   const revision=scene.durationReview?.phase==='revision';
   if(revision){assert(scene.durationReview.authorization?.date&&scene.durationReview.authorization?.reason,'Revision timing needs explicit user authorization');assert.equal(scene.durationReview.preserveTextAndPauses,true);}
   else assert(automaticMs>=55000&&automaticMs<=85000,`${slug}/${scene.name} automatic: ${automaticMs}ms outside 55000–85000ms`);
   const engine=new ReaderEngine(story);engine.setAuto(true);engine.start(steps[0].id);let ticks=0;
   while(engine.running&&engine.step.sceneIndex===index){assert(++ticks<=(revision?Math.ceil(automaticMs)+steps.length+5:85000),'Automatic playback exceeded its authored budget');engine.tick(1);}
   if(!revision)assert(engine.totalTime>=55000&&engine.totalTime<=85000,'Actual automatic engine outside55–85s');
   assert(Math.abs(engine.totalTime-automaticMs)<=steps.length+5,'Duration budget must match actual automatic engine timing');
   if(scene.videoExport?.endAtLastBeat){
    assert(revision,'Ending on dialogue requires an explicitly authorized revision');
    assert.equal(steps.at(-1).type,'text');assert.equal(sequence.nextScene,null);assert.equal(sequence.holdMs,0);assert.deepEqual(sequence.closingIds,[]);
   }else if(index===story.scenes.length-1&&!scene.videoExport?.closingHook&&steps.at(-1)?.type==='end'){
    assert.equal(sequence.nextScene,null,'Terminal scene must retain its own final setting');assert(steps.some(s=>s.type==='text'));assert(sequence.holdMs>=0);
   }else assert.equal(sequence.closingDurationMs,3000,'Every scene ends in its authored 3-second hook');
   rows.push({story:slug,scene:index+1,name:scene.name,phase:revision?'authorized-revision':'initial-creation',durationRangeGated:!revision,automaticMs,automaticEngineMs:engine.totalTime,exportNominalMs:exportMs,clockQuantumMs:1});
  }
 }
 return{policy:'Initial creation only: automatic55–85s, ideal60–80s. Authorized corrections preserve all dialogue/pauses and report their new duration without a range gate. MP4 duration is informational.',scenes:rows};
}
