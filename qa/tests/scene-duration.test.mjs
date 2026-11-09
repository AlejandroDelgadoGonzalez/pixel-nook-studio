import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {compileStory} from '../../platform/reader/story-compiler.js';
import {ReaderEngine} from '../../platform/reader/engine.js';
import {resolveSavedPassage} from '../../platform/storage/compatibility.js';
import {check} from '../checks/scene-duration.mjs';

const data=JSON.parse(fs.readFileSync('stories/alice-in-wonderland/chapters/chapter-01.json','utf8'));
const story=compileStory(data);
test('creation scenes use55–85s; authorized revisions preserve their longer budgets',()=>{
 const result=check([{slug:'alice-in-wonderland',story}]);
 assert.equal(result.scenes.length,6);
 assert.deepEqual(result.scenes.slice(0,2).map(r=>[r.automaticMs,r.exportNominalMs]),[[62962,63412],[68482,74932]]);
 for(const r of result.scenes){if(r.durationRangeGated)assert(r.automaticMs>=55000&&r.automaticMs<=85000);else assert.equal(r.phase,'authorized-revision');}assert(result.scenes[3].automaticMs>85000); 
});
test('internal riverbank and shelf joins never trigger an episode pause even with scene gates on',()=>{
 for(const [from,next] of [['alice-c1-s1-hook-rise','alice-c1-s2-continuity'],['alice-c1-s3-hook-3','alice-c1-s4-approach']]){
  const e=new ReaderEngine(story);e.sceneGate=true;e.start(from);e.tick(e.step.duration);
  assert.equal(e.step.id,next);assert.equal(e.paused,false);assert.equal(e.boundaryPending,null);
 }
});
test('new S2 ends seated at the real leaf contact; released Solid Ground retains distinct saved passages',()=>{
 const e=new ReaderEngine(story);e.start('alice-c1-s4-hook-contact');for(const ms of [700,1150,1150])e.tick(ms);
 assert.equal(e.running,true);assert.equal(e.step.id,'alice-c1-s5-open');
 assert.deepEqual([e.model.actors.alice.x,e.model.actors.alice.y],[2160,3328]);assert.equal(e.model.staging.alice,'seated-braced');
 assert.equal(e.model.jar.state,'lower-fixed');assert.equal(e.model.jar.owner,null);
 assert.equal(data.completion.scope,'chapter');assert.equal(data.completion.chapter,'chapter-1');assert.equal(data.scenes.length,6);
 assert(story.steps.some(s=>s.id.startsWith('alice-c1-s5-')));
 for(const id of ['alice-c1-s5-safe','alice-c1-s5-rabbit','alice-c1-s5-choice'])assert.equal(resolveSavedPassage(story,id),id);
});
function fixture(ms){const s=structuredClone(story);s.scenes=[{name:'Budget boundary',videoExport:{closingHook:{from:'hook',through:'hook',durationMs:3000}}}];s.steps=[{id:'body',type:'action',sceneIndex:0,duration:ms-3000,effects:{}},{id:'hook',type:'action',sceneIndex:0,duration:3000,effects:{}},{id:'end',type:'end',sceneIndex:0}];return s;}
test('inclusive55–85s bounds; longer MP4 overhead never rejects valid reading',()=>{
 for(const ms of [55000,60000,80000,85000]){const s=fixture(ms);assert.doesNotThrow(()=>check([{slug:'valid',story:s}]));}
 for(const ms of [54999,85001])assert.throws(()=>check([{slug:'invalid',story:fixture(ms)}]),/outside 55000/);
 const result=check([{slug:'valid-video-unbounded',story:fixture(85000)}]);assert(result.scenes[0].exportNominalMs>85000,'An export over85s must not invalidate valid automatic reading');
 assert.doesNotThrow(()=>check([{slug:'legacy',story:{scenes:[]}}]));
 const missing=structuredClone(story);delete missing.sceneDurationPolicy;assert.throws(()=>check([{slug:'missing',story:missing,manifest:{stageGeometry:'/measured.json'}}]),/must declare sceneDurationPolicy/);
});

test('authorized correction above85s passes; an unauthorised revision does not',()=>{const s=fixture(95000);s.scenes[0].durationReview={phase:'revision',authorization:{date:'2026-10-25',reason:'explicit pacing correction'},preserveTextAndPauses:true};assert.doesNotThrow(()=>check([{slug:'corrected',story:s}]));delete s.scenes[0].durationReview.authorization;assert.throws(()=>check([{slug:'invalid',story:s}]),/authorization/);});
