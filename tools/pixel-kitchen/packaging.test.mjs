import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,cp,access} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {isPrivateCharacterSource,packageFilter,assertNoPrivateCharacterSources} from './packaging.mjs';
test('only the future character source subtrees are private',()=>{
  for(const dir of ['temporal','maestros-precocidos']){
    assert.equal(isPrivateCharacterSource(`stories/test/assets/characters/alice/${dir}/front.png`),true);
    assert.equal(isPrivateCharacterSource(`stories/test/assets/characters/alice/${dir}`),true);
  }
  for(const p of ['stories/test/assets/characters/alice/front.png','stories/test/assets/atlases/characters/temporal/legacy.png','stories/test/assets/temporal/legacy.png'])assert.equal(isPrivateCharacterSource(p),false);
});
test('actual packaging keeps runtime PNG and excludes both private folders',async()=>{
  const artifacts=resolve('.artifacts');await mkdir(artifacts,{recursive:true});const root=await mkdtemp(join(artifacts,'pixel-kitchen-packaging-'));
  const source=join(root,'source'),out=join(root,'dist'),character='stories/synthetic-test/assets/characters/test';
  for(const name of ['front.png','temporal/work.png','maestros-precocidos/front.png']){
    const file=join(source,character,name);await mkdir(resolve(file,'..'),{recursive:true});await writeFile(file,'SYNTHETIC PACKAGING FIXTURE; NOT ART');
  }
  await cp(source,out,{recursive:true,filter:packageFilter(source)});await access(join(out,character,'front.png'));
  for(const dir of ['temporal','maestros-precocidos'])await assert.rejects(access(join(out,character,dir)));
  await assertNoPrivateCharacterSources(out);
  const stale=join(out,character,'temporal');await mkdir(stale);
  await assert.rejects(assertNoPrivateCharacterSources(out),/Private character source/);
});
