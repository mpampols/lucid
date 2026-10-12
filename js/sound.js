import { S } from './state.js';

// ---------- sound (Web Audio, no audio files) ----------
const SEMI = n => Math.pow(2, n/12);

export const sfx = {
  ctx:null,
  get(){
    if(!S.sound) return null;
    try{
      if(!this.ctx){ const C=window.AudioContext||window.webkitAudioContext; if(!C) return null; this.ctx=new C(); }
      if(this.ctx.state==='suspended') this.ctx.resume();
    }catch(e){ return null; }
    return this.ctx;
  },
  tone(f,dur,type='sine',vol=.15,when=0,slideTo=null){
    const c=this.get(); if(!c) return;
    const t0=c.currentTime+when, o=c.createOscillator(), g=c.createGain();
    o.type=type; o.frequency.setValueAtTime(f,t0);
    if(slideTo) o.frequency.exponentialRampToValueAtTime(slideTo,t0+dur);
    g.gain.setValueAtTime(.0001,t0); g.gain.exponentialRampToValueAtTime(vol,t0+.012); g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0+dur+.03);
  },
  // Correct answer: two-note chime that climbs a semitone with each answer in a row
  ok(combo=1){ const k=SEMI(Math.min(combo-1,12)); this.tone(660*k,.1,'triangle',.16); this.tone(990*k,.16,'triangle',.14,.07); },
  bad(){ this.tone(196,.2,'square',.05); this.tone(147,.26,'square',.05,.07); },
  tap(){ this.tone(560,.05,'sine',.07); },
  tick(){ this.tone(1100,.035,'square',.03); },
  blip(){ this.tone(740,.06,'sine',.06); },
  pop(){ this.tone(420,.12,'sine',.12,0,980); },
  soft(step=0){ this.tone(900+step*40,.03,'triangle',.035); },
  count(){ this.tone(523,.14,'triangle',.13); },
  go(){ this.tone(784,.12,'triangle',.14); this.tone(1175,.22,'triangle',.14,.08); },
  praise(){ [784,988,1175,1568].forEach((f,i)=>this.tone(f,.14,'triangle',.11,i*.055)); },
  lose(){ [392,330,262].forEach((f,i)=>this.tone(f,.2,'triangle',.1,i*.12)); },
  done(){ [523,659,784,1047].forEach((f,i)=>this.tone(f,.24,'triangle',.15,i*.1)); },
  record(){ [659,784,988,1319].forEach((f,i)=>this.tone(f,.22,'triangle',.14,i*.08)); this.tone(1760,.45,'sine',.08,.34); },
  fanfare(){ [523,659,784,1047,1319].forEach((f,i)=>this.tone(f,.3,'triangle',.14,i*.09)); this.tone(1568,.5,'sine',.1,.5); },
  note(i){ const sc=[523,587,659,784,880,1047,1175,1319,1568,1760,2093,2349,2637,3136,3520,4186]; this.tone(sc[i%sc.length],.22,'sine',.13); }
};
