'use strict';
/* Mano AI: paieška. Pirma nemokamai (Bing, DuckDuckGo, Mojeek, Google), nepavykus – AnyModel /v1/search. Įkelti po paieska.js */
(()=>{
cfg.webProv='url';
if(cfg.f.amSearch===undefined)cfg.f.amSearch=true;
if(cfg.f.webDeep===undefined)cfg.f.webDeep=true;
saveCfg();
const ENG=[
 ['Bing',q=>'https://www.bing.com/search?q='+q+'&setlang=lt&cc=LT'],
 ['DuckDuckGo',q=>'https://html.duckduckgo.com/html/?q='+q+'&kl=lt-lt'],
 ['Mojeek',q=>'https://www.mojeek.com/search?q='+q],
 ['Google',q=>'https://www.google.com/search?q='+q+'&hl=lt&gl=lt']];
const BLK=/unusual traffic|captcha|not a robot|recaptcha|\/sorry\/|Our systems have detected|anomaly-modal|challenge-form/i;
const SKIP=/(^|\.)(bing\.com|microsoft\.com|msn\.com|live\.com|duckduckgo\.com|google\.[a-z.]+|gstatic\.com|googleusercontent\.com|mojeek\.com|jina\.ai|bingj\.com)$/i;
const tmo=(p,ms)=>Promise.race([p,new Promise((_,r)=>setTimeout(()=>r(new Error('per ilgai neatsakė')),ms))]);
const host=u=>{try{return new URL(u).hostname}catch{return''}};

function realUrl(u){try{const x=new URL(u);
 if(/duckduckgo\.com$/.test(x.hostname)&&x.searchParams.get('uddg'))return decodeURIComponent(x.searchParams.get('uddg'));
 if(/bing\.com$/.test(x.hostname)&&x.pathname==='/ck/a'){let v=x.searchParams.get('u')||'';if(v.startsWith('a1'))v=v.slice(2);
  v=v.replace(/-/g,'+').replace(/_/g,'/');return atob(v+'='.repeat((4-v.length%4)%4))}
 if(/google\./.test(x.hostname)&&x.pathname==='/url')return x.searchParams.get('q')||x.searchParams.get('url')||'';
 return u}catch{return''}}

/* Nemokama paieška */
async function freeSearch(q){const eq=encodeURIComponent(cut(q,300));
 const run=e=>tmo(readPage(e[1](eq)),20000).then(t=>{if(t.length<300||BLK.test(t))throw new Error('užblokavo');return{n:e[0],t}});
 let ok=(await Promise.allSettled(ENG.slice(0,3).map(run))).filter(r=>r.status==='fulfilled').map(r=>r.value);
 if(!ok.length){try{ok=[await run(ENG[3])]}catch{}}
 if(!ok.length)throw new Error('nė viena nemokama paieškos sistema neatsakė');
 const seen=new Set(),items=[];
 for(const{t}of ok)for(const m of t.matchAll(/\[([^\]\n]{4,200})\]\((https?:\/\/[^)\s]+)\)/g)){
  const u=realUrl(m[2]),h=host(u);if(!h||SKIP.test(h)||seen.has(u))continue;
  const ti=m[1].replace(/[*#_`]/g,'').trim();if(ti.length<4)continue;seen.add(u);items.push({ti,u,h})}
 if(!items.length)throw new Error('nuorodų nerasta');
 return{eng:ok.map(x=>x.n),items:items.slice(0,12),raw:ok[0].t.slice(0,5000)}}

/* AnyModel paieška (mokama) */
async function amSearch(q){
 const d=await jget(cfg.base.replace(/\/+$/,'')+'/search',{method:'POST',
  headers:{'Content-Type':'application/json',Authorization:'Bearer '+V.key},
  body:JSON.stringify({query:cut(q,300),max_results:8})});
 const L=d.results||d.data||d.items||d.organic||d.web?.results||(Array.isArray(d)?d:[]);
 const items=(Array.isArray(L)?L:[]).map(x=>({ti:cut(x.title||x.name||x.url||x.link||'',200),u:x.url||x.link||x.href||'',
  sn:cut(x.snippet||x.content||x.description||x.text||x.summary||'',700)})).filter(x=>/^https?:\/\//.test(x.u));
 items.forEach(x=>x.h=host(x.u));
 const ans=d.answer||d.summary||'';
 if(!items.length&&!ans)throw new Error('rezultatų nėra');
 return{eng:['AnyModel'],items,raw:(ans?'Trumpas atsakymas: '+cut(ans,900)+'\n\n':'')+items.map((x,i)=>`[${i+1}] ${x.ti} – ${x.u}\n${x.sn}`).join('\n\n')}}

/* Pirma nemokamai, nepavykus – AnyModel */
async function webSearch(q){
 try{return await freeSearch(q)}
 catch(e){if(cfg.f.amSearch&&V.key){toast('Nemokama paieška nepavyko, naudoju AnyModel (mokama)…',5000);return amSearch(q)}throw e}}

async function readTop(items){const doms=new Set(),pick=[];
 for(const it of items){if(doms.has(it.h))continue;doms.add(it.h);pick.push(it);if(pick.length>=3)break}
 const r=await Promise.allSettled(pick.map(it=>tmo(readPage(it.u),20000).then(t=>`=== ${it.ti} – ${it.u} ===\n`+t.slice(0,4500))));
 return r.filter(x=>x.status==='fulfilled').map(x=>x.value).join('\n\n')}

async function pack(q,deep){const s=await webSearch(q);
 let o=`[Paieška internete (${s.eng.join(', ')}), ${new Date().toLocaleString('lt-LT')}, užklausa: „${cut(q,120)}“]\n\nRASTOS NUORODOS:\n`+
  (s.items.map((x,i)=>`[${i+1}] ${x.ti} – ${x.u}`).join('\n')||'(nuorodų nėra)')+'\n\nREZULTATAI:\n'+s.raw;
 if(deep&&cfg.f.webDeep&&s.items.length){toast('📄 Skaitomi rasti puslapiai…',40000);const d=await readTop(s.items);if(d)o+='\n\nATIDARYTI PUSLAPIAI:\n'+d}
 return o.slice(0,32000)}

/* Prieš siunčiant AI */
const prev=callAI;
callAI=async function(all,img){
 if(img||!cfg.f.web)return prev(all,img);
 const last=[...all].reverse().find(m=>m.role==='user');
 if(last&&!last.webDone){const txt=last.text||'',urls=(txt.match(/https?:\/\/[^\s)]+/g)||[]).slice(0,3),q=txt.replace(/https?:\/\/\S+/g,'').trim(),add=[];
  last.webDone=true;
  if(q.length>2){toast('🌐 Ieškoma internete…',40000);
   try{add.push(T('🌐 Paieška: '+cut(q,40),await pack(q,true)))}
   catch(e){add.push(T('🌐 Paieška nepavyko',`[Paieška nepavyko: ${e.message}. Pasakyk tai vartotojui ir neišgalvok atsakymo.]`))}}
  for(const u of urls){try{toast('🔗 Skaitomas puslapis…',30000);add.push(T('🔗 '+cut(u,50),'[Puslapio turinys: '+u+']\n'+(await readPage(u)).slice(0,15000)))}
   catch(e){toast('Puslapio perskaityti nepavyko: '+e.message,5000)}}
  if(add.length){last.att=[...(last.att||[]),...add];save();renderChat()}}
 let work=all,r;
 for(let round=0;round<3;round++){
  r=await prev(work,img);
  const cmds=[...String(r.text||'').matchAll(/\[\[\s*(IEŠKOTI|IESKOTI|ATIDARYTI)\s*:\s*([^\]]+)\]\]/gi)];
  if(!cmds.length)return r;
  toast('🔎 AI ieško papildomai ('+(round+1)+'/3)…',40000);const out=[];
  for(const c of cmds.slice(0,3)){const v=c[2].trim();
   try{out.push(/^ATIDARYTI/i.test(c[1])?`=== ${v} ===\n`+(await readPage(v)).slice(0,9000):await pack(v,false))}
   catch(e){out.push(`[${v}: nepavyko – ${e.message}]`)}}
  work=[...work,{role:'assistant',text:r.text,t:Date.now()},
   {role:'user',text:'[Papildomos paieškos rezultatai. Jei jų pakanka, atsakyk vartotojui galutinai.]',webDone:true,t:Date.now(),
    att:[T('🔎 Papildoma paieška',out.join('\n\n').slice(0,30000))]}]}
 r.text=String(r.text||'').replace(/\[\[[^\]]+\]\]/g,'').trim()||'Nepavyko rasti pakankamai informacijos. Pabandykite paklausti tiksliau.';
 return r};

const sp=systemPrompt;
systemPrompt=function(){let s=sp();
 if(cfg.f.web)s+='\n\nJei pateiktų rezultatų nepakanka, gali pats ieškoti dar kartą: atsakyk TIK eilutėmis [[IEŠKOTI: tiksli užklausa]] (pvz. „hanteliai 20 kg Kaunas skelbiu.lt“) arba [[ATIDARYTI: https://…]], daugiausia 3 eilutės, ir programėlė grąžins rezultatus. Galutiniame atsakyme pateik konkrečius pasiūlymus su kainomis, vietomis ir nuorodomis [pavadinimas](url). Niekada neišgalvok nuorodų, kainų ar adresų, kurių nėra rezultatuose.';
 return s};

/* Nustatymai */
const ss=settingsPage;
settingsPage=function(){ss();const sel=$('wProv');if(!sel)return;const card=sel.closest('.card');
 const info=document.createElement('div');
 info.innerHTML='<b>Kelios paieškos sistemos</b><small style="display:block;color:var(--mu)">Pirma nemokamai: Bing, DuckDuckGo, Mojeek, Google. Įklijavus nuorodą, AI perskaito tą puslapį.</small>';
 sel.replaceWith(info);['wTav','wMod','wUrl'].forEach(id=>{const e=$(id);if(e)e.hidden=true});
 const r1=document.createElement('div');r1.className='row';
 r1.innerHTML='<div class="t">AnyModel paieška, jei nemokama nepavyksta<small>Kainuoja iš AnyModel balanso už kiekvieną paiešką. Išjungus – visada tik nemokama.</small></div>'+sw('amSearch');
 const r2=document.createElement('div');r2.className='row';
 r2.innerHTML='<div class="t">Atidaryti 3 pirmus rezultatus<small>AI mato kainas ir adresus. Lėčiau, bet tiksliau.</small></div>'+sw('webDeep');
 card.append(r1,r2)};
})();
/* ===== ieskoti.js pabaiga ===== */
