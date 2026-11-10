function rodyk(t){var d=document.createElement('div');d.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99999;background:#e5484d;color:#fff;padding:14px;font:15px sans-serif;white-space:pre-wrap';d.textContent=t;(document.body||document.documentElement).appendChild(d)}
window.onerror=function(m,s,l){rodyk('KLAIDA: '+m+'\nFailas: '+(s||'').split('/').pop()+', eilutė '+l)};
addEventListener('load',function(){
 if(typeof colPage!=='function')rodyk('Neveikia app.js (failo nėra arba jo gale liko nupjauta eilutė)');
 else if(typeof doUnlock!=='function')rodyk('Neveikia app2.js (failo nėra arba jis įklijuotas ne visas)');
});
