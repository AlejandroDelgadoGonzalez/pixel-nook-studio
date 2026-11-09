import {officialLayouts,officialSizes} from './official-layouts.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {launch,openCase,preparePassage} from './helpers/browser.mjs';
import {storyCases} from './helpers/story-cases.mjs';
import {inspectViewport} from './checks/viewport-coverage.mjs';
const out=process.env.QA_OUTPUT_DIR||'.artifacts/qa/alice-in-wonderland/chapter-2-scene-1/motion';await fs.mkdir(out,{recursive:true});
const report={scope:'C2-S1 live renderer; Edge/Chromium simulated viewports, not physical phones/Safari',errors:[],resources:[],layouts:[],audioRequests:[]},cases=await storyCases(),item=cases.find(x=>x.slug==='alice-in-wonderland'&&x.chapter.number===2),c1=cases.find(x=>x.slug==='alice-in-wonderland'&&x.chapter.number===1),browser=await launch();
const layouts=officialSizes;
try{
 for(const [width,height]of layouts){
  const {page,context}=await openCase(browser,item,{width,height},report);page.on('request',r=>{if(/\.mp3(?:\?|$)/.test(r.url()))report.audioRequests.push(r.url());});
  await page.evaluate(code=>window.inspectC2Viewport=(0,eval)('('+code+')'),inspectViewport.toString());
  const row=await page.evaluate(allowCameraTrial=>{
   const s=qaScene,e=s.reader,issues=[],render=()=>{s.draw(0,true);s.game.step(performance.now(),0);},texts=e.story.steps.filter(p=>p.type==='text'),props=['key','cork','box','lid','bottle','fan','gloves','table','tears'];
   const signature=p=>JSON.stringify({key:p.texture.key,frame:p.frame.name,x:p.x,y:p.y,zx:p.scaleX,zy:p.scaleY,ox:p.originX,oy:p.originY,depth:p.depth,flipX:p.flipX,flipY:p.flipY,rotation:p.rotation,alpha:p.alpha,visible:p.visible});
   e.start(texts[0].id);e.paused=true;render();const frame=JSON.stringify(s.framing),baseline=Object.fromEntries(props.map(id=>[id,signature(s.objects[id])]));
   const cache=new Map(),pixels=p=>{const key=p.texture.key;if(!cache.has(key)){const im=p.texture.getSourceImage(),c=im.getContext?im:null;if(c)cache.set(key,{width:im.width,height:im.height,data:c.getContext('2d').getImageData(0,0,im.width,im.height).data});else{const q=document.createElement('canvas');q.width=im.width;q.height=im.height;q.getContext('2d').drawImage(im,0,0);cache.set(key,{width:im.width,height:im.height,data:q.getContext('2d').getImageData(0,0,im.width,im.height).data});}}return cache.get(key);};
   const opaque=(p,x,y)=>{const im=pixels(p);let xx=(x-p.x)/p.scaleX+p.originX*im.width,yy=(y-p.y)/p.scaleY+p.originY*im.height;if(p.flipX)xx=im.width-xx;if(p.flipY)yy=im.height-yy;xx=Math.floor(xx);yy=Math.floor(yy);if(xx<0||yy<0||xx>=im.width||yy>=im.height)return false;if(p.isCropped){const c=p._crop;if(xx<c.x||xx>=c.x+c.width||yy<c.y||yy>=c.y+c.height)return false;}return im.data[(yy*im.width+xx)*4+3]>80;};
   const overlaps=(a,b)=>{const aa=a.getBounds(),bb=b.getBounds(),l=Math.ceil(Math.max(aa.left,bb.left)),r=Math.floor(Math.min(aa.right,bb.right)),t=Math.ceil(Math.max(aa.top,bb.top)),bot=Math.floor(Math.min(aa.bottom,bb.bottom));let n=0;if(l>=r||t>=bot)return 0;for(let y=t;y<bot;y++)for(let x=l;x<r;x++)if(opaque(a,x+.5,y+.5)&&opaque(b,x+.5,y+.5))n++;return n;};
   let samples=0,propSamples=0,clickSamples=0,maximumClickShift=0;
   function audit(label){samples++;if(JSON.stringify(s.framing)!==frame&&!(allowCameraTrial&&s.cameraTrial?.state?.active))issues.push({kind:'camera-drift',label});for(const id of props){propSamples++;if(signature(s.objects[id])!==baseline[id])issues.push({kind:'static-prop-drift',label,id});}
    const people=Object.entries(s.people).filter(([,p])=>p.actor.visible&&p.actor.alpha>.1);
    for(const [id,p]of people){for(const prop of ['key','cork','box','lid','bottle','fan','gloves','table']){const n=overlaps(p.actor,s.objects[prop]);if(n)issues.push({kind:'opaque-prop-contact',label,id,prop,pixels:n});}
     if(p.actor.depth!==(id==='dodo'&&e.model.actors[id].y<1020?Math.max(1001,e.model.actors[id].y):e.model.actors[id].y))issues.push({kind:'actor-support-depth',label,id});
     const active=e.step?.companyStage?.phase||e.model.company.phase;if(['inherit','swim','wade'].includes(active)&&['dodo','lory','eaglet'].includes(id))issues.push({kind:'early-bird',id,label});
    }
    for(let i=0;i<people.length;i++)for(let j=i+1;j<people.length;j++){const n=overlaps(people[i][1].actor,people[j][1].actor);if(n)issues.push({kind:'opaque-actor-contact',label,actors:[people[i][0],people[j][0]],pixels:n});}
    const v=inspectC2Viewport(s);for(const issue of v.issues)issues.push({label,...issue});
   }
   for(const a of e.story.steps.filter(p=>p.type==='action')){const n=Math.max(2,Math.ceil(a.duration/50));for(let i=0;i<=n;i++){e.start(a.id);e.paused=false;e.tick(a.duration*i/n*(1-1e-8));e.paused=true;e.onChange('back');render();audit(a.id+'@'+i+'/'+n);const frozen=JSON.stringify(e.model),time=e.totalTime;e.tick(20);render();if(JSON.stringify(e.model)!==frozen||e.totalTime!==time)issues.push({kind:'pause-drift',id:a.id});}}
   for(const t of texts){e.start(t.id);e.paused=false;e.tick(t.text.length*(e.story.timing.characterMs||27)+1);e.paused=true;e.onChange('back');render();audit(t.id);const positions=Object.fromEntries(Object.entries(s.people).map(([id,p])=>[id,[p.actor.x,p.actor.y]]));const frozen=JSON.stringify(e.model);e.paused=false;e.tick(100);e.paused=true;render();for(const[id,p]of Object.entries(s.people))if(p.actor.x!==positions[id][0]||p.actor.y!==positions[id][1])issues.push({kind:'walking-during-readable-text',id,passage:t.id});
    e.paused=false;e.lastTap=-Infinity;e.advance(100000+clickSamples*1000);e.paused=true;render();for(const[id,p]of Object.entries(s.people)){const delta=Math.hypot(p.actor.x-positions[id][0],p.actor.y-positions[id][1]);maximumClickShift=Math.max(maximumClickShift,delta);if(delta>2.000001)issues.push({kind:'click-teleport',id,passage:t.id,delta});}clickSamples++;
    const rebuilt=new (e.constructor)(e.story);rebuilt.start(t.id);e.start(t.id);if(JSON.stringify(rebuilt.model)!==JSON.stringify(e.model))issues.push({kind:'reconstruction',id:t.id});
   }
   const playback=[];for(const auto of [false,true]){e.sceneGate=false;e.setAuto(auto);e.start();let seen=[],guard=0;while(e.running){if(++guard>10000)throw Error('Playback did not finish');if(e.step.type==='text'){seen.push(e.step.id);if(auto)e.tick(e.step.readingDurationMs);else{e.revealed=e.step.text.length;e.advance(1000000+guard*1000);}}else e.tick(e.step.duration);}if(seen.length!==12)issues.push({kind:'missing-dialogue',auto,seen});playback.push({auto,seen:seen.length});}
   return {samples,propSamples,clickSamples,maximumClickShift,playback,issues:issues.slice(0,100),issueCount:issues.length,frame:JSON.parse(frame)};
  },process.argv.includes('--camera-trial'));
  // Pixel-identical stage continuity, excluding the distinct chapter UI.
  const stageHash=async(page,id)=>page.evaluate(async id=>{const e=qaScene.reader;e.start(id);e.paused=true;e.elapsed=0;qaScene.draw(0,true);qaScene.game.step(performance.now(),0);const c=qaScene.game.canvas,a=c.getContext('2d').getImageData(0,0,c.width,c.height).data;return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',a))).map(x=>x.toString(16).padStart(2,'0')).join('');},id);
  const start=await stageHash(page,item.story.steps.find(s=>s.type==='text').id),old=await openCase(browser,c1,{width,height},report),last=await stageHash(old.page,'alice-c1-pool-end');await old.context.close();row.c1Boundary={pixelIdentical:start===last,c1:last,c2:start};
  if(start!==last)row.issues.push({kind:'C1-C2-pixel-boundary'});
  for(const [id,label]of [['alice-c2-way-out-edge','shore'],['alice-c2-way-out-help','company'],['alice-c2-way-out-company','door']]){await preparePassage(page,id);await page.screenshot({path:`${out}/${width}x${height}-${label}.png`});}
  await preparePassage(page,'alice-c2-way-out-feathers');await page.click('#top-mute');await page.waitForTimeout(50);row.soundToggleTested=true;
  row.layout={width,height};report.layouts.push(row);await context.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify({layout:row.layout,samples:row.samples,clicks:row.clickSamples,maxClickShift:row.maximumClickShift,issues:row.issues.length,pixelBoundary:row.c1Boundary.pixelIdentical}));
  assert.equal(row.issues.length,0,JSON.stringify(row.issues.slice(0,10)));
 }
 assert.deepEqual(report.audioRequests,[]);assert.deepEqual(report.errors,[]);assert.deepEqual(report.resources,[]);report.passed=true;
}finally{await browser.close();report.finishedAt=new Date().toISOString();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}
assert(report.passed);console.log('PASS C2-S1 complete live motion, prop alpha/depth, immediate taps, silence and C1 boundary');
