import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {launch,openCase} from './helpers/browser.mjs';
import {storyCases} from './helpers/story-cases.mjs';
import {verifyDecodedVideo} from './helpers/decoded-video.mjs';
import {videoSequence,videoDuration} from '../platform/video/video-sequence.js';
const out=process.env.QA_OUTPUT_DIR||'.artifacts/qa/c3-s1/export',binary=process.env.QA_FFMPEG;
assert(binary,'QA_FFMPEG is required for independent decoding and silent-stream verification');
await fs.mkdir(out,{recursive:true});
const selected=Number(process.env.QA_EXPORT_SCENE||0);
const browser=await launch({args:['--disable-accelerated-video-encode']}),report={scope:`Alice C3-S${selected+1} real MP4 export and complete playback at1x; no duration acceptance inferred from MP4`,errors:[],resources:[],audioRequests:[],exports:[]};
try{
 const item=(await storyCases()).find(x=>x.slug==='alice-in-wonderland'&&x.chapter.number===3),{page,context}=await openCase(browser,item,{width:390,height:844},report);
 if(process.env.QA_READER_ASPECT){await page.click('#show-controls');await page.selectOption('#aspect-ratio',process.env.QA_READER_ASPECT);await page.click('#close-settings');report.readerAspect=process.env.QA_READER_ASPECT;}
 page.on('request',r=>{if(/\.mp3(?:\?|$)/.test(r.url()))report.audioRequests.push(r.url());});
 await page.evaluate(()=>{qaScene.reader.paused=true;document.querySelector('#ending').hidden=true;document.querySelector('#settings-modal').showModal();});
 const before=await page.evaluate(()=>({model:JSON.stringify(qaScene.reader.model),storage:JSON.stringify({...localStorage})}));
 // Warm a disposable encoder; the reader and the product export clock stay untouched.
 await page.evaluate(async()=>{const c=document.createElement('canvas');c.width=720;c.height=1280;const x=c.getContext('2d'),stream=c.captureStream(30),r=new MediaRecorder(stream,{mimeType:'video/mp4',videoBitsPerSecond:4000000});let n=0;const done=new Promise(ok=>r.onstop=ok),timer=setInterval(()=>{x.fillStyle=n++%2?'#345678':'#876543';x.fillRect(0,0,720,1280);},33);r.start(100);await new Promise(ok=>setTimeout(ok,5000));r.stop();await done;clearInterval(timer);stream.getTracks().forEach(t=>t.stop());});
 for(const audioChecked of (process.env.QA_EXPORT_AUDIO_CASES?JSON.parse(process.env.QA_EXPORT_AUDIO_CASES):[false,true])){
  const dir=out+'/'+(audioChecked?'checkbox-on':'checkbox-off');await fs.mkdir(dir,{recursive:true});
  await page.selectOption('#export-scene',process.env.QA_EXPORT_SCENE||'0');await page.locator('#export-audio').setChecked(audioChecked);await page.click('#export-video');console.log('Normal1x export; scene '+(process.env.QA_EXPORT_SCENE||'0')+'; audio checkbox '+audioChecked);
  for(let i=0;i<24;i++){await page.waitForTimeout(10000);const state=await page.evaluate(()=>({ready:!document.querySelector('#export-download').hidden,status:document.querySelector('#export-status').textContent}));console.log(state.status);if(state.ready)break;assert(!/could not|cancelled/i.test(state.status),state.status);}
  assert(await page.evaluate(()=>!document.querySelector('#export-download').hidden),'Export must complete');
  const waiting=page.waitForEvent('download');await page.click('#export-download');const download=await waiting,file=download.suggestedFilename();await download.saveAs(dir+'/'+file);
  const video=await page.evaluate(async()=>{const link=document.querySelector('#export-download'),blob=await(await fetch(link.href)).blob(),v=document.createElement('video');v.muted=true;v.src=link.href;document.body.append(v);await new Promise((ok,bad)=>{v.onloadeddata=ok;v.onerror=bad;});window.qaExportVideo=v;return{width:v.videoWidth,height:v.videoHeight,duration:v.duration,mime:blob.type,bytes:blob.size};});
  assert.equal(video.width,720);assert.equal(video.height,1280);assert(video.mime.includes('mp4'));
  video.frames=[1,4,7,10,14,18,22,26,30,34,40,44,48,52,55,58,60,62,63,64,65,65.8,66,66.2,67,69,70,71,71.9,73.9,75.4,76.6,76.7].filter(time=>time<video.duration).map(time=>({time,file:'frame-'+time+'.png'}));
  video.independentDecode=await verifyDecodedVideo(binary,dir,file,video.frames);
  const seq=videoSequence(item.story,selected),expectedMs=videoDuration(item.story,seq.steps)+(seq.endingHoldMs||0);
  assert(video.independentDecode.lastFrameTime*1000>=expectedMs-500,'Decoded video must retain the complete authored ending');
  const scan=spawnSync(binary,['-hide_banner','-i',path.resolve(dir,file),'-fps_mode','passthrough','-enc_time_base','demux','-f','null','-'],{windowsHide:true,encoding:'utf8',maxBuffer:4*1024*1024});
  assert.equal(scan.status,0);assert(!/Stream #.*Audio:/.test(scan.stderr),'C3-S1 must contain no audio stream even when checkbox is on');await fs.writeFile(dir+'/stream-scan.txt',scan.stderr);video.audioStreams=0;
  console.log('Playing complete saved MP4 at1x');
  await page.evaluate(async()=>{const v=window.qaExportVideo;v.currentTime=0;v.playbackRate=1;const ended=new Promise((ok,bad)=>{v.onended=ok;v.onerror=bad;});await v.play();await ended;v.remove();delete window.qaExportVideo;});video.playedCompletelyAt1x=true;
  report.exports.push({audioChecked,file:dir+'/'+file,...video});
  await page.click('#close-export');await page.waitForFunction(()=>!document.querySelector('.export-render-host'));
  const after=await page.evaluate(()=>({model:JSON.stringify(qaScene.reader.model),storage:JSON.stringify({...localStorage})}));assert.deepEqual(after,before);report.readerAndStoragePreserved=true;
  await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));
 }
 assert.deepEqual(report.audioRequests,[]);assert.deepEqual(report.errors,[]);assert.deepEqual(report.resources,[]);report.passed=true;await context.close();
}finally{await browser.close();report.finishedAt=new Date().toISOString();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}
assert(report.passed);console.log('PASS '+report.exports.length+' silent MP4s, fully decoded and played at1x; reader/storage preserved');
