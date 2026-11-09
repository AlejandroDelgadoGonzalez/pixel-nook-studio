import {storage} from '../storage/storage.js';
import {story,localizeStory} from '../reader/story-loader.js';

const translations = {
  "Pantalla completa": "Fullscreen",
  "Salir de pantalla completa": "Exit fullscreen",
  "Video vertical": "Portrait mode",
  "Salir de video vertical": "Exit portrait mode",
  "Modo inmersivo": "Immersive mode",
  "Salir del modo inmersivo": "Exit immersive mode",
  "Márgenes para video": "Video safe margins",
  "Arriba": "Top",
  "Derecha": "Right",
  "Abajo": "Bottom",
  "Izquierda": "Left",
  "Toca ••• para acceder a pausa, historial y ajustes. Escape sale del modo inmersivo. Los márgenes del video son ajustables; revisa la superposición de tu grabación.": "Tap ••• for pause, history and settings. Escape exits immersive mode. Video margins are adjustable; check your recording overlays.",
  "Entre líneas": "Pixel Nook",
  "entre líneas": "Pixel Nook",
  "HISTORIAS PARA HABITAR": "STORIES TO STEP INTO",
  "RELATO 001": "STORY 001",
  "UN RELATO ORIGINAL": "AN ORIGINAL STORY",
  "Ponte cómodo. La historia te espera.": "Settle in. The story will wait for you.",
  "Empezar historia  →": "Start the story  →",
  "Continuar lectura": "Continue reading",
  "Historia en pausa": "Story paused",
  "FIN DEL RELATO": "THE END",
  "Gracias por quedarte hasta el final.": "Thank you for staying until the end.",
  "Volver a leer": "Read again",
  "Pausar": "Pause",
  "Continuar": "Resume",
  "Automático": "Automatic",
  "Modo lectura": "Reading mode",
  "Historial": "History",
  "Sonido apagado": "Sound off",
  "Sonido activado": "Sound on",
  "Volumen": "Volume",
  "Una historia. Ninguna prisa.": "One story. No hurry.",
  "CLIC, ESPACIO O ENTER PARA AVANZAR": "CLICK, SPACE OR ENTER TO CONTINUE",
  "Un pequeño lugar entre la lectura y el juego.": "A little place between reading and play.",
  "HECHO PARA LEER SIN PRISA": "MADE FOR UNHURRIED READING",
  "Lo que hemos leído": "What we’ve read",
  "A tu manera": "Your way",
  "Composición vertical": "Portrait layout",
  "Presentación limpia": "Clean presentation",
  "Ocultar controles": "Hide controls",
  "Reiniciar historia": "Restart story",
  "Desde el principio": "From the beginning",
  "En presentación limpia, toca ••• o pulsa Escape para recuperar los controles. La lectura se guarda en este navegador.": "In clean presentation, tap ••• or press Escape to show the controls. Your progress is saved in this browser.",
  "Entre líneas, inicio": "Pixel Nook, home",
  "Reproductor de historias": "Story player",
  "Revelar texto o avanzar": "Reveal text or continue",
  "Mostrar controles": "Show controls",
  "Controles de lectura": "Reading controls",
  "Ver diálogos anteriores": "Read previous dialogue",
  "Activar sonido": "Enable sound",
  "Silenciar": "Mute",
  "Opciones de presentación": "Presentation options",
  "Progreso del relato": "Story progress",
  "Cerrar historial": "Close history",
  "Cerrar opciones": "Close options",
  "Volumen del sonido": "Sound volume",
  "Lectura guardada en este dispositivo": "Progress saved on this device",
  "Guardado local no disponible": "Local saving is unavailable",
  "Has llegado al final. Gracias por leer.": "You’ve reached the end. Thank you for reading.",
  "El navegador no pudo activar el sonido.": "The browser could not enable sound.",
  "PENSAMIENTO": "THOUGHT",
  "NARRACIÓN": "NARRATION",
  "Narración": "Narration",
  " · pensamiento": " · thought",
  "Toca para revelar": "Tap to reveal",
  "Toca para continuar": "Tap to continue",
  "Toca para continuar  ▸": "Tap to continue  ▸",
  "Lectura automática · toca para avanzar": "Automatic reading · tap to continue",
  "Los diálogos aparecerán aquí al empezar la historia.": "Your dialogue history will appear here once the story begins."
};
let language='en';
export const getLanguage=()=>language;
export const t=text=>language==='en'?(translations[text]??(text.includes('<')?text.replace(/>([^<>]+)</g,(_,copy)=>'>'+(translations[copy]??copy)+'<'):text)):text;

// Record authored static copy once. Dynamic controls are translated by the player.
const staticNodes=[];
const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
while(walker.nextNode()){
 const node=walker.currentNode;
 if(!['SCRIPT','STYLE','OPTION'].includes(node.parentElement?.tagName)&&node.textContent.trim())staticNodes.push([node,node.textContent]);
}
const attributes=[...document.querySelectorAll('[aria-label]')].map(el=>[el,el.getAttribute('aria-label')]);
export function setLanguage(next){
 language='en';
 try {storage.setItem('entrelineas:language',language);}catch{}
 localizeStory(language);
 for(const [node,copy] of staticNodes)if(node.isConnected){const core=copy.trim();node.textContent=copy.replace(core,t(core));}
 for(const [el,copy] of attributes)el.setAttribute('aria-label',t(copy));
 document.documentElement.lang=language;
 document.title=story.title+' · '+t('Entre líneas');
 document.querySelector('meta[name="description"]').content=story.description;
 document.querySelector('#intro h1').textContent=story.title;
 document.querySelector('#intro p').textContent=story.intro;
 document.querySelector('#ending h2').textContent=story.ending;
 document.getElementById('stage').setAttribute('aria-label',story.stageLabel);
 document.getElementById('back').setAttribute('aria-label',language==='en'?'Previous passage':'Pasaje anterior');
 document.getElementById('language').value=language;
}
