import es from './es.js';
import ca from './ca.js';
import en from './en.js';

export const T = { es, ca, en };
export const LANGS = Object.keys(T);

// Idioma: el primero de la lista del navegador que tengamos (ca, es, en).
// Valenciano (ca-ES-valencia) y gallego/euskera caen en ca/es; el resto, en inglés.
export function detectLang(){
  const list=(navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||'']).map(l=>String(l).toLowerCase());
  for(const l of list){
    if(l.startsWith('ca')) return 'ca';
    if(l.startsWith('es')||l.startsWith('gl')||l.startsWith('eu')) return 'es';
    if(l.startsWith('en')) return 'en';
  }
  return 'en';
}
