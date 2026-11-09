import fs from 'node:fs/promises';
import path from 'node:path';
import {root} from '../config.mjs';
import {compileStory} from '../../platform/reader/story-compiler.js';
export async function readJSON(url){return JSON.parse(await fs.readFile(path.join(root,url.replace(/^\//,'')),'utf8'));}
export function english(data){const s=compileStory(data);for(const step of s.steps)if(step.type==='text'&&typeof step.text==='object')step.text=step.text.en;return s;}
export async function storyCases(){const catalog=await readJSON('/stories/catalog.json'),filter=process.argv.find(v=>v.startsWith('--story='))?.split('=')[1],cases=[];for(const entry of catalog.stories){if(filter&&entry.slug!==filter)continue;const manifest=await readJSON(entry.manifest),env=manifest.environments?await readJSON(manifest.environments):{};for(const chapter of manifest.chapters){if(chapter.status!=='available')continue;const data=await readJSON(chapter.source);cases.push({slug:entry.slug,manifest,chapter,data,story:english({...data,chapters:manifest.serialized?manifest.chapters:undefined,seriesSlug:entry.slug,environmentConfig:env[data.renderer]})});}}if(!cases.length)throw Error('No matching story cases');return cases;}
