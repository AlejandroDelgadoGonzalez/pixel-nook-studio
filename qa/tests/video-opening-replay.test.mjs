import test from 'node:test';
import assert from 'node:assert/strict';
import {compileStory} from '../../platform/reader/story-compiler.js';
import {ReaderEngine} from '../../platform/reader/engine.js';
import {videoSequence} from '../../platform/video/video-sequence.js';

function fixture(){return compileStory({schemaVersion:1,id:'replay-contract',initialState:{actors:{reader:{x:0,y:0,visible:1}},chapter:0,watch:'held',standing:0},scenes:[
 {id:'first',videoExport:{closingHook:{from:'pocket',through:'rise',durationMs:3000}},steps:[
  {id:'question',type:'text',text:'Where?'},
  {id:'pocket',type:'action',duration:1000,effects:{watch:'pocket'}},
  {id:'turn',type:'action',duration:700,effects:{actors:{reader:{x:2}}}},
  {id:'rise',type:'action',duration:1300,effects:{standing:1}}
 ]},
 {id:'second',videoExport:{openingReplay:{from:'pocket',through:'rise',durationMs:3000},closingHook:{from:'enter',through:'enter',durationMs:3000}},steps:[
  {id:'walk',type:'action',duration:1000,effects:{actors:{reader:{x:100}}}},
  {id:'reply',type:'text',text:'Wait, please!'},
  {id:'enter',type:'action',duration:3000,effects:{actors:{reader:{x:120}}}},
  {id:'end',type:'end'}
 ]}
]});}

test('independent replay holds pre-hook state for logo then repeats the real hook once',()=>{
 const story=fixture(),before=structuredClone(story),sequence=videoSequence(story,1);
 assert.deepEqual(story,before);
 assert.equal(sequence.logoHoldMs,3000);
 assert.deepEqual(sequence.openingReplayIds,['pocket','turn','rise']);
 assert.equal(sequence.openingReplayDurationMs,3000);
 assert.equal(sequence.steps[0].exportPhase,'logo');
 const exportEngine=new ReaderEngine(sequence.story);exportEngine.start(sequence.startId);
 assert.equal(exportEngine.model.watch,'held');assert.equal(exportEngine.model.standing,0);
 exportEngine.tick(3000);
 assert.equal(exportEngine.step.id,'pocket');assert.equal(exportEngine.model.watch,'held');
 assert.equal(sequence.steps.filter(s=>s.id==='rise').length,1);
 assert.equal(story.steps.filter(s=>s.id==='rise').length,1);
 assert.equal(story.scenes[1].steps[0].id,'walk');
});

test('replayed poses and pause reconstruct exactly the preceding closing actions',()=>{
 const story=fixture(),sequence=videoSequence(story,1);
 for(const id of sequence.openingReplayIds)for(const fraction of [0,.25,.5,.99]){
  const reader=new ReaderEngine(story),exporter=new ReaderEngine(sequence.story);
  reader.start(id);exporter.start(id);reader.tick(reader.step.duration*fraction);exporter.tick(exporter.step.duration*fraction);
  assert.deepEqual(exporter.model,reader.model);
  exporter.paused=true;const frozen=structuredClone(exporter.model);exporter.tick(900);assert.deepEqual(exporter.model,frozen);
 }
});

test('replay cannot silently substitute a different range or timing',()=>{
 for(const change of [{from:'question'},{through:'turn'},{durationMs:2999}]){
  const story=fixture();Object.assign(story.scenes[1].videoExport.openingReplay,change);
  assert.throws(()=>videoSequence(story,1),/opening replay/i);
 }
});
