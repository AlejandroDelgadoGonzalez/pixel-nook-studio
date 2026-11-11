import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {storyCases} from './helpers/story-cases.mjs';
import {launch,openCase,preparePassage} from './helpers/browser.mjs';
import {officialLayouts} from './official-layouts.mjs';
import {inspectViewport} from './checks/viewport-coverage.mjs';
const out=process.env.QA_OUTPUT_DIR||'.artifacts/qa/alice-c2-s7';await fs.mkdir(out,{recursive:true});
const report={errors:[],resources:[],layouts:[]},browser=await launch();
try{
 const item=(await storyCases()).find(c=>c.slug==='alice-in-wonderland'&&c.chapter.id==='chapter-2');
 if(!process.argv.includes('--live'))for(const layout of officialLayouts){const {page,context}=await openCase(browser,item,layout,report);await page.evaluate(code=>window.inspect=(0,eval)('('+code+')'),inspectViewport.toString());
  const r=await page.evaluate(()=>{const s=qaScene,e=s.reader,rows=[];const sample=(id,fraction)=>{e.start(id);e.paused=false;if(e.step.type==='action')e.tick(e.step.duration*fraction);e.paused=true;e.revealed=e.step.text?.length||0;e.onChange('back');s.draw(0,true);s.game.step(performance.now(),0);return structuredClone(s.cakeStage.current);};
   // Exact visual continuity at the same location: no re-spawn or new artwork.
   e.start('alice-c2-bill-24');e.paused=true;s.draw(0,true);const before={bounds:{...s.largeStage.body.getBounds()},frame:{...s.framing},props:Object.fromEntries(Object.entries(s.largeStage.props).map(([k,o])=>[k,[o.x,o.y]]))};
   sample('alice-c2-cake-02',0);
   const opener=e.story.scenes[6].steps[0].text;
   const after={bounds:{...s.largeStage.body.getBounds()},frame:{...s.framing},props:Object.fromEntries(Object.entries(s.largeStage.props).map(([k,o])=>[k,[o.x,o.y]]))};
   for(const n of [3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21])for(const step of e.story.steps.filter(a=>a.cakeMoment===n&&a.type!=='end'))for(const q of [.001,.25,.5,.75,.999]){const a=sample(step.id,q),stage=s.cakeStage,actor=s.people.alice.actor,im=actor.texture.getSourceImage(),ctx=document.createElement('canvas').getContext('2d');ctx.canvas.width=im.width;ctx.canvas.height=im.height;ctx.drawImage(im,0,0);const pixels=ctx.getImageData(0,0,im.width,im.height).data;
    // Prove the untouched cakes do not lie underneath opaque knees/dress.
    let cakeOverlap=0;if(n>=3&&n<=6)for(const [cx,cy]of a.cakeRest)for(let dx=-8;dx<=8;dx+=2)for(let dy=-12;dy<=0;dy+=2){let x=(cx+dx-actor.x)/actor.scaleX+actor.originX*im.width,y=(cy+dy-actor.y)/actor.scaleY+actor.originY*im.height;if(actor.flipX)x=im.width-1-x;x=Math.floor(x);y=Math.floor(y);if(x>=0&&x<im.width&&y>=0&&y<im.height&&pixels[(y*im.width+x)*4+3])cakeOverlap++;}
    const rabbit=s.diagnostics().actors['white-rabbit']?.bounds;
    rows.push({flipped:actor.flipX,rabbitInView:!!rabbit&&rabbit.left>=0&&rabbit.right<=s.scale.width&&rabbit.top>=0&&rabbit.bottom<=s.scale.height,id:step.id,q,...a,cakeOverlap,texture:actor.texture.key,visibleCakes:stage.items.filter(o=>o.visible).length,headY:actor.getBounds().top,viewportIssues:step.type==='text'?inspect(s).issues:[],captionHidden:document.querySelector('#dialogue').hasAttribute('data-caption-clear')&&document.querySelector('#dialogue').classList.contains('inactive'),advanceAccepted:step.type==='action'?e.advance(performance.now()):null});
   }
   // Compare the actual frame and actor root on either side of each beat boundary.
   const edges=e.story.steps.filter(step=>step.cakeMoment&&step.type!=='end').map(step=>{
    const capture=fraction=>{
     sample(step.id,fraction);
     const actor=s.people.alice.actor,{x,y,z}=s.framing;
     return{frame:[x,y,z],feet:[actor.x,actor.y],alpha:actor.alpha};
    };
    return{id:step.id,n:step.cakeMoment,start:capture(0),end:capture(.999999)};
   });
   // Full chapter reconstruction and both modes traverse S6 -> S7 without end.
   const continuity=[];for(const auto of[true,false]){e.sceneGate=false;e.setAuto(auto);e.start('alice-c2-bill-01');e.onChange('back');e.paused=false;let guard=0,previous=e.step.sceneIndex,crossed=false;while(e.running){if(++guard>500)throw Error('Playback stalled');const step=e.step;if(step.type==='action')e.tick(step.duration);else if(auto)e.tick(Math.max(step.readingDurationMs||0,100000));else{e.revealed=step.text.length;e.advance(guard*1000);}s.draw(0,true);s.game.step(performance.now(),0);if(e.step.sceneIndex!==previous){if(e.step.sceneIndex===6)crossed=!document.querySelector('#ending').hidden?false:true;previous=e.step.sceneIndex;}}continuity.push({auto,crossed,end:e.step.id});}
   return{before,after,opener,rows,edges,continuity};
  });
  assert.equal(r.opener,'Only a small bite. I have had quite enough of growing.');
  for(const row of r.rows){
   if(row.n===5||row.n===6)assert.equal(row.pose,'kneeling-bite');
   if(row.id.endsWith('14-open'))assert.deepEqual(row.feet,[1065,668]);
   if(row.id.endsWith('14-threshold'))assert(row.alpha>0&&row.alpha<1&&row.walking);
   if(row.n===17||row.id.endsWith('16-steps')&&row.q===.999)assert(row.rabbitInView,row.id);
   if(row.n===21)assert(row.flipped&&row.pose==='walk-right','Forest walk must start and stay left-facing');
  }
  const near=(a,b)=>a.every((value,i)=>Math.abs(value-b[i])<.01);
  for(let i=1;i<r.edges.length;i++){
   const previous=r.edges[i-1],next=r.edges[i];
   if(next.n===15)continue; // A deliberate dissolve between the house and courtyard.
   assert(near(previous.end.frame,next.start.frame),'Camera jump at '+next.id);
   assert(near(previous.end.feet,next.start.feet),'Root jump at '+next.id);
   assert(Math.abs(previous.end.alpha-next.start.alpha)<.01,'Opacity jump at '+next.id);
  }
  const shrinking=r.edges.filter(edge=>edge.n>=4&&edge.n<=13);
  for(const edge of shrinking){
   assert.deepEqual(edge.start.frame,shrinking[0].start.frame);
   assert.deepEqual(edge.end.frame,shrinking[0].start.frame);
  }
  for(const row of r.rows){
   if(row.id.endsWith('16-steps'))assert.equal(row.feet[0],753);
   if(row.n===18)assert.equal(row.feet[1],680);
  }
  assert.deepEqual(r.after,r.before,'Opening must match exact S6 close');
  for(const a of r.rows){assert.equal(a.cakeOverlap,0,a.id+' covers an unchosen cake');assert.deepEqual(a.viewportIssues,[],a.id);if(a.n<=6)assert.equal(a.standing,false);if(a.n===5)assert.equal(a.visibleCakes,3,'Cake remains visible until consumption finishes');if(a.n>=6&&a.inside)assert.equal(a.visibleCakes,2);if(a.n<=6)assert(a.headY>180,'Crouched head crossed the beam');if(a.n===7)assert.equal(a.size,.72);if([4,5].includes(a.n))assert(a.heldCake?.every(Number.isFinite));if(a.advanceAccepted!==null){assert.equal(a.advanceAccepted,false);assert(a.captionHidden,'Moving action has a dialogue box');}if(a.n===17)assert(a.rabbitFacingLeft);}
  assert(r.continuity.every(x=>x.crossed&&x.end==='alice-c2-puppy-end'),JSON.stringify(r.continuity));await preparePassage(page,'alice-c2-cake-19');await page.screenshot({path:`${out}/${layout.name}-escape.png`});report.layouts.push({layout:layout.name,...r});await context.close();console.log('PASS S7 physical continuity',layout.name);
 }
 if(process.argv.includes('--live')){
  const {page,context}=await openCase(browser,item,{width:390,height:844},report);
  await page.evaluate(()=>{const s=qaScene,e=s.reader;e.sceneGate=false;e.setAuto(true);e.start('alice-c2-bill-24');e.onChange('back');e.paused=false;s.game.loop.start(s.game.step.bind(s.game));});
  const samples=[];let ended=false,last='';for(let i=0;i<900;i++){await page.waitForTimeout(100);const a=await page.evaluate(()=>({id:qaScene.reader.step.id,type:qaScene.reader.step.type,stage:qaScene.cakeStage.active?qaScene.cakeStage.current:null,ending:!document.querySelector('#ending').hidden,captionClear:document.querySelector('#dialogue').hasAttribute('data-caption-clear')}));
   if(a.id!==last){samples.push(a);last=a.id;console.log('1x',a.id);if(a.stage&&[4,5,7,17,19].includes(a.stage.n))await page.screenshot({path:`${out}/live-${a.stage.n}.png`});}
   if(a.type==='action')assert(a.captionClear);if(a.stage?.n===5)assert.equal(a.stage.pose,'kneeling-bite');if(a.id==='alice-c2-puppy-01'){assert.equal(a.ending,false);ended=true;break;}
  }
  assert(ended,'Normal1x reading did not finish');assert(samples.some(s=>s.id==='alice-c2-cake-02'));assert(samples.some(s=>s.id==='alice-c2-cake-21'));report.live={normalSpeed:true,samples,ended};await context.close();
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.resources,[]);report.passed=true;
}catch(e){report.passed=false;report.failure=e.stack;process.exitCode=1;console.error(e);}finally{await browser.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}
