/* Fix 19 — attach catalog extensions to the active native admin route
   Since Fix 11, the Product Catalog page is rendered by admin-native-routes.js.
   This module appends validator and Amazon demo panels to that active catalog renderer. */
(function(){
  const VERSION='1.9.0';

  function safeLog(source, err, extra){
    try{
      if(typeof logRuntimeError==='function') logRuntimeError(source, err, extra||{});
      else console.error('[AIshopr Catalog Extensions]', source, err, extra||{});
    }catch(e){console.error('[AIshopr Catalog Extensions diagnostic failed]', e);}
  }

  function extensionHtml(){
    let html='';
    try{
      if(window.AIshoprAdminProductValidator && typeof AIshoprAdminProductValidator.reportHtml==='function'){
        html += AIshoprAdminProductValidator.reportHtml(10);
      }
    }catch(err){safeLog('catalog-extensions:validator-panel',err);}
    try{
      if(window.AIshoprAmazonDemo && typeof AIshoprAmazonDemo.panelHtml==='function'){
        html += AIshoprAmazonDemo.panelHtml();
      }
    }catch(err){safeLog('catalog-extensions:amazon-panel',err);}
    return html;
  }

  function install(){
    try{
      if(typeof adminPage!=='function') return false;
      if(adminPage.__catalogExtensionsPatched) return true;
      const original=adminPage;
      const patched=function(tab){
        const html=original(tab);
        if(tab==='catalog') return String(html)+extensionHtml();
        return html;
      };
      patched.__catalogExtensionsPatched=true;
      adminPage=patched;
      window.AIshoprCatalogNativeExtensions={version:VERSION,installed:true};
      return true;
    }catch(err){
      safeLog('catalog-extensions:install',err);
      return false;
    }
  }

  if(!install()) setTimeout(install,100);
})();
