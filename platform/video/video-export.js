import {storage} from '../storage/storage.js';
import {ReaderEngine} from '../reader/engine.js';
import {captionReady} from '../reader/caption-visibility.js';
import {createSoundtrack} from '../audio/create-soundtrack.js';
import {videoSequence,videoDuration,logoOpacity} from './video-sequence.js';

const formats=['video/mp4;codecs=avc1.42001E,mp4a.40.2','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
const supportedFormat=()=>typeof MediaRecorder==='undefined'?null:formats.find(type=>MediaRecorder.isTypeSupported(type));
function lines(ctx,text,width){const out=[];let line='';for(const word of text.split(/\s+/)){const next=line?line+' '+word:word;if(line&&ctx.measureText(next).width>width){out.push(line);line=word;}else line=next;}if(line)out.push(line);return out;}
function titleLogo(story){
 const canvas=document.createElement('canvas');canvas.width=640;canvas.height=230;const ctx=canvas.getContext('2d');
 ctx.textAlign='center';ctx.lineJoin='miter';ctx.strokeStyle='#172b22';ctx.lineWidth=10;ctx.fillStyle='#edd39d';ctx.font='bold 60px Georgia';
 const title=story.title,font=Math.min(60,60*590/ctx.measureText(title).width);ctx.font=`bold ${font}px Georgia`;ctx.strokeText(title,320,114);ctx.fillText(title,320,114);
 ctx.font='bold 26px Georgia';ctx.lineWidth=6;ctx.strokeText('Pixel Nook',320,167);ctx.fillText('Pixel Nook',320,167);
 for(const x of [100,530]){ctx.fillStyle='#172b22';ctx.fillRect(x-3,147,16,16);ctx.fillStyle='#d9b567';ctx.fillRect(x,150,10,10);}return canvas;
}

export function installVideoExport({story,Renderer,getMargins}){
 // Export the same localized passages the reader plays, including older bilingual stories.
 story={...story,scenes:story.scenes.map((chapter,index)=>({...chapter,steps:story.steps.filter(step=>step.sceneIndex===index)}))};
 const section=document.createElement('section');section.className='export-settings';
 section.innerHTML='<h3>Export a scene</h3><label>Scene <select id="export-scene" aria-label="Scene to export"></select></label><label><input type="checkbox" id="export-audio" checked> Include ambient sound</label><button id="export-video">Export vertical video</button><p>720 × 1280 · automatic reading · no buttons. A title logo fades out in 3 seconds. When available, the ending previews the next scene’s opening action without text. Export takes about as long as the scene; keep this tab visible until it finishes.</p>';
 document.getElementById('settings-modal').insertBefore(section,document.getElementById('vertical'));
 if(story.fileAudio){const control=section.querySelector('#export-audio');control.checked=story.fileAudio.available===true;control.disabled=!story.fileAudio.available;control.parentElement.lastChild.textContent=story.fileAudio.available?' Include local MP3 audio (Scene 1 only)':' Audio pending local MP3 files';}
 for(const[i,scene]of story.scenes.entries()){const option=document.createElement('option');option.value=i;option.textContent=`${i+1}. ${scene.name}`;section.querySelector('select').append(option);}
 const modal=document.createElement('dialog');modal.id='export-modal';modal.innerHTML='<div class="modal-head"><h2>Export video</h2><button id="close-export" aria-label="Close export">✕</button></div><p class="export-status" id="export-status" role="status"></p><progress id="export-progress" max="100" value="0"></progress><div id="export-preview"></div><a id="export-download" class="export-download" hidden>Download video</a><button id="cancel-export">Cancel export</button>';document.body.append(modal);
 const $=id=>document.getElementById(id);let job=null,url=null;
 const mime=supportedFormat();if(!mime||!HTMLCanvasElement.prototype.captureStream||story.renderer==='video'){$('export-video').disabled=true;section.querySelector('p').textContent='Video export is unavailable in this browser for this story. Try a current Chrome or Edge browser with one of the animated stories.';}
 $('close-export').onclick=()=>{job?.abort();modal.close();};$('cancel-export').onclick=()=>job?.abort();modal.addEventListener('cancel',()=>job?.abort());
 document.addEventListener('visibilitychange',()=>{if(document.hidden)job?.abort();});
 window.addEventListener('pagehide',()=>{job?.abort();if(url)URL.revokeObjectURL(url);});
 $('export-video').onclick=async()=>{
  if(job)return;job=new AbortController();const active=job;const selected=Number($('export-scene').value),chapter=story.scenes[selected];
  if(url){URL.revokeObjectURL(url);url=null;}$('export-download').hidden=true;$('export-progress').hidden=false;$('export-progress').value=0;$('cancel-export').hidden=false;$('export-preview').replaceChildren();$('export-status').textContent='Preparing the scene…';modal.showModal();
  try{
   const result=await recordScene({story,Renderer,selected,mime,audio:$('export-audio').checked,margins:getMargins(),signal:active.signal,onCanvas:canvas=>{$('export-preview').append(canvas);},onProgress:value=>{$('export-progress').value=value;$('export-status').textContent=`Exporting ${chapter.name} · ${Math.round(value)}%`;}});
   if(active.signal.aborted)throw new DOMException('Cancelled','AbortError');
   url=URL.createObjectURL(result);const extension=result.type.includes('mp4')?'mp4':'webm';const link=$('export-download');link.href=url;link.download=`pixel-nook-${story.id}${story.serialized?'-'+story.availableChapter:''}-scene-${selected+1}.${extension}`;link.textContent=`Download ${extension.toUpperCase()} video`;link.hidden=false;
   $('export-status').textContent='Your video is ready, with an opening logo and a text-free ending.';$('export-progress').value=100;
  }catch(error){$('export-status').textContent=error.name==='AbortError'?'Export cancelled. Keep this tab visible when you try again.':'The video could not be exported. Please try again.';if(error.name!=='AbortError')console.error(error);}
  finally{$('cancel-export').hidden=true;job=null;}
 };
}

async function recordScene({story,Renderer,selected,mime,audio,margins,signal,onCanvas,onProgress}){
 const sequence=videoSequence(story,selected);
 const canvas=document.createElement('canvas');canvas.width=720;canvas.height=1280;canvas.className='export-preview';canvas.setAttribute('aria-label','Video preview without controls');const ctx=canvas.getContext('2d');
 const W=390,H=390*16/9,S=720/W,left=W*margins.left/100,top=H*margins.top/100,width=W*(1-(margins.left+margins.right)/100),bottom=H*margins.bottom/100;
 ctx.font='17px Georgia';const chapter=story.scenes[selected],maxLines=Math.max(1,...chapter.steps.filter(s=>s.type==='text').map(s=>lines(ctx,s.text,width-36).length));const panelH=maxLines*26.35+(story.videoExport?.captionPadding??92),panelY=H-bottom-panelH;
 const dark=document.documentElement.dataset.theme==='dark';let game,scene,stream,recorder,frame,lastText=null,endingAt=null,stopped=false,loadTimer,abortLoad,recordingError,logo;
 const host=document.createElement('div');host.className='export-render-host';document.body.append(host);
 const sound=createSoundtrack(story,{sceneIndex:selected});sound.configure(story.ambientAudio);sound.volume=.35;try{const value=Number(storage.getItem('betweenlines:volume'));if(storage.getItem('betweenlines:volume')!==null&&Number.isFinite(value))sound.volume=Math.max(0,Math.min(1,value));}catch{}
 audio=audio&&sound.available!==false&&sound.enabled!==false;
 if(story.ambientAudio?.src)sound.ambientUrl=story.ambientAudio.src;
 const engine=new ReaderEngine(structuredClone(sequence.story),reason=>{if(engine.step?.type==='text')lastText=engine.step;else if(engine.step?.caption==='clear')lastText=null;if(reason==='end'){endingAt=performance.now();sound.playing=false;sound.sync();}if(audio)sound.follow?.(engine);});engine.sceneGate=false;engine.setAuto(true);
 const check=()=>{if(signal.aborted)throw new DOMException('Cancelled','AbortError');};
 try{
  // Unlock in the user's click before loading assets; this soundtrack never alters the reader.
  if(audio)await sound.unlock();check();
  await new Promise((resolve,reject)=>{
   abortLoad=()=>reject(new DOMException('Cancelled','AbortError'));signal.addEventListener('abort',abortLoad,{once:true});
   loadTimer=setTimeout(()=>reject(new Error('Scene assets did not load')),30000);
   scene=new Renderer(engine,s=>{scene=s;scene.readingHeight=Math.max(110,panelY-top-20);scene.safeTopInset=top;scene.safeCenterOffset=(W*margins.right/100-left)/2;scene.safeWidth=width;resolve();});
   game=new Phaser.Game({type:Phaser.CANVAS,parent:host,width:W,height:Math.round(H),pixelArt:true,roundPixels:true,antialias:false,backgroundColor:'#172b22',scale:{mode:Phaser.Scale.NONE},scene,audio:{noAudio:true},input:{mouse:false,touch:false,keyboard:false},fps:{target:30,forceSetTimeOut:true},banner:false});
  });clearTimeout(loadTimer);signal.removeEventListener('abort',abortLoad);check();
  const portraits={};await Promise.all([
   ...Object.entries(scene.portraits).map(async([id,src])=>{const img=new Image();img.src=src;await img.decode();portraits[id]=img;}),
   (async()=>{if(story.videoExport?.logo?.src){logo=new Image();logo.src=story.videoExport.logo.src;await logo.decode();}else logo=titleLogo(story);})()
  ]);check();
  scene.onTick=dt=>{if(engine.running&&!engine.paused){sound.setAtmosphere(story.scenes[engine.step?.sceneIndex]?.atmosphere||chapter.atmosphere,{nearWater:engine.model.view==='waterfall'});if(audio)sound.tick(dt,engine);}};
  // Prepare the selected scene's lazy textures before the recording clock.
  // In particular, a later scene may first reveal a large bank of composed
  // canvases after its opening replay. Building them mid-recording drops frames.
  // This is an isolated export engine; reconstruct the original opening below
  // before any frame is recorded, preserving all authored state and durations.
  const warmPassage=story.steps.find(step=>step.sceneIndex===selected&&step.type==='text');
  if(warmPassage){
   engine.start(warmPassage.id);engine.paused=true;scene.draw(0,true);
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));check();
  }
  lastText=null;endingAt=null;
  engine.start(sequence.startId);engine.paused=true;scene.shotDissolve?.clear();scene.draw(0,true);
  function draw(){
   ctx.setTransform(S,0,0,S,0,0);ctx.imageSmoothingEnabled=false;ctx.drawImage(game.canvas,0,0,W,H);
   const phase=engine.step?.exportPhase,waiting=engine.step===lastText&&!captionReady(engine.step,engine.elapsed,engine.revealed,story.captionPresentation,engine.visualMotionRemainingMs),captionAlpha=waiting||phase==='preview'||engine.step?.caption==='clear'?0:phase==='fade'?Math.max(0,1-engine.elapsed/sequence.fadeMs):1;
   if(lastText&&captionAlpha>0){ctx.save();ctx.globalAlpha=captionAlpha;ctx.fillStyle=dark?'rgba(20,35,29,.96)':'rgba(255,249,238,.96)';ctx.beginPath();ctx.roundRect(left,panelY,width,panelH,12);ctx.fill();ctx.strokeStyle=dark?'#7d8061':'#aaa286';ctx.lineWidth=.6;ctx.stroke();
    const who=lastText.who,portrait=portraits[scene.portraitKey?.(who)||who];let nameX=left+18;if(portrait){ctx.save();ctx.beginPath();ctx.arc(left+33,panelY+32,15,0,Math.PI*2);ctx.clip();ctx.drawImage(portrait,left+18,panelY+17,30,30);ctx.restore();nameX+=40;}
    ctx.font='14px Georgia';ctx.fillStyle=dark?'#eedbb0':'#73562e';ctx.fillText(who?story.characters[who].name:'Pixel Nook',nameX,panelY+36);
    ctx.font='17px Georgia';ctx.fillStyle=dark?'#fff9ea':'#293e33';const shown=engine.step===lastText?engine.revealed:lastText.text.length;let offset=0;for(const[lineIndex,line]of lines(ctx,lastText.text,width-36).entries()){const visible=line.slice(0,Math.max(0,shown-offset));ctx.fillText(visible,left+18,panelY+74+lineIndex*26.35);offset+=line.length+1;}
    ctx.restore();
   }
   const alpha=logoOpacity(engine.totalTime,story.videoExport?.logo?.durationMs??3000);
   if(alpha>0){
    const logoY=top+8,heads=Object.values(scene.diagnostics?.().actors||{}).filter(a=>a.visible>.2).map(a=>a.head?.y).filter(Number.isFinite),limit=Math.min(panelY,...heads)-logoY-12;
    const logoW=Math.min(width*.96,W*.78,Math.max(50,limit)*logo.width/logo.height),logoH=logoW*logo.height/logo.width;
    ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(logo,left+(width-logoW)/2,logoY,logoW,logoH);ctx.restore();
   }
  }
  // Render the first camera position before MediaRecorder starts.
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));draw();onCanvas(canvas);check();stream=canvas.captureStream(30);
  if(audio){const destination=sound.ctx.createMediaStreamDestination();(sound.output||sound.master).connect(destination);for(const track of destination.stream.getAudioTracks())stream.addTrack(track);}
  recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:4000000,audioBitsPerSecond:128000});const chunks=[];
  const result=new Promise((resolve,reject)=>{recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onerror=e=>{recordingError=e.error||new Error('Recording failed');};recorder.onstop=()=>resolve(new Blob(chunks,{type:recorder.mimeType}));});
  const stop=()=>{if(stopped)return;stopped=true;if(recorder.state!=='inactive')recorder.stop();};signal.addEventListener('abort',stop,{once:true});
  const endingHoldMs=sequence.endingHoldMs??800;
  recorder.start(1000);engine.paused=false;sound.playing=true;sound.reset();sound.setAtmosphere(chapter.atmosphere);sound.sync();const expected=videoDuration(story,sequence.steps)+endingHoldMs;
  await new Promise((resolve,reject)=>{const tick=()=>{try{check();if(recordingError)throw recordingError;draw();onProgress(Math.min(99,(engine.totalTime+(endingAt?performance.now()-endingAt:0))/expected*100));if(endingAt&&performance.now()-endingAt>=endingHoldMs){stop();resolve();return;}frame=requestAnimationFrame(tick);}catch(error){stop();reject(error);}};tick();});
  const blob=await result;signal.removeEventListener('abort',stop);check();if(blob.size<1024)throw new Error('Empty recording');return blob;
 }finally{
  clearTimeout(loadTimer);if(abortLoad)signal.removeEventListener('abort',abortLoad);cancelAnimationFrame(frame);if(recorder&&recorder.state!=='inactive')recorder.stop();stream?.getTracks().forEach(t=>t.stop());game?.destroy(true);host.remove();sound.playing=false;sound.stopNotes();sound.file?.pause();clearTimeout(sound.suspendTimer);await sound.ctx?.close().catch(()=>{});
 }
}
