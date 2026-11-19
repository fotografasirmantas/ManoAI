'use strict';
/* Mano AI: PDF su sugadintu kodavimu (v2). Įkelti po failai.js */
const PJ='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
function pdfGarbled(t){const s=t.replace(/\[\d+ psl\.\]/g,'').replace(/\s/g,'');if(s.length<20)return true;
 const L=s.match(/\p{L}/gu)||[];if(L.length<s.length*0.5)return true;
 const v=(s.match(/[aeiouyąęėįųūAEIOUYĄĘĖĮŲŪаеёиоуыэюяАЕЁИОУЫЭЮЯ]/g)||[]).length/L.length;
 if(v<0.22||v>0.65)return true;
 const odd=(s.match(/[^\x20-\x7E\u0104-\u017E\u0400-\u04FF„“–—€°«»’‘]/g)||[]).length;
 return odd/s.length>0.08}
readPdf=async function(buf,name){const Lb=await pdfLib();
 const task=Lb.getDocument({data:new Uint8Array(buf),isEvalSupported:false,cMapUrl:PJ+'cmaps/',cMapPacked:true,standardFontDataUrl:PJ+'standard_fonts/'});
 task.onPassword=(upd,reason)=>{const p=prompt((reason===2?'Neteisingas slaptažodis. ':'')+'PDF „'+name+'“ apsaugotas slaptažodžiu. Įveskite slaptažodį:');if(p===null)task.destroy();else upd(p)};
 let pdf;try{pdf=await task.promise}catch(e){throw new Error(/destroy|Worker was/i.test(e.message)?'atšaukta':e.message)}
 let t='';for(let i=1;i<=pdf.numPages&&t.length<200000;i++){const pg=await pdf.getPage(i);
  t+=`\n[${i} psl.]\n`+(await pg.getTextContent()).items.map(x=>x.str+(x.hasEOL?'\n':' ')).join('')}
 const bad=pdfGarbled(t),n=Math.min(8,pdf.numPages);
 const head=`[PDF „${name}“, ${pdf.numPages} psl. Pridėti ${n} puslapių vaizdai.${pdf.numPages>n?` Vaizdus matai tik pirmų ${n} psl.`:''}`;
 const out=[T(name,bad
  ?head+' PDF teksto sluoksnis sugadintas, todėl jo nėra. Skaityk tekstą TIK iš vaizdų ir neišgalvok to, ko nematai.]'
  :head+' Žemiau tekstas iš PDF. Jei jis atrodo sugadintas ar nesuprantamas, jo NENAUDOK, o skaityk iš vaizdų.]\n'+t)];
 for(let i=1;i<=n;i++){toast(`Ruošiami PDF puslapiai ${i}/${n}…`,60000);
  const pg=await pdf.getPage(i),v0=pg.getViewport({scale:1}),v=pg.getViewport({scale:Math.min(2.2,1300/v0.width)});
  const c=document.createElement('canvas');c.width=Math.round(v.width);c.height=Math.round(v.height);
  const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);
  await pg.render({canvasContext:x,viewport:v}).promise;
  out.push({kind:'img',name:name+' ('+i+' psl.)',mime:'image/jpeg',data:c.toDataURL('image/jpeg',.82)});c.width=c.height=0}
 toast('PDF paruoštas');return out};
/* ===== pdftekstas.js pabaiga ===== */
