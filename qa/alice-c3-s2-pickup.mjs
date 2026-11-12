import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {launch,openCase} from './helpers/browser.mjs';
import {storyCases} from './helpers/story-cases.mjs';
const out='.artifacts/qa/c3-s2/pickup';await fs.mkdir(out,{recursive:true});
const browser=await launch(),report={errors:[],resources:[],frames:[]};
try{
 const item=(await storyCases()).find(c=>c.slug==='alice-in-wonderland'&&c.chapter.number===3),{page,context}=await openCase(browser,item,{width:1280,height:720},report);
 const rows=await page.evaluate(()=>{
  const e=qaScene.reader,rows=[];for(let t=0;t<=3000;t+=100){e.start('alice-c3-side-11');e.elapsed=t;qaScene.draw();const ctx=qaScene.actorLayer.getContext('2d'),im=ctx.getImageData(450,285,110,100),data=im.data;
   const active=new Uint8Array(110*100),seen=new Uint8Array(active.length),components=[];
   for(let i=0;i<active.length;i++)active[i]=data[i*4+3]>127?1:0;
   for(let i=0;i<active.length;i++)if(active[i]&&!seen[i]){let size=0,stack=[i];seen[i]=1;while(stack.length){const n=stack.pop();size++;const x=n%110,y=Math.floor(n/110);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy,j=Y*110+X;if(X>=0&&X<110&&Y>=0&&Y<100&&active[j]&&!seen[j]){seen[j]=1;stack.push(j);}}}components.push(size);}
   const c=document.createElement('canvas');c.width=110;c.height=100;c.getContext('2d').putImageData(im,0,0);
   const native=qaScene.pickupArt?.output,rgba=native?.getContext('2d').getImageData(0,0,500,500).data;
   const partial=rgba?Array.from({length:250000},(_,i)=>rgba[i*4+3]).filter(a=>a!==0&&a!==255).length:0;
   const base=qaScene.current.hookahBase,patch=ctx.getImageData(Math.floor(base[0])-4,Math.floor(base[1])-4,9,9).data;let gold=0;
   for(let i=0;i<patch.length;i+=4)if(patch[i+3]>127&&patch[i]>140&&patch[i+1]>80&&patch[i+2]<170)gold++;
   rows.push({t,base,goldPixelsAtBase:gold,components:components.sort((a,b)=>b-a),partialNativeAlpha:partial,png:c.toDataURL()});
  }
  return rows;
 });
 for(const row of rows){const {png,...values}=row;report.frames.push(values);await fs.writeFile(`${out}/${row.t}.png`,Buffer.from(png.split(',')[1],'base64'));assert.equal(row.partialNativeAlpha,0);assert.equal(row.components.length,1,'Complete connected body/hand/vessel at '+row.t);assert(row.goldPixelsAtBase>0,'Actual vessel must follow its measured base at '+row.t);}
 await context.close();assert.deepEqual(report.errors,[]);assert.deepEqual(report.resources,[]);report.passed=true;
}finally{await browser.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}
console.log(JSON.stringify(report.frames.map(r=>({t:r.t,components:r.components}))));
