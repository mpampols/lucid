import { Store } from './store.js';
import { T } from './i18n/index.js';

// Estado de la app. `S` es un binding vivo: los módulos que lo importan ven
// el nuevo objeto cuando se restaura una copia o se borra el progreso.
export let S = Store.load();
export const save = () => Store.save(S);
export const setState = s => { S = s; Store.save(S); };
export const t = () => T[S.lang] || T.es;
