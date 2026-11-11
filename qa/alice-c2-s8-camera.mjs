import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {storyCases} from './helpers/story-cases.mjs';
import {launch, openCase, preparePassage} from './helpers/browser.mjs';
import {officialLayouts} from './official-layouts.mjs';

const output = process.env.QA_OUTPUT_DIR || '.artifacts/qa/alice-c2-s8-camera';
await fs.mkdir(output, {recursive: true});
const report = {errors: [], resources: [], layouts: []};
const browser = await launch();
try {
 const item = (await storyCases()).find(value => value.slug === 'alice-in-wonderland' && value.chapter.number === 2);
 const layouts = [...officialLayouts, {name: 'desktop-1080', width: 1920, height: 1080},
  {name: 'landscape-360', width: 800, height: 360}, {name: 'landscape-390', width: 844, height: 390}, {name: 'landscape-430', width: 932, height: 430}];
 for (const layout of layouts) {
  const {page, context} = await openCase(browser, item, layout, report);
  await preparePassage(page, 'alice-c2-cake-20');
  const originalInset = await page.locator('#dialogue').evaluate(node => node.style.bottom);
  const originalPanel = await page.locator('#dialogue').evaluate(node => {const r = node.getBoundingClientRect(); return {x:r.x, y:r.y, width:r.width, height:r.height};});
  await preparePassage(page, 'alice-c2-puppy-03');
  const result = await page.evaluate(() => {
   const scene = qaScene, reader = scene.reader, stage = scene.puppyStage;
   const portrait = scene.scale.width < scene.scale.height;
   const rows = [], issues = [], steps = reader.story.steps.filter(step => step.puppyMoment && step.type !== 'end');
   const project = (x, y) => ({x: (x - scene.framing.x) * scene.framing.z + scene.scale.width / 2, y: (y - scene.framing.y) * scene.framing.z + scene.scale.height / 2});
   const render = (step, elapsed) => {
    reader.start(step.id); reader.paused = true; reader.elapsed = elapsed;
    reader.revealed = reader.step.text?.length || 0; reader.onChange('back');
    scene.draw(0, true); scene.game.step(performance.now(), 0);
    return {...scene.framing};
   };
   let previous;
   for (const step of steps) {
    const duration = step.duration || 0;
    const samples = step.type === 'action' ? [...Array(Math.ceil(duration / 50)).keys()].map(i => i * 50).concat(duration) : [0];
    for (const elapsed of samples) {
     const frame = render(step, elapsed), moment = step.puppyMoment;
     const diagnostics = stage.diagnostics(), view = diagnostics.cameraCoverage.worldView;
     if (view.left < -.01 || view.top < -.01 || view.right > 1664.01 || view.bottom > 936.01) issues.push({moment, elapsed, error: 'Exposed artwork edge', view});
     if (previous && moment > 1 && elapsed === 0 && Math.hypot(previous.x - frame.x, previous.y - frame.y) > .01) issues.push({moment, error: 'Camera cut between beats', previous, frame});
     previous = frame;
     if (step.type !== 'text') continue;
     const canvas = scene.game.canvas.getBoundingClientRect(), panel = document.querySelector('#dialogue').getBoundingClientRect();
     const panelTop = (panel.top - canvas.top) * scene.scale.height / canvas.height;
     const alice = diagnostics.actors.alice;
     if (alice.bounds.bottom > panelTop - 2) issues.push({moment, error: 'Alice behind caption', alice, panelTop});
     if (!portrait) {
      const focus = project(moment <= 9 ? 1030 : moment === 13 ? 836 : 512, moment < 15 ? 638 : 646);
      if (focus.x < scene.scale.width / 3 || focus.x > scene.scale.width * 2 / 3) issues.push({moment, error: 'Focal subject outside central third', focus});
      if (moment <= 9 && !(view.left >= 620 - .01 && view.top >= 445)) issues.push({moment, error: 'Mushroom intrusion during encounter', view});
     }
     if (moment >= 15) {
      const crown = {left: project(326, 290).x, right: project(666, 290).x, top: project(490, 290).y, bottom: project(490, 470).y};
      const library = document.querySelector('.library-return').getBoundingClientRect();
      const libraryBox = {left: (library.left - canvas.left) * scene.scale.width / canvas.width, right: (library.right - canvas.left) * scene.scale.width / canvas.width, top: (library.top - canvas.top) * scene.scale.height / canvas.height, bottom: (library.bottom - canvas.top) * scene.scale.height / canvas.height};
      const overlaps = crown.left < libraryBox.right && crown.right > libraryBox.left && crown.top < libraryBox.bottom && crown.bottom > libraryBox.top;
      if (crown.left < 0 || crown.right > scene.scale.width || crown.top < 3.99 || crown.bottom > panelTop || overlaps) issues.push({moment, error: 'Crown clipped or covered', crown, libraryBox, panelTop});
      if (diagnostics.actors.puppy.bounds.left < scene.scale.width) issues.push({moment, error: 'Puppy remains in final shot', puppy: diagnostics.actors.puppy});
     }
     rows.push({moment, frame, view, alice, panelTop});
    }
   }
   return {issues, rows, portrait};
  });
  await fs.writeFile(`${output}/${layout.name}.json`, JSON.stringify(result, null, 2));
  assert.deepEqual(result.issues, [], layout.name);
  for (const moment of [3, 15]) {
   await preparePassage(page, 'alice-c2-puppy-' + String(moment).padStart(2, '0'));
   assert.deepEqual(await page.locator('#dialogue').evaluate(node => {const r = node.getBoundingClientRect(); return {x:r.x, y:r.y, width:r.width, height:r.height};}), originalPanel, 'S8 moved the standard caption');
   await page.screenshot({path: `${output}/${layout.name}-${moment}.png`});
  }
  await preparePassage(page, 'alice-c2-cake-20');
  assert.equal(await page.locator('#dialogue').evaluate(node => node.style.bottom), originalInset, 'S8 caption inset leaked into S7');
  report.layouts.push({name: layout.name, ...result});
  await context.close();
  console.log('PASS S8 camera', layout.name);
 }
 assert.deepEqual(report.errors, []);
 assert.deepEqual(report.resources, []);
 report.passed = true;
} catch (error) {
 report.passed = false; report.failure = error.stack; process.exitCode = 1; console.error(error);
} finally {
 await browser.close();
 await fs.writeFile(output + '/report.json', JSON.stringify(report, null, 2));
}
