import fs from'node:fs';import test from'node:test';import assert from'node:assert/strict';import{compileStory}from'../../platform/reader/story-compiler.js';import{ReaderEngine}from'../../platform/reader/engine.js';import{resolveSavedPassage}from'../../platform/storage/compatibility.js';
const data=JSON.parse(fs.readFileSync('stories/alice-in-wonderland/chapters/chapter-02.json')),story=compileStory(data);
test('only final available C2 scene terminates playback; manifest matches compiled chapter',()=>{assert(story.scenes.length>=5);for(const s of story.scenes.slice(0,-1))assert(!s.steps.some(t=>t.type==='end'),s.id);const m=JSON.parse(fs.readFileSync('stories/alice-in-wonderland/manifest.json'));assert.deepEqual(m.chapters.find(c=>c.id==='chapter-2').scenes,story.scenes.map(s=>s.name));assert.equal(resolveSavedPassage(story,'alice-c2-mary-end'),'alice-c2-large-04');});
test('S4 completes its doorway before the authorized full-shot interior change, and honors optional scene gate',()=>{
 const opening=story.steps.find(s=>s.id==='alice-c2-large-01');assert.deepEqual(opening.transition,{kind:'shot',durationMs:750});
 const source=story.steps.find(s=>s.id==='alice-c2-mary-hook-step').effects.actors.alice;
 assert.deepEqual([source.x,source.y,source.visible],[741.5447071705133,606.8286236740663,.9]);
 for(const sceneGate of[false,true]){
  const e=new ReaderEngine(story);e.sceneGate=sceneGate;e.start('alice-c2-mary-hook-step');e.tick(e.step.duration);
  if(sceneGate){assert.equal(e.boundaryPending,story.steps.findIndex(s=>s.id===opening.id));assert.deepEqual([e.model.actors.alice.x,e.model.actors.alice.y,e.model.actors.alice.visible],[source.x,source.y,source.visible]);e.continueScene();}
  assert(e.running);assert.equal(e.step.id,opening.id);assert.deepEqual([e.model.actors.alice.x,e.model.actors.alice.y,e.model.actors.alice.visible],[1100,666,0]);
  assert.equal(e.model.maryAnn.door,1);assert.equal(e.model.large.size,.32);assert.equal(e.shotTransition.durationMs,750);
  e.tick(750);assert.equal(e.step.id,'alice-c2-large-02');assert.equal(e.step.duration,400);assert.equal(e.model.actors.alice.visible,0);e.tick(400);assert.equal(e.step.id,'alice-c2-large-03-walk');assert.equal(e.step.presence.alice.fadeMs,400);
 }
});
