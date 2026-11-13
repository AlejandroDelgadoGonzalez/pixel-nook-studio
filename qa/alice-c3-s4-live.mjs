import fs from 'node:fs/promises';import assert from 'node:assert/strict';
import {launch,watch} from './helpers/browser.mjs';import {officialLayouts} from './official-layouts.mjs';import {base} from './config.mjs';
const out=process.env.QA_OUTPUT_DIR||'.artifacts/qa/c3-s4/live';await fs.mkdir(out,{recursive:true});
const browser=await launch({args:['--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows']}),report={scope:'Actual unmodified1x Phaser automatic playback, eighteen viewport/aspect combinations plus chronological S1..S4',errors:[],resources:[],cases:[]};
async function run(layout,mode,chronological=false){
 const context=await browser.newContext({viewport:{width:layout.width,height:layout.height}}),page=await context.newPage();watch(page,report);
 await context.addInitScript(mode=>{localStorage.setItem('entrelineas:muted','true');localStorage.setItem('betweenlines:auto','true');},mode);
 await page.goto(base+'/reader.html?story=alice-in-wonderland&chapter=chapter-3');await page.waitForFunction(()=>!document.querySelector('#start').disabled);
 await page.click('#show-controls');await page.selectOption('#aspect-ratio',mode);if(!chronological)await page.selectOption('#episode-scene','3');await page.click('#close-settings');
 await page.evaluate(()=>{
  window.liveLog={errors:[],transitions:[],samples:[],captions:[]};
  window.liveTimer=setInterval(()=>{
   const sc=Phaser.Display.Canvas.CanvasPool.pool.find(p=>p.parent?.scene?.getScene)?.parent.scene.scenes[0],e=sc?.reader;if(!e?.running)return;
   const st=e.step,s=sc.current,f=sc.framing,card=document.querySelector('#dialogue'),button=document.querySelector('#text-button'),shown=getComputedStyle(card).opacity==='1',row={id:st.id,scene:st.sceneIndex,beat:st.s4Beat,clock:e.totalTime,elapsed:e.elapsed,wall:performance.now(),frame:structuredClone(f),shown};
   if(liveLog.transitions.at(-1)?.id!==st.id)liveLog.transitions.push(row);
   if(shown&&(button.disabled||getComputedStyle(button).cursor!=='pointer'||e.revealed!==st.text?.length||sc.cameraReframing))liveLog.errors.push('Blocked/incomplete/moving caption '+st.id);
   if(st.type==='action'&&(shown||!button.disabled))liveLog.errors.push('Exposed action card '+st.id);
   if(shown&&!liveLog.captions.includes(st.id))liveLog.captions.push(st.id);
   if(st.s4Beat){
    row.state=structuredClone(s);
    if(s.beat===13&&s.birdOpacity!==1)liveLog.errors.push('Exit fade');
    if(s.beat>=14&&s.birdVisible)liveLog.errors.push('Residual bird');
    if(s.walking&&(s.mirror||s.renderedPose!=='right'))liveLog.errors.push('Wrong walk');
    const canvas=sc.game.canvas.getBoundingClientRect(),top=(card.getBoundingClientRect().top-canvas.top)*sc.scale.height/canvas.height;
    for(const b of [s.aliceBounds,...s.fragments.map(p=>p.bounds),...(s.birdVisible?[s.birdBounds]:[])]){
     const l=(b.left-f.x)*f.z+sc.scale.width/2,r=(b.right-f.x)*f.z+sc.scale.width/2,t=(b.top-f.y)*f.z+sc.scale.height/2,bottom=(b.bottom-f.y)*f.z+sc.scale.height/2;
     if(l<-.5||r>sc.scale.width+.5||t<-.5||top-bottom<11.5)liveLog.errors.push('Clipped silhouette '+st.id);
    }
   }
   liveLog.samples.push(row);
  },100);
 });
 if(chronological)await page.click('#start');else{await page.click('#show-controls');await page.click('#jump-scene');}
 await page.waitForFunction(()=>{const s=Phaser.Display.Canvas.CanvasPool.pool.find(p=>p.parent?.scene?.getScene)?.parent.scene.scenes[0];return s?.reader.step?.id==='alice-c3-branches-end'&&!s.reader.running;},null,{timeout:380000,polling:100});
 const result=await page.evaluate(()=>{clearInterval(liveTimer);return liveLog;});assert.deepEqual(result.errors,[]);
 const s4=result.samples.filter(s=>s.scene===3),duration=s4.at(-1).wall-s4[0].wall;assert(duration>=55000&&duration<=85000,'1x timing '+duration);
 assert.equal(result.transitions.filter(s=>s.scene===3).length,16);assert.equal(result.captions.filter(s=>s.startsWith('alice-c3-branches-')).length,12);
 if(chronological)for(const scene of [0,1,2]){const rows=result.samples.filter(r=>r.scene===scene),duration=rows.at(-1).wall-rows[0].wall;assert(duration>=55000&&duration<=85000,'Regression1x scene '+scene+' '+duration);}
 report.cases.push({layout,mode,chronological,durationMs:duration,...result});await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));await context.close();console.log('PASS live1x',layout.name,mode,chronological?'S1..S4':'S4',Math.round(duration));
}
try{
 // Bound device concurrency; run chronology alone and never alongside encoding.
 const cases=['auto','portrait','landscape'].flatMap(mode=>officialLayouts.map(layout=>({layout,mode})));
 const selected=process.env.QA_LIVE_CASES?JSON.parse(process.env.QA_LIVE_CASES):cases.map((_,i)=>i);
 const batch=Number(process.env.QA_LIVE_BATCH||1);
 for(let n=0;n<selected.length;n+=batch)await Promise.all(selected.slice(n,n+batch).map(i=>run(cases[i].layout,cases[i].mode)));
 if(process.env.QA_LIVE_CHRONOLOGICAL!=='0')await run(officialLayouts[1],'auto',true);
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.resources,[]);report.passed=true;
}finally{await browser.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}
