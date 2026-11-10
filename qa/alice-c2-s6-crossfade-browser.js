// Runs against the real reader in an isolated iframe. The Playwright driver
// clicks Run; deterministic 50ms Phaser frames retain real engine/UI paths.
const assert=(value,message)=>{if(!value)throw Error(message);};
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const frame=document.querySelector('iframe'),output=document.querySelector('#result');
const report={passes:[],errors:[]};
const show=()=>{output.textContent=JSON.stringify(report,null,2);};
document.querySelector('#run').onclick=async()=>{
 document.querySelector('#run').disabled=true;
 try{
  const w=frame.contentWindow,doc=w.document;
  for(let i=0;i<1200&&(!w.reader||doc.querySelector('#start').disabled);i++)await wait(50);
  assert(w.reader&&!doc.querySelector('#start').disabled,'reader not ready');
  const s=w.Phaser.Display.Canvas.CanvasPool.pool.find(p=>p.parent?.scene?.getScene).parent.scene.scenes[0],e=s.reader;
  doc.querySelector('#start').click();w.focus();s.game.loop.stop();
  for(let pass=1;pass<=3;pass++){
   const row={pass,mode:pass===1?'continuous':'manual',changes:[]};report.passes.push(row);show();
   e.setAuto(pass===1);
   let lastBackdrop=null,pending=null,lastClick=0,started=performance.now();
   while(e.running){
    await wait(5);
    // Shared/headless browsers may blur the iframe; resume through the UI.
    if(e.paused)doc.querySelector('#quick-pause').click();
    s.game.step(performance.now(),50);
    assert(performance.now()-started<150000,'scene timed out');
    row.status={id:e.step.id,elapsed:e.elapsed,paused:e.paused,buffering:e.buffering,clock:e.totalTime,loopRunning:s.game.loop.running,loopPaused:s.game.loop.isPaused,hasFocus:s.game.hasFocus,backdrop:s.renderedBackdrop};show();
    const d=s.shotDissolve,id=d.currentBackdrop;
    if(lastBackdrop&&id!==lastBackdrop){
     assert(!pending,'previous dissolve never reached its sample');
     pending={from:lastBackdrop,to:id,beat:e.step.id};
    }
    if(id)lastBackdrop=id;
    if(pending&&d.elapsed>=250){
     const snapshot=s.children.list.find(n=>n.texture?.key?.startsWith('shot-dissolve-'));
     assert(d.elapsed<350,'missed intermediate frame');
     const previousAlpha=snapshot.alpha,currentAlpha=s.cameras.main.alpha;
     assert(snapshot.visible&&d.active,'outgoing texture was hidden or cancelled');
     assert(previousAlpha>.15&&previousAlpha<.85,'outgoing alpha is not partial: '+previousAlpha);
     assert(currentAlpha>.15&&currentAlpha<.85,'incoming alpha is not partial: '+currentAlpha);
     assert(Math.abs(previousAlpha+currentAlpha-1)<1e-6,'layer alpha not complementary');
     const data=snapshot.texture.getSourceImage().getContext('2d').getImageData(0,0,snapshot.width,snapshot.height).data;
     assert(data.some((v,i)=>i%4===3&&v>0),'outgoing snapshot is empty');
     row.changes.push({...pending,elapsed:d.elapsed,previousAlpha,currentAlpha});pending=null;show();
    }
    if(pass>1&&e.step?.type==='text'&&performance.now()-lastClick>300){doc.querySelector('#text-button').click();lastClick=performance.now();}
   }
   assert(row.changes.length===4,'expected four I/E changes, got '+row.changes.length);
   assert(!s.shotDissolve.active&&s.cameras.main.alpha===1,'layers did not settle cleanly');
   assert(!doc.querySelector('#ending').hidden,'missing completion UI');
   if(pass<3){
    assert(doc.querySelector('#again').textContent==='Read scene again','missing scene replay label');
    doc.querySelector('#again').click();
    assert(e.step.id==='alice-c2-bill-01','replay did not start S6');
   }
  }
  report.reconstruction=[];
  const sample=()=>{const d=s.shotDissolve;assert(d.alpha>.15&&d.alpha<.85,'reconstructed outgoing alpha');assert(d.currentAlpha>.15&&d.currentAlpha<.85,'reconstructed incoming alpha');return {previousAlpha:d.alpha,currentAlpha:d.currentAlpha};};
  const render=delta=>s.game.step(performance.now(),delta);
  // Skip all four bridge actions entirely. Only the destination texture can
  // trigger these fades; no transition metadata survives ReaderEngine.start.
  for(const id of ['alice-c2-bill-03','alice-c2-bill-12','alice-c2-bill-16','alice-c2-bill-21']){
   e.start(id);e.setAuto(false);s.draw(0,true);render(0);
   for(let i=0;i<5;i++)render(50);
   const before=sample();s.draw(0,true);assert(s.shotDissolve.alpha===before.previousAlpha,'instant draw cancelled fade');
   e.paused=true;render(100);assert(s.shotDissolve.alpha===before.previousAlpha,'pause changed alpha');e.paused=false;
   report.reconstruction.push({id,...sample()});
   for(let i=0;i<9;i++)render(50);
  }
  e.start('alice-c2-bill-13');s.draw(0,true);render(0);
  doc.querySelector('#back').click();render(0);
  assert(e.step.id==='alice-c2-bill-07','back did not cross the interior/exterior boundary');
  for(let i=0;i<5;i++)render(50);
  report.back=sample();
  for(let i=0;i<9;i++)render(50);
  report.passed=true;output.dataset.status='passed';
 }catch(error){report.errors.push(error.stack);report.passed=false;output.dataset.status='failed';}
 show();
};

document.querySelector('#run').disabled=false;
