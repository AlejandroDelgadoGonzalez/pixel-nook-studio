const $=s=>document.querySelector(s),canvas=$('#editor'),ctx=canvas.getContext('2d',{willReadFrequently:true});
let snapshot,base,expected,key='front',undo=[],redo=[],drawing=false;
const status=text=>$('#status').textContent=text;
async function api(url,data){const r=await fetch(url,{cache:'no-store',...(data?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}:{})});const value=await r.json();if(!r.ok)throw new Error(value.error||JSON.stringify(value));return value;}
function details(){const active=snapshot.assets[key].active;$('#details').textContent=`Edit base: ${base.record.recordType||base.recordType} ${base.record.id}@${base.record.revision}\nActive: ${active.record.id}@${active.record.revision}\nRoot: ${base.geometry.root.join(', ')}\nNative: ${canvas.width}×${canvas.height} · immutable parent PNG ${base.imageSha256}`;}
async function load(fromCook=true){snapshot=await api('/api/state');key=$('#asset').value;base=snapshot.assets[key][fromCook?'cook':'active'];expected=snapshot.assets[key].active.record;
 const im=new Image();im.src=base.imageUrl;await im.decode();canvas.width=im.width;canvas.height=im.height;ctx.imageSmoothingEnabled=false;ctx.drawImage(im,0,0);undo=[];redo=[];details();status('Ready. Changes remain local until approval.');}
function saveUndo(){undo.push(ctx.getImageData(0,0,canvas.width,canvas.height));redo=[];}
function point(e){const r=canvas.getBoundingClientRect();return [Math.floor((e.clientX-r.left)/r.width*canvas.width),Math.floor((e.clientY-r.top)/r.height*canvas.height)];}
function paint(e){const [x,y]=point(e);if(x<0||y<0||x>=canvas.width||y>=canvas.height)return;ctx.fillStyle=$('#color').value;ctx.fillRect(x,y,1,1);}
canvas.addEventListener('pointerdown',e=>{e.preventDefault();if(e.button===1){const [x,y]=point(e),p=ctx.getImageData(x,y,1,1).data;if(p[3])$('#color').value='#'+[...p.slice(0,3)].map(c=>c.toString(16).padStart(2,'0')).join('');return;}if(e.button!==0)return;saveUndo();drawing=true;canvas.setPointerCapture(e.pointerId);paint(e);});
canvas.addEventListener('pointermove',e=>{if(drawing){e.preventDefault();paint(e);}});canvas.addEventListener('pointerup',()=>drawing=false);
canvas.addEventListener('mousedown',e=>e.preventDefault());canvas.addEventListener('auxclick',e=>e.preventDefault());
function undoPixel(){if(undo.length){redo.push(ctx.getImageData(0,0,canvas.width,canvas.height));ctx.putImageData(undo.pop(),0,0);}}
function redoPixel(){if(redo.length){undo.push(ctx.getImageData(0,0,canvas.width,canvas.height));ctx.putImageData(redo.pop(),0,0);}}
$('#undo').onclick=undoPixel;$('#redo').onclick=redoPixel;
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redoPixel():undoPixel();}});
$('#cook').onclick=()=>load(true).catch(e=>status(e.message));$('#active').onclick=()=>load(false).catch(e=>status(e.message));$('#asset').onchange=()=>load(true).catch(e=>status(e.message));
$('#approve').onclick=async()=>{const button=$('#approve');button.disabled=true;try{const r=await api('/api/approve',{key,expectedCurrent:expected,editedFrom:base.record,parentSha256:base.imageSha256,geometry:base.geometry,png:canvas.toDataURL('image/png')});window.lastManualResult=r;await load(false);status(`Final saved and adopted automatically · ${r.diff.count} changed pixels · previous revision retained.`);$('#preview').src='/preview/?manual=1&view='+key+'&generation='+r.generation;}catch(e){status('Rejected; active revision unchanged: '+e.message);}finally{button.disabled=false;}};
$('#rollback').onclick=async()=>{const button=$('#rollback');button.disabled=true;status('Restoring previous revision…');try{const s=await api('/api/state'),r=await api('/api/rollback',{key,expectedCurrent:s.assets[key].active.record});await load(false);status('Previous revision restored; all PNGs and diffs retained.');$('#preview').src='/preview/?manual=1&view='+key+'&generation='+r.generation;}catch(e){status('Rollback rejected: '+e.message);}finally{button.disabled=false;}};
window.manualEditor={payload:()=>({key,expectedCurrent:expected,editedFrom:base.record,parentSha256:base.imageSha256,geometry:base.geometry,png:canvas.toDataURL('image/png')}),reload:load};
await load();
