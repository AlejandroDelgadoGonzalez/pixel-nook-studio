import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {compileStory} from '../../platform/reader/story-compiler.js';
import {ReaderEngine} from '../../platform/reader/engine.js';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const data=read('stories/alice-in-wonderland/chapters/chapter-01.json'),story=compileStory(data),scene=story.scenes[4];
const geometry=read('stories/alice-in-wonderland/shared/chapter-1-scene-5-geometry.json');
test('Eat Me inherits the exact small Alice, open box and resting objects from Drink Me',()=>{
 const e=new ReaderEngine(story);e.sceneGate=false;e.start('alice-c1-eat-inherit');
 assert.equal(e.model.drink.magicScale,.32);assert.equal(e.model.hall.key.owner,null);
 assert.deepEqual([e.model.actors.alice.x,e.model.actors.alice.y],[1750,1396]);
 assert.equal(e.model.eat.cake.owner,'box');
});
test('cake is consumed before growth, giant feet remain fixed, and key is returned before tears',()=>{
 const e=new ReaderEngine(story);e.start('alice-c1-eat-grow-first');assert.equal(e.model.eat.cake.owner,'consumed');
 for(const id of ['enough','key','door','garden','tears','steady','hook-hold']){
  e.start('alice-c1-eat-'+id);
  assert.deepEqual([e.model.actors.alice.x,e.model.actors.alice.y],geometry.anchors['S5-growth-key'].point);
  assert.equal(e.model.eat.cake.owner,'consumed');
 }
 e.start('alice-c1-eat-key');assert.equal(e.model.hall.key.owner,'alice');
 e.start('alice-c1-eat-cry');assert.equal(e.model.hall.key.owner,null);assert.equal(e.model.drink.magicScale,1.5);
});
test('silent three-second Rabbit hook stops left and preserves handoff props for S6',()=>{
 const start=scene.steps.findIndex(s=>s.id==='alice-c1-eat-hook-enter');
 const hook=scene.steps.slice(start).filter(s=>s.type!=='end');assert(hook.every(s=>s.type==='action'&&s.caption==='clear'));
 assert(Math.abs(hook.reduce((n,s)=>n+s.duration,0)-3000)<1e-8);
 const e=new ReaderEngine(story);e.start('alice-c1-pool-inherit');
 assert.deepEqual([e.model.actors['white-rabbit'].x,e.model.actors['white-rabbit'].y],[1520,1070]);
 assert.equal(e.model.actors['white-rabbit'].visible,1);assert.equal(e.model.eat.face,'left');
 assert.equal(e.model.eat.cryTime,5250);assert.equal(e.model.hall.key.owner,null);
 assert.equal(e.model.eat.cake.owner,'consumed');assert.equal(data.scenes.length,6);
 assert.equal(data.completion.scope,'chapter');assert.equal(data.scenes[5].steps.at(-1).id,'alice-c1-pool-end');
});
test('reconstructing each S5 passage reproduces chronological durable state',()=>{
 const e=new ReaderEngine(story);e.sceneGate=false;e.start('alice-c1-eat-inherit');let count=0;
 while(e.running&&e.step.sceneIndex===4){if(e.step.type==='action')e.tick(e.step.duration);else if(e.step.type==='text'){
  const restored=new ReaderEngine(story);restored.start(e.step.id);assert.deepEqual(restored.model,e.model,e.step.id);
  count++;e.revealed=e.step.text.length;e.advance(count*2000);
 }else break;}
 assert.equal(count,9);
});
