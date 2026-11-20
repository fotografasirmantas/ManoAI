'use strict';
/* Mano AI: paieška TIK per Google (v2). Įkelti po paieska.js */
cfg.webProv='url';cfg.webUrlSet=1;cfg.webUrl='https://www.google.com/search?q={q}&hl=lt&gl=lt';saveCfg();
const G_URLS=q=>{const e=encodeURIComponent(q);return['https://www.google.com/search?q='+e+'&hl=lt&gl=lt&num=10','https://www.google.lt/search?q='+e+'&hl=lt','https://www.google.com/search?q='+e]};
const gBlocked=t=>t.length<400||/unusual traffic|captcha|not a robot|recaptcha|\/sorry\/|Our systems have detected/i.test(t);
async function googleSearch(q){let err='';
 for(const u of G_URLS(q)){try{const t=await readPage(u);if(gBlocked(t)){err='Google užblokavo užklausą';}else return{url:u,text:t.slice(0,14000)}}catch(e){err=e.message}
  await new Promise(r=>setTimeout(r,800))}
 throw new Error(err||'Google neatsakė')}
const _cG=callAI;
callAI=async function(all,img){
 if(img||!cfg.f.web)return _cG(all,img);
 const last=[...all].reverse().find(m=>m.role==='user');
 if(last&&!last.webDone){const add=[],txt=last.text||'',urls=txt.match(/https?:\/\/[^\s)]+/g)||[],q=txt.replace(/https?:\/\/\S+/g,'').trim();
  if(q){toast('🌐 Ieškoma Google…',30000);
   try{const r=await googleSearch(q);add.push(T('🌐 Paieška (Google): '+cut(q,40),`[Google paieškos rezultatai, ${new Date().toLocaleString('lt-LT')}, šaltinis: Google (${r.url})]\n\n`+r.text))}
   catch(e){toast('Google paieška nepavyko: '+e.message,7000);
    add.push(T('🌐 Paieška (Google): nepavyko',`[Google paieška nepavyko (${e.message}). Kitos paieškos sistemos nenaudotos. Pasakyk vartotojui, kad paieška šįkart nepavyko, ir neišgalvok atsakymo.]`))}}
  for(const u of urls.slice(0,2)){try{toast('🔗 Skaitomas puslapis…',30000);add.push(T('🔗 '+cut(u,50),'[Puslapio turinys: '+u+']\n'+await readPage(u)))}
   catch(e){toast('Puslapio perskaityti nepavyko: '+e.message,6000)}}
  last.webDone=true;if(add.length){last.att=[...(last.att||[]),...add];save();renderChat()}}
 return _cG(all,img)};
/* Nustatymuose: tik Google */
const _sG=settingsPage;
settingsPage=function(){_sG();const s=$('wProv');if(!s)return;
 const n=document.createElement('div');n.innerHTML='<b>Google</b><small style="display:block;color:var(--mu)">Ieškoma tik per google.com. Kitos sistemos nenaudojamos.</small>';
 s.replaceWith(n);['wTav','wMod','wUrl'].forEach(id=>{const e=$(id);if(e)e.hidden=true})};
/* ===== paieska2.js pabaiga ===== */
