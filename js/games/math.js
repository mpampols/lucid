import { $, ri, pick } from '../utils.js';
import { keypadHTML, bindKeypad, bump } from './shared.js';

// 1) Cálculo mental — dificultad adaptativa
export function initMath(st, api){
  let level=1, streak=0, ans=0, input='', lock=false;
  st.innerHTML = `<div class="mid"><div class="prompt" id="q"></div><div class="answer" id="a">?</div></div>${keypadHTML()}`;
  const q=$('#q',st), a=$('#a',st);
  function gen(){
    const ops = level<2?['+','−'] : level<4?['+','−','×'] : ['+','−','×','÷'];
    const max = [0,12,20,35,50,80,120][Math.min(level,6)];
    const op=pick(ops); let x,y;
    if(op==='+'){ x=ri(2,max); y=ri(2,max); ans=x+y; }
    else if(op==='−'){ x=ri(4,max); y=ri(1,x-1); ans=x-y; }
    else if(op==='×'){ x=ri(2,level<5?9:13); y=ri(2,level<5?9:12); ans=x*y; }
    else { y=ri(2,level<6?9:12); ans=ri(2,level<6?10:13); x=y*ans; }
    q.textContent=`${x} ${op} ${y}`; bump(q,'flash-ok');
    input=''; a.textContent='?'; a.className='answer';
  }
  function press(k){
    if(lock) return;
    if(k==='del') input=input.slice(0,-1);
    else { if(input.length>=5) return; input+=k; }
    a.textContent=input||'?'; a.className='answer'+(input?' typing':'');
    if(!input) return;
    if(+input===ans){
      lock=true; a.className='answer ok'; api.correct(5+5*level);
      if(++streak>=3 && level<6){ level++; streak=0; }
      api.later(()=>{ lock=false; gen(); },220);
    } else if(k!=='del' && input.length>=String(ans).length){
      lock=true; a.className='answer bad'; a.textContent=ans; bump(a,'shake'); api.wrong();
      streak=0; level=Math.max(1,level-1);
      api.later(()=>{ lock=false; gen(); },800);
    }
  }
  bindKeypad(st, press, api); gen();
}
