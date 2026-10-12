import { S } from './state.js';

// ---------- sonido (WebAudio, sin archivos) ----------
export const sfx = {
  ctx:null,
  get(){ if(!S.sound) return null; try{ if(!this.ctx){ const C=window.AudioContext||window.webkitAudioContext; if(!C) return null; this.ctx=new C(); } if(this.ctx.state==='suspended') this.ctx.resume(); }catch(e){ return null; } return this.ctx; },
  tone(f,dur,type='sine',vol=.15,when=0){ const c=this.get(); if(!c) return; const t0=c.currentTime+when; const o=c.createOscillator(), g=c.createGain(); o.type=type; o.frequency.setValueAtTime(f,t0); g.gain.setValueAtTime(.0001,t0); g.gain.exponentialRampToValueAtTime(vol,t0+.012); g.gain.exponentialRampToValueAtTime(.0001,t0+dur); o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0+dur+.03); },
  ok(){ this.tone(660,.1,'triangle',.16); this.tone(990,.16,'triangle',.14,.07); },
  bad(){ this.tone(196,.2,'square',.05); this.tone(147,.26,'square',.05,.07); },
  tap(){ this.tone(560,.05,'sine',.07); },
  tick(){ this.tone(1100,.035,'square',.03); },
  blip(){ this.tone(740,.06,'sine',.06); },
  done(){ [523,659,784,1047].forEach((f,i)=>this.tone(f,.24,'triangle',.15,i*.1)); },
  fanfare(){ [523,659,784,1047,1319].forEach((f,i)=>this.tone(f,.3,'triangle',.14,i*.09)); this.tone(1568,.5,'sine',.1,.5); },
  note(i){ const sc=[523,587,659,784,880,1047,1175,1319,1568,1760,2093,2349,2637,3136,3520,4186]; this.tone(sc[i%sc.length],.22,'sine',.13); }
};
