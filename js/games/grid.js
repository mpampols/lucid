import { $, ri } from '../utils.js';
import { sfx } from '../sound.js';
import { bump } from './shared.js';

// 4) Constelación — memoria visoespacial (tipo Corsi)
export function initGrid(st, api){
  const L=api.t(); let len=3, seq=[], pos=0, phase='show', fails=0, cells=[];
  st.innerHTML = `<div class="mid"><div class="hint" id="h"></div><div class="grid locked" id="g"></div></div>`;
  const h=$('#h',st), g=$('#g',st);
  function build(){
    const n = len>=5 ? 4 : 3; g.style.setProperty('--n',n);
    g.innerHTML = Array.from({length:n*n},(_,i)=>`<button class="cell" data-i="${i}" aria-label="${i+1}"></button>`).join('');
    cells=[...g.children]; cells.forEach(c=>c.onclick=()=>tap(+c.dataset.i));
    return n*n;
  }
  function round(){
    const total=build(); seq=[]; while(seq.length<len){ const c=ri(0,total-1); if(c!==seq[seq.length-1]) seq.push(c); }
    pos=0; phase='show'; g.classList.add('locked'); h.textContent=L.watch;
    const ms=Math.max(430, 680-len*20); let i=0;
    const step=()=>{
      if(i>=seq.length){ phase='input'; g.classList.remove('locked'); h.textContent=`${L.yourTurn} · ${len}`; return; }
      const c=cells[seq[i]]; c.classList.add('lit'); sfx.note(seq[i]);
      api.later(()=>{ c.classList.remove('lit'); i++; api.later(step,160); }, ms);
    };
    api.later(step,650);
  }
  function tap(i){
    if(phase!=='input') return;
    const c=cells[i];
    if(i===seq[pos]){
      c.classList.add('hit'); sfx.note(i); setTimeout(()=>c.classList.remove('hit'),220); pos++;
      if(pos===seq.length){ phase='check'; g.classList.add('locked'); api.correct(len*10); len=Math.min(12,len+1); fails=0; api.later(round,850); }
    } else {
      phase='check'; g.classList.add('locked'); c.classList.add('miss'); cells[seq[pos]].classList.add('lit'); bump(g,'shake');
      if(api.wrong()){ if(++fails>=2){ len=Math.max(3,len-1); fails=0; } api.later(round,1300); }
    }
  }
  round();
}
