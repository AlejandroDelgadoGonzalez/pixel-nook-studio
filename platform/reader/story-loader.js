import {compileStory} from './story-compiler.js';
import {canonicalSlug,resolveSavedPassage} from '../storage/compatibility.js';
import {storage} from '../storage/storage.js';
export async function readJSON(url){const response=await fetch(url);if(!response.ok)throw Error('Resource unavailable: '+url+' ('+response.status+')');return response.json();}
const catalog=await readJSON('/stories/catalog.json'),params=new URLSearchParams(location.search);
const selected=canonicalSlug(params.get('story')||catalog.default,catalog.aliases);
const entry=catalog.stories.find(s=>s.slug===selected);if(!entry)throw Error('Unknown story: '+selected);
export const manifest=await readJSON(entry.manifest);
let chapterId=params.get('chapter');
if(manifest.serialized&&!chapterId&&params.get('start')!=='1'){try{const point=JSON.parse(storage.getItem('entrelineas:'+manifest.id));chapterId=manifest.chapters.find(c=>c.status==='available'&&c.linePrefix&&point?.line?.startsWith(c.linePrefix))?.id;}catch{}}
const chapter=manifest.chapters.find(c=>c.id===chapterId&&c.status==='available')||manifest.chapters[0];
const chapterSource=await readJSON(chapter.source);
const environments=manifest.environments?await readJSON(manifest.environments):{};
const fileAudio=manifest.fileAudio?await readJSON(manifest.fileAudio):undefined;
const source={...chapterSource,fileAudio,chapters:manifest.serialized?manifest.chapters:undefined,seriesSlug:manifest.slug,environmentConfig:environments[chapterSource.renderer]};
export const story=compileStory(source);
export async function loadRenderer(){const spec=manifest.renderers[story.renderer];if(!spec)throw Error('Renderer is not registered: '+story.renderer);const module=await import(spec.module);if(typeof module[spec.export]!=='function')throw Error('Invalid renderer export');return module[spec.export];}
const localized=(value,lang)=>value&&typeof value==='object'?(value[lang]||value.en||value.es):value;
export function localizeStory(lang){for(const key of ['title','intro','ending','description','stageLabel'])story[key]=localized(source[key],lang);story.scenes.forEach((s,i)=>s.name=localized(source.scenes[i].name,lang));for(const[id,c]of Object.entries(story.characters||{})){c.name=localized(source.characters[id].name,lang);c.role=localized(source.characters[id].role,lang);}const originals=source.scenes.flatMap(s=>s.steps);story.steps.forEach((s,i)=>{if(s.type==='text')s.text=localized(originals[i].text,lang);});}
localizeStory('en');
