import { $, pick } from '../utils.js';
import { bump, pressFx } from './shared.js';

// Mirror — mental rotation with polyominoes
export function initRotate(st, api){
  const L=api.t(); let level=1, streak=0, same=true, lock=false;
  st.innerHTML = `<div class="mid"><div class="hint">${L.mirrorQ}</div><div class="shapes"><div class="shape-box" id="s0"></div><div class="shape-box" id="s1"></div></div></div>
    <div class="choices"><button class="choice" id="c0">${L.same}<kbd>←</kbd></button><button class="choice" id="c1">${L.mirror}<kbd>→</kbd></button></div>`;
  const box=[$('#s0',st),$('#s1',st)], c=[$('#c0',st),$('#c1',st)];
  const K=(x,y)=>x+','+y;
  const norm=cs=>{ const mx=Math.min(...cs.map(p=>p[0])), my=Math.min(...cs.map(p=>p[1])); return cs.map(([x,y])=>K(x-mx,y-my)).sort().join(';'); };
  const rot=cs=>cs.map(([x,y])=>[-y,x]), mir=cs=>cs.map(([x,y])=>[-x,y]);
  function chiral(cs){ const m=norm(mir(cs)); let r=cs; for(let i=0;i<4;i++){ if(norm(r)===m) return false; r=rot(r); } return true; }
  function poly(n){
    for(;;){
      const cs=[[0,0]], set=new Set([K(0,0)]);
      while(cs.length<n){ const [x,y]=pick(cs), [dx,dy]=pick([[1,0],[-1,0],[0,1],[0,-1]]); if(!set.has(K(x+dx,y+dy))){ set.add(K(x+dx,y+dy)); cs.push([x+dx,y+dy]); } }
      if(chiral(cs)) return cs;
    }
  }
  function svg(cs, angle){
    const xs=cs.map(p=>p[0]), ys=cs.map(p=>p[1]);
    const cx=(Math.min(...xs)+Math.max(...xs)+1)/2, cy=(Math.min(...ys)+Math.max(...ys)+1)/2;
    const R=Math.max(...cs.map(([x,y])=>Math.hypot(x+.5-cx,y+.5-cy)))+.75;
    const cells=cs.map(([x,y])=>`<rect x="${x+.05}" y="${y+.05}" width=".9" height=".9" rx=".14" fill="var(--d-space)"/>`).join('');
    return `<svg viewBox="${cx-R} ${cy-R} ${2*R} ${2*R}" aria-hidden="true"><g transform="rotate(${angle} ${cx} ${cy})">${cells}</g></svg>`;
  }
  function next(){
    const cs=poly(level<=2?5:6);
    same=Math.random()<.5;
    const angles = level===1?[90,180,270] : level===2?[45,90,135,180,225,270,315] : [30,60,90,120,150,180,210,240,270,300,330];
    const base = level>=4 ? pick([0,30,60,90]) : 0;
    box[0].innerHTML=svg(cs,base);
    box[1].innerHTML=svg(same?cs:mir(cs), base+pick(angles));
    box.forEach(b=>b.className='shape-box');
  }
  function choose(i){
    if(lock) return; lock=true; pressFx(c[i]);
    const ok = (i===0)===same;
    box.forEach(b=>b.classList.add(ok?'ok':'bad'));
    if(ok){ api.correct(10+3*(level-1)); if(++streak>=3 && level<4){ level++; streak=0; } api.later(()=>{ lock=false; next(); },380); }
    else { bump(box[1],'shake'); api.wrong(); streak=0; level=Math.max(1,level-1); api.later(()=>{ lock=false; next(); },800); }
  }
  c.forEach((b,i)=>b.onclick=()=>choose(i));
  api.key(e=>{ if(e.key==='ArrowLeft'||e.key==='1'){ e.preventDefault(); choose(0); } if(e.key==='ArrowRight'||e.key==='2'){ e.preventDefault(); choose(1); } });
  next();
}
