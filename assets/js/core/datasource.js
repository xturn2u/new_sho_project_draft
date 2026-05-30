/* AIshopr Fix 10 — Backend-ready DataSource layer
   Current mode: static JSON + LocalStorage fallback.
   Future mode: PHP API + MySQL.
   This file is intentionally non-invasive: it exposes window.AIshoprDataSource without changing the current app flow yet. */
(function(){
  const VERSION='1.0.0-backend-ready';
  const STATIC_BASE='/new_sho_project_draft/data/';
  const API_BASE='/api/';

  function safeLog(source, err, extra){
    try{
      if(typeof logRuntimeError==='function') logRuntimeError(source, err, extra||{});
      else console.error('[AIshopr DataSource]', source, err, extra||{});
    }catch(e){console.error('[AIshopr DataSource diagnostic failed]', e);}
  }

  async function fetchJson(url){
    const res=await fetch(url,{cache:'no-store'});
    if(!res.ok) throw new Error(url+' HTTP '+res.status);
    return await res.json();
  }

  function mode(){
    try{
      const s=typeof settings==='function'?settings():{};
      return s.db_mode==='mysql'?'api':'json';
    }catch(e){return 'json';}
  }

  const jsonSource={
    async listProducts(){return await fetchJson(STATIC_BASE+'products.json?v='+Date.now());},
    async listCategories(){return await fetchJson(STATIC_BASE+'categories.json?v='+Date.now());},
    async loadDefaultSettings(){return await fetchJson(STATIC_BASE+'settings.default.json?v='+Date.now());},
    async saveProduct(product){
      throw new Error('Static JSON mode cannot write to /data/products.json from the browser. Use export or PHP API mode.');
    },
    async saveSettings(settingsPayload){
      throw new Error('Static JSON mode cannot write settings from the browser. Use LocalStorage or PHP API mode.');
    }
  };

  const apiSource={
    async listProducts(){return await fetchJson(API_BASE+'products/list.php');},
    async listCategories(){return await fetchJson(API_BASE+'categories/list.php');},
    async loadDefaultSettings(){return await fetchJson(API_BASE+'settings/load.php');},
    async saveProduct(product){
      const res=await fetch(API_BASE+'products/save.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(product)});
      if(!res.ok) throw new Error('products/save.php HTTP '+res.status);
      return await res.json();
    },
    async saveSettings(settingsPayload){
      const res=await fetch(API_BASE+'settings/save.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(settingsPayload)});
      if(!res.ok) throw new Error('settings/save.php HTTP '+res.status);
      return await res.json();
    }
  };

  function source(){return mode()==='api'?apiSource:jsonSource;}

  window.AIshoprDataSource={
    version:VERSION,
    mode,
    source,
    products:{
      list(){return source().listProducts().catch(err=>{safeLog('datasource.products.list',err);throw err;});},
      save(product){return source().saveProduct(product).catch(err=>{safeLog('datasource.products.save',err);throw err;});}
    },
    categories:{
      list(){return source().listCategories().catch(err=>{safeLog('datasource.categories.list',err);throw err;});}
    },
    settings:{
      loadDefaults(){return source().loadDefaultSettings().catch(err=>{safeLog('datasource.settings.loadDefaults',err);throw err;});},
      save(payload){return source().saveSettings(payload).catch(err=>{safeLog('datasource.settings.save',err);throw err;});}
    }
  };
})();
