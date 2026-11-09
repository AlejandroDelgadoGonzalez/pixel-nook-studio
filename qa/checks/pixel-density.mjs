import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import assert from 'node:assert/strict';
import {root,output} from '../config.mjs';
const execute=promisify(execFile);

// Read-only density gate. Legacy artwork remains immutable; new measured stories
// must supply their own anatomical calibration/cells before runtime QA.
export async function check(cases){
 const rows=[];
 for(const [command,args]of [['check-directory',['--directory','concept_art']],['check-stories',[]]]){
  const relative=path.relative(root,path.join(output,`visual-${command}.json`));
  await execute(process.env.QA_PYTHON||'python',['qa/pixel_density.py',command,...args,'--output',relative],{cwd:root,maxBuffer:2*1024*1024});
  const report=JSON.parse(await fs.readFile(path.join(root,relative),'utf8'));
  assert(report.passed,`Visual canon gate failed: ${command}`);rows.push({gate:command,passed:true,evidence:relative});
 }
 for(const item of [...new Map(cases.map(c=>[c.slug,c])).values()]){
  const spec=`stories/${item.slug}/shared/pixel-density.json`,target=path.join(root,spec);
  try{await fs.access(target);}catch{
   assert(!item.manifest.stageGeometry||item.manifest.migratedGeometry,`New measured story lacks density specification: ${item.slug}`);
   rows.push({story:item.slug,status:'preserved-legacy',note:'No source art normalized or re-certified by this check'});continue;
  }
  const specification=JSON.parse(await fs.readFile(target,'utf8')),declared=new Set(specification.assets.map(a=>'/'+a.path));
  for(const chapter of cases.filter(c=>c.slug===item.slug))for(const url of Object.values(chapter.data.assets||{})){
   if(typeof url==='string'&&url.startsWith(`/stories/${item.slug}/assets/`)&&url.endsWith('.png'))assert(declared.has(url),`Active story art lacks density calibration: ${url}`);
  }
  const relative=path.relative(root,path.join(output,`${item.slug}-pixel-density.json`));
  await execute(process.env.QA_PYTHON||'python',['qa/pixel_density.py','check','--spec',spec,'--output',relative],{cwd:root,maxBuffer:2*1024*1024});
  const report=JSON.parse(await fs.readFile(path.join(root,relative),'utf8'));
  assert(report.passed,`Density check failed: ${item.slug}`);rows.push({story:item.slug,passed:true,assets:report.assets.length,evidence:relative});
 }
 return rows;
}
