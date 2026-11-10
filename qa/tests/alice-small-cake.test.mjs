import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {compileStory} from '../../platform/reader/story-compiler.js';
import {ReaderEngine} from '../../platform/reader/engine.js';
import {resolveSavedPassage} from '../../platform/storage/compatibility.js';
const raw=JSON.parse(fs.readFileSync('stories/alice-in-wonderland/chapters/chapter-02.json','utf8')),story=compileStory(raw);
test('S6 flows directly into S7 and preserves the retired terminal passage',()=>{
 const e=new ReaderEngine(story);e.setAuto(true);e.start('alice-c2-bill-24');e.tick(e.step.readingDurationMs);
 assert.equal(e.running,true);assert.equal(e.step.id,'alice-c2-cake-02');assert.equal(e.step.sceneIndex,6);
 assert.equal(resolveSavedPassage(story,'alice-c2-bill-end'),'alice-c2-bill-24');
 assert.deepEqual(story.steps.filter(s=>s.type==='end').map(s=>s.id),['alice-c2-cake-end']);
});
test('shrinking is silent, ends at each supported size and remains reconstructible',()=>{
 const e=new ReaderEngine(story);for(const [id,size]of [['alice-c2-cake-06',.72],['alice-c2-cake-08',.48],['alice-c2-cake-10',.32]]){
  e.start(id);const feet=[e.model.actors.alice.x,e.model.actors.alice.y];assert.equal(e.step.caption,'clear');assert.equal(e.step.type,'action');assert.equal(e.advance(10000),false);
  e.tick(e.step.duration);assert.equal(e.model.cake.size,size);assert.equal(e.model.large.size,size);assert.deepEqual([e.model.actors.alice.x,e.model.actors.alice.y],feet);
  const reconstructed=new ReaderEngine(story);reconstructed.start(e.step.id);assert.deepEqual(reconstructed.model.cake,e.model.cake);
 }
});
test('doorway transition establishes the exterior before fading Alice back in',()=>{
 const e=new ReaderEngine(story);e.start('alice-c2-cake-14-threshold');e.tick(e.step.duration);
 assert.equal(e.step.id,'alice-c2-cake-15');assert.equal(e.model.environment,'rabbit-house');assert.equal(e.model.actors.alice.visible,0);
 e.tick(e.step.duration);assert.equal(e.step.id,'alice-c2-cake-16-emerge');e.tick(1000);assert(e.model.actors.alice.visible>0&&e.model.actors.alice.visible<1);
 e.start('alice-c2-cake-end');assert.equal(e.model.cake.size,.32);assert.equal(e.model.cake.consumed,true);assert.deepEqual([e.model.actors.alice.x,e.model.actors.alice.y],[260,760]);
});
