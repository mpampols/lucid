import { $, ri, pick } from '../utils.js';
import { bump } from './shared.js';

// 6) ¿Cuál es mayor?
export function initCompare(st, api){
  let level=1, streak=0, A, B, lock=false;
  st.innerHTML = `<div class="mid"><div class="hint">${api.t().bigger}</div><div class="vs"><button class="opt" id="o0"></button><button class="opt" id="o1"></button></div></div>`;
  const o=[$('#o0',st),$('#o1',st)];
  function expr(){
    const kinds = level===1?['add'] : level===2?['add','mul'] : level===3?['mul','addmul'] : ['mul','addmul','mulsub'];
    const k=pick(kinds), r=level;
    if(k==='add'){ const a=ri(5,15+r*12), b=ri(5,15+r*12); return {s:`${a} + ${b}`, v:a+b}; }
    if(k==='mul'){ const a=ri(3,8+r), b=ri(3,8+r); return {s:`${a} × ${b}`, v:a*b}; }
    if(k==='addmul'){ const a=ri(2,9), b=ri(3,12), c=ri(2,30); return {s:`${a} × ${b} + ${c}`, v:a*b+c}; }
    const a=ri(4,12), b=ri(4,12), c=ri(2,30); return {s:`${a} × ${b} − ${c}`, v:a*b-c};
  }
  function next(){
    const maxDiff=[0,16,12,9,7,6][Math.min(level,5)]; let tries=0;
    do{ A=expr(); B=expr(); tries++; } while((A.v===B.v || Math.abs(A.v-B.v)>maxDiff) && tries<400);
    if(A.v===B.v) B={s:B.s.replace(/(\d+)$/,m=>+m+1), v:B.v+1};
    [A,B].forEach((x,i)=>{ o[i].className='opt'; o[i].innerHTML=`<span>${x.s}</span><small></small>`; });
  }
  function choose(i){
    if(lock) return; lock=true;
    const vals=[A.v,B.v], win=vals[0]>vals[1]?0:1;
    o.forEach((el,j)=>{ el.querySelector('small').textContent='= '+vals[j]; el.classList.add(j===win?'win':'lose'); });
    if(i===win){ api.correct(10); if(++streak>=3 && level<5){ level++; streak=0; } api.later(()=>{ lock=false; next(); },450); }
    else { bump(o[i],'shake'); api.wrong(); streak=0; level=Math.max(1,level-1); api.later(()=>{ lock=false; next(); },1000); }
  }
  o.forEach((el,i)=>el.onclick=()=>choose(i));
  api.key(e=>{ if(e.key==='ArrowLeft'||e.key==='1'){ e.preventDefault(); choose(0); } if(e.key==='ArrowRight'||e.key==='2'){ e.preventDefault(); choose(1); } });
  next();
}
