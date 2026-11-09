// Lay out the complete paragraph once. Revealing glyphs changes only opacity,
// so words keep their final line positions throughout the typewriter effect.
export function createTextReveal(element) {
 let copy=null,characters=[],visible=0;
 const segmenter=typeof Intl.Segmenter==='function'?new Intl.Segmenter(undefined,{granularity:'grapheme'}):null;
 return (text,revealed)=>{
  if(text!==copy){
   copy=text;visible=0;characters=[];
   const fragment=document.createDocumentFragment();let end=0;
   const segments=segmenter?Array.from(segmenter.segment(text),part=>part.segment):Array.from(text);
   for(const character of segments){
    const node=document.createElement('span');node.className='text-reveal-character';node.textContent=character;
    end+=character.length;characters.push({node,end});fragment.append(node);
   }
   element.replaceChildren(fragment);
  }
  const count=Math.max(0,Math.min(text.length,revealed));
  while(visible<characters.length&&characters[visible].end<=count)characters[visible++].node.classList.add('is-revealed');
  while(visible>0&&characters[visible-1].end>count)characters[--visible].node.classList.remove('is-revealed');
 };
}
