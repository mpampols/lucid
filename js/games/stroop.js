import { $, pick } from '../utils.js';
import { bump } from './shared.js';

// 2) Tinta — efecto Stroop
export function initStroop(st, api){
  const keys=['red','blue','green','yellow'], names=api.t().colors; let ink, lock=false;
  st.innerHTML = `<div class="mid"><div class="hint">${api.t().tapInk}</div><div class="stroop-word" id="w"></div></div>
    <div class="choices">${keys.map((k,i)=>`<button class="choice" data-c="${k}">${names[k]}<kbd>${i+1}</kbd></button>`).join('')}</div>`;
  const w=$('#w',st);
  function next(){
    const word=pick(keys); ink = Math.random()<.25 ? word : pick(keys.filter(k=>k!==word));
    w.textContent=names[word]; w.style.color=`var(--c-${ink})`; bump(w,'flash-ok');
  }
  function choose(k, btn){
    if(lock) return;
    if(k===ink){ api.correct(10); next(); }
    else { lock=true; api.wrong(); if(btn) bump(btn,'shake'); bump(w,'shake'); api.later(()=>{ lock=false; next(); },450); }
  }
  st.querySelectorAll('.choice').forEach(b=>b.onclick=()=>choose(b.dataset.c,b));
  api.key(e=>{ const i=+e.key-1; if(i>=0&&i<4){ e.preventDefault(); choose(keys[i], st.querySelectorAll('.choice')[i]); } });
  next();
}
