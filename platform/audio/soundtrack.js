const defaultAtmosphere={water:.08,wind:.04,birds:.02,village:.008,music:.018};
export class Soundtrack{
 constructor(){this.ctx=null;this.nodes=[];this.time=0;this.volume=.35;this.profile={...defaultAtmosphere};this.signature='';this.nextBird=6500;this.nextBell=29000;this.nextPad=0;this.event=0;}
 configure(options={}){this.gain=options.gain??1;this.birdMin=options.birdMinMs??14000;this.birdRange=options.birdRangeMs??15000;}
 setAtmosphere(profile=defaultAtmosphere,{nearWater=false}={}){
  const next={...defaultAtmosphere,...profile};if(nearWater)next.water*=1.4;
  const signature=JSON.stringify(next);if(signature===this.signature)return;
  this.signature=signature;this.profile=next;
  if(this.ctx)for(const[k,g]of Object.entries(this.layers)){g.gain.cancelScheduledValues(this.ctx.currentTime);g.gain.setTargetAtTime(next[k],this.ctx.currentTime,1.8);}
 }
 noise(seed,seconds=19){const b=this.ctx.createBuffer(1,this.ctx.sampleRate*seconds,this.ctx.sampleRate),v=b.getChannelData(0);let last=0;
  for(let i=0;i<v.length;i++){seed=(seed*16807)%2147483647;last=(last+(seed/2147483647*2-1)*.025)/1.025;v[i]=last*3.2;}
  // Join ends smoothly so the long ambient loop has no seam.
  const difference=v[v.length-1]-v[0];for(let i=0;i<v.length;i++)v[i]-=difference*i/(v.length-1);return b;
 }
 bed(layer,buffer,type,frequency,q,rate){const source=this.ctx.createBufferSource(),filter=this.ctx.createBiquadFilter(),breath=this.ctx.createGain(),lfo=this.ctx.createOscillator(),depth=this.ctx.createGain();
  source.buffer=buffer;source.loop=true;filter.type=type;filter.frequency.value=frequency;filter.Q.value=q;breath.gain.value=.78;lfo.frequency.value=rate;depth.gain.value=.12;
  lfo.connect(depth);depth.connect(breath.gain);source.connect(filter);filter.connect(breath);if(!this.ambientUrl)breath.connect(this.layers[layer]);source.start();lfo.start();
 }
 async unlock(){if(!this.ctx){this.ctx=new AudioContext();this.master=this.ctx.createGain();this.master.gain.value=0;this.fadeUntil=this.ctx.currentTime+3;this.master.connect(this.ctx.destination);this.layers={};
  for(const k of Object.keys(defaultAtmosphere)){const g=this.ctx.createGain();g.gain.value=this.profile[k];g.connect(this.master);this.layers[k]=g;}
  if(this.ambientUrl){this.file=new Audio(this.ambientUrl);this.file.loop=true;this.file.preload='auto';this.ctx.createMediaElementSource(this.file).connect(this.master);}
  const water=this.noise(197,23);this.bed('water',water,'lowpass',1600,.6,.19);this.bed('water',water,'bandpass',720,.7,.31);
  this.bed('wind',this.noise(701,29),'lowpass',480,.4,.09);
  this.analyser=this.ctx.createAnalyser();this.analyser.fftSize=1024;this.master.connect(this.analyser);
 }await this.ctx.resume();this.sync();}
 sync(){if(!this.ctx)return;const t=this.ctx.currentTime;this.master.gain.setTargetAtTime(this.muted||this.paused||!this.playing?0:this.volume*(this.gain??1),t,t<this.fadeUntil?1.2:.18);if(this.file){if(this.paused||!this.playing)this.file.pause();else this.file.play().catch(()=>{});}
  // Suspend only after the fade; immediately cancel a pending suspension on resume.
  clearTimeout(this.suspendTimer);if(this.paused)this.suspendTimer=setTimeout(()=>{if(this.paused)this.ctx.suspend().catch(()=>{});},500);else if(this.playing)this.ctx.resume().catch(()=>{});
 }
 tone(layer,frequency,duration,level,type='sine',delay=0,endFrequency=frequency){const at=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(frequency,at);o.frequency.exponentialRampToValueAtTime(endFrequency,at+duration*.8);
  g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(level,at+Math.min(.65,duration*.22));g.gain.exponentialRampToValueAtTime(.00001,at+duration);o.connect(g);g.connect(this.layers[layer]);o.start(at);o.stop(at+duration+.05);this.nodes.push(o);o.onended=()=>{this.nodes=this.nodes.filter(n=>n!==o);o.disconnect();g.disconnect();};
 }
 stopNotes(){for(const n of [...this.nodes])try{n.stop();}catch{}this.nodes=[];}
 reset(time=0){this.stopNotes();this.time=time;this.event=Math.floor(time/17000);this.nextBird=time+5000+(this.event%5)*1900;this.nextBell=time+27000;this.nextPad=time+800;this.sync();}
 tick(dt){this.time+=dt;if(!this.ctx||this.muted||this.paused||this.ambientUrl)return;
  if(this.time>=this.nextBird){const n=this.event++,f=1700+(n*317%850);this.tone('birds',f,.25,.42,'sine',0,f*1.28);if(n%3!==1)this.tone('birds',f*1.12,.32,.3,'sine',.44,f*.94);this.nextBird=this.time+(this.birdMin??14000)+(n*7919%(this.birdRange??15000));}
  if(this.profile.village>0&&this.time>=this.nextBell){this.tone('village',523.25,3.8,.24);this.tone('village',1047.8,2.7,.07);this.nextBell=this.time+48000+(this.event*1109%13000);}
  if(this.profile.music>0&&this.time>=this.nextPad){const notes=[196,246.94,220,164.81],f=notes[Math.floor(this.time/14000)%notes.length];this.tone('music',f,11,.25,'triangle');this.tone('music',f*1.5,10,.12,'sine',1.2);this.nextPad=this.time+13000;}
 }
 diagnostics(){let peak=0;if(this.analyser){const data=new Float32Array(1024);this.analyser.getFloatTimeDomainData(data);peak=Math.max(...data.map(Math.abs));}return {profile:{...this.profile},state:this.ctx?.state||'locked',peak,activeNotes:this.nodes.length,nextBird:this.nextBird,time:this.time};}
}
