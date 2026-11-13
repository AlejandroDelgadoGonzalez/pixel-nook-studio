import fs from 'node:fs/promises';import assert from 'node:assert/strict';
import {launch,openCase} from './helpers/browser.mjs';import {storyCases} from './helpers/story-cases.mjs';import {officialLayouts} from './official-layouts.mjs';
const out='.artifacts/qa/c3-discrete/native';await fs.mkdir(out,{recursive:true});const browser=await launch(),report={errors:[],resources:[],cases:[]};
try{
 const item=(await storyCases()).find(c=>c.slug==='alice-in-wonderland'&&c.chapter.number===3);
 for(const layout of officialLayouts){const {page,context}=await openCase(browser,item,layout,report);
 const r=await page.evaluate(()=>{
  const e=qaScene.reader;let checks=0;const frames=[];
  function sample(b,t){e.start('alice-c3-little-'+String(b).padStart(2,'0'));e.paused=false;e.tick(t);e.paused=true;qaScene.draw();return qaScene.current;}
  for(const b of [1,3,4,6,7,8,9,11,12,14,15,17])for(const t of [0,1,16,100,500,1100,1499,1800,2100,2699,2999]){
   const s=sample(b,t);if([1,4,7].includes(b)&&(s.pose!=='right'||s.mirror!==(b===4)||!s.walking))throw Error('Moonwalk '+b+' at '+t);
   const canvas=document.createElement('canvas');canvas.width=1664;canvas.height=936;const ctx=canvas.getContext('2d');let calls=0;
   const proxy=new Proxy(ctx,{get(target,key){if(['rotate','clip','getImageData','putImageData'].includes(key))return()=>{throw Error('Body-part operation '+key);};const value=target[key];if(key==='drawImage')return(...args)=>{calls++;if(args.length!==3)throw Error('Anatomical crop');return value.apply(target,args);};return typeof value==='function'?value.bind(target):value;},set(target,key,val){target[key]=val;return true;}});
   qaScene.trialRig.draw(proxy,s);if(calls!==1)throw Error('Full sprite must be drawn exactly once');checks++;
   frames.push({beat:b,t,pose:s.renderedPose,root:s.alice,mirror:s.mirror,draws:calls});
  }
  const pickup=[];for(const t of [0,100,1499,1500,2000,2999]){e.start('alice-c3-side-11');e.paused=false;e.tick(t);e.paused=true;qaScene.draw();const s=qaScene.current;if(JSON.stringify(s.root)!=='[490,370]')throw Error('Caterpillar root drift');const expected=t<1500?'mouthpiece-low-right':'climb-carry-right';if(s.pose!==expected)throw Error('Not discrete pickup');pickup.push({t,pose:s.pose,base:s.hookahBase});}
  return{checks,frames,pickup};
 });report.cases.push({layout,...r});await page.screenshot({path:out+'/'+layout.name+'.png'});await context.close();}
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.resources,[]);report.passed=true;
}finally{await browser.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}
console.log('PASS six-view native full-sprite-only draw guard and no moonwalk');
