/* Isolated Phaser harness. No story imports, motion, editor, writes or network service. */
const base = new URL('./', import.meta.url);
const response = await fetch(new URL('pilot.json', base), {cache:'no-store'});
if (!response.ok) throw new Error('The preview manifest could not be loaded.');
const manifest = await response.json();
const {placement, measurements} = manifest;
const report = {validation: manifest.validation};
let scene, alice, bottle, overlay;
const state = {ready: false, view: 'side', zoom: 1, overlay: true};
const filename = view => manifest.assets[view].file;
const game = new Phaser.Game({
  type: Phaser.CANVAS, width: 640, height: 360, parent: 'stage',
  pixelArt: true, roundPixels: true, antialias: false, resolution: 1,
  banner: false, audio: {noAudio: true},
  scene: {
    preload() {
      this.load.image('forest', new URL(manifest.assets.scene.file, base).href);
      this.load.image('bottle', new URL(manifest.assets.object.file, base).href);
      for (const view of ['front', 'side', 'back']) this.load.image(view, new URL(filename(view), base).href);
    },
    create() {
      scene = this;
      for (const name of ['forest', 'bottle', 'front', 'side', 'back']) {
        if (!this.textures.exists(name)) throw new Error(`Texture load failed: ${name}`);
        this.textures.get(name).setFilter(Phaser.Textures.FilterMode.NEAREST);
      }
      this.add.image(0, 0, 'forest').setOrigin(0);
      const [rx, ry] = placement.root;
      // Integer cell top-left; fractional body root stays explicit, never rounded away.
      alice = this.add.image(placement.aliceRoot[0]-rx, placement.aliceRoot[1]-ry, state.view).setOrigin(0);
      bottle = this.add.image(placement.objectRoot[0]-16, placement.objectRoot[1]-30, 'bottle').setOrigin(0);
      overlay = this.add.graphics().setDepth(10);
      overlay.lineStyle(1, 0x00ffb0, .8);
      overlay.lineBetween(...placement.supportSegment[0], ...placement.supportSegment[1]);
      for (const [x,y] of [placement.aliceRoot, placement.objectRoot]) {
        overlay.lineStyle(1, 0xffffff, 1);
        overlay.lineBetween(x-3, y, x+3, y); overlay.lineBetween(x, y-3, x, y+3);
      }
      state.ready = true;
      update();
    }
  }
});

function update() {
  if (!state.ready) return;
  alice.setTexture(state.view); // intact authored cells; no sprite component animation
  scene.cameras.main.setZoom(state.zoom);
  scene.cameras.main.centerOn(state.zoom === 1 ? 320 : 414, state.zoom === 1 ? 180 : 273);
  scene.cameras.main.roundPixels = true;
  overlay.setVisible(state.overlay);
  document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === state.view)));
  document.querySelectorAll('[data-zoom]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.zoom) === state.zoom)));
  refreshMapping();
}

function refreshMapping() {
  if (!state.ready) return;
  const rect = game.canvas.getBoundingClientRect();
  const effective = rect.width/640*state.zoom;
  document.querySelector('#mapping').textContent =
    `640×360 world · 1 PNG px = 1 world unit · camera ×${state.zoom} · display ${effective.toFixed(5)} CSS px / native px`;
  document.querySelector('#revision').textContent =
    `${state.view} · root (${placement.root.join(', ')}) → (${placement.aliceRoot.join(', ')}) · all sprite scales ×1 · Cook only`;
}

document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => {state.view = b.dataset.view; update();}));
document.querySelectorAll('[data-zoom]').forEach(b => b.addEventListener('click', () => {state.zoom = Number(b.dataset.zoom); update();}));
document.querySelector('#overlay').addEventListener('change', e => {state.overlay = e.target.checked; update();});
new ResizeObserver(refreshMapping).observe(document.querySelector('#stage'));

window.pixelKitchenPilot = {
  state,
  snapshot() {
    if (!state.ready) return {...state};
    const rect = game.canvas.getBoundingClientRect();
    const cam = scene.cameras.main;
    const root = [alice.x+placement.root[0],alice.y+placement.root[1]];
    const projected = cam.matrix.transformPoint(root[0]-cam.scrollX,root[1]-cam.scrollY);
    const screen = [projected.x,projected.y];
    const roundTrip = cam.getWorldPoint(screen[0],screen[1]);
    return {...state, phaserVersion: Phaser.VERSION, render: 'CANVAS/NEAREST',
      nativeCanvas: [game.canvas.width,game.canvas.height],
      rendererAntialias:game.config.antialias,
      textureFilters:Object.fromEntries(['forest','bottle','front','side','back'].map(key=>[key,scene.textures.get(key).source[0].scaleMode])),
      cssImageRendering:getComputedStyle(game.canvas).imageRendering,
      cssCanvas: {x:rect.x,y:rect.y,width:rect.width,height:rect.height},
      effectiveCssPixel: rect.width/640*cam.zoom, sourceScale: measurements.views[state.view].transform.scale,
      alice: {position:[alice.x,alice.y],root,scale:[alice.scaleX,alice.scaleY],texture:alice.texture.key,cell:[alice.width,alice.height]},
      object: {position:[bottle.x,bottle.y],root:[bottle.x+16,bottle.y+30],scale:[bottle.scaleX,bottle.scaleY],cell:[bottle.width,bottle.height]},
      camera: {zoom:cam.zoom,scroll:[cam.scrollX,cam.scrollY]},
      rootScreen:screen,rootRoundTrip:[roundTrip.x,roundTrip.y],
      supportY:placement.supportSegment[0][1],pending:report.validation.pending,
      documentOverflow:document.documentElement.scrollWidth>innerWidth};
  }
};
