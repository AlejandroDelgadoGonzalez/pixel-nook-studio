export const legacySlugs={'el-primer-camino':'the-first-path'};
export function canonicalSlug(slug,aliases=legacySlugs){return aliases[slug]||slug;}
export function resolveSavedPassage(story,line){const seen=new Set();while(story.savedPassageAliases?.[line]){if(seen.has(line))throw Error('Cyclic saved-passage alias');seen.add(line);line=story.savedPassageAliases[line];}return line;}
export function savedSlugs(values){return [...new Set(values.map(value=>canonicalSlug(value)))];}
