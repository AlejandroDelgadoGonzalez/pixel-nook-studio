/* Future character sources stay local; existing legacy paths keep their meaning. */
import {relative,join} from 'node:path';
import {readdir} from 'node:fs/promises';
export function isPrivateCharacterSource(path){
  const p=path.replaceAll('\\','/').split('/');
  return p[0]==='stories'&&p[2]==='assets'&&p[3]==='characters'&&!!p[4]&&['maestros-precocidos','temporal'].includes(p[5]);
}
export const packageFilter=root=>source=>!isPrivateCharacterSource(relative(root,source));
export async function assertNoPrivateCharacterSources(output){
  async function walk(directory){
    for(const item of await readdir(directory,{withFileTypes:true})){
      const file=join(directory,item.name);
      if(isPrivateCharacterSource(relative(output,file)))throw new Error('Private character source left in dist: '+relative(output,file)+'. Rebuild in an empty generated output; no sources were deleted.');
      if(item.isDirectory())await walk(file);
    }
  }
  await walk(output);
}
