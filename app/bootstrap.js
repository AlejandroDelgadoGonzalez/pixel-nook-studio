import('/platform/reader/player.js').catch(error=>{
 console.error(error);const button=document.getElementById('start');button.disabled=false;button.textContent='No se pudo cargar · Reintentar / Retry';button.onclick=()=>location.reload();
});
