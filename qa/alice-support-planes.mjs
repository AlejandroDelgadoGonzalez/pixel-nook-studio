import fs from 'node:fs/promises';import assert from 'node:assert/strict';
import {launch,openCase}from './helpers/browser.mjs';import{storyCases}from './helpers/story-cases.mjs';
const out=process.env.QA_OUTPUT_DIR||'.artifacts/qa/alice-in-wonderland/support-plane-box-fix/layers';await fs.mkdir(out,{recursive:true});
const b=await launch(),report={errors:[],resources:[],cases:[]};
try{const item=(await storyCases()).find(x=>x.slug==='alice-in-wonderland'),{page,context}=await openCase(b,item,{width:1024,height:574},report);
const row=await page.evaluate(()=>{
 const s=qaScene,e=s.reader,issues=[];let samples=0,frontOverlaps=0,smallWalkSamples=0,boxSamples=0,maxBottleOverlap=0,boxApproachSamples=0,maxLegFootOverlap=0;
 const plane=s.hall.geometry.supportPlanes.table,[fl,ft,fr,fb]=plane.sourceBoundsExclusive,expected=document.createElement('canvas');expected.width=fr-fl;expected.height=fb-ft;const ec=expected.getContext('2d',{willReadFrequently:true}),source=s.emptyJar.source(plane.asset);
 for(const[y,x0,x1]of plane.sourceOpaqueRunsYX0X1)ec.drawImage(source,x0,y,x1-x0,1,x0-fl,y-ft,x1-x0,1);
 const actual=s.hall.tableForeground.texture.getSourceImage(),aa=actual.getContext('2d').getImageData(0,0,actual.width,actual.height).data,bb=ec.getImageData(0,0,expected.width,expected.height).data;let foregroundPixelChanges=0;for(let i=0;i<bb.length;i++)if(aa[i]!==bb[i])foregroundPixelChanges++;
 if(foregroundPixelChanges||s.hall.tableForeground.x!==fl*2||s.hall.tableForeground.y!==ft*2||actual.width!==fr-fl||actual.height!==fb-ft)issues.push({kind:'foreground-crop-changes-approved-pixels',foregroundPixelChanges});
 const boxExpected=s.drinkGeometry.props.box.baseSource.map(v=>v*2),tableY=s.hall.tableGroundY;
 const paint=(sprite,rect)=>{const im=sprite.texture.getSourceImage(),c=document.createElement('canvas');c.width=Math.ceil((rect.r-rect.l)*2)+2;c.height=Math.ceil((rect.b-rect.t)*2)+2;const ctx=c.getContext('2d',{willReadFrequently:true}),w=im.width,h=im.height;ctx.imageSmoothingEnabled=false;ctx.scale(2,2);ctx.translate(sprite.x-rect.l,sprite.y-rect.t);ctx.rotate(sprite.rotation);ctx.scale(sprite.scaleX*(sprite.flipX?-1:1),sprite.scaleY*(sprite.flipY?-1:1));ctx.drawImage(im,sprite.flipX?-(w-sprite.displayOriginX):-sprite.displayOriginX,sprite.flipY?-(h-sprite.displayOriginY):-sprite.displayOriginY);return ctx.getImageData(0,0,c.width,c.height).data;};
 const overlap=(a,b,feetOnly=false)=>{const x=a.getBounds(),y=b.getBounds(),rect={l:Math.max(x.left,y.left),r:Math.min(x.right,y.right),t:Math.max(x.top,y.top,feetOnly?a.y-4*a.scaleY:-Infinity),b:Math.min(x.bottom,y.bottom)};if(rect.r<=rect.l||rect.b<=rect.t)return 0;const aa=paint(a,rect),bb=paint(b,rect);let n=0;for(let i=3;i<aa.length;i+=4)if(aa[i]&&bb[i])n++;return n;};
 e.sceneGate=false;
 for(const step of e.story.steps.filter(x=>x.sceneIndex>=2&&x.type!=='end')){
  const n=step.type==='action'?Math.max(2,Math.ceil(step.duration/40)):1;
  for(let j=0;j<=n;j++){
   e.start(step.id);e.paused=false;if(step.type==='action')e.tick(step.duration*j/n*.999999);else e.revealed=step.text.length;e.paused=true;e.onChange('back');s.draw(0,true);s.game.step(performance.now(),0);if(e.model.environment!=='hall-of-doors')continue;samples++;
   const a=s.people.alice.actor,key=s.objects.key,bottle=s.objects.bottle,box=s.hall.objects.box,d=e.model.drink;boxSamples++;
   if(!box.visible||Math.abs(box.x-boxExpected[0])>1e-9||Math.abs(box.y-boxExpected[1])>1e-9)issues.push({kind:'box-not-fixed-at-centre',id:step.id,x:box.x,y:box.y});
   if(a.depth!==a.y||s.hall.tableForeground.depth!==tableY)issues.push({kind:'support-plane',id:step.id});
   if(step.id==='alice-c1-drink-find-box'){boxApproachSamples++;const pixels=overlap(a,s.hall.tableForeground,true);maxLegFootOverlap=Math.max(maxLegFootOverlap,pixels);if(pixels)issues.push({kind:'box-approach-feet-cross-table-leg',fraction:j/n,overlap:pixels});}
   const tableProps=[...(e.model.hall.key.owner===null?[key]:[]),...(!d.active||d.bottleOwner==='table'?[bottle]:[]),...(d.active&&d.cork===1?[s.drinkMe.props.cork]:[])];
   s.children.depthSort();
   for(const p of tableProps){if(p.depth!==tableY+1)issues.push({kind:'table-prop-depth',id:step.id,texture:p.texture.key,depth:p.depth});if(a.y>tableY&&overlap(a,p)>0){frontOverlaps++;if(s.children.list.indexOf(a)<=s.children.list.indexOf(p))issues.push({kind:'table-prop-over-front-actor',id:step.id});}}
   if(d.active&&d.bottleOwner==='floor'){
    const base=s.drinkGeometry.props.bottle.floorBaseSource[1]*2;if(bottle.depth!==base)issues.push({kind:'floor-bottle-depth',id:step.id});
    if(a.y>base&&s.children.list.indexOf(a)<=s.children.list.indexOf(bottle))issues.push({kind:'bottle-over-front-actor',id:step.id});
    if(d.magicScale===.32&&e.model.actors.alice.pose==='walk'){smallWalkSamples++;const pixels=overlap(a,bottle);maxBottleOverlap=Math.max(maxBottleOverlap,pixels);if(pixels)issues.push({kind:'small-route-crosses-bottle-alpha',id:step.id,fraction:j/n,overlap:pixels});}
   }
  }
 }
 return{samples,frontOverlaps,smallWalkSamples,boxSamples,maxBottleOverlap,boxApproachSamples,maxLegFootOverlap,foregroundPixelChanges,issues};
});report.cases.push(row);
for(const[id,f]of [['alice-c1-drink-around-table',.55],['alice-c1-drink-return-key',.7],['alice-c1-hall-hook-bottle',.5],['alice-c1-drink-hook-hold',.5]]){await page.evaluate(([id,f])=>{const e=qaScene.reader;e.start(id);e.paused=false;e.tick(e.step.duration*f);e.paused=true;e.onChange('back');qaScene.draw(0,true);qaScene.game.step(performance.now(),0);},[id,f]);await page.screenshot({path:out+'/'+id+'.png'});}
await context.close();report.passed=row.issues.length===0&&row.samples>500&&row.smallWalkSamples>50&&row.frontOverlaps>0&&row.boxApproachSamples>10&&!report.errors.length&&!report.resources.length;
}finally{await b.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}console.log(JSON.stringify(report.cases.map(x=>({...x,issues:x.issues.slice(0,8)}))));assert(report.passed);console.log('PASS actual alpha routes, support-plane render order and persistent central box');
