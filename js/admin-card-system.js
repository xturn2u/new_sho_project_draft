/* Mega-Fix 22 — Admin panel for product card system */
(function(){
  const VERSION='2.2.1';

  function safeLog(source, err, extra){
    try{
      if(typeof logRuntimeError==='function') logRuntimeError(source, err, extra||{});
      else console.error('[AIshopr AdminCardSystem]', source, err, extra||{});
    }catch(e){console.error('[AIshopr AdminCardSystem diagnostic failed]', e);}
  }

  function cfg(){return window.AIshoprCardSystem?AIshoprCardSystem.getSettings():{mode:'auto',imageFit:'auto',showImageBadges:true};}
  function save(next){
    try{
      if(window.AIshoprCardSystem)AIshoprCardSystem.saveSettings(next);
      if(typeof toast==='function')toast('Kartenmodus gespeichert');
      if(typeof S!=='undefined'){S.feedQueue=[];S.feedIdx=0;}
      if(typeof render==='function')render();
    }catch(err){safeLog('admin-card-system:save',err);}
  }
  function setMode(mode){save({mode});}
  function setFit(imageFit){save({imageFit});}
  function toggleBadges(){save({showImageBadges:!cfg().showImageBadges});}
  function goImageDemo(){
    try{
      if(window.AIshoprImageDemo&&typeof AIshoprImageDemo.importAndShow==='function')AIshoprImageDemo.importAndShow();
      else {if(typeof S!=='undefined')S.view='feed'; if(typeof render==='function')render();}
    }catch(err){safeLog('admin-card-system:goImageDemo',err);}
  }
  function html(){
    const c=cfg();
    const mode=c.mode||'auto';
    const fit=c.imageFit||'auto';
    const badge=c.showImageBadges!==false;
    const mini=(id,title,sub)=>`<div class="card-layout-mini ${id} ${mode===id?'active':''}" onclick="AIshoprAdminCardSystem.setMode('${id}')"><div class="card-layout-mini-img"></div><div class="card-layout-mini-title">${title}</div><div class="card-layout-mini-sub">${sub}</div></div>`;
    return `<div class="admin-section"><div class="admin-section-title">🃏 Produktkarten & Bildsystem</div>
      <p style="font-size:13px;color:var(--ink-2);line-height:1.55;margin-bottom:14px">Kartenmodus für echte Produktbilder. Dieser Bereich bleibt bewusst nur im Produktkatalog, damit die Betriebszentrale schlank bleibt.</p>
      <div class="kpi-grid"><div class="kpi"><div class="kpi-val">${mode}</div><div class="kpi-label">Kartenmodus</div></div><div class="kpi"><div class="kpi-val">${fit}</div><div class="kpi-label">Bild-Fit</div></div><div class="kpi"><div class="kpi-val">${badge?'An':'Aus'}</div><div class="kpi-label">Bild-Badges</div></div></div>
      <h4 style="font-size:13px;margin:16px 0 8px">Layoutmodus</h4>
      <div class="card-layout-preview-grid">
        ${mini('auto','Auto','entscheidet je Produkt')}
        ${mini('lifestyle','Lifestyle','großes atmosphärisches Bild')}
        ${mini('packshot','Packshot','Produkt auf heller Fläche')}
        ${mini('deal','Deal','Preis und Kaufimpuls stärker')}
      </div>
      <h4 style="font-size:13px;margin:16px 0 8px">Bilddarstellung</h4>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn ${fit==='auto'?'btn-primary':'btn-ghost'}" onclick="AIshoprAdminCardSystem.setFit('auto')">Auto</button><button class="btn ${fit==='cover'?'btn-primary':'btn-ghost'}" onclick="AIshoprAdminCardSystem.setFit('cover')">Cover</button><button class="btn ${fit==='contain'?'btn-primary':'btn-ghost'}" onclick="AIshoprAdminCardSystem.setFit('contain')">Contain</button><button class="btn ${badge?'btn-primary':'btn-ghost'}" onclick="AIshoprAdminCardSystem.toggleBadges()">Badges ${badge?'an':'aus'}</button></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button class="btn btn-primary" onclick="AIshoprAdminCardSystem.goImageDemo()">Mit Bild-Demo im Feed testen</button><button class="btn btn-ghost" onclick="showView('feed')">Nur Feed öffnen</button></div>
    </div>`;
  }

  function patchAdminPage(){
    try{
      if(typeof adminPage!=='function'||adminPage.__cardSystemPatched)return false;
      const original=adminPage;
      const patched=function(tab){
        const out=original(tab);
        if(tab==='catalog')return String(out)+html();
        return out;
      };
      patched.__cardSystemPatched=true;
      adminPage=patched;
      return true;
    }catch(err){safeLog('admin-card-system:patchAdminPage',err);return false;}
  }

  window.AIshoprAdminCardSystem={version:VERSION,cfg,save,setMode,setFit,toggleBadges,goImageDemo,html,patchAdminPage};
  if(!patchAdminPage())setTimeout(patchAdminPage,200);
})();
