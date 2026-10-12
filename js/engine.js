// Game engine: intro, timer, scoring, results and daily summary
import { S, save, t } from './state.js';
import { $, fmtN, dayKey } from './utils.js';
import { sfx } from './sound.js';
import { icon, flameSVG, heartSVG, tabIcons } from './icons.js';
import { GAMES } from './games/index.js';
import { getDay, bumpStreak, currentStreak } from './daily.js';
import { confetti } from './confetti.js';
import { showView, goHome, goStats } from './nav.js';
import { shareDaily, challengeOutcome } from './share.js';

const stage = $('#stage'), play = $('#play');

/* =========================================================
   Game engine
   ========================================================= */
let run = null;

export function openGame(id, daily){
  abortRun();
  run = {id, daily, phase:'intro', timers:[]};
  showView('play'); renderIntro();
}

function renderIntro(){
  const L=t(), g=GAMES[run.id], info=L.games[run.id];
  $('#track').style.visibility='hidden'; $('#hud').innerHTML='';
  $('#quit').setAttribute('aria-label',L.quit);
  let label=L.freePlay;
  if(run.daily){ const plan=getDay().plan; label=L.step(plan.indexOf(run.id)+1, plan.length); }
  stage.innerHTML = `
    <div class="intro" style="--dc:var(--d-${g.domain})">
      <span class="tile-ic">${icon(run.id,44)}</span>
      <div class="eyebrow">${label} · ${L.domains[g.domain]}</div>
      <h2>${info.name}</h2>
      <p>${info.desc}</p>
      <p class="muted">${g.time?L.secs(g.time):L.lives}</p>
      <span class="why"><b>${L.trains}:</b> ${info.why}</span>
    </div>
    <button class="btn wide" id="go">${L.start}</button>`;
  $('#go').onclick=startRun; $('#go').focus({preventScroll:true});
}

function startRun(){
  const g=GAMES[run.id];
  Object.assign(run,{phase:'game', score:0, correct:0, wrong:0, lives:g.lives??null, onKey:null, timers:[], lastTick:null});
  stage.innerHTML='';
  $('#track').style.visibility = g.time ? 'visible' : 'hidden';
  sfx.tap();
  hud();
  run.cleanup = g.init(stage, api) || null;
  if(g.time){ run.total=g.time*1000; run.endAt=performance.now()+run.total; run.raf=requestAnimationFrame(loop); }
}

function loop(){
  if(!run||run.phase!=='game') return;
  const left=Math.max(0, run.endAt-performance.now());
  const fill=$('#fill'); fill.style.width=(left/run.total*100)+'%'; fill.classList.toggle('low', left<6000);
  const sec=Math.ceil(left/1000);
  if(sec<=5 && left>0 && sec!==run.lastTick){ run.lastTick=sec; sfx.tick(); }
  if(left<=0){ finish(); return; }
  run.raf=requestAnimationFrame(loop);
}

function hud(){
  const h=$('#hud'); if(!run) return;
  const hearts = run.lives!=null ? `<span class="hearts">${[0,1,2].map(i=>heartSVG(i>=run.lives)).join('')}</span>` : '';
  h.innerHTML = hearts + `<span>${run.score}</span>`;
}

function popPoints(p){ const el=document.createElement('div'); el.className='pts'; el.textContent='+'+p; stage.appendChild(el); setTimeout(()=>el.remove(),750); }

const api = {
  t,
  alive:()=>!!run && run.phase==='game',
  correct(p){ if(!api.alive()) return; run.score+=p; run.correct++; sfx.ok(); hud(); popPoints(p); },
  wrong(){ if(!api.alive()) return false; run.wrong++; sfx.bad();
    if(run.lives!=null){ run.lives--; hud(); if(run.lives<=0){ run.phase='ending'; setTimeout(()=>finish(),1100); return false; } }
    return true; },
  later(fn,ms){ const id=setTimeout(()=>{ if(api.alive()) fn(); },ms); run.timers.push(id); },
  key(fn){ run.onKey=fn; }
};

function stopRun(){
  if(!run) return;
  cancelAnimationFrame(run.raf); (run.timers||[]).forEach(clearTimeout); run.timers=[];
  if(run.cleanup) try{ run.cleanup(); }catch(e){}
  run.cleanup=null; run.onKey=null;
}
export function abortRun(){ if(run && (run.phase==='game'||run.phase==='ending')){ stopRun(); run.phase='aborted'; } }

function finish(){
  if(!run || (run.phase!=='game' && run.phase!=='ending')) return;
  stopRun(); run.phase='result';
  const id=run.id, score=run.score, k=dayKey();
  const isBest = score>0 && score>(S.best[id]||0); if(isBest) S.best[id]=score;
  S.history.push({t:Date.now(), d:k, g:id, s:score, c:run.correct, w:run.wrong, daily:!!run.daily});
  let dayCompleted=false;
  if(run.daily){
    const day=getDay();
    if(!(id in day.games)) day.games[id]=score;
    if(!day.done && day.plan.every(x=>x in day.games)){ day.done=true; day.total=day.plan.reduce((a,x)=>a+day.games[x],0); bumpStreak(); dayCompleted=true; }
  }
  save();
  renderResult(isBest, dayCompleted);
}

function renderResult(isBest, dayCompleted){
  const L=t(), info=L.games[run.id];
  $('#track').style.visibility='hidden'; $('#hud').innerHTML='';
  const day=getDay(), nextId=day.plan.find(x=>!(x in day.games));
  let buttons;
  if(run.daily && dayCompleted) buttons=`<button class="btn wide" id="b1">${L.seeSummary}</button>`;
  else if(run.daily && nextId) buttons=`<button class="btn wide" id="b1">${L.next}</button><button class="btn ghost wide" id="b2">${L.home}</button>`;
  else buttons=`<button class="btn wide" id="b1">${L.again}</button><button class="btn ghost wide" id="b2">${L.home}</button>`;
  stage.innerHTML = `
    <div class="result">
      <div class="eyebrow">${info.name}</div>
      <div class="score-big">${fmtN(run.score)}</div>
      <div class="muted" style="font-weight:700">${L.points}</div>
      ${isBest?`<span class="badge">${flameSVG(16)} ${L.newBest}</span>`:''}
      <div class="res-stats"><div><b>${run.correct}</b><span>${L.hits}</span></div><div><b>${run.wrong}</b><span>${L.misses}</span></div></div>
    </div>
    <div class="btn-row">${buttons}</div>`;
  sfx.done();
  if(isBest) confetti(60);
  const b1=$('#b1'), b2=$('#b2');
  b1.onclick=()=>{ sfx.tap(); if(run.daily && dayCompleted) openSummary(true); else if(run.daily && nextId) openGame(nextId,true); else openGame(run.id,false); };
  if(b2) b2.onclick=goHome;
  b1.focus({preventScroll:true});
}

export function openSummary(celebrate){
  abortRun(); run={phase:'summary', timers:[]}; showView('play');
  const L=t(), day=getDay(), total=day.plan.reduce((a,x)=>a+(day.games[x]||0),0), n=currentStreak(), outcome=challengeOutcome();
  $('#track').style.visibility='hidden'; $('#hud').innerHTML='';
  stage.innerHTML = `
    <div class="result">
      <span class="big-flame">${flameSVG(84)}</span>
      <h2 style="font-size:2rem">${L.dayDone}</h2>
      <span class="badge">${L.streak(n)}</span>
      <div class="score-big" style="margin-top:8px">${fmtN(total)}</div>
      <div class="muted" style="font-weight:700">${L.dayTotal}</div>
      <ol class="sum-list">
        ${day.plan.map(id=>`<li><span class="tile-ic" style="--dc:var(--d-${GAMES[id].domain})">${icon(id,20)}</span><span>${L.games[id].name}</span><b>${fmtN(day.games[id]??0)}</b></li>`).join('')}
      </ol>
      ${outcome?`<p class="challenge-line">${outcome}</p>`:''}
      <p class="muted" style="max-width:32ch">${L.seeYou}</p>
    </div>
    <div class="btn-row"><button class="btn wide" id="bShare">${tabIcons.share}${L.shareResult}</button>
      <div class="row2"><button class="btn ghost" id="b1">${L.tabStats}</button><button class="btn ghost" id="b2">${L.home}</button></div></div>`;
  $('#bShare').onclick=()=>{ sfx.tap(); shareDaily(); };
  $('#b1').onclick=goStats; $('#b2').onclick=goHome;
  if(celebrate){ sfx.fanfare(); confetti(140); }
}

// Leave the current game (when going back to home or progress)
export function leaveRun(){ abortRun(); run=null; }

// Global keyboard handling while playing
export function handleKey(e){
  if(e.key==='Escape' && !play.hidden){ goHome(); return; }
  if(run && run.phase==='game' && run.onKey){ run.onKey(e); return; }
  if(run && run.phase==='intro' && e.key==='Enter' && document.activeElement?.id!=='go'){ e.preventDefault(); startRun(); }
}
