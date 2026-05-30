/* Fix 14 — Feed watermark render override
   Purpose: render the watermark exactly as settings().app_name is saved in Admin.
   No MutationObserver, no repeated DOM rewriting. */
(function(){
  const VERSION='1.4.0';

  function safeLog(source, err, extra){
    try{
      if(typeof logRuntimeError==='function') logRuntimeError(source, err, extra||{});
      else console.error('[AIshopr feed watermark fix]', source, err, extra||{});
    }catch(e){console.error('[AIshopr feed watermark fix diagnostic failed]', e);}
  }

  function getAppName(){
    try{
      if(typeof settings==='function'){
        const s=settings();
        return String(s.app_name || 'AIshopr').trim() || 'AIshopr';
      }
    }catch(e){safeLog('feed-watermark:getAppName', e);}
    return 'AIshopr';
  }

  function escSafe(v){
    try{ if(typeof esc==='function') return esc(v); }catch(e){}
    return String(v??'').replace(/[&<>\"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  }

  function install(){
    try{
      if(typeof renderFeed!=='function' || renderFeed.__watermarkFixed) return false;
      const originalRenderFeed=renderFeed;
      const patched=function(){
        const html=originalRenderFeed();
        const name=escSafe(getAppName());
        return String(html).replace(
          /<div class="page-watermark">[\s\S]*?<\/div>\s*<div class="swipe-hint left"/,
          `<div class="page-watermark"><span>${name}</span></div><div class="swipe-hint left"`
        );
      };
      patched.__watermarkFixed=true;
      renderFeed=patched;
      window.AIshoprFeedWatermarkFix={version:VERSION,installed:true};
      return true;
    }catch(err){
      safeLog('feed-watermark:install', err);
      return false;
    }
  }

  if(!install()) setTimeout(install, 50);
})();
