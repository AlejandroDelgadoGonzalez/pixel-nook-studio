import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {launch,openCase} from './helpers/browser.mjs';
import {storyCases} from './helpers/story-cases.mjs';
import {officialLayouts} from './official-layouts.mjs';
const out='.artifacts/qa/c3-s1/caption-ready';await fs.mkdir(out,{recursive:true});
const browser=await launch(),report={errors:[],resources:[],cases:[]};
try{const item=(await storyCases()).find(c=>c.slug==='alice-in-wonderland'&&c.chapter.number===3);
 for(const layout of officialLayouts){const {page,context}=await openCase(browser,item,layout,report);
 const rows=await page.evaluate(()=>{const rows=[],e=qaScene.reader;
 for(const step of e.story.steps.filter(s=>s.type!=='end'))for(const t of step.c3Beat===2?[0,250,1200,4800,5999,6000,6500,8999]:[0,100,Math.min(2500,(step.duration||step.readingDurationMs)-1)]){
  e.start(step.id);e.paused=false;e.tick(t);e.paused=true;e.onChange('back');qaScene.draw();qaScene.game.step(performance.now(),0);
  const box=document.querySelector('#dialogue'),css=getComputedStyle(box),visible=Number(css.opacity)>0;
  const expected=step.type==='text'&&t>=(step.captionStartMs||0)&&e.revealed>=step.text.length;
  if(visible!==expected)throw Error(step.id+' caption at '+t);
  if(visible&&(css.opacity!=='1'||document.querySelectorAll('#text .is-revealed').length!==Array.from(step.text).length))throw Error('Incomplete caption');
  if(visible&&(document.querySelector('#text-button').disabled||getComputedStyle(document.querySelector('#text-button')).opacity!=='1'))throw Error('Grey/loading caption button');
  if(step.c3Beat===2&&t>=6000&&!qaScene.current.seated)throw Error('Caption before seat');
  if(css.transitionDuration!=='0s')throw Error('Caption fades');
  rows.push({id:step.id,t,visible,opacity:css.opacity,panelHeight:box.getBoundingClientRect().height});
 }
 return rows;});
 assert.equal(new Set(rows.map(r=>r.panelHeight)).size,1,'Visibility must preserve the measured panel reserve');
 await page.evaluate(()=>{const e=qaScene.reader;e.start('alice-c3-who-02');e.tick(6200);e.paused=true;e.onChange('back');qaScene.draw();qaScene.game.step(performance.now(),0);});
 await page.screenshot({path:out+'/'+layout.name+'.png'});report.cases.push({layout,rows});await context.close();console.log('PASS complete captions',layout.name);
 }assert.deepEqual(report.errors,[]);assert.deepEqual(report.resources,[]);report.passed=true;
}finally{await browser.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}
