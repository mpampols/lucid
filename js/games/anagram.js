import { $, shuffle } from '../utils.js';
import { sfx } from '../sound.js';
import { bump } from './shared.js';

// 5) Anagramas
export function initAnagram(st, api){
  const L=api.t(), words=shuffle([...L.words]); let wi=0, word='', tiles=[], built=[], lock=false;
  st.innerHTML = `<div class="mid"><div class="built" id="b"></div><div class="tiles" id="tl"></div></div>
    <div class="row2"><button class="btn ghost" id="del">${L.del}</button><button class="btn ghost" id="skip">${L.skip}</button></div>`;
  const b=$('#b',st), tl=$('#tl',st);
  function next(){
    word=words[wi++ % words.length]; let letters;
    do{ letters=shuffle(word.split('')); } while(letters.join('')===word);
    tiles=letters.map(ch=>({ch,used:false})); built=[]; b.className='built'; render();
  }
  function render(){
    b.innerHTML = word.split('').map((_,i)=>`<span class="slot ${built[i]!=null?'filled':''}">${built[i]!=null?tiles[built[i]].ch:''}</span>`).join('');
    tl.innerHTML = tiles.map((x,i)=>`<button class="tile ${x.used?'used':''}" data-i="${i}" ${x.used?'tabindex="-1"':''}>${x.ch}</button>`).join('');
    tl.querySelectorAll('.tile').forEach(el=>el.onclick=()=>add(+el.dataset.i));
  }
  function add(i){
    if(lock||tiles[i].used) return;
    tiles[i].used=true; built.push(i); sfx.tap(); render();
    if(built.length<word.length) return;
    lock=true;
    if(built.map(j=>tiles[j].ch).join('')===word){ b.classList.add('ok'); api.correct(word.length*4); api.later(()=>{ lock=false; next(); },550); }
    else { b.classList.add('bad'); bump(b,'shake'); api.wrong(); api.later(()=>{ lock=false; tiles.forEach(x=>x.used=false); built=[]; b.className='built'; render(); },650); }
  }
  function del(){ if(lock||!built.length) return; tiles[built.pop()].used=false; render(); }
  function skip(){
    if(lock) return; lock=true;
    b.innerHTML = word.split('').map(ch=>`<span class="slot miss">${ch}</span>`).join('');
    api.later(()=>{ lock=false; next(); },900);
  }
  $('#del',st).onclick=del; $('#skip',st).onclick=skip;
  api.key(e=>{
    if(e.key==='Backspace'){ e.preventDefault(); del(); return; }
    const ch=e.key.toUpperCase(); if(ch.length!==1) return;
    const i=tiles.findIndex(x=>!x.used && x.ch===ch); if(i>=0){ e.preventDefault(); add(i); }
  });
  next();
}
