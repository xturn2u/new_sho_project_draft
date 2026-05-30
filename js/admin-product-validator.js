/* Fix 16 — Admin UI for product schema validation */
(function(){
  const VERSION='1.6.0';

  function safeLog(source, err, extra){
    try{
      if(typeof logRuntimeError==='function') logRuntimeError(source, err, extra||{});
      else console.error('[AIshopr AdminProductValidator]', source, err, extra||{});
    }catch(e){console.error('[AIshopr AdminProductValidator diagnostic failed]', e);}
  }

  function escSafe(v){
    try{if(typeof esc==='function')return esc(v);}catch(e){}
    return String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  }

  function getLocalProducts(){
    try{return typeof ideas==='function'?ideas():[];}catch(e){safeLog('admin-validator:getLocalProducts',e);return[];}
  }

  function setReport(report){
    try{if(typeof LS!=='undefined')LS.set('productValidationReport',report);}catch(e){}
    window.AIshoprLastProductValidation=report;
  }

  async function validateExternal(){
    try{
      if(typeof toast==='function')toast('products.json wird geprüft…');
      const validator=window.AIshoprProductValidator;
      if(!validator)throw new Error('ProductValidator nicht geladen');
      const report=await validator.validateExternalProducts();
      setReport(report);
      if(typeof toast==='function')toast(report.ok?`products.json OK: ${report.count} Produkte`:`products.json fehlerhaft: ${report.errors.length} Fehler`);
      if(window.AIshoprCatalogNav&&typeof AIshoprCatalogNav.openCatalog==='function')AIshoprCatalogNav.openCatalog();
      else if(typeof render==='function')render();
      return report;
    }catch(err){
      const report={ok:false,count:0,errors:[{code:'validator_failed',msg:String(err.message||err),index:'',id:'',field:''}],warnings:[],ts:new Date().toISOString(),version:VERSION};
      setReport(report);
      safeLog('admin-validator:validateExternal',err);
      if(typeof toast==='function')toast('Prüfung fehlgeschlagen');
      return report;
    }
  }

  function validateLocal(){
    try{
      const validator=window.AIshoprProductValidator;
      if(!validator)throw new Error('ProductValidator nicht geladen');
      const report=validator.validateProducts(getLocalProducts());
      setReport(report);
      if(typeof toast==='function')toast(report.ok?`Lokale Produkte OK: ${report.count}`:`Lokale Produkte fehlerhaft: ${report.errors.length} Fehler`);
      if(window.AIshoprCatalogNav&&typeof AIshoprCatalogNav.openCatalog==='function')AIshoprCatalogNav.openCatalog();
      else if(typeof render==='function')render();
      return report;
    }catch(err){
      safeLog('admin-validator:validateLocal',err);
      if(typeof toast==='function')toast('Lokale Prüfung fehlgeschlagen');
      return null;
    }
  }

  function exportReport(){
    try{
      const report=(typeof LS!=='undefined'?LS.get('productValidationReport',null):null)||window.AIshoprLastProductValidation;
      if(!report){if(typeof toast==='function')toast('Kein Prüfbericht vorhanden');return;}
      if(typeof downloadFile==='function')downloadFile(`aishopr-product-validation-${Date.now()}.json`,JSON.stringify(report,null,2),'application/json');
      else navigator.clipboard?.writeText(JSON.stringify(report,null,2));
      if(typeof toast==='function')toast('Prüfbericht exportiert');
    }catch(err){safeLog('admin-validator:exportReport',err);}
  }

  function getReport(){
    try{return (typeof LS!=='undefined'?LS.get('productValidationReport',null):null)||window.AIshoprLastProductValidation||null;}catch(e){return null;}
  }

  function reportHtml(limit){
    const report=getReport();
    if(!report)return `<div class="admin-section"><div class="admin-section-title">Produktdaten-Validator</div><p style="font-size:12px;color:var(--ink-3)">Noch kein Prüfbericht vorhanden.</p></div>`;
    const max=limit||12;
    const errors=(report.errors||[]).slice(0,max);
    const warnings=(report.warnings||[]).slice(0,max);
    const row=(x,type)=>`<div class="item" style="cursor:default;align-items:flex-start"><div class="item-body"><div class="item-title">${type==='error'?'❌':'⚠️'} ${escSafe(x.code)} ${x.index!==''?`· Zeile/Index ${escSafe(x.index)}`:''} ${x.id?`· ${escSafe(x.id)}`:''}</div><div class="item-sub">${escSafe(x.msg)}${x.field?` · Feld: ${escSafe(x.field)}`:''}</div></div></div>`;
    return `<div class="admin-section"><div class="admin-section-title">🧪 Produktdaten-Validator</div>
      <div class="kpi-grid"><div class="kpi"><div class="kpi-val">${report.ok?'OK':'Fehler'}</div><div class="kpi-label">Status</div></div><div class="kpi"><div class="kpi-val">${report.count||0}</div><div class="kpi-label">Produkte</div></div><div class="kpi"><div class="kpi-val">${(report.errors||[]).length}</div><div class="kpi-label">Fehler</div></div><div class="kpi"><div class="kpi-val">${(report.warnings||[]).length}</div><div class="kpi-label">Warnungen</div></div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn btn-primary" onclick="AIshoprAdminProductValidator.validateExternal()">products.json prüfen</button><button class="btn btn-ghost" onclick="AIshoprAdminProductValidator.validateLocal()">Lokale Produkte prüfen</button><button class="btn btn-ghost" onclick="AIshoprAdminProductValidator.exportReport()">Prüfbericht exportieren</button></div>
      <p style="font-size:11px;color:var(--ink-3);margin-top:10px">Letzte Prüfung: ${report.ts?escSafe(new Date(report.ts).toLocaleString('de-DE')):'—'}</p>
      ${(report.errors||[]).length?`<div style="margin-top:14px"><h4 style="font-size:13px;margin-bottom:8px">Fehler</h4>${errors.map(e=>row(e,'error')).join('')}${(report.errors||[]).length>max?`<p style="font-size:11px;color:var(--ink-3)">Weitere Fehler im Exportbericht.</p>`:''}</div>`:''}
      ${(report.warnings||[]).length?`<div style="margin-top:14px"><h4 style="font-size:13px;margin-bottom:8px">Warnungen</h4>${warnings.map(w=>row(w,'warning')).join('')}${(report.warnings||[]).length>max?`<p style="font-size:11px;color:var(--ink-3)">Weitere Warnungen im Exportbericht.</p>`:''}</div>`:''}
    </div>`;
  }

  function patchCatalogRender(){
    try{
      if(!window.AIshoprCatalogNav||typeof AIshoprCatalogNav.renderCatalog!=='function'||AIshoprCatalogNav.renderCatalog.__validatorPatched)return false;
      const original=AIshoprCatalogNav.renderCatalog;
      const patched=function(){return original()+reportHtml(10);};
      patched.__validatorPatched=true;
      AIshoprCatalogNav.renderCatalog=patched;
      return true;
    }catch(err){safeLog('admin-validator:patchCatalogRender',err);return false;}
  }

  window.AIshoprAdminProductValidator={version:VERSION,validateExternal,validateLocal,exportReport,reportHtml,patchCatalogRender};
  if(!patchCatalogRender())setTimeout(patchCatalogRender,100);
})();
