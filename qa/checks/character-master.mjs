import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {root,output} from '../config.mjs';
const grandfatheredStories=new Set(['the-odyssey','the-second-cup','the-first-path']);
export async function check(cases){
 const result=[];
 for(const c of [...new Map(cases.map(c=>[c.slug,c])).values()]){
  const file=path.join(root,'stories',c.slug,'shared/character-masters.json');let registry;
  try{registry=JSON.parse(await fs.readFile(file,'utf8'));}catch(error){
   if(error.code!=='ENOENT')throw error;
   if(!grandfatheredStories.has(c.slug))throw Error('New story requires character-masters.json before first appearance: '+c.slug);
   result.push({story:c.slug,status:'legacy preserved; master required for next new character'});continue;
  }
  const known=new Set([...Object.keys(registry.characters),...(registry.grandfatheredActorIds||[])]);
  for(const item of cases.filter(x=>x.slug===c.slug))for(const id of Object.keys(item.data.characters||{}))if(!known.has(id))throw Error('New character requires first-appearance master: '+c.slug+'/'+id);
  const evidence=path.relative(root,path.join(output,c.slug+'-character-masters.json'));
  await promisify(execFile)(process.env.QA_PYTHON||'python',['qa/character_master.py','--story',c.slug,'--output',evidence],{cwd:root,maxBuffer:2e6});
  result.push({story:c.slug,...JSON.parse(await fs.readFile(path.join(root,evidence),'utf8'))});
 }
 return result;
}
