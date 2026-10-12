// Registro de juegos. Para añadir uno: crea su archivo en esta carpeta,
// regístralo aquí y añade sus textos en js/i18n/*.js (games.<id>).
import { hash, seeded } from '../utils.js';
import { initMath } from './math.js';
import { initStroop } from './stroop.js';
import { initDigits } from './digits.js';
import { initGrid } from './grid.js';
import { initAnagram } from './anagram.js';
import { initCompare } from './compare.js';
import { initSwitch } from './switch.js';
import { initNback } from './nback.js';
import { initRotate } from './rotate.js';

// ---------- juegos ----------
export const GAMES = {
  math:{domain:'math', time:60, init:initMath},
  stroop:{domain:'attn', time:45, init:initStroop},
  digits:{domain:'mem', lives:3, init:initDigits},
  grid:{domain:'space', lives:3, init:initGrid},
  anagram:{domain:'lang', time:90, init:initAnagram},
  compare:{domain:'speed', time:45, init:initCompare},
  switch:{domain:'flex', time:45, init:initSwitch, isNew:true},
  nback:{domain:'mem', time:60, init:initNback, isNew:true},
  rotate:{domain:'space', time:45, init:initRotate, isNew:true}
};
export const ORDER = ['math','stroop','digits','grid','anagram','compare','switch','nback','rotate'];
export const DOMAINS = ['math','attn','mem','lang','space','speed','flex'];
export const DAILY_N = 4;

// Plan diario: igual para todos ese día, sin repetir área
export function dailyPlan(key){
  const r=seeded(hash('lucid'+key)), a=[...ORDER];
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  const out=[], used=new Set();
  for(const id of a){ if(out.length<DAILY_N && !used.has(GAMES[id].domain)){ out.push(id); used.add(GAMES[id].domain); } }
  return out;
}
