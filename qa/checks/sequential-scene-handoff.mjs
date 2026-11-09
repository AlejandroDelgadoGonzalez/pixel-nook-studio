import assert from 'node:assert/strict';

// Exercise playback from the chapter beginning. Starting the destination scene
// directly cannot reveal an intermediate end marker.
export async function check(page){
 const result=await page.evaluate(()=>{
  const e=qaScene.reader,scenes=e.story.scenes,visits=[],ends=[],boundaries=[];
  const endVisible=()=>!document.querySelector('#ending').hidden;
  for(const auto of [true,false]){
   e.sceneGate=false;e.setAuto(auto);e.start();e.onChange('back');let guard=0,last=-1;const mode={auto,visited:[],endingAt:null};
   while(e.running){
    if(++guard>20000)throw Error('Chapter playback did not terminate');
    const step=e.step;if(step.sceneIndex!==last){mode.visited.push(step.sceneIndex);last=step.sceneIndex;}
    if(endVisible())throw Error('Premature chapter ending at '+step.id);
    const at=e.index,from=step.sceneIndex;
    if(step.type==='action')e.tick(step.duration);
    else if(step.type==='text'){if(auto)e.tick(Math.max(step.readingDurationMs||0,100000));else{e.revealed=step.text.length;if(e.visualMotionRemainingMs)e.tick(e.visualMotionRemainingMs);e.advance(guard*1000);}}
    else throw Error('Unexpected running step '+step.id);
    qaScene.draw(0,true);qaScene.game.step(performance.now(),0);
    if(e.running&&e.step.sceneIndex!==from){boundaries.push({auto,from,to:e.step.sceneIndex,id:e.step.id,endingVisible:endVisible()});if(e.step.sceneIndex!==from+1)throw Error('Skipped scene at '+e.step.id);}
    if(e.running&&e.index===at)throw Error('Playback stalled at '+step.id);
   }
   mode.endingAt=e.step.sceneIndex;ends.push({auto,id:e.step.id,scene:e.step.sceneIndex,visible:endVisible(),text:document.querySelector('#ending').textContent});visits.push(mode);
   if(mode.visited.length!==scenes.length||mode.visited.some((v,i)=>v!==i))throw Error('Did not visit every available scene: '+JSON.stringify(mode));
   if(e.step.sceneIndex!==scenes.length-1||e.step.type!=='end'||!endVisible())throw Error('Ending must appear only after final available scene');
  }
  return{scenes:scenes.length,visits,boundaries,ends,issues:[]};
 });
 assert(result.boundaries.every(b=>!b.endingVisible));
 return result;
}
