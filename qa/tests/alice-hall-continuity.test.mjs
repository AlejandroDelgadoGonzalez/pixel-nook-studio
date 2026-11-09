import fs from 'node:fs';import test from 'node:test';import assert from 'node:assert/strict';import{compileStory}from '../../platform/reader/story-compiler.js';import{ReaderEngine}from '../../platform/reader/engine.js';
const data=JSON.parse(fs.readFileSync('stories/alice-in-wonderland/chapters/chapter-01.json')),story=compileStory(data),steps=story.steps.filter(s=>s.sceneIndex===2);
test('S3 preserves natural breath, exact new dialogue and starts corridor with no old3s hold',()=>{
 for(const id of ['alice-c1-s5-safe','alice-c1-s5-choice'])assert.equal(steps.find(x=>x.id===id).pauseMs,undefined);
 const index=steps.findIndex(x=>x.id==='alice-c1-s5-choice');assert.equal(steps[index+1].id,'alice-c1-hall-corridor');assert(!steps.some(x=>['alice-c1-s5-hook-relax','alice-c1-s5-hook-breathe','alice-c1-s5-hook-hold'].includes(x.id)));
 assert.equal(steps.find(x=>x.id==='alice-c1-hall-key-question').text,'A little golden key! Which door could it open?');assert.equal(steps.find(x=>x.id==='alice-c1-hall-garden').text,'That is where I want to be, but I am far too big to get through.');
 const e=new ReaderEngine(story);e.setAuto(true);e.start('alice-c1-s5-choice');while(e.step.id==='alice-c1-s5-choice')e.tick(1);assert.equal(e.step.id,'alice-c1-hall-corridor');const old=e.model.actors.alice.x;e.tick(100);assert.notEqual(e.model.actors.alice.x,old);
});
test('S3 directly reverses its measured steep/shallow path with45degree facing and no backward detour',()=>{
 const g=JSON.parse(fs.readFileSync('stories/alice-in-wonderland/shared/chapter-1-scene-3-hall-geometry.json'));const facing=p=>p.slice(1).map((b,i)=>{const a=p[i],dx=b[0]-a[0],dy=b[1]-a[1];return Math.abs(dy)>Math.abs(dx)?dy<0?'back':'front':dx<0?'left':'right';});
 const a=g.walkPaths['table-to-curtain'].waypoints,b=g.walkPaths['return-key-to-table'].waypoints;assert.deepEqual(facing(a),['back','right']);assert.deepEqual(facing(b),['left','front']);assert.deepEqual(a[1],b[1]);assert(a[2][1]<a[1][1]&&a[1][1]<a[0][1]);assert(b[2][1]>b[1][1]&&b[1][1]>b[0][1]);assert(a[1][1]/2<g.positionRevision.glassTableSourceBounds[1]);
});

test('entire released chapter reaches every scene in order, manually and automatically',()=>{
 assert(story.scenes.slice(0,-1).every(s=>s.steps.every(t=>t.type!=='end')),'Only the final released scene may terminate the chapter');
 for(const auto of [false,true]){const e=new ReaderEngine(story);e.sceneGate=false;e.setAuto(auto);e.start();const visited=new Set();let guard=0;while(e.running){assert(++guard<2000);visited.add(e.step.sceneIndex);if(e.step.type==='action')e.tick(e.step.duration);else if(auto)e.tick(100000);else{e.revealed=e.step.text.length;if(e.visualMotionRemainingMs)e.tick(e.visualMotionRemainingMs);e.advance(guard*2000);}}assert.deepEqual([...visited],[0,1,2,3,4,5]);assert.equal(e.step.id,'alice-c1-pool-end');assert.equal(e.model.hall.key.owner,null);assert.equal(e.model.hall.door,0);assert.equal(e.history.length,story.steps.filter(s=>s.type==='text').length);}
});
test('S2 landing enters S3 directly in continuous mode and pauses only at the optional scene gate',()=>{
 for(const gated of [false,true]){const e=new ReaderEngine(story);e.sceneGate=gated;e.start('alice-c1-s4-hook-contact');for(const ms of [700,1150,1150])e.tick(ms);assert(e.running,'Landing must not end the delivered chapter');assert.deepEqual([e.model.actors.alice.x,e.model.actors.alice.y],[2160,3328]);if(gated){assert(e.paused);assert.equal(story.steps[e.boundaryPending].id,'alice-c1-s5-open');e.continueScene();}assert.equal(e.step.id,'alice-c1-s5-open');e.tick(1);assert.equal(e.step.id,'alice-c1-s5-rise');assert.equal(e.model.environment,'solid-ground');}
});
