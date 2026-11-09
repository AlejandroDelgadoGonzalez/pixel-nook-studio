import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir='.artifacts/qa/alice-in-wonderland/camera-trial',read=async p=>JSON.parse(await fs.readFile(dir+'/'+p+'.json')),all=await read('all'),late=await read('late'),original=await read('original');
assert(all.passed&&late.passed&&original.passed&&original.originalPixelIdentical);
const joins=[],rules=[];let maximumBoundaryDelta=0;
for(const row of all.layouts){
 const [c1,c2]=row.chapters,find=(c,id)=>c.frames.find(x=>x.id===id),same=(a,b,label)=>{const delta=Math.max(...['x','y','z'].map(k=>Math.abs(a[k]-b[k])));assert(delta<1e-6,label);joins.push({layout:[row.width,row.height],label,delta});};
 same(find(c1,'alice-c1-drink-hook-hold').frame,find(c1,'alice-c1-eat-label').frame,'S4→S5 close');
 same(find(c1,'alice-c1-eat-key').frame,find(c1,'alice-c1-pool-help').frame,'S5→S6 general');
 same(find(c1,'alice-c1-pool-hook-swim').frame,find(c2,'alice-c2-way-out-question').frame,'S6→C2-S1 close');
 for(const c of row.chapters){for(let i=1;i<c.moments.length;i++){const a=c.moments[i-1],b=c.moments[i];if(a.id===b.id)continue;const delta=Math.max(...['x','y','z'].map(k=>Math.abs(a.frame[k]-b.frame[k])));maximumBoundaryDelta=Math.max(maximumBoundaryDelta,delta);assert(delta<.001,JSON.stringify({a:a.id,b:b.id,delta}));}assert(c.texts.every(t=>t.maxRootShift<=2));}
 const f=id=>find(c1,id).frame;assert.equal(f('alice-c1-drink-shrink').z,f('alice-c1-pool-help').z);assert(Math.abs(f('alice-c1-drink-fit').z/f('alice-c1-drink-shrink').z-1.6)<1e-10);assert.equal(find(c2,'alice-c2-way-out-company').frame.z,find(c2,'alice-c2-way-out-question').frame.z);
 rules.push({layout:[row.width,row.height],wideUntilShrink:true,zoomFactor:1.6,growthReturnsExactlyWide:true,poolAndDoorZoomConstant:true});
}
const all390=all.layouts.find(l=>l.width===390).chapters;for(const [n,c]of late.layouts[0].chapters.entries())for(const f of c.frames){const expected=(n===0&&!f.id.startsWith('alice-c1-pool-')?original.layouts[0].chapters:all390)[n].frames.find(x=>x.id===f.id);assert.equal(f.hash,expected.hash,'Partial preset '+f.id);}
const report={passed:true,joins,rules,maximumBoundaryDeltaWorld:maximumBoundaryDelta,modesVerified:['all','late','original'],originalPixelIdentical:true,latePresetMatchesOriginalS4S5:true,latePresetMatchesAllS6AndC2:true};await fs.writeFile(dir+'/camera-contract.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:true,joins:joins.length,maximumBoundaryDelta,modesVerified:report.modesVerified}));
