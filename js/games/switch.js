import { $, pick } from '../utils.js';
import { bump, pressFx } from './shared.js';

// Switch — task switching
export function initSwitch(st, api){
  const L=api.t();
  const RULES={
    parity:{q:L.parityQ, a:[L.even,L.odd], color:'var(--d-math)', ans:n=>n%2===0?0:1},
    size:{q:L.sizeQ, a:[L.less,L.more], color:'var(--d-mem)', ans:n=>n<5?0:1}
  };
  let rule='parity', num=0, lock=false, switched=false, first=true;
  st.innerHTML = `<div class="mid"><div class="rule-card" id="rc"><span class="rule-chip" id="rq"></span><div class="rule-num" id="rn"></div></div></div>
    <div class="choices"><button class="choice" id="c0"></button><button class="choice" id="c1"></button></div>`;
  const rc=$('#rc',st), rq=$('#rq',st), rn=$('#rn',st), c=[$('#c0',st),$('#c1',st)];
  function next(){
    switched = !first && Math.random()<.4; first=false;
    if(switched) rule = rule==='parity'?'size':'parity';
    let n; do{ n=pick([1,2,3,4,6,7,8,9]); } while(n===num); num=n;
    const R=RULES[rule];
    rc.style.setProperty('--rc',R.color); rq.textContent=R.q; rn.textContent=num; bump(rc,'flash-ok');
    c.forEach((b,i)=>b.innerHTML=`${R.a[i]}<kbd>${i?'→':'←'}</kbd>`);
  }
  function choose(i){
    if(lock) return;
    pressFx(c[i]);
    if(RULES[rule].ans(num)===i){ api.correct(switched?15:10); next(); }
    else { lock=true; api.wrong(); bump(rc,'shake'); api.later(()=>{ lock=false; next(); },500); }
  }
  c.forEach((b,i)=>b.onclick=()=>choose(i));
  api.key(e=>{ if(e.key==='ArrowLeft'||e.key==='1'){ e.preventDefault(); choose(0); } if(e.key==='ArrowRight'||e.key==='2'){ e.preventDefault(); choose(1); } });
  next();
}
