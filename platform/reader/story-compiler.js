export function compileStory(data){
 if(data.schemaVersion!==1||!data.id||!data.scenes?.length)throw new Error('Invalid story schema');
 const ids=new Set();for(const scene of data.scenes){if(!scene.id||!scene.steps?.length)throw new Error('Empty scene');for(const s of scene.steps){if(!s.id||ids.has(s.id))throw new Error('Duplicate step');ids.add(s.id);if(s.type==='text'&&!(typeof s.text==='string'?s.text:s.text?.en||s.text?.es))throw new Error('Missing text');}}
 const result=structuredClone(data);result.steps=result.scenes.flatMap((scene,chapter)=>scene.steps.map(s=>({...s,sceneIndex:chapter})));return result;
}
