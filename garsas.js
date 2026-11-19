'use strict';
/* Mano AI: garso įrašų iššifravimas su atsarginiu būdu. Įkelti po failai.js */
if(!cfg.audioModel)cfg.audioModel='gemini-2.5-flash';saveCfg();
const AB=()=>cfg.base.replace(/\/+$/,'');

/* Bet koks garso failas → WAV 16 kHz mono */
async function toWav(blob){const C=window.AudioContext||window.webkitAudioContext,ac=new C();let buf;
 try{buf=await ac.decodeAudioData(await blob.arrayBuffer())}finally{try{ac.close()}catch{}}
 if(buf.duration>900)throw new Error('įrašas ilgesnis nei 15 min.');
 const sr=16000,off=new OfflineAudioContext(1,Math.ceil(buf.duration*sr),sr),s=off.createBufferSource();s.buffer=buf;s.connect(off.destination);s.start();
 const d=(await off.startRendering()).getChannelData(0),b=new ArrayBuffer(44+d.length*2),v=new DataView(b);
 const w=(o,t)=>{for(let i=0;i<t.length;i++)v.setUint8(o+i,t.charCodeAt(i))};
 w(0,'RIFF');v.setUint32(4,36+d.length*2,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);
 v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,d.length*2,true);
 for(let i=0;i<d.length;i++){const x=Math.max(-1,Math.min(1,d[i]));v.setInt16(44+i*2,x<0?x*0x8000:x*0x7fff,true)}
 return new Blob([b],{type:'audio/wav'})}

/* Atsarginis būdas: garsą supratantis modelis per pokalbių adresą */
async function viaChat(wav){const u=await readURL(wav),b64=u.slice(u.indexOf(',')+1);
 const r=await fetch(AB()+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+V.key},
  body:JSON.stringify({model:cfg.audioModel,messages:[{role:'user',content:[
   {type:'text',text:'Tiksliai iššifruok šį garso įrašą į tekstą ta kalba, kuria kalbama. Grąžink tik iššifruotą tekstą, nieko nepridėk ir neišgalvok. Jei kalbos negirdi, parašyk „(kalbos nerasta)“.'},
   {type:'input_audio',input_audio:{data:b64,format:'wav'}}]}]})});
 const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error?.message||('HTTP '+r.status));
 const m=d.choices?.[0]?.message?.content;const t=typeof m==='string'?m:(m||[]).map(p=>p.text||'').join('');if(!t.trim())throw new Error('tuščias atsakymas');return t}

transcribe=async function(blob,name){const errs=[];let wav=null;
 toast('Ruošiamas garso įrašas…',120000);
 try{wav=await toWav(blob)}catch(e){errs.push('konvertavimas: '+e.message)}
 for(const m of[cfg.sttModel,'whisper-1','gpt-4o-mini-transcribe'].filter((x,i,a)=>x&&a.indexOf(x)===i)){
  try{toast('Iššifruojama ('+m+')…',120000);const fd=new FormData();fd.append('file',wav||blob,wav?'irasas.wav':name);fd.append('model',m);
   const r=await fetch(AB()+'/audio/transcriptions',{method:'POST',headers:{Authorization:'Bearer '+V.key},body:fd});
   const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error?.message||('HTTP '+r.status));
   if(typeof d.text==='string')return d.text;throw new Error('neatsakė tekstu')}
  catch(e){errs.push(m+': '+e.message);if(/HTTP 404|not found/i.test(e.message))break}}
 if(wav){try{toast('Iššifruojama ('+cfg.audioModel+')…',120000);return await viaChat(wav)}catch(e){errs.push(cfg.audioModel+': '+e.message)}}
 throw new Error(errs.join(' | '))};

/* Nustatymuose: garso modelio pasirinkimas */
const _setG=settingsPage;
settingsPage=function(){_setG();const c=document.createElement('div');c.className='card';
 c.innerHTML=`<h4>Garso įrašai</h4><div class="row col"><small>Modelis, kuris supranta garsą (įrašykite tikslų pavadinimą iš modelių sąrašo, pvz. su „gemini“ ar „audio“)</small>
<input class="in" id="audM" value="${esc(cfg.audioModel)}"></div>`;
 pBody.insertBefore(c,pBody.children[2]||null);
 $('audM').addEventListener('change',e=>{cfg.audioModel=e.target.value.trim()||'gemini-2.5-flash';saveCfg();toast('Išsaugota')})};
/* ===== garsas.js pabaiga ===== */
