import fs from 'node:fs/promises';import assert from 'node:assert/strict';
import {launch,openCase} from './helpers/browser.mjs';import {storyCases} from './helpers/story-cases.mjs';import {officialLayouts} from './official-layouts.mjs';
const out='.artifacts/qa/c3-walk/canonical';await fs.mkdir(out,{recursive:true});const browser=await launch(),report={errors:[],resources:[],cases:[]};
try{
 const item=(await storyCases()).find(c=>c.slug==='alice-in-wonderland'&&c.chapter.number===3);
 for(const layout of officialLayouts){const {page,context}=await openCase(browser,item,layout,report);
 const result=await page.evaluate(()=>{
  const e=qaScene.reader;let checks=0;
  for(const beat of [1,4,7])for(const t of [0,1,129,130,259,260,520,1040,2699,2999]){
   e.start('alice-c3-little-'+String(beat).padStart(2,'0'));e.paused=false;e.tick(t);e.paused=true;qaScene.draw();const s=qaScene.current;
   if(s.renderedPose!=='right'||s.mirror!==(beat===4)||!s.walking)throw Error('Wrong gait/facing');checks++;
  }
  const rig=qaScene.trialRig,source=rig.poses.right.image,w=source.width,h=source.height;
  const expected=document.createElement('canvas');expected.width=w;expected.height=h;expected.getContext('2d').drawImage(source,0,0);
  const torso=expected.getContext('2d').getImageData(0,0,w,560).data;
  const hashes=new Set();for(const frame of rig.walkFrames){const c=frame.getContext('2d'),actual=c.getImageData(24,0,w,560).data;if(torso.some((v,i)=>v!==actual[i]))throw Error('Canonical torso changed');hashes.add(frame.toDataURL());}
  if(hashes.size<4)throw Error('No actual footstep cycle');
  if(rig.geometry.rig.walking.frameMs!==130)throw Error('Wrong canonical cadence');
  e.start('alice-c3-who-01');e.paused=false;e.tick(130);e.paused=true;qaScene.draw();
  if(!qaScene.textures.exists('alice-c3-s1-alice-walk-back-1'))throw Error('S1 canonical back cycle missing');
  return{checks,frames:rig.walkFrames.length,distinctFrames:hashes.size,torsoByteIdentical:true,sourcePose:'right',cadenceMs:130,s1BackHelper:true};
 });report.cases.push({layout,...result});await context.close();}
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.resources,[]);report.passed=true;
}finally{await browser.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}
console.log('PASS canonical upright torso, 8 shared-helper frames, cadence and facing in six views');
