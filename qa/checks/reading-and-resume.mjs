import {assertCleanDOM} from './text-integrity.mjs';
import assert from 'node:assert/strict';
import {base} from '../config.mjs';
import {watch} from '../helpers/browser.mjs';
import {readJSON} from '../helpers/story-cases.mjs';

export async function library(browser,report) {
  const context=await browser.newContext({viewport:{width:390,height:844}});
  const page=await context.newPage();watch(page,report);
  try {
    await page.goto(base+'/#home');
    await page.waitForSelector('[data-save="the-first-path"]');
    await assertCleanDOM(page);await page.goto(base+'/#/story/alice-in-wonderland');await page.waitForSelector('.series-hero');await assertCleanDOM(page);await page.goto(base+'/#home');await page.waitForSelector('[data-save="the-first-path"]');
    const expectedStories=(await readJSON('/stories/catalog.json')).stories.length;
    assert.equal(await page.locator('[data-save]').count(),expectedStories);
    await page.click('[data-save="the-first-path"]');
    await page.goto(base+'/#saved');
    await page.waitForSelector('[data-save="the-first-path"][aria-pressed="true"]');
    await page.reload();
    await page.waitForSelector('[data-save="the-first-path"][aria-pressed="true"]');
    await page.goto(base+'/#search');
    await page.fill('#search-input','Odyssey');
    await page.waitForSelector('#search-results [data-save="the-odyssey"]');
    assert.equal(await page.locator('#search-results [data-save]').count(),1);
    await page.fill('#search-input','no-matching-story-qa');
    assert.equal(await page.locator('#search-results [data-save]').count(),0);
    await page.goto(base+'/#settings');
    await page.click('#theme-toggle');
    assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
    await page.click('#auto-toggle');
    await page.reload();
    await page.waitForSelector('#auto-toggle[aria-checked="true"]');
    await page.goto(base+'/#story/the-odyssey');
    await page.waitForSelector('.chapter-card');
    assert.equal(await page.locator('.chapter-card').count(),10);
    assert.equal(await page.locator('.chapter-scenes a').count(),51);
    for(const width of [360,390,430,1366]){await page.setViewportSize({width,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
    await page.evaluate(()=>localStorage.setItem('betweenlines:saved',JSON.stringify(['el-primer-camino'])));
    await page.goto(base+'/#saved');await page.reload();
    await page.waitForSelector('[data-save="the-first-path"][aria-pressed="true"]');
    await page.goto(base+'/reader.html?story=el-primer-camino&start=1');
    await page.waitForFunction(()=>window.reader&&!document.querySelector('#start').disabled);
    assert.equal(await page.evaluate(()=>reader.story.id),'el-primer-camino-v1');
    return {stories:expectedStories,odysseyChapters:10,sceneLinks:51,search:true,saved:true,preferences:true,legacySlug:true};
  } finally {await context.close();}
}
export async function check(page,item){const ids=item.story.steps.filter(s=>s.type==='text').map(s=>s.id),id=ids[Math.floor(ids.length/2)];const before=await page.evaluate(id=>{const e=qaScene.reader;e.start(id);e.paused=true;e.onChange('back');return JSON.stringify(e.model);},id);await page.goto(`${base}/reader.html?story=${item.slug}&resume=1`);await page.waitForFunction(()=>window.reader&&document.querySelector('#intro').hidden);const restored=await page.evaluate(()=>{window.qaScene=Phaser.Display.Canvas.CanvasPool.pool.find(p=>p.parent?.scene?.getScene).parent.scene.scenes[0];qaScene.game.loop.stop();qaScene.reader.paused=true;return {id:qaScene.reader.step.id,model:JSON.stringify(qaScene.reader.model)};});assert.equal(restored.id,id);assert.equal(restored.model,before);await page.click('#show-controls');await page.click('#menu-history');assert(await page.locator('#history-content p').count()>0);await page.click('#close-history');await page.evaluate(()=>{qaScene.reader.paused=false;qaScene.reader.lastTap=-Infinity;});await page.keyboard.press('ArrowLeft');assert.notEqual(await page.evaluate(()=>qaScene.reader.step.id),id);await page.click('#quick-pause');const frozen=await page.evaluate(()=>JSON.stringify(qaScene.reader.model));await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>JSON.stringify(qaScene.reader.model)),frozen);await page.click('#show-controls');await page.click('#restart');return {resume:true,history:true,keyboardBack:true,pause:true,restart:true};}
