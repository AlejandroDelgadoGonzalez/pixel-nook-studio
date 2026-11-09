import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {ReaderEngine} from '../../platform/reader/engine.js';
import {compileStory} from '../../platform/reader/story-compiler.js';
import {videoSequence} from '../../platform/video/video-sequence.js';
const data=JSON.parse(await fs.readFile('stories/alice-in-wonderland/chapters/chapter-01.json','utf8')),story=compileStory(data);
test('merged well export replays only the riverbank hook; shelf reveal is internal, once',()=>{
 const seq=videoSequence(story,1);assert.equal(seq.logoHoldMs,3000);assert.equal(seq.openingReplayDurationMs,3000);assert.deepEqual(seq.openingReplayIds,['alice-c1-s2-hook-arrival','alice-c1-s2-hook-kneel','alice-c1-s2-hook-hand','alice-c1-s2-hook-torso']);assert.equal(seq.closingDurationMs,3000);
});
test('jar ownership changes only after contact and is reconstructible at each text',()=>{
 const e=new ReaderEngine(story);e.start('alice-c1-s4-pickup');assert.equal(e.model.jar.owner,null);e.tick(.5);assert.equal(e.model.jar.owner,null);e.tick(.5);assert.equal(e.model.jar.owner,'alice');
 e.start('alice-c1-s4-empty');assert.equal(e.model.jar.owner,'alice');assert.equal(e.model.jar.orientation,'tilted');assert.equal(e.model.jar.state,'carried');
 e.start('alice-c1-s4-place-contact');assert.equal(e.model.jar.owner,'alice');e.tick(.5);assert.equal(e.model.jar.owner,'alice');e.tick(.5);assert.equal(e.model.jar.owner,null);assert.equal(e.model.jar.state,'lower-fixed');
 e.start('alice-c1-s4-narration');assert.equal(e.model.jar.owner,null);assert.equal(e.model.jar.state,'lower-fixed');
});
test('landing happens once in exactly3000ms and continues into S3 from the same stable seated state',()=>{
 const e=new ReaderEngine(story);e.start('alice-c1-s4-hook-contact');assert.equal(e.model.s4.landed,false);e.tick(700);e.tick(1150);e.tick(1150);assert.equal(e.step.id,'alice-c1-s5-open');assert.equal(e.running,true);assert.equal(e.model.s4.landed,true);assert.equal(e.model.s3.falling,false);assert.equal(e.model.staging.alice,'seated-braced');assert.deepEqual([e.model.actors.alice.x,e.model.actors.alice.y],[2160,3328]);assert.equal(e.model.jar.state,'lower-fixed');assert.equal(e.model.actors.sister.x,810);assert.equal(e.model.actors.sister.y,650);
});
test('reader and S4 export reconstruct identical prop states at every passage',()=>{
 const seq=videoSequence(story,1);
 for(const s of story.steps.filter(s=>s.type==='text'&&s.id.startsWith('alice-c1-s4-'))){const a=new ReaderEngine(story),b=new ReaderEngine(seq.story);a.start(s.id);b.start(s.id);assert.deepEqual(a.model,b.model);}
});
