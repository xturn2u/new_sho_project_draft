/* AIshopr Fix 11 — Native admin route consolidation
   Replaces DOM-patching admin menu scripts with one admin routing override.
   Keeps the existing app.js stable while adding first-class admin tabs. */
(function(){
  const VERSION='1.1.0';

  function safeLog(source, err, extra){
    try{
      if(typeof logRuntimeError==='function') logRuntimeError(source, err, extra||{});
      else console.error('[AIshopr admin native routes]', source, err, extra||{});
    }catch(e){console.error('[AIshopr admin native routes diagnostic failed]', e);}
  }

  function escSafe(v){
    if(typeof esc==='function') return esc(v);
    return String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  }

  function svg(name){
    const icons={
      dashboard:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
      products:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/></svg>',
      categories:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
      affiliate:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',
      users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
      ai:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1010 10H12V2z"/><path d="M12 12L2.1 12.1"/><path d="M12 12l7.1-7.1"/></svg>',
      footer:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>',
      backup:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
      info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
      algorithm:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19"/></svg>',
      settings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
      diagnostics:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
    };
    return icons[name]||icons.info;
  }

  const nativeTabs=[
    {id:'dashboard',label:'Übersicht',icon:svg('dashboard')},
    {id:'products',label:'Produkte',icon:svg('products')},
    {id:'catalog',label:'Produktkatalog',icon:svg('products')},
    {id:'categories',label:'Kategorien',icon:svg('categories')},
    {id:'affiliate',label:'Affiliate',icon:svg('affiliate')},
    {id:'users',label:'Nutzer',icon:svg('users')},
    {id:'ai',label:'KI & OpenAI',icon:svg('ai')},
    {id:'footer',label:'Footer',icon:svg('footer')},
    {id:'backup',label:'Backup & Import',icon:svg('backup')},
    {id:'diagnostics',label:'Diagnose',icon:svg('diagnostics')},
    {id:'info',label:'Info & Business',icon:svg('info')},
    {id:'algorithm',label:'Algorithmus',icon:svg('algorithm')},
    {id:'settings',label:'Einstellungen',icon:svg('settings')}
  ];

  function productRows(products){
    const visible=products.slice(0,25);
    if(!visible.length)return '<p style="font-size:12px;color:var(--ink-3)">Keine lokalen Produkte vorhanden.</p>';
    return `<table class="tbl"><thead><tr><th>Titel</th><th>Kategorie</th><th>Preis</th><th>Status</th></tr></thead><tbody>${visible.map(p=>`<tr><td>${escSafe(p.title)}</td><td>${escSafe(p.cat||'')}</td><td>${escSafe(p.price||'')}</td><td>${p.sponsored?'Sponsored':'Normal'}</td></tr>`).join('')}</tbody></table>${products.length>25?`<p style="font-size:11px;color:var(--ink-3);margin-top:8px">Zeige 25 von ${products.length} Produkten.</p>`:''}`;
  }

  function adminCatalogNative(){
    const products=(typeof ideas==='function')?ideas():[];
    const sponsored=products.filter(p=>p.sponsored).length;
    const withAff=products.filter(p=>p.affiliate||p.affiliate_url).length;
    const cats=[...new Set(products.map(p=>p.cat).filter(Boolean))];
    const validation=(typeof LS!=='undefined')?LS.get('catalogValidation',{}):{};
    const lastImport=(typeof LS!=='undefined')?LS.get('catalogLastImport',{}):{};
    const validationText=validation&&validation.ts?(validation.ok?`OK · ${validation.count||0} Produkte · ${new Date(validation.ts).toLocaleString('de-DE')}`:`Fehler · ${validation.error||'unbekannt'}`):'Noch nicht geprüft';
    const lastImportText=lastImport&&lastImport.ts?`${lastImport.mode||'-'} · ${lastImport.count||0} importiert · Gesamt ${lastImport.total||0} · ${new Date(lastImport.ts).toLocaleString('de-DE')}`:'Noch kein manueller Import';
    return `<div class="admin-section"><div class="admin-section-title">📦 Produktkatalog</div>
      <p style="font-size:13px;color:var(--ink-2);line-height:1.55;margin-bottom:14px">Zentraler Bereich für den externen Produktkatalog aus <code>/data/products.json</code>.</p>
      <div class="kpi-grid"><div class="kpi"><div class="kpi-val">${products.length}</div><div class="kpi-label">Produkte lokal</div></div><div class="kpi"><div class="kpi-val">${cats.length}</div><div class="kpi-label">Kategorien aktiv</div></div><div class="kpi"><div class="kpi-val">${withAff}</div><div class="kpi-label">Affiliate-Produkte</div></div><div class="kpi"><div class="kpi-val">${sponsored}</div><div class="kpi-label">Sponsored</div></div></div></div>
      <div class="admin-section"><div class="admin-section-title">JSON-Katalog verwalten</div><div style="background:var(--bg-card);border:1px solid var(--border);border-radius:14px;padding:14px;font-size:12px;color:var(--ink-2);line-height:1.5;margin-bottom:12px"><div><strong>Quelle:</strong> <code>/data/products.json</code></div><div><strong>Letzte Prüfung:</strong> ${escSafe(validationText)}</div><div><strong>Letzter Import:</strong> ${escSafe(lastImportText)}</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-primary" onclick="AIshoprAdminCatalog&&AIshoprAdminCatalog.reloadProductsFromJson('overwrite')">Katalog überschreiben</button><button class="btn btn-ghost" onclick="AIshoprAdminCatalog&&AIshoprAdminCatalog.reloadProductsFromJson('merge')">Katalog ergänzen</button><button class="btn btn-ghost" onclick="AIshoprAdminCatalog&&AIshoprAdminCatalog.validateProductsJson()">products.json prüfen</button><button class="btn btn-ghost" onclick="AIshoprAdminCatalog&&AIshoprAdminCatalog.exportLocalProducts()">Lokale Produkte exportieren</button><button class="btn btn-danger" onclick="AIshoprAdminCatalog&&AIshoprAdminCatalog.clearLocalProducts()">Lokale Produkte löschen</button></div><p style="font-size:11px;color:var(--ink-3);line-height:1.45;margin-top:10px"><b>Regel:</b> Erst prüfen, dann überschreiben.</p></div>
      <div class="admin-section"><div class="admin-section-title">Produktvorschau</div>${productRows(products)}</div>`;
  }

  function adminDiagnosticsNative(){
    const errors=(typeof getRuntimeErrors==='function')?getRuntimeErrors():[];
    const keys=Object.keys(localStorage).filter(k=>k.startsWith('as_')).sort();
    const size=keys.reduce((sum,k)=>sum+(localStorage.getItem(k)||'').length,0);
    const ds=window.AIshoprDataSource;
    return `<div class="admin-section"><div class="admin-section-title">🧪 Diagnose & Stabilität</div>
      <div class="kpi-grid"><div class="kpi"><div class="kpi-val">${typeof APP_VERSION!=='undefined'?APP_VERSION:'?'}</div><div class="kpi-label">App-Version</div></div><div class="kpi"><div class="kpi-val">${typeof DATA_SCHEMA_VERSION!=='undefined'?DATA_SCHEMA_VERSION:'?'}</div><div class="kpi-label">Schema</div></div><div class="kpi"><div class="kpi-val">${errors.length}</div><div class="kpi-label">Fehler im Log</div></div><div class="kpi"><div class="kpi-val">${Math.round(size/1024)} KB</div><div class="kpi-label">LocalStorage</div></div><div class="kpi"><div class="kpi-val">${ds?ds.mode():'json'}</div><div class="kpi-label">DataSource</div></div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn btn-primary" onclick="exportDiagnostics&&exportDiagnostics()">Diagnose exportieren</button><button class="btn btn-ghost" onclick="clearRuntimeErrors&&clearRuntimeErrors()">Fehlerlog leeren</button><button class="btn btn-ghost" onclick="migrateLocalData&&migrateLocalData();toast&&toast('Migration erneut ausgeführt');render&&render()">Daten reparieren</button></div></div>
      <div class="admin-section"><div class="admin-section-title">Letzte Fehler</div>${errors.length?errors.slice().reverse().map(e=>`<div class="item" style="cursor:default;align-items:flex-start"><div class="item-body"><div class="item-title">${escSafe(e.source)} · ${escSafe(e.ts)}</div><div class="item-sub" style="white-space:pre-wrap">${escSafe(e.name)}: ${escSafe(e.message)}</div></div></div>`).join(''):'<p style="font-size:12px;color:var(--ink-3)">Keine protokollierten Fehler.</p>'}</div>
      <div class="admin-section"><div class="admin-section-title">LocalStorage Keys</div><div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:12px;font-size:12px;line-height:1.6;max-height:220px;overflow:auto">${keys.map(escSafe).join('<br>')}</div></div>`;
  }

  function install(){
    try{
      const originalAdminPage=typeof adminPage==='function'?adminPage:null;
      const originalRenderAdmin=typeof renderAdmin==='function'?renderAdmin:null;
      if(!originalAdminPage||!originalRenderAdmin)return false;
      adminPage=function(tab){
        if(tab==='catalog')return adminCatalogNative();
        if(tab==='diagnostics')return adminDiagnosticsNative();
        return originalAdminPage(tab);
      };
      renderAdmin=function(){
        if(typeof requireAdmin==='function'&&!requireAdmin())return renderAdminLogin();
        if(typeof S!=='undefined'&&!S.adminLogged)return renderAdminLogin();
        const current=(typeof S!=='undefined'?S.adminTab:'dashboard')||'dashboard';
        return `<div class="admin-layout"><div class="admin-header-mobile">${getLogoHtml(true)}<button class="btn btn-ghost btn-sm" onclick="document.querySelector('.admin-sidebar').classList.toggle('open')">☰</button></div><div class="admin-sidebar"><div class="admin-sidebar-header">${getLogoHtml(true)}</div>${nativeTabs.map(t=>`<div class="admin-nav-item ${current===t.id?'active':''}" onclick="S.adminTab='${t.id}';render();document.querySelector('.admin-sidebar').classList.remove('open')">${t.icon} ${t.label}</div>`).join('')}<div style="flex:1"></div><div class="admin-nav-item" onclick="adminLogout()" style="color:var(--danger)">${svg('diagnostics')} Logout</div></div><div class="admin-main" id="adminContent">${adminPage(current)}</div></div>`;
      };
      window.AIshoprAdminNativeRoutes={version:VERSION,tabs:nativeTabs.map(t=>t.id),installed:true};
      return true;
    }catch(err){safeLog('admin-native-routes:install',err);return false;}
  }

  if(!install())setTimeout(install,50);
})();
