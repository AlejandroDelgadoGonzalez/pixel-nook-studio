import fs from 'node:fs/promises';import assert from 'node:assert/strict';
import {launch,openCase} from './helpers/browser.mjs';import {storyCases} from './helpers/story-cases.mjs';
const out='.artifacts/qa/c3-s3/hands';await fs.mkdir(out,{recursive:true});const browser=await launch(),report={errors:[],resources:[]};
try{
 const item=(await storyCases()).find(c=>c.slug==='alice-in-wonderland'&&c.chapter.number===3),{page,context}=await openCase(browser,item,{width:1280,height:720},report);
 report.samples=await page.evaluate(()=>{
  const e=qaScene.reader,rows=[];
  for(const beat of [3,6,9,12,15])for(let t=0;t<(beat===3||beat===6?3000:5000);t+=100){
   e.start('alice-c3-little-'+String(beat).padStart(2,'0'));e.paused=false;e.tick(t);e.paused=true;qaScene.draw();const s=qaScene.current;
   const l=Math.floor(s.aliceBounds.left-10),top=Math.floor(s.aliceBounds.top-10),w=Math.ceil(s.aliceBounds.right-l+20),h=Math.ceil(s.aliceBounds.bottom-top+20),im=qaScene.trialLayer.getContext('2d').getImageData(l,top,w,h),pixels=im.data,seen=new Uint8Array(w*h),groups=[];
   for(let i=0;i<w*h;i++)if(pixels[i*4+3]>=128&&!seen[i]){const stack=[i],g=[];seen[i]=1;while(stack.length){const n=stack.pop();g.push(n);const x=n%w,y=Math.floor(n/w);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy,k=Y*w+X;if(X>=0&&Y>=0&&X<w&&Y<h&&!seen[k]&&pixels[k*4+3]>=128){seen[k]=1;stack.push(k);}}}groups.push(g);}
   groups.sort((a,b)=>b.length-a.length);
   if(Math.abs(s.uniformScale.x-s.uniformScale.y)>1e-9)throw Error('Nonuniform native transform');
   rows.push({beat,t,components:groups.map(g=>g.length),hand:s.hand,held:s.held,scale:s.scale,uniform:s.uniformScale,atMouth:s.atMouth||false});
  }
  return rows;
 });
 for(const beat of [3,6,9,12,15])for(const t of [0,500,1000,1500,2000,2500]){
  const data=await page.evaluate(([beat,t])=>{const e=qaScene.reader;e.start('alice-c3-little-'+String(beat).padStart(2,'0'));e.paused=false;e.tick(t);e.paused=true;qaScene.draw();return qaScene.trialLayer.toDataURL();},[beat,t]);await fs.writeFile(`${out}/beat${beat}-${t}.png`,Buffer.from(data.split(',')[1],'base64'));
 }
 report.detached=report.samples.filter(s=>s.components.slice(1).some(n=>n>3));
 report.passed=report.detached.length===0;await context.close();
}finally{await browser.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}
assert(report.passed,'Detached hand/piece groups: '+JSON.stringify(report.detached.slice(0,5)));console.log('PASS native arm/prop connected and uniform scale',report.samples.length);
