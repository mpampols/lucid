import { T, detectLang } from './i18n/index.js';

/* =========================================================
   Almacenamiento
   Toda la persistencia pasa por Store. Hoy usa localStorage;
   el día que haya backend, solo cambia este módulo.
   Esquema v2:
   { v, lang, sound,
     best:{gameId:score},
     streak:{count,last,best},
     days:{ 'YYYY-MM-DD': {plan:[ids], games:{id:score}, done, total} },
     history:[ {t, d, g, s, c, w, daily} ] }   // una entrada por partida
   ========================================================= */
export const Store = {
  KEY:'lucid.v2', LEGACY:'lucid.v1', MAX_HISTORY:5000,
  defaults(){ return {v:2, lang:detectLang(), langChosen:false, sound:true, best:{}, streak:{count:0,last:null,best:0}, days:{}, history:[]}; },
  normalize(o){
    const d=this.defaults(), s=Object.assign(d, o||{});
    s.v=2; s.best=s.best||{}; s.days=s.days||{}; s.history=Array.isArray(s.history)?s.history:[];
    s.streak=Object.assign({count:0,last:null,best:0}, s.streak||{});
    s.streak.best=Math.max(s.streak.best||0, s.streak.count||0);
    // Mientras el usuario no elija idioma a mano, se sigue el del navegador
    if(!s.langChosen || !T[s.lang]) s.lang=detectLang();
    return s;
  },
  migrateV1(o){
    const s=this.normalize(o);
    // Reconstruye el historial a partir de los días guardados en v1
    Object.entries(s.days).forEach(([d,day])=>{
      Object.entries(day.games||{}).forEach(([g,score])=>{
        s.history.push({t:new Date(d+'T12:00:00').getTime(), d, g, s:score, c:null, w:null, daily:true});
      });
    });
    s.history.sort((a,b)=>a.t-b.t);
    return s;
  },
  load(){
    try{
      const raw=localStorage.getItem(this.KEY);
      if(raw) return this.normalize(JSON.parse(raw));
      const old=localStorage.getItem(this.LEGACY);
      if(old){ const s=this.migrateV1(JSON.parse(old)); this.save(s); return s; }
    }catch(e){}
    return this.defaults();
  },
  save(s){
    if(s.history.length>this.MAX_HISTORY) s.history=s.history.slice(-this.MAX_HISTORY);
    try{ localStorage.setItem(this.KEY, JSON.stringify(s)); }catch(e){}
  },
  exportText(s){ return JSON.stringify({app:'lucid', v:2, exportedAt:new Date().toISOString(), data:s}); },
  parseBackup(text){
    try{
      const o=JSON.parse(text.trim());
      const data = o && o.app==='lucid' ? o.data : o;
      if(!data || typeof data!=='object' || !('best' in data || 'history' in data || 'days' in data)) return null;
      return data.history ? this.normalize(data) : this.migrateV1(data);
    }catch(e){ return null; }
  },
  reset(keep){ const s=this.defaults(); s.lang=keep.lang; s.langChosen=keep.langChosen; s.sound=keep.sound; this.save(s); return s; }
};
