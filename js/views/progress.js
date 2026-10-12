import { S, t, setState } from '../state.js';
import { Store } from '../store.js';
import { $, esc, fmtN, fmtDate, toast, dayKey } from '../utils.js';
import { GAMES, ORDER, DOMAINS } from '../games/index.js';
import { icon, tabIcons } from '../icons.js';
import { currentStreak } from '../daily.js';
import { goHome } from '../nav.js';
import { renderTop } from './topbar.js';

const statsView = $('#stats');

/* =========================================================
   Progreso
   ========================================================= */
let statsGame=null, statsUI={restore:false, confirm:false};

function gameStats(id){
  const h=S.history.filter(e=>e.g===id), n=h.length;
  const scores=h.map(e=>e.s);
  const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
  const last5=scores.slice(-5);
  let trend=null;
  if(n>=4){ const k=Math.min(5,Math.floor(n/2)); const a=avg(scores.slice(-k)), b=avg(scores.slice(-2*k,-k)); trend=b>0?(a-b)/b:null; }
  return {n, best:S.best[id]||0, avg5:n?Math.round(avg(last5)):null, trend, entries:h};
}
function trendHTML(tr){
  if(tr==null) return '<span class="na">—</span>';
  const p=Math.round(tr*100);
  if(Math.abs(p)<3) return `<span class="trend flat">= ${Math.abs(p)} %</span>`;
  return p>0 ? `<span class="trend up">▲ ${p} %</span>` : `<span class="trend down">▼ ${Math.abs(p)} %</span>`;
}

export function renderStats(){
  const L=t(), H=S.history;
  const completed=Object.values(S.days).filter(d=>d.done).length;
  if(!H.length){
    statsView.innerHTML = `<div class="prog"><div class="card empty-prog">
      <span class="tile-ic" style="--dc:var(--accent)">${tabIcons.stats}</span>
      <h2>${L.progTitle}</h2><p>${L.emptyStats}</p>
      <button class="btn" id="goTrain">${L.goTrain}</button></div>${dataCardHTML()}</div>`;
    $('#goTrain').onclick=goHome; bindDataCard(); return;
  }
  // juego seleccionado por defecto: el último jugado
  if(!statsGame || !GAMES[statsGame]) statsGame=H[H.length-1].g;

  statsView.innerHTML = `<div class="prog">
    <div class="tiles4">
      <div class="stat hot"><b>${currentStreak()}</b><span>${L.curStreak}</span></div>
      <div class="stat"><b>${S.streak.best||0}</b><span>${L.bestStreak}</span></div>
      <div class="stat"><b>${fmtN(completed)}</b><span>${L.sessions}</span></div>
      <div class="stat"><b>${fmtN(H.length)}</b><span>${L.plays}</span></div>
    </div>

    <section class="card">
      <div class="card-head"><h3>${L.activity}</h3><span class="muted">${L.activitySub}</span></div>
      <div class="chart" id="heatBox">${heatHTML()}</div>
      <div class="heat-key">${L.lessK} <span class="hc"></span><span class="hc l1"></span><span class="hc l2"></span><span class="hc l3"></span><span class="hc l4"></span> ${L.moreK}</div>
    </section>

    <section class="card">
      <div class="card-head"><h3>${L.evolution}</h3></div>
      <div class="chips" role="group" aria-label="${L.colGame}">
        ${ORDER.map(id=>{ const n=H.filter(e=>e.g===id).length;
          return `<button class="chip" data-g="${id}" aria-pressed="${id===statsGame}" ${n?'':'disabled'} style="--dc:var(--d-${GAMES[id].domain})"><span class="dot">${icon(id,15)}</span>${L.games[id].name}</button>`; }).join('')}
      </div>
      <div class="chart" id="lineBox"></div>
      <div class="chart-foot" id="lineFoot"></div>
    </section>

    <section class="card">
      <div class="card-head"><h3>${L.perGame}</h3><span class="muted" style="font-size:.85rem">${L.trendNote}</span></div>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>${L.colGame}</th><th>${L.colPlays}</th><th>${L.colBest}</th><th>${L.colAvg}</th><th>${L.colTrend}</th></tr></thead>
        <tbody>${ORDER.map(id=>{ const st=gameStats(id);
          return `<tr><td><span class="gname"><span class="dot" style="--dc:var(--d-${GAMES[id].domain})">${icon(id,14)}</span>${L.games[id].name}</span></td>
            <td>${st.n||'<span class="na">0</span>'}</td><td>${st.best?fmtN(st.best):'<span class="na">—</span>'}</td>
            <td>${st.avg5!=null?fmtN(st.avg5):'<span class="na">—</span>'}</td><td>${trendHTML(st.trend)}</td></tr>`; }).join('')}
        </tbody></table></div>
    </section>

    <section class="card">
      <div class="card-head"><h3>${L.byDomain}</h3></div>
      <p class="muted" style="font-size:.9rem;margin:-6px 0 14px">${L.byDomainSub}</p>
      <div class="bars">${domainBarsHTML()}</div>
    </section>

    ${dataCardHTML()}
  </div>`;

  statsView.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{ statsGame=c.dataset.g; statsView.querySelectorAll('.chip').forEach(x=>x.setAttribute('aria-pressed', x===c)); drawLine(); });
  bindHeatTips(); drawLine(); bindDataCard();
}

// --- mapa de actividad ---
function heatHTML(){
  const L=t(), counts={};
  S.history.forEach(e=>{ counts[e.d]=(counts[e.d]||0)+1; });
  const today=new Date(); today.setHours(12,0,0,0);
  const dow=(today.getDay()+6)%7; // lunes = 0
  const start=new Date(today); start.setDate(today.getDate()-dow-15*7);
  const tk=dayKey(today);
  let html='<span></span>', prevMonth=-1, lastLbl=-9;
  for(let w=0; w<16; w++){
    const d=new Date(start); d.setDate(start.getDate()+w*7);
    const m=d.getMonth();
    const show = m!==prevMonth && w<15 && w-lastLbl>=3;
    if(show) lastLbl=w;
    html+=`<span class="ml">${show ? d.toLocaleDateString(L.locale,{month:'short'}).replace('.','') : ''}</span>`;
    prevMonth=m;
  }
  for(let r=0; r<7; r++){
    const ld=new Date(start); ld.setDate(start.getDate()+r);
    html+=`<span class="dl">${r%2===0 ? ld.toLocaleDateString(L.locale,{weekday:'narrow'}) : ''}</span>`;
    for(let w=0; w<16; w++){
      const d=new Date(start); d.setDate(start.getDate()+w*7+r);
      const k=dayKey(d);
      if(d>today){ html+='<span class="hc fut"></span>'; continue; }
      const c=counts[k]||0, lvl=c===0?'':c<=2?'l1':c<=4?'l2':c<=7?'l3':'l4';
      html+=`<span class="hc ${lvl} ${k===tk?'today':''}" data-k="${k}" data-c="${c}"></span>`;
    }
  }
  return `<div class="heat" role="img" aria-label="${L.activity}">${html}</div>`;
}
function bindHeatTips(){
  const box=$('#heatBox'), L=t(); let tip=null;
  box.querySelectorAll('.hc[data-k]').forEach(c=>{
    c.addEventListener('pointerenter',()=>{
      if(!tip){ tip=document.createElement('div'); tip.className='tip'; box.appendChild(tip); }
      const day=S.days[c.dataset.k];
      tip.textContent=L.dayTip(fmtDate(c.dataset.k+'T12:00:00',{weekday:'short',day:'numeric',month:'short'}), +c.dataset.c, day&&day.done);
      const br=box.getBoundingClientRect(), cr=c.getBoundingClientRect();
      const x=Math.min(Math.max(cr.left-br.left+cr.width/2, 90), br.width-90);
      tip.style.left=x+'px'; tip.style.top=(cr.top-br.top)+'px'; tip.hidden=false;
    });
    c.addEventListener('pointerleave',()=>{ if(tip) tip.hidden=true; });
  });
}

// --- evolución por juego ---
function niceStep(x){ const p=Math.pow(10,Math.floor(Math.log10(x))), f=x/p; return (f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*p; }
export function drawLine(){
  const box=$('#lineBox'), foot=$('#lineFoot'); if(!box) return;
  const L=t(), st=gameStats(statsGame), name=L.games[statsGame].name;
  const pts=st.entries.slice(-30);
  if(pts.length<2){
    box.innerHTML=`<div class="chart-empty">${L.evoEmpty(name)}</div>`;
    foot.innerHTML = pts.length ? `<span>${L.record}: <b>${fmtN(st.best)}</b></span>` : '';
    return;
  }
  const W=Math.max(280, box.clientWidth), H=220, m={l:40,r:14,t:22,b:26}, iw=W-m.l-m.r, ih=H-m.t-m.b;
  const maxRaw=Math.max(st.best, ...pts.map(p=>p.s), 10), step=niceStep(maxRaw/4), maxV=step*Math.ceil(maxRaw/step);
  const X=i=>m.l + i*iw/(pts.length-1), Y=v=>m.t+ih-v/maxV*ih;
  let g='';
  for(let v=0; v<=maxV+1e-9; v+=step){ g+=`<line x1="${m.l}" x2="${W-m.r}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--grid)" stroke-width="1"/><text x="${m.l-8}" y="${Y(v)+4}" text-anchor="end">${v>=1000?(v/1000)+'K':v}</text>`; }
  const line=pts.map((p,i)=>`${i?'L':'M'}${X(i).toFixed(1)},${Y(p.s).toFixed(1)}`).join('');
  const area=`${line}L${X(pts.length-1)},${Y(0)}L${X(0)},${Y(0)}Z`;
  const yb=Y(st.best);
  const dots = pts.length<=20 ? pts.map((p,i)=>`<circle cx="${X(i)}" cy="${Y(p.s)}" r="3.5" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"/>`).join('') : '';
  const li=pts.length-1, lp=pts[li];
  box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${L.evolution}: ${esc(name)}">
    ${g}
    <line x1="${m.l}" x2="${W-m.r}" y1="${yb}" y2="${yb}" stroke="var(--muted)" stroke-width="1" stroke-dasharray="4 4"/>
    <text x="${m.l+6}" y="${yb-6}" class="lbl">${L.record} ${fmtN(st.best)}</text>
    <path d="${area}" fill="var(--accent)" opacity=".1"/>
    <path d="${line}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}
    <circle cx="${X(li)}" cy="${Y(lp.s)}" r="5.5" fill="var(--accent)" stroke="var(--surface)" stroke-width="2.5"/>
    <text x="${X(0)}" y="${H-6}" text-anchor="start">${fmtDate(pts[0].t)}</text>
    <text x="${X(li)}" y="${H-6}" text-anchor="end">${fmtDate(lp.t)}</text>
    <line id="xh" x1="0" x2="0" y1="${m.t}" y2="${m.t+ih}" stroke="var(--line-deep)" stroke-width="1" visibility="hidden"/>
    <circle id="xd" r="6" fill="var(--accent)" stroke="var(--surface)" stroke-width="2.5" visibility="hidden"/>
    <rect id="hit" x="${m.l-10}" y="0" width="${iw+20}" height="${H}" fill="transparent"/>
  </svg><div class="tip" id="ltip" hidden></div>`;
  const svg=box.querySelector('svg'), xh=$('#xh',box), xd=$('#xd',box), tip=$('#ltip',box);
  const move=e=>{
    const r=svg.getBoundingClientRect(), px=(e.clientX-r.left)*(W/r.width);
    const i=Math.max(0,Math.min(li,Math.round((px-m.l)/iw*li))), p=pts[i];
    xh.setAttribute('x1',X(i)); xh.setAttribute('x2',X(i)); xh.setAttribute('visibility','visible');
    xd.setAttribute('cx',X(i)); xd.setAttribute('cy',Y(p.s)); xd.setAttribute('visibility','visible');
    tip.innerHTML=`${fmtDate(p.t,{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})} · <b>${fmtN(p.s)}</b> ${L.points}`;
    const sx=X(i)*r.width/W; tip.style.left=Math.min(Math.max(sx,90),r.width-90)+'px'; tip.style.top=(Y(p.s)*r.height/H)+'px'; tip.hidden=false;
  };
  const leave=()=>{ xh.setAttribute('visibility','hidden'); xd.setAttribute('visibility','hidden'); tip.hidden=true; };
  const hit=$('#hit',box); hit.addEventListener('pointermove',move); hit.addEventListener('pointerdown',move); hit.addEventListener('pointerleave',leave);
  foot.innerHTML = `<span>${L.lastPlay}: <b>${fmtN(lp.s)}</b></span><span>${L.avg5}: <b>${fmtN(st.avg5)}</b></span><span>${L.record}: <b>${fmtN(st.best)}</b></span><span>${L.trendLbl}: ${trendHTML(st.trend)}</span>`;
}

// --- reparto por área ---
function domainBarsHTML(){
  const L=t(), c={}; DOMAINS.forEach(d=>c[d]=0);
  S.history.forEach(e=>{ const g=GAMES[e.g]; if(g) c[g.domain]++; });
  const max=Math.max(1,...Object.values(c));
  return DOMAINS.slice().sort((a,b)=>c[b]-c[a]).map(d=>`<div class="bar-row"><span class="bn">${L.domains[d]}</span><span class="bar-track bar-base">${c[d]?`<span class="bar-fill" style="width:${c[d]/max*100}%"></span>`:''}</span><span class="bv">${c[d]}</span></div>`).join('');
}

// --- tus datos ---
function dataCardHTML(){
  const L=t();
  return `<section class="card" id="dataCard">
    <div class="card-head"><h3>${L.data}</h3></div>
    <p class="storage-note"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>${L.dataNote}</p>
    <div class="data-actions">
      <button class="btn ghost small" id="copyBk">${L.copyBackup}</button>
      <button class="btn ghost small" id="openRestore" aria-expanded="${statsUI.restore}">${L.restore}</button>
    </div>
    <div class="restore" id="fallbackBox" hidden><textarea id="fallbackTxt" readonly aria-label="${L.copyBackup}"></textarea></div>
    <div class="restore" id="restoreBox" ${statsUI.restore?'':'hidden'}>
      <textarea id="restoreTxt" placeholder="${L.restoreHint}" aria-label="${L.restore}"></textarea>
      <div class="row"><button class="btn small" id="doRestore">${L.restoreBtn}</button>
      <label class="file-lbl">${L.chooseFile}<input type="file" id="restoreFile" accept=".json,application/json,text/plain"></label></div>
    </div>
    <div class="data-actions"><button class="btn ghost small" id="askReset" style="color:var(--bad)">${L.reset}</button></div>
    <div class="confirm" id="confirmBox" hidden>
      <p>${L.resetConfirm}</p>
      <div class="row"><button class="btn danger small" id="doReset">${L.resetYes}</button><button class="btn ghost small" id="noReset">${L.cancel}</button></div>
    </div>
  </section>`;
}
function bindDataCard(){
  const L=t();
  $('#copyBk').onclick=()=>{
    const txt=Store.exportText(S);
    const fallback=()=>{ const b=$('#fallbackBox'), ta=$('#fallbackTxt'); b.hidden=false; ta.value=txt; ta.focus(); ta.select(); toast(L.copyFail); };
    try{ navigator.clipboard.writeText(txt).then(()=>toast(L.copied), fallback); }catch(e){ fallback(); }
  };
  $('#openRestore').onclick=()=>{ statsUI.restore=!statsUI.restore; $('#restoreBox').hidden=!statsUI.restore; $('#openRestore').setAttribute('aria-expanded',statsUI.restore); if(statsUI.restore) $('#restoreTxt').focus(); };
  const apply=text=>{
    const s=Store.parseBackup(text);
    if(!s){ toast(L.badBackup); return; }
    setState(s); statsUI.restore=false; renderTop(); renderStats(); toast(t().restored);
  };
  $('#doRestore').onclick=()=>apply($('#restoreTxt').value);
  $('#restoreFile').onchange=e=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=()=>apply(String(r.result)); r.readAsText(f); };
  $('#askReset').onclick=()=>{ $('#confirmBox').hidden=false; $('#noReset').focus(); };
  $('#noReset').onclick=()=>{ $('#confirmBox').hidden=true; };
  $('#doReset').onclick=()=>{ setState(Store.reset(S)); statsGame=null; renderTop(); renderStats(); toast(t().resetDone); };
}
