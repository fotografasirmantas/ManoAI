'use strict';
/* Mano AI: failų skaitymas (PDF, Word, Excel, PowerPoint, garsas), instrukcijos, pataisymai. Įkelti paskutinį */
(()=>{const s=document.createElement('style');s.textContent='.msgs>*{flex-shrink:0}';document.head.appendChild(s)})();
if(cfg.f.noGuess===undefined)cfg.f.noGuess=true;
if(cfg.f.sys===undefined)cfg.f.sys=true;
if(!cfg.sttModel)cfg.sttModel='whisper-1';
saveCfg();

/* ===== Pagalbinės ===== */
function d2b(u){const i=u.indexOf(','),m=u.slice(5,u.indexOf(';'))||'application/octet-stream',b=atob(u.slice(i+1)),a=new Uint8Array(b.length);for(let k=0;k<b.length;k++)a[k]=b.charCodeAt(k);return new Blob([a],{type:m})}
const T=(name,text)=>({kind:'text',name,mime:'text/plain',text:String(text).slice(0,200000)});
let pdfLibP=null;
function pdfLib(){return pdfLibP||(pdfLibP=new Promise((res,rej)=>{const B='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
 const add=src=>new Promise((r,j)=>{const s=document.createElement('script');s.src=src;s.onload=r;s.onerror=()=>j(new Error('nepavyko įkelti PDF skaitytuvo (patikrinkite internetą)'));document.head.appendChild(s)});
 add(B+'pdf.min.js').then(()=>add(B+'pdf.worker.min.js')).then(()=>{pdfjsLib.GlobalWorkerOptions.workerSrc=B+'pdf.worker.min.js';res(pdfjsLib)}).catch(e=>{pdfLibP=null;rej(e)})}))}

/* ===== PDF ===== */
async function readPdf(buf,name){const L=await pdfLib();const task=L.getDocument({data:new Uint8Array(buf),isEvalSupported:false});
 task.onPassword=(upd,reason)=>{const p=prompt((reason===2?'Neteisingas slaptažodis. ':'')+'PDF „'+name+'“ apsaugotas slaptažodžiu. Įveskite slaptažodį:');if(p===null)task.destroy();else upd(p)};
 let pdf;try{pdf=await task.promise}catch(e){throw new Error(/destroy|Worker was/i.test(e.message)?'atšaukta':e.message)}
 let t='';for(let i=1;i<=pdf.numPages&&t.length<200000;i++){const pg=await pdf.getPage(i);t+=`\n[${i} psl.]\n`+(await pg.getTextContent()).items.map(x=>x.str+(x.hasEOL?'\n':' ')).join('')}
 const out=[T(name,`[PDF, ${pdf.numPages} psl.]\n`+t)];
 if(t.replace(/\s|\[\d+ psl\.\]/g,'').length<30*pdf.numPages){
  for(let i=1;i<=Math.min(5,pdf.numPages);i++){const pg=await pdf.getPage(i),v0=pg.getViewport({scale:1}),v=pg.getViewport({scale:Math.min(2,1200/v0.width)});
   const c=document.createElement('canvas');c.width=Math.round(v.width);c.height=Math.round(v.height);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);
   await pg.render({canvasContext:x,viewport:v}).promise;out.push({kind:'img',name:name+' ('+i+' psl.)',mime:'image/jpeg',data:c.toDataURL('image/jpeg',.82)})}
  out[0].text+='\n(PDF nuskenuotas: pridėti pirmų puslapių vaizdai)'}
 return out}

/* ===== Word, Excel, PowerPoint (zip) ===== */
async function zipOpen(buf){const dv=new DataView(buf),u=new Uint8Array(buf);let e=u.length-22;while(e>=0&&dv.getUint32(e,true)!==0x06054b50)e--;
 if(e<0)throw new Error('failas sugadintas arba seno formato');const n=dv.getUint16(e+10,true);let p=dv.getUint32(e+16,true);const E={};
 for(let i=0;i<n;i++){const nl=dv.getUint16(p+28,true),xl=dv.getUint16(p+30,true),cl=dv.getUint16(p+32,true);
  E[td.decode(u.subarray(p+46,p+46+nl))]={m:dv.getUint16(p+10,true),cs:dv.getUint32(p+20,true),o:dv.getUint32(p+42,true)};p+=46+nl+xl+cl}
 const read=async nm=>{const x=E[nm];if(!x)return'';const st=x.o+30+dv.getUint16(x.o+26,true)+dv.getUint16(x.o+28,true),d=u.subarray(st,st+x.cs);
  if(x.m===0)return td.decode(d);return new Response(new Blob([d]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text()};
 return{names:Object.keys(E),read}}
const xmlTxt=s=>String(s||'').replace(/<\/w:p>|<\/a:p>/g,'\n').replace(/<w:tab\/>/g,'\t').replace(/<w:br\/>|<a:br\/>/g,'\n').replace(/<[^>]+>/g,'')
 .replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,'&');
const byNum=(a,b)=>(+a.match(/(\d+)\.xml$/)[1])-(+b.match(/(\d+)\.xml$/)[1]);
async function readOffice(buf,name){const z=await zipOpen(buf);
 if(/\.docx$/i.test(name))return xmlTxt(await z.read('word/document.xml'));
 if(/\.pptx$/i.test(name)){let t='';for(const nm of z.names.filter(x=>/^ppt\/slides\/slide\d+\.xml$/.test(x)).sort(byNum))t+=`\n--- Skaidrė ${nm.match(/(\d+)\.xml$/)[1]} ---\n`+xmlTxt(await z.read(nm));return t}
 if(/\.xlsx$/i.test(name)){const ss=[...(await z.read('xl/sharedStrings.xml')).matchAll(/<si>([\s\S]*?)<\/si>/g)].map(m=>xmlTxt(m[1]));let t='';
  for(const nm of z.names.filter(x=>/^xl\/worksheets\/sheet\d+\.xml$/.test(x)).sort(byNum)){t+=`\n--- Lapas ${nm.match(/(\d+)\.xml$/)[1]} ---\n`;
   for(const r of(await z.read(nm)).matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)){const cells=[];
    for(const c of r[1].matchAll(/<c([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)){const v=(c[2]||'').match(/<v>([\s\S]*?)<\/v>/);
     cells.push(/t="s"/.test(c[1])&&v?ss[+v[1]]||'':/t="inlineStr"/.test(c[1])?xmlTxt(c[2]):v?xmlTxt(v[1]):'')}
    t+=cells.join('\t')+'\n'}}return t}
 return''}

/* ===== Garsas ===== */
async function transcribe(blob,name){const fd=new FormData();fd.append('file',blob,name);fd.append('model',cfg.sttModel||'whisper-1');
 const r=await fetch(cfg.base.replace(/\/+$/,'')+'/audio/transcriptions',{method:'POST',headers:{Authorization:'Bearer '+V.key},body:fd});
 const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error?.message||('HTTP '+r.status));return d.text||''}

/* ===== Bet koks failas → tekstas / nuotraukos ===== */
async function convertBlob(blob,name,mime){mime=mime||blob.type||'';
 if(mime.startsWith('image/'))return[{kind:'img',name,mime,data:await readURL(blob)}];
 if(mime==='application/pdf'||/\.pdf$/i.test(name))return readPdf(await blob.arrayBuffer(),name);
 if(/\.(docx|pptx|xlsx)$/i.test(name))return[T(name,(await readOffice(await blob.arrayBuffer(),name))||'(tekstas nerastas)')];
 if(/\.(doc|xls|ppt)$/i.test(name))return[T(name,'[Senas '+name.split('.').pop().toUpperCase()+' formatas neperskaitomas. Vartotojas turi išsaugoti failą kaip PDF, DOCX ar XLSX.]')];
 if(mime.startsWith('audio/')||/\.(m4a|mp3|wav|ogg|oga|aac|opus|flac|amr|3gp|weba)$/i.test(name)){
  if(!V.key)throw new Error('pirma įveskite API raktą');
  try{return[T(name,'[Garso įrašo iššifruotas tekstas]\n'+((await transcribe(blob,name))||'(kalbos nerasta)'))]}
  catch(e){toast('Garso iššifruoti nepavyko: '+e.message,7000);return[T(name,'[Garso įrašo iššifruoti nepavyko: '+e.message+'. Pasakyk vartotojui, kad įrašo turinio negavai.]')]}}
 if(mime.startsWith('video/'))return[T(name,'[Vaizdo įrašų skaityti negaliu. Pasakyk tai vartotojui.]')];
 if(mime.startsWith('text/')||/json|xml|csv/.test(mime)||/\.(txt|md|csv|json|xml|html?|js|py|log|ics|srt|vtt|rtf)$/i.test(name))return[T(name,await blob.text())];
 return[T(name,'[Šio failo tipo („'+name+'“) perskaityti negaliu. Pasakyk tai vartotojui.]')]}

/* Prisegant failą: iškart perskaityti telefone */
addFiles=async function(list){for(const f of list){if(f.size>25e6){toast(f.name+': per didelis (daugiau nei 25 MB)');continue}
 try{if(f.type.startsWith('image/')){const d=await shrink(f);pending.push({kind:'img',name:f.name,mime:'image/jpeg',data:d});continue}
  toast('Skaitomas '+f.name+'…',120000);pending.push(...await convertBlob(f,f.name,f.type));toast('Paruošta: '+f.name)}
 catch(e){toast(e.message==='atšaukta'?'Atšaukta':f.name+': nepavyko perskaityti ('+e.message+')',6000)}}
 renderPending()};

/* Seni pokalbiai su neperskaitytais failais: sutvarkyti prieš siunčiant */
const _callAI=callAI;
callAI=async function(all,img){let ch=false;
 for(const m of all){if(!(m.att||[]).some(a=>a.kind!=='img'&&a.kind!=='text'))continue;const out=[];
  for(const a of m.att){if(a.kind==='img'||a.kind==='text'){out.push(a);continue}
   try{out.push(...(a.data?await convertBlob(d2b(a.data),a.name,a.mime):[T(a.name,'[failo turinio nėra]')]))}
   catch(e){out.push(T(a.name,'[Failo nepavyko perskaityti: '+e.message+']'))}}
  m.att=out;ch=true}
 if(ch)save();return _callAI(all,img)};

/* ===== Instrukcijos AI ===== */
const _sysP=systemPrompt;
systemPrompt=function(){let s=_sysP();
 if(cfg.f.sys&&(cfg.sysText||'').trim())s+='\n\nVartotojo nuolatinės instrukcijos (laikykis jų visada):\n'+cfg.sysText.trim();
 if(cfg.f.noGuess)s+='\n\nSVARBU: Niekada neišgalvok faktų, skaičių, vardų, datų, citatų ar šaltinių. Jei atsakymo nėra pateiktuose failuose arba tikrai nežinai, aiškiai parašyk „Nežinau“ arba „Neradau“. Jei failo turinio negavai, taip ir pasakyk, nespėliok.';
 return s+'\nŽinutėse „--- failo pavadinimas ---“ yra tikras failo turinys (garso įrašai pateikti kaip iššifruotas tekstas). Analizuok jį.'};
const _setP=settingsPage;
settingsPage=function(){_setP();const c=document.createElement('div');c.className='card';
 c.innerHTML=`<h4>Instrukcijos AI (visiems pokalbiams)</h4>
<div class="row"><div class="t">Neišgalvoti<small>Jei AI nežino ar neranda, parašys „Nežinau“ arba „Neradau“</small></div>${sw('noGuess')}</div>
<div class="row"><div class="t">Naudoti mano instrukcijas</div>${sw('sys')}</div>
<div class="row col"><textarea class="in" id="gSys" rows="5" placeholder="Pvz.: Atsakyk trumpai ir lietuviškai. Remkis tik mano failais.">${esc(cfg.sysText||'')}</textarea>
<small>Išsaugoma automatiškai. Projekto instrukcijos rašomos: ☰ → Projektai → paspauskite projekto pavadinimą.</small>
<small>Garso iššifravimo modelis</small><input class="in" id="sttM" value="${esc(cfg.sttModel)}"></div>`;
 pBody.insertBefore(c,pBody.children[1]||null);
 $('gSys').addEventListener('input',e=>{cfg.sysText=e.target.value;saveCfg()});
 $('sttM').addEventListener('change',e=>{cfg.sttModel=e.target.value.trim()||'whisper-1';saveCfg()})};

/* ===== Projekto puslapis su instrukcijomis ===== */
projPage=function(id){const p=V.projects.find(x=>x.id===id);if(!p)return colPage('projects');const ch=V.chats.filter(c=>c.projectId===id);
 openPage('proj',p.title,`<div class="card"><h4>Projekto instrukcijos AI</h4><div class="row col">
<textarea class="in" id="pjTxt" rows="6" placeholder="Pvz.: Atsakyk tik pagal mano pateiktus failus. Jei nerandi, parašyk „Neradau“.">${esc(p.text||'')}</textarea>
<div class="row" style="padding:0;border:0"><div class="t">Naudoti šias instrukcijas</div><label class="sw"><input type="checkbox" id="pjOn"${p.on?' checked':''}><span></span></label></div>
<button class="btn p" data-act="pjSave">Išsaugoti instrukcijas</button></div></div>
<button class="btn p w" data-act="newIn">${ic('newc')}Naujas pokalbis projekte</button>
<div class="card" style="margin-top:14px"><h4>Pokalbiai (${ch.length})</h4>${ch.map(c=>`<div class="item" data-act="open" data-id="${c.id}"><span class="t"><span class="tt">${esc(c.title)}</span><small>${fmtD(c.updated)}</small></span></div>`).join('')||'<div class="row mu">Kol kas nėra</div>'}</div>`,
 {pjSave:()=>{p.text=$('pjTxt').value.trim();p.on=$('pjOn').checked;if(!cfg.f.projects){cfg.f.projects=true;saveCfg()}save();toast('Instrukcijos išsaugotos')},
  newIn:()=>{closePage();temp=false;upTemp();newChat(id)},open:cid=>{closePage();openChat(cid)}})};
/* ===== failai.js pabaiga ===== */
