'use strict';
/* Mano AI: natūralus AI balsas. Veikia tik kartu su app.js ir app2.js */
const AI_VOICES=['nova','shimmer','coral','sage','alloy','ash','echo','fable','onyx'];
if(!cfg.tts)cfg.tts={on:true,model:'gpt-4o-mini-tts',voice:'nova'};
let ttsAudio=null;
const _sysSpeak=speak,_liveStop=liveStop,_settings=settingsPage;
function stopVoice(){if(ttsAudio){ttsAudio.pause();ttsAudio=null}if('speechSynthesis' in window)speechSynthesis.cancel()}
speak=async function(t,done){stopVoice();
 if(!cfg.tts.on||!V||!V.key)return _sysSpeak(t,done);
 let fin=false;const end=()=>{if(!fin){fin=true;done&&done()}};
 try{const body={model:cfg.tts.model,voice:cfg.tts.voice,input:plain(t).slice(0,4000),speed:cfg.rate,response_format:'mp3'};
  if(/4o/.test(cfg.tts.model))body.instructions='Kalbėk natūraliai, šiltai ir aiškiai, ta kalba, kuria parašytas tekstas.';
  const r=await fetch(cfg.base.replace(/\/+$/,'')+'/audio/speech',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+V.key},body:JSON.stringify(body)});
  if(!r.ok){const d=await r.json().catch(()=>({}));throw new Error(d.error?.message||('HTTP '+r.status))}
  const url=URL.createObjectURL(await r.blob());const a=new Audio(url);ttsAudio=a;
  a.onended=a.onerror=()=>{URL.revokeObjectURL(url);if(ttsAudio===a)ttsAudio=null;end()};
  await a.play()}
 catch(e){toast('AI balsas neveikia ('+e.message+'). Naudoju telefono balsą.');_sysSpeak(t,end)}};
liveStop=function(){stopVoice();_liveStop()};
liveEl.addEventListener('click',e=>{if(!e.target.closest('.lb')&&ttsAudio){const a=ttsAudio;stopVoice();a.onended&&a.onended()}});
msgsEl.addEventListener('click',e=>{const b=e.target.closest('[data-act="speak"]');if(b&&ttsAudio){stopVoice();e.stopImmediatePropagation()}},true);
settingsPage=function(){_settings();const c=document.createElement('div');c.className='card';
 c.innerHTML=`<h4>AI balsas (kaip ChatGPT)</h4>
<div class="row"><div class="t">Naudoti AI balsą<small>Natūralus balsas per anymodel.org. Jei neveiks, kalbės telefono balsas.</small></div><label class="sw"><input type="checkbox" id="t_on"${cfg.tts.on?' checked':''}><span></span></label></div>
<div class="row col"><small>Balso modelis</small><input class="in" id="t_model" value="${esc(cfg.tts.model)}">
<small>Balsas</small><select class="in" id="t_voice">${AI_VOICES.map(v=>`<option${v===cfg.tts.voice?' selected':''}>${v}</option>`).join('')}</select>
<button class="btn" data-act="ttsTest">${ic('speak')}Išbandyti AI balsą</button></div>`;
 pBody.appendChild(c);
 const och=PH.ch;PH.ch=t=>{if(t.id==='t_on')cfg.tts.on=t.checked;else if(t.id==='t_model')cfg.tts.model=t.value.trim()||'gpt-4o-mini-tts';else if(t.id==='t_voice')cfg.tts.voice=t.value;else return och&&och(t);saveCfg()};
 PH.ttsTest=()=>speak('Labas! Taip skamba mano naujas balsas. Kuo galiu padėti?')};
/* ===== balsas.js pabaiga ===== */
