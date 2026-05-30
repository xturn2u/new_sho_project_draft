/* Mega Fix 21 — Production readiness admin dashboard
   Bundles overview for product sources, roadmap, backend readiness and next actions. */
(function(){
  const VERSION='2.1.0';
  const SOURCES_URL='/new_sho_project_draft/data/product-sources.default.json';
  const ROADMAP_URL='/new_sho_project_draft/data/roadmap.production.json';

  function safeLog(source, err, extra){
    try{
      if(typeof logRuntimeError==='function') logRuntimeError(source, err, extra||{});
      else console.error('[AIshopr ProductionReadiness]', source, err, extra||{});
    }catch(e){console.error('[AIshopr ProductionReadiness diagnostic failed]', e);}
  }

  async function fetchJson(url){
    const res=await fetch(url+'?v='+VERSION+'&t='+Date.now(),{cache:'no-store'});
    if(!res.ok)throw new Error(url+' HTTP '+res.status);
    return await res.json();
  }

  async function refresh(){
    try{
      const [sources,roadmap]=await Promise.all([fetchJson(SOURCES_URL),fetchJson(ROADMAP_URL)]);
      if(typeof LS!=='undefined'){
        LS.set('productSources',sources);
        LS.set('productionRoadmap',roadmap);
        LS.set('productionReadinessLastRefresh',{ts:new Date().toISOString(),version:VERSION});
      }
      if(typeof toast==='function')toast('Betriebsdaten aktualisiert');
      if(typeof render==='function')render();
      return {sources,roadmap};
    }catch(err){
      safeLog('production-readiness:refresh',err);
      if(typeof toast==='function')toast('Betriebsdaten konnten nicht geladen werden');
      return null;
    }
  }

  function getSources(){
    try{return (typeof LS!=='undefined'&&LS.get('productSources',null))||[];}catch(e){return[];}
  }
  function getRoadmap(){
    try{return (typeof LS!=='undefined'&&LS.get('productionRoadmap',null))||null;}catch(e){return null;}
  }
  function escSafe(v){
    try{if(typeof esc==='function')return esc(v);}catch(e){}
    return String(v??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  }
  function statusPill(status){
    const map={done:'✅',in_progress:'🟡',planned:'⚪',active:'✅',paused:'⏸️',disabled:'⛔',draft:'📝'};
    return `${map[status]||'•'} ${escSafe(status||'—')}`;
  }

  function html(){
    const sources=getSources();
    const roadmap=getRoadmap();
    const activeSources=sources.filter(s=>s.status==='active').length;
    const backendSources=sources.filter(s=>s.requires_backend).length;
    const secretSources=sources.filter(s=>s.requires_secret).length;
    const roadmapGroups=(roadmap&&roadmap.groups)||[];
    const done=roadmapGroups.flatMap(g=>g.items||[]).filter(i=>i.status==='done').length;
    const total=roadmapGroups.flatMap(g=>g.items||[]).length;

    return `<div class="admin-section"><div class="admin-section-title">🚀 Betriebszentrale</div>
      <p style="font-size:13px;color:var(--ink-2);line-height:1.55;margin-bottom:14px">Mega-Fix 21 bündelt die Vorbereitung für echten Betrieb: Produktquellen, Backend-Fähigkeit, Roadmap und nächste harte Prioritäten.</p>
      <div class="kpi-grid"><div class="kpi"><div class="kpi-val">${sources.length}</div><div class="kpi-label">Produktquellen</div></div><div class="kpi"><div class="kpi-val">${activeSources}</div><div class="kpi-label">Aktiv/Vorhanden</div></div><div class="kpi"><div class="kpi-val">${backendSources}</div><div class="kpi-label">Backend nötig</div></div><div class="kpi"><div class="kpi-val">${done}/${total||0}</div><div class="kpi-label">Roadmap erledigt</div></div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn btn-primary" onclick="AIshoprProductionReadiness.refresh()">Betriebsdaten aktualisieren</button><button class="btn btn-ghost" onclick="showView('admin');S.adminTab='catalog';render()">Zum Produktkatalog</button><button class="btn btn-ghost" onclick="showView('admin');S.adminTab='diagnostics';render()">Zur Diagnose</button></div>
    </div>

    <div class="admin-section"><div class="admin-section-title">🔌 Produktquellen</div>
      <table class="tbl"><thead><tr><th>Quelle</th><th>Typ</th><th>Status</th><th>Backend</th></tr></thead><tbody>${sources.map(s=>`<tr><td><b>${escSafe(s.name)}</b><br><span style="font-size:11px;color:var(--ink-3)">${escSafe(s.notes||'')}</span></td><td>${escSafe(s.provider)} / ${escSafe(s.mode)}</td><td>${statusPill(s.status)}</td><td>${s.requires_backend?'Ja':'Nein'}${s.requires_secret?' · Secret':''}</td></tr>`).join('')}</tbody></table>
      ${!sources.length?'<p style="font-size:12px;color:var(--ink-3)">Noch keine Quellen geladen. Bitte „Betriebsdaten aktualisieren“ klicken.</p>':''}
    </div>

    <div class="admin-section"><div class="admin-section-title">🧭 Roadmap</div>
      ${roadmapGroups.map(g=>`<div class="item" style="cursor:default;align-items:flex-start"><div class="item-body"><div class="item-title">${statusPill(g.status)} · ${escSafe(g.title)}</div><div class="item-sub" style="white-space:normal;margin-top:8px">${(g.items||[]).map(i=>`${statusPill(i.status)} ${escSafe(i.title)}`).join('<br>')}</div></div></div>`).join('')}
      ${!roadmapGroups.length?'<p style="font-size:12px;color:var(--ink-3)">Noch keine Roadmap geladen.</p>':''}
    </div>

    <div class="admin-section"><div class="admin-section-title">⚠️ Harte Betriebsregeln</div>
      <div style="font-size:13px;color:var(--ink-2);line-height:1.6;background:var(--bg-card);border:1px solid var(--border);border-radius:14px;padding:14px">
        <b>1.</b> Keine API-Secrets im Frontend oder LocalStorage.<br>
        <b>2.</b> Produktbilder brauchen Bildmodus: Packshot, Lifestyle oder Deal.<br>
        <b>3.</b> Jeder Import braucht Vorschau, Validierung und Rollback.<br>
        <b>4.</b> Affiliate-Klicks müssen serverseitig trackbar werden.<br>
        <b>5.</b> Vor echter Vermarktung: Impressum, Datenschutz, Affiliate-Hinweis, Consent.
      </div>
    </div>`;
  }

  function patchAdminPage(){
    try{
      if(typeof adminPage!=='function'||adminPage.__productionReadinessPatched)return false;
      const original=adminPage;
      const patched=function(tab){
        if(tab==='readiness')return html();
        return original(tab);
      };
      patched.__productionReadinessPatched=true;
      adminPage=patched;
      return true;
    }catch(err){safeLog('production-readiness:patchAdminPage',err);return false;}
  }

  function patchNav(){
    try{
      if(typeof renderAdmin!=='function'||renderAdmin.__readinessNavPatched)return false;
      const original=renderAdmin;
      const patched=function(){
        let out=original();
        if(String(out).includes("S.adminTab='readiness'"))return out;
        const nav=`<div class="admin-nav-item ${typeof S!=='undefined'&&S.adminTab==='readiness'?'active':''}" onclick="S.adminTab='readiness';render();document.querySelector('.admin-sidebar').classList.remove('open')">🚀 Betriebszentrale</div>`;
        out=String(out).replace('<div style="flex:1"></div>',nav+'<div style="flex:1"></div>');
        return out;
      };
      patched.__readinessNavPatched=true;
      renderAdmin=patched;
      return true;
    }catch(err){safeLog('production-readiness:patchNav',err);return false;}
  }

  function install(){
    const a=patchAdminPage();
    const b=patchNav();
    window.AIshoprProductionReadiness={version:VERSION,refresh,html,installed:a&&b};
    if(!getSources().length||!getRoadmap())refresh();
    return a&&b;
  }

  if(!install())setTimeout(install,200);
})();
