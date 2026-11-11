import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {launch,openCase,preparePassage} from './helpers/browser.mjs';
import {storyCases} from './helpers/story-cases.mjs';
import {officialLayouts} from './official-layouts.mjs';
const output=process.env.QA_OUTPUT_DIR||'.artifacts/qa/alice-polish-four';
await fs.mkdir(output,{recursive:true});
const browser=await launch(),report={errors:[],resources:[],layouts:[]};
try{
 const cases=(await storyCases()).filter(c=>c.slug==='alice-in-wonderland');
 for(const layout of officialLayouts){
  const result={name:layout.name};
  for(const chapter of[1,2]){
   const{page,context}=await openCase(browser,cases.find(c=>c.chapter.number===chapter),layout,report);
   const checks=await page.evaluate(chapter=>{
    const s=qaScene,e=s.reader;
    const sample=(id,elapsed=0)=>{e.start(id);e.paused=false;if(elapsed)e.tick(elapsed);e.paused=true;e.onChange('back');s.draw(0,true);s.game.step(performance.now(),0);};
    const pose=()=>{const a=s.people.alice.actor;return{texture:a.texture.key,flip:a.flipX,origin:[a.originX,a.originY],root:[a.x,a.y],scale:[a.scaleX,a.scaleY],frame:structuredClone(s.framing)};};
    const floor=(canvas,end=canvas.height)=>{const p=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data,values=[];let lit=0;for(let y=end-12;y<end;y+=2){let total=0,count=0;for(let x=12;x<canvas.width-12;x+=2){const i=(y*canvas.width+x)*4;if(p[i+3]){total+=p[i]+p[i+1]+p[i+2];count++;if(p[i]+p[i+1]+p[i+2]>50)lit++;}}values.push(count?total/count:0);}return{values,lit};};
    if(chapter===1){
     const poses=[];
     for(const[id,elapsed]of[['alice-c1-drink-hook-crouch',0],['alice-c1-drink-hook-crouch',1],['alice-c1-drink-hook-crouch',899],['alice-c1-drink-hook-open',0],['alice-c1-drink-hook-open',1499]]){sample(id,elapsed);poses.push(pose());}
     return{poses,threshold:floor(s.poolOfTears.dooropen.texture.getSourceImage(),s.poolOfTears.geometry.occluders[0].thresholdFloorLight.textureFloorY)};
    }
    sample('alice-c2-bill-13');const before=pose();
    e.paused=false;e.setAuto(true);e.tick(3499);if(e.step.id!=='alice-c2-bill-13')throw Error('First line advanced early');e.tick(1);if(e.step.id!=='alice-c2-bill-13-kick')throw Error('Second line missing');e.paused=true;s.draw(0,true);s.game.step(performance.now(),0);const after=pose();
    e.paused=false;e.tick(3500);if(e.step.id!=='alice-c2-bill-14')throw Error('Kick action no longer follows the two lines');
    sample('alice-c2-bill-13');e.paused=false;e.setAuto(false);e.revealed=e.step.text.length;if(!e.advance(performance.now()))throw Error('First dialogue cannot advance');if(e.step.id!=='alice-c2-bill-13-kick')throw Error('Manual second dialogue missing');e.revealed=e.step.text.length;if(!e.advance(performance.now()+1000)||e.step.id!=='alice-c2-bill-14')throw Error('Manual kick cannot advance');
    const cake=e.story.steps.find(step=>step.cakeMoment===4);sample(cake.id,(cake.duration||1)-1);const stage=s.cakeStage,canvas=s.textures.get(stage.keys['anchored-reach']).getSourceImage(),p=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
    const joins=[];for(const[y,l,r]of[[376,154,178],[378,156,176],[380,158,172],[382,160,170],[384,162,168],[386,162,164]])for(let x=l;x<r;x+=2)joins.push(p[(y*canvas.width+x)*4+3]);
    return{before,after,joins,root:stage.current.feet,remaining:stage.current.remainingCakeCount,threshold:floor(s.companyAperture.texture.getSourceImage())};
   },chapter);
   if(chapter===1){for(const pose of checks.poses)assert.deepEqual(pose,checks.poses[0],'Box opening changed pose/facing/root/camera');}
   else{assert.deepEqual(checks.before,checks.after,'Splitting dialogue changed the visual state');assert(checks.joins.every(alpha=>alpha===255),'Open cuff/arm seam');assert.deepEqual(checks.root,[1026,664]);assert.equal(checks.remaining,2);}
   assert(checks.threshold.lit>0,'Threshold floor remains black');
   assert(checks.threshold.values.at(-1)>checks.threshold.values[0],'Floor light does not fall off inward: chapter '+chapter+' '+JSON.stringify(checks.threshold));
   if(chapter===2)await preparePassage(page,'alice-c2-bill-13-kick');
   await page.screenshot({path:`${output}/${layout.name}-c${chapter}.png`});
   result['chapter'+chapter]=checks;await context.close();
  }
  report.layouts.push(result);console.log('PASS four polish fixes',layout.name);
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.resources,[]);report.passed=true;
}catch(error){report.passed=false;report.failure=error.stack;process.exitCode=1;console.error(error);
}finally{await browser.close();await fs.writeFile(output+'/report.json',JSON.stringify(report,null,2));}
