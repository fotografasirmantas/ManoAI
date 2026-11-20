'use strict';
/* Mano AI: patogus teksto žymėjimas ir kopijavimas (apsaugotas nuo dvigubo įkėlimo) */
(()=>{if(window.__kopija)return;window.__kopija=1;
P.sel='<path d="M4 7V4h3M17 4h3v3M20 17v3h-3M7 20H4v-3"/><path d="M8 12h8"/>';
const st=document.createElement('style');st.textContent=`
.msgs .md,.msgs .bub{-webkit-user-select:text;user-select:text;-webkit-touch-callout:default}
.md pre{position:relative;padding-top:36px!important}
.md pre code{white-space:pre-wrap;word-break:break-word}
.cpb{position:absolute;top:6px;right:6px;font-size:.78rem;padding:5px 11px;border-radius:8px;background:var(--bg3);color:var(--tx);-webkit-user-select:none;user-select:none}
.selta{width:100%;min-height:45vh;max-height:60vh;border:1px solid var(--ln);border-radius:14px;padding:12px;background:var(--bg2);font:inherit;font-size:1rem;line-height:1.5;resize:none;-webkit-user-select:text;user-select:text}`;
document.head.appendChild(st);
async function copyText(t){try{await navigator.clipboard.writeText(t);return true}catch{}
 const a=document.createElement('textarea');a.value=t;a.setAttribute('readonly','');a.style.cssText='position:fixed;top:0;left:0;opacity:0';
 document.body.appendChild(a);a.select();a.setSelectionRange(0,t.length);let ok=false;try{ok=document.execCommand('copy')}catch{}a.remove();return ok}
const copied=ok=>toast(ok?'Nukopijuota':'Nepavyko nukopijuoti. Pažymėkite tekstą ir kopijuokite ranka.');
const cleanCopy=s=>String(s||'').split('```').map((p,i)=>i%2?p.replace(/^[^\n]*\n/,''):p.replace(/\*\*([^*]+)\*\*/g,'$1').replace(/^#{1,6}\s+/gm,'')).join('').trim();
function decorate(){
 msgsEl.querySelectorAll('.md pre').forEach(pre=>{if(pre.querySelector('.cpb'))return;
  const b=document.createElement('button');b.className='cpb';b.dataset.cp='1';b.textContent='Kopijuoti kodą';pre.prepend(b)});
 msgsEl.querySelectorAll('.acts').forEach(a=>{if(a.querySelector('[data-act="sel"]'))return;const c=a.querySelector('[data-i]');if(!c)return;
  const b=document.createElement('button');b.className='ib';b.dataset.act='sel';b.dataset.i=c.dataset.i;b.setAttribute('aria-label','Pažymėti tekstą');b.innerHTML=ic('sel');a.appendChild(b)})}
let rcWait=false;
const selIn=()=>{const s=getSelection();return!!(s&&!s.isCollapsed&&msgsEl.contains(s.anchorNode))};
const rc=renderChat;
renderChat=function(){if(selIn()&&!busy){rcWait=true;return}rcWait=false;rc();decorate()};
document.addEventListener('selectionchange',()=>{if(rcWait&&!selIn())setTimeout(()=>{if(rcWait&&!selIn())renderChat()},300)});
function selSheet(t){openSheet(`<h3>Pažymėkite, ką norite kopijuoti</h3><textarea class="selta" id="selTa" readonly></textarea>
<div class="btns"><button class="btn" data-act="all">Kopijuoti viską</button><button class="btn p" data-act="part">Kopijuoti pažymėtą</button></div>`,{
 all:()=>copyText(t).then(ok=>{copied(ok);if(ok)back()}),
 part:()=>{const a=$('selTa'),p=a.value.slice(a.selectionStart,a.selectionEnd);
  if(!p)return toast('Pirma pažymėkite dalį: palaikykite pirštą ant žodžio ir patempkite žymeklius');
  copyText(p).then(ok=>{copied(ok);if(ok)back()})}});
 $('selTa').value=t}
msgsEl.addEventListener('click',e=>{
 const cp=e.target.closest('[data-cp]');
 if(cp){e.stopImmediatePropagation();const pre=cp.closest('pre'),code=pre.querySelector('code');copyText((code||pre).textContent).then(copied);return}
 const b=e.target.closest('[data-act="copy"],[data-act="sel"]');if(!b||!cur)return;
 const m=cur.msgs[+b.dataset.i];if(!m)return;e.stopImmediatePropagation();
 if(b.dataset.act==='copy')copyText(cleanCopy(m.text)).then(copied);else selSheet(cleanCopy(m.text))},true);
decorate();
})();
/* ===== kopija.js pabaiga ===== */
