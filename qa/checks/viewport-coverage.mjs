import {officialLayouts} from '../official-layouts.mjs';
import assert from 'node:assert/strict';

// Browser-side audit. Canvas size alone cannot prove that artwork fills it:
// inspect the actual camera viewport and the projected environment surfaces.
export function inspectViewport(scene, {intro=false}={}) {
 const issues=[],rect=e=>{const r=e.getBoundingClientRect();return{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
 const stage=rect(document.querySelector('#stage')),canvas=rect(scene.game.canvas),w=scene.scale.width,h=scene.scale.height,camera=scene.cameras.main;
 const inRecord=document.body.classList.contains('record'),explicitPortrait=document.body.classList.contains('vertical');
 // The explicitly selected portrait recording surface can be bounded. Ordinary
 // reading, including an intrinsically narrow window, must fill the viewport.
 if(!inRecord&&!explicitPortrait)for(const [name,b]of [['stage',stage],['canvas',canvas]])if(Math.abs(b.left)>1||Math.abs(b.top)>1||Math.abs(b.right-innerWidth)>1||Math.abs(b.bottom-innerHeight)>1)issues.push({kind:'viewport-not-filled',name,b,viewport:{width:innerWidth,height:innerHeight}});
 if(Math.abs(canvas.left-stage.left)>1||Math.abs(canvas.top-stage.top)>1||Math.abs(canvas.right-stage.right)>1||Math.abs(canvas.bottom-stage.bottom)>1)issues.push({kind:'canvas-stage-gap',stage,canvas});
 if(Math.abs(camera.x)>.1||Math.abs(camera.y)>.1||Math.abs(camera.width-w)>.1||Math.abs(camera.height-h)>.1)issues.push({kind:'camera-letterbox',camera:{x:camera.x,y:camera.y,width:camera.width,height:camera.height},canvas:{width:w,height:h}});
 // Phaser's worldView may round world coordinates. Its render matrix is the
 // actual transform; using only worldView can invent 1–2 px gaps at zoom > 1.
 const project=(x,y)=>camera.matrix?.transformPoint?camera.matrix.transformPoint(x-camera.scrollX,y-camera.scrollY):({x:camera.x+(x-camera.worldView.left)*camera.zoomX,y:camera.y+(y-camera.worldView.top)*camera.zoomY});
 let surfaces=(scene.environmentSurfaces||[scene.background,scene.floor,...(scene.sides||[])]).filter(s=>s?.visible&&s.alpha>.99);
 if(!surfaces.length)surfaces=scene.children.list.filter(s=>['Image','TileSprite'].includes(s.type)&&s.depth<=0&&s.displayWidth>=500&&s.displayHeight>=500&&!s.mask);
 const artwork=surfaces.filter(s=>s.visible&&s.alpha>.99).map(s=>{const b=s.getBounds(),a=project(b.left,b.top),z=project(b.right,b.bottom);return{texture:s.texture?.key,left:a.x,top:a.y,right:z.x,bottom:z.y};});
 if(!artwork.length)issues.push({kind:'artwork-coverage-unavailable'});
 // Exact rectangle-union coverage: check each band split by every surface edge.
 // This accepts approved old floor planes while detecting even a one-pixel gap.
 const cuts=[0,w,...artwork.flatMap(b=>[Math.max(0,Math.min(w,b.left)),Math.max(0,Math.min(w,b.right))])].sort((a,b)=>a-b);
 for(let i=1;i<cuts.length;i++)if(cuts[i]-cuts[i-1]>.1){const x=(cuts[i]+cuts[i-1])/2,intervals=artwork.filter(b=>b.left<=x&&b.right>=x).map(b=>[b.top,b.bottom]).sort((a,b)=>a[0]-b[0]);let covered=0;for(const [t,b]of intervals){if(t>covered+.5)break;covered=Math.max(covered,b);}if(covered<h-.5){issues.push({kind:'artwork-gap',band:[cuts[i-1],cuts[i]],coveredBottom:covered,canvasHeight:h});break;}}
 const d=scene.diagnostics?.(),panelElement=document.querySelector('#dialogue'),panel=rect(panelElement),style=getComputedStyle(panelElement);
 const panelVisible=!intro&&!panelElement.hidden&&style.display!=='none'&&style.visibility!=='hidden'&&Number(style.opacity)>.01;
 const bodies=[];
 // A declared physical frame-edge entrance may intersect only that edge while
 // following its authored enter path. It is not a camera reframe and never
 // exempts caption contact, top/bottom cropping or a held/stopped actor.
 const leftEntrance=(id,css)=>{const e=scene.reader,s=e?.step,p=s?.presence?.[id],m=e?.model?.actors?.[id],a=e?.startModel?.actors?.[id],entry=d?.frameEntrances?.[id],insideExceptLeft=css.left<canvas.left&&css.right>canvas.left&&css.right<=canvas.right+.5&&css.top>=canvas.top-.5&&css.bottom<=canvas.bottom+.5;
  const insideExceptRight=css.right>canvas.right&&css.left<canvas.right&&css.left>=canvas.left-.5&&css.top>=canvas.top-.5&&css.bottom<=canvas.bottom+.5;
  if(entry?.edge==='right'&&insideExceptRight&&p?.kind==='enter'&&s.paths?.[id]?.length&&m&&a&&m.x<=a.x&&e.elapsed<s.duration)return true;
  if(entry?.edge!=='left'||!insideExceptLeft)return false;
  if(p?.kind==='enter'&&s.paths?.[id]?.length&&m&&a&&m.x>=a.x&&e.elapsed<s.duration)return true;
  // The approved C1 Mouse uses its existing measured renderer controller rather
  // than model.actors. Validate that actual sprite/path before allowing its
  // physical left-edge entrance in the explicitly authorized close camera.
  const pool=scene.poolOfTears,route=pool?.geometry?.walkPaths?.mouseToWater,actor=scene.people?.[id]?.actor;
  if(id!=='mouse'||entry.controller!=='poolOfTears'||entry.path!=='mouseToWater'||s?.id!=='alice-c1-pool-mouse-enter'||actor!==pool?.mouse||route?.waypoints?.length!==2||Math.abs(s.duration-route.durationMs)>.001||e.elapsed<=0||e.elapsed>=s.duration||!actor.texture.key.includes('mouse-walk'))return false;
  const [from,to]=route.waypoints,q=(actor.x-from.x)/(to.x-from.x);return q>=0&&q<1&&Math.abs(actor.y-(from.y+(to.y-from.y)*q))<.001;
 };
 // Inspect actual sprites too: omitting an actor from diagnostics must never
 // suppress a visible body/panel collision. A deliberately distant actor may
 // be wholly offscreen; an authored reframe alone permits its edge transit.
 const required=new Set(d?.requiredActors||[]),ids=new Set([...required,...Object.keys(d?.actors||{}),...Object.keys(scene.people||{})]);
 for(const id of ids){const actor=scene.people?.[id]?.actor;if(!actor||!actor.visible||actor.alpha<=.1)continue;const b=actor.getBounds(),a=project(b.left,b.top),z=project(b.right,b.bottom);const css={left:canvas.left+a.x*canvas.width/w,right:canvas.left+z.x*canvas.width/w,top:canvas.top+a.y*canvas.height/h,bottom:canvas.top+z.y*canvas.height/h};if(!required.has(id)&&(css.right<=canvas.left||css.left>=canvas.right||css.bottom<=canvas.top||css.top>=canvas.bottom))continue;const clearance=panel.top-css.bottom;bodies.push({id,...css,captionClearance:clearance});const tracking=d?.cameraTracking,model=scene.reader?.model?.actors?.[id],start=scene.reader?.startModel?.actors?.[id];const cameraHasMoved=tracking?.from&&scene.framing&&['x','y','z'].some(k=>Math.abs(scene.framing[k]-tracking.from[k])>1e-6);const measuredStationaryExit=cameraHasMoved&&!required.has(id)&&tracking?.id===scene.reader?.step?.camera?.tracking&&tracking?.departingStationaryActors?.includes(id)&&model&&start&&model.x===start.x&&model.y===start.y;if(!leftEntrance(id,css)&&(required.has(id)||(!d?.cameraReframing&&!measuredStationaryExit))&&(css.left<canvas.left-.5||css.right>canvas.right+.5||css.top<canvas.top-.5||css.bottom>canvas.bottom+.5))issues.push({kind:'body-clipped',id,bounds:css,canvas});if(panelVisible&&css.left<panel.right&&css.right>panel.left&&css.top<=panel.bottom&&css.bottom>=panel.top-1)issues.push({kind:'dialogue-body-contact',id,bounds:css,panel,clearance});}
 return{viewport:{width:innerWidth,height:innerHeight},stage,canvas,camera:{x:camera.x,y:camera.y,width:camera.width,height:camera.height,worldView:{left:camera.worldView.left,right:camera.worldView.right,top:camera.worldView.top,bottom:camera.worldView.bottom},zoom:camera.zoom},artwork,panel,panelVisible,bodies,issues};
}

export async function snapshot(page,options={}) {
 await page.evaluate(code=>window.qaInspectViewport=(0,eval)('('+code+')'),inspectViewport.toString());
 return page.evaluate(options=>qaInspectViewport(qaScene,options),options);
}
export async function check(page,options={}) {const result=await snapshot(page,options);assert.deepEqual(result.issues,[]);return result;}

export async function responsive(page) {
 const initial=page.viewportSize(),samples=[],layouts=officialLayouts;
 await page.evaluate(code=>window.qaInspectViewport=(0,eval)('('+code+')'),inspectViewport.toString());
 try {for(const layout of layouts){await page.setViewportSize({width:layout.width,height:layout.height});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));const rows=await page.evaluate(()=>{const e=qaScene.reader,rows=[];for(const s of e.story.steps.filter(s=>s.type==='text')){e.start(s.id);e.paused=true;e.revealed=s.text.length;e.onChange('back');qaScene.draw(0,true);qaScene.game.step(performance.now(),0);const d=qaInspectViewport(qaScene);rows.push({passage:s.id,issues:d.issues,minimumCaptionClearance:Math.min(...d.bodies.map(b=>b.captionClearance))});}return rows;});samples.push({layout,...layout,passages:rows.length,minimumCaptionClearance:Math.min(...rows.map(r=>r.minimumCaptionClearance)),issues:rows.filter(r=>r.issues.length)});}}
 finally{await page.setViewportSize(initial);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
 assert.deepEqual(samples.flatMap(s=>s.issues),[]);return{layouts:samples,passages:samples.reduce((n,s)=>n+s.passages,0)};
}
