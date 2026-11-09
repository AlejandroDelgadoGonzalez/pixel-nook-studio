import assert from 'node:assert/strict';
import path from 'node:path';
import {output} from '../config.mjs';
import {ReaderEngine} from '../../platform/reader/engine.js';
import {videoSequence} from '../../platform/video/video-sequence.js';
export function sequences(cases){let scenes=0,openingSamples=0,closingSamples=0,replaySamples=0;for(const {story}of cases)for(let i=0;i<story.scenes.length;i++){const seq=videoSequence(story,i);scenes++;const original=new ReaderEngine(story),exported=new ReaderEngine(seq.story);for(const id of [...seq.openingIds,...(seq.openingReplayIds||[]),...(seq.closingIds||[])]){original.start(id);exported.start(id);assert.deepEqual(original.model,exported.model);for(const fraction of [.25,.5,.75]){original.start(id);exported.start(id);original.tick(original.step.duration*fraction);exported.tick(exported.step.duration*fraction);assert.deepEqual(original.model,exported.model);if(seq.closingIds?.includes(id))closingSamples++;else if(seq.openingReplayIds?.includes(id))replaySamples++;else openingSamples++;}}assert(!seq.steps.some(s=>s.exportPhase==='preview'&&s.type==='text'));if(seq.closingIds?.length){assert.equal(seq.closingDurationMs,story.scenes[i].videoExport.closingHook.durationMs);assert.equal(seq.holdMs,0);assert.equal(seq.endingHoldMs,0);}}return{scenes,openingSamples,closingSamples,replaySamples};}
export async function previews(page,item){const result=[];await page.evaluate(()=>{qaScene.reader.start();qaScene.reader.paused=true;document.querySelector('#ending').hidden=true;document.querySelector('#settings-modal').showModal();});for(let index=0;index<item.story.scenes.length;index++){await page.selectOption('#export-scene',String(index));await page.uncheck('#export-audio');const before=await page.evaluate(()=>({model:JSON.stringify(qaScene.reader.model),storage:JSON.stringify({...localStorage})}));await page.click('#export-video');await page.waitForSelector('#export-preview canvas');const canvas=page.locator('#export-preview canvas');assert.equal(await canvas.getAttribute('width'),'720');assert.equal(await canvas.getAttribute('height'),'1280');await page.click('#cancel-export');await page.waitForFunction(()=>document.querySelector('#cancel-export').hidden);await page.click('#close-export');await page.waitForFunction(()=>!document.querySelector('.export-render-host'));const after=await page.evaluate(()=>({model:JSON.stringify(qaScene.reader.model),storage:JSON.stringify({...localStorage})}));assert.deepEqual(after,before);result.push({scene:index+1,width:720,height:1280,cancelledCleanly:true});}await page.evaluate(()=>document.querySelector('#settings-modal').close());return result;}

export async function recording(page,item) {
  await page.evaluate(async()=>{
    const {ReaderEngine}=await import('/platform/reader/engine.js');
    const original=ReaderEngine.prototype.tick;
    window.qaRestoreTick=()=>{ReaderEngine.prototype.tick=original;};
    ReaderEngine.prototype.tick=function(dt){return original.call(this,dt*(this===qaScene.reader?1:8));};
    qaScene.reader.paused=true;
    document.querySelector('#settings-modal').showModal();
  });
  const before=await page.evaluate(()=>({model:JSON.stringify(qaScene.reader.model),storage:JSON.stringify({...localStorage})}));
  try {
    await page.selectOption('#export-scene','0');
    await page.check('#export-audio');
    await page.click('#export-video');
    await page.waitForFunction(()=>!document.querySelector('#export-download').hidden,null,{timeout:120000});
    const metadata=await page.evaluate(async()=>{
      const video=document.createElement('video');video.muted=true;video.src=document.querySelector('#export-download').href;
      await new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>reject(Error('Encoded video did not produce a decoded frame')),15000);
        video.onloadeddata=()=>{clearTimeout(timer);video.videoWidth>0&&video.videoHeight>0?resolve():reject(Error('Decoded video has no dimensions'));};
        video.onerror=()=>{clearTimeout(timer);reject(Error('Encoded video could not decode'));};
        if(video.readyState>=2&&video.videoWidth>0&&video.videoHeight>0){clearTimeout(timer);resolve();}
      });
      const result={width:video.videoWidth,height:video.videoHeight,duration:video.duration};
      if(!Number.isFinite(video.duration)||video.duration<=0)throw Error('Invalid recording duration');
      const frame=document.createElement('canvas');frame.width=video.videoWidth;frame.height=video.videoHeight;
      for(const fraction of [.1,.5,.9]){
        video.currentTime=video.duration*fraction;
        await new Promise((resolve,reject)=>{video.onseeked=resolve;video.onerror=()=>reject(Error('Video seek failed'));});
        frame.getContext('2d').drawImage(video,0,0);
        if(!frame.getContext('2d').getImageData(0,0,frame.width,frame.height).data.some(v=>v!==0))throw Error('Blank decoded frame');
      }
      result.decodedSamples=3;return result;
    });
    assert.equal(metadata.width,720);assert.equal(metadata.height,1280);
    const downloadPromise=page.waitForEvent('download');await page.click('#export-download');const download=await downloadPromise;
    const file=`${item.slug}-completed-scene-1.${download.suggestedFilename().split('.').at(-1)}`;
    await download.saveAs(path.join(output,file));
    await page.click('#close-export');
    const after=await page.evaluate(()=>({model:JSON.stringify(qaScene.reader.model),storage:JSON.stringify({...localStorage})}));
    assert.deepEqual(after,before);
    return {...metadata,file,clockMultiplier:8,audio:true,completed:true};
  } finally {
    await page.evaluate(()=>{qaRestoreTick();document.querySelector('#settings-modal').close();});
  }
}
