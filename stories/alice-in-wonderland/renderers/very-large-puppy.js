import {drawCharacter, createPixelWalkFrames} from '../../../platform/rendering/character-art.js';

const ROOT = '/stories/alice-in-wonderland/';
const PREFIX = 'alice-large-puppy';
const geometry = await fetch(ROOT + 'shared/chapter-2-scene-8-geometry.json').then(response => response.json());
const art = await fetch(ROOT + 'shared/chapter-2-scene-8-atlas-cells.json').then(response => response.json());
const clamp = value => Math.max(0, Math.min(1, value));
const lerp = (from, to, fraction) => from + (to - from) * fraction;
const smooth = value => {const t = clamp(value); return t * t * (3 - 2 * t);};

function routePosition(points, progress) {
 const lengths = points.slice(1).map((point, index) => Math.hypot(point[0] - points[index][0], point[1] - points[index][1]));
 let distance = clamp(progress) * lengths.reduce((sum, length) => sum + length, 0);
 for (let index = 0; index < lengths.length; index++) {
  if (distance <= lengths[index] || index === lengths.length - 1) {
   const from = points[index], to = points[index + 1];
   const t = lengths[index] ? distance / lengths[index] : 0;
   const dx = to[0] - from[0], dy = to[1] - from[1];
   return {x: lerp(from[0], to[0], t), y: lerp(from[1], to[1], t), facing: Math.abs(dy) > Math.abs(dx) ? (dy > 0 ? 'front' : 'back') : (dx > 0 ? 'right' : 'left')};
  }
  distance -= lengths[index];
 }
}

function pointAt(point, facing = 'left') {return {x: point[0], y: point[1], facing};}

export class VeryLargePuppy {
 static preload(scene) {
  scene.load.image(PREFIX + '-forest', geometry.asset);
  scene.load.image(PREFIX + '-master', geometry.puppyAsset);
 }

 constructor(scene) {
  this.scene = scene;
  this.nodes = [];
  this.own = node => {this.nodes.push(node); return node;};
  this.aliceKeys = {...scene.largeStage.keys};
  this.aliceCells = {...scene.largeStage.cells};
  for (const cell of art.poses) {
   const [left, top, right, bottom] = cell.sourceBoundsExclusive;
   const [width, height] = cell.normalizedSize;
   const key = PREFIX + '-alice-' + cell.pose;
   const texture = scene.textures.createCanvas(key, width * 4, height * 4);
   drawCharacter(texture.context, scene.emptyJar.source(cell.asset), left, top, right - left, bottom - top, width * 4, height * 4);
   texture.refresh();
   this.aliceKeys[cell.pose] = key;
   this.aliceCells[cell.pose] = cell;
  }
  for (const direction of ['right', 'front', 'back']) {
   const key = PREFIX + '-alice-' + direction;
   if (!scene.textures.exists(key)) scene.textures.addCanvas(key, scene.textures.get(this.aliceKeys[direction]).getSourceImage());
   createPixelWalkFrames(scene, PREFIX, 'alice', direction, 4);
  }
  this.puppyKeys = {};
  const master = scene.textures.get(PREFIX + '-master').getSourceImage();
  for (const [name, cell] of Object.entries(geometry.puppyFrames)) {
   const [left, top, right, bottom] = cell.bounds;
   const key = PREFIX + '-puppy-' + name;
   const texture = scene.textures.createCanvas(key, right - left, bottom - top);
   drawCharacter(texture.context, master, left, top, right - left, bottom - top, right - left, bottom - top);
   texture.refresh();
   this.puppyKeys[name] = key;
  }
  this.background = this.own(scene.add.image(0, 0, PREFIX + '-forest').setOrigin(0).setDepth(-1000));
  this.alice = this.own(scene.add.image(0, 0, this.aliceKeys['standing-ready']).setOrigin(.5, 1));
  this.puppy = this.own(scene.add.image(0, 0, this.puppyKeys['idle-right']).setOrigin(.5, 1));
  this.aliceShadow = this.own(scene.add.ellipse(0, 0, 22, 4, 0x152125, .18));
  this.puppyShadow = this.own(scene.add.ellipse(0, 0, 100, 12, 0x152125, .18));
  this.twig = this.own(scene.add.graphics());
  scene.portraits.puppy = scene.textures.get(this.puppyKeys['idle-front']).getSourceImage().toDataURL();
  this.hide();
 }

 hide() {
  this.nodes.forEach(node => node.setVisible(false));
  this.active = false;
 }

 state() {
  const reader = this.scene.reader;
  const moment = reader.step.puppyMoment || 17;
  const progress = reader.step.type === 'action' ? clamp(reader.elapsed / reader.step.duration) : 1;
  const anchors = geometry.anchors;
  let alice = pointAt(anchors.aliceEncounter), puppy = pointAt(anchors.puppyBow, 'right');
  let alicePose = 'standing-ready', puppyPose = 'idle-right', walking = false, puppyWalking = false, alpha = 1;
  if (moment <= 2) {
   alice = routePosition(geometry.walkPaths.aliceEntry, moment === 1 ? 0 : progress);
   puppy = routePosition(geometry.walkPaths.puppyApproach, moment === 1 ? 0 : progress);
   alpha = moment === 1 ? 0 : smooth(reader.elapsed / 2000);
   walking = moment === 2;
   puppyWalking = moment === 2;
  }
  if (moment === 4 || moment === 5) puppyPose = moment === 4 && progress > .75 ? 'bark-right' : 'play-bow-right';
  if (moment === 6) {
   const jump = clamp((reader.elapsed - 1000) / 1200);
   const retreat = clamp((reader.elapsed - 1400) / 800);
   alice = routePosition(geometry.walkPaths.aliceBackstep, retreat);
   puppy.x += 16 * smooth(jump);
   puppy.y -= 26 * Math.sin(jump * Math.PI);
   puppyPose = jump === 0 ? 'play-bow-right' : jump < 1 ? 'gallop-air-right' : 'idle-right';
   walking = retreat > 0 && retreat < 1;
  }
  if (moment >= 7) puppy = pointAt(anchors.puppyAfterHop, 'right');
  if (moment === 7) alice = pointAt(anchors.aliceBackstep);
  if (moment === 8) {
   alice = routePosition(geometry.walkPaths.pickupApproach, clamp(progress / .2));
   walking = progress < .2;
   alicePose = walking ? 'standing-ready' : 'collect-fan';
  }
  if (moment === 9 || moment === 10) {
   alicePose = 'examine-bottle';
   alice.facing = 'right';
  }
  if (moment === 11) {
   puppy = routePosition(geometry.walkPaths.puppyFetch, progress);
   puppyWalking = progress < 1;
  }
  if (moment >= 12) {
   puppy = pointAt(geometry.walkPaths.puppyFetch.at(-1), 'right');
   puppyPose = moment === 12 && reader.elapsed < geometry.puppyPickup.seatedMs ? 'pickup-right' : 'seated-right';
  }
  if (moment === 12) {
   const start = geometry.puppyPickup.cameraHoldMs;
   const escape = clamp((reader.elapsed - start) / (reader.step.duration - start));
   alice = routePosition(geometry.walkPaths.aliceEscapeFirst, escape);
   walking = reader.elapsed >= start;
  }
  if (moment === 13) alice = pointAt(geometry.walkPaths.aliceEscapeFirst.at(-1));
  if (moment === 14) {alice = routePosition(geometry.walkPaths.aliceEscapeLast, progress); walking = true;}
  if (moment >= 15) alice = pointAt(anchors.aliceFinal);
  if (moment === 17) alicePose = 'back';
  return {moment, progress, alice, puppy, alicePose, puppyPose, walking, puppyWalking, alpha};
 }

 fitFrame(x, groundY, final = false, section = 'encounter') {
  const scene = this.scene, width = scene.scale.width, height = scene.scale.height;
  const portrait = width < height;
  if (!portrait) return this.landscapeFrame(x, groundY, final, section);
  const safe = height * (portrait ? geometry.cameras.safeRatio : geometry.cameras.landscapeSafeRatio);
  const artFit = Math.max(width / 1660, height / 932);
  const captionFit = (height - safe + 22) / (934 - groundY);
  const targetZoom = final ? (portrait ? width / 370 : width / 1536) : (portrait ? width / geometry.cameras.portraitMeetWidth : width / 1280);
  const zoom = Math.max(artFit, targetZoom, captionFit);
  const halfWidth = width / (2 * zoom), halfHeight = height / (2 * zoom);
  const centerX = Math.max(halfWidth + 2, Math.min(1662 - halfWidth, x));
  const centerY = Math.max(halfHeight + 2, Math.min(934 - halfHeight, groundY - (safe - 22 - height / 2) / zoom));
  return {x: centerX, y: centerY, z: zoom};
 }

 landscapeFrame(focusX, groundY, final, section) {
  const scene = this.scene, width = scene.scale.width, height = scene.scale.height;
  const config = geometry.cameras.landscapeFocus;
  const panel = document.querySelector('#dialogue')?.getBoundingClientRect();
  const canvas = scene.game.canvas.getBoundingClientRect();
  const captionTop = panel?.top > canvas.top ? (panel.top - canvas.top) * height / canvas.height : height - config.captionFallbackHeight;
  const footLimit = captionTop - config.captionClearance;
  const top = final ? config.mushroomTop : config.puppyTop;
  const heightLimit = (footLimit - config.topClearance) / (groundY - top);
  const artFit = Math.max(width / 1660, height / 932);
  const requestedZoom = width / 1280 * (final ? config.finalZoom : config.encounterZoom);
  const exclusionFit = section === 'late' || final ? width / (config.puppyExclusionRight - 2) : artFit;
  const zoom = Math.max(artFit, exclusionFit, Math.min(requestedZoom, heightLimit));
  const halfWidth = width / (2 * zoom), halfHeight = height / (2 * zoom);
  let centerX = focusX;
  if (!final && section === 'encounter') centerX = Math.max(centerX, config.encounterLeft + halfWidth);
  if (section === 'late') centerX = Math.min(centerX, config.puppyExclusionRight - halfWidth);
  centerX = Math.max(halfWidth + 2, Math.min(1662 - halfWidth, centerX));
  let worldTop = groundY - footLimit / zoom;
  // Very wide viewports need enough width to exclude the seated puppy. Keep
  // the whole crown above the caption without moving the reader interface.
  if (final) worldTop = Math.min(worldTop, top - config.minimumTopClearance / zoom);
  if (!final) {
   worldTop = Math.max(worldTop, config.encounterTop);
   worldTop = Math.min(worldTop, top - config.topClearance / zoom);
  }
  const centerY = Math.max(halfHeight + 2, Math.min(934 - halfHeight, worldTop + halfHeight));
  return {x: centerX, y: centerY, z: zoom};
 }

 frame(state) {
  const {moment, progress, alice} = state;
  const portrait = this.scene.scale.width < this.scene.scale.height;
  const meet = this.fitFrame(portrait ? geometry.cameras.meetX : geometry.cameras.landscapeMeetX, 706);
  const fetch = this.fitFrame(geometry.cameras.fetchX, 706);
  const late = this.fitFrame(portrait ? 836 : geometry.cameras.lateLandscapeX, 715, false, 'late');
  const final = this.fitFrame(portrait ? geometry.cameras.finalX : geometry.cameras.finalLandscapeX, geometry.anchors.aliceFinal[1], true);
  const blend = (from, to, t) => ({x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t), z: lerp(from.z, to.z, t)});
  if (moment <= 2) return blend(this.fitFrame(geometry.anchors.entry[0], 706), meet, moment === 1 ? 0 : smooth(progress));
  const throwEnd = portrait ? meet : blend(meet, fetch, geometry.cameras.landscapeFocus.throwLeadFraction);
  if (moment <= 9) return meet;
  if (moment === 10) return blend(meet, throwEnd, smooth(progress));
  if (moment === 11) return blend(throwEnd, fetch, smooth(progress));
  if (moment === 12) {
   const start = geometry.puppyPickup.cameraHoldMs;
   const pan = (this.scene.reader.elapsed - start) / (this.scene.reader.step.duration - start);
   return blend(fetch, late, smooth(pan));
  }
  if (moment === 13) return late;
  if (moment === 14) return blend(late, final, smooth(progress));
  return final;
 }

 drawAlice(state) {
  const {alice, alpha, walking} = state;
  const cell = this.aliceCells[state.alicePose];
  const physical = geometry.aliceSize * geometry.alicePhysicalGain;
  const origin = cell.groundAnchorNormalized ? cell.groundAnchorNormalized.map((value, index) => value / cell.normalizedSize[index]) : cell.origin || [.5, 1];
  const flip = cell.facing !== alice.facing && ['left', 'right'].includes(cell.facing);
  this.alice.setVisible(alpha > 0).setTexture(this.aliceKeys[state.alicePose]).setPosition(alice.x, alice.y).setScale(physical / 4).setOrigin(flip ? 1 - origin[0] : origin[0], origin[1]).setFlipX(flip).setAlpha(alpha).setDepth(alice.y);
  if (walking) {
   const direction = ['front', 'back'].includes(alice.facing) ? alice.facing : 'right';
   this.alice.setTexture(PREFIX + '-alice-walk-' + direction + '-' + Math.floor(this.scene.reader.elapsed / 130) % 8).setOrigin(.5, 1).setFlipX(alice.facing === 'left');
  }
  this.aliceShadow.setVisible(alpha > 0).setPosition(alice.x, alice.y - 1).setDepth(alice.y - .1).setAlpha(alpha * .18);
  const hand = cell.handAnchorNormalized || [cell.normalizedSize[0] * .7, cell.normalizedSize[1] * .5];
  return [alice.x + (hand[0] - origin[0] * cell.normalizedSize[0]) * physical * (flip ? -1 : 1), alice.y + (hand[1] - origin[1] * cell.normalizedSize[1]) * physical];
 }

 drawPuppy(state) {
  const idle = geometry.puppyFrames['idle-right'].bounds;
  let pose = state.puppyPose;
  if (state.puppyWalking) {
   const frames = state.moment === 11 ? ['gallop-compress-right', 'gallop-air-right', 'walk-contact-b-right', 'walk-pass-b-right'] : ['walk-contact-a-right', 'walk-pass-a-right', 'walk-contact-b-right', 'walk-pass-b-right'];
   pose = frames[Math.floor(this.scene.reader.elapsed / 140) % frames.length];
  }
  const cell = geometry.puppyFrames[pose];
  const scale = cell.renderScale ?? geometry.puppyHeight / (idle[3] - idle[1]);
  this.puppy.setVisible(true).setTexture(this.puppyKeys[pose]).setOrigin(...cell.origin).setPosition(state.puppy.x, state.puppy.y).setScale(scale).setDepth(state.puppy.y).setFlipX(false);
  this.puppyShadow.setVisible(true).setPosition(state.puppy.x, 638).setDepth(637).setAlpha(.18);
  return pose;
 }

 drawTwig(state, hand) {
  const reader = this.scene.reader;
  let position = geometry.anchors.twigRest;
  let owner = 'ground';
  if (state.moment === 8 && state.progress >= .85 || state.moment === 9) {position = hand; owner = 'alice';}
  if (state.moment === 10) {
   const t = clamp(reader.elapsed / reader.step.duration), points = geometry.throwBezier;
   position = [0, 1].map(axis => (1 - t) ** 3 * points[0][axis] + 3 * (1 - t) ** 2 * t * points[1][axis] + 3 * (1 - t) * t ** 2 * points[2][axis] + t ** 3 * points[3][axis]);
   owner = 'air';
  }
  if (state.moment > 10) position = geometry.anchors.throwLanding;
  const grabbed = state.moment > 12 || state.moment === 12 && reader.elapsed >= geometry.puppyPickup.contactMs;
  let mouth = null;
  if (grabbed) {
   const seated = state.moment > 12 || reader.elapsed >= geometry.puppyPickup.seatedMs;
   const point = seated ? geometry.puppyPickup.seatedMouth : geometry.puppyPickup.pickupMouth;
   const image = this.puppy.texture.getSourceImage();
   mouth = [this.puppy.x + (point[0] - this.puppy.originX * image.width) * this.puppy.scaleX,
    this.puppy.y + (point[1] - this.puppy.originY * image.height) * this.puppy.scaleY];
   position = mouth.map((value, axis) => value - geometry.puppyPickup.twigBiteOffset[axis]);
   owner = 'puppy';
  }
  const depth = owner === 'puppy' ? this.puppy.depth + 1 : owner === 'alice' ? state.alice.y + 1 : 720;
  this.twig.setVisible(true).clear().setPosition(...position).setDepth(depth);
  this.twig.lineStyle(6, 0x281b18).lineBetween(-12, 0, 12, -4).lineBetween(1, -2, 5, -9);
  this.twig.lineStyle(2, 0xd5a369).lineBetween(-11, 0, 11, -4).lineBetween(1, -2, 5, -8);
  return {owner, position, mouth};
 }

 draw() {
  const scene = this.scene;
  this.active = true;
  scene.children.list.forEach(node => {if (!node.texture?.key?.startsWith('shot-dissolve-')) node.setVisible(false);});
  this.background.setVisible(true);
  scene.renderedBackdrop = this.background.texture.key;
  scene.environmentSurfaces = [this.background];
  const state = this.state(), frame = this.frame(state);
  scene.framing = {...frame, fits: true, lock: 'moonlit-puppy-clearing'};
  scene.viewport = {x: 0, y: 0, width: scene.scale.width, height: scene.scale.height};
  scene.cameras.main.setViewport(0, 0, scene.scale.width, scene.scale.height).setZoom(frame.z).centerOn(frame.x, frame.y);
  scene.cameraReframing = scene.reader.step.type === 'action';
  scene.cameraTracking = null;
  const hand = this.drawAlice(state), puppyPose = this.drawPuppy(state), twig = this.drawTwig(state, hand);
  scene.people = {alice: {actor: this.alice, shadow: this.aliceShadow}, puppy: {actor: this.puppy, shadow: this.puppyShadow}};
  scene.objects = {twig: this.twig};
  this.current = {...state, puppyPose, twig, wholeCanonicalAlice: true};
  return true;
 }

 diagnostics() {
  const scene = this.scene, frame = scene.framing, width = scene.scale.width, height = scene.scale.height;
  const project = (x, y) => ({x: (x - frame.x) * frame.z + width / 2, y: (y - frame.y) * frame.z + height / 2});
  const actors = {};
  for (const [id, person] of Object.entries(scene.people)) {
   const actor = person.actor, bounds = actor.getBounds();
   actors[id] = {...project(actor.x, actor.y), head: project(actor.x, bounds.top), world: {x: actor.x, y: actor.y}, visible: actor.visible ? actor.alpha : 0, pose: actor.texture.key, bounds: {left: project(bounds.left, bounds.top).x, right: project(bounds.right, bounds.bottom).x, top: project(bounds.left, bounds.top).y, bottom: project(bounds.right, bounds.bottom).y}};
  }
  return {width, height, environment: 'moonlit-puppy-clearing', actors, requiredActors: scene.reader.step.type === 'text' ? ['alice'] : [], props: {}, requiredProps: [], viewport: scene.viewport, cameraReframing: scene.cameraReframing, cameraTracking: null, cameraCoverage: {worldView: {left: frame.x - width / 2 / frame.z, right: frame.x + width / 2 / frame.z, top: frame.y - height / 2 / frame.z, bottom: frame.y + height / 2 / frame.z}, artwork: [0, 0, 1664, 936]}, landmarks: [], ambientTime: scene.phase, puppyScene: this.current};
 }
}
