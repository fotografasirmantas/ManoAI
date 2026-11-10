'use strict';
const $=id=>document.getElementById(id);
const te=new TextEncoder(),td=new TextDecoder();
const msgsEl=$('msgs'),inputEl=$('input'),pendEl=$('pending'),drawerEl=$('drawer'),sheetEl=$('sheet'),pageEl=$('page'),pBody=$('pBody'),liveEl=$('live'),scrimEl=$('scrim');

/* ===== Ikonos ===== */
const P={
menu:'<path d="M4 8h16M4 16h10"/>',chev:'<path d="m6 9 6 6 6-6"/>',
newc:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
temp:'<circle cx="12" cy="12" r="9" stroke-dasharray="3 3"/>',plus:'<path d="M12 5v14M5 12h14"/>',
mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
send:'<path d="M12 19V5M5 12l7-7 7 7"/>',wave:'<path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4"/>',
stop:'<rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor"/>',
cam:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
img:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
file:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
spark:'<path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/>',
x:'<path d="M18 6 6 18M6 6l12 12"/>',back:'<path d="M15 18l-6-6 6-6"/>',
search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
unlock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.8-1"/>',
trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
edit:'<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
copy:'<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
speak:'<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
lib:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
fact:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
skill:'<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',check:'<path d="M20 6 9 17l-5-5"/>',
refresh:'<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',upload:'<path d="M12 15V3M7 8l5-5 5 5M5 21h14"/>'};
const ic=n=>`<span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${P[n]||''}</svg></span>`;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);
const fmtD=t=>new Date(t).toLocaleString('lt-LT',{dateStyle:'short',timeStyle:'short'});
const dayStr=t=>{const d=new Date(t);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
let toastT;function toast(s){const t=$('toast');t.textContent=s;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),3000)}

/* ===== Nustatymai ===== */
const EPS=[{id:'chat',name:'Chat (numatytasis)',url:'https://anymodel.org/v1/chat/completions'},{id:'resp',name:'Responses',url:'https://anymodel.org/v1/responses'},{id:'claude',name:'Claude messages',url:'https://anymodel.org/v1/messages'}];
const COLORS=['#0866ff','#0a7cff','#00a884','#7c3aed','#e5484d','#f59e0b','#111111'];
const DEF={theme:'auto',accent:'#0866ff',fs:16,model:'',imgModel:'nano-banana',models:['claude-opus-5-5','claude-sonnet-5-5','nano-banana'],
 base:'https://anymodel.org/v1',modelsUrl:'https://anymodel.org/v1/models',tokensUrl:'https://anymodel.org/v1/messages/count_tokens',
 ep:'chat',eps:null,voiceLang:'lt-LT',voice:'',rate:1,answerLang:'auto',
 f:{facts:true,links:true,reminders:true,skills:true,projects:true,history:true,autolock:true,speak:true,mic:true,camera:true,imageGen:true,enter:false}};
let cfg;try{cfg=JSON.parse(localStorage.getItem('mai_cfg')||'{}')}catch{cfg={}}
cfg={...DEF,...cfg,f:{...DEF.f,...(cfg.f||{})}};
if(!Array.isArray(cfg.eps)||!cfg.eps.length)cfg.eps=JSON.parse(JSON.stringify(EPS));
if(!cfg.model)cfg.model=cfg.models[0]||'';
const saveCfg=()=>{try{localStorage.setItem('mai_cfg',JSON.stringify(cfg))}catch{}};

/* ===== Šifruota saugykla ===== */
const dbP=new Promise((res,rej)=>{const r=indexedDB.open('manoai',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
async function idb(mode,fn){const d=await dbP;return new Promise((res,rej)=>{const t=d.transaction('kv',mode),r=fn(t.objectStore('kv'));t.oncomplete=()=>res(r&&r.result);t.onerror=()=>rej(t.error)})}
const iget=k=>idb('readonly',s=>s.get(k)),iset=(k,v)=>idb('readwrite',s=>s.put(v,k)),iclear=()=>idb('readwrite',s=>s.clear());
async function derive(pass,salt){const k=await crypto.subtle.importKey('raw',te.encode(pass),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:310000,hash:'SHA-256'},k,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
let KEY=null,SALT=null,V=null;
const blank=()=>({key:'',chats:[],projects:[],facts:[],links:[],reminders:[],skills:[]});
let saveT;function save(){clearTimeout(saveT);saveT=setTimeout(saveNow,400)}
async function saveNow(){clearTimeout(saveT);if(!KEY||!V)return;const iv=crypto.getRandomValues(new Uint8Array(12));const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},KEY,te.encode(JSON.stringify(V)));await iset('vault',{salt:SALT,iv,ct})}

/* ===== Būsena ===== */
let cur=null,temp=false,curProject=null,pending=[],imageMode=false,busy=false,ctrl=null,PH={},SH={},curPage='',epEdit=null,impTarget=null;
let dq='',flt={title:true,text:true,files:false,imgs:false},fdate='';
const LV={on:false,cam:null,rec:null};
const voices=()=>('speechSynthesis' in window)?speechSynthesis.getVoices():[];
const SRc=()=>window.SpeechRecognition||window.webkitSpeechRecognition;

/* ===== Išvaizda ===== */
function applyLook(){const dark=cfg.theme==='dark'||(cfg.theme==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches);
 document.documentElement.dataset.theme=dark?'dark':'light';const r=document.documentElement.style;r.setProperty('--a',cfg.accent);r.setProperty('--fs',cfg.fs+'px');
 document.querySelector('meta[name=theme-color]').content=dark?'#171717':'#ffffff'}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applyLook);
function setIcons(){$('bMenu').innerHTML=ic('menu');$('bModel').innerHTML='<span id="modelName"></span>'+ic('chev');$('bTemp').innerHTML=ic('temp');$('bNew').innerHTML=ic('newc');
 $('bPlus').innerHTML=ic('plus');$('bMic').innerHTML=ic('mic');$('pBack').innerHTML=ic('back');$('lCam').innerHTML=ic('cam');$('lEnd').innerHTML=ic('x');$('lockLogo').innerHTML=ic('lock')}
function applyToggles(){$('bMic').hidden=!cfg.f.mic;$('lCam').hidden=!cfg.f.camera}
function upModel(){$('modelName').textContent=cfg.model||'Pasirinkite modelį'}
function upTemp(){$('bTemp').classList.toggle('on',temp);$('tempBar').hidden=!temp;$('tempBar').textContent='Laikinas pokalbis: neišsaugomas ir dingsta jį uždarius'}
function upGo(){const b=$('bGo');if(busy){b.innerHTML=ic('stop');b.ariaLabel='Sustabdyti'}else if(inputEl.value.trim()||pending.length){b.innerHTML=ic('send');b.ariaLabel='Siųsti'}else{b.innerHTML=ic('wave');b.ariaLabel='Live pokalbis'}}
function grow(){inputEl.style.height='auto';inputEl.style.height=Math.min(inputEl.scrollHeight,innerHeight*.4)+'px'}
const sw=k=>`<label class="sw"><input type="checkbox" data-ch="f" data-k="${k}"${cfg.f[k]?' checked':''}><span></span></label>`;

/* ===== Tekstas (markdown) ===== */
function inl(s){return s.replace(/!\[([^\]]*)\]\(((?:https:\/\/|data:image\/)[^)\s]+)\)/g,'<img src="$2" alt="$1">')
 .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
 .replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>')}
function md(s){return String(s||'').split('```').map((p,i)=>{if(i%2)return '<pre><code>'+esc(p.replace(/^[^\n]*\n/,''))+'</code></pre>';
 let h='',list=null,para=[];const fp=()=>{if(para.length){h+='<p>'+para.join('<br>')+'</p>';para=[]}},fl=()=>{if(list){h+='</'+list+'>';list=null}};
 for(const l of esc(p).split('\n')){let m;
  if(!l.trim()){fp();fl();continue}
  if(m=l.match(/^#{1,6}\s+(.*)/)){fp();fl();h+='<p class="hd"><b>'+inl(m[1])+'</b></p>';continue}
  if(m=l.match(/^\s*[-*•]\s+(.*)/)){fp();if(list!=='ul'){fl();h+='<ul>';list='ul'}h+='<li>'+inl(m[1])+'</li>';continue}
  if(m=l.match(/^\s*\d+[.)]\s+(.*)/)){fp();if(list!=='ol'){fl();h+='<ol>';list='ol'}h+='<li>'+inl(m[1])+'</li>';continue}
  fl();para.push(inl(l))}
 fp();fl();return h}).join('')}
const plain=t=>String(t||'').replace(/```[\s\S]*?```/g,' ').replace(/\]\([^)]*\)/g,']').replace(/[*#`>_~\[\]|]/g,'');

/* ===== Pokalbio rodymas ===== */
function renderChat(){const c=cur?.msgs||[];
 if(!c.length){const pr=curProject&&V.projects.find(p=>p.id===curProject);
  msgsEl.innerHTML=`<div class="empty"><div class="logo">${ic('spark')}</div><h1>${temp?'Laikinas pokalbis':'Kuo galiu padėti?'}</h1><p>${temp?'Šis pokalbis nebus išsaugotas.':pr?'Projektas: '+esc(pr.title):''}</p></div>`;return}
 msgsEl.innerHTML=c.map((m,i)=>{
  if(m.role==='user'){const at=m.att||[];const im=at.filter(a=>a.kind==='img'),fi=at.filter(a=>a.kind!=='img');
   return `<div class="msg user">${im.length?`<div class="att">${im.map(a=>`<img src="${esc(a.data)}" alt="">`).join('')}</div>`:''}${fi.length?`<div class="att">${fi.map(a=>`<span class="chip">${ic('file')}${esc(a.name)}</span>`).join('')}</div>`:''}${m.text?`<div class="bub">${esc(m.text)}</div>`:''}</div>`}
  if(m.loading)return '<div class="msg"><div class="dots"><i></i><i></i><i></i></div></div>';
  if(m.err)return `<div class="msg err"><div class="md">${esc(m.text)}</div><div class="acts"><button class="ib" data-act="retry" data-i="${i}" aria-label="Bandyti dar kartą">${ic('refresh')}</button></div></div>`;
  return `<div class="msg"><div class="md">${md(m.text)}</div>${(m.imgs||[]).map(u=>`<div class="gen"><img src="${esc(u)}" alt=""></div>`).join('')}<div class="acts"><button class="ib" data-act="copy" data-i="${i}" aria-label="Kopijuoti">${ic('copy')}</button><button class="ib" data-act="speak" data-i="${i}" aria-label="Perskaityti">${ic('speak')}</button></div></div>`}).join('');
 msgsEl.scrollTop=msgsEl.scrollHeight}
function newChat(pid=null){cur=null;curProject=pid;imageMode=false;pending=[];renderPending();renderChat()}
function openChat(id){const c=V.chats.find(x=>x.id===id);if(!c)return;cur=c;temp=false;upTemp();curProject=c.projectId||null;renderChat();closeDrawer()}

/* ===== Prisegti failai ===== */
function renderPending(){pendEl.innerHTML=(imageMode?`<span class="chip">${ic('spark')}Nuotraukos kūrimas<button class="ib sm" data-act="noGen">${ic('x')}</button></span>`:'')+
 pending.map((a,i)=>a.kind==='img'?`<div class="pend"><img src="${esc(a.data)}" alt=""><button class="x" data-act="rm" data-i="${i}">${ic('x')}</button></div>`:`<span class="chip">${ic('file')}${esc(a.name)}<button class="ib sm" data-act="rm" data-i="${i}">${ic('x')}</button></span>`).join('');
 inputEl.placeholder=imageMode?'Aprašykite, kokią nuotrauką sukurti':'Klauskite bet ko';upGo()}
const readURL=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f)});
async function shrink(f){try{const u=URL.createObjectURL(f),img=new Image();await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=u});
 const s=Math.min(1,1600/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);
 c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);return c.toDataURL('image/jpeg',.85)}catch{return readURL(f)}}
async function addFiles(list){for(const f of list){if(f.size>20e6){toast(f.name+': per didelis (daugiau nei 20 MB)');continue}
 if(f.type.startsWith('image/')){const d=await shrink(f);pending.push({kind:'img',name:f.name,mime:d.slice(5,d.indexOf(';')),data:d})}
 else if(f.type==='application/pdf')pending.push({kind:'pdf',name:f.name,mime:'application/pdf',data:await readURL(f)});
 else if(/^text\//.test(f.type)||/\.(txt|md|csv|json|xml|html|js|py|log|ics)$/i.test(f.name))pending.push({kind:'text',name:f.name,mime:'text/plain',text:(await f.text()).slice(0,200000)});
 else{pending.push({kind:'file',name:f.name,mime:f.type||'application/octet-stream',data:await readURL(f)});toast('Šio failo AI gali neperskaityti. Geriausiai veikia nuotraukos, PDF ir tekstas.')}}
 renderPending()}

/* ===== AI užklausa ===== */
function systemPrompt(){const p=[`Tu esi naudingas asistentas programėlėje „Mano AI“. Dabar: ${new Date().toLocaleString('lt-LT')}.`];
 p.push({auto:'Atsakyk ta kalba, kuria rašo vartotojas.',lt:'Visada atsakyk lietuviškai.',en:'Always answer in English.',ru:'Всегда отвечай по-русски.'}[cfg.answerLang]||'');
 const pr=cfg.f.projects&&cur?.projectId&&V.projects.find(x=>x.id===cur.projectId&&x.on);if(pr&&pr.text)p.push(`Projekto „${pr.title}“ instrukcijos:\n${pr.text}`);
 const on=a=>a.filter(x=>x.on);
 if(cfg.f.facts&&on(V.facts).length)p.push('Faktai apie vartotoją:\n'+on(V.facts).map(x=>'- '+x.text).join('\n'));
 if(cfg.f.skills&&on(V.skills).length)p.push('Vartotojo instrukcijos (įgūdžiai):\n'+on(V.skills).map(x=>`## ${x.title}\n${x.text||''}`).join('\n'));
 if(cfg.f.links&&on(V.links).length)p.push('Vartotojo viešos nuorodos:\n'+on(V.links).map(x=>`- ${x.title}: ${x.url}`).join('\n'));
 if(cfg.f.reminders&&on(V.reminders).length)p.push('Vartotojo priminimai:\n'+on(V.reminders).map(x=>`- ${(x.date||'be datos').replace('T',' ')} ${x.title}`).join('\n'));
 if(LV.on)p.push('Atsakymas bus perskaitytas balsu, todėl atsakyk trumpai, natūraliai, be markdown ženklų ir sąrašų.');
 return p.filter(Boolean).join('\n\n')}
async function callAI(all,img){
 const ep=cfg.eps.find(x=>x.id===cfg.ep)||cfg.eps[0],url=ep.url;
 const type=/\/messages\/?$/.test(url)?'claude':/\/responses\/?$/.test(url)?'resp':'chat';
 const model=img&&cfg.imgModel?cfg.imgModel:cfg.model,sys=systemPrompt(),H=all.slice(-30),n=H.length,B=s=>s.split(',')[1];
 const M=H.map((m,i)=>{let text=m.text||'';const parts=[];(m.att||[]).forEach(a=>{if(a.kind==='text')text+=`\n\n--- ${a.name} ---\n${a.text}`;else if(i<n-6)text+=`\n[Pridėtas failas: ${a.name}]`;else parts.push(a)});
  if(m.role==='assistant'&&!text)text='(sukurta nuotrauka)';return{role:m.role,text,parts}});
 const headers={'Content-Type':'application/json',Authorization:'Bearer '+V.key};let body;
 if(type==='chat'){body={model,messages:[{role:'system',content:sys},...M.map(m=>({role:m.role,content:m.parts.length?[...(m.text?[{type:'text',text:m.text}]:[]),...m.parts.map(a=>a.kind==='img'?{type:'image_url',image_url:{url:a.data}}:{type:'file',file:{filename:a.name,file_data:a.data}})]:m.text}))]};if(img)body.modalities=['image','text']}
 else if(type==='resp'){body={model,instructions:sys,input:M.map(m=>m.role==='assistant'?{role:'assistant',content:[{type:'output_text',text:m.text}]}:{role:'user',content:[...(m.text?[{type:'input_text',text:m.text}]:[]),...m.parts.map(a=>a.kind==='img'?{type:'input_image',image_url:a.data}:{type:'input_file',filename:a.name,file_data:a.data})]})};if(img)body.tools=[{type:'image_generation'}]}
 else{headers['x-api-key']=V.key;headers['anthropic-version']='2023-06-01';
  body={model,max_tokens:8192,system:sys,messages:M.map(m=>({role:m.role,content:[...m.parts.map(a=>a.kind==='img'?{type:'image',source:{type:'base64',media_type:a.mime,data:B(a.data)}}:a.kind==='pdf'?{type:'document',source:{type:'base64',media_type:'application/pdf',data:B(a.data)}}:{type:'text',text:`[Failas ${a.name} nepalaikomas]`}),...(m.text?[{type:'text',text:m.text}]:[])]})).filter(m=>m.content.length)}}
 const r=await fetch(url,{method:'POST',headers,body:JSON.stringify(body),signal:ctrl.signal});const d=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(d.error?.message||(typeof d.error==='string'?d.error:'')||d.message||('HTTP '+r.status));
 let text='',imgs=[];
 if(type==='chat'){const m=d.choices?.[0]?.message||{};text=typeof m.content==='string'?m.content:(m.content||[]).map(p=>{if(p.type==='image_url')imgs.push(p.image_url?.url);return p.text||''}).join('');(m.images||[]).forEach(x=>imgs.push(x.image_url?.url||x.url))}
 else if(type==='resp'){text=d.output_text||'';(d.output||[]).forEach(o=>{if(o.type==='image_generation_call'&&o.result)imgs.push('data:image/png;base64,'+o.result);if(!d.output_text)(o.content||[]).forEach(c=>{if(c.type==='output_text')text+=c.text})})}
 else text=(d.content||[]).filter(c=>c.type==='text').map(c=>c.text).join('');
 return{text,imgs:imgs.filter(u=>typeof u==='string'&&/^(https:|data:image\/)/.test(u))}}
async function runAI(img){busy=true;upGo();const a={role:'assistant',loading:true,t:Date.now()};cur.msgs.push(a);renderChat();ctrl=new AbortController();
 try{const r=await callAI(cur.msgs.filter(m=>!m.loading&&!m.err),img);a.text=r.text||(r.imgs.length?'':'(tuščias atsakymas)');a.imgs=r.imgs}
 catch(e){a.err=true;a.text=e.name==='AbortError'?'Sustabdyta.':'Klaida: '+(e.message==='Failed to fetch'?'nepavyko prisijungti prie anymodel.org. Patikrinkite internetą ir adresą.':e.message)}
 delete a.loading;busy=false;ctrl=null;cur.updated=Date.now();renderChat();upGo();save();return a.err?'':a.text}
async function send(text,fromLive){text=(text??inputEl.value).trim();if(busy||(!text&&!pending.length))return'';
 if(!V.key){toast('Pirma įveskite API raktą');settingsPage();return''}
 if(!cfg.model){toast('Pasirinkite modelį');modelSheet();return''}
 if(recOn&&rec)rec.stop();
 if(!cur){cur={id:uid(),title:(text||pending[0].name||'Pokalbis').replace(/\s+/g,' ').slice(0,50),created:Date.now(),updated:Date.now(),projectId:curProject,msgs:[]};if(!temp&&cfg.f.history)V.chats.unshift(cur)}
 const img=imageMode;cur.msgs.push({role:'user',text,att:pending,t:Date.now()});pending=[];imageMode=false;
 if(!fromLive){inputEl.value='';grow()}renderPending();return runAI(img)}
async function fetchModels(){if(!V.key)return toast('Pirma įveskite API raktą');
 try{const r=await fetch(cfg.modelsUrl,{headers:{Authorization:'Bearer '+V.key}});const d=await r.json();if(!r.ok)throw new Error(d.error?.message||'HTTP '+r.status);
  const l=(d.data||d.models||[]).map(m=>m.id||m.name||m).filter(x=>typeof x==='string');if(!l.length)throw new Error('sąrašas tuščias');
  cfg.models=[...new Set(l)];if(!cfg.models.includes(cfg.model))cfg.model=cfg.models[0];saveCfg();upModel();toast('Rasta modelių: '+cfg.models.length)}
 catch(e){toast('Nepavyko gauti modelių: '+e.message)}}

/* ===== Mikrofonas ===== */
let rec=null,recOn=false;
function dictate(){const S=SRc();if(!S)return toast('Šis telefonas nepalaiko balso atpažinimo');if(recOn){rec.stop();return}
 rec=new S();rec.lang=cfg.voiceLang;rec.interimResults=true;rec.continuous=false;const base=inputEl.value?inputEl.value.trimEnd()+' ':'';
 rec.onresult=e=>{let s='';for(const r of e.results)s+=r[0].transcript;inputEl.value=base+s;grow();upGo()};
 rec.onerror=e=>{if(e.error==='not-allowed')toast('Leiskite programėlei naudoti mikrofoną')};
 rec.onend=()=>{recOn=false;$('bMic').classList.remove('on')};rec.start();recOn=true;$('bMic').classList.add('on')}

/* ===== Balsas ===== */
function speak(t,done){if(!('speechSynthesis' in window)){done&&done();return}speechSynthesis.cancel();
 const u=new SpeechSynthesisUtterance(plain(t).slice(0,4000));u.lang=cfg.voiceLang;u.rate=cfg.rate;const v=voices().find(x=>x.voiceURI===cfg.voice);if(v)u.voice=v;
 let fin=false;u.onend=u.onerror=()=>{if(!fin){fin=true;done&&done()}};speechSynthesis.speak(u)}

/* ===== Live ===== */
function setOrb(s,t){$('orb').className='orb '+s;$('liveStatus').textContent=t}
function liveStart(){if(!SRc())return toast('Šis telefonas nepalaiko balso atpažinimo');if(!V.key){toast('Pirma įveskite API raktą');return settingsPage()}
 LV.on=true;liveEl.hidden=false;$('liveText').textContent='';pushO();listen()}
function listen(){if(!LV.on)return;const r=new (SRc())();LV.rec=r;r.lang=cfg.voiceLang;r.interimResults=true;r.continuous=false;let fin='';
 r.onresult=e=>{let s='';for(const x of e.results)s+=x[0].transcript;fin=s;$('liveText').textContent=s};
 r.onerror=e=>{if(e.error==='not-allowed'){toast('Leiskite naudoti mikrofoną');liveStop()}};
 r.onend=()=>{LV.rec=null;if(!LV.on)return;if(!fin.trim())setTimeout(listen,300);else liveAsk(fin.trim())};
 setOrb('listen','Klausausi…');try{r.start()}catch{setTimeout(listen,500)}}
function frame(){const v=$('liveVideo');if(!v.videoWidth)return null;const s=Math.min(1,1024/Math.max(v.videoWidth,v.videoHeight)),c=document.createElement('canvas');
 c.width=v.videoWidth*s;c.height=v.videoHeight*s;c.getContext('2d').drawImage(v,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.8)}
async function liveAsk(q){setOrb('think','Galvoju…');if(LV.cam){const f=frame();if(f)pending.push({kind:'img',name:'kamera.jpg',mime:'image/jpeg',data:f})}
 const ans=await send(q,true);if(!LV.on)return;
 if(ans&&cfg.f.speak){$('liveText').textContent=plain(ans);setOrb('speak','Kalbu… Palieskite, kad pertrauktumėte');speak(ans,()=>listen())}else listen()}
async function camToggle(){if(LV.cam){LV.cam.getTracks().forEach(t=>t.stop());LV.cam=null;$('liveVideo').hidden=true;$('lCam').classList.remove('on');return}
 try{LV.cam=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false});const v=$('liveVideo');v.srcObject=LV.cam;v.hidden=false;await v.play();$('lCam').classList.add('on')}
 catch{toast('Nepavyko įjungti kameros. Leiskite ją naudoti.')}}
function liveStop(){LV.on=false;try{LV.rec&&LV.rec.abort()}catch{}if('speechSynthesis' in window)speechSynthesis.cancel();if(LV.cam)camToggle();liveEl.hidden=true;if(ctrl)ctrl.abort()}

/* ===== Meniu, langai, puslapiai ===== */
const pushO=()=>{if(!history.state?.o)history.pushState({o:1},'')};
const syncScrim=()=>{scrimEl.hidden=!(drawerEl.classList.contains('open')||!sheetEl.hidden)};
function openDrawer(){renderDrawer();drawerEl.classList.add('open');syncScrim();pushO()}
function closeDrawer(){drawerEl.classList.remove('open');syncScrim()}
function openSheet(html,H){sheetEl.innerHTML=html;SH=H||{};sheetEl.hidden=false;syncScrim();pushO()}
function closeSheet(){sheetEl.hidden=true;sheetEl.innerHTML='';SH={};syncScrim()}
function openPage(id,title,html,H){const keep=curPage===id?pBody.scrollTop:0;curPage=id;$('pTitle').textContent=title;pBody.innerHTML=html;PH=H||{};pageEl.hidden=false;pBody.scrollTop=keep;closeDrawer();pushO()}
function closePage(){pageEl.hidden=true;curPage='';PH={}}

function renderDrawer(){drawerEl.innerHTML=`<div class="dscroll"><div class="search">${ic('search')}<input id="dq" placeholder="Ieškoti pokalbiuose" value="${esc(dq)}"></div>
<div class="filters">${[['title','Pavadinimas'],['text','Tekstas'],['files','Failai'],['imgs','Nuotraukos']].map(([k,n])=>`<button class="fchip${flt[k]?' on':''}" data-act="flt" data-id="${k}">${n}</button>`).join('')}<span class="fchip${fdate?' on':''}"><input type="date" id="fdate" value="${fdate}" aria-label="Data"></span></div>
${[['newChat','newc','Naujas pokalbis'],['projects','folder','Projektai'],['library','lib','Biblioteka'],['facts','fact','Faktai'],['links','link','Mano nuorodos'],['reminders','bell','Priminimai'],['skills','skill','Įgūdžiai']].map(([a,i,n])=>`<div class="item" data-act="nav" data-id="${a}">${ic(i)}<span class="t">${n}</span></div>`).join('')}
<div class="sec">Pokalbiai</div><div id="dList"></div></div>
<div class="dfoot"><div class="item" data-act="nav" data-id="settings">${ic('gear')}<span class="t">Nustatymai</span></div><div class="item" data-act="nav" data-id="lock">${ic('lock')}<span class="t">Užrakinti</span></div></div>`;renderList()}
function renderList(){const q=dq.trim().toLowerCase();
 const L=V.chats.filter(c=>{const fi=c.msgs.flatMap(m=>(m.att||[]).filter(a=>a.kind!=='img')),hasImg=c.msgs.some(m=>(m.att||[]).some(a=>a.kind==='img')||(m.imgs||[]).length);
  if(fdate&&dayStr(c.created)!==fdate&&!c.msgs.some(m=>dayStr(m.t)===fdate))return false;
  if(flt.imgs&&!hasImg)return false;if(flt.files&&!fi.length)return false;if(!q)return true;
  return(flt.title&&c.title.toLowerCase().includes(q))||(flt.text&&c.msgs.some(m=>(m.text||'').toLowerCase().includes(q)))||(flt.files&&fi.some(a=>a.name.toLowerCase().includes(q)))||(!flt.title&&!flt.text&&!flt.files&&c.title.toLowerCase().includes(q))
 }).sort((a,b)=>b.updated-a.updated);
 $('dList').innerHTML=L.map(c=>{const pn=c.projectId&&V.projects.find(p=>p.id===c.projectId);
  return `<div class="item${cur&&cur.id===c.id?' cur':''}" data-act="open" data-id="${c.id}"><span class="t"><span class="tt">${esc(c.title)}</span><small>${fmtD(c.updated)}${pn?' · '+esc(pn.title):''}</small></span><button class="ib" data-act="more" data-id="${c.id}" aria-label="Daugiau">${ic('more')}</button></div>`}).join('')||'<p class="mu" style="padding:12px">Pokalbių nerasta</p>'}
const DH={nav:id=>{closeDrawer();({newChat:()=>newChat(),projects:()=>colPage('projects'),library:()=>libraryPage(),facts:()=>colPage('facts'),links:()=>colPage('links'),reminders:()=>colPage('reminders'),skills:()=>colPage('skills'),settings:()=>settingsPage(),lock:()=>lockNow()})[id]()},
 open:id=>openChat(id),more:id=>chatMore(id),flt:k=>{flt[k]=!flt[k];renderDrawer()},
 input:t=>{if(t.id==='dq'){dq=t.value;renderList()}if(t.id==='fdate'){fdate=t.value;renderList()}}};
function chatMore(id){const c=V.chats.find(x=>x.id===id);if(!c)return;
 openSheet(`<h3>${esc(c.title)}</h3><div class="item" data-act="ren">${ic('edit')}<span class="t">Pervadinti</span></div><div class="item" data-act="proj">${ic('folder')}<span class="t">Priskirti projektui</span></div><div class="item" data-act="del" style="color:var(--red)">${ic('trash')}<span class="t">Ištrinti</span></div>`,
 {ren:()=>{const n=prompt('Naujas pavadinimas',c.title);if(n&&n.trim()){c.title=n.trim().slice(0,80);save();renderList()}closeSheet()},
  proj:()=>openSheet(`<h3>Projektas</h3><div class="list"><div class="item${!c.projectId?' sel':''}" data-act="set" data-id="">${ic('x')}<span class="t">Be projekto</span></div>${V.projects.map(p=>`<div class="item${c.projectId===p.id?' sel':''}" data-act="set" data-id="${p.id}">${ic('folder')}<span class="t">${esc(p.title)}</span></div>`).join('')}</div>`,{set:pid=>{c.projectId=pid||null;save();closeSheet();renderList()}}),
  del:()=>{if(confirm('Ištrinti šį pokalbį?')){V.chats=V.chats.filter(x=>x!==c);if(cur===c)newChat();save();renderList()}closeSheet()}})}
function modelSheet(){const draw=q=>cfg.models.filter(m=>m.toLowerCase().includes(q)).map(m=>`<div class="item${m===cfg.model?' sel':''}" data-act="pick" data-id="${esc(m)}">${ic(m===cfg.model?'check':'spark')}<span class="t"><span class="tt">${esc(m)}</span></span></div>`).join('')||'<p class="mu" style="padding:12px">Nerasta</p>';
 openSheet(`<h3>Modelis</h3><div class="search">${ic('search')}<input id="mq" placeholder="Ieškoti modelio"></div><div class="list" id="mList">${draw('')}</div><button class="btn w" data-act="refresh">${ic('refresh')}Atnaujinti sąrašą iš anymodel.org</button>`,
 {pick:m=>{cfg.model=m;saveCfg();upModel();closeSheet()},refresh:async()=>{await fetchModels();if($('mList'))$('mList').innerHTML=draw($('mq').value.toLowerCase())},input:t=>{if(t.id==='mq')$('mList').innerHTML=draw(t.value.toLowerCase())}})}
function plusSheet(){const t=[cfg.f.camera&&['cam','cam','Kamera'],['img','img','Nuotraukos'],['file','file','Failai'],cfg.f.imageGen&&['gen','spark','Kurti nuotrauką']].filter(Boolean);
 openSheet(`<div class="grid4">${t.map(([a,i,n])=>`<button class="tile" data-act="${a}">${ic(i)}${n}</button>`).join('')}</div>`,
 {cam:()=>{closeSheet();$('fCam').click()},img:()=>{closeSheet();$('fImg').click()},file:()=>{closeSheet();$('fAny').click()},gen:()=>{imageMode=true;closeSheet();renderPending();inputEl.focus()}})}

/* ===== Faktai, nuorodos, priminimai, įgūdžiai, projektai ===== */
const COLS={
 projects:{t:'Projektai',hint:'Projektas sujungia pokalbius ir turi savo instrukcijas AI.',f:[['title','Pavadinimas'],['text','Instrukcijos AI (nebūtina)','area']]},
 facts:{t:'Faktai',hint:'AI žinos šiuos faktus apie jus kiekviename pokalbyje.',f:[['text','Faktas, pvz. „Esu fotografas iš Kauno“','area']],imp:'.txt'},
 links:{t:'Mano nuorodos',hint:'Jūsų viešos nuorodos, kurias AI galės paminėti.',f:[['title','Pavadinimas'],['url','Nuoroda (https://…)','url']],imp:'.txt,.csv'},
 reminders:{t:'Priminimai',hint:'AI matys šiuos priminimus. Galite importuoti .ics failą iš Google Kalendoriaus.',f:[['title','Priminimas'],['date','Data ir laikas','datetime-local']],imp:'.ics,.txt'},
 skills:{t:'Įgūdžiai',hint:'Instrukcijos, kaip AI turi elgtis, pvz. „Rašyk trumpai ir draugiškai“.',f:[['title','Pavadinimas'],['text','Ką AI turi daryti','area']]}};
function colPage(name,editId){const C=COLS[name],L=V[name],ed=editId?L.find(x=>x.id===editId):null;
 const fld=C.f.map(([k,ph,ty])=>ty==='area'?`<textarea class="in" id="c_${k}" placeholder="${esc(ph)}">${esc(ed?.[k]||'')}</textarea>`:`<input class="in" id="c_${k}" type="${ty||'text'}" placeholder="${esc(ph)}" value="${esc(ed?.[k]||'')}">`).join('');
 const sub=x=>name==='links'?x.url:name==='reminders'?(x.date||'').replace('T',' '):x.title?(x.text||''):'';
 const rows=L.map(x=>`<div class="row"><div class="t"${name==='projects'?` data-act="openProj" data-id="${x.id}"`:''}>${esc(x.title||x.text)}${sub(x)?`<small>${esc(String(sub(x)).slice(0,140))}</small>`:''}</div><button class="ib" data-act="edit" data-id="${x.id}" aria-label="Redaguoti">${ic('edit')}</button><button class="ib" data-act="del" data-id="${x.id}" aria-label="Ištrinti">${ic('trash')}</button><label class="sw"><input type="checkbox" data-ch="item" data-id="${x.id}"${x.on?' checked':''}><span></span></label></div>`).join('');
 openPage(name,C.t,`<p class="mu" style="margin:4px 4px 12px">${C.hint}</p>
<div class="card"><div class="row"><div class="t">Naudoti pokalbiuose<small>Išjungus AI šių įrašų nematys</small></div>${sw(name)}</div></div>
<div class="card"><h4>${ed?'Redaguoti':'Pridėti naują'}</h4><div class="row col">${fld}<div class="btns"><button class="btn p" data-act="add">${ed?'Išsaugoti':'Pridėti'}</button>${ed?'<button class="btn" data-act="cancel">Atšaukti</button>':C.imp?`<button class="btn" data-act="imp">${ic('upload')}Importuoti</button>`:''}</div></div></div>
<div class="card"><h4>Įrašai (${L.length})</h4>${rows||'<div class="row mu">Kol kas tuščia</div>'}</div>`,{
 add:()=>{const o={};C.f.forEach(([k])=>o[k]=$('c_'+k).value.trim());
  if(name==='links'){if(!/^https?:\/\/\S+$/i.test(o.url))return toast('Nuoroda turi prasidėti https://');o.title=o.title||o.url.split('/')[2]}
  else if(!o[C.f[0][0]])return toast('Užpildykite laukelį');
  if(ed)Object.assign(ed,o);else L.unshift({id:uid(),on:true,created:Date.now(),...o});save();colPage(name)},
 cancel:()=>colPage(name),edit:id=>{colPage(name,id);pBody.scrollTop=0},
 del:id=>{if(!confirm('Ištrinti šį įrašą?'))return;V[name]=V[name].filter(x=>x.id!==id);if(name==='projects')V.chats.forEach(c=>{if(c.projectId===id)c.projectId=null});save();colPage(name)},
 imp:()=>{impTarget=name;$('fImport').accept=C.imp;$('fImport').click()},openProj:id=>projPage(id),
 ch:t=>{if(t.dataset.ch==='item'){const x=V[name].find(y=>y.id===t.dataset.id);if(x){x.on=t.checked;save()}}}})}
/* ===== app.js pabaiga ===== */
