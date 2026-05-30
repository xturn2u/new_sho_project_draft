/* Mega-Fix 23 — Admin control for premium card redesign */
(function(){
  const VERSION='2.3.0';
  function safeLog(source, err, extra){
    try{if(typeof logRuntimeError==='function')logRuntimeError(source,err,extra||{});else console.error('[AIshopr AdminCardRedesign]',source,err,extra||{});}catch(e){}
  }
  function cfg(){try{return window.AIshoprCardRedesign?AIshoprCardRedesign.getCfg():{enabled:true};}catch(e){return{enabled:true};}}
  function save(next){
    try{if(window.AIshoprCardRedesign)AIshoprCardRedesign.saveCfg(next);if(typeof toast==='function')toast('Card UX gespeichert');if(typeof S!=='undefined'){S.feedQueue=[];S.feedIdx=0;}if(typeof render==='function')render();}catch(err){safeLog('admin-card-redesign:save',err);}
  }
  function toggle(){save({enabled:cfg().enabled===false});}
  function test(){
    try{
      if(window.AIshoprCardRedesign)AIshoprCardRedesign.saveCfg({enabled:true});
      if(window.AIshoprImageDemo&&typeof AIshoprImageDemo.importAndShow==='function')AIshoprImageDemo.importAndShow();
      else {if(typeof S!=='undefined')S.view='feed';if(typeof render==='function')render();}
    }catch(err){safeLog('admin-card-redesign:test',err);}
  }
  function html(){
    const c=cfg();
    const on=c.enabled!==false;
    return `<div class="admin-section"><div class="admin-section-title">✨ Mega-Fix 23: Card UX Redesign</div>
      <p style="font-size:13px;color:var(--ink-2);line-height:1.55;margin-bottom:14px">Neue Premium-Karte nach dem Mockup: großer Hero-Bildbereich, klare Nutzen-Hierarchie, Benefit-Module, starke Preis-/Fit-Chips, großer CTA und Trust-Zeile.</p>
      <div class="kpi-grid"><div class="kpi"><div class="kpi-val">${on?'Aktiv':'Aus'}</div><div class="kpi-label">Premium-Karte</div></div><div class="kpi"><div class="kpi-val">UX</div><div class="kpi-label">Mockup-Stil</div></div><div class="kpi"><div class="kpi-val">CTA</div><div class="kpi-label">Kaufimpuls</div></div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button class="btn ${on?'btn-primary':'btn-ghost'}" onclick="AIshoprAdminCardRedesign.toggle()">Premium-Karte ${on?'deaktivieren':'aktivieren'}</button><button class="btn btn-primary" onclick="AIshoprAdminCardRedesign.test()">Mit Bild-Demo testen</button><button class="btn btn-ghost" onclick="showView('feed')">Feed öffnen</button></div>
      <p style="font-size:11px;color:var(--ink-3);line-height:1.45;margin-top:10px"><b>Bewertung:</b> Diese Karte ist bewusst conversion-fokussierter. Prüfe auf iPhone: Bildwirkung, CTA, Textlänge und ob die Karte sofort hochwertiger wirkt.</p>
    </div>`;
  }
  function patchAdminPage(){
    try{
      if(typeof adminPage!=='function'||adminPage.__cardRedesignAdminPatched)return false;
      const original=adminPage;
      const patched=function(tab){const out=original(tab);if(tab==='catalog'||tab==='readiness')return String(out)+html();return out;};
      patched.__cardRedesignAdminPatched=true;adminPage=patched;return true;
    }catch(err){safeLog('admin-card-redesign:patchAdminPage',err);return false;}
  }
  window.AIshoprAdminCardRedesign={version:VERSION,cfg,save,toggle,test,html,patchAdminPage};
  if(!patchAdminPage())setTimeout(patchAdminPage,250);
})();
