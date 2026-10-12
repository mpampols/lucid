// Game engine: intro, countdown, timer, scoring, combos, results and daily summary
import { S, save, t } from './state.js';
import { $, fmtN, dayKey } from './utils.js';
import { sfx } from './sound.js';
import { icon, flameSVG, heartSVG, boltSVG, tabIcons } from './icons.js';
import { GAMES } from './games/index.js';
import { getDay, bumpStreak, currentStreak } from './daily.js';
import { confetti } from './confetti.js';
import { edge, haptic, countUp, burst, bump, reducedMotion } from './fx.js';
import { showView, goHome, goStats } from './nav.js';
import { shareDaily, challengeOutcome } from './share.js';

const stage = $('#stage'), play = $('#play');

let run = null;

// Daily game finished in the last run, so the home path can animate its check mark
let justCompleted = null;
export function takeJustCompleted(){ const id=justCompleted; justCompleted=null; return id; }

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
    <div class="intro-cta"><button class="btn wide" id="go">${L.start}</button></div>`;
  $('#go').onclick=countdown; $('#go').focus({preventScroll:true});
}

// 3 · 2 · 1 · Go!
function countdown(){
  if(!run || run.phase!=='intro') return;
  sfx.tap();
  if(reducedMotion()){ startRun(); return; }
  run.phase='countdown';
  const L=t(), steps=['3','2','1',L.go];
  stage.innerHTML='<div class="countdown" aria-live="assertive"><span id="cd"></span></div>';
  const cd=$('#cd');
  steps.forEach((s,i)=>{
    run.timers.push(setTimeout(()=>{
      if(!run || run.phase!=='countdown') return;
      cd.textContent=s; cd.classList.toggle('go', i===3); bump(cd,'in');
      if(i<3) sfx.count(); else sfx.go();
    }, i*520));
  });
  run.timers.push(setTimeout(()=>{ if(run && run.phase==='countdown') startRun(); }, steps.length*520));
}

function startRun(){
  const g=GAMES[run.id];
  (run.timers||[]).forEach(clearTimeout);
  Object.assign(run,{phase:'game', score:0, correct:0, wrong:0, combo:0, bestCombo:0, lives:g.lives??null, onKey:null, timers:[], lastTick:null});
  stage.innerHTML=''; stage.dataset.game=run.id;
  $('#track').style.visibility = g.time ? 'visible' : 'hidden';
  buildHud();
  run.cleanup = g.init(stage, api) || null;
  if(g.time){ run.total=g.time*1000; run.endAt=performance.now()+run.total; run.raf=requestAnimationFrame(loop); }
}

function loop(){
  if(!run||run.phase!=='game') return;
  const left=Math.max(0, run.endAt-performance.now());
  const fill=$('#fill'); fill.style.width=(left/run.total*100)+'%'; fill.classList.toggle('low', left<6000);
  $('#track').classList.toggle('urgent', left<5000 && left>0);
  const sec=Math.ceil(left/1000);
  if(sec<=5 && left>0 && sec!==run.lastTick){ run.lastTick=sec; sfx.tick(); }
  if(left<=0){ $('#track').classList.remove('urgent'); finish(); return; }
  run.raf=requestAnimationFrame(loop);
}

// ---------- HUD: lives, combo and score ----------
function buildHud(){
  $('#hud').innerHTML = `${run.lives!=null?'<span class="hearts" id="hHearts"></span>':''}<span class="combo" id="hCombo" hidden></span><span class="hud-score" id="hScore">0</span>`;
  drawHearts();
}
function drawHearts(lost){
  const h=$('#hHearts'); if(!h) return;
  h.innerHTML=[0,1,2].map(i=>heartSVG(i>=run.lives)).join('');
  if(lost!=null){ bump(h.children[run.lives],'break'); }
}
function drawCombo(){
  const c=$('#hCombo'); if(!c) return;
  if(run.combo>=3){ c.hidden=false; c.innerHTML=`${boltSVG}×${run.combo}`; bump(c,'pop'); }
  else c.hidden=true;
}
function drawScore(){ const s=$('#hScore'); if(!s) return; s.textContent=fmtN(run.score); bump(s,'pop'); }

function popPoints(p){ const el=document.createElement('div'); el.className='pts'; el.textContent='+'+p; stage.appendChild(el); setTimeout(()=>el.remove(),750); }

// API handed to each game
const api = {
  t,
  alive:()=>!!run && run.phase==='game',
  correct(p){
    if(!api.alive()) return;
    run.score+=p; run.correct++; run.combo++; run.bestCombo=Math.max(run.bestCombo,run.combo);
    sfx.ok(run.combo); edge('good'); haptic(8);
    drawScore(); drawCombo(); popPoints(p);
    if(run.combo>=5 && run.combo%5===0){
      const words=t().praise; burst(stage, words[Math.min(run.combo/5-1, words.length-1)]);
      setTimeout(()=>sfx.praise(),120);
    }
  },
  wrong(){
    if(!api.alive()) return false;
    run.wrong++; run.combo=0; sfx.bad(); edge('bad'); haptic([30,40,30]); drawCombo();
    if(run.lives!=null){
      run.lives--; drawHearts(true);
      if(run.lives<=0){ run.phase='ending'; setTimeout(()=>sfx.lose(),300); setTimeout(()=>finish(),1200); return false; }
    }
    return true;
  },
  later(fn,ms){ const id=setTimeout(()=>{ if(api.alive()) fn(); },ms); run.timers.push(id); },
  key(fn){ run.onKey=fn; }
};

function stopRun(){
  delete stage.dataset.game;
  if(!run) return;
  cancelAnimationFrame(run.raf); (run.timers||[]).forEach(clearTimeout); run.timers=[];
  if(run.cleanup) try{ run.cleanup(); }catch(e){}
  run.cleanup=null; run.onKey=null;
  $('#track').classList.remove('urgent');
}
export function abortRun(){ if(run && ['game','ending','countdown','summary'].includes(run.phase)){ stopRun(); run.phase='aborted'; } }

function finish(){
  if(!run || (run.phase!=='game' && run.phase!=='ending')) return;
  stopRun(); run.phase='result';
  const id=run.id, score=run.score, k=dayKey();
  const isBest = score>0 && score>(S.best[id]||0); if(isBest) S.best[id]=score;
  S.history.push({t:Date.now(), d:k, g:id, s:score, c:run.correct, w:run.wrong, daily:!!run.daily});
  let dayCompleted=false;
  if(run.daily){
    const day=getDay();
    if(!(id in day.games)){ day.games[id]=score; justCompleted=id; }
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
      <div class="score-big" id="rScore">0</div>
      <div class="muted" style="font-weight:700">${L.points}</div>
      <span class="badge" id="rBest" hidden>${flameSVG(16)} ${L.newBest}</span>
      <div class="res-stats">
        <div><b>${run.correct}</b><span>${L.hits}</span></div>
        <div><b>${run.wrong}</b><span>${L.misses}</span></div>
        ${run.bestCombo>=3?`<div><b>×${run.bestCombo}</b><span>${L.bestCombo}</span></div>`:''}
      </div>
    </div>
    <div class="btn-row">${buttons}</div>`;
  countUp($('#rScore'), run.score, {
    duration: Math.min(1200, 400+run.score*2),
    onStep: s=>sfx.soft(s),
    onDone: ()=>{
      bump($('#rScore'),'land');
      if(isBest){ const b=$('#rBest'); b.hidden=false; bump(b,'pop'); sfx.record(); confetti(70); }
      else sfx.done();
    }
  });
  const b1=$('#b1'), b2=$('#b2');
  b1.onclick=()=>{ sfx.tap(); if(run.daily && dayCompleted) openSummary(true); else if(run.daily && nextId) openGame(nextId,true); else openGame(run.id,false); };
  if(b2) b2.onclick=goHome;
  b1.focus({preventScroll:true});
}

export function openSummary(celebrate){
  abortRun(); run={phase:'summary', timers:[]}; showView('play');
  const L=t(), day=getDay(), total=day.plan.reduce((a,x)=>a+(day.games[x]||0),0), n=currentStreak(), outcome=challengeOutcome();
  const anim = celebrate && !reducedMotion();
  $('#track').style.visibility='hidden'; $('#hud').innerHTML='';
  stage.innerHTML = `
    <div class="result summary ${anim?'animate':''}">
      <span class="big-flame">${flameSVG(84)}</span>
      <h2 style="font-size:2rem">${L.dayDone}</h2>
      <span class="badge streak-badge" id="sStreak">${L.streak(n)}</span>
      <div class="score-big" style="margin-top:8px" id="sTotal">${anim?'0':fmtN(total)}</div>
      <div class="muted" style="font-weight:700">${L.dayTotal}</div>
      <ol class="sum-list">
        ${day.plan.map((id,i)=>`<li style="--i:${i}"><span class="tile-ic" style="--dc:var(--d-${GAMES[id].domain})">${icon(id,20)}</span><span>${L.games[id].name}</span><b>${fmtN(day.games[id]??0)}</b></li>`).join('')}
      </ol>
      ${outcome?`<p class="challenge-line">${outcome}</p>`:''}
      <p class="muted" style="max-width:32ch">${L.seeYou}</p>
    </div>
    <div class="btn-row"><button class="btn wide" id="bShare">${tabIcons.share}${L.shareResult}</button>
      <div class="row2"><button class="btn ghost" id="b1">${L.tabStats}</button><button class="btn ghost" id="b2">${L.home}</button></div></div>`;
  $('#bShare').onclick=()=>{ sfx.tap(); shareDaily(); };
  $('#b1').onclick=goStats; $('#b2').onclick=goHome;
  if(!anim){ if(celebrate){ sfx.fanfare(); confetti(140); } return; }
  // staged reveal: games pop in one by one, then the total counts up, then the streak
  day.plan.forEach((_,i)=>run.timers.push(setTimeout(()=>sfx.pop(), 350+i*220)));
  const after=350+day.plan.length*220;
  run.timers.push(setTimeout(()=>countUp($('#sTotal'), total, {duration:900, onStep:s=>sfx.soft(s), onDone:()=>{
    bump($('#sTotal'),'land'); bump($('#sStreak'),'pop'); sfx.fanfare(); confetti(140);
  }}), after));
}

// Leave the current game (when going back to home or progress)
export function leaveRun(){ abortRun(); run=null; }

// Global keyboard handling while playing
export function handleKey(e){
  if(e.key==='Escape' && !play.hidden){ goHome(); return; }
  if(run && run.phase==='game' && run.onKey){ run.onKey(e); return; }
  if(run && run.phase==='intro' && e.key==='Enter' && document.activeElement?.id!=='go'){ e.preventDefault(); countdown(); }
}
