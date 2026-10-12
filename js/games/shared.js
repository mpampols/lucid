// Pieces shared by several games
import { t } from '../state.js';

// ---------- number keypad ----------
export function keypadHTML(){
  return `<div class="keypad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button class="key" data-k="${n}">${n}</button>`).join('')}
    <span class="key key-space" aria-hidden="true"></span>
    <button class="key" data-k="0">0</button>
    <button class="key soft" data-k="del" aria-label="${t().del}"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5h11v14H9l-6-7z"/><path d="M12.5 9.5l5 5M17.5 9.5l-5 5"/></svg></button></div>`;
}
export function bindKeypad(root, handler, api){
  root.querySelectorAll('.key[data-k]').forEach(b=>b.addEventListener('click',()=>handler(b.dataset.k)));
  api.key(e=>{
    let k=null; if(/^[0-9]$/.test(e.key)) k=e.key; else if(e.key==='Backspace') k='del';
    if(k==null) return; e.preventDefault();
    const b=root.querySelector(`.key[data-k="${k}"]`); if(b){ b.classList.add('pressed'); setTimeout(()=>b.classList.remove('pressed'),90); }
    handler(k);
  });
}
export function bump(el, cls){ el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
export function pressFx(el){ if(!el) return; el.classList.add('pressed'); setTimeout(()=>el.classList.remove('pressed'),90); }
