/* AIshopr Fix 8.2 — make diagnostics click render directly */
(function(){
  const VERSION='0.9.7';

  function safeLog(source, err, extra){
    try{
      if(typeof logRuntimeError==='function') logRuntimeError(source, err, extra||{});
      else console.error('[AIshopr diagnostics nav]', source, err, extra||{});
    }catch(e){console.error('[AIshopr diagnostics nav diagnostic failed]', e);}
  }

  function icon(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
  }

  function fallbackDiagnostics(){
    const errors = (typeof getRuntimeErrors==='function') ? getRuntimeErrors() : [];
    const storageKeys = Object.keys(localStorage).filter(k=>k.startsWith('as_')).sort();
    const escFn = (typeof esc==='function') ? esc : (v=>String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])));
    const catalog = window.AIshoprAdminCatalog;
    const catalogStatus = catalog && typeof catalog.status==='function' ? catalog.status() : {localCount:'—'};
    return `<div class="admin-section"><div class="admin-section-title">🧪 Diagnose & Stabilität</div>
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-val">${window.APP_VERSION||'0.9.x'}</div><div class="kpi-label">App-Version</div></div>
        <div class="kpi"><div class="kpi-val">${errors.length}</div><div class="kpi-label">Fehler im Log</div></div>
        <div class="kpi"><div class="kpi-val">${storageKeys.length}</div><div class="kpi-label">Storage Keys</div></div>
        <div class="kpi"><div class="kpi-val">${catalogStatus.localCount??'—'}</div><div class="kpi-label">Lokale Produkte</div></div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
        <button class="btn btn-primary" onclick="exportDiagnostics&&exportDiagnostics()">Diagnose exportieren</button>
        <button class="btn btn-ghost" onclick="clearRuntimeErrors&&clearRuntimeErrors()">Fehlerlog leeren</button>
        <button class="btn btn-ghost" onclick="migrateLocalData&&migrateLocalData();toast&&toast('Migration erneut ausgeführt');AIshoprDiagnosticsNav.openDiagnostics()">Daten reparieren</button>
      </div>
    </div>
    <div class="admin-section"><div class="admin-section-title">📦 Produktkatalog</div>
      <p style="font-size:12px;color:var(--ink-2);line-height:1.5;margin-bottom:12px">Lade Produktdaten aus <code>/data/products.json</code>, ohne LocalStorage manuell zu löschen.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="AIshoprAdminCatalog&&AIshoprAdminCatalog.reloadProductsFromJson('overwrite')">Katalog überschreiben</button>
        <button class="btn btn-ghost" onclick="AIshoprAdminCatalog&&AIshoprAdminCatalog.reloadProductsFromJson('merge')">Katalog ergänzen</button>
        <button class="btn btn-ghost" onclick="AIshoprAdminCatalog&&AIshoprAdminCatalog.validateProductsJson()">products.json prüfen</button>
        <button class="btn btn-ghost" onclick="AIshoprAdminCatalog&&AIshoprAdminCatalog.exportLocalProducts()">Lokale Produkte exportieren</button>
        <button class="btn btn-danger" onclick="AIshoprAdminCatalog&&AIshoprAdminCatalog.clearLocalProducts()">Lokale Produkte löschen</button>
      </div>
    </div>
    <div class="admin-section"><div class="admin-section-title">Letzte Fehler</div>
      ${errors.length?errors.slice().reverse().map(e=>`<div class="item" style="cursor:default;align-items:flex-start"><div class="item-body"><div class="item-title">${escFn(e.source)} · ${escFn(e.ts)}</div><div class="item-sub" style="white-space:pre-wrap">${escFn(e.name)}: ${escFn(e.message)}</div></div></div>`).join(''):'<p style="font-size:12px;color:var(--ink-3)">Keine protokollierten Fehler.</p>'}
    </div>`;
  }

  function setActiveNav(){
    document.querySelectorAll('.admin-nav-item').forEach(el=>el.classList.remove('active'));
    const diag=document.querySelector('[data-admin-tab="diagnostics"]');
    if(diag) diag.classList.add('active');
  }

  function openDiagnostics(){
    try{
      if(window.S) S.adminTab='diagnostics';
      const sbar=document.querySelector('.admin-sidebar');
      if(sbar) sbar.classList.remove('open');
      setActiveNav();

      const content=document.getElementById('adminContent') || document.querySelector('.admin-main');
      if(!content){
        if(typeof render==='function') render();
        setTimeout(openDiagnostics,60);
        return;
      }

      let html='';
      try{
        if(typeof adminDiagnostics==='function') html=adminDiagnostics();
      }catch(e){safeLog('admin-diagnostics-nav:adminDiagnostics', e);}
      if(!html || !String(html).trim()) html=fallbackDiagnostics();
      content.innerHTML=html;
      content.scrollTop=0;
      setTimeout(setActiveNav,50);
    }catch(err){safeLog('admin-diagnostics-nav:openDiagnostics', err);}
  }

  function ensureDiagnosticsNav(){
    try{
      const sidebar=document.querySelector('.admin-sidebar');
      if(!sidebar) return;
      let item=sidebar.querySelector('[data-admin-tab="diagnostics"]');
      if(!item){
        const logoutItem=[...sidebar.querySelectorAll('.admin-nav-item')].find(el => /Logout/i.test(el.textContent||''));
        item=document.createElement('div');
        item.className='admin-nav-item '+((window.S && S.adminTab==='diagnostics')?'active':'');
        item.dataset.adminTab='diagnostics';
        item.innerHTML=icon()+' Diagnose';
        if(logoutItem && logoutItem.parentNode) logoutItem.parentNode.insertBefore(item, logoutItem);
        else sidebar.appendChild(item);
      }
      item.onclick=function(ev){ev.preventDefault();ev.stopPropagation();openDiagnostics();return false;};
    }catch(err){safeLog('admin-diagnostics-nav:ensureDiagnosticsNav', err);}
  }

  function start(){
    ensureDiagnosticsNav();
    const app=document.getElementById('app') || document.body;
    const mo=new MutationObserver(ensureDiagnosticsNav);
    mo.observe(app,{childList:true,subtree:true});
    setInterval(ensureDiagnosticsNav,1000);
  }

  window.AIshoprDiagnosticsNav={version:VERSION,ensureDiagnosticsNav,openDiagnostics};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start);
  else start();
})();
