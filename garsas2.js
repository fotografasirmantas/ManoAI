'use strict';
/* Mano AI: garso modeliai iš /v1/models/stt ir /v1/models/tts (v2). Įkelti po garsas.js */
const kindCache={};
async function modelsOf(kind){if(kindCache[kind])return kindCache[kind];
 try{const r=await fetch(AB()+'/models/'+kind,{headers:{Authorization:'Bearer '+V.key}});const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d.error?.message||('HTTP '+r.status));
  return kindCache[kind]=(d.data||d.models||[]).map(m=>m.id||m.name||m).filter(x=>typeof x==='string')}
 catch(e){const L=[];L.err=e.message;return L}}

transcribe=async function(blob,name){const errs=[];let wav=null;
 toast('Ruošiamas garso įrašas…',120000);
 try{wav=await toWav(blob)}catch(e){errs.push('konvertavimas: '+e.message)}
 const stt=await modelsOf('stt');if(stt.err)errs.push('/models/stt: '+stt.err);
 const list=[...new Set([cfg.sttModel,...stt])].filter(m=>m&&stt.includes(m)).slice(0,5);
 for(const m of list){
  try{toast('Iššifruojama ('+m+')…',120000);const fd=new FormData();fd.append('file',wav||blob,wav?'irasas.wav':name);fd.append('model',m);
   const r=await fetch(AB()+'/audio/transcriptions',{method:'POST',headers:{Authorization:'Bearer '+V.key},body:fd});
   const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error?.message||('HTTP '+r.status));
   if(typeof d.text==='string'){if(cfg.sttModel!==m){cfg.sttModel=m;saveCfg()}return d.text}
   throw new Error('neatsakė tekstu')}
  catch(e){errs.push(m+': '+e.message)}}
 if(wav){const chat=[...new Set([cfg.audioModel,...cfg.models.filter(m=>/gemini|audio|omni|4o/i.test(m)&&!/image|banana|tts|embed|transcri/i.test(m))])].filter(m=>cfg.models.includes(m)).slice(0,4);
  for(const m of chat){try{toast('Iššifruojama ('+m+')…',120000);const old=cfg.audioModel;cfg.audioModel=m;
    try{const t=await viaChat(wav);saveCfg();return t}catch(e){cfg.audioModel=old;throw e}}
   catch(e){errs.push(m+': '+e.message)}}}
 const msg=errs.join('\n');
 alert('Garso iššifruoti nepavyko. Nufotografuokite šį langą ir atsiųskite:\n\nGarso modeliai (stt): '+(stt.join(', ')||'nė vieno')+'\n\n'+msg);
 throw new Error(msg.replace(/\n/g,' | '))};

/* AI balsas: modelis iš /v1/models/tts */
const _spk=speak;
speak=async function(t,done){if(cfg.tts?.on&&V?.key){const L=await modelsOf('tts');if(L.length&&!L.includes(cfg.tts.model)){cfg.tts.model=L[0];saveCfg()}}return _spk(t,done)};

/* Nustatymuose: rasti garso ir balso modeliai */
const _setG2=settingsPage;
settingsPage=function(){_setG2();const c=document.createElement('div');c.className='card';
 c.innerHTML='<h4>Garso modeliai iš anymodel.org</h4><div class="row col"><small>Garso iššifravimas (stt)</small><select class="in" id="g2stt"><option>Kraunama…</option></select><small>AI balsas (tts)</small><select class="in" id="g2tts"><option>Kraunama…</option></select></div>';
 pBody.insertBefore(c,pBody.children[2]||null);if(!V?.key)return;
 Promise.all([modelsOf('stt'),modelsOf('tts')]).then(([s,t])=>{
  const fill=(id,L,cur)=>{const el=$(id);if(el)el.innerHTML=L.length?L.map(m=>`<option${m===cur?' selected':''}>${esc(m)}</option>`).join(''):'<option value="">nerasta'+(L.err?' ('+esc(L.err)+')':'')+'</option>'};
  fill('g2stt',s,cfg.sttModel);fill('g2tts',t,cfg.tts?.model);
  $('g2stt')?.addEventListener('change',e=>{if(e.target.value){cfg.sttModel=e.target.value;saveCfg();toast('Išsaugota')}});
  $('g2tts')?.addEventListener('change',e=>{if(e.target.value&&cfg.tts){cfg.tts.model=e.target.value;saveCfg();toast('Išsaugota')}})})};
/* ===== garsas2.js pabaiga ===== */
