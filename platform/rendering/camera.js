import {landscapeView} from './environments.js';
export function prepareLandscapeShot(scene,target){
 if(!landscapeView(scene))return;
 // Remove extra headroom from very wide establishing shots. Each renderer then
 // expands this around required cast, objects and landmarks, so nothing is lost.
 if(!target.preserveWidth)target.w=Math.min(target.w,720);
 if(!target.preserveHeight)target.h=Math.min(target.h,320);
}

export function cameraCenterX(scene,x,zoom){
 const half=scene.scale.width/(2*zoom),native=landscapeView(scene)&&half<=768&&!scene.bounds?.().fullPanorama;
 return Phaser.Math.Clamp(x,(native?0:-1536)+half,(native?1536:3072)-half);
}

// A desktop shot must fit the actual bitmap, not a synthetic tiled-floor world.
// Refit only when a camera leaves the art; native vertical staging is unchanged.
export function keepCameraInsideEnvironment(scene,framing=scene.framing,fitRequired=false){
 const wide=landscapeView(scene);
 const nativeExterior=scene.reader.story.environmentConfig?.rooms?.[scene.reader.model.room]?.nativeBounds||scene.reader.story.visuals?.rooms?.[scene.reader.model.room]?.nativeBounds;
 const previousNative=scene.reader.story.environmentConfig?.rooms?.[scene.previousBackground.environment?.room]?.nativeBounds||scene.reader.story.visuals?.rooms?.[scene.previousBackground.environment?.room]?.nativeBounds;
 scene.floor?.setVisible(!wide&&!nativeExterior);scene.previousFloor?.setVisible(!wide&&!previousNative);
 if(!wide&&!nativeExterior||!scene.background)return;
 const f=framing,w=scene.scale.width,h=scene.scale.height,bg=scene.background.getBounds();
 if(!f)return;
 const outside=f.x-w/(2*f.z)<bg.left-.01||f.x+w/(2*f.z)>bg.right+.01||f.y-h/(2*f.z)<bg.top-.01||f.y+h/(2*f.z)>bg.bottom+.01;
 if(!outside&&!fitRequired){scene.environmentCameraIssue=null;return;}
 const e=scene.reader,shot=scene.bounds(),step=e.step,next=e.story.steps[e.index+1],walk=scene.cameraWalk||(step?.camera?.hold?step:next?.camera?.hold&&step?.effects?.view?next:null),rects=[];
 const route=id=>{
  if(!walk)return[];
  const change=walk.effects.actors?.[id];if(!change||change.x===undefined&&change.y===undefined)return[];
  const start=walk===step?e.startModel.actors[id]:e.model.actors[id],from=walk.presence?.[id]?.from||start;
  return[from,...(walk.paths?.[id]||[]),{x:change.x??start.x,y:change.y??start.y}];
 };
 for(const id of shot.actors||[]){
  const a=e.model.actors[id],moving=route(id),sprite=id===scene.reader.story.environmentConfig?.disguiseActor&&scene.disguiseActor?.alpha>.5?scene.disguiseActor:scene.people[id]?.actor;
  if(!sprite||a.visible<.1&&!moving.length)continue;
  const width=sprite.displayWidth+12,height=(scene.actorHeight?.(id)||sprite.displayHeight)+4,pos=scene.actorPosition(id);
  // A hidden incoming actor's old coordinates belong to an earlier shot.
  // Its complete future route is the only physical extent to preflight.
  for(const p of a.visible<.1&&moving.length?moving:[pos,...moving])rects.push({l:p.x-width/2,r:p.x+width/2,t:p.y-height,b:p.y+2+(scene.actorFootOffset?.(id)||0)});
 }
 for(const id of shot.props||[]){
  const p=e.model[id],sprite=scene.objects?.[id]||(id==='raft'?scene.sail:null),ownerVisible=p.owner&&e.model.actors[p.owner]?e.model.actors[p.owner].visible:1,appearing=walk?.effects[id]?.visible>0||walk?.effects.actors?.[p.owner]?.visible>0;if(!sprite||(p.visible??sprite.alpha)*ownerVisible<.1&&!appearing)continue;
  const position=scene.propPosition?.(id)||p,owner=p.owner&&e.model.actors[p.owner],points=owner&&ownerVisible<.1?[]:[position];
  if(owner)for(const point of route(p.owner))points.push({x:position.x+point.x-owner.x,y:position.y+point.y-owner.y});
  const change=walk?.effects[id];if(change&&(change.x!==undefined||change.y!==undefined))points.push({x:change.x??position.x,y:change.y??position.y});
  const pad=Math.max(2,shot.edgePadding||2);for(const point of points)rects.push({l:point.x-sprite.displayWidth/2-pad,r:point.x+sprite.displayWidth/2+pad,t:point.y-sprite.displayHeight-pad,b:point.y+pad});
 }
 for(const id of shot.landmarks||[]){const p=e.story.landmarks?.[id];if(p)rects.push({l:p.x-p.w/2,r:p.x+p.w/2,t:p.y-p.h/2,b:p.y+p.h/2});}
 const required=rects.length?{l:Math.min(...rects.map(r=>r.l)),r:Math.max(...rects.map(r=>r.r)),t:Math.min(...rects.map(r=>r.t)),b:Math.max(...rects.map(r=>r.b))}:null;
 // readingHeight already reserves 20 pixels above dialogue. Boundary refits
 // can use 12 of them while retaining a visible gap and keeping every foot clear.
 const safeTop=wide&&shot.safeTop!==undefined?shot.safeTop:scene.safeTopInset||Math.min(65,h*.1),safeBottom=Math.min(h,(scene.readingHeight||h)+12);
 const coverage=Math.max(w/bg.width,h/bg.height);
 let minimum=coverage,maximum=Infinity;
 if(required){
  minimum=Math.max(minimum,safeTop/Math.max(.01,required.t-bg.top),(h-safeBottom)/Math.max(.01,bg.bottom-required.b));
  maximum=Math.min(w/Math.max(1,required.r-required.l),(safeBottom-safeTop)/Math.max(1,required.b-required.t));
 }
 const fits=minimum<=maximum+.0001,z=Math.max(coverage,Math.min(maximum,Math.max(f.z,minimum)));
 let l=bg.left+w/(2*z),r=bg.right-w/(2*z),t=bg.top+h/(2*z),b=bg.bottom-h/(2*z);
 if(required&&fits){l=Math.max(l,required.r-w/(2*z));r=Math.min(r,required.l+w/(2*z));t=Math.max(t,required.b+(h/2-safeBottom)/z);b=Math.min(b,required.t+(h/2-safeTop)/z);}
 f.z=z;f.x=Phaser.Math.Clamp(f.x,l,r);f.y=Phaser.Math.Clamp(f.y,t,b);
 scene.environmentCameraIssue=fits?null:{room:e.model.room,view:e.model.view,minimum,maximum};
 scene.cameras.main.setZoom(f.z).centerOn(f.x,f.y);
}
