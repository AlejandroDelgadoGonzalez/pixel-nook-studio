import {storage} from '../storage/storage.js';
(() => {
 const key='pixelnook:theme';
 function apply(value){document.documentElement.dataset.theme=value==='dark'?'dark':'light';document.querySelector('meta[name="theme-color"]')?.setAttribute('content',value==='dark'?'#17241e':'#f7f4ec');}
 let value='light';try{value=storage.getItem(key)||'light';}catch{}
 apply(value);
 window.PixelNookTheme={set(value){apply(value);try{storage.setItem(key,value);}catch{}window.dispatchEvent(new Event('themechange'));}};
 window.addEventListener('storage',e=>{if(e.key===key){apply(e.newValue);window.dispatchEvent(new Event('themechange'));}});
})();
