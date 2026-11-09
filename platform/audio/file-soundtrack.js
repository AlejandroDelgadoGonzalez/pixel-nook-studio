// Playback and mixing of existing local audio files only. No audio generation,
// oscillator, procedural buffer, external media URL or provider API is used.
export class FileSoundtrack{
 constructor(config,{chapter,sceneIndex}={}){
  this.config=config;this.available=config.available===true;
  this.enabled=(!config.chapter||config.chapter===chapter)&&(sceneIndex===undefined||config.sceneIndexes.includes(sceneIndex));
  this.volume=.35;this.time=0;this.nodes=[];this.buffers=new Map();this.voices=new Map();this.events=[];this.ctx=null;
  this.playing=false;this.paused=false;this.muted=false;this.active=false;this.stepId=null;this.loadError=null;
 }
 configure(){}
 setAtmosphere(){}
 get audible(){return this.available&&this.enabled&&this.active&&this.playing&&!this.paused&&!this.muted;}
 async unlock(){
  if(!this.available||!this.enabled)return;
  if(!this.ctx){this.ctx=new AudioContext();this.master=this.ctx.createGain();this.master.gain.value=0;this.master.connect(this.ctx.destination);this.output=this.master;this.analyser=this.ctx.createAnalyser();this.analyser.fftSize=1024;this.master.connect(this.analyser);}
  await this.ctx.resume();
  if(!this.loading)this.loading=Promise.all(Object.entries(this.config.assets).map(async([id,asset])=>{
   if(!asset.src.startsWith('/stories/')||!asset.src.endsWith('.mp3'))throw Error('Audio must be a local story MP3');
   const response=await fetch(asset.src);if(!response.ok)throw Error('Missing local MP3: '+asset.src);
   const buffer=await this.ctx.decodeAudioData(await response.arrayBuffer());this.buffers.set(id,buffer);
  })).catch(error=>{this.loadError=error.message;this.available=false;throw error;});
  await this.loading;this.sync();
 }
 sync(){
  if(!this.ctx)return;this.master.gain.setTargetAtTime(this.audible?this.volume:0,this.ctx.currentTime,.045);
  if(!this.audible)this.stopNotes();
 }
 stopVoice(key,immediate=false){
  const voice=this.voices.get(key);if(!voice||!this.ctx)return;this.voices.delete(key);
  const at=this.ctx.currentTime;voice.gain.gain.cancelScheduledValues(at);
  if(immediate)voice.gain.gain.setValueAtTime(0,at);else voice.gain.gain.setTargetAtTime(0,at,.018);
  try{voice.source.stop(at+(immediate?0:.08));}catch{}
 }
 stopNotes(immediate=false){for(const key of [...this.voices.keys()])this.stopVoice(key,immediate);}
 reset(time=0){this.stopNotes(true);this.time=time;this.stepId=null;this.events=[];}
 startVoice(key,assetId,offset,seconds,loop,gain){
  const buffer=this.buffers.get(assetId);if(!buffer||!this.audible||this.voices.has(key))return;
  const source=this.ctx.createBufferSource(),level=this.ctx.createGain(),at=this.ctx.currentTime;
  source.buffer=buffer;source.loop=loop;level.gain.setValueAtTime(0,at);level.gain.linearRampToValueAtTime(gain,at+.025);
  if(Number.isFinite(seconds)&&seconds>.06){level.gain.setValueAtTime(gain,at+seconds-.045);level.gain.linearRampToValueAtTime(0,at+seconds);}
  source.connect(level);level.connect(this.master);source.start(at,Math.max(0,loop?offset%buffer.duration:offset));
  if(Number.isFinite(seconds))source.stop(at+Math.max(.001,seconds));
  const voice={source,gain:level,assetId,key,offset};this.voices.set(key,voice);this.nodes.push(voice);
  source.onended=()=>{if(this.voices.get(key)===voice)this.voices.delete(key);this.nodes=this.nodes.filter(v=>v!==voice);source.disconnect();level.disconnect();};
  this.events.push({asset:assetId,step:this.stepId,offset,time:this.time});if(this.events.length>128)this.events.shift();
 }
 follow(engine){
  this.engine=engine;this.time=engine.totalTime;const step=engine.step;
  this.active=!!step&&engine.running&&this.enabled&&this.config.sceneIndexes.includes(step.sceneIndex??Math.round(engine.model.chapter));
  if(!this.active){this.stopNotes(true);if(this.ctx)this.master.gain.setValueAtTime(0,this.ctx.currentTime);this.stepId=step?.id;return;}
  if(this.stepId!==step.id){for(const key of [...this.voices.keys()])if(key!=='music')this.stopVoice(key,true);this.stepId=step.id;}
  if(!this.ctx||!this.audible||!this.buffers.size)return;
  this.master.gain.setTargetAtTime(this.volume,this.ctx.currentTime,.045);
  const music=this.config.music,buffer=this.buffers.get(music.asset);
  if(buffer)this.startVoice('music',music.asset,this.time/1000%buffer.duration,Infinity,true,music.gain);
  const span=step.type==='action'?step.duration:step.during?.duration??0;
  for(const [index,cue]of (this.config.cues[step.id]||[]).entries()){
   const start=cue.atMs??0,relative=(engine.elapsed-start)/1000,asset=this.buffers.get(cue.asset);if(!asset||relative<0)continue;
   const end=Math.min((cue.untilMs??span)/1000,(start/1000)+(cue.loop?Infinity:asset.duration));
   const remaining=end-engine.elapsed/1000,key=step.id+':'+index;
   if(remaining<=.015){this.stopVoice(key);continue;}
   this.startVoice(key,cue.asset,relative,remaining,!!cue.loop,cue.gain??.4);
  }
 }
 tick(_dt,engine){if(engine)this.follow(engine);}
 async close(){this.stopNotes(true);await this.ctx?.close();this.buffers.clear();}
 diagnostics(){
  let peak=0;if(this.analyser){const data=new Float32Array(this.analyser.fftSize);this.analyser.getFloatTimeDomainData(data);for(const n of data)peak=Math.max(peak,Math.abs(n));}
  return {fileAudio:true,provider:'ElevenLabs local MP3',available:this.available,enabled:this.enabled,state:this.loadError?'unavailable':!this.available?'awaiting-files':this.ctx?.state||'locked',filesLoaded:this.buffers.size,activeScene:this.active,activeNotes:this.voices.size,peak,time:this.time,events:[...this.events],muted:this.muted,paused:this.paused,error:this.loadError};
 }
}
