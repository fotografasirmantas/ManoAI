'use strict';
/* Mano AI, 2 dalis. Veikia tik kartu su app.js */
const APP_VER='v4';
const okUrl=u=>/^https:\/\/anymodel\.org\/\S*$/.test(u)||/^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}):\d+\/\S*$/.test(u);
const URLMSG='Adresas turi prasidėti https://anymodel.org/ arba http://localhost / http://192.168.x.x (lokalūs serveriai)';
const back=()=>{if(history.state&&history.state.o)history.back();else{closeSheet();closePage();closeDrawer();if(LV.on)liveStop()}};
const act=(e,H)=>{const b=e.target.closest('[data-act]');if(b&&H&&H[b.dataset.act])H[b.dataset.act](b.dataset.id,b)};

/* ===== Projektas ===== */
function projPage(id){const p=V.projects.find(x=>x.id===id);if(!p)return colPage('projects');const ch=V.chats.filter(c=>c.projectId===id);
 openPage('proj',p.title,`<div class="card"><div class="row col"><b>Instrukcijos</b><small>${esc(p.text||'Nėra')}</small></div></div>
<button class="btn p w" data-act="newIn">${ic('newc')}Naujas pokalbis projekte</button>
<div class="card" style="margin-top:14px"><h4>Pokalbiai (${ch.length})</h4>${ch.map(c=>`<div class="item" data-act="open" data-id="${c.id}"><span class="t"><span class="tt">${esc(c.title)}</span><small>${fmtD(c.updated)}</small></span></div>`).join('')||'<div class="row mu">Kol kas nėra</div>'}</div>`,
 {newIn:()=>{closePage();temp=false;upTemp();newChat(id)},open:cid=>{closePage();openChat(cid)}})}

/* ===== Biblioteka ===== */
function libraryPage(tab){tab=tab==='file'?'file':'img';const it=[];
 V.chats.forEach(c=>c.msgs.forEach(m=>{(m.att||[]).forEach(a=>it.push({c,img:a.kind==='img',src:a.data,name:a.name,t:m.t}));(m.imgs||[]).forEach(u=>it.push({c,img:true,src:u,name:'Sukurta nuotrauka',t:m.t}))}));
 const L=it.filter(x=>tab==='img'?x.img:!x.img).sort((a,b)=>b.t-a.t);
 const body=!L.length?'<p class="mu" style="padding:12px">Kol kas tuščia</p>':tab==='img'
  ?`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">${L.map(x=>`<button data-act="open" data-id="${x.c.id}"><img src="${esc(x.src)}" alt="" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px;display:block"></button>`).join('')}</div>`
  :`<div class="card">${L.map(x=>`<div class="item" data-act="open" data-id="${x.c.id}">${ic('file')}<span class="t"><span class="tt">${esc(x.name)}</span><small>${fmtD(x.t)} · ${esc(x.c.title)}</small></span></div>`).join('')}</div>`;
 openPage('library','Biblioteka',`<div class="seg" style="margin-bottom:14px"><button class="${tab==='img'?'on':''}" data-act="tab" data-id="img">Nuotraukos</button><button class="${tab==='file'?'on':''}" data-act="tab" data-id="file">Failai</button></div>`+body,
 {tab:t=>libraryPage(t),open:id=>{closePage();openChat(id)}})}

/* ===== Nustatymai ===== */
function settingsPage(){const has=!!V.key,vl=cfg.voiceLang.slice(0,2).toLowerCase();
 const vs=voices().filter(v=>v.lang.replace('_','-').toLowerCase().startsWith(vl));
 const ed=epEdit&&cfg.eps.find(x=>x.id===epEdit);
 const F=[['facts','Faktai'],['links','Mano nuorodos'],['reminders','Priminimai'],['skills','Įgūdžiai'],['projects','Projektų instrukcijos'],['history','Išsaugoti pokalbių istoriją'],['mic','Mikrofonas'],['camera','Kamera'],['imageGen','Nuotraukų kūrimas'],['speak','Live atsako balsu'],['enter','Enter mygtukas siunčia žinutę'],['autolock','Užrakinti po 5 min. nenaudojimo (tik su slaptažodžiu)']];
 openPage('settings','Nustatymai',`
<div class="card"><h4>API raktas</h4><div class="row col">
<div class="keystate ${has?'ok':'no'}">${ic(has?'lock':'unlock')}${has?'Raktas išsaugotas ir užšifruotas (…'+esc(V.key.slice(-4))+')':'Raktas neįvestas'}</div>
<input class="in" id="s_key" type="password" autocomplete="off" placeholder="${has?'Naujas raktas, jei norite pakeisti':'Įklijuokite raktą iš anymodel.org'}">
<div class="btns"><button class="btn p" data-act="saveKey">Išsaugoti raktą</button>${has?'<button class="btn d" data-act="delKey">Ištrinti</button>':''}</div></div></div>

<div class="card"><h4>Pokalbių adresas</h4>
${cfg.eps.map(x=>`<div class="item${x.id===cfg.ep?' sel':''}" data-act="ep" data-id="${x.id}">${ic(x.id===cfg.ep?'check':'link')}<span class="t"><span class="tt">${esc(x.name)}</span><small>${esc(x.url)}</small></span><button class="ib" data-act="epEdit" data-id="${x.id}" aria-label="Redaguoti">${ic('edit')}</button><button class="ib" data-act="epDel" data-id="${x.id}" aria-label="Ištrinti">${ic('trash')}</button></div>`).join('')}
<div class="row col"><b>${ed?'Redaguoti adresą':'Pridėti savo adresą'}</b>
<input class="in" id="s_epn" placeholder="Pavadinimas" value="${esc(ed?.name||'')}">
<input class="in" id="s_epu" type="url" placeholder="https://anymodel.org/v1/..." value="${esc(ed?.url||'')}">
<div class="btns"><button class="btn p" data-act="epSave">${ed?'Išsaugoti':'Pridėti'}</button>${ed?'<button class="btn" data-act="epCancel">Atšaukti</button>':'<button class="btn" data-act="epReset">Atkurti numatytuosius</button>'}</div></div></div>

<div class="card"><h4>Kiti adresai</h4><div class="row col">
<small>Pagrindinis adresas (Base)</small><input class="in" id="s_base" value="${esc(cfg.base)}">
<small>Modelių sąrašas</small><input class="in" id="s_murl" value="${esc(cfg.modelsUrl)}">
<small>Claude žetonų skaičiavimas</small><input class="in" id="s_turl" value="${esc(cfg.tokensUrl)}">
<button class="btn" data-act="saveUrls">Išsaugoti adresus</button></div></div>

<div class="card"><h4>Modeliai</h4><div class="row col">
<small>Modelis nuotraukoms kurti</small><select class="in" id="s_img">${[...new Set([cfg.imgModel,...cfg.models])].filter(Boolean).map(m=>`<option${m===cfg.imgModel?' selected':''}>${esc(m)}</option>`).join('')}</select>
<small>Modelių sąrašas (po vieną eilutėje)</small><textarea class="in" id="s_models" rows="5">${esc(cfg.models.join('\n'))}</textarea>
<div class="btns"><button class="btn p" data-act="saveModels">Išsaugoti</button><button class="btn" data-act="fetch">${ic('refresh')}Gauti iš anymodel.org</button></div></div></div>

<div class="card"><h4>Išvaizda</h4><div class="row col">
<small>Tema</small><div class="seg">${[['light','Šviesi'],['dark','Tamsi'],['auto','Kaip telefone']].map(([k,n])=>`<button class="${cfg.theme===k?'on':''}" data-act="theme" data-id="${k}">${n}</button>`).join('')}</div>
<small>Spalva</small><div class="swatches">${COLORS.map(c=>`<button class="${cfg.accent===c?'on':''}" style="background:${c}" data-act="color" data-id="${c}" aria-label="${c}"></button>`).join('')}<input type="color" id="s_color" value="${esc(cfg.accent)}" aria-label="Sava spalva"></div>
<small>Teksto dydis: <span id="fsv">${cfg.fs}</span> px</small><input type="range" id="s_fs" min="13" max="22" step="1" value="${cfg.fs}"></div></div>

<div class="card"><h4>Balsas ir kalba</h4><div class="row col">
<small>Kalbėjimo ir skaitymo kalba</small><div class="seg">${[['lt-LT','Lietuvių'],['en-US','English'],['ru-RU','Русский']].map(([k,n])=>`<button class="${cfg.voiceLang===k?'on':''}" data-act="vlang" data-id="${k}">${n}</button>`).join('')}</div>
<small>Balsas</small><select class="in" id="s_voice"><option value="">Numatytasis</option>${vs.map(v=>`<option value="${esc(v.voiceURI)}"${v.voiceURI===cfg.voice?' selected':''}>${esc(v.name)}</option>`).join('')}</select>
<small>Greitis: <span id="rv">${cfg.rate}</span></small><input type="range" id="s_rate" min="0.6" max="1.6" step="0.1" value="${cfg.rate}">
<small>AI atsakymų kalba</small><select class="in" id="s_alang">${[['auto','Kaip rašau aš'],['lt','Lietuvių'],['en','English'],['ru','Русский']].map(([k,n])=>`<option value="${k}"${cfg.answerLang===k?' selected':''}>${n}</option>`).join('')}</select>
<button class="btn" data-act="test">${ic('speak')}Išbandyti balsą</button></div></div>

<div class="card"><h4>Funkcijos</h4>${F.map(([k,n])=>`<div class="row"><div class="t">${n}</div>${sw(k)}</div>`).join('')}</div>

<div class="card"><h4>Slaptažodis</h4>${SALT?`<div class="row"><div class="t">Įjungtas<small>Programėlė atrakinama slaptažodžiu</small></div><button class="btn" data-act="disPass">Išjungti</button></div>
<div class="row col"><small>Pakeisti į naują slaptažodį</small>
<input class="in" id="s_p1" type="password" autocomplete="new-password" placeholder="Naujas slaptažodis">
<input class="in" id="s_p2" type="password" autocomplete="new-password" placeholder="Pakartokite">
<button class="btn" data-act="pass">Pakeisti slaptažodį</button></div>`
:`<div class="row"><div class="t">Išjungtas<small>Programėlė atsidaro iškart</small></div></div>
<div class="row col"><small>Įjungti slaptažodį (bent 8 simboliai)</small>
<input class="in" id="s_p1" type="password" autocomplete="new-password" placeholder="Slaptažodis">
<input class="in" id="s_p2" type="password" autocomplete="new-password" placeholder="Pakartokite">
<button class="btn p" data-act="enPass">Įjungti slaptažodį</button></div>`}</div>

<div class="card"><h4>Duomenys</h4><div class="row col"><button class="btn d" data-act="clearHist">${ic('trash')}Ištrinti visus pokalbius</button><button class="btn d" data-act="wipe">${ic('trash')}Ištrinti visus duomenis</button></div></div>`,{
 saveKey:()=>{const v=$('s_key').value.trim();if(v.length<8)return toast('Raktas per trumpas');V.key=v;save();toast('Raktas užšifruotas ir išsaugotas');settingsPage()},
 delKey:()=>{if(confirm('Ištrinti API raktą?')){V.key='';save();settingsPage()}},
 ep:id=>{cfg.ep=id;saveCfg();settingsPage()},
 epEdit:id=>{epEdit=id;settingsPage()},
 epDel:id=>{if(cfg.eps.length<2)return toast('Turi likti bent vienas adresas');if(!confirm('Ištrinti šį adresą?'))return;
  cfg.eps=cfg.eps.filter(x=>x.id!==id);if(cfg.ep===id)cfg.ep=cfg.eps[0].id;if(epEdit===id)epEdit=null;saveCfg();settingsPage()},
 epSave:()=>{const n=$('s_epn').value.trim(),u=$('s_epu').value.trim();if(!n)return toast('Įrašykite pavadinimą');if(!okUrl(u))return toast(URLMSG);
  const e=epEdit&&cfg.eps.find(x=>x.id===epEdit);if(e)Object.assign(e,{name:n,url:u});else cfg.eps.push({id:uid(),name:n,url:u});
  epEdit=null;saveCfg();settingsPage();toast('Išsaugota')},
 epCancel:()=>{epEdit=null;settingsPage()},
 epReset:()=>{if(confirm('Atkurti numatytuosius adresus?')){cfg.eps=JSON.parse(JSON.stringify(EPS));cfg.ep='chat';saveCfg();settingsPage()}},
 saveUrls:()=>{const b=$('s_base').value.trim(),m=$('s_murl').value.trim(),t=$('s_turl').value.trim();if(![b,m,t].every(okUrl))return toast(URLMSG);
  Object.assign(cfg,{base:b,modelsUrl:m,tokensUrl:t});saveCfg();toast('Išsaugota')},
 saveModels:()=>{const l=[...new Set($('s_models').value.split('\n').map(s=>s.trim()).filter(Boolean))];if(!l.length)return toast('Sąrašas tuščias');
  cfg.models=l;if(!l.includes(cfg.model))cfg.model=l[0];saveCfg();upModel();toast('Išsaugota');settingsPage()},
 fetch:async()=>{await fetchModels();settingsPage()},
 theme:k=>{cfg.theme=k;saveCfg();applyLook();settingsPage()},
 color:c=>{cfg.accent=c;saveCfg();applyLook();settingsPage()},
 vlang:k=>{cfg.voiceLang=k;cfg.voice='';saveCfg();settingsPage()},
 test:()=>speak({'lt-LT':'Labas! Taip skamba mano balsas.','en-US':'Hello! This is how my voice sounds.','ru-RU':'Привет! Так звучит мой голос.'}[cfg.voiceLang]),
 enPass:async()=>{const a=$('s_p1').value,b=$('s_p2').value;if(a.length<8)return toast('Slaptažodis turi būti bent 8 simbolių');if(a!==b)return toast('Slaptažodžiai nesutampa');
  SALT=crypto.getRandomValues(new Uint8Array(16));KEY=await derive(a,SALT);await saveNow();toast('Slaptažodis įjungtas');settingsPage()},
 pass:async()=>{const a=$('s_p1').value,b=$('s_p2').value;if(a.length<8)return toast('Slaptažodis turi būti bent 8 simbolių');if(a!==b)return toast('Slaptažodžiai nesutampa');
  SALT=crypto.getRandomValues(new Uint8Array(16));KEY=await derive(a,SALT);await saveNow();toast('Slaptažodis pakeistas');settingsPage()},
 disPass:async()=>{if(!confirm('Išjungti slaptažodį? Programėlė daugiau nebeprašys slaptažodžio.'))return;KEY=await devKey();SALT=null;await saveNow();toast('Slaptažodis išjungtas');settingsPage()},
 clearHist:()=>{if(confirm('Ištrinti visus pokalbius? To atšaukti negalima.')){V.chats=[];newChat();save();toast('Pokalbiai ištrinti')}},
 wipe:async()=>{if(confirm('Ištrinti VISKĄ: raktą, pokalbius, faktus ir nustatymus?')&&confirm('Tikrai? To atšaukti negalima.')){await iclear();localStorage.removeItem('mai_cfg');location.reload()}},
 input:t=>{if(t.id==='s_fs'){cfg.fs=+t.value;$('fsv').textContent=t.value;applyLook();saveCfg()}
  if(t.id==='s_rate'){cfg.rate=+t.value;$('rv').textContent=t.value;saveCfg()}
  if(t.id==='s_color'){cfg.accent=t.value;applyLook();saveCfg()}},
 ch:t=>{if(t.id==='s_voice')cfg.voice=t.value;if(t.id==='s_alang')cfg.answerLang=t.value;if(t.id==='s_img')cfg.imgModel=t.value;saveCfg()}});
 /* Versijos užrašas pačioje apačioje (po visų kitų skilčių) */
 queueMicrotask(()=>{if(curPage!=='settings')return;$('verFoot')?.remove();const p=document.createElement('p');p.id='verFoot';
  p.style.cssText='text-align:center;color:var(--mu);font-size:.75rem;margin:20px 0 0;padding:12px 0 0;border-top:1px solid var(--ln)';
  p.textContent='Mano AI · Versija '+APP_VER;pBody.appendChild(p)})}

/* ===== Importavimas ===== */
$('fImport').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f||!impTarget||!V)return;
 const txt=await f.text(),L=V[impTarget],add=o=>{if(L.length<2000){L.push({id:uid(),on:true,created:Date.now(),...o});n++}};let n=0;
 const un=s=>s.replace(/\\n/gi,' ').replace(/\\([,;\\])/g,'$1').trim();
 if(impTarget==='reminders'&&/BEGIN:VEVENT/.test(txt)){
  txt.replace(/\r?\n[ \t]/g,'').split('BEGIN:VEVENT').slice(1).forEach(b=>{const s=(b.match(/^SUMMARY[^:\n]*:(.*)$/m)||[])[1];if(!s)return;
   const d=b.match(/^DTSTART[^:\n]*:(\d{8})(?:T(\d{4}))?/m);let date='';
   if(d)date=d[1].slice(0,4)+'-'+d[1].slice(4,6)+'-'+d[1].slice(6,8)+'T'+(d[2]?d[2].slice(0,2)+':'+d[2].slice(2,4):'09:00');
   add({title:un(s).slice(0,200),date})})}
 else txt.split(/\r?\n/).map(l=>l.trim()).filter(Boolean).forEach(l=>{
  if(impTarget==='links'){const m=l.match(/https?:\/\/[^\s,;]+/);if(!m)return;
   const title=l.replace(m[0],'').replace(/^[\s,;|:–-]+|[\s,;|:–-]+$/g,'')||m[0].split('/')[2];add({title:title.slice(0,120),url:m[0]})}
  else if(impTarget==='reminders')add({title:l.slice(0,200),date:''});
  else add({text:l.slice(0,1000)})});
 save();colPage(impTarget);toast('Importuota: '+n)};

/* ===== Užraktas ir paleistis be slaptažodžio ===== */
async function devKey(){let k=await iget('devkey');if(!k){k=await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']);await iset('devkey',k)}return k}
let hasVault=false,fails=0,waitUntil=0,lastAct=Date.now(),hiddenAt=0;
function showLock(){$('lock').hidden=false;$('lockPass').value='';$('lockErr').textContent='';
 $('lockBtn').textContent='Atrakinti';$('lockHint').textContent='Įveskite slaptažodį'}
async function doUnlock(){const p=$('lockPass').value,err=$('lockErr');
 if(Date.now()<waitUntil){err.textContent='Palaukite '+Math.ceil((waitUntil-Date.now())/1000)+' s';return}
 $('lockBtn').disabled=true;err.textContent='';
 try{const v=await iget('vault');if(!v||!v.salt)throw new Error('Duomenų nerasta. Spauskite „Pamiršau slaptažodį“.');
  const k=await derive(p,v.salt);let pt;
  try{pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:v.iv},k,v.ct)}catch{fails++;waitUntil=Date.now()+Math.min(60,2**fails)*1000;throw new Error('Neteisingas slaptažodis')}
  SALT=v.salt;KEY=k;fails=0;V={...blank(),...JSON.parse(td.decode(pt))};afterUnlock()}
 catch(e){err.textContent=e.message}finally{$('lockBtn').disabled=false}}
function afterUnlock(){$('lock').hidden=true;$('lockPass').value='';lastAct=Date.now();
 busy=false;applyToggles();upModel();upTemp();newChat();upGo();if(!V.key){toast('Įveskite API raktą');settingsPage()}}
async function lockNow(){if(!V)return;if(!SALT){toast('Slaptažodis išjungtas');return}if(LV.on)liveStop();if(ctrl)ctrl.abort();await saveNow();
 KEY=null;V=null;cur=null;pending=[];imageMode=false;renderPending();closeSheet();closePage();closeDrawer();msgsEl.innerHTML='';showLock()}
['pointerdown','keydown'].forEach(ev=>addEventListener(ev,()=>{lastAct=Date.now()},true));
document.addEventListener('visibilitychange',()=>{if(document.hidden){hiddenAt=Date.now();if(V)saveNow()}
 else if(cfg.f.autolock&&V&&hiddenAt&&Date.now()-hiddenAt>3e5&&SALT)lockNow()});
setInterval(()=>{if(cfg.f.autolock&&V&&!busy&&!LV.on&&SALT&&Date.now()-lastAct>3e5)lockNow()},3e4);

/* Meniu: „Užrakinti“ rodomas tik kai slaptažodis įjungtas */
const _renderDrawer=renderDrawer;
renderDrawer=function(){_renderDrawer();if(!SALT){const l=drawerEl.querySelector('[data-id="lock"]');if(l)l.hidden=true}};

/* ===== Mygtukai ir įvykiai ===== */
$('bGo').onclick=()=>{if(busy){if(ctrl)ctrl.abort();return}if(inputEl.value.trim()||pending.length)send();else liveStart()};
inputEl.addEventListener('input',()=>{grow();upGo()});
inputEl.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&cfg.f.enter){e.preventDefault();send()}});
$('bMic').onclick=dictate;$('bPlus').onclick=plusSheet;$('bModel').onclick=modelSheet;$('bMenu').onclick=openDrawer;
$('bNew').onclick=()=>{temp=false;upTemp();newChat()};
$('bTemp').onclick=()=>{temp=!temp;upTemp();newChat();toast(temp?'Laikinas pokalbis įjungtas':'Laikinas pokalbis išjungtas')};
['fCam','fImg','fAny'].forEach(id=>{$(id).onchange=async e=>{const l=[...e.target.files];e.target.value='';await addFiles(l)}});
msgsEl.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||!cur)return;const i=+b.dataset.i,m=cur.msgs[i];if(!m)return;
 if(b.dataset.act==='copy')navigator.clipboard?.writeText(plain(m.text)).then(()=>toast('Nukopijuota'),()=>toast('Nepavyko nukopijuoti'));
 if(b.dataset.act==='speak'){if('speechSynthesis' in window&&speechSynthesis.speaking)speechSynthesis.cancel();else speak(m.text)}
 if(b.dataset.act==='retry'&&!busy){cur.msgs.splice(i,1);runAI(false)}});
pendEl.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;
 if(b.dataset.act==='rm')pending.splice(+b.dataset.i,1);if(b.dataset.act==='noGen')imageMode=false;renderPending()});
drawerEl.addEventListener('click',e=>act(e,DH));drawerEl.addEventListener('input',e=>DH.input(e.target));
sheetEl.addEventListener('click',e=>act(e,SH));sheetEl.addEventListener('input',e=>SH.input&&SH.input(e.target));
pageEl.addEventListener('click',e=>act(e,PH));
pageEl.addEventListener('input',e=>PH.input&&PH.input(e.target));
pageEl.addEventListener('change',e=>{const t=e.target;if(t.dataset.ch==='f'){cfg.f[t.dataset.k]=t.checked;saveCfg();applyToggles()}else if(PH.ch)PH.ch(t)});
scrimEl.onclick=back;$('pBack').onclick=back;
$('lCam').onclick=camToggle;$('lEnd').onclick=back;
liveEl.addEventListener('click',e=>{if(!e.target.closest('.lb')&&'speechSynthesis' in window&&speechSynthesis.speaking)speechSynthesis.cancel()});
addEventListener('popstate',()=>{if(!sheetEl.hidden)closeSheet();else if(!liveEl.hidden)liveStop();else if(!pageEl.hidden)closePage();else if(drawerEl.classList.contains('open'))closeDrawer();
 if(!sheetEl.hidden||!liveEl.hidden||!pageEl.hidden||drawerEl.classList.contains('open'))pushO()});
if('speechSynthesis' in window)speechSynthesis.onvoiceschanged=()=>{if(curPage==='settings')settingsPage()};
$('lockBtn').onclick=()=>doUnlock();
$('lockPass').addEventListener('keydown',e=>{if(e.key==='Enter')doUnlock()});

/* ===== Paleidimas ===== */
(async()=>{
 ['key','pass','hist','apiKey','passphrase','history','models','ep','endpoint','last','lastModel','lang','baseUrl'].forEach(k=>{try{localStorage.removeItem(k)}catch{}});
 applyLook();setIcons();applyToggles();upModel();upGo();
 try{navigator.storage?.persist?.()}catch{}
 if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
 const fb=document.createElement('button');fb.id='lockForgot';fb.className='btn';fb.style.cssText='background:none;color:var(--mu)';fb.textContent='Pamiršau slaptažodį';
 fb.onclick=async()=>{if(confirm('Bus ištrinta VISKAS: raktas, pokalbiai, faktai. Tęsti?')){await iclear();location.reload()}};
 $('lockErr').after(fb);
 let v=null;try{v=await iget('vault')}catch{}
 if(v&&v.salt){hasVault=true;showLock();return}
 try{KEY=await devKey();SALT=null;
  V=v?{...blank(),...JSON.parse(td.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:v.iv},KEY,v.ct)))}:blank();
  if(!v)await saveNow();afterUnlock()}
 catch{hasVault=true;showLock();$('lockErr').textContent='Nepavyko atidaryti duomenų. Spauskite „Pamiršau slaptažodį“, kad pradėtumėte iš naujo.'}
})();
/* ===== app2.js pabaiga ===== */

/* ===== Pokalbių meniu: ilgas paspaudimas, prisegimas, pervadinimas ===== */
P.more='<circle cx="5" cy="12" r="1.8" fill="currentColor"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/><circle cx="19" cy="12" r="1.8" fill="currentColor"/>';
P.pin='<path d="M12 17v5M9 3h6l-1 6 4 4H6l4-4z"/>';
(()=>{const s=document.createElement('style');s.textContent='#dList .item{user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}#dList .item>.ic{width:16px;height:16px;color:var(--a)}';document.head.appendChild(s)})();

function renderList(){const q=dq.trim().toLowerCase();
 const L=V.chats.filter(c=>{const fi=c.msgs.flatMap(m=>(m.att||[]).filter(a=>a.kind!=='img')),hasImg=c.msgs.some(m=>(m.att||[]).some(a=>a.kind==='img')||(m.imgs||[]).length);
  if(fdate&&dayStr(c.created)!==fdate&&!c.msgs.some(m=>dayStr(m.t)===fdate))return false;
  if(flt.imgs&&!hasImg)return false;if(flt.files&&!fi.length)return false;if(!q)return true;
  return(flt.title&&c.title.toLowerCase().includes(q))||(flt.text&&c.msgs.some(m=>(m.text||'').toLowerCase().includes(q)))||(flt.files&&fi.some(a=>a.name.toLowerCase().includes(q)))||(!flt.title&&!flt.text&&!flt.files&&c.title.toLowerCase().includes(q))
 }).sort((a,b)=>(b.pin?1:0)-(a.pin?1:0)||b.updated-a.updated);
 $('dList').innerHTML=L.map(c=>{const pn=c.projectId&&V.projects.find(p=>p.id===c.projectId);
  return `<div class="item${cur&&cur.id===c.id?' cur':''}" data-act="open" data-id="${c.id}" data-chat="${c.id}">${c.pin?ic('pin'):''}<span class="t"><span class="tt">${esc(c.title)}</span><small>${fmtD(c.updated)}${pn?' · '+esc(pn.title):''}</small></span><button class="ib" data-act="more" data-id="${c.id}" aria-label="Daugiau">${ic('more')}</button></div>`}).join('')||'<p class="mu" style="padding:12px">Pokalbių nerasta</p>'}

chatMore=function(id){const c=V.chats.find(x=>x.id===id);if(!c)return;
 try{navigator.vibrate&&navigator.vibrate(15)}catch{}
 const done=t=>{back();renderList();if(t)toast(t)};
 openSheet(`<h3>${esc(c.title)}</h3>
<div class="item" data-act="pin">${ic('pin')}<span class="t">${c.pin?'Atsegti':'Prisegti viršuje'}</span></div>
<div class="item" data-act="ren">${ic('edit')}<span class="t">Pervadinti</span></div>
<div class="item" data-act="proj">${ic('folder')}<span class="t">Priskirti projektui</span></div>
<div class="item" data-act="copy">${ic('copy')}<span class="t">Kopijuoti visą pokalbį</span></div>
<div class="item" data-act="del" style="color:var(--red)">${ic('trash')}<span class="t">Ištrinti</span></div>`,{
 pin:()=>{c.pin=!c.pin;save();done(c.pin?'Prisegta':'Atsegta')},
 ren:()=>{openSheet(`<h3>Pervadinti</h3><input class="in" id="renIn" maxlength="80" value="${esc(c.title)}"><div class="btns"><button class="btn" data-act="no">Atšaukti</button><button class="btn p" data-act="ok">Išsaugoti</button></div>`,{
   ok:()=>{const n=$('renIn').value.trim();if(!n)return toast('Įrašykite pavadinimą');c.title=n.slice(0,80);save();done('Pervadinta')},no:()=>back()});
  setTimeout(()=>{const i=$('renIn');if(!i)return;i.focus();i.select();i.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();SH.ok&&SH.ok()}})},60)},
 proj:()=>openSheet(`<h3>Projektas</h3><div class="list"><div class="item${!c.projectId?' sel':''}" data-act="set" data-id="">${ic('x')}<span class="t">Be projekto</span></div>${V.projects.map(p=>`<div class="item${c.projectId===p.id?' sel':''}" data-act="set" data-id="${p.id}">${ic('folder')}<span class="t">${esc(p.title)}</span></div>`).join('')}</div>${V.projects.length?'':'<p class="mu" style="padding:8px 12px">Projektų dar nėra. Juos sukursite meniu → Projektai.</p>'}`,
   {set:pid=>{c.projectId=pid||null;save();done('Išsaugota')}}),
 copy:()=>{const t=c.msgs.filter(m=>!m.loading).map(m=>(m.role==='user'?'Aš: ':'AI: ')+plain(m.text||'')).join('\n\n');
  navigator.clipboard?.writeText(t).then(()=>done('Pokalbis nukopijuotas'),()=>toast('Nepavyko nukopijuoti'))},
 del:()=>openSheet(`<h3>Ištrinti pokalbį?</h3><p class="mu" style="margin:0 4px 8px">„${esc(c.title)}“ bus ištrintas visam laikui.</p><div class="btns"><button class="btn" data-act="no">Atšaukti</button><button class="btn d" data-act="ok">Ištrinti</button></div>`,{
   ok:()=>{V.chats=V.chats.filter(x=>x!==c);if(cur===c)newChat();save();done('Ištrinta')},no:()=>back()})})};

/* Ilgas paspaudimas ant pokalbio */
let lpT=0,lpDone=false,lpX=0,lpY=0;
drawerEl.addEventListener('pointerdown',e=>{lpDone=false;const it=e.target.closest('[data-chat]');if(!it||e.target.closest('[data-act="more"]'))return;
 lpX=e.clientX;lpY=e.clientY;clearTimeout(lpT);lpT=setTimeout(()=>{lpDone=true;chatMore(it.dataset.chat)},500)});
['pointerup','pointercancel'].forEach(ev=>drawerEl.addEventListener(ev,()=>clearTimeout(lpT)));
drawerEl.addEventListener('pointermove',e=>{if(Math.abs(e.clientX-lpX)>10||Math.abs(e.clientY-lpY)>10)clearTimeout(lpT)});
drawerEl.addEventListener('contextmenu',e=>{const it=e.target.closest('[data-chat]');if(!it)return;e.preventDefault();clearTimeout(lpT);if(!lpDone){lpDone=true;chatMore(it.dataset.chat)}});
drawerEl.addEventListener('click',e=>{if(lpDone){lpDone=false;e.stopImmediatePropagation();e.preventDefault()}},true);
/* ===== Pokalbių meniu pabaiga ===== */
