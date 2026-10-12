import es from './es.js';
import ca from './ca.js';
import en from './en.js';

export const T = { es, ca, en };
export const LANGS = Object.keys(T);

// Language: the first one in the browser's preference list that we support (ca, es, en).
// Valencian (ca-ES-valencia) maps to ca, Galician/Basque to es; anything else falls back to en.
export function detectLang(){
  const list=(navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||'']).map(l=>String(l).toLowerCase());
  for(const l of list){
    if(l.startsWith('ca')) return 'ca';
    if(l.startsWith('es')||l.startsWith('gl')||l.startsWith('eu')) return 'es';
    if(l.startsWith('en')) return 'en';
  }
  return 'en';
}
