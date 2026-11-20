'use strict';
/* Mano AI: interneto paieška ir puslapių skaitymas. Įkelti PASKUTINĮ */
P.globe='<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>';
if(cfg.f.web===undefined)cfg.f.web=false;
if(!cfg.webProv)cfg.webProv='wiki';
saveCfg();

/* 🌐 mygtukas apačioje */
const wb=document.createElement('button');wb.id='bWeb';wb.className='ib';wb.setAttribute('aria-label','Paieška internete');wb.innerHTML=ic('globe');
$('bMic').before(wb);
const upWeb=()=>wb.classList.toggle('on',!!cfg.f.web);upWeb();
wb.onclick=()=>{cfg.f.web=!cfg.f.web;saveCfg();upWeb();toast(cfg.f.web?'🌐 Paieška internete įjungta':'Paieška internete išjungta')};
const _aT=applyToggles;applyToggles=function(){_aT();upWeb()};

/* Paieškos šaltiniai */
const cut=(s,n)=>String(s||'').replace(/\s+/g,' ').trim().slice(0,n);
async function jget(u,o){const r=await fetch(u,o);const d=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(d.detail?.error||d.error?.message||(typeof d.error==='string'?d.error:'')||d.message||('HTTP '+r.status));return d}
async function wiki(q){const out=[];
 for(const lg of[...new Set([(cfg.voiceLang||'lt-LT').slice(0,2),'en'])]){
  const d=await jget(`https://${lg}.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(cut(q,250))}&gsrlimit=4&prop=extracts|info&inprop=url&exintro=1&explaintext=1&exlimit=4&format=json&origin=*`);
  Object.values(d.query?.pages||{}).sort((a,b)=>(a.index||0)-(b.index||0)).forEach(p=>out.push({title:p.title,url:p.fullurl||`https://${lg}.wikipedia.org/wiki/${encodeURIComponent(p.title)}`,text:cut(p.extract,1500)}));
  if(out.length)break}
 return out}
async function tavily(q){if(!V.tavily)throw new Error('įveskite Tavily raktą nustatymuose');
 const d=await jget('https://api.tavily.com/search',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+V.tavily},
  body:JSON.stringify({api_key:V.tavily,query:cut(q,380),max_results:6,search_depth:'basic',include_answer:true})});
 const r=(d.results||[]).map(x=>({title:x.title,url:x.url,text:cut(x.content,1200)}));
 if(d.answer)r.unshift({title:'Trumpas atsakymas',url:'',text:cut(d.answer,800)});return r}
async function readPage(u){const r=await fetch('https://r.jina.ai/'+u,{headers:{Accept:'text/plain'}});
 if(!r.ok)throw new Error('HTTP '+r.status);return(await r.text()).slice(0,15000)}

/* Prieš siunčiant AI: paieška ir nuorodų skaitymas */
const _cW=callAI;
callAI=async function(all,img){
 if(img)return _cW(all,img);
 const last=[...all].reverse().find(m=>m.role==='user');
 if(last&&!last.webDone){const add=[],txt=last.text||'',urls=txt.match(/https?:\/\/[^\s)]+/g)||[];
  const q=txt.replace(/https?:\/\/\S+/g,'').trim();
  if(cfg.f.web&&cfg.webProv!=='model'&&q){
   try{toast('🌐 Ieškoma internete…',30000);const R=cfg.webProv==='tavily'?await tavily(q):await wiki(q);
    add.push(T('🌐 Paieška: '+cut(q,40),`[Interneto paieškos rezultatai, ${new Date().toLocaleString('lt-LT')}, šaltinis: ${cfg.webProv==='tavily'?'Tavily (visas internetas)':'Vikipedija'}]\n\n`+
     (R.length?R.map((x,i)=>`[${i+1}] ${x.title}${x.url?' – '+x.url:''}\n${x.text}`).join('\n\n'):'(nieko nerasta)')))}
   catch(e){toast('Paieška nepavyko: '+e.message,6000)}}
  for(const u of urls.slice(0,2)){try{toast('🔗 Skaitomas puslapis…',30000);add.push(T('🔗 '+cut(u,50),'[Puslapio turinys: '+u+']\n'+await readPage(u)))}
   catch(e){toast('Puslapio perskaityti nepavyko: '+e.message,6000)}}
  last.webDone=true;if(add.length){last.att=[...(last.att||[]),...add];save();renderChat()}}
 if(cfg.f.web&&cfg.webProv==='model'&&cfg.webModel){const old=cfg.model;cfg.model=cfg.webModel;try{return await _cW(all,img)}finally{cfg.model=old}}
 return _cW(all,img)};

/* AI žino, kad turi paiešką */
const _sW=systemPrompt;
systemPrompt=function(){let s=_sW();
 if(cfg.f.web)s+='\n\nTu TURI interneto paiešką: programėlė ieško už tave. Rezultatai pateikti žinutėje „--- 🌐 Paieška … ---“, o nuorodų turinys „--- 🔗 … ---“. Remkis jais ir prie faktų nurodyk šaltinį nuoroda [pavadinimas](url). Jei rezultatuose atsakymo nėra, taip ir pasakyk. Nesakyk, kad neturi prieigos prie interneto.';
 return s};

/* Nustatymai */
const _sP=settingsPage;
settingsPage=function(){_sP();const sm=cfg.models.filter(m=>/sonar|search|online|perplexity/i.test(m)),ml=sm.length?sm:cfg.models;
 if(!cfg.webModel&&sm.length){cfg.webModel=sm[0];saveCfg()}
 const c=document.createElement('div');c.className='card';
 c.innerHTML=`<h4>Interneto paieška</h4>
<div class="row"><div class="t">Ieškoti internete<small>Tą patį įjungia 🌐 mygtukas apačioje</small></div>${sw('web')}</div>
<div class="row col"><small>Kur ieškoti</small>
<select class="in" id="wProv">${[['wiki','Vikipedija (nemokamai, be rakto)'],['tavily','Tavily – visas internetas (nemokamas raktas)'],['model','AI modelis su paieška']].map(([k,n])=>`<option value="${k}"${cfg.webProv===k?' selected':''}>${n}</option>`).join('')}</select>
<div id="wTav"><small>Tavily raktas (gausite tavily.com, užsiregistravę nemokamai)</small>
<input class="in" id="wKey" type="password" autocomplete="off" placeholder="${V.tavily?'Išsaugotas (…'+esc(V.tavily.slice(-4))+')':'tvly-...'}">
<button class="btn" data-act="wKeySave">Išsaugoti Tavily raktą</button></div>
<div id="wMod"><small>${sm.length?'Modelis su paieška':'Sąraše modelių su „sonar“, „search“ ar „online“ nerasta. Rinkitės kitą būdą.'}</small>
<select class="in" id="wModel">${ml.map(m=>`<option${m===cfg.webModel?' selected':''}>${esc(m)}</option>`).join('')}</select></div>
<small>Įrašius nuorodą (https://…) į žinutę, AI perskaitys tą puslapį.</small></div>`;
 pBody.insertBefore(c,pBody.children[1]||null);
 const vis=()=>{$('wTav').hidden=cfg.webProv!=='tavily';$('wMod').hidden=cfg.webProv!=='model'};vis();
 $('wProv').onchange=e=>{cfg.webProv=e.target.value;saveCfg();vis()};
 $('wModel').onchange=e=>{cfg.webModel=e.target.value;saveCfg()};
 PH.wKeySave=()=>{const v=$('wKey').value.trim();if(v.length<10)return toast('Raktas per trumpas');V.tavily=v;save();toast('Tavily raktas išsaugotas');settingsPage()}};
/* ===== paieska.js pabaiga ===== */
