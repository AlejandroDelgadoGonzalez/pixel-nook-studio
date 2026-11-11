import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {launch, openCase, preparePassage} from './helpers/browser.mjs';
import {storyCases} from './helpers/story-cases.mjs';
import {snapshot as viewportSnapshot} from './checks/viewport-coverage.mjs';

const output = process.env.QA_OUTPUT_DIR || '.artifacts/qa/aspect-ratio';
await fs.mkdir(output, {recursive: true});
const report = {scope:'Frame, UI, persistence and reading state for all stories; full artwork/actor audit for stories with measured stage geometry. Preserved legacy staging uses qa/run.mjs.', errors: [], resources: [], cases: []}, browser = await launch();
try {
 const cases = (await storyCases()).filter(item => !process.argv.includes('--other-stories') || item.slug !== 'alice-in-wonderland');
 for (const item of cases) for (const [width, height] of [[1280, 720], [1920, 1080], [390, 844]]) {
  const {page, context} = await openCase(browser, item, {width, height}, report);
  const texts = item.story.steps.filter(step => step.type === 'text');
  await preparePassage(page, texts[0].id);
  const original = await page.locator('#dialogue').boundingBox();
  const rows = [];
  for (const mode of ['auto', 'portrait', 'landscape', 'auto']) {
   await page.click('#show-controls');
   const before = await page.evaluate(() => {const r = qaScene.reader; return JSON.stringify({model:r.model, elapsed:r.elapsed, total:r.totalTime, index:r.index, shown:r.revealed, history:r.history, paused:r.paused, auto:r.auto});});
   await page.selectOption('#aspect-ratio', mode);
   await page.waitForTimeout(100);
   assert.equal(await page.evaluate(() => {const r = qaScene.reader; return JSON.stringify({model:r.model, elapsed:r.elapsed, total:r.totalTime, index:r.index, shown:r.revealed, history:r.history, paused:r.paused, auto:r.auto});}), before, 'Format change altered reading');
   await page.click('#close-settings');
   const chosen = item.slug === 'alice-in-wonderland' ? texts : [texts[0], texts[Math.floor(texts.length / 2)], texts.at(-1)];
   const checks = [];
   for (const step of chosen) {
    await preparePassage(page, step.id);
    const bounds = await page.evaluate(mode => {
     const rect = node => {const r = node.getBoundingClientRect(); return {left:r.left, top:r.top, right:r.right, bottom:r.bottom, width:r.width, height:r.height};};
     const frame = rect(document.querySelector('#player')), canvas = rect(qaScene.game.canvas), issues = [];
     if(['left','top','right','bottom'].some(key=>Math.abs(frame[key]-canvas[key])>.6))issues.push({error:'Canvas does not fill active frame',frame,canvas});
     for (const selector of ['#dialogue', '.library-return', '#top-mute', '#quick-pause', '#fullscreen', '#show-controls', '#cue', '#text']) {
      const element = document.querySelector(selector), b = rect(element);
      if (getComputedStyle(element).display !== 'none' && (b.left < frame.left - .6 || b.top < frame.top - .6 || b.right > frame.right + .6 || b.bottom > frame.bottom + .6)) issues.push({selector, error:'UI outside frame', b, frame});
     }
     const text = rect(document.querySelector('#text')), cue = rect(document.querySelector('#cue')), panel = rect(document.querySelector('#dialogue'));
     if (text.bottom > panel.bottom + .5 || cue.bottom > panel.bottom + .5) issues.push({error:'Caption overflow', text, cue, panel});
     if (mode !== 'auto') {
      const ratio = mode === 'portrait' ? 9/16 : 16/9;
      if (Math.abs(frame.width/frame.height - ratio) > .0001 || Math.abs(qaScene.scale.width/qaScene.scale.height - ratio) > .0001) issues.push({error:'Wrong aspect', frame});
      if (Math.abs(frame.left + frame.width/2 - innerWidth/2) > .6 || Math.abs(frame.top + frame.height/2 - innerHeight/2) > .6) issues.push({error:'Frame not centered', frame});
      if (Math.abs(canvas.width/qaScene.scale.width - canvas.height/qaScene.scale.height) > .0001) issues.push({error:'Nonuniform canvas scale'});
      if (getComputedStyle(qaScene.game.canvas).imageRendering !== 'pixelated') issues.push({error:'Pixel rendering changed'});
     }
     return {frame, canvas, issues};
    }, mode);
    assert.deepEqual(bounds.issues, [], `${item.slug}/${item.chapter.id}/${step.id}/${mode}/${width}`);
    const coverage = await viewportSnapshot(page);
    // Match the reusable suite's measured-geometry boundary. Legacy renderers
    // retain their approved camera/bitmap contracts; their new frame and UI
    // are checked above, and their staging regression runs in qa/run.mjs.
    if(item.manifest.stageGeometry)assert.deepEqual(coverage.issues, [], `${item.slug}/${step.id}/${mode}/${width}`);
    checks.push({id:step.id, frame:bounds.frame, camera:coverage.camera});
   }
   if (item.slug === 'alice-in-wonderland' && item.chapter.number === 2) await page.screenshot({path:`${output}/${width}-${mode}.png`});
   rows.push({mode, checks});
  }
  await preparePassage(page, texts[0].id);
  assert.deepEqual(await page.locator('#dialogue').boundingBox(), original, 'Auto did not restore the original caption');
  await page.click('#show-controls'); await page.selectOption('#aspect-ratio', 'portrait'); await page.click('#close-settings');
  await page.reload(); await page.waitForFunction(() => window.reader && !document.querySelector('#start').disabled);
  assert.equal(await page.locator('#aspect-ratio').inputValue(), 'portrait', 'Aspect preference lost on reload');
  assert.equal(await page.evaluate(() => document.body.dataset.aspectRatio), 'portrait');
  report.cases.push({story:item.slug, chapter:item.chapter.id, width, height, rows, persisted:true});
  await context.close();
  console.log('PASS aspect ratio', item.slug, item.chapter.id, width);
 }
 assert.deepEqual(report.errors, []); assert.deepEqual(report.resources, []); report.passed = true;
} catch (error) {report.passed = false; report.failure = error.stack; process.exitCode = 1; console.error(error);
} finally {await browser.close(); await fs.writeFile(output + '/report.json', JSON.stringify(report, null, 2));}
