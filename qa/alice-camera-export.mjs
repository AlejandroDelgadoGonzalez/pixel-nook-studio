import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {launch,openCase} from './helpers/browser.mjs';
import {storyCases} from './helpers/story-cases.mjs';
import {verifyDecodedVideo} from './helpers/decoded-video.mjs';
const out=process.env.QA_OUTPUT_DIR||'.artifacts/qa/alice-in-wonderland/camera-trial/export-final',binary=process.env.QA_FFMPEG;assert(binary);await fs.mkdir(out,{recursive:true});
const report={scope:'Four actual720x1280 camera-trial MP4s at normal1x clock, independently decoded and fully played at1x; no MP4 duration acceptance gate',errors:[],resources:[],exports:[]},b=await launch({args:['--disable-accelerated-video-encode']});
try{const cases=await storyCases();for(const [chapter,index]of (process.argv.includes('--c2-only')?[[2,0]]:[[1,3],[1,4],[1,5],[2,0]])){
 const dir=out+'/c'+chapter+'-s'+(index+1);await fs.mkdir(dir,{recursive:true});const item=cases.find(x=>x.slug==='alice-in-wonderland'&&x.chapter.number===chapter),{page,context}=await openCase(b,item,{width:390,height:844},report);
 await page.evaluate(()=>{qaScene.reader.paused=true;document.querySelector('#ending').hidden=true;document.querySelector('#settings-modal').showModal();});await page.selectOption('#alice-camera-preset','all');
 const before=await page.evaluate(()=>({model:JSON.stringify(qaScene.reader.model),storage:JSON.stringify({...localStorage})}));
 await page.evaluate(async()=>{const c=document.createElement('canvas');c.width=720;c.height=1280;const x=c.getContext('2d'),stream=c.captureStream(30),r=new MediaRecorder(stream,{mimeType:'video/mp4',videoBitsPerSecond:4000000});let n=0;const done=new Promise(ok=>r.onstop=ok),timer=setInterval(()=>{x.fillStyle=n++%2?'#345678':'#876543';x.fillRect(0,0,720,1280);},33);r.start(100);await new Promise(ok=>setTimeout(ok,5000));r.stop();await done;clearInterval(timer);stream.getTracks().forEach(t=>t.stop());});
 await page.selectOption('#export-scene',String(index));await page.locator('#export-audio').setChecked(chapter===2);await page.click('#export-video');console.log('Recording camera trial C'+chapter+' S'+(index+1)+' at1x');
 for(let i=0;i<30;i++){await page.waitForTimeout(10000);const state=await page.evaluate(()=>({ready:!document.querySelector('#export-download').hidden,status:document.querySelector('#export-status').textContent}));console.log(state.status);if(state.ready)break;assert(!/could not|cancelled/i.test(state.status),state.status);}assert(await page.evaluate(()=>!document.querySelector('#export-download').hidden));
 const waiting=page.waitForEvent('download');await page.click('#export-download');const download=await waiting,file=download.suggestedFilename();await download.saveAs(dir+'/'+file);
 const video=await page.evaluate(async()=>{const link=document.querySelector('#export-download'),blob=await(await fetch(link.href)).blob(),v=document.createElement('video');v.muted=true;v.src=link.href;document.body.append(v);await new Promise((ok,bad)=>{v.onloadeddata=ok;v.onerror=bad;});window.qaCameraVideo=v;return{width:v.videoWidth,height:v.videoHeight,duration:v.duration,mime:blob.type,bytes:blob.size};});assert.equal(video.width,720);assert.equal(video.height,1280);assert(video.mime.includes('mp4'));
 video.frames=[1,4,10,22,34,46,58,70,Math.max(0,video.duration-2)].filter(time=>time<video.duration).map(time=>({time,file:'frame-'+time+'.png'}));video.independentDecode=await verifyDecodedVideo(binary,dir,file,video.frames);
 const scan=spawnSync(binary,['-hide_banner','-i',path.resolve(dir,file),'-f','null','-'],{windowsHide:true,encoding:'utf8',maxBuffer:4*1024*1024});assert.equal(scan.status,0);assert(!/Stream #.*Audio:/.test(scan.stderr),'These scenes must remain silent');await fs.writeFile(dir+'/stream-scan.txt',scan.stderr);video.audioStreams=0;
 console.log('Playing complete C'+chapter+' S'+(index+1)+' MP4 at1x');await page.evaluate(async()=>{const v=window.qaCameraVideo;v.currentTime=0;v.playbackRate=1;const done=new Promise((ok,bad)=>{v.onended=ok;v.onerror=bad;});await v.play();await done;v.remove();delete window.qaCameraVideo;});video.playedCompletelyAt1x=true;
 await page.click('#close-export');await page.waitForFunction(()=>!document.querySelector('.export-render-host'));const after=await page.evaluate(()=>({model:JSON.stringify(qaScene.reader.model),storage:JSON.stringify({...localStorage})}));assert.deepEqual(after,before);
 report.exports.push({chapter,scene:index+1,file:dir+'/'+file,...video,readerAndStoragePreserved:true});await context.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));console.log('PASS C'+chapter+' S'+(index+1));
 }assert.deepEqual(report.errors,[]);assert.deepEqual(report.resources,[]);report.passed=true;
}finally{await b.close();report.finishedAt=new Date().toISOString();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}
assert(report.passed);console.log('PASS four normal1x silent camera-trial MP4s');
