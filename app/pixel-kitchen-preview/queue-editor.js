import {pngBytes,sha256} from './handoff-codec.js';
const $=s=>document.querySelector(s),panel=$('#kitchen');
let tasks,task,base,mode,rgba,undo=[],redo=[],tool='pencil',color='#000000',stroke,loadVersion=0;
const canvas=$('#pixel-editor'),ctx=canvas.getContext('2d',{willReadFrequently:true});
const hex=p=>'#'+[...p].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
function message(s){$('#queue-status').textContent=s;$('#handoff-message').textContent=s;}
function invalidate(){ $('#handoff').value='';$('#download-handoff').disabled=true; }
function draw(invalidateHandoff=true){ctx.putImageData(new ImageData(new Uint8ClampedArray(rgba),canvas.width,canvas.height),0,0);$('#undo').disabled=!undo.length;$('#redo').disabled=!redo.length;if(invalidateHandoff)invalidate();}
const original=$('#original-large');
const editorView={surface:$('#editor-scroll'), image:canvas, size:()=>[canvas.width,canvas.height]};
const originalView={surface:$('#original-scroll'), image:original, size:()=>[original.naturalWidth,original.naturalHeight]};
const views=[originalView,editorView];
let activeView=editorView;
let originalPixels;
const mobile=matchMedia('(max-width:768px), (pointer:coarse) and (orientation:landscape) and (max-width:1100px)');

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
 const t=tasks.find(t=>t.taskId===id);const m=which||(t.bases.chef?'chef':'cook');const b=t.bases[m];
 if(!b)throw Error('This candidate is not prepared yet.');
 const raw=new Uint8Array(await (await fetch(`./queue/${b.url}`)).arrayBuffer());if(await sha256(raw)!==b.sha256)throw Error('Base hash mismatch. Reload this release.');
 if(version!==loadVersion)return;
 task=t;base=b;mode=m;rgba=Uint8Array.from(b.rgba);undo=[];redo=[];canvas.width=b.dimensions[0];canvas.height=b.dimensions[1];
 const originalUrl=new URL('./queue/'+t.original.url,location.href).href;
 if(original.src!==originalUrl){
  originalPixels=null;
  original.src=originalUrl;
  resetView(originalView);
 }
 $('#original-size').textContent='Original · '+t.original.dimensions.join(' × ')+' px';
 $('#base-select').value=m;$('#base-select option[value=chef]').disabled=!t.bases.chef;
 $('#native-size').textContent=`${mode==='chef'?'Chef candidate':'Pure Cook'} · ${b.dimensions.join(' × ')} native pixels`;
 $('#task-select').value=id;$('#copy-handoff').disabled=t.status!=='active';
 draw();resetView(editorView);message(t.status==='active'?'Active task · edits stay in this browser until you copy the handoff.':'Waiting task · inspect Cook now; Chef prepares it after the active task.');
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
 const changes=[];for(let i=0;i<rgba.length;i+=4)if([0,1,2,3].some(k=>rgba[i+k]!==base.rgba[i+k]))changes.push({x:(i/4)%canvas.width,y:Math.floor(i/4/canvas.width),hex:hex(rgba.slice(i,i+4))});
 const handoff={schemaVersion:'pixel-kitchen-handoff/1',hashEncoding:'pk-rgba-png/1',taskId:task.taskId,assetId:task.assetId,baseRevision:base.revision,baseSha256:base.sha256,editedFrom:mode,comparisonBase:mode,expectedCurrent:task.expectedCurrent,canvas:[canvas.width,canvas.height],changes,finalSha256:await sha256(pngBytes(canvas.width,canvas.height,rgba))};
 const text=JSON.stringify(handoff);$('#handoff').value=text;$('#download-handoff').disabled=false;$('#handoff-backup').classList.add('open');
 try{await navigator.clipboard.writeText(text);message('Copied. Paste into your Chef chat on PC. No Final has been adopted yet.');}catch{message('Clipboard unavailable. Select the text below or download JSON, then paste it into your Chef chat.');}
 }catch(e){message(e.message);}
};
$('#download-handoff').onclick=()=>{const u=URL.createObjectURL(new Blob([$('#handoff').value],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download=`${task.taskId}-chef-handoff.json`;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};
try{const r=await fetch('./queue/queue.json');if(!r.ok)throw Error('Queue unavailable');tasks=(await r.json()).tasks;$('#task-select').replaceChildren(...tasks.map(t=>new Option(`${t.label} — ${t.status}`,t.taskId)));await load((tasks.find(t=>t.status==='active')||tasks[0]).taskId);}catch(e){message(e.message);}
