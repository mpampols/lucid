// Small feedback effects: screen-edge glow, haptics, number count-up and text bursts.
import { $, fmtN } from './utils.js';

export const reducedMotion = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

// Coloured glow around the screen edges ('good' | 'bad')
export function edge(kind){
  const el=$('#fx'); if(!el) return;
  el.className=''; void el.offsetWidth; el.className='fx-'+kind;
}

// Short vibration on devices that support it (Android); silently ignored elsewhere
export function haptic(pattern=12){ try{ navigator.vibrate?.(pattern); }catch(e){} }

// Animate a number from `from` to `to` inside `el`; `onStep` fires a few times for tick sounds
export function countUp(el, to, {from=0, duration=900, onStep, onDone}={}){
  if(reducedMotion() || to===from){ el.textContent=fmtN(to); onDone?.(); return; }
  let t0=null, lastStep=-1;
  const frame=now=>{
    if(t0===null) t0=now;
    const k=Math.min(1,(now-t0)/duration), e=1-Math.pow(1-k,3);
    el.textContent=fmtN(Math.round(from+(to-from)*e));
    const step=Math.floor(k*12); if(step!==lastStep && k<1){ lastStep=step; onStep?.(step); }
    if(k<1) requestAnimationFrame(frame); else onDone?.();
  };
  requestAnimationFrame(frame);
}

// Big centred word that pops and fades ("Great!", "Go!")
export function burst(container, text, cls=''){
  const el=document.createElement('div');
  el.className='burst '+cls; el.textContent=text;
  container.appendChild(el);
  setTimeout(()=>el.remove(), 900);
}

// Re-trigger a CSS animation class on an element
export function bump(el, cls){ if(!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
