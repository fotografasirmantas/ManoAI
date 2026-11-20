'use strict';
/* Mano AI: TAUPI paieška, TIK nemokama (be AnyModel /v1/search). Įkelti po paieska.js */
(()=>{if(window.__ieskoti)return;window.__ieskoti=1;
cfg.webProv='url';cfg.f.amSearch=false;
if(cfg.f.webDeep===undefined)cfg.f.webDeep=true;
if(cfg.f.webOnce===undefined)cfg.f.webOnce=true;
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
async function webSearch(q){const eq=encodeURIComponent(cut(q,300));
 const run=e=>tmo(readPage(e[1](eq)),20000).then(t=>{if(t.length<300||BLK.test(t))throw new Error('užblokavo');return{n:e[0],t}});
 let ok=(await Promise.allSettled(ENG.slice(0,3).map(run))).filter(r=>r.status==='fulfilled').map(r=>r.value);
 if(!ok.length){try{ok=[await run(ENG[3])]}catch{}}
 if(!ok.length)throw new Error('paieškos sistemos neatsakė, pabandykite po minutės');
 const seen=new Set(),items=[];
 for(const{t}of ok)for(const m of t.matchAll(/\[([^\]\n]{4,200})\]\((https?:\/\/[^)\s]+)\)/g)){
  const u=realUrl(m[2]),h=host(u);if(!h||SKIP.test(h)||seen.has(u))continue;
  const ti=m[1].replace(/[*#_`]/g,'').trim();if(ti.length<4)continue;seen.add(u);items.push({ti,u,h})}
 if(!items.length)throw new Error('nuorodų nerasta');
 return{eng:ok.map(x=>x.n),items:items.slice(0,8),raw:ok[0].t.slice(0,2500)}}
async function readTop(items){const doms=new Set(),pick=[];
 for(const it of items){if(doms.has(it.h))continue;doms.add(it.h);pick.push(it);if(pick.length>=2)break}
 const r=await Promise.allSettled(pick.map(it=>tmo(readPage(it.u),20000).then(t=>`=== ${it.ti} – ${it.u} ===\n`+t.slice(0,2500))));
 return r.filter(x=>x.status==='fulfilled').map(x=>x.value).join('\n\n')}
async function pack(q,deep){const s=await webSearch(q);
 let o=`[Paieška (${s.eng.join(', ')}), ${new Date().toLocaleString('lt-LT')}, užklausa: „${cut(q,120)}“]\n\nNUORODOS:\n`+
  s.items.map((x,i)=>`[${i+1}] ${x.ti} – ${x.u}`).join('\n')+'\n\nREZULTATAI:\n'+s.raw;
 if(deep&&cfg.f.webDeep){toast('📄 Skaitomi rasti puslapiai…',40000);const d=await readTop(s.items);if(d)o+='\n\nATIDARYTI PUSLAPIAI:\n'+d}
 return o.slice(0,10000)}
const prev=callAI;
callAI=async function(all,img){
 if(img||!cfg.f.web)return prev(all,img);
 try{
  const last=[...all].reverse().find(m=>m.role==='user');
  if(last&&!last.webDone){const txt=last.text||'',urls=(txt.match(/https?:\/\/[^\s)]+/g)||[]).slice(0,2),q=txt.replace(/https?:\/\/\S+/g,'').trim(),add=[];
   last.webDone=true;
   if(q.length>2){toast('🌐 Ieškoma internete…',40000);
    try{add.push(T('🌐 Paieška: '+cut(q,40),await pack(q,true)))}
    catch(e){add.push(T('🌐 Paieška nepavyko',`[Paieška nepavyko: ${e.message}. Pasakyk tai vartotojui ir neišgalvok atsakymo.]`))}}
   for(const u of urls){try{toast('🔗 Skaitomas puslapis…',30000);add.push(T('🔗 '+cut(u,50),'[Puslapio turinys: '+u+']\n'+(await readPage(u)).slice(0,8000)))}
    catch(e){toast('Puslapio perskaityti nepavyko: '+e.message,5000)}}
   if(add.length){last.att=[...(last.att||[]),...add];save();renderChat()}}
  let work=all,r;
  for(let round=0;round<2;round++){
   r=await prev(work,img);
   const cmds=[...String(r.text||'').matchAll(/\[\[\s*(IEŠKOTI|IESKOTI|ATIDARYTI)\s*:\s*([^\]]+)\]\]/gi)];
   if(!cmds.length||round===1)break;
   toast('🔎 AI ieško papildomai…',40000);const out=[];
   for(const c of cmds.slice(0,2)){const v=c[2].trim();
    try{out.push(/^ATIDARYTI/i.test(c[1])?`=== ${v} ===\n`+(await readPage(v)).slice(0,5000):await pack(v,false))}
    catch(e){out.push(`[${v}: nepavyko – ${e.message}]`)}}
   work=[...work,{role:'assistant',text:r.text,t:Date.now()},
    {role:'user',text:'[Papildomos paieškos rezultatai. Dabar atsakyk vartotojui galutinai.]',webDone:true,t:Date.now(),
     att:[T('🔎 Papildoma paieška',out.join('\n\n').slice(0,10000))]}]}
  r.text=String(r.text||'').replace(/\[\[[^\]]+\]\]/g,'').trim()||'Nepavyko rasti pakankamai informacijos. Pabandykite paklausti tiksliau.';
  return r}
 finally{if(cfg.f.webOnce&&cfg.f.web){cfg.f.web=false;saveCfg();applyToggles()}}};
const sp=systemPrompt;
systemPrompt=function(){let s=sp();
 if(cfg.f.web)s+='\n\nJei rezultatų nepakanka, gali VIENĄ kartą ieškoti dar: atsakyk TIK eilutėmis [[IEŠKOTI: tiksli užklausa]] arba [[ATIDARYTI: https://…]], daugiausia 2 eilutės. Galutiniame atsakyme pateik konkrečius pasiūlymus su kainomis ir nuorodomis [pavadinimas](url). Niekada neišgalvok nuorodų, kainų ar adresų.';
 return s};
const ss=settingsPage;
settingsPage=function(){ss();const sel=$('wProv');if(!sel)return;const card=sel.closest('.card');
 const info=document.createElement('div');
 info.innerHTML='<b>Nemokama paieška</b><small style="display:block;color:var(--mu)">Bing, DuckDuckGo, Mojeek, Google. Mokama AnyModel paieška nenaudojama.</small>';
 sel.replaceWith(info);['wTav','wMod','wUrl'].forEach(id=>{const e=$(id);if(e)e.hidden=true});
 const r1=document.createElement('div');r1.className='row';
 r1.innerHTML='<div class="t">Išjungti 🌐 po kiekvienos paieškos<small>Taupo žetonus: kitos žinutės be paieškos</small></div>'+sw('webOnce');
 const r2=document.createElement('div');r2.className='row';
 r2.innerHTML='<div class="t">Atidaryti 2 pirmus rezultatus<small>Tiksliau (kainos, adresai), bet daugiau žetonų</small></div>'+sw('webDeep');
 card.append(r1,r2)};
})();
/* ===== ieskoti.js pabaiga ===== */
