/* Fix 17 — Amazon demo catalog import tools
   Imports clearly marked Amazon demo products from /data/products.amazon.demo.json.
   No real Amazon data, no copied images, no real ASIN claims. */
(function(){
  const VERSION='1.7.0';
  const DEMO_URL='/new_sho_project_draft/data/products.amazon.demo.json';

  function safeLog(source, err, extra){
    try{
      if(typeof logRuntimeError==='function') logRuntimeError(source, err, extra||{});
      else console.error('[AIshopr AmazonDemo]', source, err, extra||{});
    }catch(e){console.error('[AIshopr AmazonDemo diagnostic failed]', e);}
  }

  function escSafe(v){
    try{if(typeof esc==='function')return esc(v);}catch(e){}
    return String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  }

  async function fetchDemo(){
    const res=await fetch(DEMO_URL+'?v='+VERSION+'&t='+Date.now(),{cache:'no-store'});
    if(!res.ok)throw new Error('products.amazon.demo.json HTTP '+res.status);
    const data=await res.json();
    if(!Array.isArray(data))throw new Error('Amazon Demo-Katalog ist kein Array');
    return data;
  }

  function normalizeDemo(data){
    const list=data.filter(p=>p&&p.title).map(p=>{
      const n=typeof normalizeProduct==='function'?normalizeProduct(p):Object.assign({},p);
      n.source='amazon_demo';
      n.affiliate_provider='amazon';
      n.merchant_name=n.merchant_name||'Amazon Demo';
      n.status='draft';
      n.sponsored=false;
      n.image_url='';
      return n;
    });
    if(!list.length)throw new Error('Keine gültigen Amazon-Demo-Produkte gefunden');
    return list;
  }

  async function validateDemo(){
    try{
      if(typeof toast==='function')toast('Amazon-Demo-Katalog wird geprüft…');
      const data=normalizeDemo(await fetchDemo());
      const validator=window.AIshoprProductValidator;
      const report=validator?validator.validateProducts(data):{ok:true,count:data.length,errors:[],warnings:[],ts:new Date().toISOString(),version:VERSION};
      report.source='amazon_demo';
      if(typeof LS!=='undefined')LS.set('amazonDemoValidationReport',report);
      if(typeof toast==='function')toast(report.ok?`Amazon Demo OK: ${report.count} Produkte`:`Amazon Demo fehlerhaft: ${report.errors.length} Fehler`);
      if(window.AIshoprCatalogNav&&typeof AIshoprCatalogNav.openCatalog==='function')AIshoprCatalogNav.openCatalog();
      return report;
    }catch(err){
      safeLog('amazon-demo:validateDemo',err);
      if(typeof toast==='function')toast('Amazon-Demo-Prüfung fehlgeschlagen');
      return null;
    }
  }

  async function importDemo(mode){
    try{
      const mergeMode=mode||'merge';
      if(typeof toast==='function')toast('Amazon-Demo-Produkte werden importiert…');
      if(typeof createSnapshot==='function')createSnapshot('before_amazon_demo_import');
      const demo=normalizeDemo(await fetchDemo());
      const validator=window.AIshoprProductValidator;
      if(validator){
        const report=validator.validateProducts(demo);
        if(typeof LS!=='undefined')LS.set('amazonDemoValidationReport',report);
        if(!report.ok)throw new Error('Amazon-Demo-Katalog hat Validierungsfehler');
      }
      const current=typeof ideas==='function'?ideas():[];
      let next;
      if(mergeMode==='overwrite_demo'){
        next=current.filter(p=>p.source!=='amazon_demo');
        next.push(...demo);
      }else{
        const map=new Map();
        current.forEach(p=>map.set(p.id||p.title,p));
        demo.forEach(p=>map.set(p.id||p.title,p));
        next=[...map.values()];
      }
      if(typeof LS!=='undefined'){
        LS.set('ideas',next);
        LS.set('amazonDemoLastImport',{mode:mergeMode,count:demo.length,total:next.length,ts:new Date().toISOString(),version:VERSION});
      }
      try{if(typeof S!=='undefined'){S.feedQueue=[];S.feedIdx=0;}}catch(e){}
      if(typeof toast==='function')toast(`${demo.length} Amazon-Demo-Produkte importiert`);
      if(window.AIshoprCatalogNav&&typeof AIshoprCatalogNav.openCatalog==='function')AIshoprCatalogNav.openCatalog();
      else if(typeof render==='function')render();
      return next;
    }catch(err){
      safeLog('amazon-demo:importDemo',err,{mode});
      if(typeof toast==='function')toast('Amazon-Demo-Import fehlgeschlagen');
      return null;
    }
  }

  function removeDemo(){
    try{
      if(!confirm('Alle Amazon-Demo-Produkte aus lokalen Produkten entfernen?'))return;
      if(typeof createSnapshot==='function')createSnapshot('before_remove_amazon_demo');
      const current=typeof ideas==='function'?ideas():[];
      const next=current.filter(p=>p.source!=='amazon_demo');
      if(typeof LS!=='undefined'){
        LS.set('ideas',next);
        LS.set('amazonDemoLastImport',{mode:'remove',count:current.length-next.length,total:next.length,ts:new Date().toISOString(),version:VERSION});
      }
      try{if(typeof S!=='undefined'){S.feedQueue=[];S.feedIdx=0;}}catch(e){}
      if(typeof toast==='function')toast('Amazon-Demo-Produkte entfernt');
      if(window.AIshoprCatalogNav&&typeof AIshoprCatalogNav.openCatalog==='function')AIshoprCatalogNav.openCatalog();
      else if(typeof render==='function')render();
    }catch(err){safeLog('amazon-demo:removeDemo',err);}
  }

  function status(){
    let products=[];let last={};let validation={};
    try{products=typeof ideas==='function'?ideas():[];}catch(e){}
    try{if(typeof LS!=='undefined'){last=LS.get('amazonDemoLastImport',{});validation=LS.get('amazonDemoValidationReport',{});}}catch(e){}
    const demoCount=products.filter(p=>p.source==='amazon_demo').length;
    return {version:VERSION,demoCount,last,validation};
  }

  function panelHtml(){
    const s=status();
    const last=s.last&&s.last.ts?`${s.last.mode||'-'} · ${s.last.count||0} · Gesamt ${s.last.total||0} · ${new Date(s.last.ts).toLocaleString('de-DE')}`:'Noch kein Import';
    const val=s.validation&&s.validation.ts?(s.validation.ok?`OK · ${s.validation.count||0} Produkte`:`Fehler · ${(s.validation.errors||[]).length}`):'Noch nicht geprüft';
    return `<div class="admin-section"><div class="admin-section-title">🛒 Amazon-Demo-Katalog</div>
      <p style="font-size:12px;color:var(--ink-2);line-height:1.5;margin-bottom:12px">Demo-Daten für Amazon-Affiliate-Logik. Keine echten Amazon-Produktdaten, keine echten Bilder, alle Produkte bleiben <code>draft</code>.</p>
      <div class="kpi-grid"><div class="kpi"><div class="kpi-val">${s.demoCount}</div><div class="kpi-label">Demo-Produkte lokal</div></div><div class="kpi"><div class="kpi-val">${s.validation&&s.validation.ok?'OK':(s.validation&&s.validation.ts?'Fehler':'—')}</div><div class="kpi-label">Demo-Prüfung</div></div></div>
      <div style="font-size:12px;color:var(--ink-3);line-height:1.5;margin:12px 0"><div><strong>Quelle:</strong> <code>/data/products.amazon.demo.json</code></div><div><strong>Letzte Prüfung:</strong> ${escSafe(val)}</div><div><strong>Letzter Import:</strong> ${escSafe(last)}</div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-primary" onclick="AIshoprAmazonDemo.importDemo('merge')">Amazon Demo importieren/aktualisieren</button><button class="btn btn-ghost" onclick="AIshoprAmazonDemo.importDemo('overwrite_demo')">Nur Demo ersetzen</button><button class="btn btn-ghost" onclick="AIshoprAmazonDemo.validateDemo()">Demo prüfen</button><button class="btn btn-danger" onclick="AIshoprAmazonDemo.removeDemo()">Demo entfernen</button></div>
    </div>`;
  }

  function patchCatalogRender(){
    try{
      if(!window.AIshoprCatalogNav||typeof AIshoprCatalogNav.renderCatalog!=='function'||AIshoprCatalogNav.renderCatalog.__amazonDemoPatched)return false;
      const original=AIshoprCatalogNav.renderCatalog;
      const patched=function(){return original()+panelHtml();};
      patched.__amazonDemoPatched=true;
      AIshoprCatalogNav.renderCatalog=patched;
      return true;
    }catch(err){safeLog('amazon-demo:patchCatalogRender',err);return false;}
  }

  window.AIshoprAmazonDemo={version:VERSION,fetchDemo,validateDemo,importDemo,removeDemo,status,panelHtml,patchCatalogRender};
  if(!patchCatalogRender())setTimeout(patchCatalogRender,150);
})();
