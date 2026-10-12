import { $, ri } from '../utils.js';
import { sfx } from '../sound.js';
import { keypadHTML, bindKeypad, bump } from './shared.js';

// 3) Dígitos — amplitud de dígitos
export function initDigits(st, api){
  const L=api.t(); let len=3, seq=[], input=[], phase='show', fails=0;
  st.innerHTML = `<div class="mid"><div class="hint" id="h"></div><div class="flash-digit" id="d"></div><div class="slots" id="s"></div></div>${keypadHTML()}`;
  const h=$('#h',st), d=$('#d',st), s=$('#s',st), kp=$('.keypad',st);
  const slots=()=>{ s.innerHTML=seq.map((_,i)=>`<span class="slot ${i<input.length?'filled':''}">${input[i]??''}</span>`).join(''); };
  function round(){
    seq=[]; while(seq.length<len){ const n=ri(0,9); if(n!==seq[seq.length-1]) seq.push(n); }
    input=[]; phase='show'; kp.classList.add('off'); s.className='slots'; s.innerHTML=''; d.hidden=false; h.textContent=L.watch;
    const ms=Math.max(560, 900-len*25); let i=0;
    const show=()=>{
      if(i>=seq.length){ d.hidden=true; phase='input'; kp.classList.remove('off'); h.textContent=`${L.yourTurn} · ${len}`; slots(); return; }
      d.textContent=seq[i]; bump(d,'in'); sfx.note(seq[i]); i++;
      api.later(()=>{ d.textContent=''; api.later(show,170); }, ms);
    };
    api.later(show,600);
  }
  function press(k){
    if(phase!=='input') return;
    if(k==='del'){ input.pop(); slots(); return; }
    input.push(+k); slots();
    if(input.length<seq.length) return;
    phase='check';
    if(input.every((v,i)=>v===seq[i])){
      s.classList.add('ok'); api.correct(len*10); len=Math.min(14,len+1); fails=0;
      api.later(round,750);
    } else {
      const go=api.wrong();
      s.innerHTML=seq.map((v,i)=>`<span class="slot ${input[i]===v?'filled':'miss'}">${v}</span>`).join(''); bump(s,'shake');
      if(go){ if(++fails>=2){ len=Math.max(3,len-1); fails=0; } api.later(round,1500); }
    }
  }
  bindKeypad(st, press, api); kp.classList.add('off'); round();
}
