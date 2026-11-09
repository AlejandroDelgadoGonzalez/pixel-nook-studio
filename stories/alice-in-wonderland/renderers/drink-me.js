import {hallRoomFrame} from './hall-room-frame.js';
import {drawCharacter,createPixelWalkFrames} from '../../../platform/rendering/character-art.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),snap=v=>Math.round(v/2)*2,mix=(a,b,t)=>a+(b-a)*t;
export class DrinkMe {
 constructor(scene,g,cells){
  this.scene=scene;this.geometry=g;this.cells=Object.fromEntries(cells.poses.map(p=>[p.pose,p]));this.normalized={};this.extra=[];
  for(const c of cells.poses){const [l,t,r,b]=c.sourceBoundsExclusive,[w,h]=c.normalizedSize,key='alice-drink-'+c.pose,tex=scene.textures.createCanvas(key,w,h);drawCharacter(tex.context,scene.emptyJar.source(c.asset),l,t,r-l,b-t,w,h);tex.refresh();this.normalized[c.pose]={key,width:w,height:h};}
  for(const dir of ['front','back','left','right']){const c=['front','back'].includes(dir)?scene.hall.cells['walk-'+dir]:this.cells['examine-bottle'],src=scene.textures.get(['front','back'].includes(dir)?scene.hall.normalized[c.pose].key:this.normalized[c.pose].key).getSourceImage(),key='drink-carry-alice-'+dir,t=scene.textures.createCanvas(key,src.width,src.height);if(dir==='right'){t.context.translate(src.width,0);t.context.scale(-1,1);}t.context.drawImage(src,0,0);t.refresh();createPixelWalkFrames(scene,'drink-carry','alice',dir);}
  this.normalized['box-closed']={key:'alice-hall-box-closed',width:28,height:16};this.props={box:scene.hall.objects.box};for(const name of ['cork','lid','cake']){this.props[name]=scene.add.image(0,0,this.normalized[name==='lid'?'box-lid-open':name].key);this.extra.push(this.props[name]);}this.hide();
 }
 hide(){for(const p of this.extra)p.setVisible(false);}
 progress(){const e=this.scene.reader;return e.step?.type==='action'?clamp(e.elapsed/e.step.duration,0,1):1;}
 info(){const s=this.scene,e=s.reader,d=e.model.drink,a=e.model.actors.alice,z=s.hall.scaleAt(a.y)*d.magicScale,walking=a.pose==='walk',held=d.bottleOwner==='alice',push=false,dir=a.facing||'right';let c=this.cells[d.pose]||s.hall.cells[d.pose],size=this.normalized[c.pose]||s.hall.normalized[c.pose],key=size.key,flip=c.facing==='right'&&d.face==='left'||c.facing==='left'&&d.face==='right',origin=c.origin||[.5,1];
  if(walking){if(held||push){c=['front','back'].includes(dir)?s.hall.cells['walk-'+dir]:this.cells['examine-bottle'];size={width:c.normalizedSize[0]+12,height:c.normalizedSize[1]};key=`drink-carry-alice-walk-${dir}-${Math.floor(e.elapsed/130)%8}`;flip=false;origin=[(c.groundAnchorNormalized[0]+6)/size.width,1];if(dir==='right')origin[0]=1-origin[0];}else{c=s.cells.characters.alice.poses.find(p=>p.pose===dir)||c;size=s.normalized.alice[dir];key=`alice-riverbank-alice-walk-${dir}-${Math.floor(e.elapsed/130)%8}`;flip=false;origin=[.5,1];}}
  else if(flip)origin=[1-origin[0],origin[1]];
  let dx=(c.handAnchorNormalized?.[0]??c.normalizedSize[0]/2)-(c.groundAnchorNormalized?.[0]??c.normalizedSize[0]/2),dy=(c.handAnchorNormalized?.[1]??c.normalizedSize[1]/2)-(c.groundAnchorNormalized?.[1]??c.normalizedSize[1]);if(flip||walking&&dir==='right'&&(held||push))dx=-dx;
  const x=snap(a.x),y=snap(a.y);return{c,size,key,flip,origin,x,y,z,walking,hand:[x+dx*z,y+dy*z]};
 }
 draw(options={}){const s=this.scene,e=s.reader,d=e.model.drink,h=s.hall,g=this.geometry,p=this.progress(),i=options.actorInfo||this.info(),fixed=hallRoomFrame(s);h.draw({frame:fixed,actorInfo:{...i,alpha:1}});const actor=h.people.alice.actor;
  actor.setTexture(i.key).setOrigin(...i.origin).setPosition(i.x,i.y).setScale(i.z).setFlipX(i.flip).setDepth(i.y);h.people.alice.shadow.setScale(i.z).setPosition(i.x,i.y-2*i.z).setDepth(i.y-.2);
  const set=(sprite,name,point,z,origin=[.5,1],depth=7)=>sprite.setVisible(true).setTexture((this.normalized[name]||h.normalized[name]).key).setOrigin(...origin).setPosition(...point).setScale(z).setRotation(0).setDepth(depth);
  const bp=g.props.bottle,b=h.objects.bottle,held=d.bottleOwner==='alice',empty=d.bottleEmpty>.5,name=d.cork>0?(empty?'bottle-open-empty':'bottle-open-full'):'bottle-upright',sz=(this.cells[name]||h.cells[name]).normalizedSize;
  let pos=bp.tableBaseSource.map(v=>v*2),z=bp.tableScale,origin=[.5,1],rotation=0;
  if(held){const grip=d.bottleGrip==='body'?bp.emptyBodyGripNormalized:d.cork>0?[16,8]:bp.pickupGripNormalized;pos=i.hand;z=h.scaleAt(e.model.actors.alice.y);origin=grip.map((v,j)=>v/sz[j]);rotation=d.angle*Math.PI/180;}
  if(d.bottleOwner==='floor'){pos=bp.floorBaseSource.map(v=>v*2);z=bp.floorScale;}
  // Both ownership transfers travel to/from the same measured physical pin.
  if(e.step?.id==='alice-c1-drink-take'){const grip=bp.pickupGripNormalized;origin=grip.map((v,j)=>v/sz[j]);const from=[1750,1278+(grip[1]-52)*bp.tableScale];pos=from.map((v,j)=>mix(v,i.hand[j],p));z=bp.tableScale;}
  const bottleDepth=held?i.y+.2:d.bottleOwner==='floor'?bp.floorBaseSource[1]*2:h.tablePropDepth;
  set(b,name,pos,z,origin,bottleDepth).setRotation(rotation);
  if(d.cork>0){const rest=g.props.cork.tableBaseSource.map(v=>v*2),from=[i.hand[0],i.hand[1]-8*z],moving=e.step?.id==='alice-c1-drink-uncork'&&d.cork<1,cp=moving?rest.map((v,j)=>mix(from[j],v,d.cork)):rest;set(this.props.cork,'cork',cp,1.14,[.5,1],moving?i.y+.3:h.tablePropDepth);}else this.props.cork.setVisible(false);
  const boxpos=g.props.box.baseSource.map(v=>v*2),boxDepth=boxpos[1];set(this.props.box,d.boxOpen>0?'box-base':'box-closed',boxpos,1.14,[.5,1],boxDepth);
  if(d.boxOpen>0){set(this.props.cake,'cake',g.props.cake.baseSource.map(v=>v*2),1.14,[.5,1],boxDepth+.002);const lid=this.props.lid,lp=g.props.box.openLidTopLeftSource.map(v=>v*2);const ls=this.cells['box-lid-open'].normalizedSize,hinge=lp.map((v,j)=>v+ls[j]*1.14);set(lid,'box-lid-open',hinge,1.14,[1,1],boxDepth+.004).setAlpha(1).setRotation(-.55*(1-d.boxOpen));const ci=this.scene.textures.get(this.normalized.cake.key).getSourceImage();this.props.cake.setAlpha(1).setCrop(0,0,ci.width,Math.max(2,Math.round(ci.height*d.boxOpen/2)*2));}else{this.props.lid.setVisible(false);this.props.cake.setVisible(false);}
  this.frame=fixed;s.cameraReframing=false;s.cameraTracking=null;s.shotDissolve?.clear();

 }
 diagnostics(){const s=this.scene,d=s.reader.model.drink,i=this.info(),a=s.hall.people.alice.actor,b=a.getBounds(),f=s.framing,proj=(x,y)=>({x:(x-f.x)*f.z+s.scale.width/2,y:(y-f.y)*f.z+s.scale.height/2}),base=s.hall.diagnostics(),[x,y,w,h]=s.cameraSourceRect;base.actors.alice={...proj(i.x,i.y),head:proj(i.x,b.top),world:{x:i.x,y:i.y},visible:1,pose:d.pose,scale:i.z,bounds:{left:proj(b.left,b.top).x,right:proj(b.right,b.top).x,top:proj(b.left,b.top).y,bottom:proj(b.left,b.bottom).y}};base.depthScaling.actorGain.alice=.5267;base.depthScaling.bodyScaleByActor={alice:{statePath:['drink','magicScale'],value:d.magicScale}};base.depthScaling.anchorByActor={alice:{sourceBoundsExclusive:[0,0,i.size.width,i.size.height],sourceAnchor:[i.origin[0]*i.size.width,i.origin[1]*i.size.height],origin:i.origin}};base.requiredProps=[];base.cameraCoverage.worldView={left:x,right:x+w,top:y,bottom:y+h};base.shot=d.shot;base.drink={...d,hand:i.hand,walking:i.walking};return base;}
}
