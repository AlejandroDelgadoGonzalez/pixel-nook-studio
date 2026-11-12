// Keep the caption's measured layout even when its presentation is deferred.
// Stories without this opt-in retain their approved progressive reveal.
export function captionReady(step,elapsed,revealed,presentation){
 if(presentation!=='ready-complete')return true;
 return step?.type==='text'&&elapsed>=(step.captionStartMs||0)&&revealed>=step.text.length;
}
