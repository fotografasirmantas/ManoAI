'use strict';
/* Mano AI: garso modelių paieška ir tiksli klaida. Įkelti po garsas.js */
let audCands=null;
async function audioModels(){if(audCands)return audCands;
 try{const r=await fetch(cfg.modelsUrl,{headers:{Authorization:'Bearer '+V.key}});const d=await r.json();
  audCands=(d.data||d.models||[]).map(m=>({id:m.id||m.name||m,k:String(m.kind||m.type||m.capability||'')}))
   .filter(m=>typeof m.id==='string'&&/transcri|whisper|stt|asr|speech.?to|audio/i.test(m.id+' '+m.k)&&!/tts|text.?to.?speech|realtime/i.test(m.id+' '+m.k))
   .map(m=>m.id)}catch{audCands=[]}
 return audCands}
transcribe=async function(blob,name){const errs=[];let wav=null;
 toast('Ruošiamas garso įrašas…',120000);
 try{wav=await toWav(blob)}catch(e){errs.push('konvertavimas: '+e.message)}
 const list=[cfg.sttModel,...await audioModels(),'whisper-1','gpt-4o-transcribe','gpt-4o-mini-transcribe'].filter((x,i,a)=>x&&a.indexOf(x)===i).slice(0,8);
 for(const m of list){
  try{toast('Iššifruojama ('+m+')…',120000);const fd=new FormData();fd.append('file',wav||blob,wav?'irasas.wav':name);fd.append('model',m);
   const r=await fetch(AB()+'/audio/transcriptions',{method:'POST',headers:{Authorization:'Bearer '+V.key},body:fd});
   const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error?.message||('HTTP '+r.status));
   if(typeof d.text==='string'){if(cfg.sttModel!==m){cfg.sttModel=m;saveCfg()}return d.text}
   throw new Error('neatsakė tekstu')}
  catch(e){errs.push(m+': '+e.message)}}
 if(wav){try{toast('Iššifruojama ('+cfg.audioModel+')…',120000);return await viaChat(wav)}catch(e){errs.push(cfg.audioModel+': '+e.message)}}
 const msg=errs.join('\n');
 alert('Garso iššifruoti nepavyko. Nufotografuokite šį langą ir atsiųskite:\n\nRasti garso modeliai: '+((audCands||[]).join(', ')||'nė vieno')+'\n\n'+msg);
 throw new Error(msg.replace(/\n/g,' | '))};
/* ===== garsas2.js pabaiga ===== */
