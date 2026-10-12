import { S, t } from '../state.js';
import { $ } from '../utils.js';
import { flameSVG, soundSVG, tabIcons } from '../icons.js';
import { currentStreak } from '../daily.js';

export function renderTop(){
  const L=t(), n=currentStreak();
  const pill=$('#streakPill'); pill.innerHTML=flameSVG()+n; pill.classList.toggle('off', n===0); pill.title=L.streak(n);
  $('#lang').value=S.lang; document.documentElement.lang=S.lang;
  const sb=$('#soundBtn'); sb.innerHTML=soundSVG(S.sound); sb.setAttribute('aria-label', S.sound?L.soundOn:L.soundOff); sb.title=sb.getAttribute('aria-label');
  $('#footNote').textContent=L.footer; $('#footBy').textContent=L.madeBy; $('#footCode').textContent=L.source;
  $('#tabHome').innerHTML=tabIcons.home+L.tabHome; $('#tabStats').innerHTML=tabIcons.stats+L.tabStats;
}
