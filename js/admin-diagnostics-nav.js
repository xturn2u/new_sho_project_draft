/* AIshopr Fix 8.1 — make diagnostics visible in admin navigation */
(function(){
  const VERSION='0.9.6';

  function safeLog(source, err, extra){
    try{
      if(typeof logRuntimeError==='function') logRuntimeError(source, err, extra||{});
      else console.error('[AIshopr diagnostics nav]', source, err, extra||{});
    }catch(e){console.error('[AIshopr diagnostics nav diagnostic failed]', e);}
  }

  function icon(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
  }

  function openDiagnostics(){
    try{
      if(!window.S) return;
      S.adminTab='diagnostics';
      if(typeof render==='function') render();
    }catch(err){safeLog('admin-diagnostics-nav:openDiagnostics', err);}
  }

  function ensureDiagnosticsNav(){
    try{
      const sidebar=document.querySelector('.admin-sidebar');
      if(!sidebar) return;
      if(sidebar.querySelector('[data-admin-tab="diagnostics"]')) return;

      const logoutItem=[...sidebar.querySelectorAll('.admin-nav-item')].find(el => /Logout/i.test(el.textContent||''));
      const item=document.createElement('div');
      item.className='admin-nav-item '+((window.S && S.adminTab==='diagnostics')?'active':'');
      item.dataset.adminTab='diagnostics';
      item.innerHTML=icon()+' Diagnose';
      item.addEventListener('click', function(){
        const sbar=document.querySelector('.admin-sidebar');
        if(sbar) sbar.classList.remove('open');
        openDiagnostics();
      });

      if(logoutItem && logoutItem.parentNode) logoutItem.parentNode.insertBefore(item, logoutItem);
      else sidebar.appendChild(item);
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
