// Daily training and streak
import { S } from './state.js';
import { dayKey, yesterdayKey } from './utils.js';
import { GAMES, dailyPlan } from './games/index.js';

export function getDay(){ const k=dayKey(); if(!S.days[k]) S.days[k]={plan:dailyPlan(k), games:{}, done:false}; S.days[k].plan=S.days[k].plan.filter(id=>GAMES[id]); return S.days[k]; }
export function currentStreak(){ const l=S.streak.last; return (l===dayKey()||l===yesterdayKey()) ? S.streak.count : 0; }
export function bumpStreak(){ const k=dayKey(); if(S.streak.last===k) return; S.streak.count = S.streak.last===yesterdayKey() ? S.streak.count+1 : 1; S.streak.last=k; S.streak.best=Math.max(S.streak.best||0,S.streak.count); }
