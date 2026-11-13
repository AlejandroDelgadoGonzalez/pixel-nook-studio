import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';

// Seeking a paused HTML video can expose the previously decoded image. Decode
// the saved file independently, and reject dropped recording intervals as well.
export async function verifyDecodedVideo(binary,directory,filename,frames){
 const file=path.resolve(directory,filename),hashes=[];
 const scan=spawnSync(binary,['-hide_banner','-i',file,'-vf','showinfo','-fps_mode','passthrough','-enc_time_base','demux','-f','null','-'],{windowsHide:true,encoding:'utf8',maxBuffer:32*1024*1024});
 assert.equal(scan.status,0,scan.stderr?.slice(-1000));
 const times=[...scan.stderr.matchAll(/\bn:\s*\d+\s+pts:\s*\d+\s+pts_time:([\d.e+-]+)/g)].map(m=>Number(m[1]));
 assert(times.length>300,'Expected a complete normal-speed recording');
 // Container duration can include a trailing interval with no decoded frame.
 // Sample only the real PTS range and always decode the final frame by index.
 const selected=frames.filter(f=>f.time<times.at(-1)-.05),skippedRequestedTimes=frames.filter(f=>!selected.includes(f)).map(f=>f.time);
 for(const frame of selected){
  const output=path.resolve(directory,frame.file);
  execFileSync(binary,['-hide_banner','-loglevel','error','-ss',String(frame.time),'-i',file,'-frames:v','1','-y',output],{windowsHide:true});
  hashes.push(crypto.createHash('sha256').update(await fs.readFile(output)).digest('hex'));
 }
 const finalFile=path.resolve(directory,'frame-final.png');
 execFileSync(binary,['-hide_banner','-loglevel','error','-i',file,'-vf',`select='eq(n,${times.length-1})'`,'-fps_mode','vfr','-frames:v','1','-y',finalFile],{windowsHide:true});
 hashes.push(crypto.createHash('sha256').update(await fs.readFile(finalFile)).digest('hex'));
 const maximumGap=Math.max(...times.slice(1).map((t,i)=>t-times[i])),distinctFrames=new Set(hashes).size;
 const result={decoder:'FFmpeg',frames:times.length,firstFrameTime:times[0],lastFrameTime:times.at(-1),maximumGap,distinctFrames,frameHashes:hashes,skippedRequestedTimes,finalFrameDecodedByIndex:times.length-1};
 await fs.writeFile(path.join(directory,'decoded-video.json'),JSON.stringify(result,null,2));
 assert(times[0]<.5,'Recording must start immediately');
 assert(maximumGap<2,'Recording lost a continuous interval of two seconds or more');
 assert(distinctFrames>=6,'Decoded samples must show scene progression');
 return{...result,passed:true};
}
