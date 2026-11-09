import {officialSizes} from './official-layouts.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {launch,watch} from './helpers/browser.mjs';
import {base,output} from './config.mjs';
const report={errors:[],resources:[],layouts:[],audioReady:false,scope:'Local MP3 decoding, playback scope and unchanged approved visuals; no provider calls'};
await fs.mkdir(output,{recursive:true});
const root='stories/alice-in-wonderland/assets/audio/scene-1/';
const ledger=JSON.parse(await fs.readFile(root+'generation.json','utf8'));
const config=JSON.parse(await fs.readFile('stories/alice-in-wonderland/shared/chapter-1-scene-1-audio.json','utf8'));
const files=(await fs.readdir(root)).filter(f=>f.endsWith('.mp3'));
const expected=ledger.assets.map(a=>a.file).sort();
assert.equal(expected.length,4);assert.deepEqual(config.sceneIndexes,[0]);
if(config.available){assert.deepEqual(files.sort(),expected);report.audioReady=true;}
else{assert(files.every(file=>expected.includes(file)));assert(files.length<4);}
for(const file of files){const entry=ledger.assets.find(a=>a.file===file);assert(entry.generationId);assert.equal(crypto.createHash('sha256').update(await fs.readFile(root+file)).digest('hex'),entry.sha256);}
report.mp3Files=files;report.providerStatus=ledger.status;report.generationsStarted=ledger.generationsStarted;
const baseline=JSON.parse(await fs.readFile('.artifacts/sound-pilot/baseline/visual-hashes.json','utf8'));
for(const [file,hash]of Object.entries(baseline))assert.equal(crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex'),hash,file);
report.unchangedVisualFiles=Object.keys(baseline).length;
const browser=await launch();
try{
 for(const [width,height]of officialSizes){
  const context=await browser.newContext({viewport:{width,height}}),page=await context.newPage();watch(page,report);const providerCalls=[];
  page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(base+'/'))providerCalls.push(r.url());});
  await page.goto(base+'/reader.html?story=alice-in-wonderland&start=1');await page.waitForFunction(()=>window.reader&&!document.querySelector('#start').disabled);
  assert.equal(await page.locator('#sound-pilot').count(),0);assert.equal(await page.locator('#sound-pilot-settings').count(),0);
  await page.click('#start');if(report.audioReady)await page.waitForFunction(()=>reader.state.audio.filesLoaded===4);
  const row=await page.evaluate(()=>{const scene=Phaser.Display.Canvas.CanvasPool.pool.find(p=>p.parent?.scene?.getScene).parent.scene.scenes[0];scene.game.loop.stop();const e=scene.reader;e.paused=true;const silent=[];for(let index=1;index<6;index++){e.start(e.story.scenes[index].steps[0].id);e.paused=true;e.onChange('back');scene.draw(0,true);const audio=reader.state.audio;if(audio.activeScene||audio.activeNotes)silent.push(index+1);}e.start(e.story.scenes[0].steps[0].id);e.paused=true;e.onChange('back');scene.draw(0,true);return{silentViolations:silent,audio:reader.state.audio};});
  assert.deepEqual(row.silentViolations,[]);assert.equal(row.audio.fileAudio,true);assert.equal(row.audio.available,report.audioReady);assert.deepEqual(providerCalls,[]);
  await page.screenshot({path:path.join(output,`file-audio-${width}.png`)});report.layouts.push({width,height,...row,providerCalls:0});await context.close();
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.resources,[]);report.wiringChecksPassed=true;report.status=report.audioReady?'ready-for-audible-verification':'prepared-but-blocked-by-provider';
}finally{await browser.close();await fs.writeFile(path.join(output,'file-audio-report.json'),JSON.stringify(report,null,2));}
console.log(report.status,'—',report.layouts.length,'layouts; no selector, no provider calls, later scenes silent; real MP3 count:',files.length);
