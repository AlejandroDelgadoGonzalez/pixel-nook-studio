// Runs in the browser. Keep independent of any story's character names.
export function framingIssues(scene){
 const d=scene.diagnostics?.();if(!d)return[];
 // readingHeight reserves 20 px; the approved edge guard can use 12 of them.
 // Measure actual caption clearance rather than rejecting that intentional refit.
 const stage=document.querySelector('#stage').getBoundingClientRect(),caption=document.querySelector('#dialogue').getBoundingClientRect();
 const unit=scene.scale.height/stage.height,locked=!!scene.framing?.lock,top=scene.safeTopInset||8,bottom=locked?scene.scale.height:Math.min(scene.scale.height,(caption.top-stage.top)*unit-8),issues=[];
 // Fixed room layouts may put the caption above/beside the cast. Check its
 // actual rectangle, never assume every actor must be above caption.top.
 if(locked){const panel={left:(caption.left-stage.left)*unit,right:(caption.right-stage.left)*unit,top:(caption.top-stage.top)*unit,bottom:(caption.bottom-stage.top)*unit};for(const id of d.requiredActors||[]){const a=d.actors[id],b=a?.bounds;if(a?.visible>.1&&b&&b.left<panel.right&&b.right>panel.left&&b.top<panel.bottom&&b.bottom>panel.top)issues.push({kind:'actor-caption-contact',id,bounds:b,panel});}}
 for(const id of d.requiredActors||[]){const a=d.actors[id];if(!a||a.visible<=.1)continue;if(a.head?.y<top-2||a.y>bottom+2||a.x<0||a.x>scene.scale.width)issues.push({kind:'actor-frame',id,head:a.head?.y,feet:a.y,top,bottom});}
 for(const id of d.requiredProps||[]){const p=d.props?.[id];if(!p||p.visible===0)continue;const sprite=scene.objects?.[id];let t=p.top?.y??p.y,b=p.y,l=p.left?.x??p.x,r=p.right?.x??p.x;
  if(sprite){const box=sprite.getBounds(),f=scene.framing;t=(box.top-f.y)*f.z+scene.scale.height/2;b=(box.bottom-f.y)*f.z+scene.scale.height/2;l=(box.left-f.x)*f.z+scene.scale.width/2;r=(box.right-f.x)*f.z+scene.scale.width/2;}
  if(t<top-2||b>bottom+2||l<0||r>scene.scale.width)issues.push({kind:'prop-frame',id,top:t,bottom:b,left:l,right:r,safeBottom:bottom});
 }
 return issues;
}
