import {officialLayouts,officialSizes} from './official-layouts.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {launch,openCase,preparePassage} from './helpers/browser.mjs';
import {storyCases} from './helpers/story-cases.mjs';
import {inspectViewport} from './checks/viewport-coverage.mjs';
const out=process.env.QA_OUTPUT_DIR||'.artifacts/qa/alice-in-wonderland/new-scene-3/motion';await fs.mkdir(out,{recursive:true});
const browser=await launch(),report={errors:[],resources:[],issues:[],layouts:[]};
try{const item=(await storyCases()).find(x=>x.slug==='alice-in-wonderland');
const layouts=officialLayouts;
const selected=process.argv.find(x=>x.startsWith('--layout='))?.split('=')[1];if(selected)assert(layouts.some(x=>x.name===selected));
const activeLayouts=layouts.filter(x=>(!selected||x.name===selected)&&(!process.argv.includes('--usual-layouts')||(x.width>=360&&x.height>=600&&x.height/x.width<=2.6)));const{page,context}=await openCase(browser,item,activeLayouts[0],report);await page.evaluate(code=>window.hallViewport=(0,eval)('('+code+')'),inspectViewport.toString());
for(const layout of activeLayouts){await page.setViewportSize({width:layout.width,height:layout.height});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
const row=await page.evaluate(()=>{const s=qaScene,e=s.reader,issues=[],zooms=new Set(),roomZooms=new Set();let samples=0,held=0;e.sceneGate=false;
for(const step of e.story.steps.filter(x=>x.sceneIndex===2&&x.type!=='end')){const n=step.type==='action'?Math.max(2,Math.ceil(step.duration/100)):1;for(let i=0;i<=n;i++){e.start(step.id);e.paused=false;if(step.type==='action')e.tick(step.duration*i/n*.9999999);else e.revealed=step.text.length;e.paused=true;e.onChange('back');s.draw(0,true);s.game.step(performance.now(),0);const v=hallViewport(s);if(v.issues.length)issues.push({step:step.id,fraction:i/n,issues:v.issues});if(!s.framing.fits)issues.push({kind:'framing',step:step.id,fraction:i/n,frame:s.framing});if(step.id!=='alice-c1-hall-room-frame'){if(e.model.hall.roomLock>0)roomZooms.add(s.cameras.main.zoom);else zooms.add(s.cameras.main.zoom);}samples++;
if(e.model.environment==='hall-of-doors'){const a=s.people.alice.actor,p=s.hall.prop(),h=e.model.hall;
if(['alice-c1-hall-take-key','alice-c1-hall-hook-release','alice-c1-hall-hook-bottle'].includes(step.id)&&Math.abs(a.y-1380)>1e-8)issues.push({kind:'table-ground',step:step.id,y:a.y});
if(['alice-c1-hall-draw-curtain','alice-c1-hall-unlock','alice-c1-hall-garden'].includes(step.id)){const b=a.getBounds(),table=s.hall.geometry.positionRevision.glassTableSourceBounds.map(v=>v*2);if(b.left<table[0]+table[2]&&b.right>table[0]&&b.top<table[1]+table[3]&&b.bottom>table[1])issues.push({kind:'furniture-overlap',step:step.id});}
if(s.hall.actorInfo().walking){const dir=e.model.actors.alice.facing,key=a.texture.key;if(dir==='back'&&!key.includes('-back-')||dir==='front'&&!key.includes('-front-'))issues.push({kind:'wrong-vertical-walk-pose',step:step.id,dir,key});}
if(p.owner==='alice'){held++;const info=s.hall.actorInfo(),c=info.c,im=a.texture.getSourceImage(),walking=info.walking,hand=[c.handAnchorNormalized[0]+(walking?6:0),c.handAnchorNormalized[1]],px=Math.min(im.width-1,Math.floor(hand[0])),py=Math.min(im.height-1,Math.floor(hand[1])),rgba=im.getContext('2d').getImageData(px,py,1,1).data;
// Independent Canvas batch transform: flip mirrors around the texture's extent,
// so a reflected foot/hand requires its reflected display origin as well.
const handWorld=[a.x+(a.flipX?im.width-a.displayOriginX-hand[0]:hand[0]-a.displayOriginX)*a.scaleX,a.y+(hand[1]-a.displayOriginY)*a.scaleY];
if(rgba[3]!==255||Math.hypot(handWorld[0]-p.point[0],handWorld[1]-p.point[1])>.001)issues.push({kind:'actual-texture-hand-grip',step:step.id,rgba:[...rgba],handWorld,prop:p.point});
const key=s.objects.key,keyIm=key.texture.getSourceImage(),pin=s.hall.geometry.props.key.ringGripNormalized,keyWorld=[key.x+(key.flipX?keyIm.width-key.displayOriginX-pin[0]:pin[0]-key.displayOriginX)*key.scaleX,key.y+(pin[1]-key.displayOriginY)*key.scaleY];if(Math.hypot(keyWorld[0]-p.point[0],keyWorld[1]-p.point[1])>.001)issues.push({kind:'actual-key-ring-grip',step:step.id});}
}
}}
if(roomZooms.size!==1)issues.push({kind:'room-zoom-jump',zooms:[...roomZooms]});if(zooms.size!==1)issues.push({kind:'zoom-jump',zooms:[...zooms]});
e.start('alice-c1-drink-inherit');const h=e.model.hall;if(h.key.owner!==null||h.door!==0||h.curtain!==1||e.model.jar.state!=='lower-fixed')issues.push({kind:'final-state'});
return{samples,held,zooms:[...zooms],issues};});report.layouts.push({layout,...row});report.issues.push(...row.issues.map(x=>({layout,...x})));console.log(JSON.stringify({layout,issues:row.issues.slice(0,2),samples:row.samples}));
if(layout.width===390||layout.width===1366){for(const id of ['alice-c1-hall-doors','alice-c1-hall-garden','alice-c1-hall-hook-bottle']){if(id.endsWith('bottle'))await page.evaluate(()=>{const e=qaScene.reader;e.start('alice-c1-hall-hook-bottle');e.paused=true;e.onChange('back');qaScene.draw(0,true);qaScene.game.step(performance.now(),0);});else await preparePassage(page,id);await page.screenshot({path:out+'/'+layout.width+'x'+layout.height+'-'+id+'.png'});}}
}
await context.close();report.passed=!report.issues.length&&!report.errors.length&&!report.resources.length;
}finally{await browser.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}assert(report.passed);console.log('PASS measured hall movement, ground/props, viewport and invariant zoom');
