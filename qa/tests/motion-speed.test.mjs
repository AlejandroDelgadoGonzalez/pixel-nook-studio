import test from 'node:test';import assert from 'node:assert/strict';
import {speedPath,speedPosition} from '../../platform/reader/motion-speed.js';
const profile=(knots=[[0,1],[1000,1]])=>({mode:'walk',speed:100,scaleKnots:knots});
test('constant ground scale yields distance / speed and linear movement',()=>{const p=speedPath([{x:0,y:0},{x:300,y:0}],profile());assert.equal(p.durationMs,3000);assert.equal(speedPosition(p,1/3).x,100);});
test('a depth slope integrates and inverts analytically without waypoint easing',()=>{const p=speedPath([{x:0,y:0},{x:0,y:100}],profile([[0,.5],[100,1]]));assert(Math.abs(p.durationMs-2000*Math.log(2))<1e-9);assert(Math.abs(speedPosition(p,.5).y-100*(Math.sqrt(2)-1))<1e-9);});
test('an orthogonal corner changes direction without adding a stop',()=>{const p=speedPath([{x:0,y:0},{x:100,y:0},{x:100,y:100}],profile());assert.equal(p.durationMs,2000);assert.equal(speedPosition(p,.499999).facing,'right');assert.equal(speedPosition(p,.5).facing,'front');assert.equal(speedPosition(p,.500001).x,100);assert(speedPosition(p,.500001).y>0);});
test('invalid modes, zero speed and unordered depth fail explicitly',()=>{assert.throws(()=>speedPath([{x:0,y:0},{x:1,y:0}],{...profile(),speed:0}));assert.throws(()=>speedPath([{x:0,y:0},{x:1,y:0}],profile([[1,1],[0,1]])));});

test('45degree rule: vertical-dominant diagonals use front/back; equality stays lateral',()=>{
 for(const[dx,dy,expected]of [[100,-101,'back'],[100,101,'front'],[100,-100,'right'],[-100,100,'left'],[100,99,'right'],[-100,-99,'left']]){const p=speedPath([{x:0,y:0},{x:dx,y:dy}],profile());for(const t of [.01,.5,.99])assert.equal(speedPosition(p,t).facing,expected);}
});

test('magical body size scales physical velocity once and retains reference speed',()=>{const points=[{x:0,y:0},{x:100,y:0}],base={mode:'walk',speed:235,scaleKnots:[[0,1],[100,1]]},normal=speedPath(points,base),small=speedPath(points,{...base,bodyScale:.32});assert(Math.abs(small.durationMs-normal.durationMs/.32)<1e-9);assert.equal(small.speed,235);assert.equal(small.bodyScale,.32);assert.throws(()=>speedPath(points,{...base,bodyScale:0}),/body scale/);assert.equal(speedPosition(small,.5).x,50);});
