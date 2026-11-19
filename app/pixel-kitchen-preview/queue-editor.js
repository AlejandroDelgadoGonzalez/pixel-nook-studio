import {pngBytes,sha256} from './handoff-codec.js';
const $=s=>document.querySelector(s),panel=$('#kitchen');
let tasks,task,base,mode,rgba,undo=[],redo=[],tool='pencil',color='#000000',stroke,loadVersion=0;
const canvas=$('#pixel-editor'),ctx=canvas.getContext('2d',{willReadFrequently:true});
const hex=p=>'#'+[...p].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
function message(s){$('#queue-status').textContent=s;$('#handoff-message').textContent=s;}
let approvedPng;
function invalidate(){
 $('#handoff').value='';
 $('#download-handoff').disabled=true;
 $('#download-mannequin').hidden=true;
 approvedPng=undefined;
}
function draw(invalidateHandoff=true){ctx.putImageData(new ImageData(new Uint8ClampedArray(rgba),canvas.width,canvas.height),0,0);$('#undo').disabled=!undo.length;$('#redo').disabled=!redo.length;if(invalidateHandoff)invalidate();}
const original=$('#original-large');
const editorView={surface:$('#editor-scroll'), image:canvas, size:()=>[canvas.width,canvas.height]};
const originalView={surface:$('#original-scroll'), image:original, size:()=>[original.naturalWidth,original.naturalHeight]};
const views=[originalView,editorView];
let activeView=editorView;
let originalPixels;
const mobile=matchMedia('(max-width:768px), (pointer:coarse) and (orientation:landscape) and (max-width:1100px)');

const skinGuide = $('#skin-guide'), jointGuide = $('#joint-guide');
const guidePath = '../../concept_art/mannequins/human/';
const candidatePath = '../../concept_art/mannequins/candidates/';
let candidateRigs = {}, guideRig;
function updateGuide() {
 const mannequin = mode==='mannequin';
 const view = mannequin ? task.taskId : $('#guide-pose').value;
 const enabled = Boolean(view && task && canvas.width === 64);
 $('#guide-controls').hidden = Boolean(task && canvas.width !== 64);
 $('#guide-pose').disabled=mannequin;
 const layerVisible = $(mannequin ? '#guide-visible' : '#character-visible').checked;
 const referenceVisible = $(mannequin ? '#character-visible' : '#guide-visible').checked;
 skinGuide.hidden = !enabled || !referenceVisible;
 canvas.style.visibility = layerVisible ? '' : 'hidden';
 const joints = candidateRigs[view]?.joints || guideRig?.views[view]?.joints;
 $('#guide-opacity-value').textContent = $('#guide-opacity').value + '%';
 jointGuide.hidden = !enabled || !joints || !$('#joints-visible').checked;
 $('#stamp-skin').hidden = mannequin;
 $('#stamp-skin').disabled = mannequin || !enabled || !skinGuide.complete || !skinGuide.naturalWidth;
 skinGuide.style.opacity = $('#guide-opacity').value / 100;
 if (!enabled || !joints) return;
 const marks = jointGuide.getContext('2d');
 marks.clearRect(0,0,64,64);
 marks.fillStyle='#00daf7';
 for(const points of Object.values(joints)){
  for(const [x,y] of points) marks.fillRect(x,y,1,1);
 }
}
const candidateLabels = {
 'candidate-alice': 'Candidate A · Alice Mannequin (Front)',
 'candidate-odysseus': 'Candidate B · Odysseus Mannequin (Front)'
};
const candidateReady = fetch(candidatePath+'candidate-rigs.json').then(response=>{
 if(!response.ok) throw Error('Candidate joint data unavailable');
 return response.json();
}).then(rigs=>{
 candidateRigs=rigs;
 for(const [id,label] of Object.entries(candidateLabels)) $('#guide-pose').add(new Option(label,id));
}).catch(error=>message(error.message));
const guideReady=fetch(guidePath+'mannequin-rig.json').then(r=>r.json()).then(rig=>{
 guideRig=rig;
 for(const view of Object.keys(rig.views)) $('#guide-pose').add(new Option('Human · '+view,view));
}).catch(()=>{ $('#guide-controls summary').textContent='Mannequin guide unavailable'; });
function loadGuide() {
 const view=$('#guide-pose').value;
 const url=mode==='mannequin' ? './queue/'+task.original.url :
  candidateRigs[view] ? candidatePath+candidateRigs[view].filename :
  view ? guidePath+encodeURIComponent(view)+'.png' : null;
 if(url) skinGuide.src=url;
 else skinGuide.removeAttribute('src');
 updateGuide();
}
$('#guide-pose').onchange=loadGuide;
skinGuide.onload=updateGuide;
for(const id of ['#character-visible','#guide-visible','#joints-visible','#guide-opacity']) $(id).oninput=updateGuide;
$('#stamp-skin').onclick=()=>{
 if($('#stamp-skin').disabled)return;
 const buffer=document.createElement('canvas');
 buffer.width=buffer.height=64;
 const context=buffer.getContext('2d');
 context.drawImage(skinGuide,0,0);
 undo.push(rgba.slice()); redo=[];
 rgba=new Uint8Array(context.getImageData(0,0,64,64).data);
 draw();
};

function renderView(view){
 const {surface,image}=view;
 const [width,height]=view.size();
 if(!width||!height||!surface.clientWidth||!surface.clientHeight)return;
 view.scale=Math.min(surface.clientWidth/width,surface.clientHeight/height)*view.zoom;
 const w=width*view.scale,h=height*view.scale;
 const clamp=(offset,available,size)=>size<=available?(available-size)/2:Math.max(available-size,Math.min(0,offset));
 view.x=clamp(view.x,surface.clientWidth,w);
 view.y=clamp(view.y,surface.clientHeight,h);
 image.style.width=w+'px';
 image.style.height=h+'px';
 image.style.transform='translate('+view.x+'px,'+view.y+'px)';
 if(view===editorView) for(const layer of [skinGuide,jointGuide]){
  layer.style.width=image.style.width;
  layer.style.height=image.style.height;
  layer.style.transform=image.style.transform;
 }
}
function resetView(view){
 Object.assign(view,{zoom:1,x:0,y:0});
 renderView(view);
}
function zoomAt(view,zoom,anchorX,anchorY,localX,localY){
 view.zoom=Math.min(32,Math.max(1,zoom));
 const [w,h]=view.size();
 const nextScale=Math.min(view.surface.clientWidth/w,view.surface.clientHeight/h)*view.zoom;
 view.x=localX-anchorX*nextScale;
 view.y=localY-anchorY*nextScale;
 renderView(view);
}
function zoomBy(factor){
 const {surface,x,y,scale,zoom}=activeView;
 if(!scale)return;
 const cx=surface.clientWidth/2,cy=surface.clientHeight/2;
 zoomAt(activeView,zoom*factor,(cx-x)/scale,(cy-y)/scale,cx,cy);
}
const observer=new ResizeObserver(()=>views.forEach(renderView));
for(const view of views){resetView(view);observer.observe(view.surface);}
original.addEventListener('load',()=>renderView(originalView));
$('#zoom-in').onclick=()=>zoomBy(1.5);
$('#zoom-out').onclick=()=>zoomBy(1/1.5);
$('#zoom-reset').onclick=()=>resetView(activeView);

function showTools(open){
 $('#editor-dock').hidden=!open;
 $('#tools-toggle').setAttribute('aria-expanded',String(open));
}
$('#tools-toggle').onclick=()=>showTools($('#editor-dock').hidden);
function expand(on){
 panel.classList.toggle('expanded',on);
 document.body.classList.toggle('mobile-edit',on);
 showTools(!on);
}
if(mobile.matches)expand(true);
$('#enter-editor').onclick=async()=>{
 expand(true);
 if(panel.requestFullscreen&&!document.fullscreenElement){
  try{await panel.requestFullscreen();}catch{/* Fixed layout is available even when native fullscreen is denied. */}
 }
};
function leave(){
 expand(false);
 $('#phaser-preview').scrollIntoView();
}
$('#leave-editor').onclick=async()=>{
 if(document.fullscreenElement===panel)await document.exitFullscreen();
 leave();
};
let nativeFullscreen=false;
document.addEventListener('fullscreenchange',()=>{
 const fullscreen=document.fullscreenElement===panel;
 if(nativeFullscreen&&!fullscreen)leave();
 nativeFullscreen=fullscreen;
});
$('#show-original').onclick=()=>{
 const visible=panel.classList.toggle('show-original');
 activeView=visible?originalView:editorView;
 $('#show-original').textContent=visible?'View Editor':'View Original';
 $('#show-original').setAttribute('aria-pressed',String(visible));
};
$('#close-handoff').onclick=()=>$('#handoff-backup').classList.remove('open');
async function load(id,which){
 const version=++loadVersion;$('#copy-handoff').disabled=true;
 try{
 const t=tasks.find(t=>t.taskId===id);const m=which||(t.bases.blank?'blank':t.bases.mannequin?'mannequin':t.bases.final?'final':t.bases.chef?'chef':'cook');const b=t.bases[m];
 if(!b)throw Error('This candidate is not prepared yet.');
 const blank=m==='blank';
 if(!blank){
  const response=await fetch(m==='mannequin'?candidatePath+b.url:'./queue/'+b.url);
  if(!response.ok)throw Error('Base PNG unavailable.');
  const raw=new Uint8Array(await response.arrayBuffer());
  if(await sha256(raw)!==b.sha256)throw Error('Base hash mismatch. Reload this release.');
  if(m==='mannequin'){
   const bitmap=await createImageBitmap(new Blob([raw],{type:'image/png'}));
   const buffer=document.createElement('canvas');
   buffer.width=buffer.height=64;
   const context=buffer.getContext('2d');
   context.drawImage(bitmap,0,0);
   bitmap.close();
   b.rgba=context.getImageData(0,0,64,64).data;
  }
 }
 if(version!==loadVersion)return;
 task=t;base=b;mode=m;rgba=Uint8Array.from(b.rgba);undo=[];redo=[];canvas.width=b.dimensions[0];canvas.height=b.dimensions[1];
 $('#editor-scroll').classList.toggle('blank-character',blank);
 if(blank){
  await guideReady;
  if(version!==loadVersion)return;
  $('#guide-visible').checked=true;
 }
 const originalUrl=new URL(blank?guidePath+'front.png':'./queue/'+t.original.url,location.href).href;
 if(original.src!==originalUrl){
  originalPixels=null;
  original.src=originalUrl;
  resetView(originalView);
 }
 $('#original-size').textContent='Original · '+t.original.dimensions.join(' × ')+' px';
 const labels={mannequin:'Mannequin candidate',blank:'Blank canvas',chef:'Chef candidate',cook:'Pure Cook',final:'Final (Approved)'};
 $('#base-select').replaceChildren(...Object.keys(labels).filter(key=>t.bases[key]).map(key=>new Option(labels[key],key)));
 $('#base-select').value=m;
 $('#native-size').textContent=`${labels[mode]} · ${b.dimensions.join(' × ')} native pixels`;
 $('#task-select').value=id;$('#copy-handoff').disabled=!(blank||m==='mannequin'||t.status==='review'||t.status==='active'||(m==='final'&&t.adoptedFinal));
 $('#copy-handoff').textContent=blank?'Download character PNG':t.status==='review'?'Copy Draft Handoff':'Approve & Copy Chef Handoff';
 loadGuide();draw();resetView(editorView);message(m==='mannequin'?'Edit the candidate and approve your revision for Chef.':blank?'Draw or stamp the mannequin, then download your character.':t.status==='active'?'Active task · edits stay in this browser until you copy the handoff.':t.status==='review'?'Draft review · copy your edits for Chef. Final approval requires source and geometry validation.':t.status==='complete'?'Completed task · choose the adopted Final to submit another edit.':'Waiting task · inspect Cook now; Chef prepares it after the active task.');
 }catch(e){message(e.message);}
}
function setTool(){
 for(const button of panel.querySelectorAll('[data-tool]')){
  button.setAttribute('aria-pressed',String(button.dataset.tool===tool));
 }
}
function pickColor(view,x,y){
 let pixel;
 if(view===editorView){
  const i=(y*canvas.width+x)*4;
  pixel=rgba.subarray(i,i+4);
 }else{
  if(!original.complete)return;
  if(!originalPixels){
   const pixels=document.createElement('canvas');
   [pixels.width,pixels.height]=view.size();
   originalPixels=pixels.getContext('2d',{willReadFrequently:true});
   originalPixels.drawImage(original,0,0);
  }
  pixel=originalPixels.getImageData(x,y,1,1).data;
 }
 if(pixel[3]){
  color=hex(pixel.slice(0,3));
  $('#paint-color').value=color;
 }
}
function touchPixel(view,point,action){
 const bounds=view.image.getBoundingClientRect();
 const [w,h]=view.size();
 const x=Math.floor((point.clientX-bounds.left)/view.scale);
 const y=Math.floor((point.clientY-bounds.top)/view.scale);
 if(x<0||y<0||x>=w||y>=h)return;
 if(action==='eyedropper'){pickColor(view,x,y);return;}
 if(view!==editorView||!stroke)return;
 const next=action==='eraser'?[0,0,0,0]:[...color.slice(1).match(/../g).map(v=>parseInt(v,16)),255];
 rgba.set(next,(y*w+x)*4);
 draw(false);
}
function cancelStroke(){
 if(!stroke)return;
 rgba=stroke;
 stroke=null;
 draw(false);
}

const pointers=new Map();
let interaction;
function pair(){
 const [a,b]=pointers.values();
 return {
  x:(a.clientX+b.clientX)/2,
  y:(a.clientY+b.clientY)/2,
  distance:Math.max(1,Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY))
 };
}
function pointerDown(view,event){
 if(!base||!view.scale||![0,1].includes(event.button))return;
 event.preventDefault();
 view.surface.setPointerCapture(event.pointerId);
 pointers.set(event.pointerId,event);
 if(pointers.size===2){
  cancelStroke();
  const p=pair(), owner=interaction.view, bounds=owner.image.getBoundingClientRect();
  interaction.multitouch=true;
  interaction.gesture={
   zoom:owner.zoom,distance:p.distance,
   anchorX:(p.x-bounds.left)/owner.scale,anchorY:(p.y-bounds.top)/owner.scale
  };
  return;
 }
 if(pointers.size!==1)return;
 activeView=view;
 const action=event.button===1?'eyedropper':view===originalView&&tool!=='eyedropper'?'pan':tool;
 interaction={view,action,x:view.x,y:view.y,startX:event.clientX,startY:event.clientY};
 if(action==='pencil'||action==='eraser')stroke=rgba.slice();
 if(action!=='pan')touchPixel(view,event,action);
}
function pointerMove(event){
 if(!pointers.has(event.pointerId))return;
 event.preventDefault();
 pointers.set(event.pointerId,event);
 const {view,action,gesture,multitouch}=interaction;
 if(multitouch){
  if(!gesture||pointers.size!==2)return;
  const p=pair(),bounds=view.surface.getBoundingClientRect();
  zoomAt(view,gesture.zoom*p.distance/gesture.distance,gesture.anchorX,gesture.anchorY,p.x-bounds.left,p.y-bounds.top);
  return;
 }
 if(action==='pan'){
  view.x=interaction.x+event.clientX-interaction.startX;
  view.y=interaction.y+event.clientY-interaction.startY;
  renderView(view);
 }else if(action!=='eyedropper'){
  touchPixel(view,event,action);
 }
}
function pointerEnd(event){
 if(!pointers.delete(event.pointerId))return;
 interaction.gesture=null;
 if(pointers.size)return;
 if(event.type!=='pointerup')cancelStroke();
 if(stroke&&stroke.some((value,i)=>value!==rgba[i])){
  undo.push(stroke);
  redo=[];
  draw();
 }
 stroke=null;
 interaction=null;
}
for(const view of views){
 const {surface}=view;
 surface.addEventListener('pointerdown',event=>pointerDown(view,event));
 surface.addEventListener('pointermove',pointerMove);
 for(const type of ['pointerup','pointercancel','lostpointercapture'])surface.addEventListener(type,pointerEnd);
 for(const type of ['mousedown','auxclick','contextmenu','touchmove','gesturestart','gesturechange','gestureend']){
  surface.addEventListener(type,event=>event.preventDefault(),{passive:false});
 }
}
for(const button of panel.querySelectorAll('[data-tool]'))button.onclick=()=>{
 tool=button.dataset.tool;
 setTool();
};
$('#paint-color').oninput=event=>{color=event.target.value;tool='pencil';setTool();};
$('#undo').onclick=()=>{if(undo.length){redo.push(rgba.slice());rgba=undo.pop();draw();}};
$('#redo').onclick=()=>{if(redo.length){undo.push(rgba.slice());rgba=redo.pop();draw();}};
function switchBase(id,m){if(undo.length&&!confirm('Discard unsent edits and change the review base?')){$('#task-select').value=task.taskId;$('#base-select').value=mode;return;}load(id,m);}
$('#task-select').onchange=e=>switchBase(e.target.value);$('#base-select').onchange=e=>switchBase(task.taskId,e.target.value);
$('#copy-handoff').onclick=async()=>{
 try{
 if(mode==='blank'){
  const link=document.createElement('a');
  link.href=canvas.toDataURL('image/png');
  link.download='new-character.png';
  link.click();
  return;
 }
 const mannequin=mode==='mannequin';
 const draft=task.status==='review'||mannequin;
 const changes=[];for(let i=0;i<rgba.length;i+=4)if([0,1,2,3].some(k=>rgba[i+k]!==base.rgba[i+k]))changes.push({x:(i/4)%canvas.width,y:Math.floor(i/4/canvas.width),hex:hex(rgba.slice(i,i+4))});
 const png=pngBytes(canvas.width,canvas.height,rgba);
 const handoff={schemaVersion:draft?'pixel-kitchen-draft-handoff/1':'pixel-kitchen-handoff/1',hashEncoding:'pk-rgba-png/1',taskId:task.taskId,assetId:task.assetId,baseRevision:base.revision,baseSha256:base.sha256,editedFrom:mode,comparisonBase:mode,expectedCurrent:task.expectedCurrent,canvas:[canvas.width,canvas.height],changes,finalSha256:await sha256(png)};
 if(mannequin){
  handoff.approval='visual';
  approvedPng=png;
  $('#download-mannequin').hidden=false;
 }
 const text=JSON.stringify(handoff);$('#handoff').value=text;$('#download-handoff').disabled=false;$('#handoff-backup').classList.add('open');
 try{await navigator.clipboard.writeText(text);message(mannequin?'Candidate approval copied. Paste it into your Chef chat on PC.':draft?'Draft copied. Paste it into your Chef chat on PC.':'Copied. Paste into your Chef chat on PC. No Final has been adopted yet.');}catch{message('Clipboard unavailable. Select the text below or download JSON, then paste it into your Chef chat.');}
 }catch(e){message(e.message);}
};
$('#download-mannequin').onclick=()=>{
 if(!approvedPng)return;
 const url=URL.createObjectURL(new Blob([approvedPng],{type:'image/png'}));
 const link=document.createElement('a');
 link.href=url;
 link.download=task.taskId+'-edited.png';
 link.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
};
$('#download-handoff').onclick=()=>{const u=URL.createObjectURL(new Blob([$('#handoff').value],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download=`${task.taskId}-chef-handoff.json`;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};
try{const r=await fetch('./queue/queue.json');if(!r.ok)throw Error('Queue unavailable');const review=await fetch('./queue/review-queue.json');if(!review.ok)throw Error('Review queue unavailable');tasks=[...(await r.json()).tasks,...(await review.json()).tasks];tasks.push({taskId:'new-character',label:'New Character (Blank 64x64)',status:'blank',original:{dimensions:[64,64]},bases:{blank:{dimensions:[64,64],rgba:new Uint8Array(64*64*4)}}});
 await candidateReady;
 for(const [id,rig] of Object.entries(candidateRigs)){
  tasks.push({taskId:id,assetId:id,label:candidateLabels[id],status:'candidate',
   original:{url:rig.sourceUrl,dimensions:[64,64]},
   bases:{mannequin:{url:rig.filename,sha256:rig.sha256,revision:rig.sha256.slice(0,24),dimensions:[64,64]}}});
 }
 $('#task-select').replaceChildren(...tasks.map(t=>new Option(['blank','candidate'].includes(t.status)?t.label:`${t.label} — ${t.status}`,t.taskId)));await load((tasks.find(t=>t.status==='active')||tasks.find(t=>t.status==='review')||tasks[0]).taskId);}catch(e){message(e.message);}
