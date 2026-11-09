import {officialLayouts,officialSizes} from './official-layouts.mjs';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {launch,openCase} from './helpers/browser.mjs';
import {storyCases} from './helpers/story-cases.mjs';
import {inspectViewport} from './checks/viewport-coverage.mjs';
const baseline=process.argv.includes('--baseline'),mode=process.argv.find(a=>a.startsWith('--mode='))?.slice(7)||'all',out='.artifacts/qa/alice-in-wonderland/camera-trial';await fs.mkdir(out,{recursive:true});
const b=await launch(),report={scope:'Reversible Alice camera trial, actual canvas/UI; simulated Edge, usual-layout scope',mode:baseline?'approved-files':mode,errors:[],resources:[],layouts:[]};
const sizes=baseline||mode==='original'||process.argv.includes('--quick')?[[390,844]]:officialSizes;
const cases=(await storyCases()).filter(x=>x.slug==='alice-in-wonderland'),hash=data=>crypto.createHash('sha256').update(Buffer.from(data,'base64')).digest('hex');
try{
 for(const [width,height]of sizes){const row={width,height,chapters:[]};
  for(const item of cases){const {page,context}=await openCase(b,item,{width,height},report);if(!baseline){await page.evaluate(()=>document.querySelector('#settings-modal').showModal());await page.selectOption('#alice-camera-preset',mode);await page.evaluate(()=>document.querySelector('#settings-modal').close());}await page.evaluate(code=>window.cameraInspect=(0,eval)('('+code+')'),inspectViewport.toString());
   const result=await page.evaluate(({baseline,mode})=>{
    const s=qaScene,e=s.reader,issues=[],frames=[],moments=[],texts=[],chapter=e.story.availableChapter,steps=e.story.steps.filter(p=>chapter==='chapter-2'||p.sceneIndex>=3),draw=()=>{e.paused=true;e.onChange('back');s.draw(0,true);s.game.step(performance.now(),0);};let samples=0,maximumCameraStep=0,minimumClearance=Infinity;
    const data=()=>s.game.canvas.toDataURL().split(',')[1];
    for(const p of steps.filter(p=>p.type!=='end')){
     const n=p.type==='action'?Math.max(1,Math.ceil(p.duration/50)):1;let prev;
     for(let j=0;j<=n;j++){
      e.start(p.id);e.paused=false;if(p.type==='action')e.tick(p.duration*j/n*(1-1e-8));else{e.elapsed=j?p.readingDurationMs||2000:0;e.revealed=p.text.length;}draw();samples++;
      if(j===0||j===n)moments.push({id:p.id,f:j/n,model:JSON.stringify(e.model),frame:{x:s.framing.x,y:s.framing.y,z:s.framing.z}});
      if(baseline||mode==='original')continue;
      const d=s.diagnostics(),v=cameraInspect(s),detail=s.cameraDetail||{};
      for(const issue of v.issues)issues.push({step:p.id,f:j/n,...issue});minimumClearance=Math.min(minimumClearance,...v.bodies.map(x=>x.captionClearance));
      if(['alice-c1-drink-forgot-key','alice-c1-drink-try','alice-c1-drink-reach','alice-c1-drink-slip','alice-c1-drink-smooth'].includes(p.id)){const key=s.objects.key.getBounds(),f=s.framing,l=(key.left-f.x)*f.z+s.scale.width/2,r=(key.right-f.x)*f.z+s.scale.width/2,top=(key.top-f.y)*f.z+s.scale.height/2,bottom=(key.bottom-f.y)*f.z+s.scale.height/2;if(l<0||r>s.scale.width||top<0||bottom>v.panel.top)issues.push({kind:'referenced-key-not-fully-visible',step:p.id,bounds:{l,r,top,bottom}});}
      if(s.shotDissolve?.active||s.shotDissolve?.alpha>0)issues.push({kind:'unexpected-shot-dissolve',step:p.id});
      const f=s.framing;if(prev)maximumCameraStep=Math.max(maximumCameraStep,Math.hypot((f.x-prev.x)*f.z,(f.y-prev.y)*f.z));prev={...f};
      for(const[id,person]of Object.entries(s.people)){const actor=person.actor,record=detail[id];if(!record)continue;const res=record.resolution;if(Math.abs(actor.scaleX*res-record.logicalScale)>1e-9||actor.texture.getSourceImage().width!==s.textures.get(record.sourceTexture).getSourceImage().width*res)issues.push({kind:'detail-physical-scale',id,step:p.id});if(actor.x!==Math.round(e.model.actors[id]?.x/2)*2&&id!=='mouse')issues.push({kind:'detail-anchor-x',id,step:p.id});}
      const frozen=JSON.stringify(e.model),camera=JSON.stringify(s.framing);e.tick(30);draw();if(JSON.stringify(e.model)!==frozen||JSON.stringify(s.framing)!==camera)issues.push({kind:'pause-camera-drift',step:p.id});
     }
     if(p.type==='text'){e.start(p.id);e.revealed=p.text.length;draw();const before=Object.fromEntries(Object.entries(s.people).map(([id,p])=>[id,[p.actor.x,p.actor.y]]));e.paused=false;e.lastTap=-Infinity;e.advance(100000+samples*1000);draw();let max=0;for(const[id,p]of Object.entries(s.people))if(before[id])max=Math.max(max,Math.hypot(p.actor.x-before[id][0],p.actor.y-before[id][1]));texts.push({id:p.id,maxRootShift:max});if(max>2)issues.push({kind:'text-click-root-shift',id:p.id,max});}
    }
    const ids=chapter==='chapter-2'?['alice-c2-way-out-question','alice-c2-way-out-help','alice-c2-way-out-company','alice-c2-way-out-hook-push']:['alice-c1-drink-shrink','alice-c1-drink-fit','alice-c1-drink-hook-hold','alice-c1-eat-label','alice-c1-eat-grow-first','alice-c1-eat-key','alice-c1-pool-help','alice-c1-pool-tears','alice-c1-pool-mouse','alice-c1-pool-hook-swim'];
    for(const id of ids){e.start(id);e.paused=false;if(e.step.type==='action')e.tick(e.step.duration*(1-1e-8));e.revealed=e.step.text?.length||0;draw();frames.push({id,png:data(),frame:{x:s.framing.x,y:s.framing.y,z:s.framing.z},detail:s.cameraDetail});}
    return{chapter,samples,minimumClearance,maximumCameraStep,texts,issueCount:issues.length,issues:issues.slice(0,30),moments,frames};
   },{baseline,mode});
   for(const f of result.frames){f.hash=hash(f.png);await fs.writeFile(`${out}/${report.mode}-${width}x${height}-${f.id}.png`,Buffer.from(f.png,'base64'));delete f.png;}
   row.chapters.push(result);await context.close();console.log(JSON.stringify({mode:report.mode,width,height,chapter:item.chapter.id,samples:result.samples,issues:result.issueCount,examples:result.issues.slice(0,2)}));
  }
  report.layouts.push(row);await fs.writeFile(out+'/'+report.mode+'.json',JSON.stringify(report,null,2));
 }
 if(mode==='original'&&!baseline){const old=JSON.parse(await fs.readFile(out+'/approved-files.json'));for(let c=0;c<2;c++){const a=old.layouts[0].chapters[c],n=report.layouts[0].chapters[c];assert.deepEqual(n.frames.map(f=>f.hash),a.frames.map(f=>f.hash),'Original mode must reproduce approved-file canvas pixels');assert.deepEqual(n.moments,a.moments,'Original mode must reproduce approved states/cameras');}report.originalPixelIdentical=true;}
 report.passed=!report.errors.length&&!report.resources.length&&report.layouts.every(l=>l.chapters.every(c=>!c.issueCount));
}finally{await b.close();await fs.writeFile(out+'/'+report.mode+'.json',JSON.stringify(report,null,2));}
assert(report.passed,'Inspect current camera trial evidence');console.log('PASS '+report.mode);
