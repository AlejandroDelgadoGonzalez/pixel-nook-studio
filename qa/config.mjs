import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
export const base=process.env.QA_BASE_URL||'http://localhost:4175';
export const output=process.env.QA_OUTPUT_DIR?path.resolve(root,process.env.QA_OUTPUT_DIR):path.join(root,'.artifacts/qa');
if(!output.startsWith(path.join(root,'.artifacts')+path.sep))throw Error('QA output must stay under .artifacts/');
export {officialLayouts as layouts} from './official-layouts.mjs';
export const channel=process.env.QA_BROWSER_CHANNEL||'msedge';
