import test from 'node:test';import assert from 'node:assert/strict';
import {framingIssues}from '../helpers/diagnostics.mjs';
function inspect({locked=true,head=300,feet=460}={}){
 const old=globalThis.document,stage={left:0,top:0,width:390,height:640},caption={left:14,right:376,top:84,bottom:216};
 globalThis.document={querySelector:id=>({getBoundingClientRect:()=>id==='#stage'?stage:caption})};
 const a={visible:1,head:{y:head},x:180,y:feet,bounds:{left:120,right:220,top:head,bottom:feet}},scene={scale:{width:390,height:640},framing:locked?{lock:'room'}:{},diagnostics:()=>({requiredActors:['actor'],actors:{actor:a},requiredProps:[]})};
 try{return framingIssues(scene);}finally{globalThis.document=old;}
}
test('a fixed-room caption above the cast permits a clear complete actor below it',()=>assert.deepEqual(inspect(),[]));
test('a fixed-room caption still rejects any actual actor/caption overlap',()=>assert(inspect({head:100,feet:260}).some(x=>x.kind==='actor-caption-contact')));
test('fixed-room framing still rejects a head outside the visible stage',()=>assert(inspect({head:-5,feet:70}).some(x=>x.kind==='actor-frame')));
test('legacy framing keeps its original bottom-caption acceptance contract',()=>assert(inspect({locked:false}).some(x=>x.kind==='actor-frame')));
