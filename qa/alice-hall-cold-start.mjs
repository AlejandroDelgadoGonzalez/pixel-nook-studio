import {officialSizes} from './official-layouts.mjs';
import fs from 'node:fs/promises';import assert from 'node:assert/strict';
import {launch,openCase} from './helpers/browser.mjs';import {storyCases} from './helpers/story-cases.mjs';
const out='.artifacts/qa/alice-in-wonderland/hall-cold-start';await fs.mkdir(out,{recursive:true});const browser=await launch(),report={errors:[],resources:[],cases:[]};
try{const item=(await storyCases()).find(x=>x.slug==='alice-in-wonderland');
for(const size of officialSizes)for(const id of ['alice-c1-hall-establish','alice-c1-hall-hook-bottle','alice-c1-drink-inherit','alice-c1-drink-bottle','alice-c1-eat-inherit']){
const {page,context}=await openCase(browser,item,{width:size[0],height:size[1]},report);
const row=await page.evaluate(id=>{const s=qaScene,e=s.reader;e.start(id);e.paused=true;e.onChange('back');s.draw(0,true);s.game.step(performance.now(),0);s.children.depthSort();const table=s.hall.tableForeground,props=[['key',s.hall.objects.key,e.model.hall.key.owner===null],['bottle',s.hall.objects.bottle,e.model.drink.bottleOwner==='table'],['cork',s.drinkMe.props.cork,e.model.drink.cork===1]],issues=[];
for(const[name,p,rest]of props)if(rest&&p.visible){if(p.depth!==table.depth+1||s.children.list.indexOf(p)<=s.children.list.indexOf(table))issues.push(name+' behind table');}
const gaze=['alice-c1-hall-hook-bottle','alice-c1-drink-inherit','alice-c1-drink-bottle'].includes(id);const renderedFace=e.model.drink.active?e.model.drink.face:e.model.actors.alice.facing;if(gaze&&(renderedFace!=='right'||s.hall.people.alice.actor.flipX))issues.push('bottle gaze not right');
return{id,issues,props:props.map(([name,p])=>({name,depth:p.depth,visible:p.visible})),tableDepth:table.depth,flipX:s.hall.people.alice.actor.flipX,facing:e.model.actors.alice.facing};},id);report.cases.push({...row,size});await page.screenshot({path:`${out}/${size.join('x')}-${id}.png`});await context.close();assert.deepEqual(row.issues,[]);}
report.passed=!report.errors.length&&!report.resources.length;assert(report.passed);
}finally{await browser.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));}console.log('PASS',report.cases.length,'fresh isolated contexts; table props above table from first draw; bottle gaze right');
