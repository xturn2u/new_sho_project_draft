/* Fix 15 — Central Branding Layer
   One normalized source for app name, tagline, logo text, document title and visual watermark text.
   This module is intentionally defensive and keeps the current app flow stable. */
(function(){
  const VERSION='1.5.0';

  function safeLog(source, err, extra){
    try{
      if(typeof logRuntimeError==='function') logRuntimeError(source, err, extra||{});
      else console.error('[AIshopr Branding]', source, err, extra||{});
    }catch(e){console.error('[AIshopr Branding diagnostic failed]', e);}
  }

  function rawSettings(){
    try{
      if(typeof settings==='function') return settings() || {};
    }catch(err){safeLog('branding.rawSettings', err);}
    return {};
  }

  function cleanText(value, fallback){
    const text=String(value??'').replace(/\s+/g,' ').trim();
    return text || fallback;
  }

  function get(){
    const s=rawSettings();
    const appName=cleanText(s.app_name,'AIshopr');
    const tagline=cleanText(s.app_tagline,'Nicht suchen. Swipen. Smarter kaufen.');
    const logoText=cleanText(s.logo_text || s.app_name, appName);
    const logoSymbol=cleanText(s.logo_symbol || '', '');
    const logoImage=cleanText(s.logo || '', '');
    return {
      version:VERSION,
      appName,
      tagline,
      logoText,
      logoSymbol,
      logoImage,
      title:`${appName} — ${tagline}`,
      watermark:appName
    };
  }

  function escSafe(value){
    try{ if(typeof esc==='function') return esc(value); }catch(e){}
    return String(value??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  }

  function applyDocumentTitle(){
    try{
      const b=get();
      document.title=b.title;
      const titleEl=document.getElementById('appTitle');
      if(titleEl) titleEl.textContent=b.title;
    }catch(err){safeLog('branding.applyDocumentTitle', err);}
  }

  function logoHtml(admin=false){
    const b=get();
    if(b.logoImage){
      return `<img src="${escSafe(b.logoImage)}" alt="${escSafe(b.appName)}" style="max-height:${admin?32:42}px;max-width:${admin?140:180}px;object-fit:contain">`;
    }
    return `<div class="logo" onclick="showView&&showView('home')">${escSafe(b.logoText)}</div>`;
  }

  function install(){
    try{
      if(typeof updateAppBranding==='function' && !updateAppBranding.__brandingFixed){
        const patched=function(){ applyDocumentTitle(); };
        patched.__brandingFixed=true;
        updateAppBranding=patched;
      }

      if(typeof getLogoHtml==='function' && !getLogoHtml.__brandingFixed){
        const patchedLogo=function(admin=false){ return logoHtml(admin); };
        patchedLogo.__brandingFixed=true;
        getLogoHtml=patchedLogo;
      }

      if(typeof renderFeed==='function' && !renderFeed.__brandingWatermarkFixed){
        const originalRenderFeed=renderFeed;
        const patchedFeed=function(){
          const html=originalRenderFeed();
          const name=escSafe(get().watermark);
          return String(html).replace(
            /<div class="page-watermark">[\s\S]*?<\/div>\s*<div class="swipe-hint left"/,
            `<div class="page-watermark"><span>${name}</span></div><div class="swipe-hint left"`
          );
        };
        patchedFeed.__brandingWatermarkFixed=true;
        renderFeed=patchedFeed;
      }

      window.AIshoprBranding={version:VERSION,get,applyDocumentTitle,logoHtml,installed:true};
      applyDocumentTitle();
      return true;
    }catch(err){safeLog('branding.install', err);return false;}
  }

  if(!install()) setTimeout(install, 50);
})();
