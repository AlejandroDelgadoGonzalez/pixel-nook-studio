import assert from 'node:assert/strict';
export async function check(page) {
  const result = await page.evaluate(() => {
    const e = qaScene.reader, issues = [];
    let samples = 0, holds = 0, guard = 0;
    const clone = value => JSON.stringify(value);
    e.sceneGate = false;
    e.setAuto(false);
    e.start();
    while (e.running) {
      if (++guard > 10000) throw Error('Motion loop');
      if (e.step.type === 'text') {
        e.revealed = e.step.text.length;
        if(e.visualMotionRemainingMs)e.tick(e.visualMotionRemainingMs);
        e.advance(e.lastTap === -Infinity ? 1000 : e.lastTap + 1000);
        continue;
      }
      const action = e.step, start = structuredClone(e.startModel);
      const n = Math.max(2, Math.ceil(action.duration / 100));
      let held, tracked=false;
      for (let i = 0; i < n; i++) {
        e.paused = false;
        e.tick(action.duration / n);
        if (e.step !== action) break;
        qaScene.draw(action.duration / n, false);
        samples++;
        if (action.camera?.hold) {
          holds++;
          const frame = clone(qaScene.framing);
          tracked ||= !!qaScene.diagnostics().cameraReframing;
          const approvedTracking = qaScene.cameraTrial?.config?.official === true && qaScene.cameraTrial?.state?.active && tracked;
          if (held && frame !== held && !approvedTracking) issues.push({id: action.id, type: 'held-camera-drift'});
          held = frame;
          for (const [id, actor] of Object.entries(start.actors)) {
            const changes = action.effects.actors?.[id] || {};
            if (changes.x === undefined && changes.y === undefined &&
                (actor.x !== e.model.actors[id].x || actor.y !== e.model.actors[id].y)) {
              issues.push({id: action.id, actor: id, type: 'waiting-actor-moved'});
            }
          }
        }
      }
      e.paused = true;
      const state = clone(e.model), time = e.totalTime;
      e.tick(100);
      if (clone(e.model) !== state || e.totalTime !== time) issues.push({id: action.id, type: 'pause'});
      e.paused = false;
      if (e.step === action) e.tick(Math.max(0, action.duration - e.elapsed));
    }
    return {samples, holds, issues};
  });
  assert.deepEqual(result.issues, []);
  return result;
}
