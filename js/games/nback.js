import { $, pick, shuffle } from '../utils.js';
import { sfx } from '../sound.js';
import { bump, pressFx } from './shared.js';

// 8) Eco — n-back adaptativo
export function initNback(st, api){
  const L=api.t(), pool=shuffle('BCDFGHKLMNPRST'.split('')).slice(0,7);
  let n=1, seq=[], responded=false, hitsRow=0, errs=0, pendingN=null;
  st.innerHTML = `<div class="mid"><div class="hint" id="h"></div><div class="nb-card" id="c"></div><div class="nb-level" id="lv"></div><div class="nb-note" id="nt"></div></div>
    <button class="btn wide" id="m">${L.match}</button>`;
  const h=$('#h',st), card=$('#c',st), lv=$('#lv',st), nt=$('#nt',st), mb=$('#m',st);
  const level=()=>{ h.textContent=L.nbackQ(n); lv.innerHTML=`<span class="nb-dots">${[1,2,3].map(i=>`<i class="${i<=n?'on':''}"></i>`).join('')}</span>${L.nbackLevel(n)}`; };
  const isMatch=()=>seq.length>n && seq[seq.length-1]===seq[seq.length-1-n];
  function nextLetter(){
    if(seq.length>=n && Math.random()<.32) return seq[seq.length-n];
    let x; do{ x=pick(pool); } while(seq.length>=n && x===seq[seq.length-n]); return x;
  }
  function step(){
    // cerrar el estímulo anterior: si era coincidencia y no se pulsó, es un fallo
    if(isMatch() && !responded){ nt.textContent=L.nbackMiss; card.className='nb-card bad'; api.wrong(); errs++; hitsRow=0; if(errs>=3 && n>1){ pendingN=n-1; } }
    else nt.textContent='';
    if(pendingN){ n=pendingN; pendingN=null; seq=[]; errs=0; hitsRow=0; level(); }
    api.later(()=>{
      seq.push(nextLetter()); responded=false;
      card.className='nb-card'; card.textContent=seq[seq.length-1]; bump(card,'flash-ok'); sfx.blip();
      api.later(()=>{ card.textContent=''; }, 1600);
      api.later(step, 2300);
    }, 250);
  }
  function tap(){
    if(responded || seq.length<=n){ return; }
    responded=true; pressFx(mb);
    if(isMatch()){ card.className='nb-card ok'; api.correct(15*n); hitsRow++; if(hitsRow>=4 && n<3){ pendingN=n+1; } }
    else { card.className='nb-card bad'; bump(card,'shake'); api.wrong(); errs++; hitsRow=0; if(errs>=3 && n>1){ pendingN=n-1; } }
  }
  mb.onclick=tap;
  api.key(e=>{ if(e.key===' '||e.key==='Enter'||e.key.toLowerCase()==='m'){ e.preventDefault(); tap(); } });
  level(); api.later(step,400);
}
