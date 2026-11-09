// Decoded-next-frame buffering. The outgoing frame stays visible on slow/error
// loads; a stale async navigation can never replace a newer selection.
export class VideoLayer{
 constructor(container,{busy=()=>{},status=()=>{}}={}){this.container=container;this.busy=busy;this.status=status;this.cache=new Map();this.generation=0;this.paused=false;}
 prepare(media){if(!media?.videoSrc)return null;const src=media.videoSrc;if(this.cache.has(src))return this.cache.get(src);
  const video=document.createElement('video');video.muted=true;video.playsInline=true;video.loop=media.loop!==false;video.preload='auto';video.setAttribute('aria-hidden','true');video.style.objectPosition=media.position||'50% 50%';if(media.poster)video.poster=media.poster;
  const entry={video,src};entry.ready=new Promise((resolve,reject)=>{const finish=error=>{clearTimeout(timer);video.removeEventListener('loadeddata',loaded);video.removeEventListener('error',failed);error?reject(error):resolve(video);};const loaded=()=>finish();const failed=()=>finish(new Error(video.error?.message||'Video unavailable'));const timer=setTimeout(()=>finish(new Error('Video timeout')),15000);video.addEventListener('loadeddata',loaded);video.addEventListener('error',failed);});entry.ready.catch(()=>{});this.cache.set(src,entry);this.container.append(video);video.src=src;video.load();return entry;
 }
 async show(media,next){const generation=++this.generation;const entry=this.prepare(media);this.prepare(next);
  if(!entry){this.busy(false);this.status('');if(this.active){this.active.video.style.opacity='0';this.active.video.pause();this.active=null;}this.trim([next?.videoSrc]);return;}
  if(this.active===entry){this.busy(false);this.trim([entry.src,next?.videoSrc]);return;}
  this.busy(true);this.status('');try{await entry.ready;if(generation!==this.generation)return;
   if(!this.paused)await entry.video.play().catch(error=>{if(!this.paused)throw error;});if(!this.paused&&entry.video.requestVideoFrameCallback)await Promise.race([new Promise(r=>entry.video.requestVideoFrameCallback(r)),new Promise(r=>setTimeout(r,700))]);
   if(generation!==this.generation){entry.video.pause();return;}
   const outgoing=this.active;this.active=entry;entry.video.style.zIndex='2';entry.video.style.opacity='1';if(this.paused)entry.video.pause();
   if(outgoing){outgoing.video.style.zIndex='1';outgoing.video.style.opacity='0';}
   setTimeout(()=>{if(outgoing&&this.active!==outgoing)outgoing.video.pause();if(generation===this.generation)this.trim([entry.src,next?.videoSrc]);},900);
  }catch(error){this.lastError=error.message;if(generation===this.generation){this.status('No se pudo cargar el video. Se conserva la imagen anterior.');this.cache.delete(entry.src);entry.video.remove();}}
  finally{if(generation===this.generation)this.busy(false);}
 }
 trim(keep){for(const[src,e]of this.cache)if(!keep.includes(src)&&e!==this.active){e.video.pause();e.video.removeAttribute('src');e.video.load();e.video.remove();this.cache.delete(src);}}
 setPaused(paused){this.paused=paused;for(const e of this.cache.values())if(e===this.active&&!paused)e.video.play().catch(()=>{});else e.video.pause();}
}
