/* Fix 20 — Image demo catalog import tools
   Lets the admin test whether swipe cards work with real product-like images. */
(function(){
  const VERSION='2.0.0';
  const DEMO_URL='/new_sho_project_draft/data/products.image.demo.json';

  function safeLog(source, err, extra){
    try{
      if(typeof logRuntimeError==='function') logRuntimeError(source, err, extra||{});
      else console.error('[AIshopr ImageDemo]', source, err, extra||{});
    }catch(e){console.error('[AIshopr ImageDemo diagnostic failed]', e);}
  }

  async function fetchDemo(){
    const res=await fetch(DEMO_URL+'?v='+VERSION+'&t='+Date.now(),{cache:'no-store'});
    if(!res.ok)throw new Error('products.image.demo.json HTTP '+res.status);
    const data=await res.json();
    if(!Array.isArray(data))throw new Error('Bild-Demo-Katalog ist kein Array');
    return data;
  }

  function normalizeDemo(data){
    const list=data.filter(p=>p&&p.title).map(p=>{
      const n=typeof normalizeProduct==='function'?normalizeProduct(p):Object.assign({},p);
      n.source='image_demo';
      n.status='active';
      n.sponsored=false;
      n.image=n.image || n.image_url || '';
      return n;
    });
    if(!list.length)throw new Error('Keine gültigen Bild-Demo-Produkte gefunden');
    return list;
  }

  function resetFeed(){try{if(typeof S!=='undefined'){S.feedQueue=[];S.feedIdx=0;}}catch(e){}}

  async function importAndShow(){
    try{
      if(typeof toast==='function')toast('Bild-Demo wird geladen…');
      if(typeof createSnapshot==='function')createSnapshot('before_image_demo_import');
      const demo=normalizeDemo(await fetchDemo());
      const current=typeof ideas==='function'?ideas():[];
      const next=current.filter(p=>p.source!=='image_demo').concat(demo);
      if(typeof LS!=='undefined'){
        LS.set('ideas',next);
        LS.set('imageDemoLastImport',{mode:'import_show',count:demo.length,total:next.length,ts:new Date().toISOString(),version:VERSION});
      }
      resetFeed();
      try{if(typeof S!=='undefined'){S.feedMode='foryou';S.view='feed';}}catch(e){}
      if(typeof toast==='function')toast(`${demo.length} Bild-Demo-Produkte aktiviert`);
      if(typeof render==='function')render();
    }catch(err){
      safeLog('image-demo:importAndShow',err);
      if(typeof toast==='function')toast('Bild-Demo konnte nicht geladen werden');
    }
  }

  function removeDemo(){
    try{
      const current=typeof ideas==='function'?ideas():[];
      const next=current.filter(p=>p.source!=='image_demo');
      if(typeof LS!=='undefined')LS.set('ideas',next);
      resetFeed();
      if(typeof toast==='function')toast('Bild-Demo entfernt');
      if(typeof render==='function')render();
    }catch(err){safeLog('image-demo:removeDemo',err);}
  }

  function status(){
    let products=[];let last={};
    try{products=typeof ideas==='function'?ideas():[];}catch(e){}
    try{if(typeof LS!=='undefined')last=LS.get('imageDemoLastImport',{});}catch(e){}
    const demo=products.filter(p=>p.source==='image_demo');
    const withImage=demo.filter(p=>p.image||p.image_url).length;
    return {version:VERSION,count:demo.length,withImage,last};
  }

  function panelHtml(){
    const s=status();
    const last=s.last&&s.last.ts?`${s.last.count||0} importiert · ${new Date(s.last.ts).toLocaleString('de-DE')}`:'Noch kein Import';
    return `<div class="admin-section"><div class="admin-section-title">🖼️ Bildkarten-Test</div>
      <p style="font-size:12px;color:var(--ink-2);line-height:1.5;margin-bottom:12px">Testet, ob die Swipe-Karten mit echten Produkt-/Lifestylebildern hochwertig genug wirken. Die Bilder sind neutrale externe Demo-Bilder, keine Amazon-Produktbilder.</p>
      <div class="kpi-grid"><div class="kpi"><div class="kpi-val">${s.count}</div><div class="kpi-label">Bild-Demo-Produkte</div></div><div class="kpi"><div class="kpi-val">${s.withImage}</div><div class="kpi-label">Mit Bild</div></div></div>
      <div style="font-size:12px;color:var(--ink-3);line-height:1.5;margin:12px 0"><div><strong>Quelle:</strong> <code>/data/products.image.demo.json</code></div><div><strong>Letzter Import:</strong> ${last}</div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-primary" onclick="AIshoprImageDemo.importAndShow()">Bild-Demo importieren & im Feed testen</button><button class="btn btn-danger" onclick="AIshoprImageDemo.removeDemo()">Bild-Demo entfernen</button></div>
      <p style="font-size:11px;color:var(--ink-3);line-height:1.45;margin-top:10px"><b>Entscheidungstest:</b> Wenn diese Karten nicht hochwertig wirken, müssen wir das Kartenlayout umbauen, bevor echte Affiliate-Daten Sinn machen.</p>
    </div>`;
  }

  function patchAdminPage(){
    try{
      if(typeof adminPage!=='function'||adminPage.__imageDemoPatched)return false;
      const original=adminPage;
      const patched=function(tab){
        const html=original(tab);
        if(tab==='catalog')return String(html)+panelHtml();
        return html;
      };
      patched.__imageDemoPatched=true;
      adminPage=patched;
      return true;
    }catch(err){safeLog('image-demo:patchAdminPage',err);return false;}
  }

  window.AIshoprImageDemo={version:VERSION,fetchDemo,importAndShow,removeDemo,status,panelHtml,patchAdminPage};
  if(!patchAdminPage())setTimeout(patchAdminPage,180);
})();
