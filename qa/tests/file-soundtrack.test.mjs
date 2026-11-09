import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {FileSoundtrack} from '../../platform/audio/file-soundtrack.js';
import {ReaderEngine} from '../../platform/reader/engine.js';
import {compileStory} from '../../platform/reader/story-compiler.js';
const config=JSON.parse(fs.readFileSync('stories/alice-in-wonderland/shared/chapter-1-scene-1-audio.json'));
const story=compileStory(JSON.parse(fs.readFileSync('stories/alice-in-wonderland/chapters/chapter-01.json')));
function observer(options={}){
 const track=new FileSoundtrack({...config,available:true},{chapter:'chapter-1',...options}),started=[];
 track.ctx={currentTime:0};track.master={gain:{setTargetAtTime(){},setValueAtTime(){}}};track.playing=true;
 for(const [id,duration]of Object.entries({melody:30,steps:4,watch:1.2,rustle:1.4}))track.buffers.set(id,{duration});
 // Transport metadata only: these unit tests create no audio or substitute MP3.
 track.startVoice=(key,assetId,offset,seconds,loop,gain)=>{if(!track.voices.has(key)){started.push({key,assetId,offset,seconds,loop,gain});track.voices.set(key,{assetId});}};
 track.stopVoice=key=>track.voices.delete(key);
 return{track,started};
}
test('all cues reference approved S1 steps; other five scenes have no bindings',()=>{
 assert.deepEqual(config.sceneIndexes,[0]);assert.equal(Object.keys(config.assets).length,4);
 for(const id of Object.keys(config.cues))assert(story.steps.some(s=>s.id===id&&s.sceneIndex===0));
 assert.equal(config.cues['alice-c1-s1-watch-extract'][0].atMs,540);
});
test('pending files neither create an AudioContext nor fetch or generate audio',async()=>{
 const original=globalThis.AudioContext;globalThis.AudioContext=class{constructor(){throw Error('Audio context must stay uncreated');}};
 try{const track=new FileSoundtrack({...config,available:false},{chapter:'chapter-1'});assert.equal(track.available,false);await track.unlock();assert.equal(track.ctx,null);assert.equal(track.diagnostics().state,'awaiting-files');}finally{globalThis.AudioContext=original;}
});
test('watch starts at real extraction visibility and finishes before the Rabbit speaks',()=>{
 const{track,started}=observer(),engine=new ReaderEngine(story);engine.start('alice-c1-s1-watch-extract');track.follow(engine);
 assert(!started.some(v=>v.assetId==='watch'));engine.tick(540);track.follow(engine);
 const watch=started.find(v=>v.assetId==='watch');assert(watch);assert.equal(watch.offset,0);assert(Math.abs(watch.seconds-1.2)<1e-9);assert(540+watch.seconds*1000<1800);
 engine.tick(1260);track.follow(engine);assert.equal(engine.step.id,'alice-c1-s1-late');assert(![...track.voices.values()].some(v=>v.assetId==='watch'));
});
test('all S1 voices stop at S2; S2 export opening replay cannot play S1 audio',()=>{
 const{track}=observer(),engine=new ReaderEngine(story);engine.start('alice-c1-s1-rabbit-emerge');track.follow(engine);assert(track.voices.size);
 for(let index=1;index<6;index++){engine.start(story.scenes[index].steps[0].id);track.follow(engine);assert.equal(track.active,false);assert.equal(track.voices.size,0);}
 assert.equal(observer({sceneIndex:1}).track.enabled,false);assert.equal(observer({chapter:'chapter-2'}).track.enabled,false);
});
test('pause resumes an ongoing real clip at its reading-clock offset, without replay from zero',()=>{
 const{track,started}=observer(),engine=new ReaderEngine(story);engine.start('alice-c1-s1-watch-extract');engine.tick(800);track.follow(engine);
 track.paused=true;track.sync();assert.equal(track.voices.size,0);track.paused=false;track.follow(engine);
 const watch=started.filter(v=>v.assetId==='watch');assert.equal(watch.length,2);assert(Math.abs(watch[1].offset-.26)<1e-9);
});
test('the new player has no synthesis or provider call and accepts local MP3s only',()=>{
 const code=fs.readFileSync('platform/audio/file-soundtrack.js','utf8');assert(!/createOscillator|createBuffer\(|Math\.(sin|cos|random)|api\.elevenlabs|xi-api-key|creative_run/.test(code));
 for(const asset of Object.values(config.assets)){assert(asset.src.startsWith('/stories/alice-in-wonderland/assets/audio/scene-1/'));assert(asset.src.endsWith('.mp3'));}
});
