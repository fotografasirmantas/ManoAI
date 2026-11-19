'use strict';
/* Mano AI: vienas balsas vienu metu, be aido. Įkelti PASKUTINĮ */
let voiceSeq=0,voiceBusy=false,voiceDone=null;
stopVoice=function(){voiceSeq++;voiceBusy=false;voiceDone=null;
 if(ttsAudio){const a=ttsAudio;ttsAudio=null;a.onended=a.onerror=null;try{a.pause();a.removeAttribute('src');a.load()}catch{}}
 if('speechSynthesis' in window)speechSynthesis.cancel()};
function phoneSpeak(t,end){if(!('speechSynthesis' in window)){end();return}
 const u=new SpeechSynthesisUtterance(plain(t).slice(0,4000));u.lang=cfg.voiceLang;u.rate=cfg.rate;
 const v=voices().find(x=>x.voiceURI===cfg.voice);if(v)u.voice=v;u.onend=u.onerror=end;speechSynthesis.speak(u)}
speak=async function(t,done){stopVoice();const my=voiceSeq;voiceBusy=true;voiceDone=done||null;
 const end=()=>{if(my!==voiceSeq)return;voiceBusy=false;voiceDone=null;done&&done()};
 if(!cfg.tts?.on||!V?.key){phoneSpeak(t,end);return}
 try{if(!cfg.tts.model){cfg.tts.model=bestVoice(await ttsModels());saveCfg()}
  if(my!==voiceSeq)return;if(!cfg.tts.model)throw new Error('balsas nepasirinktas');
  const r=await fetch(TB()+'/audio/speech',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+V.key},
   body:JSON.stringify({model:cfg.tts.model,input:plain(t).slice(0,4000),response_format:'mp3'})});
  if(my!==voiceSeq)return;
  if(!r.ok){const d=await r.json().catch(()=>({}));throw new Error(d.error?.message||('HTTP '+r.status))}
  let blob;if(/json/.test(r.headers.get('content-type')||'')){const d=await r.json();if(!d.audio)throw new Error('negautas garsas');blob=b64Blob(d.audio,'audio/'+(d.format||'mpeg'))}
  else blob=await r.blob();
  if(my!==voiceSeq)return;
  const url=URL.createObjectURL(blob),a=new Audio(url);ttsAudio=a;
  a.onended=a.onerror=()=>{URL.revokeObjectURL(url);if(ttsAudio===a)ttsAudio=null;end()};
  await a.play()}
 catch(e){if(my!==voiceSeq)return;if(ttsAudio){try{ttsAudio.pause()}catch{}ttsAudio=null}
  toast('AI balsas neveikia ('+e.message+'). Kalba telefono balsas.',5000);phoneSpeak(t,end)}};
/* Live: palietus ekraną balsas nutyla ir AI vėl klauso */
liveEl.addEventListener('click',e=>{if(e.target.closest('.lb')||!voiceBusy)return;e.stopImmediatePropagation();const d=voiceDone;stopVoice();d&&d()},true);
/* 🔊 mygtukas: jei balsas jau skamba ar kraunasi, antras paspaudimas jį sustabdo */
msgsEl.addEventListener('click',e=>{if(!e.target.closest('[data-act="speak"]')||!voiceBusy)return;e.stopImmediatePropagation();stopVoice()},true);
/* ===== balsas2.js pabaiga ===== */
