import {videoDuration} from '../video/video-sequence.js';
import {installVideoExport} from '../video/video-export.js';
import {story,loadRenderer} from './story-loader.js';
import {storage} from '../storage/storage.js';
import {resolveSavedPassage} from '../storage/compatibility.js';
import {t as tr,getLanguage,setLanguage} from '../ui/language.js';
import {ReaderEngine} from './engine.js';
import {VideoLayer} from '../video/video-layer.js';
import {createSoundtrack} from '../audio/create-soundtrack.js';
import {createTextReveal} from './text-reveal.js';
import {captionReady} from './caption-visibility.js';
import {installAspectRatioLock} from './aspect-ratio.js';
const $=id=>document.getElementById(id),key='entrelineas:'+story.id;
const engine=new ReaderEngine(story,changed),sound=createSoundtrack(story);
const revealText=createTextReveal($('text'));
sound.configure(story.ambientAudio);
let scene,muted=false,saved=null,modalWasPaused=false,statusCopy='Una historia. Ninguna prisa.',immersive=false,fullscreenBusy=false,record=false,lastLayout='',layoutFrame=0;
let currentMedia=-1;
let episodeUI=null;
let completionStep=null;
const aspectLock=installAspectRatioLock({player:$('player'),storage,onChange:()=>{record=false;document.body.classList.remove('record');lastLayout='';paint();layout(true);}});
const partialScenes=story.completion?.scope==='scenes';
function recordDeliveredScene(index){
 const id=story.scenes[index]?.id;
 if(!partialScenes||!story.completion.scenes?.includes(id))return;
 try{storage.setItem('betweenlines:scene-finished:'+story.id+':'+story.completion.chapter+':'+id,'true');}catch{}
}
const videos=new VideoLayer($('video-stage'),{busy:value=>{engine.buffering=value;},status:message=>{$('media-status').textContent=getLanguage()==='en'&&message?'Video unavailable. Keeping the previous frame.':message;}});
try{muted=storage.getItem('entrelineas:muted')==='true';}catch{}
let preferredAuto=null;
try{const value=storage.getItem('betweenlines:auto');if(value!==null)preferredAuto=value==='true';const volume=JSON.parse(storage.getItem('betweenlines:volume'));if(typeof volume==='number'&&Number.isFinite(volume))sound.volume=Math.max(0,Math.min(1,volume));}catch{}
if(preferredAuto!==null)engine.setAuto(preferredAuto);
$('volume').value=$('volume-settings').value=sound.volume;
const videoOptions=story.videoExport||{};
const marginsKey=videoOptions.defaultMargins?'entrelineas:video:'+story.id:'entrelineas:video';
for(const [side,value]of Object.entries(videoOptions.marginMinimums||{}))if(['top','right','bottom','left'].includes(side)&&Number.isFinite(value))$('safe-'+side).min=String(value);
let margins={top:8,right:14,bottom:16,left:5,...videoOptions.defaultMargins};
try{saved=JSON.parse(storage.getItem(key));const value=JSON.parse(storage.getItem(marginsKey));if(value)for(const k of Object.keys(margins)){const n=Number(value[k]);if(Number.isFinite(n))margins[k]=Math.max(Number($('safe-'+k).min),Math.min(Number($('safe-'+k).max),n));}}catch{}
if(saved?.v===1){const old=[1,4,5,7,8,9,11,12,15,16,18,20,21,22,25,26,27,29,30,31,32,34,36,37,40];const n=old.filter(i=>i<=saved.index).length;saved={...saved,v:2,line:'line-'+Math.max(1,n)};}
if(saved?.line)saved={...saved,line:resolveSavedPassage(story,saved.line)};
if(!story.steps.some(s=>s.type==='text'&&s.id===saved?.line))saved=null;
$('continue').hidden=!saved;
function audioSync(){videos.setPaused(engine.paused||!engine.running);sound.setAtmosphere(story.scenes[Math.round(engine.model.chapter)].atmosphere,{nearWater:engine.model.view==='waterfall'});sound.muted=muted;sound.paused=engine.paused||!!engine.buffering;sound.playing=engine.running;sound.sync();sound.follow?.(engine);}
function setStatus(copy){statusCopy=copy;$('status').textContent=tr(copy);}
function persist(){if(!engine.running)return;const data=engine.checkpoint();if(!data)return;try{storage.setItem(key,JSON.stringify(data));saved=data;setStatus('Lectura guardada en este dispositivo');}catch{setStatus('Guardado local no disponible');}}
function changed(reason){
 if(partialScenes){
  if(reason==='boundary')recordDeliveredScene(engine.step?.sceneIndex);
  if(reason==='step'){
   if(completionStep&&engine.index===completionStep.index+1&&engine.step?.sceneIndex!==completionStep.sceneIndex)recordDeliveredScene(completionStep.sceneIndex);
   completionStep={index:engine.index,sceneIndex:engine.step?.sceneIndex};
  }
 }
 if(reason==='boundary')persist();
 const chapter=engine.step?.sceneIndex??0;if(chapter!==currentMedia){currentMedia=chapter;videos.show(story.scenes[chapter]?.media,story.scenes[chapter+1]?.media);}

 if(reason==='end'){$('ending').hidden=false;$('dialogue').classList.add('inactive');$('pause').disabled=true;$('quick-pause').disabled=true;try{storage.removeItem(key);if(partialScenes){recordDeliveredScene(engine.step?.sceneIndex??completionStep?.sceneIndex);}else if(story.completion?.scope==='scene'){storage.setItem('betweenlines:scene-finished:'+story.id+':'+story.completion.chapter+':'+story.completion.scene,'true');}else{storage.setItem(story.serialized?'betweenlines:chapter-finished:'+story.id+':'+story.availableChapter:'betweenlines:finished:'+story.id,'true');if(story.serialized&&story.completion?.scope!=='chapter'&&story.chapters.every(ch=>ch.status==='available'&&storage.getItem('betweenlines:chapter-finished:'+story.id+':'+ch.id)==='true'))storage.setItem('betweenlines:finished:'+story.id,'true');}}catch{}saved=null;$('continue').hidden=true;sound.stopNotes();setStatus(partialScenes?'Scenes complete.':story.completion?.scope==='scene'?'Scene complete.':'Has llegado al final. Gracias por leer.');}
 if(['step','back'].includes(reason)&&engine.step?.type==='text')persist();
 if(reason==='back'){$('ending').hidden=true;$('pause').disabled=false;}
 paint();audioSync();
 if(scene&&engine.paused&&['back','step','seek'].includes(reason)){scene.draw(0,true);if(reason!=='step')scene.shotDissolve?.animatePausedSeek();}
}
function paint(){
 if(episodeUI){const waiting=typeof engine.boundaryPending==='number';episodeUI.overlay.hidden=!waiting;if(waiting){const chapter=engine.step.sceneIndex;episodeUI.label.textContent=`SCENE ${chapter+1} OF ${story.scenes.length}`;episodeUI.title.textContent=story.scenes[chapter].name;}episodeUI.continuous.checked=!engine.sceneGate;episodeUI.continuous.disabled=record;}
 $('back').disabled=!engine.history.length||(engine.running&&engine.history.length<2&&engine.step?.type==='text');
 const s=engine.step,reading=engine.running&&s?.type==='text';
 $('dialogue').className=reading?(s.kind||'dialogue'):'inactive';
 // Keep the measured panel box while clearing retained prose during authored
 // silent actions. This changes visibility, never the camera's layout reserve.
 $('dialogue').toggleAttribute('data-caption-clear',s?.type==='end'&&partialScenes||s?.type==='action'&&s.caption==='clear');
 $('chapter').textContent=String(Math.round(engine.model.chapter)+1).padStart(2,'0')+' — '+story.scenes[Math.round(engine.model.chapter)].name.toUpperCase();
 if(reading){$('speaker').textContent=s.who?story.characters[s.who].name:tr('Entre líneas');$('speaker').style.color=s.who?story.characters[s.who].color:'#cbd3c8';$('kind').textContent=s.kind==='thought'?tr('PENSAMIENTO'):s.kind==='narration'?tr('NARRACIÓN'):story.characters[s.who].role.toUpperCase();revealText(s.text,engine.revealed);const portrait=$('portrait');portrait.hidden=!s.who;if(s.who&&scene)portrait.src=scene.portraitFor?.(s.who)||scene.portraits[s.who]||story.characters[s.who].portrait||'';if(s.who&&!scene?.portraits[s.who]&&!story.characters[s.who].portrait)portrait.hidden=true;$('cue').textContent=engine.revealed<s.text.length?tr('Toca para revelar'):engine.auto?tr('Lectura automática · toca para avanzar'):tr('Toca para continuar  ▸');}
 $('paused').hidden=!engine.paused||!engine.running;
 const pauseLabel=engine.paused?tr('Continuar'):tr('Pausar');
 $('pause').innerHTML=(engine.paused?'▷':'Ⅱ')+' <span>'+pauseLabel+'</span>';$('pause').setAttribute('aria-label',pauseLabel);$('quick-pause').textContent=engine.paused?'▷':'Ⅱ';$('quick-pause').setAttribute('aria-label',pauseLabel);$('menu-pause').textContent=tr(modalWasPaused?'Continuar':'Pausar');
 const modeLabel=engine.auto?tr('Modo lectura'):tr('Automático');$('mode').innerHTML=(engine.auto?'▣':'▷')+' <span>'+modeLabel+'</span>';$('mode').setAttribute('aria-pressed',String(engine.auto));$('menu-mode').textContent=modeLabel;
 $('mute').innerHTML=(muted?'♪':'♫')+' <span>'+tr(muted?'Sonido apagado':'Sonido activado')+'</span>';$('mute').setAttribute('aria-label',tr(muted?'Activar sonido':'Silenciar'));
 $('menu-fullscreen').textContent=tr(immersive?'Salir de pantalla completa':'Pantalla completa');$('fullscreen').textContent=immersive?'⊡':'⛶';$('fullscreen').setAttribute('aria-label',tr(immersive?'Salir de pantalla completa':'Pantalla completa'));
 $('vertical').innerHTML=tr(record?'Salir de video vertical':'Video vertical')+' <span>9:16</span>';$('vertical').setAttribute('aria-pressed',String(record));
 $('clean').innerHTML=tr(immersive?'Salir del modo inmersivo':'Modo inmersivo')+' <span>'+tr('Ocultar controles')+'</span>';
 updateVisualLock();$('menu-pause').disabled=!engine.running;$('quick-pause').disabled=!engine.running;$('top-mute').textContent=muted?'♪':'♫';$('top-mute').setAttribute('aria-label',tr(muted?'Activar sonido':'Silenciar'));$('top-mute').setAttribute('aria-pressed',String(!muted));$('menu-sound').textContent=tr(muted?'Activar sonido':'Silenciar');$('menu-language').value=getLanguage();
 $('status').textContent=tr(statusCopy);if(scene)$('start').textContent=tr('Empezar historia  →');
 const percent=Math.max(0,Math.round(engine.index/(story.steps.length-1)*100));$('progress').setAttribute('aria-valuenow',percent);$('progress').firstElementChild.style.width=percent+'%';
}
function start(from){const audioTime=from?saved?.audioTime||0:0;completionStep=null;modalWasPaused=false;$('intro').hidden=true;$('ending').hidden=true;$('pause').disabled=false;$('quick-pause').disabled=false;engine.start(from,audioTime);sound.reset(audioTime);sound.unlock().then(audioSync).catch(()=>{});scene?.draw(0,true);layout();}
function dissolve(){if(!scene||story.renderer==='video')return;const source=$('stage').querySelector('canvas');if(!source)return;const copy=document.createElement('canvas');copy.width=source.width;copy.height=source.height;copy.getContext('2d').drawImage(source,0,0);copy.className='scene-snapshot';$('stage').append(copy);requestAnimationFrame(()=>requestAnimationFrame(()=>copy.style.opacity='0'));setTimeout(()=>copy.remove(),700);}
function previous(){if(document.querySelector('dialog[open]'))return;if(!engine.step?.camera?.preventDissolve)dissolve();if(engine.previous(performance.now())){scene?.draw(0,true);sound.reset(engine.totalTime);paint();audioSync();}}
$('back').onclick=previous;
function updateVisualLock(){const reading=engine.running&&engine.step?.type==='text',complete=story.captionPresentation==='ready-complete',ready=captionReady(engine.step,engine.elapsed,engine.revealed,story.captionPresentation),locked=reading&&(engine.revealed>=engine.step.text.length&&engine.visualMotionRemainingMs>0||complete&&!ready);if(complete){$('dialogue').toggleAttribute('data-caption-complete',true);$('dialogue').toggleAttribute('data-caption-clear',!reading||!ready);$('dialogue').setAttribute('aria-hidden',String(!reading||!ready));}$('text-button').disabled=!reading||locked;$('text-button').setAttribute('aria-disabled',String(!reading||locked));if(locked)$('cue').textContent='';}
function advance(){if(document.querySelector('dialog[open]'))return;if(engine.advance(performance.now()))paint();}
function pause(value=!engine.paused){if(!engine.running)return;engine.paused=value;audioSync();paint();}
function openModal(id){modalWasPaused=engine.paused;pause(true);if(id==='history-modal')renderHistory();$(id).showModal();}
 for(const name of ['history','settings']){$('close-'+name).onclick=()=>$(name+'-modal').close();$(name+'-modal').addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))pause(modalWasPaused);});}
function renderHistory(){$('history-content').replaceChildren();if(!engine.history.length)$('history-content').textContent=tr('Los diálogos aparecerán aquí al empezar la historia.');for(const id of engine.history){const s=story.steps.find(s=>s.id===id),p=document.createElement('p'),b=document.createElement('strong');b.textContent=s.kind==='narration'?tr('Narración'):story.characters[s.who].name+(s.kind==='thought'?tr(' · pensamiento'):'');p.append(b,document.createTextNode(s.text));$('history-content').append(p);}}
$('start').onclick=()=>{const params=new URLSearchParams(location.search),selected=Number(params.get('scene'));start(params.has('scene')&&Number.isInteger(selected)&&selected>=0&&selected<story.scenes.length?story.scenes[selected].steps[0].id:undefined);};$('continue').onclick=()=>{if(saved){engine.setAuto(preferredAuto??saved?.auto===true);start(saved.line);}};$('again').onclick=()=>{const i=Number(new URLSearchParams(location.search).get('scene'));start(new URLSearchParams(location.search).has('scene')&&Number.isInteger(i)&&story.scenes[i]?story.scenes[i].steps[0].id:undefined);};$('text-button').onclick=advance;$('stage').onclick=advance;
$('pause').onclick=$('quick-pause').onclick=()=>pause();$('mode').onclick=()=>{engine.setAuto(!engine.auto);persist();paint();};$('history').onclick=()=>openModal('history-modal');$('settings').onclick=$('show-controls').onclick=()=>openModal('settings-modal');
$('menu-pause').onclick=()=>{const next=!modalWasPaused;modalWasPaused=next;$('settings-modal').close();pause(next);};$('menu-mode').onclick=()=>{engine.setAuto(!engine.auto);persist();paint();};$('menu-history').onclick=()=>{const was=modalWasPaused;$('settings-modal').close();openModal('history-modal');modalWasPaused=was;};
$('restart').onclick=()=>{$('settings-modal').close();start();};
$('mute').onclick=()=>{muted=!muted;try{storage.setItem('entrelineas:muted',String(muted));}catch{}sound.unlock().then(audioSync).catch(()=>setStatus('El navegador no pudo activar el sonido.'));paint();};
$('menu-sound').onclick=$('top-mute').onclick=()=>$('mute').click();
for(const id of ['volume','volume-settings'])$(id).oninput=e=>{sound.volume=Number(e.target.value);$('volume').value=$('volume-settings').value=e.target.value;try{storage.setItem('betweenlines:volume',String(sound.volume));}catch{}audioSync();};
function setImmersive(value){immersive=value;document.body.classList.toggle('immersive',value);paint();layout();}
async function toggleFullscreen(){if(fullscreenBusy)return;fullscreenBusy=true;try{if(immersive){if(document.fullscreenElement)await document.exitFullscreen();setImmersive(false);}else {setImmersive(true);if(document.documentElement.requestFullscreen){try{await document.documentElement.requestFullscreen({navigationUI:'hide'});}catch{/* Visible-area immersive fallback remains active. */}}}}finally{fullscreenBusy=false;layout();}}
const progress=$('progress');progress.tabIndex=0;progress.setAttribute('role','slider');progress.setAttribute('aria-label','Reading progress');
function seekProgress(fraction){if(!engine.running)return;const index=Math.round(Math.max(0,Math.min(1,fraction))*(story.steps.length-1)),target=story.steps.slice(0,index+1).findLast(s=>s.type==='text')||story.steps.find(s=>s.type==='text');if(target&&engine.seek(target.id)){scene?.draw(0,true);scene?.shotDissolve?.animatePausedSeek();sound.reset(engine.totalTime);paint();audioSync();}}
progress.onclick=event=>{const b=progress.getBoundingClientRect();seekProgress((event.clientX-b.left)/b.width);};
progress.onkeydown=event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();event.stopPropagation();seekProgress(event.key==='Home'?0:event.key==='End'?1:engine.index/(story.steps.length-1)+(event.key==='ArrowLeft'?-.02:.02));};
$('fullscreen').onclick=toggleFullscreen;$('menu-fullscreen').onclick=()=>{$('settings-modal').close();toggleFullscreen();};
document.addEventListener('fullscreenchange',()=>{setImmersive(!!document.fullscreenElement);});
$('clean').onclick=()=>{$('settings-modal').close();if(immersive&&document.fullscreenElement)toggleFullscreen();else setImmersive(!immersive);};
function portraitPlayback(){engine.sceneGate=false;engine.setAuto(true);if(typeof engine.boundaryPending==='number'){modalWasPaused=false;engine.continueScene();}}
$('vertical').onclick=()=>{aspectLock.setMode('auto',false);record=!record;document.body.classList.toggle('record',record);if(record)portraitPlayback();else if(story.episodes){try{engine.sceneGate=storage.getItem('betweenlines:continuous:'+story.id)==='false';}catch{engine.sceneGate=false;}}$('settings-modal').close();lastLayout='';paint();layout();};
for(const k of Object.keys(margins)){$('safe-'+k).value=margins[k];$('safe-'+k+'-value').value=margins[k]+'%';$('safe-'+k).oninput=e=>{margins[k]=Number(e.target.value);$('safe-'+k+'-value').value=margins[k]+'%';try{storage.setItem(marginsKey,JSON.stringify(margins));}catch{}lastLayout='';layout();};}
function layout(immediate=false){cancelAnimationFrame(layoutFrame);const apply=()=>{
 aspectLock.resize();
 const videoScale=Math.min(innerWidth/390,innerHeight/(390*16/9));document.body.style.setProperty('--record-scale',videoScale);document.body.style.setProperty('--record-controls-scale',Math.max(1,1/videoScale));
 const player=$('player'),w=player.clientWidth,h=player.clientHeight;
 for(const k of Object.keys(margins))player.style.setProperty('--video-'+k,Math.round((k==='top'||k==='bottom'?h:w)*margins[k]/100)+'px');
 const signature=[w,h,record,getLanguage(),...Object.values(margins)].join(':');
 if(signature!==lastLayout){lastLayout=signature;const measure=$('measure');measure.style.width=$('text-button').clientWidth+'px';const font=getComputedStyle($('text'));measure.style.font=font.font;measure.style.lineHeight=font.lineHeight;let max=0;for(const s of story.steps)if(s.text){measure.textContent=s.text;max=Math.max(max,measure.offsetHeight);}const padding=record?(videoOptions.captionPadding??106):h<=500&&w>700?78:118;player.style.setProperty('--dialogue-height',Math.ceil(max+padding)+'px');}
 if(scene){scene.readingHeight=Math.max(110,$('dialogue').offsetTop-$('stage').offsetTop-(record?h*margins.top/100:0)-20);scene.safeTopInset=record?h*margins.top/100:0;scene.safeCenterOffset=record?w*(margins.right-margins.left)/200:0;scene.safeWidth=record?w*(1-(margins.left+margins.right)/100):w;scene.scale.resize(Math.max(1,$('stage').clientWidth),Math.max(1,$('stage').clientHeight));scene.draw(0,true);}
 };if(immediate===true)apply();else layoutFrame=requestAnimationFrame(apply);}
new ResizeObserver(layout).observe($('player'));window.addEventListener('resize',layout);window.visualViewport?.addEventListener('resize',layout);
$('language').onchange=e=>{engine.changeLanguage(()=>setLanguage(e.target.value));if($('history-modal').open)renderHistory();layout();};
$('menu-language').onchange=$('language').onchange;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.querySelector('dialog[open]')){if(immersive&&!document.fullscreenElement)setImmersive(false);else if(record)openModal('settings-modal');}if([' ','Enter','ArrowRight'].includes(e.key)&&!e.repeat&&!['INPUT','A','SELECT','TEXTAREA'].includes(e.target.tagName)&&(e.key==='ArrowRight'||e.target.tagName!=='BUTTON')&&!document.querySelector('dialog[open]')){e.preventDefault();if(!engine.running&&!$('intro').hidden)$('start').click();else advance();}if(e.key==='ArrowLeft'&&!e.repeat&&!['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)&&!document.querySelector('dialog[open]')){e.preventDefault();previous();}if(e.key.toLowerCase()==='p'&&!document.querySelector('dialog[open]')&&!['INPUT','SELECT'].includes(e.target.tagName))pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&engine.running&&!fullscreenBusy){pause(true);persist();}});
setLanguage(getLanguage());
if(story.serialized){
 const index=story.chapters.findIndex(ch=>ch.id===story.availableChapter),chapter=story.chapters[index],next=story.chapters[index+1],slug=encodeURIComponent(story.seriesSlug);
 $('intro').querySelector('.eyebrow').textContent=(story.presentation?.eyebrow||`HOMER · CHAPTER ${chapter.number}`);$('intro').querySelector('p').textContent=chapter.title+' — '+story.intro;
 $('ending').querySelector('.eyebrow').textContent=next||story.completion?.scope==='chapter'?`CHAPTER ${chapter.number} COMPLETE`:'STORY COMPLETE';$('ending').querySelector('p').textContent=next?'Next: '+next.title+(next.status==='available'?'':' · In preparation'):'Thank you for reading.';$('again').textContent='Read chapter again';
 if(next?.status==='available'){const advance=document.createElement('a');advance.id='next-chapter';advance.className='primary chapter-library-link';advance.href=`reader.html?story=${slug}&chapter=${encodeURIComponent(next.id)}&start=1`;advance.textContent=`Continue to chapter ${next.number} →`;advance.addEventListener('click',event=>{if(!document.fullscreenElement)return;event.preventDefault();engine.paused=true;sound.stopNotes();const frame=document.createElement('iframe');frame.id='chapter-reader';frame.title='Next chapter';frame.src=advance.href;frame.allow='fullscreen; autoplay';frame.style.cssText='position:fixed;inset:0;width:100%;height:100%;border:0;z-index:2147483647;background:#101e24';document.body.append(frame);});$('ending').querySelector('.end-inner').insertBefore(advance,$('again'));}
 const link=document.createElement('a');link.href='./#story/'+slug;link.textContent='View chapters';link.className='chapter-library-link';$('ending').querySelector('.end-inner').append(link);document.querySelector('.library-return').href='./#story/'+slug;
}
if(story.completion?.scope==='scene'||partialScenes){
 $('intro').querySelector('.eyebrow').textContent=story.presentation?.eyebrow||'A SCENE';
 $('ending').querySelector('.eyebrow').textContent=partialScenes?'SCENES COMPLETE':'SCENE COMPLETE';
 $('ending').querySelector('p').textContent='The next scene is not yet available.';
 $('again').textContent=partialScenes?'Read again':'Read scene again';
}
paint();
videos.prepare(story.scenes[0]?.media);videos.prepare(story.scenes[1]?.media);
if(story.ambientAudio?.src)sound.ambientUrl=story.ambientAudio.src;
class VideoClock extends Phaser.Scene{constructor(engine,ready){super('video-clock');this.reader=engine;this.ready=ready;this.portraits={};}create(){this.ready(this);}draw(){}diagnostics(){return null;}update(_,delta){const dt=Math.min(delta,100);this.reader.tick(dt);if(!this.reader.paused&&!this.reader.buffering)this.onTick?.(dt);}}
const Renderer=story.renderer==='video'?VideoClock:await loadRenderer();
const workshop=new Renderer(engine,s=>{scene=s;$('start').disabled=false;$('continue').disabled=false;if(new URLSearchParams(location.search).get('resume')==='1'&&saved)$('continue').click();paint();layout();scene.onTick=dt=>{if(engine.running&&!engine.paused)sound.tick(dt,engine);if(engine.step?.type==='text'&&engine.running){revealText(engine.step.text,engine.revealed);$('cue').textContent=engine.revealed<engine.step.text.length?tr('Toca para revelar'):engine.auto?tr('Lectura automática · toca para avanzar'):tr('Toca para continuar  ▸');updateVisualLock();}};});
const game=new Phaser.Game({type:Phaser.CANVAS,parent:'stage',width:800,height:480,pixelArt:true,roundPixels:true,antialias:false,backgroundColor:'#11242b',scale:{mode:Phaser.Scale.NONE},scene:workshop,audio:{noAudio:true},banner:false});
// Read-only state supports reproducible continuity checks without shipping test controls.
window.reader={get state(){return {idx:engine.index,id:engine.step?.id,elapsed:engine.elapsed,shown:engine.revealed,playing:engine.running,paused:engine.paused,auto:engine.auto,kind:engine.step?.type,history:[...engine.history],model:structuredClone(engine.model),framing:scene?.diagnostics(),audio:sound.diagnostics(),immersive,record,aspectRatio:aspectLock.mode,buffering:!!engine.buffering};},story};
document.querySelector('.library-return').addEventListener('click',()=>{persist();sound.paused=true;sound.sync();});
for(const id of ['mode','menu-mode'])$(id).addEventListener('click',()=>{preferredAuto=engine.auto;try{storage.setItem('betweenlines:auto',String(engine.auto));}catch{}});
document.addEventListener('pointerdown',()=>{if(engine.running)sound.unlock().then(audioSync).catch(()=>{});},{once:true});
document.addEventListener('keydown',()=>{if(engine.running)sound.unlock().then(audioSync).catch(()=>{});},{once:true});
if(story.episodes){
 const section=document.createElement('section');section.className='episode-settings';
 section.innerHTML='<h3>Story scenes</h3><label class="episode-continuous"><input id="continuous-story" type="checkbox" checked> Read continuously</label><label class="episode-select">Scene <select id="episode-scene"></select></label><div class="episode-buttons"><button id="jump-scene">Read this scene</button><button id="record-scene">Portrait reading · 9:16</button></div><p>Portrait reading continues through all scenes. Export a scene above to create an individual video.</p>';
 $('settings-modal').insertBefore(section,$('vertical'));
 for(const[i,chapter]of story.scenes.entries()){const option=document.createElement('option');option.value=i;option.textContent=`${i+1}. ${chapter.name} · ~${Math.round(Number.isFinite(chapter.estimatedSeconds)?chapter.estimatedSeconds:videoDuration(story,story.steps.filter(step=>step.sceneIndex===i))/1000)} sec`;section.querySelector('select').append(option);}
 const overlay=document.createElement('div');overlay.id='chapter-break';overlay.className='overlay';overlay.hidden=true;overlay.innerHTML='<div class="episode-inner"><span class="eyebrow" id="episode-label"></span><h2 id="episode-title"></h2><p>The story continues.</p><div class="episode-actions"><button class="primary" id="next-scene">Next scene</button><a href="./#home">Return to the library</a></div><p class="episode-capture-note">Read the complete story at Pixel Nook.</p></div>';$('player').append(overlay);
 episodeUI={overlay,label:$('episode-label'),title:$('episode-title'),continuous:$('continuous-story')};
 const captureEnd=document.createElement('p');captureEnd.className='episode-capture-note';captureEnd.textContent='Read more quiet stories at Pixel Nook.';$('ending').querySelector('.end-inner').append(captureEnd);
 try{engine.sceneGate=storage.getItem('betweenlines:continuous:'+story.id)==='false';}catch{}
 episodeUI.continuous.checked=!engine.sceneGate;
 episodeUI.continuous.onchange=e=>{engine.sceneGate=record?false:!e.target.checked;try{storage.setItem('betweenlines:continuous:'+story.id,String(e.target.checked));}catch{}if(e.target.checked&&typeof engine.boundaryPending==='number')engine.continueScene();};
 $('next-scene').onclick=()=>{sound.unlock().then(audioSync).catch(()=>{});engine.continueScene();scene?.draw(0,true);layout();};
 $('jump-scene').onclick=()=>{const index=Number($('episode-scene').value);modalWasPaused=false;$('settings-modal').close();start(story.scenes[index].steps[0].id);};
 $('record-scene').onclick=()=>{aspectLock.setMode('auto',false);const index=Number($('episode-scene').value);modalWasPaused=false;$('settings-modal').close();record=true;document.body.classList.add('record');portraitPlayback();start(story.scenes[index].steps[0].id);lastLayout='';paint();layout();};
}


const themeRow=document.createElement('label');themeRow.className='reader-theme';themeRow.innerHTML='Dark mode <input id="reader-dark-mode" type="checkbox">';$('settings-modal').insertBefore(themeRow,$('settings-modal').querySelector('.menu-actions'));
const themeToggle=$('reader-dark-mode');themeToggle.checked=document.documentElement.dataset.theme==='dark';themeToggle.onchange=()=>window.PixelNookTheme.set(themeToggle.checked?'dark':'light');window.addEventListener('themechange',()=>{themeToggle.checked=document.documentElement.dataset.theme==='dark';});
if(story.fileAudio){
 const note=document.createElement('p');note.id='file-audio-status';note.textContent=story.fileAudio.available?'Scene 1 · local MP3 soundtrack':'Scene 1 audio is waiting for the four local MP3 files.';$('settings-modal').insertBefore(note,$('settings-modal').querySelector('.menu-actions'));
 window.addEventListener('pagehide',()=>sound.close?.());
}
installVideoExport({story,Renderer,getMargins:()=>({...margins})});

