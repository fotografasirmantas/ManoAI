'use strict';
/* Mano AI: nuotraukų kūrimas per /v1/images/generations. Įkelti paskutinį */
async function genImage(all){
 const last=[...all].reverse().find(m=>m.role==='user'),prompt=(last?.text||'').trim();
 if(!prompt)throw new Error('Aprašykite, kokią nuotrauką sukurti');
 const r=await fetch(cfg.base.replace(/\/+$/,'')+'/images/generations',{method:'POST',
  headers:{'Content-Type':'application/json',Authorization:'Bearer '+V.key},
  body:JSON.stringify({model:cfg.imgModel||'nano-banana',prompt,n:1}),signal:ctrl?.signal});
 const d=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(d.error?.message||('HTTP '+r.status));
 const imgs=[];
 for(const x of d.data||[]){let u=x.b64_json?'data:image/png;base64,'+x.b64_json:x.url;if(!u)continue;
  if(!u.startsWith('data:')){try{u=await readURL(await (await fetch(u)).blob())}catch{}}
  imgs.push(u)}
 if(!imgs.length)throw new Error('anymodel.org negrąžino nuotraukos');
 return{text:'',imgs}}
const _cAv=callAI;
callAI=async function(all,img){
 if(img)return genImage(all);
 try{return await _cAv(all,img)}
 catch(e){if(/kind is "image"|images\/generations/i.test(e.message||'')){toast('Šis modelis kuria nuotraukas, kuriu…',4000);return genImage(all)}throw e}};
/* ===== vaizdai.js pabaiga ===== */
