'use strict';
/* Mano AI: PDF su sugadintu kodavimu. Įkelti po failai.js */
const PJ='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
function pdfGarbled(t){const s=t.replace(/\[\d+ psl\.\]/g,'').replace(/\s/g,'');if(s.length<20)return true;
 const ok=(s.match(/[A-Za-z0-9\u00C0-\u024F\u0400-\u04FF.,;:!?()\[\]\-–—„“"'%€$+=\/@#&*_<>|]/g)||[]).length;
 return ok/s.length<0.85}
readPdf=async function(buf,name){const L=await pdfLib();
 const task=L.getDocument({data:new Uint8Array(buf),isEvalSupported:false,cMapUrl:PJ+'cmaps/',cMapPacked:true,standardFontDataUrl:PJ+'standard_fonts/'});
 task.onPassword=(upd,reason)=>{const p=prompt((reason===2?'Neteisingas slaptažodis. ':'')+'PDF „'+name+'“ apsaugotas slaptažodžiu. Įveskite slaptažodį:');if(p===null)task.destroy();else upd(p)};
 let pdf;try{pdf=await task.promise}catch(e){throw new Error(/destroy|Worker was/i.test(e.message)?'atšaukta':e.message)}
 let t='';for(let i=1;i<=pdf.numPages&&t.length<200000;i++){const pg=await pdf.getPage(i);
  t+=`\n[${i} psl.]\n`+(await pg.getTextContent()).items.map(x=>x.str+(x.hasEOL?'\n':' ')).join('')}
 if(!pdfGarbled(t))return[T(name,`[PDF, ${pdf.numPages} psl.]\n`+t)];
 const n=Math.min(8,pdf.numPages);
 const out=[T(name,`[PDF „${name}“, ${pdf.numPages} psl. Teksto sluoksnis sugadintas arba nuskenuotas, todėl pridėti ${n} puslapių vaizdai. Perskaityk tekstą tiesiai iš vaizdų ir neišgalvok to, ko nematai.${pdf.numPages>n?` Pasakyk vartotojui, kad matai tik pirmus ${n} psl.`:''}]`)];
 for(let i=1;i<=n;i++){toast(`PDF tekstas sugadintas, ruošiami vaizdai ${i}/${n}…`,60000);
  const pg=await pdf.getPage(i),v0=pg.getViewport({scale:1}),v=pg.getViewport({scale:Math.min(2.2,1300/v0.width)});
  const c=document.createElement('canvas');c.width=Math.round(v.width);c.height=Math.round(v.height);
  const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);
  await pg.render({canvasContext:x,viewport:v}).promise;
  out.push({kind:'img',name:name+' ('+i+' psl.)',mime:'image/jpeg',data:c.toDataURL('image/jpeg',.82)});c.width=c.height=0}
 return out};
/* ===== pdftekstas.js pabaiga ===== */
