// Sharing: daily result (Wordle-style text + image card), overall progress,
// and challenge links (?reto=<score>&d=<day number>).
import { S, t, save } from './state.js';
import { $, dayKey, fmtN, toast, esc } from './utils.js';
import { GAMES, DOMAINS } from './games/index.js';
import { getDay, currentStreak } from './daily.js';
import { SITE_URL, LAUNCH_DAY } from './config.js';
import { drawDailyCard, drawProgressCard } from './share-cards.js';

// ---------- daily numbering ----------
export function dayNumber(key = dayKey()){
  const a = Date.UTC(...LAUNCH_DAY.split('-').map((v,i)=>i===1?v-1:+v));
  const b = Date.UTC(...key.split('-').map((v,i)=>i===1?v-1:+v));
  return Math.round((b-a)/864e5)+1;
}

// ---------- daily result data ----------
// Each game gets a 1–5 rating comparing today's score with the personal best
// *before* today's play, so the grid says how you did without revealing raw scores.
function rateGame(id, score, key){
  const entry = S.history.find(e=>e.g===id && e.d===key && e.daily);
  const before = S.history.filter(e=>e.g===id && (!entry || e.t<entry.t)).map(e=>e.s);
  if(!before.length) return {rating:3, tag:'first'};
  const prev = Math.max(...before);
  if(score>prev) return {rating:5, tag:'record'};
  const r = prev ? score/prev : 1;
  return {rating: r>=.85?4 : r>=.65?3 : r>=.4?2 : 1, tag:null};
}

export function dailyResult(){
  const key=dayKey(), day=getDay();
  const games = day.plan.map(id=>({id, score:day.games[id]??0, ...rateGame(id, day.games[id]??0, key)}));
  const total = games.reduce((a,g)=>a+g.score,0);
  const avg = games.reduce((a,g)=>a+g.rating,0)/games.length;
  const tier = avg>=4.5?4 : avg>=3.5?3 : avg>=2.5?2 : avg>=1.5?1 : 0;
  return {key, num:dayNumber(key), games, total, tier, streak:currentStreak()};
}

export function challengeURL(total, num){ return `${SITE_URL}?reto=${total}&d=${num}`; }

function dailyText(r){
  const L=t();
  const lines = [`Lúcid #${r.num} · ${L.tiers[r.tier]}`];
  r.games.forEach(g=>{
    const bar='🟧'.repeat(g.rating)+'⬜'.repeat(5-g.rating);
    lines.push(`${bar} ${L.games[g.id].name}${g.tag==='record'?' ⭐':g.tag==='first'?' ✨':''}`);
  });
  lines.push(`${fmtN(r.total)} ${L.pointsWord}${r.streak?` · 🔥 ${r.streak}`:''}`);
  lines.push(`${L.beatMe} ${challengeURL(r.total, r.num)}`);
  return lines.join('\n');
}

// ---------- overall progress data ----------
export function progressData(){
  const counts={}; DOMAINS.forEach(d=>counts[d]=0);
  S.history.forEach(e=>{ const g=GAMES[e.g]; if(g) counts[g.domain]++; });
  const top = DOMAINS.slice().sort((a,b)=>counts[b]-counts[a])[0];
  const perDay={}; S.history.forEach(e=>{ perDay[e.d]=(perDay[e.d]||0)+1; });
  return {
    streak:currentStreak(), best:S.streak.best||0,
    trained:Object.values(S.days).filter(d=>d.done).length,
    plays:S.history.length, topDomain:counts[top]?top:null, perDay
  };
}

function progressText(p){
  const L=t();
  return [
    `${L.myBrain} 🧠`,
    `🔥 ${L.streakLine(p.streak, p.best)}`,
    `📅 ${L.trainedLine(p.trained, p.plays)}`,
    ...(p.topDomain?[`💪 ${L.topArea}: ${L.domains[p.topDomain]}`]:[]),
    `${L.trainFree} ${SITE_URL}`
  ].join('\n');
}

// ---------- public entry points ----------
export function shareDaily(){
  const r=dailyResult();
  openShareSheet({ text:dailyText(r), url:challengeURL(r.total,r.num), filename:`lucid-${r.num}.png`, draw:()=>drawDailyCard(r) });
}
export function shareProgress(){
  const p=progressData();
  openShareSheet({ text:progressText(p), url:SITE_URL, filename:'lucid-progress.png', draw:()=>drawProgressCard(p) });
}

// ---------- share sheet ----------
let sheet=null, blobURL=null;

function closeSheet(){
  if(!sheet) return;
  sheet.remove(); sheet=null;
  if(blobURL){ URL.revokeObjectURL(blobURL); blobURL=null; }
  document.removeEventListener('keydown', onSheetKey, true);
}
function onSheetKey(e){ if(e.key==='Escape'){ e.stopPropagation(); e.preventDefault(); closeSheet(); } }

function copyText(text){
  const L=t();
  const fallback=()=>{ const ta=sheet?.querySelector('.share-text'); if(ta){ ta.focus(); ta.select(); } };
  try{ navigator.clipboard.writeText(text).then(()=>toast(L.textCopied), fallback); }catch(e){ fallback(); }
}

function openShareSheet({text, url, filename, draw}){
  closeSheet();
  const L=t(), enc=encodeURIComponent;
  sheet=document.createElement('div');
  sheet.className='share-backdrop';
  sheet.innerHTML=`<div class="share-sheet" role="dialog" aria-modal="true" aria-labelledby="shareTtl">
    <div class="share-head"><h3 id="shareTtl">${L.shareTitle}</h3>
      <button class="icon-btn" data-act="close" aria-label="${L.close}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
    <div class="share-preview"><div class="share-loading"></div></div>
    <textarea class="share-text" readonly rows="4" aria-label="${L.copyText}">${esc(text)}</textarea>
    <div class="share-actions">
      ${navigator.share?`<button class="btn wide" data-act="native">${L.share}</button>`:''}
      <div class="share-grid">
        <a class="share-chip" target="_blank" rel="noopener" href="https://wa.me/?text=${enc(text)}">WhatsApp</a>
        <a class="share-chip" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text=${enc(text)}">X</a>
        <a class="share-chip" target="_blank" rel="noopener" href="https://t.me/share/url?url=${enc(url)}&text=${enc(text.replace(url,'').trim())}">Telegram</a>
      </div>
      <div class="share-grid two">
        <button class="btn ghost small" data-act="copy">${L.copyText}</button>
        <button class="btn ghost small" data-act="download" disabled>${L.downloadImg}</button>
      </div>
    </div>
  </div>`;
  document.body.appendChild(sheet);
  document.addEventListener('keydown', onSheetKey, true);
  sheet.addEventListener('click', e=>{ if(e.target===sheet) closeSheet(); });

  let file=null;
  const act = async a=>{
    if(a==='close') return closeSheet();
    if(a==='copy') return copyText(text);
    if(a==='download' && blobURL){ const l=document.createElement('a'); l.href=blobURL; l.download=filename; document.body.appendChild(l); l.click(); l.remove(); return; }
    if(a==='native'){
      try{
        if(file && navigator.canShare?.({files:[file]})) await navigator.share({files:[file], text});
        else await navigator.share({text});
      }catch(e){ /* user cancelled */ }
    }
  };
  sheet.querySelectorAll('[data-act]').forEach(b=>b.addEventListener('click',()=>act(b.dataset.act)));
  sheet.querySelector('[data-act="close"]').focus();

  draw().then(blob=>{
    if(!sheet || !blob) throw 0;
    blobURL=URL.createObjectURL(blob);
    file=new File([blob], filename, {type:'image/png'});
    sheet.querySelector('.share-preview').innerHTML=`<img src="${blobURL}" alt="">`;
    sheet.querySelector('[data-act="download"]').disabled=false;
  }).catch(()=>{ if(sheet) sheet.querySelector('.share-preview').innerHTML=`<p class="muted">${L.imgFail}</p>`; });
}

// ---------- challenges ----------
// Read ?reto=<score>&d=<day> once, store it and clean the URL.
export function captureChallenge(){
  try{
    const q=new URLSearchParams(location.search);
    const score=parseInt(q.get('reto'),10), num=parseInt(q.get('d'),10);
    if(score>0 && num>0){
      S.challenge={score, num}; save();
      history.replaceState(null,'',location.pathname+location.hash);
    }
  }catch(e){}
}

// Banner for the home screen (null when there's nothing to show)
export function challengeBanner(){
  const c=S.challenge; if(!c) return null;
  const L=t(), today=dayNumber(), day=getDay();
  if(c.num!==today){
    if(c.seen){ delete S.challenge; save(); return null; }
    c.seen=true; save();
    return L.challengeOld(c.num);
  }
  if(!day.done) return L.challengeToday(fmtN(c.score));
  return challengeOutcome();
}

// Outcome line for the daily summary
export function challengeOutcome(){
  const c=S.challenge; if(!c || c.num!==dayNumber()) return null;
  const L=t(), day=getDay(); if(!day.done) return null;
  const total=day.plan.reduce((a,x)=>a+(day.games[x]||0),0);
  if(total>c.score) return L.challengeWon(fmtN(total), fmtN(c.score));
  if(total===c.score) return L.challengeTie(fmtN(total));
  return L.challengeLost(fmtN(c.score-total));
}
