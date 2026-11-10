// A change of place/shot dissolves the complete stage, including its cast.
// The story clock freezes this overlay along with all other animation on pause.
export function installShotDissolve(scene){
 const draw=scene.draw.bind(scene),key='shot-dissolve-'+scene.sys.settings.key;
 let texture,sprite,overlayCamera,seen=0,active=null,lastRenderedBackdrop=null,pendingBackdrop=null,lastClock=scene.reader.totalTime;
 // draw() can be called several times for layout before Phaser paints once.
 // Commit identity only when the canvas has actually rendered that selection.
 const rendered=()=>{if(pendingBackdrop!==null)lastRenderedBackdrop=pendingBackdrop;};
 scene.game.events.on('postrender',rendered);
 scene.events.once('shutdown',()=>scene.game.events.off('postrender',rendered));
 let clearedDuringDraw=false;
 const clear=()=>{clearedDuringDraw=true;seen=scene.reader.shotTransition?.serial||0;active=null;lastRenderedBackdrop=null;pendingBackdrop=null;sprite?.setAlpha(0);scene.cameras.main.setAlpha(1);};
 scene.shotDissolve={get alpha(){return sprite?.alpha||0;},get currentAlpha(){return scene.cameras.main.alpha;},get active(){return !!active;},get previousBackdrop(){return active?.previousBackdrop;},get currentBackdrop(){return lastRenderedBackdrop;},get elapsed(){return active?.elapsed||0;},animatePausedSeek(){if(active?.backdrop){active.uiSeek=true;active.uiWall=performance.now();}},clear};
 scene.draw=(dt,instant=false)=>{
  const transition=scene.reader.shotTransition,w=scene.scale.width,h=scene.scale.height;
  const clock=scene.reader.totalTime,elapsed=Math.max(0,clock-lastClock);lastClock=clock;
  // Renderers report the texture they actually selected. Camera/layout redraws
  // and reconstruction are not permission to cancel a change of backdrop.
  scene.renderedBackdrop=null;
  clearedDuringDraw=false;
  const legacyChange=transition&&transition.serial!==seen;
  draw(dt,instant||!!legacyChange);
  const targetBackdrop=scene.renderedBackdrop;
  const backdropChanged=targetBackdrop!==null&&lastRenderedBackdrop!==null&&targetBackdrop!==lastRenderedBackdrop&&active?.targetBackdrop!==targetBackdrop;
  const automatic=targetBackdrop!==null&&lastRenderedBackdrop!==null;
  if(automatic&&active?.backdrop&&active.targetBackdrop!==targetBackdrop&&targetBackdrop===lastRenderedBackdrop){
   // Navigation returned to the painted source before a destination frame.
   active=null;sprite?.setAlpha(0);scene.cameras.main.setAlpha(1);
  }
  // A pose/camera beat must not cancel an active whole-location dissolve.
  let changed=false;
  if(!automatic&&instant&&!active?.backdrop){seen=transition?.serial||0;active=null;sprite?.setAlpha(0);scene.cameras.main.setAlpha(1);}
  else if(backdropChanged||!automatic&&legacyChange&&!clearedDuringDraw){
   seen=transition?.serial||0;changed=true;
   if(!texture){
    texture=scene.textures.createCanvas(key,w,h);
    sprite=scene.add.image(0,0,key).setOrigin(0).setDepth(100000);
    // A screen-space camera avoids a one-pixel shift from world-camera rounding.
    scene.cameras.main.ignore(sprite);
    overlayCamera=scene.cameras.add(0,0,w,h,false,key);
    overlayCamera.inputEnabled=false;
    overlayCamera.ignore(scene.children.list.filter(object=>object!==sprite));
   }
   else texture.setSize(w,h);
   texture.context.imageSmoothingEnabled=false;texture.context.clearRect(0,0,w,h);
   texture.context.drawImage(scene.game.canvas,0,0,w,h);texture.refresh();
   active=backdropChanged?{backdrop:true,previousBackdrop:lastRenderedBackdrop,targetBackdrop,elapsed:0,durationMs:700}:transition;
   sprite.setVisible(true).setAlpha(1);
   scene.cameras.main.setAlpha(backdropChanged?0:1);
  }
  // Keep the selected camera transform current even at alpha zero. Phaser
  // otherwise skips its render and can retain the outgoing shot matrix.
  if(targetBackdrop!==null)scene.cameras.main.preRender?.();
  pendingBackdrop=targetBackdrop;
  if(automatic)seen=transition?.serial||0;
  // A lazy renderer can add its destination objects during draw. The snapshot
  // camera must never render those objects again at its own screen-space zoom.
  if(overlayCamera)overlayCamera.ignore(scene.children.list.filter(object=>object!==sprite));
  if(active&&sprite){
   // Accumulate the story clock rather than retaining an absolute start time:
   // Read again/back can reset that clock, and pose beats must not reset alpha.
   if(active.backdrop&&!changed){const now=performance.now();active.elapsed+=active.uiSeek&&scene.reader.paused?Math.max(0,now-active.uiWall):elapsed;if(active.uiSeek)active.uiWall=now;}
   const progress=Math.max(0,Math.min(1,(active.backdrop?active.elapsed:clock-active.time)/active.durationMs));
   overlayCamera.setViewport(0,0,w,h);
   sprite.setTexture(key).setPosition(0,0).setDisplaySize(w,h).setAlpha(1-progress*progress*(3-2*progress));
   if(active.backdrop)scene.cameras.main.setAlpha(1-sprite.alpha);
   if(progress===1)active=null;
  }
 };
}
