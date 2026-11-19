import {cp, mkdir, readdir, readFile, writeFile} from 'node:fs/promises';
import {resolve, join, extname} from 'node:path';
import {packageFilter,assertNoPrivateCharacterSources} from './pixel-kitchen/packaging.mjs';

// Source remains identical for localhost. Deployment URLs are scoped to its mount.
const root = resolve(import.meta.dirname, '..');
const output = join(root, 'dist');
const base = process.env.BASE_PATH || '/';
if (!/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(base)) throw Error('BASE_PATH must be / or /project/');
await mkdir(output, {recursive: true});
for (const dir of ['app', 'platform', 'stories', 'vendor']) {
  await cp(join(root, dir), join(output, dir), {recursive: true, filter: packageFilter(root)});
}
await cp(join(root,'concept_art/mannequins/human'), join(output,'concept_art/mannequins/human'), {recursive:true});
await cp(join(root,'concept_art/mannequins/candidates'), join(output,'concept_art/mannequins/candidates'), {recursive:true});
// Fail closed if an earlier generated dist already contains excluded sources.
await assertNoPrivateCharacterSources(output);
const textTypes = new Set(['.html', '.js', '.mjs', '.json', '.css']);
async function scope(directory) {
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) await scope(file);
    else if (textTypes.has(extname(file))) {
      const text = await readFile(file, 'utf8');
      const scoped = text.replace(/(["'`(=])\/(app\/|platform\/|stories\/|vendor\/|reader\.html|index\.html)/g, (_, before, path) => before + base + path);
      if (scoped !== text) await writeFile(file, scoped, 'utf8');
    }
  }
}
await scope(output);
for (const file of ['index.html', 'reader.html']) await cp(join(output, 'app', file), join(output, file));
await writeFile(join(output, '.nojekyll'), '', 'utf8');
console.log(`Built dist for ${base}`);
