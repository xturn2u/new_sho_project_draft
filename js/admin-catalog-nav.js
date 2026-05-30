/* AIshopr Fix 9 — Product catalog as standalone admin section */
(function(){
  const VERSION='0.9.9';

  function safeLog(source, err, extra){
    try{
      if(typeof logRuntimeError==='function') logRuntimeError(source, err, extra||{});
      else console.error('[AIshopr catalog nav]', source, err, extra||{});
    }catch(e){console.error('[AIshopr catalog nav diagnostic failed]', e);}
  }

  function icon(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73L13 2.27a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05"/><path d="M12 22.08V12"/></svg>';
  }

  function escSafe(v){
    if(typeof esc==='function') return esc(v);
    return String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  }

  function getProducts(){
    try{return typeof ideas==='function'?ideas():[]}catch(e){safeLog('admin-catalog-nav:getProducts',e);return[];}
  }

  function getLastImport(){
    try{return typeof LS!=='undefined'?LS.get('catalogLastImport',{}):{}}catch(e){return{}}
  }

  function getValidation(){
    try{return typeof LS!=='undefined'?LS.get('catalogValidation',{}):{}}catch(e){return{}}
  }

  function productRows(products){
    const visible=products.slice(0,20);
    if(!visible.length) return '<p style="font-size:12px;color:var(--ink-3)">Keine lokalen Produkte vorhanden.</p>';
    return `<table class="tbl"><thead><tr><th>Titel</th><th>Kategorie</th><th>Preis</th><th>Status</th></tr></thead><tbody>${visible.map(p=>`<tr><td>${escSafe(p.title)}</td><td>${escSafe(p.cat||'')}</td><td>${escSafe(p.price||'')}</td><td>${p.sponsored?'Sponsored':'Normal'}</td></tr>`).join('')}</tbody></table>
    ${products.length>20?`<p style="font-size:11px;color:var(--ink-3);margin-top:8px">Zeige 20 von ${products.length} Produkten.</p>`:''}`;
  }

  function renderCatalog(){
    const products=getProducts();
    const sponsored=products.filter(p=>p.sponsored).length;
    const withAff=products.filter(p=>p.affiliate||p.affiliate_url).length;
    const cats=[...new Set(products.map(p=>p.cat).filter(Boolean))];
    const validation=getValidation();
    const lastImport=getLastImport();

    const validationText=validation && validation.ts
      ? (validation.ok ? `OK · ${validation.count||0} Produkte · ${new Date(validation.ts).toLocaleString('de-DE')}` : `Fehler · ${validation.error||'unbekannt'}`)
      : 'Noch nicht geprüft';
    const lastImportText=lastImport && lastImport.ts
      ? `${lastImport.mode||'-'} · ${lastImport.count||0} importiert · Gesamt ${lastImport.total||0} · ${new Date(lastImport.ts).toLocaleString('de-DE')}`
      : 'Noch kein manueller Import';

    return `<div class="admin-section"><div class="admin-section-title">📦 Produktkatalog</div>
      <p style="font-size:13px;color:var(--ink-2);line-height:1.55;margin-bottom:14px">Fix 9: Zentraler Bereich für den externen Produktkatalog. Hier steuerst du, ob die App lokale Produktdaten nutzt oder den Katalog aus <code>/data/products.json</code> übernimmt.</p>
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-val">${products.length}</div><div class="kpi-label">Produkte lokal</div></div>
        <div class="kpi"><div class="kpi-val">${cats.length}</div><div class="kpi-label">Kategorien aktiv</div></div>
        <div class="kpi"><div class="kpi-val">${withAff}</div><div class="kpi-label">Affiliate-Produkte</div></div>
        <div class="kpi"><div class="kpi-val">${sponsored}</div><div class="kpi-label">Sponsored</div></div>
      </div>
    </div>

    <div class="admin-section"><div class="admin-section-title">JSON-Katalog verwalten</div>
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:14px;padding:14px;font-size:12px;color:var(--ink-2);line-height:1.5;margin-bottom:12px">
        <div><strong>Quelle:</strong> <code>/data/products.json</code></div>
        <div><strong>Letzte Prüfung:</strong> ${escSafe(validationText)}</div>
        <div><strong>Letzter Import:</strong> ${escSafe(lastImportText)}</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="AIshoprAdminCatalog&&AIshoprAdminCatalog.reloadProductsFromJson('overwrite')">Katalog überschreiben</button>
        <button class="btn btn-ghost" onclick="AIshoprAdminCatalog&&AIshoprAdminCatalog.reloadProductsFromJson('merge')">Katalog ergänzen</button>
        <button class="btn btn-ghost" onclick="AIshoprAdminCatalog&&AIshoprAdminCatalog.validateProductsJson()">products.json prüfen</button>
        <button class="btn btn-ghost" onclick="AIshoprAdminCatalog&&AIshoprAdminCatalog.exportLocalProducts()">Lokale Produkte exportieren</button>
        <button class="btn btn-danger" onclick="AIshoprAdminCatalog&&AIshoprAdminCatalog.clearLocalProducts()">Lokale Produkte löschen</button>
      </div>
      <p style="font-size:11px;color:var(--ink-3);line-height:1.45;margin-top:10px"><b>Harte Regel:</b> Erst prüfen, dann überschreiben. Katalog überschreiben ersetzt die lokalen Produktdaten im Browser durch <code>products.json</code>.</p>
    </div>

    <div class="admin-section"><div class="admin-section-title">Produktvorschau</div>
      ${productRows(products)}
    </div>`;
  }

  function setActiveNav(){
    document.querySelectorAll('.admin-nav-item').forEach(el=>el.classList.remove('active'));
    const item=document.querySelector('[data-admin-tab="catalog"]');
    if(item)item.classList.add('active');
  }

  function openCatalog(){
    try{
      try{if(typeof S!=='undefined')S.adminTab='catalog';}catch(e){}
      const sbar=document.querySelector('.admin-sidebar');
      if(sbar)sbar.classList.remove('open');
      const content=document.getElementById('adminContent') || document.querySelector('.admin-main');
      if(!content){try{if(typeof render==='function')render();}catch(e){} setTimeout(openCatalog,80);return;}
      content.innerHTML=renderCatalog();
      content.scrollTop=0;
      setActiveNav();
    }catch(err){safeLog('admin-catalog-nav:openCatalog',err);}
  }

  function ensureCatalogNav(){
    try{
      const sidebar=document.querySelector('.admin-sidebar');
      if(!sidebar)return;
      let item=sidebar.querySelector('[data-admin-tab="catalog"]');
      if(!item){
        const productsItem=[...sidebar.querySelectorAll('.admin-nav-item')].find(el=>/Produkte/i.test(el.textContent||''));
        item=document.createElement('div');
        item.className='admin-nav-item';
        item.dataset.adminTab='catalog';
        item.innerHTML=icon()+' Produktkatalog';
        if(productsItem && productsItem.parentNode) productsItem.parentNode.insertBefore(item, productsItem.nextSibling);
        else sidebar.appendChild(item);
      }
      item.onclick=function(ev){ev.preventDefault();ev.stopPropagation();openCatalog();return false;};
      try{if(typeof S!=='undefined'&&S.adminTab==='catalog')item.classList.add('active');}catch(e){}
    }catch(err){safeLog('admin-catalog-nav:ensureCatalogNav',err);}
  }

  function start(){
    ensureCatalogNav();
    const app=document.getElementById('app') || document.body;
    const mo=new MutationObserver(ensureCatalogNav);
    mo.observe(app,{childList:true,subtree:true});
    setInterval(ensureCatalogNav,1000);
  }

  window.AIshoprCatalogNav={version:VERSION,ensureCatalogNav,openCatalog,renderCatalog};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
  else start();
})();
