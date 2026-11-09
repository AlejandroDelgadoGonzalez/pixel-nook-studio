import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectViewport} from '../checks/viewport-coverage.mjs';

function fixture(){
 const box={left:0,top:0,right:800,bottom:800,width:800,height:800},panel={left:500,right:780,top:290,bottom:780,width:280,height:490};
 globalThis.innerWidth=globalThis.innerHeight=800;
 globalThis.document={body:{classList:{contains:()=>false}},querySelector:id=>({getBoundingClientRect:()=>id==='#dialogue'?panel:box})};
 globalThis.getComputedStyle=()=>({display:'block',visibility:'visible',opacity:'1'});
 const sprite={visible:true,alpha:1,texture:{key:'complete-art'},getBounds:()=>box};
 const camera={x:0,y:0,width:800,height:800,zoomX:1,zoomY:1,zoom:1,worldView:box};
 return{scale:{width:800,height:800},game:{canvas:{getBoundingClientRect:()=>box}},cameras:{main:camera},background:sprite,diagnostics:()=>({requiredActors:[]}),people:{}};
}
test('whole artwork, camera and canvas cover a free-aspect viewport',()=>assert.deepEqual(inspectViewport(fixture()).issues,[]));
test('rejects legacy min-fit camera even though canvas covers viewport',()=>{const s=fixture();s.cameras.main.y=175;s.cameras.main.height=450;assert(inspectViewport(s).issues.some(i=>i.kind==='camera-letterbox'));});
test('rejects background gaps even when camera viewport fills the canvas',()=>{const s=fixture();s.background.getBounds=()=>({left:0,top:80,right:800,bottom:720});assert(inspectViewport(s).issues.some(i=>i.kind==='artwork-gap'));});
test('rejects body/panel contact when feet center lies outside panel',()=>{const s=fixture();s.people.alice={actor:{visible:true,alpha:1,getBounds:()=>({left:350,right:550,top:180,bottom:300})}};s.diagnostics=()=>({requiredActors:['alice']});assert(inspectViewport(s).issues.some(i=>i.kind==='dialogue-body-contact'));});
test('intro still checks artwork coverage while its dialogue is hidden',()=>{const s=fixture();s.background.getBounds=()=>({left:80,top:0,right:720,bottom:800});assert(inspectViewport(s,{intro:true}).issues.some(i=>i.kind==='artwork-gap'));});
test('nonrequired actors may remain completely offscreen in a measured shot',()=>{const s=fixture();s.people.sister={actor:{visible:true,alpha:1,getBounds:()=>({left:-250,right:-50,top:120,bottom:300})}};s.diagnostics=()=>({actors:{sister:{}}});assert.deepEqual(inspectViewport(s).issues,[]);});
test('a partially visible nonrequired body is rejected in a held shot',()=>{const s=fixture();s.people.sister={actor:{visible:true,alpha:1,getBounds:()=>({left:-50,right:100,top:120,bottom:300})}};s.diagnostics=()=>({actors:{sister:{}}});assert(inspectViewport(s).issues.some(i=>i.kind==='body-clipped'));});
test('intentional reframe permits nonrequired edge transit but never required cropping',()=>{const s=fixture();s.people.sister={actor:{visible:true,alpha:1,getBounds:()=>({left:-50,right:100,top:120,bottom:300})}};s.diagnostics=()=>({cameraReframing:true,actors:{sister:{}}});assert.deepEqual(inspectViewport(s).issues,[]);s.diagnostics=()=>({cameraReframing:true,requiredActors:['sister'],actors:{sister:{}}});assert(inspectViewport(s).issues.some(i=>i.kind==='body-clipped'));});
test('omitting a visible sprite from diagnostics cannot hide its panel contact',()=>{const s=fixture();s.people.alice={actor:{visible:true,alpha:1,getBounds:()=>({left:350,right:550,top:180,bottom:300})}};assert(inspectViewport(s).issues.some(i=>i.kind==='dialogue-body-contact'));});
test('measured tracking allows only an unchanged optional stationary actor to leave the edge',()=>{
 const s=fixture(),stationary={x:810,y:650};
 s.people.sister={actor:{visible:true,alpha:1,getBounds:()=>({left:-50,right:100,top:120,bottom:280})}};
 s.reader={step:{camera:{tracking:'paired'}},model:{actors:{sister:{...stationary}}},startModel:{actors:{sister:{...stationary}}}};
 s.framing={x:300,y:300,z:1};
 const tracking={id:'paired',from:{x:200,y:300,z:1},departingStationaryActors:['sister']};
 s.diagnostics=()=>({cameraTracking:tracking,actors:{sister:{}}});assert.deepEqual(inspectViewport(s).issues,[]);
 s.diagnostics=()=>({cameraTracking:tracking,actors:{sister:{}},requiredActors:['sister']});assert(inspectViewport(s).issues.some(i=>i.kind==='body-clipped'));
 s.diagnostics=()=>({cameraTracking:tracking,actors:{sister:{}}});s.framing={...tracking.from};assert(inspectViewport(s).issues.some(i=>i.kind==='body-clipped'));
 s.framing.x+=100;s.reader.model.actors.sister.x++;assert(inspectViewport(s).issues.some(i=>i.kind==='body-clipped'));
});

test('a measured left entrance permits edge emergence only while its actual rightward path is active',()=>{
 const s=fixture();
 s.people.visitor={actor:{visible:true,alpha:1,getBounds:()=>({left:-50,right:100,top:120,bottom:280})}};
 s.reader={elapsed:100,step:{duration:500,presence:{visitor:{kind:'enter'}},paths:{visitor:[{x:100,y:200}]}},model:{actors:{visitor:{x:20,y:200}}},startModel:{actors:{visitor:{x:0,y:200}}}};
 s.diagnostics=()=>({requiredActors:['visitor'],frameEntrances:{visitor:{edge:'left'}}});
 assert.deepEqual(inspectViewport(s).issues,[]);
 s.reader.elapsed=500;assert(inspectViewport(s).issues.some(i=>i.kind==='body-clipped'));
 s.reader.elapsed=100;s.reader.model.actors.visitor.x=-1;assert(inspectViewport(s).issues.some(i=>i.kind==='body-clipped'));
 s.reader.model.actors.visitor.x=20;delete s.reader.step.paths.visitor;assert(inspectViewport(s).issues.some(i=>i.kind==='body-clipped'));
 s.reader.step.paths.visitor=[{x:100,y:200}];s.people.visitor.actor.getBounds=()=>({left:-50,right:550,top:120,bottom:300});
 assert(inspectViewport(s).issues.some(i=>i.kind==='dialogue-body-contact'));
});

test('a measured right entrance permits only active leftward emergence and never caption contact',()=>{
 const s=fixture();s.people.visitor={actor:{visible:true,alpha:1,getBounds:()=>({left:720,right:850,top:120,bottom:280})}};
 s.reader={elapsed:100,step:{duration:500,presence:{visitor:{kind:'enter'}},paths:{visitor:[{x:700,y:200}]}},model:{actors:{visitor:{x:780,y:200}}},startModel:{actors:{visitor:{x:820,y:200}}}};
 s.diagnostics=()=>({actors:{visitor:{}},requiredActors:['visitor'],frameEntrances:{visitor:{edge:'right'}}});
 assert.deepEqual(inspectViewport(s).issues,[]);
 s.reader.elapsed=500;assert(inspectViewport(s).issues.some(i=>i.kind==='body-clipped'));s.reader.elapsed=100;
 s.reader.model.actors.visitor.x=840;assert(inspectViewport(s).issues.some(i=>i.kind==='body-clipped'));s.reader.model.actors.visitor.x=780;
 delete s.reader.step.paths.visitor;assert(inspectViewport(s).issues.some(i=>i.kind==='body-clipped'));
 s.reader.step.paths.visitor=[{x:700,y:200}];s.people.visitor.actor.getBounds=()=>({left:720,right:850,top:120,bottom:310});
 assert(inspectViewport(s).issues.some(i=>i.kind==='dialogue-body-contact'));
});
