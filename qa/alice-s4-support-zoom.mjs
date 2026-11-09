import {officialLayouts,officialSizes} from './official-layouts.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {launch,openCase} from './helpers/browser.mjs';
import {storyCases} from './helpers/story-cases.mjs';
import {inspectViewport} from './checks/viewport-coverage.mjs';
import {output} from './config.mjs';
await fs.mkdir(output,{recursive:true});const browser=await launch(),item=(await storyCases()).find(c=>c.slug==='alice-in-wonderland'),report={errors:[],resources:[],layouts:[],issues:[]};
try{for(const layout of officialLayouts){
const{page,context}=await openCase(browser,item,layout,report);await page.evaluate(code=>window.inspectS4=(0,eval)('('+code+')'),inspectViewport.toString());
const row=await page.evaluate(()=>{const s=qaScene,e=s.reader,zs=new Set(),issues=[],states=[];const sample=(id,p)=>{e.start(id);e.paused=false;if(e.step.type==='action')e.tick(e.step.duration*p*(1-1e-9));e.paused=true;e.revealed=e.step.text?.length||0;e.onChange('back');s.draw(0,true);s.game.step(performance.now(),0);};
for(const step of e.story.steps.filter(x=>x.id.startsWith('alice-c1-s4-'))){for(const p of step.type==='action'?[0,.01,.25,.5,.75,.99,1]:[0]){sample(step.id,p);zs.add(s.cameras.main.zoom);const v=inspectS4(s);if(v.issues.length)issues.push({id:step.id,p,kind:'viewport',issues:v.issues});if(!s.framing.fits)issues.push({id:step.id,p,kind:'unfit-locked-frame',frame:s.framing});states.push({id:step.id,p,z:s.cameras.main.zoom});}}
if(zs.size!==1)issues.push({kind:'zoom-drift',zs:[...zs]});
sample('alice-c1-s4-place-contact',1);e.paused=false;e.tick(.01);e.paused=true;s.draw(0,true);s.game.step(performance.now(),0);
const j=s.objects.jar,im=j.texture.getSourceImage(),pixels=im.getContext('2d').getImageData(0,0,im.width,im.height).data,bg=s.background.texture.getSourceImage(),ctx=bg.getContext('2d');let bottom=-1;for(let y=0;y<im.height;y++)for(let x=0;x<im.width;x++)if(pixels[(y*im.width+x)*4+3]>80)bottom=Math.max(bottom,y);
const foot=[];for(let x=0;x<im.width;x++)if(pixels[(bottom*im.width+x)*4+3]>80){const wx=(j.x+(x+.5-im.width*j.originX)*j.scaleX)/2,wy=(j.y+(bottom+1-im.height*j.originY)*j.scaleY)/2,rgba=[...ctx.getImageData(Math.floor(wx),Math.floor(wy+.6),1,1).data];foot.push({x:wx,y:wy,wood:rgba[0]>90&&rgba[1]>45&&rgba[0]>rgba[1]*1.15,rgba});}
const supportRatio=foot.filter(x=>x.wood).length/foot.length;if(supportRatio<.6)issues.push({kind:'floating-jar-foot',supportRatio,foot});
const c=s.emptyJar.cells['pass-arm-0'],h=c.handAnchorNormalized,d=s.emptyJar.geometry.heldProps.jar.lowerPlacementGrip.handOffsetNormalized;const tex=s.textures.get(s.emptyJar.normalized['pass-arm-0'].key).getSourceImage(),alpha=tex.getContext('2d').getImageData(Math.floor(h[0]+d[0]),Math.floor(h[1]+d[1]),1,1).data[3];if(alpha<=80)issues.push({kind:'grip-outside-real-fingertips',alpha});
return{zooms:[...zs],samples:states.length,states,jarBaseWorld:[j.x,j.y],supportRatio,foot,realHandAlpha:alpha,issues};});
report.layouts.push({layout,...row});report.issues.push(...row.issues.map(x=>({layout:layout.name,...x})));await page.screenshot({path:output+'/'+layout.name+'-support.png'});await context.close();}
report.passed=!report.errors.length&&!report.resources.length&&!report.issues.length;
}finally{await browser.close();await fs.writeFile(output+'/support-zoom.json',JSON.stringify(report,null,2));}console.log(JSON.stringify({passed:report.passed,layouts:report.layouts.map(x=>({name:x.layout.name,z:x.zooms,support:x.supportRatio,handAlpha:x.realHandAlpha})),issues:report.issues.slice(0,5),errors:report.errors}));assert(report.passed);
