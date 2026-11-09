import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {compileStory} from '../../platform/reader/story-compiler.js';
import {ReaderEngine} from '../../platform/reader/engine.js';

const story=compileStory(JSON.parse(await readFile(new URL('../../stories/alice-in-wonderland/chapters/chapter-01.json',import.meta.url),'utf8')));
test('watch is consulted before the dependent line and stays visible through Alice response',()=>{
 const steps=story.steps,index=id=>steps.findIndex(s=>s.id===id);
 const extract=index('alice-c1-s1-watch-extract'),late=steps.findIndex(s=>s.text==="Oh dear! I shall be late! I'm late!"),question=steps.findIndex(s=>s.text==='What could a rabbit be late for?');
 assert(extract>=0&&late>extract);assert.equal(question,late+1);
 for(const i of [late,question]){const e=new ReaderEngine(story);e.start(steps[i].id);assert.equal(e.model.watch.visible,1);assert.equal(e.model.staging.rabbit,'consult');assert.equal(e.model.actors['white-rabbit'].x,990);assert.equal(e.model.actors['white-rabbit'].y,452);}
 assert.equal(steps[index('alice-c1-s1-rabbit-arrive')].duration,3100);
 assert.equal(steps[index('alice-c1-s1-rabbit-emerge')].duration,2000);
});
test('authored paired travel advances both actors at every 10 ms interval without alternating turns',()=>{
 const pairActions=story.steps.filter(s=>s.motion?.continuousActors?.length);
 assert(pairActions.length>=1,'continuous pair contract must be authored');
 for(const action of pairActions){
  const e=new ReaderEngine(story);e.start(action.id);let before=structuredClone(e.model.actors);
  const n=Math.ceil(action.duration/10),dt=action.duration/n;
  for(let i=1;i<n;i++){e.tick(dt);for(const id of action.motion.continuousActors){const a=e.model.actors[id],b=before[id];assert(Math.hypot(a.x-b.x,a.y-b.y)>1e-7,`${action.id} ${id} stopped inside paired travel at ${i*dt}ms`);}before=structuredClone(e.model.actors);}
 }
});
test('joining the path transitions immediately to one paired trip ending at the shared call stop',()=>{
 const join=story.steps.findIndex(s=>s.id==='alice-c1-s2-alice-join'),call=story.steps.findIndex(s=>s.id==='alice-c1-s2-call');
 const between=story.steps.slice(join+1,call);
 assert.equal(between.length,2,'only the paired trip and the common stop may occur before the line');
 assert.deepEqual([...between[0].motion.continuousActors].sort(),['alice','white-rabbit']);
 for(const id of ['alice','white-rabbit']){assert.equal(between[0].effects.actors[id].pose,'walk');assert.equal(between[1].effects.actors[id].pose,'idle');}
 const e=new ReaderEngine(story);e.start(story.steps[join].id);e.tick(e.step.duration);
 assert.equal(e.step.id,between[0].id);assert.equal(e.elapsed,0);
 for(const id of ['alice','white-rabbit'])assert.equal(e.model.actors[id].pose,'walk');
});
