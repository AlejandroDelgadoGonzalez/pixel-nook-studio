import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {compileStory} from '../../platform/reader/story-compiler.js';
import {ReaderEngine} from '../../platform/reader/engine.js';
import {videoSequence} from '../../platform/video/video-sequence.js';

const alice=compileStory(JSON.parse(await readFile(new URL('../../stories/alice-in-wonderland/chapters/chapter-01.json',import.meta.url),'utf8')));

test('approved closing hook exports once without changing reading data or authored scene count',()=>{
 const before=structuredClone(alice),sequence=videoSequence(alice,0);
 assert.deepEqual(alice,before);
 assert.equal(sequence.story.scenes.length,before.scenes.length);
 assert.equal(sequence.nextScene,null);
 assert.deepEqual(sequence.openingIds,[]);
 const closing=sequence.steps.filter(step=>sequence.closingIds.includes(step.id));
 assert.equal(closing.length,4);
 assert.equal(closing.reduce((sum,step)=>sum+step.duration,0),3000);
 assert(closing.every(step=>step.exportPhase==='preview'&&step.caption==='clear'));
 assert.equal(sequence.steps.at(-1).id,'alice-c1-s2-hook-torso');
 assert.equal(sequence.endingHoldMs,0);
 assert.equal(sequence.steps.at(-5).exportPhase,'fade');
});

test('reader and independent export reconstruct the same world throughout the closing hook',()=>{
 const sequence=videoSequence(alice,0);
 for(const id of sequence.closingIds)for(const fraction of [0,.25,.5,.99]){
  const reader=new ReaderEngine(alice),exporter=new ReaderEngine(sequence.story);
  reader.start(id);exporter.start(id);
  reader.tick(reader.step.duration*fraction);exporter.tick(exporter.step.duration*fraction);
  assert.deepEqual(exporter.model,reader.model);
  exporter.paused=true;const frozen=structuredClone(exporter.model);exporter.tick(500);
  assert.deepEqual(exporter.model,frozen);
 }
});

test('existing next-scene openings and final-scene holds retain their original export behavior',()=>{
 const story=compileStory({schemaVersion:1,id:'legacy-sequence-test',scenes:[
  {id:'one',steps:[{id:'one-text',type:'text',text:'First.'}]},
  {id:'two',steps:[{id:'two-open',type:'action',duration:700,effects:{}},{id:'two-text',type:'text',text:'Second.'},{id:'finish',type:'end'}]}
 ]});
 const first=videoSequence(story,0),last=videoSequence(story,1);
 assert.deepEqual(first.openingIds,['two-open']);
 assert.equal(first.nextScene,1);
 assert.equal(first.fadeMs,450);assert.equal(first.holdMs,900);assert.equal(first.endingHoldMs,800);
 assert.deepEqual(last.openingIds,[]);assert.equal(last.nextScene,null);assert.equal(last.holdMs,900);
});

test('incomplete or mistimed closing hooks are rejected rather than silently exported',()=>{
 for(const invalid of [{from:'missing'},{through:'alice-c1-s1-hook-turn'},{durationMs:2999}]){
  const story=structuredClone(alice);
  Object.assign(story.scenes[0].videoExport.closingHook,invalid);
  assert.throws(()=>videoSequence(story,0),/closing hook/i);
 }
});
