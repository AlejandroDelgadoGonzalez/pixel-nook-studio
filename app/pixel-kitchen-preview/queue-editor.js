import {pngBytes,sha256} from './handoff-codec.js';
const $=s=>document.querySelector(s),panel=$('#kitchen');
let tasks,task,base,mode,rgba,undo=[],redo=[],tool='pencil',color='#000000',stroke,panStart,strokePicker=false,loadVersion=0;
const canvas=$('#pixel-editor'),ctx=canvas.getContext('2d',{willReadFrequently:true});
const hex=p=>'#'+[...p].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
function message(s){$('#queue-status').textContent=s;$('#handoff-message').textContent=s;}
function invalidate(){ $('#handoff').value='';$('#download-handoff').disabled=true; }
function draw(){ctx.putImageData(new ImageData(new Uint8ClampedArray(rgba),canvas.width,canvas.height),0,0);$('#undo').disabled=!undo.length;$('#redo').disabled=!redo.length;invalidate();}
const sc=$('#editor-scroll'), pointers=new Map();
let aim=null, gesture=null, gestureOnly=false, showOriginal=false;
const mobile=()=>matchMedia('(max-width:768px)').matches;
$('#input-mode').value=(navigator.maxTouchPoints>0||matchMedia('(pointer:coarse)').matches)?'crosshair':'direct';
if(mobile()){document.body.classList.add('mobile-edit');document.querySelector('meta[name=viewport]').content='width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover';}
function scale(){return canvas.getBoundingClientRect().width/canvas.width;}
function aimDraw(){const el=$('#crosshair');el.hidden=!aim||showOriginal||$('#input-mode').value!=='crosshair';if(!aim){$('#cursor-position').textContent='Aim, then Paint';return;}const z=scale();Object.assign(el.style,{left:`${aim[0]*z}px`,top:`${aim[1]*z}px`,width:`${z}px`,height:`${z}px`});$('#cursor-position').textContent=`(${aim[0]}, ${aim[1]})`;}
function zoom(){const z=Number($('#pixel-zoom').value);canvas.style.setProperty('width',`${canvas.width*z}px`,'important');canvas.style.setProperty('height',`${canvas.height*z}px`,'important');aimDraw();}
function setZoom(z){$('#pixel-zoom').value=Math.max(.5,Math.min(32,z));zoom();}
$('#pixel-zoom').min=.5;$('#pixel-zoom').max=32;$('#pixel-zoom').step=.01;
function resetZoom(){setZoom(mobile()?sc.clientWidth/canvas.width:4);sc.scrollLeft=0;sc.scrollTop=0;}
$('#zoom-in').onclick=()=>setZoom(scale()*1.5);$('#zoom-out').onclick=()=>setZoom(scale()/1.5);$('#zoom-reset').onclick=resetZoom;
$('#enter-editor').onclick=()=>{document.body.classList.add('mobile-edit');resetZoom();};
$('#leave-editor').onclick=()=>{document.body.classList.remove('mobile-edit');$('#phaser-preview').scrollIntoView();};
$('#close-handoff').onclick=()=>$('#handoff-backup').classList.remove('open');
$('#show-original').onclick=()=>{showOriginal=!showOriginal;const el=$('#original-overlay');el.hidden=!showOriginal;Object.assign(el.style,{position:'absolute',left:`${sc.scrollLeft}px`,top:`${sc.scrollTop}px`,width:`${sc.clientWidth}px`,height:`${sc.clientHeight}px`});$('#show-original').textContent=showOriginal?'Return to Editor':'View Original';$('#show-original').setAttribute('aria-pressed',String(showOriginal));aimDraw();};
// Safari gesture events and touch movement stay within this editing surface.
for(const type of ['gesturestart','gesturechange','gestureend','touchmove'])sc.addEventListener(type,e=>e.preventDefault(),{passive:false});
window.addEventListener('resize',()=>{if(base)resetZoom();});
async function load(id,which){
 const version=++loadVersion;$('#copy-handoff').disabled=true;
 try{
 const t=tasks.find(t=>t.taskId===id);const m=which||(t.bases.chef?'chef':'cook');const b=t.bases[m];
 if(!b)throw Error('This candidate is not prepared yet.');
 const raw=new Uint8Array(await (await fetch(`./queue/${b.url}`)).arrayBuffer());if(await sha256(raw)!==b.sha256)throw Error('Base hash mismatch. Reload this release.');
 if(version!==loadVersion)return;
 task=t;base=b;mode=m;rgba=Uint8Array.from(b.rgba);undo=[];redo=[];canvas.width=b.dimensions[0];canvas.height=b.dimensions[1];
 $('#original-large').src=`./queue/${t.original.url}`;$('#original-thumb').src=$('#original-large').src;$('#original-overlay').src=$('#original-large').src;aim=null;$('#original-size').textContent=`Original · ${t.original.dimensions.join(' × ')} px`;
 $('#base-select').value=m;$('#base-select option[value=chef]').disabled=!t.bases.chef;
 $('#native-size').textContent=`${mode==='chef'?'Chef candidate':'Pure Cook'} · ${b.dimensions.join(' × ')} native pixels`;
 $('#task-select').value=id;$('#copy-handoff').disabled=t.status!=='active';
 const colors=[...new Set(Array.from({length:rgba.length/4},(_,i)=>hex(rgba.slice(i*4,i*4+4))).filter(c=>!c.endsWith('00')))];
 $('#palette').replaceChildren(...colors.map(c=>{const el=document.createElement('button');el.style.background=c.slice(0,7);el.title=c;el.setAttribute('aria-label',`Pick ${c}`);el.onclick=()=>{color=c.slice(0,7);$('#paint-color').value=color;tool='pencil';setTool();};return el;}));
 draw();resetZoom();message(t.status==='active'?'Active task · edits stay in this browser until you copy the handoff.':'Waiting task · inspect Cook now; Chef prepares it after the active task.');
 }catch(e){message(e.message);}
}
function setTool(){for(const b of panel.querySelectorAll('[data-tool]'))b.setAttribute('aria-pressed',String(b.dataset.tool===tool));$('#apply-pixel').textContent=tool==='eraser'?'Erase aimed pixel':tool==='eyedropper'?'Pick aimed color':'Paint aimed pixel';}
function pixel(e,offset=0){const r=canvas.getBoundingClientRect();return [Math.floor((e.clientX-r.left)*canvas.width/r.width),Math.floor((e.clientY-offset-r.top)*canvas.height/r.height)];}
function paintAt(x,y){if(tool==='pan'||x<0||y<0||x>=canvas.width||y>=canvas.height)return;const i=(y*canvas.width+x)*4;
 if(tool==='eyedropper'||strokePicker){if(rgba[i+3]){color=hex(rgba.slice(i,i+3));$('#paint-color').value=color;}return;}
 const c=tool==='eraser'?[0,0,0,0]:[...color.slice(1).match(/../g).map(v=>parseInt(v,16)),255];rgba.set(c,i);draw();
}
function commitStroke(){if(stroke&&stroke.some((v,i)=>v!==rgba[i])){undo.push(stroke);redo=[];draw();}stroke=null;}
function aimAt(e){const p=pixel(e,e.pointerType==='touch'?38:0);aim=[Math.max(0,Math.min(canvas.width-1,p[0])),Math.max(0,Math.min(canvas.height-1,p[1]))];aimDraw();}
$('#apply-pixel').onclick=()=>{if(!base||!aim||showOriginal)return;stroke=rgba.slice();strokePicker=false;paintAt(...aim);commitStroke();};
$('#input-mode').onchange=()=>{aimDraw();$('#apply-pixel').hidden=$('#input-mode').value!=='crosshair';};
$('#input-mode').onchange();
function pair(){const [a,b]=[...pointers.values()];return {x:(a.clientX+b.clientX)/2,y:(a.clientY+b.clientY)/2,d:Math.max(1,Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY))};}
sc.addEventListener('pointerdown',e=>{
 if(!base||showOriginal||![0,1].includes(e.button))return;e.preventDefault();sc.setPointerCapture(e.pointerId);pointers.set(e.pointerId,e);
 if(pointers.size===2){aim=null;aimDraw();if(stroke){rgba=stroke;stroke=null;draw();}gestureOnly=true;const p=pair(),r=canvas.getBoundingClientRect();gesture={...p,z:scale(),ax:(p.x-r.left)/scale(),ay:(p.y-r.top)/scale()};return;}
 if(pointers.size>1||gestureOnly)return;
 stroke=rgba.slice();strokePicker=e.button===1;panStart={x:e.clientX,y:e.clientY,left:sc.scrollLeft,top:sc.scrollTop};
 if($('#input-mode').value==='crosshair'&&!strokePicker)aimAt(e);else paintAt(...pixel(e));
});
sc.addEventListener('pointermove',e=>{
 if(!pointers.has(e.pointerId))return;e.preventDefault();pointers.set(e.pointerId,e);
 if(pointers.size>=2&&gesture){const p=pair(),r=sc.getBoundingClientRect();setZoom(gesture.z*p.d/gesture.d);sc.scrollLeft=gesture.ax*scale()-(p.x-r.left);sc.scrollTop=gesture.ay*scale()-(p.y-r.top);return;}
 if(gestureOnly)return;
 if(tool==='pan'){sc.scrollLeft=panStart.left+panStart.x-e.clientX;sc.scrollTop=panStart.top+panStart.y-e.clientY;}
 else if($('#input-mode').value==='crosshair'&&!strokePicker)aimAt(e);else paintAt(...pixel(e));
});
function finish(e){if(!pointers.has(e.pointerId))return;pointers.delete(e.pointerId);if(e.type==='pointercancel'&&stroke){rgba=stroke;stroke=null;draw();}if(!pointers.size){if(!gestureOnly)commitStroke();gesture=null;gestureOnly=false;stroke=null;}}
sc.addEventListener('pointerup',finish);sc.addEventListener('pointercancel',finish);sc.addEventListener('lostpointercapture',finish);
canvas.addEventListener('mousedown',e=>e.preventDefault());canvas.addEventListener('auxclick',e=>e.preventDefault());canvas.addEventListener('contextmenu',e=>e.preventDefault());
for(const b of panel.querySelectorAll('[data-tool]'))b.onclick=()=>{tool=b.dataset.tool;setTool();};
$('#paint-color').oninput=e=>{color=e.target.value;tool='pencil';setTool();};$('#pixel-zoom').oninput=zoom;
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
