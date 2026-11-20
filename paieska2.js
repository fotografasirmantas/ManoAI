'use strict';
/* Mano AI: paieška per Google arba bet kurią paieškos sistemą. Įkelti po paieska.js */
const WEB_PRESETS=[['Google','https://www.google.com/search?q={q}&hl=lt'],['Bing','https://www.bing.com/search?q={q}'],['DuckDuckGo','https://html.duckduckgo.com/html/?q={q}'],['Yandex','https://yandex.com/search/?text={q}']];
if(!cfg.webUrlSet){cfg.webProv='url';cfg.webUrl=WEB_PRESETS[0][1];cfg.webUrlSet=1;saveCfg()}
const wsBlocked=t=>t.length<400||/unusual traffic|captcha|not a robot|recaptcha|\/sorry\/|Our systems have detected/i.test(t);
const wsHost=u=>{try{return new URL(u).hostname.replace(/^www\./,'')}catch{return'paieška'}};
async function urlSearch(q){const tpl=cfg.webUrl||WEB_PRESETS[0][1];
 const mk=t=>t.includes('{q}')?t.split('{q}').join(encodeURIComponent(q)):t+encodeURIComponent(q);
 const tries=[[wsHost(tpl),mk(tpl)],...WEB_PRESETS.filter(p=>p[1]!==tpl&&p[0]!=='Yandex').map(p=>[p[0],mk(p[1])])];
 const errs=[];
 for(const[n,u]of tries){try{toast('🌐 Ieškoma: '+n+'…',30000);const t=await readPage(u);if(wsBlocked(t))throw new Error('užblokavo užklausą');
   return[{title:'Paieškos rezultatai iš '+n+' (tikrasis šaltinis, ne Vikipedija)',url:u,text:t.slice(0,12000)}]}
  catch(e){errs.push(n+': '+e.message)}}
 throw new Error(errs.join(' | '))}
const _wikiP=wiki;
wiki=async function(q){return cfg.webProv==='url'?urlSearch(q):_wikiP(q)};

/* Nustatymai: Google ir sava paieškos sistema */
const _sPw=settingsPage;
settingsPage=function(){_sPw();const s=$('wProv');if(!s)return;
 if(!s.querySelector('option[value="url"]')){const o=document.createElement('option');o.value='url';o.textContent='Google / kita paieškos sistema (be rakto)';s.prepend(o)}
 s.value=cfg.webProv;
 const box=document.createElement('div');box.id='wUrl';
 box.innerHTML=`<small>Paieškos adresas ({q} vietoje bus įrašytas jūsų klausimas)</small>
<input class="in" id="wUrlIn" value="${esc(cfg.webUrl||'')}">
<div class="btns">${WEB_PRESETS.map(p=>`<button class="btn" data-act="wPre" data-id="${esc(p[1])}">${p[0]}</button>`).join('')}</div>
<small>Jei pasirinkta sistema užblokuos užklausą, programėlė automatiškai bandys kitas.</small>`;
 s.after(box);
 const vis=()=>{box.hidden=cfg.webProv!=='url'};vis();s.addEventListener('change',vis);
 $('wUrlIn').addEventListener('change',e=>{const v=e.target.value.trim();if(!/^https?:\/\/\S+$/.test(v))return toast('Adresas turi prasidėti https://');cfg.webUrl=v;saveCfg();toast('Išsaugota')});
 PH.wPre=u=>{cfg.webUrl=u;saveCfg();const i=$('wUrlIn');if(i)i.value=u;toast('Pasirinkta')}};
/* ===== paieska2.js pabaiga ===== */
