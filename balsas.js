'use strict';
/* Mano AI: AI balsas per anymodel.org /v1/audio/speech (v2, balsų sąrašas iš /v1/models/tts) */
if(!cfg.tts||typeof cfg.tts!=='object')cfg.tts={};
cfg.tts={on:false,model:'',...cfg.tts};
if(/gpt-4o-mini-tts|^tts-1/.test(cfg.tts.model||''))cfg.tts.model='';
saveCfg();
const TB=()=>cfg.base.replace(/\/+$/,'');
let ttsList=null,ttsAudio=null;
async function ttsModels(force){if(ttsList&&!force)return ttsList;
 const r=await fetch(TB()+'/models/tts',{headers:{Authorization:'Bearer '+V.key}});const d=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(d.error?.message||('HTTP '+r.status));
 ttsList=(d.data||d.models||[]).map(m=>typeof m==='string'?{id:m,name:''}:{id:m.id||m.name,name:m.name||m.display_name||m.description||''}).filter(x=>typeof x.id==='string');
 return ttsList}
function bestVoice(L){const lang=(cfg.voiceLang||'lt-LT').toLowerCase();
 const sc=m=>{const s=(m.id+' '+m.name).toLowerCase();let p=0;if(s.includes(lang))p+=10;if(/edge/.test(s))p+=3;if(/neural/.test(s))p+=2;if(/google/.test(s))p+=1;if(/local-device/.test(s))p-=5;return p};
 return[...L].sort((a,b)=>sc(b)-sc(a))[0]?.id||''}
const _phone=speak,_lvStop=liveStop,_setB=settingsPage;
function stopVoice(){if(ttsAudio){ttsAudio.onended=ttsAudio.onerror=null;ttsAudio.pause();ttsAudio=null}if('speechSynthesis' in window)speechSynthesis.cancel()}
function b64Blob(b64,type){const s=atob(b64),a=new Uint8Array(s.length);for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return new Blob([a],{type})}
speak=async function(t,done){stopVoice();
 if(!cfg.tts.on||!V||!V.key)return _phone(t,done);
 let fin=false;const end=()=>{if(!fin){fin=true;done&&done()}};
 try{if(!cfg.tts.model){cfg.tts.model=bestVoice(await ttsModels());saveCfg()}
  if(!cfg.tts.model)throw new Error('balsų sąrašas tuščias');
  const r=await fetch(TB()+'/audio/speech',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+V.key},
   body:JSON.stringify({model:cfg.tts.model,input:plain(t).slice(0,4000),response_format:'mp3'})});
  if(!r.ok){const d=await r.json().catch(()=>({}));throw new Error(d.error?.message||('HTTP '+r.status))}
  let blob;if(/json/.test(r.headers.get('content-type')||'')){const d=await r.json();if(!d.audio)throw new Error('negautas garsas');blob=b64Blob(d.audio,'audio/'+(d.format||'mpeg'))}
  else blob=await r.blob();
  const url=URL.createObjectURL(blob),a=new Audio(url);ttsAudio=a;
  a.onended=a.onerror=()=>{URL.revokeObjectURL(url);if(ttsAudio===a)ttsAudio=null;end()};
  await a.play()}
 catch(e){toast('AI balsas neveikia ('+e.message+'). Kalba telefono balsas.',5000);_phone(t,end)}};
liveStop=function(){stopVoice();_lvStop()};
liveEl.addEventListener('click',e=>{if(!e.target.closest('.lb')&&ttsAudio){const a=ttsAudio,f=a.onended;stopVoice();f&&f()}});
msgsEl.addEventListener('click',e=>{if(e.target.closest('[data-act="speak"]')&&ttsAudio){stopVoice();e.stopImmediatePropagation()}},true);
const SAMPLE={'lt-LT':'Labas! Taip skamba mano balsas. Kuo galiu padėti?','en-US':'Hello! This is how my voice sounds.','ru-RU':'Привет! Так звучит мой голос.'};
settingsPage=function(){_setB();const c=document.createElement('div');c.className='card';
 c.innerHTML=`<h4>AI balsas (natūralus)</h4>
<div class="row"><div class="t">Naudoti AI balsą<small>Edge, Google ar Fish Audio balsai per anymodel.org. Jei neveiks, kalbės telefono balsas.</small></div><label class="sw"><input type="checkbox" id="t_on"${cfg.tts.on?' checked':''}><span></span></label></div>
<div class="row col"><small>Pasirinktas balsas: <b id="t_cur">${esc(cfg.tts.model||'automatiškai')}</b></small>
<small>Paspaudus balsą, jis perskaitys pavyzdį</small>
<input class="in" id="t_q" placeholder="Ieškoti, pvz. lt-LT, ru-RU, en-US, Ona">
<div id="t_list" style="max-height:320px;overflow-y:auto"><p class="mu">Kraunama…</p></div>
<button class="btn" data-act="ttsTest">${ic('speak')}Išbandyti pasirinktą</button></div>`;
 pBody.appendChild(c);
 let L=[];const draw=()=>{const el=$('t_list');if(!el)return;const q=($('t_q')?.value||'').toLowerCase().trim();
  const f=L.filter(m=>(m.id+' '+m.name).toLowerCase().includes(q)).slice(0,200);
  el.innerHTML=f.map(m=>`<div class="item${m.id===cfg.tts.model?' sel':''}" data-act="ttsPick" data-id="${esc(m.id)}">${ic(m.id===cfg.tts.model?'check':'speak')}<span class="t"><span class="tt">${esc(m.id)}</span>${m.name&&m.name!==m.id?`<small>${esc(m.name)}</small>`:''}</span></div>`).join('')||'<p class="mu" style="padding:8px">Nerasta. Išvalykite paiešką.</p>'};
 if(V&&V.key)ttsModels().then(x=>{L=x;const q=$('t_q');if(q&&!q.value)q.value=cfg.voiceLang||'lt-LT';draw()})
  .catch(e=>{const el=$('t_list');if(el)el.innerHTML='<p class="mu">Nepavyko gauti balsų: '+esc(e.message)+'</p>'});
 else $('t_list').innerHTML='<p class="mu">Pirma įveskite API raktą.</p>';
 const oIn=PH.input,oCh=PH.ch;
 PH.input=t=>{if(t.id==='t_q')draw();else oIn&&oIn(t)};
 PH.ch=t=>{if(t.id==='t_on'){cfg.tts.on=t.checked;saveCfg()}else oCh&&oCh(t)};
 PH.ttsPick=id=>{cfg.tts.model=id;cfg.tts.on=true;saveCfg();const cb=$('t_on');if(cb)cb.checked=true;
  const cu=$('t_cur');if(cu)cu.textContent=id;draw();speak(SAMPLE[cfg.voiceLang]||SAMPLE['lt-LT'])};
 PH.ttsTest=()=>{if(!cfg.tts.on){cfg.tts.on=true;saveCfg();const cb=$('t_on');if(cb)cb.checked=true}speak(SAMPLE[cfg.voiceLang]||SAMPLE['lt-LT'])}};
/* ===== balsas.js pabaiga ===== */
