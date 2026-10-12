import { Store } from './store.js';
import { T } from './i18n/index.js';

// App state. `S` is a live binding: importing modules see the new object
// when a backup is restored or progress is reset.
export let S = Store.load();
export const save = () => Store.save(S);
export const setState = s => { S = s; Store.save(S); };
export const t = () => T[S.lang] || T.es;
