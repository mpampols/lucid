import { S, t } from '../state.js';
import { $, fmtN } from '../utils.js';
import { sfx } from '../sound.js';
import { icon, checkSVG } from '../icons.js';
import { GAMES, ORDER } from '../games/index.js';
import { getDay, currentStreak } from '../daily.js';
import { openGame, openSummary } from '../engine.js';

const home = $('#home');

export function renderHome(){
  const L=t(), day=getDay(), plan=day.plan, nextId=plan.find(id=>!(id in day.games));
  const done=plan.filter(id=>id in day.games).length;
  const todayPts=Object.values(day.games).reduce((a,b)=>a+b,0);
  const trained=Object.values(S.days).filter(d=>d.done).length;
  const date=new Date().toLocaleDateString(L.locale,{weekday:'long',day:'numeric',month:'long'});
  const n=currentStreak();
  home.innerHTML = `
    <p class="lede">${L.tagline}</p>
    <section class="daily" aria-labelledby="dt">
      <div>
        <div class="eyebrow">${date}</div>
        <h2 id="dt">${day.done?L.doneTitle:L.today}</h2>
        <p class="muted">${day.done?L.doneSub:L.todaySub}</p>
      </div>
      <ol class="path">
        ${plan.map(id=>{ const isDone=id in day.games, cur=id===nextId;
          return `<li class="node-wrap"><span class="node ${isDone?'':cur?'cur':'todo'}" style="--dc:var(--d-${GAMES[id].domain})">${icon(id)}${isDone?`<span class="check">${checkSVG}</span>`:''}</span><span class="node-label">${L.games[id].name}</span></li>`; }).join('')}
      </ol>
      ${day.done ? `<button class="btn ghost wide" id="dailyBtn">${L.summary}</button>` : `<button class="btn wide" id="dailyBtn">${done?L.cont:L.start}</button>`}
    </section>
    <div class="stats-line">
      <span><b>${n}</b> ${L.streakWord(n)}</span>
      <span><b>${fmtN(todayPts)}</b> ${L.todayPts}</span>
      <span>${L.trained(trained).replace(/^(\d+)/,'<b>$1</b>')}</span>
    </div>
    <div class="sec-head"><h3>${L.allGames}</h3><p class="muted">${L.allSub}</p></div>
    <div class="games">
      ${ORDER.map(id=>{ const g=GAMES[id], b=S.best[id];
        return `<button class="game" data-g="${id}" style="--dc:var(--d-${g.domain})">
          <span class="tile-ic">${icon(id)}</span>
          <span><h4>${L.games[id].name}${g.isNew&&!b?`<span class="new">${L.isNew}</span>`:''}</h4><span class="dom">${L.domains[g.domain]}</span></span>
          <span class="best">${b?`${L.best}: <b>${fmtN(b)}</b>`:L.notPlayed}</span>
        </button>`; }).join('')}
    </div>
`;
  $('#dailyBtn').onclick = ()=>{ sfx.tap(); if(day.done) openSummary(false); else openGame(nextId,true); };
  home.querySelectorAll('.game').forEach(b=>b.onclick=()=>{ sfx.tap(); openGame(b.dataset.g,false); });
}
