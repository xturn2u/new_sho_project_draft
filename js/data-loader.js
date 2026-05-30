/* AIshopr Fix 6 — external data loading layer
   Safe by design: external JSON is loaded asynchronously and never breaks the app.
   The existing js/app.js keeps its internal fallback data. */
(function(){
  const DATA_VERSION = '0.9.3';
  const BASE = '/new_sho_project_draft/data/';
  const STATUS_KEY = 'externalDataStatus';

  function now(){ return new Date().toISOString(); }

  function safeLog(source, err, extra){
    try{
      if(typeof logRuntimeError === 'function') logRuntimeError(source, err, extra || {});
      else console.error('[AIshopr data-loader]', source, err, extra || {});
    }catch(e){ console.error('[AIshopr data-loader failed]', e); }
  }

  function getJson(path){
    return fetch(BASE + path + '?v=' + encodeURIComponent(DATA_VERSION), {cache:'no-store'})
      .then(res => {
        if(!res.ok) throw new Error(path + ' HTTP ' + res.status);
        return res.json();
      });
  }

  function setStatus(status){
    try{
      const current = (typeof LS !== 'undefined') ? LS.get(STATUS_KEY, {}) : {};
      const next = Object.assign({}, current || {}, status, {updated_at: now(), version: DATA_VERSION});
      if(typeof LS !== 'undefined') LS.set(STATUS_KEY, next);
      window.AIshoprExternalDataStatus = next;
    }catch(e){ safeLog('data-loader:setStatus', e); }
  }

  async function loadExternalData(options){
    const opts = Object.assign({forceProducts:false, forceSettings:false, forceCategories:false, rerender:true}, options || {});
    const result = {ok:true, categories:false, settings:false, products:false, errors:[]};

    try{
      const [catRes, settingsRes, productRes] = await Promise.allSettled([
        getJson('categories.json'),
        getJson('settings.default.json'),
        getJson('products.json')
      ]);

      if(catRes.status === 'fulfilled' && Array.isArray(catRes.value) && catRes.value.length){
        try{
          const existing = (typeof LS !== 'undefined') ? LS.get('categories', null) : null;
          const shouldApply = opts.forceCategories || !Array.isArray(existing) || !existing.length;
          if(shouldApply){
            const normalized = (typeof normalizeCategory === 'function') ? catRes.value.map(normalizeCategory) : catRes.value;
            if(typeof CATS !== 'undefined') CATS = normalized;
            if(typeof LS !== 'undefined') LS.set('categories', normalized);
            result.categories = true;
          }
        }catch(e){ result.errors.push('categories_apply'); safeLog('data-loader:categories', e); }
      } else if(catRes.status === 'rejected') {
        result.errors.push('categories_load'); safeLog('data-loader:categories-load', catRes.reason);
      }

      if(settingsRes.status === 'fulfilled' && settingsRes.value && typeof settingsRes.value === 'object'){
        try{
          const existing = (typeof LS !== 'undefined') ? LS.get('settings', null) : null;
          const hasExisting = existing && typeof existing === 'object' && Object.keys(existing).length;
          if(opts.forceSettings || !hasExisting){
            const normalized = (typeof normalizeSettings === 'function') ? normalizeSettings(settingsRes.value) : settingsRes.value;
            if(typeof LS !== 'undefined') LS.set('settings', normalized);
            result.settings = true;
          }
        }catch(e){ result.errors.push('settings_apply'); safeLog('data-loader:settings', e); }
      } else if(settingsRes.status === 'rejected') {
        result.errors.push('settings_load'); safeLog('data-loader:settings-load', settingsRes.reason);
      }

      if(productRes.status === 'fulfilled' && Array.isArray(productRes.value)){
        try{
          const externalProducts = productRes.value.filter(p => p && p.title);
          const existing = (typeof LS !== 'undefined') ? LS.get('ideas', null) : null;
          const shouldApply = externalProducts.length && (opts.forceProducts || !Array.isArray(existing) || !existing.length);
          if(shouldApply){
            const normalized = (typeof normalizeProduct === 'function') ? externalProducts.map(normalizeProduct) : externalProducts;
            if(typeof LS !== 'undefined') LS.set('ideas', normalized);
            result.products = true;
          }
        }catch(e){ result.errors.push('products_apply'); safeLog('data-loader:products', e); }
      } else if(productRes.status === 'rejected') {
        result.errors.push('products_load'); safeLog('data-loader:products-load', productRes.reason);
      }

      result.ok = result.errors.length === 0;
      setStatus(result);
      if(opts.rerender && (result.categories || result.settings || result.products) && typeof render === 'function') render();
      return result;
    }catch(err){
      result.ok = false;
      result.errors.push('fatal');
      setStatus(result);
      safeLog('data-loader:fatal', err);
      return result;
    }
  }

  window.AIshoprData = {
    version: DATA_VERSION,
    loadExternalData,
    reloadAll(){ return loadExternalData({forceProducts:true, forceSettings:true, forceCategories:true, rerender:true}); },
    status(){ return (typeof LS !== 'undefined') ? LS.get(STATUS_KEY, {}) : (window.AIshoprExternalDataStatus || {}); }
  };

  document.addEventListener('DOMContentLoaded', function(){
    loadExternalData({rerender:true});
  });
})();
