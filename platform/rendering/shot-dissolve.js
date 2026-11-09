// A change of place/shot dissolves the complete stage, including its cast.
// The story clock freezes this overlay along with all other animation on pause.
export function installShotDissolve(scene){
 const draw=scene.draw.bind(scene),key='shot-dissolve-'+scene.sys.settings.key;
 let texture,sprite,overlayCamera,seen=0,active=null;
 scene.shotDissolve={get alpha(){return sprite?.alpha||0;},get active(){return !!active;},clear(){seen=scene.reader.shotTransition?.serial||0;active=null;sprite?.setAlpha(0);}};
 scene.draw=(dt,instant=false)=>{
  const transition=scene.reader.shotTransition,w=scene.scale.width,h=scene.scale.height;
  // A pose/camera beat must not cancel an active whole-location dissolve.
  let changed=false;
  if(instant){seen=transition?.serial||0;active=null;sprite?.setAlpha(0);}
  else if(transition&&transition.serial!==seen){
   seen=transition.serial;changed=true;
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
   active=transition;
  }
  // Establish the destination shot beneath the snapshot instead of panning
  // through an unrelated room while actors change their blocking.
  draw(dt,instant||changed);
  // A lazy renderer can add its destination objects during draw. The snapshot
  // camera must never render those objects again at its own screen-space zoom.
  if(overlayCamera)overlayCamera.ignore(scene.children.list.filter(object=>object!==sprite));
  if(active&&sprite){
   const progress=Math.max(0,Math.min(1,(scene.reader.totalTime-active.time)/active.durationMs));
   overlayCamera.setViewport(0,0,w,h);
   sprite.setTexture(key).setPosition(0,0).setDisplaySize(w,h).setAlpha(1-progress*progress*(3-2*progress));
   if(progress===1)active=null;
  }
 };
}
