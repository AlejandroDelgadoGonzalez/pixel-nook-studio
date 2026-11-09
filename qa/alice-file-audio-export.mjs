import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {launch,watch} from './helpers/browser.mjs';
import {base,output} from './config.mjs';
import {verifyDecodedVideo} from './helpers/decoded-video.mjs';
const configuration=JSON.parse(await fs.readFile('stories/alice-in-wonderland/shared/chapter-1-scene-1-audio.json','utf8'));assert(configuration.available,'PENDING: four real local MP3 files are required. This test never calls ElevenLabs.');
const binary=process.env.QA_FFMPEG;assert(binary,'Set QA_FFMPEG to the local decoder');
const out=path.join(output,'exports');await fs.mkdir(out,{recursive:true});
const report={errors:[],resources:[],exports:[],clockMultiplier:1,scope:'Local Edge, actual product MP4 recordings at normal reading speed; isolated storage'};
const browser=await launch({args:['--disable-accelerated-video-encode']});
try{
 const context=await browser.newContext({viewport:{width:720,height:1280}});const page=await context.newPage();watch(page,report);
 await page.addInitScript(()=>{const Native=window.AudioContext;window.qaAudioContexts=[];window.AudioContext=class extends Native{constructor(...args){super(...args);qaAudioContexts.push(this);}};});
 await page.goto(base+'/reader.html?story=alice-in-wonderland&start=1');await page.waitForFunction(()=>window.reader&&!document.querySelector('#start').disabled);await page.click('#start');
 await page.evaluate(()=>{window.qaScene=Phaser.Display.Canvas.CanvasPool.pool.find(p=>p.parent?.scene?.getScene).parent.scene.scenes[0];qaScene.game.loop.stop();qaScene.reader.paused=true;qaScene.reader.onChange('back');});
 await page.click('#show-controls');
 await page.evaluate(async()=>{
  const {ReaderEngine}=await import('/platform/reader/engine.js'),original=ReaderEngine.prototype.start;window.qaExportStartChecks=[];
  ReaderEngine.prototype.start=function(id,time=0){
   const result=original.call(this,id,time);
   if(this!==qaScene.reader){const pristine=new ReaderEngine(structuredClone(this.story));original.call(pristine,id,time);const equal=JSON.stringify(this.model)===JSON.stringify(pristine.model);qaExportStartChecks.push({id,equal,time:this.totalTime});if(!equal||this.totalTime!==time)throw Error('Export warmup changed authored opening state/clock');}
   return result;
  };
 });
 // Warm the software encoder without advancing any story clock.
 await page.evaluate(async()=>{const c=document.createElement('canvas');c.width=720;c.height=1280;const stream=c.captureStream(30),r=new MediaRecorder(stream,{mimeType:'video/mp4'});const done=new Promise(ok=>r.onstop=ok);let n=0;const timer=setInterval(()=>{const x=c.getContext('2d');x.fillStyle=n++%2?'#345678':'#876543';x.fillRect(0,0,720,1280);},33);r.start(100);await new Promise(ok=>setTimeout(ok,3000));r.stop();await done;clearInterval(timer);stream.getTracks().forEach(t=>t.stop());});
 // Cancel both sound states before the normal-speed recordings.
 for(const audio of [true,false]){
  await page.locator('#export-audio').setChecked(audio);const before=await page.evaluate(()=>JSON.stringify({model:qaScene.reader.model,storage:{...localStorage}}));
  await page.click('#export-video');await page.waitForSelector('#export-preview canvas');await page.click('#cancel-export');await page.waitForFunction(()=>document.querySelector('#cancel-export').hidden);await page.click('#close-export');await page.waitForFunction(()=>!document.querySelector('.export-render-host'));
  assert.equal(await page.evaluate(()=>JSON.stringify({model:qaScene.reader.model,storage:{...localStorage}})),before);
  assert.equal(await page.evaluate(()=>qaAudioContexts.filter(c=>c.state!=='closed').length),1);
 }
 report.cancellationSoundOnOff=true;
 const jobs=[{scene:0},{scene:0,silent:true}];
 const only=process.argv.find(x=>x.startsWith('--scene='))?.split('=')[1];
 const after=Number(process.argv.find(x=>x.startsWith('--after-scene='))?.split('=')[1]??0);
 for(const job of jobs.filter(j=>(only===undefined||String(j.scene+1)===only)&&(j.silent||j.scene+1>after))){
  await page.locator('#export-audio').setChecked(!job.silent);await page.selectOption('#export-scene',String(job.scene));
  const before=await page.evaluate(()=>JSON.stringify({model:qaScene.reader.model,storage:{...localStorage}}));
  const directory=path.join(out,`scene-${job.scene+1}-${job.silent?'silent':'mp3'}`);await fs.mkdir(directory,{recursive:true});
  await page.evaluate(()=>{qaExportStartChecks=[];});
  console.log('Recording normal1x Scene',job.scene+1,job.silent?'silent':'local MP3');await page.click('#export-video');
  for(let n=0;n<30;n++){await page.waitForTimeout(10000);const state=await page.evaluate(()=>({ready:!document.querySelector('#export-download').hidden,status:document.querySelector('#export-status').textContent}));if(state.ready)break;if(/cancelled|could not/.test(state.status))throw Error(state.status);if(n%3===2)console.log(state.status);}
  assert(await page.isVisible('#export-download'),'Recording did not finish');
  const pending=page.waitForEvent('download');await page.click('#export-download');const download=await pending;const file=download.suggestedFilename();assert(file.endsWith('.mp4'));await download.saveAs(path.join(directory,file));
  const metadata=await page.evaluate(async()=>{const v=document.createElement('video');v.muted=true;v.src=document.querySelector('#export-download').href;document.body.append(v);await new Promise((ok,bad)=>{v.onloadeddata=ok;v.onerror=bad;});const data={width:v.videoWidth,height:v.videoHeight,duration:v.duration};v.playbackRate=8;await v.play();await new Promise((ok,bad)=>{v.onended=ok;v.onerror=bad;});v.remove();return {...data,playedCompletely:true,playbackRate:8};});
  assert.equal(metadata.width,720);assert.equal(metadata.height,1280);
  const frames=[.5,3.5,.18,.32,.5,.68,.82,.95].map((t,i)=>({time:i<2?t:metadata.duration*t,file:`frame-${i}.png`}));
  const decoded=await verifyDecodedVideo(binary,directory,file,frames);
  const scan=spawnSync(binary,['-hide_banner','-i',path.join(directory,file),'-af','volumedetect','-f','null','-'],{windowsHide:true,encoding:'utf8',maxBuffer:4*1024*1024});
  const audio=/Audio:/.test(scan.stderr);assert.equal(audio,!job.silent);
  const mean=Number(scan.stderr.match(/mean_volume:\s*([-\d.]+) dB/)?.[1]),peak=Number(scan.stderr.match(/max_volume:\s*([-\d.]+) dB/)?.[1]);if(audio){assert(Number.isFinite(mean)&&mean> -80,'Empty audio track');assert(peak< -10,'Audio peak too loud');}
  await page.click('#close-export');await page.waitForFunction(()=>!document.querySelector('.export-render-host'));assert.equal(await page.evaluate(()=>JSON.stringify({model:qaScene.reader.model,storage:{...localStorage}})),before);assert.equal(await page.evaluate(()=>qaAudioContexts.filter(c=>c.state!=='closed').length),1);
  const warmup=await page.evaluate(()=>qaExportStartChecks);assert.equal(warmup.length,2,'Prepare active scene then restore original opening');assert(warmup.every(s=>s.equal&&s.time===0));
  const row={warmup,...job,file:path.join(directory,file),...metadata,decoded,audio,meanDb:audio?mean:null,peakDb:audio?peak:null,readerPreserved:true,exportContextClosed:true};report.exports.push(row);await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log('PASS export',job.scene+1,job.silent?'silent':'local MP3',metadata.duration+'s',mean+'dB');
 }
 await context.close();assert.deepEqual(report.errors,[]);assert.deepEqual(report.resources,[]);report.passed=true;
}finally{await browser.close();await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));}
console.log('PASS normal-speed audio/silent MP4 exports, complete playback/decode, cancellation, reader preservation and audio cleanup');
