import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
export async function sourceFiles(cases){
 const paths=new Set(['stories/catalog.json']);
 async function collect(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory()){if(!['assets','node_modules'].includes(e.name))await collect(p);}else if(/\.(json|js|mjs)$/.test(e.name))paths.add(p);}}
 for(const slug of new Set(cases.map(c=>c.slug)))await collect('stories/'+slug);
 await collect('platform');const issues=[];
 for(const p of paths){const bytes=await fs.readFile(p);let text;try{text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch{issues.push({path:p,kind:'invalid-utf8'});continue;}if(bytes[0]===239&&bytes[1]===187&&bytes[2]===191)issues.push({path:p,kind:'utf8-bom'});if(/[\u00c3\u00c2]/.test(text))issues.push({path:p,kind:'mojibake'});}
 assert.deepEqual(issues,[],'Source text must be clean UTF-8 without BOM');return{files:paths.size,passed:true};
}
export async function assertCleanDOM(page){const matches=await page.evaluate(()=>[...(window.qaCorruptDOM||[]),...(document.body.innerText.match(/\b(?:undefined|NaN)\b|[\u00c3\u00c2]/g)||[])]);assert.deepEqual(matches,[],'Rendered DOM contains missing values or corrupt UTF-8');}
