/* Mega-Fix 23.3 — Feed header markup override
   Adds centered logo row above slimmer full-width tab bar, closer to approved mockup. */
(function(){
  const VERSION='2.3.3';
  function safeLog(source, err, extra){
    try{if(typeof logRuntimeError==='function')logRuntimeError(source,err,extra||{});else console.error('[AIshopr FeedHeader]',source,err,extra||{});}catch(e){}
  }
  function escSafe(v){
    try{if(typeof esc==='function')return esc(v);}catch(e){}
    return String(v??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  }
  function brandLogo(){
    let name='aiShopr.com';
    try{name=(settings().app_name||'aiShopr.com').trim()||'aiShopr.com';}catch(e){}
    const lower=name.toLowerCase();
    if(lower.includes('aishopr')){
      const suffix=lower.includes('.com')?'.com':'';
      return `<div class="feed-logo-word"><span class="ai">ai</span>Shopr<span class="dotcom">${suffix}</span></div>`;
    }
    return `<div class="feed-logo-word">${escSafe(name)}</div>`;
  }
  function install(){
    try{
      if(typeof renderFeed!=='function'||renderFeed.__feedHeaderRedesignPatched)return false;
      const original=renderFeed;
      const patched=function(){
        let html=String(original());
        html=html.replace('<div class="feed-head">',`<div class="feed-brandbar"><button class="feed-menu-btn" onclick="showView('admin')" aria-label="Menü">☰</button>${brandLogo()}<button class="feed-refresh-btn" onclick="loadFeed(true)" aria-label="Neu laden">↻</button></div><div class="feed-head">`);
        return html;
      };
      patched.__feedHeaderRedesignPatched=true;
      renderFeed=patched;
      window.AIshoprFeedHeaderRedesign={version:VERSION,installed:true};
      return true;
    }catch(err){safeLog('feed-header-redesign:install',err);return false;}
  }
  if(!install())setTimeout(install,150);
})();
