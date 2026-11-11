import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {launch, openCase} from './helpers/browser.mjs';
import {storyCases} from './helpers/story-cases.mjs';
const output = process.env.QA_OUTPUT_DIR || '.artifacts/qa/aspect-interactions';
await fs.mkdir(output, {recursive:true});
const browser = await launch(), report = {errors:[], resources:[], cases:[]};
try {
 const item = (await storyCases()).find(c => c.slug === 'alice-in-wonderland' && c.chapter.number === 1);
 for (const [width, height] of [[1280,720], [390,844]]) {
  const {page, context} = await openCase(browser, item, {width,height}, report);
  await page.evaluate(() => {
   const r = qaScene.reader, action = r.story.steps.find(s => s.type === 'action' && s.duration > 2500);
   r.start(action.id); r.paused = false; r.tick(1000); r.paused = true;
   // Keep the real render loop running while the reading clock is paused.
   qaScene.game.loop.start(qaScene.game.step.bind(qaScene.game));
  });
  const checkpoint = await page.evaluate(() => JSON.stringify({index:qaScene.reader.index, elapsed:qaScene.reader.elapsed, model:qaScene.reader.model, total:qaScene.reader.totalTime}));
  for (const mode of ['portrait','landscape','auto','portrait']) {
   await page.click('#show-controls'); await page.selectOption('#aspect-ratio',mode); await page.click('#close-settings');
   await page.waitForTimeout(120);
   if(mode!=='auto'){
    await page.setViewportSize({width:height,height:width}); await page.waitForTimeout(120);
    const ratio=await page.locator('#player').evaluate(node=>{const b=node.getBoundingClientRect();return b.width/b.height;});
    assert(Math.abs(ratio-(mode==='portrait'?9/16:16/9))<.0001,'Device rotation released the aspect lock');
    await page.setViewportSize({width,height}); await page.waitForTimeout(120);
   }
   assert.equal(await page.evaluate(() => JSON.stringify({index:qaScene.reader.index, elapsed:qaScene.reader.elapsed, model:qaScene.reader.model, total:qaScene.reader.totalTime})), checkpoint, 'Mid-action format change reset or advanced reading');
   const colors = await page.evaluate(() => {const c=qaScene.game.canvas, pixels=c.getContext('2d').getImageData(0,0,c.width,c.height).data, colors=new Set();for(let i=0;i<pixels.length;i+=4*101)colors.add((pixels[i]<<16)+(pixels[i+1]<<8)+pixels[i+2]);return colors.size;});
   assert(colors > 40, 'Hot resize left an empty canvas');
  }
  await page.click('#fullscreen'); await page.waitForFunction(() => document.fullscreenElement === document.documentElement);
  await page.evaluate(() => {
   const r=qaScene.reader; r.sceneGate=false; r.start(r.story.steps.findLast(s=>s.type==='text').id); r.paused=false;
   let guard=0; while(r.running && guard++<20){if(r.step.type==='action')r.tick(r.step.duration);else{r.revealed=r.step.text.length;r.advance(performance.now()+guard*1000);}}
  });
  await page.click('#next-chapter');
  const next = page.frameLocator('#chapter-reader');
  await next.locator('#start:not([disabled])').waitFor();
  assert.equal(await next.locator('#aspect-ratio').inputValue(), 'portrait');
  assert(await page.evaluate(() => !!document.fullscreenElement), 'Chapter change exited fullscreen');
  await next.locator('#show-controls').click(); await next.locator('#aspect-ratio').selectOption('auto'); await next.locator('#close-settings').click();
  assert.equal(await next.locator('body').getAttribute('data-aspect-ratio'), 'auto');
  await page.evaluate(() => document.exitFullscreen());
  report.cases.push({width,height,midActionPreserved:true,hotCanvasRendered:true,fullscreenChapterHandoff:true,preferenceInherited:true});
  await context.close(); console.log('PASS aspect interactions',width);
 }
 assert.deepEqual(report.errors,[]); assert.deepEqual(report.resources,[]); report.passed=true;
}catch(error){report.passed=false;report.failure=error.stack;process.exitCode=1;console.error(error);
}finally{await browser.close();await fs.writeFile(output+'/report.json',JSON.stringify(report,null,2));}
