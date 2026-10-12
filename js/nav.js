// Navigation between views: home, progress and play
import { $ } from './utils.js';
import { leaveRun } from './engine.js';
import { leaveCheck } from './check.js';
import { renderTop } from './views/topbar.js';
import { renderHome } from './views/home.js';
import { renderStats } from './views/progress.js';

let view = 'home';
export const getView = () => view;

export function showView(v){
  view=v; document.body.dataset.view=v;
  const home=$('#home'), statsView=$('#stats'), play=$('#play'), chrome=$('#chrome');
  home.hidden = v!=='home'; statsView.hidden = v!=='stats'; chrome.hidden = v==='play'; $('#siteFoot').hidden = v==='play'; play.hidden = v!=='play';
  $('#tabHome').setAttribute('aria-selected', v==='home'); $('#tabStats').setAttribute('aria-selected', v==='stats');
  window.scrollTo(0,0);
}

export function goHome(){ leaveRun(); leaveCheck(); renderTop(); renderHome(); showView('home'); }
export function goStats(){ leaveRun(); leaveCheck(); renderTop(); renderStats(); showView('stats'); }
