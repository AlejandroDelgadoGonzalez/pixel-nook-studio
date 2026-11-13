import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ReaderEngine} from '../../platform/reader/engine.js';
import {compileStory} from '../../platform/reader/story-compiler.js';
import {captionReady} from '../../platform/reader/caption-visibility.js';
const data=JSON.parse(fs.readFileSync('stories/alice-in-wonderland/chapters/chapter-03.json','utf8'));
test('a visible complete caption advances in one click, including the continuous scene boundary',()=>{
 const e=new ReaderEngine(compileStory(data));e.start('alice-c3-who-11');assert.equal(e.revealed,e.step.text.length);
 assert(e.advance(1000));assert.equal(e.step.id,'alice-c3-side-02');assert.equal(e.elapsed,0);assert(captionReady(e.step,e.elapsed,e.revealed,data.captionPresentation,e.visualMotionRemainingMs));
 assert(e.advance(2000));assert.equal(e.step.id,'alice-c3-side-03');
});
test('ascent is hidden and unskippable until both motion and pan finish',()=>{
 const e=new ReaderEngine(compileStory(data));e.start('alice-c3-who-02');
 for(const t of [0,1200,3200,4800,5999]){e.start('alice-c3-who-02');e.tick(t);assert(!captionReady(e.step,e.elapsed,e.revealed,data.captionPresentation,e.visualMotionRemainingMs));assert(!e.advance(10000));}
 e.start('alice-c3-who-02');e.tick(6000);assert(captionReady(e.step,e.elapsed,e.revealed,data.captionPresentation,e.visualMotionRemainingMs));assert(e.advance(10000));assert.equal(e.step.id,'alice-c3-who-03');
});
test('progressive stories keep their initial reveal behavior',()=>{
 const story=compileStory({...data,captionPresentation:undefined});const e=new ReaderEngine(story);e.start('alice-c3-side-02');assert.equal(e.revealed,0);assert(e.advance(1000));assert.equal(e.step.id,'alice-c3-side-02');assert.equal(e.revealed,e.step.text.length);
});
