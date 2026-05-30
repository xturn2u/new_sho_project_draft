/* AIshopr Fix 8 — Admin catalog tools
   Adds safe admin controls to reload / overwrite local products from /data/products.json.
   Does not remove the app fallback data. */
(function(){
  const VERSION='0.9.5';
  const PRODUCTS_URL='/new_sho_project_draft/data/products.json';

  function safeLog(source, err, extra){
    try{
      if(typeof logRuntimeError==='function') logRuntimeError(source, err, extra||{});
      else console.error('[AIshopr catalog tools]', source, err, extra||{});
    }catch(e){console.error('[AIshopr catalog tools diagnostic failed]', e);}
  }

  function isAdminReady(){
    try{
      if(typeof requireAdminAction==='function') return requireAdminAction();
      if(window.S && S.adminLogged) return true;
      if(typeof toast==='function') toast('Admin-Login erforderlich');
      return false;
    }catch(e){return false;}
  }

  async function fetchExternalProducts(){
    const res=await fetch(PRODUCTS_URL+'?v='+encodeURIComponent(VERSION)+'&t='+Date.now(), {cache:'no-store'});
    if(!res.ok) throw new Error('products.json HTTP '+res.status);
    const data=await res.json();
    if(!Array.isArray(data)) throw new Error('products.json ist kein Array');
    return data;
  }

  function normalizeExternalProducts(data){
    const valid=data.filter(p=>p && typeof p==='object' && String(p.title||'').trim());
    if(!valid.length) throw new Error('products.json enthält keine gültigen Produkte');
    return valid.map(p => (typeof normalizeProduct==='function' ? normalizeProduct(p) : p)).filter(p=>p && p.title);
  }

  function catalogStatus(){
    let localCount=0;
    try{ localCount = Array.isArray(LS.get('ideas',null)) ? LS.get('ideas',[]).length : 0; }catch(e){}
    const externalStatus = (window.AIshoprData && typeof AIshoprData.status==='function') ? AIshoprData.status() : {};
    return {
      version: VERSION,
      localCount,
      externalStatus
    };
  }

  async function reloadProductsFromJson(mode){
    if(!isAdminReady()) return;
    const overwrite = mode === 'overwrite';
    try{
      if(typeof toast==='function') toast(overwrite ? 'Produktkatalog wird überschrieben…' : 'Produktkatalog wird ergänzt…');
      if(typeof createSnapshot==='function') createSnapshot(overwrite ? 'before_catalog_overwrite' : 'before_catalog_merge');
      const external=normalizeExternalProducts(await fetchExternalProducts());
      const current = (typeof ideas==='function') ? ideas() : [];
      let next;
      if(overwrite){
        next = external;
      } else {
        const map=new Map();
        current.forEach(p=>map.set(p.id || p.title, p));
        external.forEach(p=>map.set(p.id || p.title, p));
        next=[...map.values()];
      }
      LS.set('ideas', next);
      LS.set('catalogLastImport', {mode:overwrite?'overwrite':'merge', count:external.length, total:next.length, ts:new Date().toISOString(), version:VERSION});
      if(window.S){S.feedQueue=[];S.feedIdx=0;}
      if(typeof toast==='function') toast(`${external.length} Produkte aus products.json geladen`);
      if(typeof render==='function') render();
    }catch(err){
      safeLog('admin-catalog:reloadProductsFromJson', err, {mode});
      if(typeof toast==='function') toast('Produktkatalog konnte nicht geladen werden');
    }
  }

  function clearLocalProducts(){
    if(!isAdminReady()) return;
    if(!confirm('Lokale Produktdaten wirklich löschen? Danach nutzt die App wieder Fallback/extern geladene Daten.')) return;
    try{
      if(typeof createSnapshot==='function') createSnapshot('before_clear_local_products');
      LS.del('ideas');
      LS.del('catalogLastImport');
      if(window.S){S.feedQueue=[];S.feedIdx=0;}
      if(typeof toast==='function') toast('Lokale Produktdaten gelöscht');
      if(typeof render==='function') render();
    }catch(err){safeLog('admin-catalog:clearLocalProducts', err);}
  }

  async function validateProductsJson(){
    if(!isAdminReady()) return;
    try{
      const external=normalizeExternalProducts(await fetchExternalProducts());
      const cats=[...new Set(external.map(p=>p.cat).filter(Boolean))];
      LS.set('catalogValidation', {ok:true, count:external.length, cats, ts:new Date().toISOString(), version:VERSION});
      if(typeof toast==='function') toast(`products.json OK: ${external.length} Produkte`);
      if(typeof render==='function') render();
    }catch(err){
      LS.set('catalogValidation', {ok:false, error:String(err.message||err), ts:new Date().toISOString(), version:VERSION});
      safeLog('admin-catalog:validateProductsJson', err);
      if(typeof toast==='function') toast('products.json ist fehlerhaft');
      if(typeof render==='function') render();
    }
  }

  function exportLocalProducts(){
    if(!isAdminReady()) return;
    try{
      const payload=(typeof ideas==='function') ? ideas() : [];
      if(typeof downloadFile==='function') downloadFile(`aishopr-products-${Date.now()}.json`, JSON.stringify(payload,null,2), 'application/json');
      else navigator.clipboard?.writeText(JSON.stringify(payload,null,2));
      if(typeof toast==='function') toast('Produktdaten exportiert');
    }catch(err){safeLog('admin-catalog:exportLocalProducts', err);}
  }

  function catalogAdminSection(){
    let status={};
    let validation={};
    let lastImport={};
    try{status=catalogStatus();validation=LS.get('catalogValidation',{});lastImport=LS.get('catalogLastImport',{});}catch(e){}
    const localCount=status.localCount||0;
    const validationText=validation && validation.ts
      ? (validation.ok ? `OK · ${validation.count||0} Produkte · ${new Date(validation.ts).toLocaleString('de-DE')}` : `Fehler · ${validation.error||'unbekannt'}`)
      : 'Noch nicht geprüft';
    const lastImportText=lastImport && lastImport.ts
      ? `${lastImport.mode||'-'} · ${lastImport.count||0} importiert · Gesamt ${lastImport.total||0} · ${new Date(lastImport.ts).toLocaleString('de-DE')}`
      : 'Noch kein manueller Import';

    return `<div class="admin-section"><div class="admin-section-title">📦 Produktkatalog</div>
      <p style="font-size:12px;color:var(--ink-2);line-height:1.5;margin-bottom:12px">Fix 8: Lade Produktdaten gezielt aus <code>/data/products.json</code>, ohne den Browser-Speicher manuell zu löschen.</p>
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-val">${localCount}</div><div class="kpi-label">Lokale Produkte</div></div>
        <div class="kpi"><div class="kpi-val">${validation && validation.ok ? 'OK' : (validation && validation.ts ? 'Fehler' : '—')}</div><div class="kpi-label">JSON-Prüfung</div></div>
      </div>
      <div style="font-size:12px;color:var(--ink-3);line-height:1.5;margin:12px 0">
        <div><strong>Letzte Prüfung:</strong> ${typeof esc==='function'?esc(validationText):validationText}</div>
        <div><strong>Letzter Import:</strong> ${typeof esc==='function'?esc(lastImportText):lastImportText}</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="AIshoprAdminCatalog.reloadProductsFromJson('overwrite')">Katalog überschreiben</button>
        <button class="btn btn-ghost" onclick="AIshoprAdminCatalog.reloadProductsFromJson('merge')">Katalog ergänzen</button>
        <button class="btn btn-ghost" onclick="AIshoprAdminCatalog.validateProductsJson()">products.json prüfen</button>
        <button class="btn btn-ghost" onclick="AIshoprAdminCatalog.exportLocalProducts()">Lokale Produkte exportieren</button>
        <button class="btn btn-danger" onclick="AIshoprAdminCatalog.clearLocalProducts()">Lokale Produkte löschen</button>
      </div>
    </div>`;
  }

  function patchAdminDiagnostics(){
    try{
      if(typeof adminDiagnostics!=='function' || adminDiagnostics.__catalogPatched) return;
      const original=adminDiagnostics;
      const patched=function(){
        return original() + catalogAdminSection();
      };
      patched.__catalogPatched=true;
      window.adminDiagnostics=patched;
      try{adminDiagnostics=patched;}catch(e){}
    }catch(err){safeLog('admin-catalog:patchAdminDiagnostics', err);}
  }

  window.AIshoprAdminCatalog={
    version: VERSION,
    reloadProductsFromJson,
    validateProductsJson,
    clearLocalProducts,
    exportLocalProducts,
    status: catalogStatus
  };

  patchAdminDiagnostics();
  document.addEventListener('DOMContentLoaded', patchAdminDiagnostics);
})();
