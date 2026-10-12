import { S, t } from '../state.js';
import { $, fmtN } from '../utils.js';
import { sfx } from '../sound.js';
import { icon, checkSVG, tabIcons } from '../icons.js';
import { shareDaily, challengeBanner, dayNumber } from '../share.js';
import { GAMES, ORDER } from '../games/index.js';
import { getDay, currentStreak } from '../daily.js';
import { openGame, openSummary, takeJustCompleted } from '../engine.js';
import { openCheck, checkCardHTML } from '../check.js';

const home = $('#home');

export function renderHome(){
  const L=t(), day=getDay(), plan=day.plan, nextId=plan.find(id=>!(id in day.games));
  const done=plan.filter(id=>id in day.games).length;
  const todayPts=Object.values(day.games).reduce((a,b)=>a+b,0);
  const trained=Object.values(S.days).filter(d=>d.done).length;
  const date=new Date().toLocaleDateString(L.locale,{weekday:'long',day:'numeric',month:'long'});
  const n=currentStreak(), banner=challengeBanner(), just=takeJustCompleted();
  const firstCheck=!(S.checks&&S.checks.length);
  // progress line between the path nodes; animates from the previous step after finishing a game
  const seg=k=>plan.length>1?Math.max(0,k-1)/(plan.length-1)*75:0;
  const fillTo=seg(done), fillFrom=just?seg(done-1):fillTo;
  home.innerHTML = `
    <p class="lede">${L.tagline}</p>
    ${firstCheck?checkCardHTML():''}
    <section class="daily" aria-labelledby="dt">
      <div>
        <div class="eyebrow">${date} · #${dayNumber()}</div>
        <h2 id="dt">${day.done?L.doneTitle:L.today}</h2>
        <p class="muted">${day.done?L.doneSub:L.todaySub}</p>
      </div>
      <ol class="path" style="--from:${fillFrom}%;--to:${fillTo}%"><li class="path-fill" aria-hidden="true"></li>
        ${plan.map(id=>{ const isDone=id in day.games, cur=id===nextId;
          return `<li class="node-wrap"><span class="node ${isDone?(id===just?'just':''):cur?'cur':'todo'}" style="--dc:var(--d-${GAMES[id].domain})">${icon(id)}${isDone?`<span class="check">${checkSVG}</span>`:''}</span><span class="node-label">${L.games[id].name}</span></li>`; }).join('')}
      </ol>
      ${banner?`<p class="challenge-banner"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg><span>${banner}</span></p>`:''}
      ${day.done ? `<div class="row2"><button class="btn" id="shareBtn">${tabIcons.share}${L.share}</button><button class="btn ghost" id="dailyBtn">${L.summary}</button></div>` : `<button class="btn wide" id="dailyBtn">${done?L.cont:L.start}</button>`}
    </section>
    <div class="stats-line">
      <span><b>${n}</b> ${L.streakWord(n)}</span>
      <span><b>${fmtN(todayPts)}</b> ${L.todayPts}</span>
      <span>${L.trained(trained).replace(/^(\d+)/,'<b>$1</b>')}</span>
    </div>
    ${firstCheck?'':checkCardHTML()}
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
  if(just && S.sound) setTimeout(()=>sfx.pop(), 450);
  $('#checkBtn').onclick=()=>{ sfx.tap(); openCheck(); };
  const sb=$('#shareBtn'); if(sb) sb.onclick=()=>{ sfx.tap(); shareDaily(); };
  $('#dailyBtn').onclick = ()=>{ sfx.tap(); if(day.done) openSummary(false); else openGame(nextId,true); };
  home.querySelectorAll('.game').forEach(b=>b.onclick=()=>{ sfx.tap(); openGame(b.dataset.g,false); });
}
