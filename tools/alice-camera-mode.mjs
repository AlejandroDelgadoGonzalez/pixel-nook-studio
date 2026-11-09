import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),configFile=path.join(root,'stories/alice-in-wonderland/shared/camera-trial.json'),config=JSON.parse(await fs.readFile(configFile)),mode=process.argv.find(a=>a.startsWith('--mode='))?.slice(7);
if(process.argv.includes('--restore-files')){
 const backup=path.resolve(root,config.backup),expected=path.join(root,'.artifacts','alice-in-wonderland','camera-trial')+path.sep;
 if(!backup.startsWith(expected))throw Error('Backup must remain inside this project camera-trial directory');
 const rows=JSON.parse((await fs.readFile(path.join(backup,'approved-manifest.json'),'utf8')).replace(/^\uFEFF/,''));
 for(const relative of ['stories/alice-in-wonderland/renderers/riverbank.js','stories/alice-in-wonderland/renderers/strange-company.js']){const source=path.join(backup,'approved',relative),record=rows.find(r=>r.path===relative),hash=crypto.createHash('sha256').update(await fs.readFile(source)).digest('hex');if(hash!==record?.sha256)throw Error('Backup integrity check failed: '+relative);await fs.copyFile(source,path.join(root,relative));}
 console.log('Approved renderer files restored byte for byte. Reload localhost. Detail sources and backup remain available.');
}else{
 if(!['all','late','original'].includes(mode))throw Error('Use --mode=all, --mode=late, --mode=original, or --restore-files');
 config.defaultModes=Object.fromEntries(Object.keys(config.defaultModes).map(id=>[id,mode==='all'||mode==='late'&&['c1-s6','c2-s1'].includes(id)]));config.revision='camera-'+Date.now();await fs.writeFile(configFile,JSON.stringify(config,null,2)+'\n');console.log('Camera preset: '+mode+'. Reload localhost; progress unchanged.');
}
