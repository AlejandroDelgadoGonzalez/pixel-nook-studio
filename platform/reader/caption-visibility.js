// Keep the caption's measured layout even when its presentation is deferred.
// Stories without this opt-in retain their approved progressive reveal.
export function captionReady(step,elapsed,revealed,presentation,motionRemainingMs=0){
 if(presentation!=='ready-complete')return true;
 const actionUntil=step?.during?.lockUntilComplete?(step.during.delayMs||0)+step.during.duration:0;
 return step?.type==='text'&&motionRemainingMs<=0&&elapsed>=Math.max(step.captionStartMs||0,actionUntil)&&revealed>=step.text.length;
}
