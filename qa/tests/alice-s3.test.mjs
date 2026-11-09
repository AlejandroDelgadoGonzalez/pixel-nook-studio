import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {ReaderEngine} from '../../platform/reader/engine.js';
import {compileStory} from '../../platform/reader/story-compiler.js';
import {videoSequence} from '../../platform/video/video-sequence.js';
const data=JSON.parse(await fs.readFile('stories/alice-in-wonderland/chapters/chapter-01.json','utf8')),story=compileStory(data);
const geometry=JSON.parse(await fs.readFile('stories/alice-in-wonderland/shared/scene-3-geometry.json','utf8'));
test('approved English credit and character role retain their UTF-8 punctuation',()=>{
 assert.equal(data.presentation.eyebrow,'LEWIS CARROLL \u00b7 AN ORIGINAL ABRIDGMENT');assert.equal(data.characters.sister.role,'Alice\u2019s sister');
});
test('continuous S2/S3 boundary retains the exact partial-entry state',()=>{
 const e=new ReaderEngine(story);e.start('alice-c1-s2-hook-torso');e.tick(950);
 assert.equal(e.step.id,'alice-c1-s3-finish-entry');assert.deepEqual([e.model.actors.alice.x,e.model.actors.alice.y],[1610,466]);assert.equal(e.model.staging.alice,'burrow-entry');assert.equal(e.model.environment,'riverbank');
 assert.deepEqual([e.model.actors.sister.x,e.model.actors.sister.y],[810,650]);assert.equal(e.model.book.owner,'sister');
});
test('whole-shot transition occurs only after the complete body has crossed the mouth',()=>{
 const c=geometry.exteriorContinuation,half=202*c.scale/2;assert(c.through[0]-half>1685);
 const e=new ReaderEngine(story);e.start('alice-c1-s3-finish-entry');e.tick(c.durationMs-1);assert.equal(e.model.environment,'riverbank');
 e.tick(1);assert.equal(e.step.id,'alice-c1-s3-entry-clear');assert.equal(e.model.environment,'riverbank');e.tick(140);assert.equal(e.step.id,'alice-c1-s3-interior');assert.equal(e.model.environment,'tunnel-well');assert(e.shotTransition);assert.equal(e.model.actors.alice.x,756);
});
test('S3 independent export holds S2 prehook state for logo then replays its exact three seconds',()=>{
 const sequence=videoSequence(story,1);assert.equal(sequence.logoHoldMs,3000);assert.equal(sequence.openingReplayDurationMs,3000);assert.equal(sequence.openingReplayIds.length,4);
 const e=new ReaderEngine(sequence.story);e.start(sequence.startId);assert.equal(e.step.exportPhase,'logo');const state=JSON.stringify(e.model);e.tick(2999);assert.equal(JSON.stringify(e.model),state);e.tick(1);assert.equal(e.step.id,'alice-c1-s2-hook-arrival');
 assert.deepEqual(sequence.openingReplayIds,story.scenes[0].steps.filter(s=>s.id.startsWith('alice-c1-s2-hook-')).map(s=>s.id));
});
test('internal shelf reveal remains exactly three seconds, keeps hands empty and reaches measured A5',()=>{
 const sequence=videoSequence(story,1);assert.equal(sequence.closingDurationMs,3000);assert.deepEqual(sequence.closingIds,['alice-c1-s4-hook-contact','alice-c1-s4-hook-compress','alice-c1-s4-hook-settle']);
 const e=new ReaderEngine(story);e.start('alice-c1-s3-hook-1');for(const ms of [1200,1200,600])e.tick(ms);
 const end=geometry.environments['tunnel-well'].anchors['A5-hook-end'].point;assert.deepEqual([e.model.actors.alice.x,e.model.actors.alice.y],end);assert.equal(e.model.s3.hookMs,3000);assert.equal(e.model.watch.owner,'white-rabbit');assert.equal(e.model.watch.visible,0);assert.equal(e.step.id,'alice-c1-s4-approach');
});
test('both corridor travelers move continuously at every ten millisecond sample',()=>{
 const e=new ReaderEngine(story);e.start('alice-c1-s3-paired-travel');let previous=structuredClone(e.model);
 for(let t=10;t<7800;t+=10){e.tick(10);for(const id of ['alice','white-rabbit'])assert(Math.hypot(e.model.actors[id].x-previous.actors[id].x,e.model.actors[id].y-previous.actors[id].y)>0);previous=structuredClone(e.model);}
});

test('S3 Rabbit route and occluder endpoint retain the approved bend coordinates',()=>{
 const g=geometry.environments['tunnel-well'],r=g.walkPaths['rabbit-inner-bend'];assert.deepEqual(g.anchors['R2-hidden'].point,[2152,420]);assert.deepEqual(r.waypoints.at(-1),[2152,420]);assert.deepEqual(r.sourceWaypoints.at(-1),[1076,210]);const step=story.steps.find(s=>s.id==='alice-c1-s3-paired-travel');assert.deepEqual([step.effects.actors['white-rabbit'].x,step.effects.actors['white-rabbit'].y],g.anchors['R2-hidden'].point);
});
