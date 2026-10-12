// Image cards for sharing (1080×1350, 4:5 — fits Instagram and chat apps).
// Drawn on a canvas with a fixed dark palette so they look the same everywhere.
import { t } from './state.js';
import { dayKey } from './utils.js';
import { GAMES } from './games/index.js';
import { iconSVG } from './icons.js';
import { SITE_URL } from './config.js';

const W=1080, H=1350, PAD=80;
const C = {
  bg:'#0E1120', surface:'#171B2E', line:'#272D46', ink:'#EEF0F8', muted:'#9AA1BC', accent:'#FF6A48',
  domain:{math:'#12A399', attn:'#EFA20E', mem:'#7A5CFA', lang:'#E8487E', space:'#2D8CFF', speed:'#17A35E', flex:'#7DBB1F'}
};
const DISPLAY="'Bricolage Grotesque', 'Nunito Sans', system-ui, sans-serif";
const BODY="'Nunito Sans', system-ui, sans-serif";
const SITE_LABEL = SITE_URL.replace(/^https?:\/\//,'').replace(/\/$/,'');

async function ready(){
  try{
    await Promise.all([
      document.fonts.load(`800 80px 'Bricolage Grotesque'`),
      document.fonts.load(`800 40px 'Nunito Sans'`),
      document.fonts.load(`700 30px 'Nunito Sans'`)
    ]);
  }catch(e){}
}

function canvas(){
  const c=document.createElement('canvas'); c.width=W; c.height=H;
  const x=c.getContext('2d'); x.fillStyle=C.bg; x.fillRect(0,0,W,H);
  // soft glow in the top corner
  const g=x.createRadialGradient(W-60,40,10,W-60,40,700);
  g.addColorStop(0,'rgba(255,106,72,.28)'); g.addColorStop(1,'rgba(255,106,72,0)');
  x.fillStyle=g; x.fillRect(0,0,W,H);
  return [c,x];
}
const toBlob = c => new Promise(res=>c.toBlob(res,'image/png'));

function rrect(x,X,Y,w,h,r,fill){ x.beginPath(); x.roundRect(X,Y,w,h,r); x.fillStyle=fill; x.fill(); }
function text(x,str,X,Y,{font,color=C.ink,align='left',max}={}){
  x.font=font; x.fillStyle=color; x.textAlign=align; x.textBaseline='alphabetic';
  if(max){ // shrink to fit
    let size=parseFloat(font.match(/(\d+)px/)[1]);
    while(x.measureText(str).width>max && size>16){ size-=2; x.font=font.replace(/\d+px/,size+'px'); }
  }
  x.fillText(str,X,Y);
}
function loadImg(src){ return new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=src; }); }
const svgURL = s => 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);

function logo(x,X,Y,s){
  rrect(x,X,Y,s,s,s*.3,C.accent);
  const k=s/30; x.save(); x.translate(X,Y); x.scale(k,k);
  x.fillStyle='#fff'; x.fill(new Path2D('M15 6c.8 4.6 3.4 7.2 8 8-4.6.8-7.2 3.4-8 8-.8-4.6-3.4-7.2-8-8 4.6-.8 7.2-3.4 8-8z'));
  x.restore();
}
function header(x,right){
  logo(x,PAD,PAD,72);
  text(x,'Lúcid',PAD+96,PAD+56,{font:`800 56px ${DISPLAY}`});
  if(right) text(x,right,W-PAD,PAD+52,{font:`700 34px ${BODY}`,color:C.muted,align:'right'});
}
function footer(x,left){
  if(left){
    x.save(); x.translate(PAD,H-PAD-34); x.scale(1.6,1.6); x.fillStyle=C.accent;
    x.fill(new Path2D('M12.6 2.2c.4 3-1.3 4.7-2.8 6.3C8.3 10 6.5 11.9 6.5 15a5.5 5.5 0 0 0 11 0c0-2.4-1.2-4.1-2.3-5.2-.2 1.3-.8 2.3-1.7 2.8.5-3.6-.5-7.6-.9-10.4z'));
    x.restore();
    text(x,left,PAD+52,H-PAD,{font:`800 34px ${BODY}`});
  }
  text(x,SITE_LABEL,W-PAD,H-PAD,{font:`700 30px ${BODY}`,color:C.muted,align:'right'});
}

// ---------- daily card ----------
export async function drawDailyCard(r){
  await ready();
  const L=t(), [c,x]=canvas();
  const date=new Date(r.key+'T12:00:00').toLocaleDateString(L.locale,{day:'numeric',month:'short',year:'numeric'}).replace('.','');
  header(x,`#${r.num} · ${date}`);

  text(x,L.tiers[r.tier],PAD,300,{font:`800 88px ${DISPLAY}`,max:W-2*PAD});
  text(x,new Intl.NumberFormat(L.locale).format(r.total),PAD,480,{font:`800 170px ${DISPLAY}`,color:C.accent});
  x.font=`800 170px ${DISPLAY}`;
  const tw=x.measureText(new Intl.NumberFormat(L.locale).format(r.total)).width;
  text(x,L.pointsWord,PAD+tw+24,470,{font:`700 40px ${BODY}`,color:C.muted});

  const icons=await Promise.all(r.games.map(g=>loadImg(svgURL(iconSVG(g.id,'#ffffff',44))).catch(()=>null)));
  let y=580;
  r.games.forEach((g,i)=>{
    const dom=GAMES[g.id].domain, col=C.domain[dom];
    rrect(x,PAD,y,W-2*PAD,124,30,C.surface);
    rrect(x,PAD+26,y+26,72,72,22,col);
    if(icons[i]) x.drawImage(icons[i],PAD+40,y+40,44,44);
    text(x,L.games[g.id].name,PAD+122,y+60,{font:`800 40px ${DISPLAY}`,max:380});
    const sub = g.tag==='record'?L.record : g.tag==='first'?L.firstTime : L.domains[dom];
    text(x,sub,PAD+122,y+98,{font:`700 28px ${BODY}`,color:g.tag==='record'?C.accent:C.muted});
    // rating pills
    for(let k=0;k<5;k++) rrect(x,620+k*44,y+45,34,34,9,k<g.rating?C.accent:C.line);
    text(x,new Intl.NumberFormat(L.locale).format(g.score),W-PAD-28,y+76,{font:`800 40px ${BODY}`,align:'right'});
    y+=142;
  });
  footer(x, r.streak?L.streakDays(r.streak):null);
  return toBlob(c);
}

// ---------- progress card ----------
export async function drawProgressCard(p){
  await ready();
  const L=t(), [c,x]=canvas();
  header(x,new Date().toLocaleDateString(L.locale,{day:'numeric',month:'short',year:'numeric'}).replace('.',''));
  text(x,L.myBrain,PAD,290,{font:`800 84px ${DISPLAY}`,max:W-2*PAD});

  const fmt=n=>new Intl.NumberFormat(L.locale).format(n);
  const stats=[[p.streak,L.streakLbl,C.accent],[p.trained,L.daysTrained,C.ink],[p.plays,L.gamesPlayed,C.ink]];
  const tw=(W-2*PAD-2*24)/3;
  stats.forEach(([v,lbl,col],i)=>{
    const X=PAD+i*(tw+24);
    rrect(x,X,350,tw,200,30,C.surface);
    text(x,fmt(v),X+30,350+112,{font:`800 92px ${DISPLAY}`,color:col,max:tw-60});
    text(x,lbl,X+30,350+164,{font:`700 30px ${BODY}`,color:C.muted,max:tw-60});
  });

  // activity heatmap, last 16 weeks (Monday-first)
  text(x,L.last16,PAD,640,{font:`800 34px ${BODY}`,color:C.muted});
  const cell=48, gap=8, today=new Date(); today.setHours(12,0,0,0);
  const start=new Date(today); start.setDate(today.getDate()-((today.getDay()+6)%7)-15*7);
  const lv=['#222842','rgba(255,106,72,.32)','rgba(255,106,72,.55)','rgba(255,106,72,.78)',C.accent];
  for(let w=0;w<16;w++) for(let d=0;d<7;d++){
    const day=new Date(start); day.setDate(start.getDate()+w*7+d);
    if(day>today) continue;
    const n=p.perDay[dayKey(day)]||0, l=n===0?0:n<=2?1:n<=4?2:n<=7?3:4;
    rrect(x,PAD+w*(cell+gap),670+d*(cell+gap),cell,cell,10,lv[l]);
  }
  if(p.topDomain){
    const y=1130;
    rrect(x,PAD,y,22,22,6,C.domain[p.topDomain]);
    text(x,`${L.topArea}: `,PAD+40,y+21,{font:`700 34px ${BODY}`,color:C.muted});
    x.font=`700 34px ${BODY}`; const lw=x.measureText(`${L.topArea}: `).width;
    text(x,L.domains[p.topDomain],PAD+40+lw,y+21,{font:`800 34px ${BODY}`});
  }
  footer(x, p.best?`${L.bestStreakLbl}: ${p.best}`:null);
  return toBlob(c);
}

// ---------- mental check-up card ----------
export async function drawCheckCard(c){
  await ready();
  const L=t(), C=L.check, [cv,x]=canvas();
  header(x,new Date(c.t).toLocaleDateString(L.locale,{day:'numeric',month:'short',year:'numeric'}).replace('.',''));
  text(x,C.shareTitle,PAD,290,{font:`800 84px ${DISPLAY}`,max:W-2*PAD});
  const pct=`${c.pct}%`;
  text(x,pct,PAD,560,{font:`800 260px ${DISPLAY}`,color:C_ACCENT});
  // sentence, wrapped to two lines max
  const sentence=C.shareText(c.pct);
  x.font=`700 44px ${BODY}`;
  const words=sentence.split(' '), lines=[]; let line='';
  words.forEach(w=>{ const tryL=line?line+' '+w:w; if(x.measureText(tryL).width>W-2*PAD){ lines.push(line); line=w; } else line=tryL; });
  if(line) lines.push(line);
  lines.slice(0,3).forEach((l,i)=>text(x,l,PAD,660+i*60,{font:`700 44px ${BODY}`,color:'#EEF0F8'}));
  const tiles=[[String(c.corsi),C.cardSpatial],[String(c.digits),C.cardDigits],[`${c.rt} ms`,C.cardRt]];
  const tw=(W-2*PAD-2*24)/3, ty=870;
  tiles.forEach(([v,lbl],i)=>{
    const X=PAD+i*(tw+24);
    rrect(x,X,ty,tw,190,30,'#171B2E');
    text(x,v,X+30,ty+105,{font:`800 76px ${DISPLAY}`,max:tw-60});
    text(x,lbl,X+30,ty+152,{font:`700 30px ${BODY}`,color:'#9AA1BC',max:tw-60});
  });
  footer(x,null);
  return toBlob(cv);
}
const C_ACCENT='#FF6A48';
