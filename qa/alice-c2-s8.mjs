import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {storyCases} from './helpers/story-cases.mjs';
import {launch, openCase, preparePassage} from './helpers/browser.mjs';
import {officialLayouts} from './official-layouts.mjs';

const output = process.env.QA_OUTPUT_DIR || '.artifacts/qa/alice-c2-s8';
await fs.mkdir(output, {recursive: true});
const report = {errors: [], resources: [], layouts: []};
const browser = await launch();

try {
 const item = (await storyCases()).find(value => value.slug === 'alice-in-wonderland' && value.chapter.number === 2);
 const layouts = process.argv.includes('--live') ? [{name: 'live-phone', width: 390, height: 844}] : officialLayouts;
 for (const layout of layouts) {
  const {page, context} = await openCase(browser, item, layout, report);
  if (process.argv.includes('--live')) {
   await page.evaluate(() => {
    const scene = qaScene, reader = scene.reader;
    reader.sceneGate = false;
    reader.setAuto(true);
    reader.start('alice-c2-cake-20');
    reader.onChange('back');
    reader.paused = false;
    scene.game.loop.start(scene.game.step.bind(scene.game));
   });
   const visits = [];
   let last = '', finished = false;
   for (let sample = 0; sample < 1000; sample++) {
    await page.waitForTimeout(100);
    const state = await page.evaluate(() => ({id: qaScene.reader.step.id, type: qaScene.reader.step.type, scene: qaScene.reader.step.sceneIndex, ending: !document.querySelector('#ending').hidden, clear: document.querySelector('#dialogue').hasAttribute('data-caption-clear')}));
    if (state.id !== last) {
     visits.push(state);
     last = state.id;
     console.log('1x', state.id);
    }
    if (state.type === 'action') assert(state.clear, 'Moving action must keep the caption closed');
    if (state.ending) {
     assert.equal(state.id, 'alice-c2-puppy-end');
     finished = true;
     break;
    }
   }
   assert(finished, 'Normal-speed S7 to S8 reading did not complete');
   assert(visits.some(value => value.id === 'alice-c2-puppy-01' && !value.ending));
   report.live = {finished, visits, normalSpeed: true};
  } else {
   const result = await page.evaluate(() => {
    const scene = qaScene, engine = scene.reader, rows = [];
    const steps = engine.story.steps.filter(step => step.puppyMoment && step.type !== 'end');
    for (const step of steps) {
     const duration = step.duration || step.readingDurationMs;
     const frames = new Set();
     let previousPuppyX = -Infinity, previousTwigX = -Infinity;
     for (let elapsed = 0; elapsed < duration; elapsed += 50) {
      engine.start(step.id);
      engine.paused = false;
      if (elapsed) engine.tick(elapsed);
      engine.paused = true;
      scene.draw(0, true);
      scene.game.step(performance.now(), 0);
      const state = scene.puppyStage.current;
      if (step.type === 'action' && engine.advance(elapsed + 1000)) throw Error('Mid-action tap advanced ' + step.id);
      if (state.moment === 11) {
       if (state.puppy.x < previousPuppyX) throw Error('Puppy reversed during fetch');
       previousPuppyX = state.puppy.x;
       frames.add(state.puppyPose);
      }
      if (state.moment === 10) {
       if (state.twig.position[0] < previousTwigX) throw Error('Twig reversed horizontally');
       previousTwigX = state.twig.position[0];
      }
      if (state.moment === 8 && state.progress >= .2 && state.alice.x !== 1106) throw Error('Pickup moved its grounded root');
      const before = JSON.stringify(engine.model), clock = engine.totalTime;
      engine.tick(50);
      if (before !== JSON.stringify(engine.model) || clock !== engine.totalTime) throw Error('Pause advanced the story');
     }
     rows.push({id: step.id, sampledEveryMs: 50, walkFrames: [...frames]});
    }
    const completion = [];
    for (const auto of [false, true]) {
     engine.sceneGate = false;
     engine.setAuto(auto);
     engine.start('alice-c2-cake-20');
     engine.onChange('back');
     engine.paused = false;
     let guard = 0, crossed = false;
     while (engine.running) {
      if (++guard > 100) throw Error('Continuity loop');
      const step = engine.step;
      if (!document.querySelector('#ending').hidden) throw Error('Premature chapter completion');
      if (step.type === 'action') engine.tick(step.duration);
      else if (auto) engine.tick(step.readingDurationMs || 100000);
      else {engine.revealed = step.text.length; engine.advance(guard * 1000);}
      scene.draw(0, true);
      scene.game.step(performance.now(), 0);
      crossed ||= engine.step.id === 'alice-c2-puppy-01';
     }
     completion.push({auto, crossed, id: engine.step.id, chapterFinished: localStorage.getItem('betweenlines:chapter-finished:' + engine.story.id + ':chapter-2')});
    }
    return {rows, completion};
   });
   assert.equal(result.rows.find(row => row.id === 'alice-c2-puppy-11').walkFrames.length, 4);
   for (const completion of result.completion) {
    assert(completion.crossed);
    assert.equal(completion.id, 'alice-c2-puppy-end');
    assert.equal(completion.chapterFinished, 'true');
   }
   report.layouts.push({name: layout.name, ...result});
   await preparePassage(page, 'alice-c2-puppy-15');
   await page.screenshot({path: output + '/' + layout.name + '-mushroom.png'});
   console.log('PASS S8 staging', layout.name);
  }
  await context.close();
 }
 assert.deepEqual(report.errors, []);
 assert.deepEqual(report.resources, []);
 report.passed = true;
} catch (error) {
 report.passed = false;
 report.failure = error.stack;
 process.exitCode = 1;
 console.error(error);
} finally {
 await browser.close();
 await fs.writeFile(output + '/report.json', JSON.stringify(report, null, 2));
}
