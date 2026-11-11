import test from 'node:test';
import assert from 'node:assert/strict';
import {dialogueTop} from '../../platform/rendering/dialogue-bounds.js';

test('caption fit removes the locked frame offset and display scale', () => {
 globalThis.document = {querySelector: () => ({getBoundingClientRect: () => ({top: 756})})};
 const canvas = {closest: () => null, getBoundingClientRect: () => ({top: 0, height: 1080})};
 assert.equal(dialogueTop({game:{canvas}, scale:{height:800}}, 0), 560);
 canvas.getBoundingClientRect = () => ({top: 312.3125, height: 219.375});
 document.querySelector = () => ({getBoundingClientRect: () => ({top: 454.6634521484375})});
 assert(Math.abs(dialogueTop({game:{canvas}, scale:{height:720}}, 0) - 467.203125) < .001);
});
test('independent exports use their own measured reading reserve', () => {
 const canvas = {closest: () => ({})};
 assert.equal(dialogueTop({game:{canvas}}, 740), 740);
});
