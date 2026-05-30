/* Fix 13 — Sync feed watermark with Admin app name setting
   The visual watermark must match settings().app_name exactly. */
(function(){
  const VERSION='1.3.0';

  function safeName(){
    try{
      if(typeof settings==='function'){
        const s=settings();
        return String(s.app_name || 'AIshopr').trim() || 'AIshopr';
      }
    }catch(e){}
    return 'AIshopr';
  }

  function syncWatermark(){
    try{
      const wm=document.querySelector('.page-watermark');
      if(!wm)return;
      const name=safeName();
      const spans=wm.querySelectorAll('span');
      if(!spans.length){
        const span=document.createElement('span');
        span.textContent=name;
        wm.appendChild(span);
        return;
      }
      spans.forEach((span,idx)=>{
        span.textContent=idx===0?name:'';
        span.setAttribute('aria-hidden','true');
      });
      wm.setAttribute('data-watermark',name);
    }catch(err){
      try{if(typeof logRuntimeError==='function')logRuntimeError('watermark-settings-sync',err);}catch(e){}
    }
  }

  function start(){
    syncWatermark();
    const app=document.getElementById('app')||document.body;
    const mo=new MutationObserver(syncWatermark);
    mo.observe(app,{childList:true,subtree:true});
    window.AIshoprWatermarkSync={version:VERSION,sync:syncWatermark};
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
  else start();
})();
