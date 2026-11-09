import test from 'node:test';
import assert from 'node:assert/strict';
import {ReaderEngine} from '../../platform/reader/engine.js';
import {compileStory} from '../../platform/reader/story-compiler.js';
import fs from 'node:fs/promises';
const chapter=JSON.parse(await fs.readFile('stories/alice-in-wonderland/chapters/chapter-01.json','utf8'));
const story=compileStory(chapter);
test('timed measured paths keep both travelers at their common progress knots',()=>{
 const action=story.steps.find(s=>s.id==='alice-c1-s3-paired-travel');
 for(const[id,knots]of Object.entries(action.pathProgress))for(let k=1;k<knots.length-1;k++){
  const e=new ReaderEngine(story);e.start(action.id);e.tick(action.duration*knots[k]);
  const expected=action.paths[id][k-1];assert(Math.abs(e.model.actors[id].x-expected.x)<1e-8);assert(Math.abs(e.model.actors[id].y-expected.y)<1e-8);
 }
});
test('new timed-path option cannot alter legacy arc-length paths',()=>{
 const make=timed=>({initialState:{actors:{a:{x:0,y:0,visible:1}}},steps:[{id:'go',type:'action',duration:100,effects:{actors:{a:{x:200,y:100}}},paths:{a:[{x:100,y:0},{x:200,y:100}]},...(timed?{pathProgress:{a:[0,.5,1]}}:{}),travelFacing:['a']},{id:'end',type:'end'}]});
 const legacy=new ReaderEngine(make(false)),timed=new ReaderEngine(make(true));legacy.start('go');timed.start('go');legacy.tick(50);timed.tick(50);
 assert(Math.abs(legacy.model.actors.a.x-114.64466094067262)<1e-8);assert.equal(timed.model.actors.a.x,100);assert.equal(timed.model.actors.a.y,0);
});
test('invalid timed paths fail rather than silently taking another route',()=>{
 const s={initialState:{actors:{a:{x:0,y:0,visible:1}}},steps:[{id:'go',type:'action',duration:100,effects:{actors:{a:{x:100}}},paths:{a:[{x:100,y:0}]},pathProgress:{a:[0,.9]}}]};
 const e=new ReaderEngine(s);e.start('go');assert.throws(()=>e.tick(10),/Invalid path progress/);
});
