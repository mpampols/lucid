// Entry point
import { S, save } from './state.js';
import { $ } from './utils.js';
import { sfx } from './sound.js';
import { handleKey } from './engine.js';
import { getView, showView, goHome, goStats } from './nav.js';
import { renderTop } from './views/topbar.js';
import { renderHome } from './views/home.js';
import { renderStats, drawLine } from './views/progress.js';
import { captureChallenge } from './share.js';

// ---------- global events ----------
$('#lang').onchange=e=>{ S.lang=e.target.value; S.langChosen=true; save(); renderTop(); if(getView()==='stats') renderStats(); else renderHome(); };
$('#soundBtn').onclick=()=>{ S.sound=!S.sound; save(); renderTop(); if(S.sound) sfx.tap(); };
$('#tabHome').onclick=()=>{ sfx.tap(); goHome(); };
$('#tabStats').onclick=()=>{ sfx.tap(); goStats(); };
$('#quit').onclick=goHome;
document.addEventListener('keydown', handleKey);
document.addEventListener('visibilitychange',()=>{ if(document.hidden && sfx.ctx) sfx.ctx.suspend?.(); });
let rz; addEventListener('resize',()=>{ clearTimeout(rz); rz=setTimeout(()=>{ if(getView()==='stats') drawLine(); },150); });

captureChallenge();
renderTop();
if(location.hash==='#progreso' || location.hash==='#stats'){ renderStats(); showView('stats'); }
else { renderHome(); showView('home'); }
