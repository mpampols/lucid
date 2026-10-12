import { t } from './state.js';

// ---------- utilidades ----------
export const $ = (s,r=document)=>r.querySelector(s);
export const ri = (a,b)=>a+Math.floor(Math.random()*(b-a+1));
export const pick = a=>a[Math.floor(Math.random()*a.length)];
export const shuffle = a=>{ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
export const esc = s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export function dayKey(d=new Date()){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
export function yesterdayKey(){ const d=new Date(); d.setDate(d.getDate()-1); return dayKey(d); }
export function hash(s){ let h=2166136261; for(const c of s){ h^=c.charCodeAt(0); h=Math.imul(h,16777619); } return h>>>0; }
export function seeded(seed){ return ()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let x=Math.imul(seed^seed>>>15,1|seed); x=x+Math.imul(x^x>>>7,61|x)^x; return ((x^x>>>14)>>>0)/4294967296; }; }
export const fmtN = n=>Number(n).toLocaleString(t().locale);
export const fmtDate = (d,opt={day:'numeric',month:'short'})=>new Date(d).toLocaleDateString(t().locale,opt);

let toastTimer;
export function toast(msg){ const el=$('#toast'); el.textContent=msg; el.hidden=false; clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.hidden=true,2600); }
