// Mental check-up: profile → spatial span (Corsi) → digit span → reaction time → results.
// Uses standard procedures: two trials per length, stop when both fail; span = longest length recalled.
import { S, save, t } from './state.js';
import { $, fmtN, fmtDate } from './utils.js';
import { sfx } from './sound.js';
import { edge, haptic, countUp, bump } from './fx.js';
import { keypadHTML, bindKeypad } from './games/shared.js';
import { EDUCATION, eduYears, corsiExpected, corsiPercentile, CORSI, RT_REF } from './norms.js';
import { showView, goHome } from './nav.js';
import { shareCheck } from './share.js';
import { confetti } from './confetti.js';
import { icon } from './icons.js';

const stage = $('#stage');
let st = null;            // current check-up session
const STEPS = 3;

// Classic Corsi board: 9 blocks at irregular positions (percent of the board)
const BLOCKS = [[5,60],[20,12],[38,78],[48,38],[62,5],[64,60],[82,28],[80,80],[24,40]];

function later(fn, ms){ const id=setTimeout(()=>{ if(st && st.id===sid) fn(); }, ms); const sid=st.id; st.timers.push(id); }
export function leaveCheck(){ if(st){ st.timers.forEach(clearTimeout); st=null; delete stage.dataset.game; } }

document.addEventListener('keydown', e=>{ if(st && st.onKey) st.onKey(e); });

function header(i){
  $('#track').style.visibility='hidden';
  $('#hud').innerHTML = i ? `<span class="check-step">${t().check.step(i,STEPS)}</span>` : '';
}

export function openCheck(){
  leaveCheck();
  st = {id:Math.random(), timers:[], onKey:null, res:{}};
  showView('play');
  renderProfile();
}

// ---------- profile ----------
function renderProfile(){
  const C=t().check, p=S.profile||{};
  header(0);
  stage.innerHTML = `
    <form class="check-profile" id="cpForm" novalidate>
      <div class="intro-head"><span class="tile-ic" style="--dc:var(--accent)">${brainSVG}</span>
      <h2>${C.profileTitle}</h2><p class="muted">${C.profileText}</p></div>
      <label class="field"><span>${C.age}</span>
        <input id="cpAge" type="number" inputmode="numeric" min="12" max="99" value="${p.age??''}" required></label>
      <fieldset class="field"><legend>${C.edu}</legend>
        <div class="edu-opts">${EDUCATION.map(e=>`<label class="edu-opt"><input type="radio" name="edu" value="${e.id}" ${ (p.edu||'upper')===e.id?'checked':''}><span>${C.eduLevels[e.id]}</span></label>`).join('')}</div>
      </fieldset>
      <p class="form-error" id="cpErr" hidden>${C.ageError}</p>
      <button class="btn wide" type="submit">${C.cont}</button>
    </form>`;
  const f=$('#cpForm'), age=$('#cpAge');
  if(!p.age) age.focus({preventScroll:true});
  f.addEventListener('submit', e=>{
    e.preventDefault();
    const a=parseInt(age.value,10);
    if(!(a>=12 && a<=99)){ $('#cpErr').hidden=false; bump(age,'shake'); sfx.bad(); return; }
    S.profile={age:a, edu:f.edu.value}; save(); sfx.tap();
    taskIntro(1);
  });
}

// ---------- task intro ----------
function taskIntro(i){
  const C=t().check, names=[null,C.corsiName,C.digitsName,C.rtName], descs=[null,C.corsiDesc,C.digitsDesc,C.rtDesc];
  const icons=[null,'grid','digits','compare'], colors=[null,'space','mem','speed'];
  header(i); st.onKey=null;
  stage.innerHTML = `
    <div class="intro" style="--dc:var(--d-${colors[i]})">
      <span class="tile-ic">${taskIcon(icons[i])}</span>
      <div class="eyebrow">${C.name} · ${C.step(i,STEPS)}</div>
      <h2>${names[i]}</h2><p>${descs[i]}</p>
    </div>
    <div class="intro-cta"><button class="btn wide" id="tGo">${C.begin}</button></div>`;
  $('#tGo').onclick=()=>{ sfx.tap(); [null,runCorsi,runDigits,runRT][i](); };
  $('#tGo').focus({preventScroll:true});
}

// ---------- span procedure shared by Corsi and digits ----------
// present(len, done(ok)) runs one trial; resolves the span when two trials at a length fail
function spanProcedure(start, max, present, finish){
  let len=start, trial=0, okAtLen=false, span=start-1;
  const next=()=>{
    present(len, ok=>{
      if(!st) return;
      if(ok){ okAtLen=true; span=len; }
      trial++;
      if(trial<2 && !ok){ later(next, 900); return; }
      if(okAtLen && len<max){ len++; trial=0; okAtLen=false; later(next, 900); return; }
      finish(span);
    });
  };
  next();
}

function runCorsi(){
  const C=t().check;
  stage.dataset.game='corsi';
  stage.innerHTML = `<div class="mid"><div class="hint" id="h"></div><div class="corsi" id="board">${BLOCKS.map(([x,y],i)=>`<button class="cblock" data-i="${i}" style="left:${x}%;top:${y}%" aria-label="${i+1}"></button>`).join('')}</div></div>`;
  const h=$('#h'), board=$('#board'), blocks=[...board.children];
  let seq=[], pos=0, cb=null, input=false;
  blocks.forEach(b=>b.addEventListener('click',()=>{
    if(!input) return;
    const i=+b.dataset.i;
    if(i===seq[pos]){
      b.classList.add('hit'); sfx.note(i); setTimeout(()=>b.classList.remove('hit'),200); pos++;
      if(pos===seq.length){ input=false; edge('good'); sfx.ok(); cb(true); }
    } else {
      input=false; b.classList.add('miss'); setTimeout(()=>b.classList.remove('miss'),500); edge('bad'); haptic([30,40,30]); sfx.bad(); cb(false);
    }
  }));
  spanProcedure(3, 9, (len, done)=>{
    cb=done; pos=0; input=false; board.classList.add('locked');
    seq=[]; while(seq.length<len){ const n=Math.floor(Math.random()*9); if(!seq.includes(n)) seq.push(n); }
    h.textContent=`${C.corsiName} · ${len}`;
    let k=0;
    const show=()=>{
      if(k>=seq.length){ board.classList.remove('locked'); input=true; h.textContent=`${t().yourTurn} · ${len}`; return; }
      const b=blocks[seq[k]]; b.classList.add('lit'); sfx.note(seq[k]);
      later(()=>{ b.classList.remove('lit'); k++; later(show, 250); }, 700);
    };
    later(show, 700);
  }, span=>{ st.res.corsi=span; later(()=>{ delete stage.dataset.game; taskIntro(2); }, 600); });
}

function runDigits(){
  const L=t();
  stage.innerHTML = `<div class="mid"><div class="hint" id="h"></div><div class="flash-digit" id="d"></div><div class="slots" id="s"></div></div>${keypadHTML()}`;
  const h=$('#h'), d=$('#d'), s=$('#s'), kp=$('.keypad');
  let seq=[], input=[], cb=null, accepting=false;
  const slots=()=>{ s.innerHTML=seq.map((_,i)=>`<span class="slot ${i<input.length?'filled':''}">${input[i]??''}</span>`).join(''); };
  bindKeypad(stage, k=>{
    if(!accepting) return;
    if(k==='del'){ input.pop(); slots(); return; }
    input.push(+k); slots();
    if(input.length<seq.length) return;
    accepting=false; kp.classList.add('off');
    const ok=input.every((v,i)=>v===seq[i]);
    if(ok){ s.classList.add('ok'); edge('good'); sfx.ok(); }
    else { s.innerHTML=seq.map((v,i)=>`<span class="slot ${input[i]===v?'filled':'miss'}">${v}</span>`).join(''); edge('bad'); sfx.bad(); }
    cb(ok);
  }, {key:fn=>{ st.onKey=fn; }});
  spanProcedure(3, 12, (len, done)=>{
    cb=done; input=[]; accepting=false; kp.classList.add('off'); s.className='slots'; s.innerHTML=''; d.hidden=false; h.textContent=L.watch;
    seq=[]; while(seq.length<len){ const n=Math.floor(Math.random()*10); if(n!==seq[seq.length-1]) seq.push(n); }
    let k=0;
    const show=()=>{
      if(k>=seq.length){ d.hidden=true; accepting=true; kp.classList.remove('off'); h.textContent=`${L.yourTurn} · ${len}`; slots(); return; }
      d.textContent=seq[k]; bump(d,'in'); sfx.note(seq[k]); k++;
      later(()=>{ d.textContent=''; later(show, 200); }, 800);
    };
    later(show, 700);
  }, span=>{ st.res.digits=span; st.onKey=null; later(()=>taskIntro(3), 700); });
}

function runRT(){
  const C=t().check, N=5, times=[];
  stage.innerHTML = `<button class="rt-zone" id="rt"><span class="rt-msg" id="rtMsg"></span><span class="rt-sub" id="rtSub"></span></button>`;
  const z=$('#rt'), msg=$('#rtMsg'), sub=$('#rtSub');
  let state='idle', goAt=0;
  const arm=()=>{
    state='wait'; z.className='rt-zone wait'; msg.textContent=C.wait; sub.textContent=C.attempt(times.length+1,N);
    later(()=>{ if(state!=='wait') return; state='go'; goAt=performance.now(); z.className='rt-zone go'; msg.textContent=C.tap; sfx.blip(); }, 1400+Math.random()*2200);
  };
  const press=()=>{
    if(state==='wait'){ // false start
      st.timers.forEach(clearTimeout); st.timers=[];
      state='early'; z.className='rt-zone early'; msg.textContent=C.early; sfx.bad(); haptic(40);
      later(arm, 1300); return;
    }
    if(state!=='go') return;
    const ms=Math.round(performance.now()-goAt); times.push(ms);
    state='shown'; z.className='rt-zone shown'; msg.textContent=`${ms} ${C.ms}`; sfx.ok(times.length); haptic(8);
    if(times.length<N) later(arm, 1100);
    else { const sorted=[...times].sort((a,b)=>a-b); st.res.rt=sorted[Math.floor(N/2)]; later(results, 1100); }
  };
  z.addEventListener('pointerdown', e=>{ e.preventDefault(); press(); });
  st.onKey=e=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); press(); } };
  arm();
}

// ---------- results ----------
function results(){
  const C=t().check, L=t(), p=S.profile, r=st.res;
  st.onKey=null; header(0);
  const years=eduYears(p.edu), pct=corsiPercentile(r.corsi, p.age, years), avg=corsiExpected(p.age, years);
  const entry={t:Date.now(), age:p.age, edu:p.edu, corsi:r.corsi, digits:r.digits, rt:r.rt, pct};
  S.checks=(S.checks||[]).concat(entry); save();
  stage.innerHTML = `
    <div class="check-result">
      <div class="eyebrow">${C.resultTitle}</div>
      <div class="pct-big"><span id="cPct">0</span><small>%</small></div>
      <p class="pct-text">${C.beat(pct)}</p>
      <p class="muted">${C.yourSpan(r.corsi)} ${C.groupAvg(fmtN(Math.round(avg*10)/10))}</p>
      <figure class="card age-chart"><figcaption>${C.chartTitle}</figcaption>${ageChart(p, years, r.corsi)}
        <div class="chart-legend"><span><i class="lg-you"></i>${C.chartYou}</span><span><i class="lg-avg"></i>${C.chartAvg}</span><span><i class="lg-band"></i>${C.chartBand}</span></div></figure>
      <div class="check-tiles">
        <div class="card"><div class="eyebrow">${C.digitsName}</div><p>${C.digitsRes(r.digits)}</p><p class="muted small">${C.digitsCtx}</p></div>
        <div class="card"><div class="eyebrow">${C.rtName}</div><p>${C.rtRes(r.rt)}</p><p class="muted small">${C.rtCtx}</p></div>
      </div>
      <p class="muted small disclaimer">${C.disclaimer} ${C.sources}: <a href="${CORSI.url}" target="_blank" rel="noopener">Corsi, 2024</a> · <a href="${RT_REF.url}" target="_blank" rel="noopener">Der &amp; Deary, 2006</a>.</p>
    </div>
    <div class="btn-row"><button class="btn wide" id="cShare">${shareSVG}${C.share}</button><button class="btn ghost wide" id="cDone">${C.done}</button></div>`;
  countUp($('#cPct'), pct, {duration:1000, onStep:s=>sfx.soft(s), onDone:()=>{ bump($('#cPct').parentElement,'land'); if(pct>=50){ sfx.record(); confetti(80); } else sfx.done(); }});
  $('#cShare').onclick=()=>{ sfx.tap(); shareCheck(entry); };
  $('#cDone').onclick=()=>{ leaveCheck(); goHome(); };
}

// Expected span by age for the user's education, ±1 residual SD band, and the user's dot
function ageChart(p, years, span){
  const L=t().check, W=320, H=190, m={l:34,r:12,t:12,b:30}, iw=W-m.l-m.r, ih=H-m.t-m.b;
  const a0=20, a1=90, y0=2, y1=8;
  const X=a=>m.l+(a-a0)/(a1-a0)*iw, Y=v=>m.t+ih-(v-y0)/(y1-y0)*ih;
  const ages=[]; for(let a=a0;a<=a1;a+=2) ages.push(a);
  const sd=CORSI.residualSd;
  const line=ages.map((a,i)=>`${i?'L':'M'}${X(a).toFixed(1)},${Y(corsiExpected(a,years)).toFixed(1)}`).join('');
  const band=ages.map((a,i)=>`${i?'L':'M'}${X(a).toFixed(1)},${Y(corsiExpected(a,years)+sd).toFixed(1)}`).join('')+
    ages.slice().reverse().map(a=>`L${X(a).toFixed(1)},${Y(corsiExpected(a,years)-sd).toFixed(1)}`).join('')+'Z';
  let grid=''; for(let v=y0; v<=y1; v+=2) grid+=`<line x1="${m.l}" x2="${W-m.r}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--grid)"/><text x="${m.l-8}" y="${Y(v)+4}" text-anchor="end">${v}</text>`;
  let xt=''; for(let a=20;a<=90;a+=10) xt+=`<text x="${X(a)}" y="${H-10}" text-anchor="middle">${a}</text>`;
  const ua=Math.min(a1,Math.max(a0,p.age)), uy=Math.min(y1,Math.max(y0,span));
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${L.chartTitle}">
    ${grid}${xt}
    <path d="${band}" fill="var(--d-space)" opacity=".14"/>
    <path d="${line}" fill="none" stroke="var(--d-space)" stroke-width="2" stroke-linecap="round"/>
    <line x1="${X(ua)}" x2="${X(ua)}" y1="${m.t}" y2="${m.t+ih}" stroke="var(--line-deep)" stroke-dasharray="3 3"/>
    <circle class="you-dot" cx="${X(ua)}" cy="${Y(uy)}" r="6.5" fill="var(--accent)" stroke="var(--surface)" stroke-width="2.5"/>
    <text x="${X(ua)+(ua>75?-10:10)}" y="${Y(uy)-10}" text-anchor="${ua>75?'end':'start'}" class="lbl">${L.chartYou} · ${span}</text>
  </svg>`;
}

// ---------- home card / progress history ----------
export function checkCardHTML(){
  const C=t().check, last=(S.checks||[]).slice(-1)[0];
  return `<section class="check-card ${last?'done':''}">
    <span class="tile-ic" style="--dc:var(--accent)">${brainSVG}</span>
    <div class="cc-body">
      <div class="eyebrow">${last?`${C.last} · ${fmtDate(last.t)}`:C.tag}</div>
      <h3>${C.name}</h3>
      <p>${last?C.pitchDone(last.pct):C.pitch}</p>
    </div>
    <button class="btn ${last?'ghost small':''}" id="checkBtn">${last?C.again:C.start}</button>
  </section>`;
}
export function checkHistoryHTML(){
  const C=t().check, list=(S.checks||[]).slice().reverse();
  if(!list.length) return '';
  return `<section class="card"><div class="card-head"><h3>${C.history}</h3></div>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>${C.colDate}</th><th>${C.colPct}</th><th>${C.colSpan}</th><th>${C.colDigits}</th><th>${C.colRt}</th></tr></thead>
    <tbody>${list.map(c=>`<tr><td>${fmtDate(c.t,{day:'numeric',month:'short',year:'numeric'})}</td><td>${c.pct} %</td><td>${c.corsi}</td><td>${c.digits}</td><td>${c.rt} ms</td></tr>`).join('')}</tbody></table></div></section>`;
}

const brainSVG = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4.5a3 3 0 0 0-5 2.2 3 3 0 0 0-1 5.3 3.2 3.2 0 0 0 2.5 4.8A3 3 0 0 0 9 19.5h.5V4.5z"/><path d="M15 4.5a3 3 0 0 1 5 2.2 3 3 0 0 1 1 5.3 3.2 3.2 0 0 1-2.5 4.8A3 3 0 0 1 15 19.5h-.5V4.5z"/></svg>';
const shareSVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3M7.5 7.5L12 3l4.5 4.5"/><path d="M5 12v6.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V12"/></svg>';
function taskIcon(id){ return icon(id,44); }
