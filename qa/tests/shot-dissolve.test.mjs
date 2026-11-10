import test from 'node:test';
import assert from 'node:assert/strict';
import {installShotDissolve} from '../../platform/rendering/shot-dissolve.js';
import {EventEmitter} from 'node:events';

function fixture(){
 const objects=[],camera={alpha:1,setAlpha(v){this.alpha=v;return this;},ignore(){},setViewport(){}};
 const scene={sys:{settings:{key:'test'}},events:new EventEmitter(),reader:{totalTime:0,shotTransition:null},scale:{width:390,height:700},game:{canvas:{},events:new EventEmitter()},children:{list:objects},
  cameras:{main:camera,add:()=>({...camera})},
  textures:{createCanvas:()=>({context:{clearRect(){},drawImage(){}},refresh(){},setSize(){}})},
  add:{image:()=>{const image={alpha:1,visible:true};for(const name of ['setOrigin','setDepth','setTexture','setPosition','setDisplaySize'])image[name]=()=>image;image.setAlpha=v=>(image.alpha=v,image);image.setVisible=v=>(image.visible=v,image);objects.push(image);return image;}},
  target:'I',draw(){this.renderedBackdrop=this.target;}};
 installShotDissolve(scene);const draw=scene.draw;scene.drawWithoutRender=draw;scene.draw=(...args)=>{draw(...args);scene.game.events.emit('postrender');};scene.draw(0,true);return scene;
}
const partial=s=>{assert(s.shotDissolve.alpha>.15&&s.shotDissolve.alpha<.85);assert(s.cameras.main.alpha>.15&&s.cameras.main.alpha<.85);};
test('four repeated backdrop changes use two persistent layers without bridge metadata',()=>{
 const s=fixture();
 for(let pass=0;pass<3;pass++)for(const target of ['E','I','E','I']){
  s.target=target;s.draw(0,true);assert.equal(s.cameras.main.alpha,0);assert.equal(s.shotDissolve.alpha,1);
  s.reader.totalTime+=250;s.draw(0);partial(s);
  s.draw(0,true);partial(s); // layout/camera reset in the middle
  s.reader.totalTime+=450;s.draw(0);assert.equal(s.cameras.main.alpha,1);assert.equal(s.shotDissolve.active,false);
 }
 assert.equal(s.children.list.length,1,'snapshot sprite must be reused');
});
test('same backdrop, pose beats, pause and replay clock resets cannot cancel an active fade',()=>{
 const s=fixture();s.target='E';s.draw(0);s.reader.totalTime=250;s.draw(0);partial(s);
 const alpha=s.shotDissolve.alpha;s.reader.shotTransition=null;s.draw(0,true);assert.equal(s.shotDissolve.alpha,alpha);
 s.reader.totalTime=0;s.draw(0,true);assert.equal(s.shotDissolve.alpha,alpha);
 s.reader.totalTime=450;s.draw(0);assert.equal(s.shotDissolve.active,false);assert.equal(s.cameras.main.alpha,1);
});
test('layout can select a backdrop repeatedly before a painted frame without restarting it',()=>{
 const s=fixture();s.target='E';s.drawWithoutRender(0,true);
 assert.equal(s.shotDissolve.currentBackdrop,'I','identity must describe the painted canvas');
 s.reader.totalTime=250;s.drawWithoutRender(0,true);partial(s);
 s.game.events.emit('postrender');assert.equal(s.shotDissolve.currentBackdrop,'E');
 s.reader.totalTime=700;s.draw(0);assert.equal(s.shotDissolve.active,false);
});
test('renderers without backdrop reporting retain authored shot duration and reconstruction clearing',()=>{
 const s=fixture();s.shotDissolve.clear();s.target=null;
 s.reader.shotTransition={serial:1,time:0,durationMs:1400};s.draw(0);
 s.reader.totalTime=700;s.draw(0);assert.equal(s.shotDissolve.alpha,.5);assert.equal(s.cameras.main.alpha,1);
 s.draw(0,true);assert.equal(s.shotDissolve.active,false);assert.equal(s.shotDissolve.alpha,0);
});
