import { $, pick } from './utils.js';

// ---------- confeti ----------
export function confetti(n){
  if(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c=$('#confetti'), x=c.getContext('2d'); c.hidden=false;
  const W=c.width=innerWidth*devicePixelRatio, H=c.height=innerHeight*devicePixelRatio;
  const css=getComputedStyle(document.documentElement);
  const cols=['--accent','--d-math','--d-attn','--d-mem','--d-lang','--d-space'].map(v=>css.getPropertyValue(v).trim()||'#f60');
  const ps=Array.from({length:n},()=>({x:W/2+(Math.random()-.5)*W*.3, y:H*.35, vx:(Math.random()-.5)*W*.018, vy:-Math.random()*H*.022-H*.006, r:(4+Math.random()*5)*devicePixelRatio, a:Math.random()*6, va:(Math.random()-.5)*.3, c:pick(cols)}));
  const t0=performance.now();
  (function f(now){
    const el=now-t0; x.clearRect(0,0,W,H);
    ps.forEach(p=>{ p.vy+=H*.0007; p.x+=p.vx; p.y+=p.vy; p.a+=p.va; x.save(); x.translate(p.x,p.y); x.rotate(p.a); x.globalAlpha=Math.max(0,1-el/1800); x.fillStyle=p.c; x.fillRect(-p.r,-p.r*.5,p.r*2,p.r); x.restore(); });
    if(el<1800) requestAnimationFrame(f); else { x.clearRect(0,0,W,H); c.hidden=true; }
  })(t0);
}
