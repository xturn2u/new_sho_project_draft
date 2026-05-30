/* Mega-Fix 23 — Card UX Redesign renderer override */
(function(){
  const VERSION='2.3.0';

  function safeLog(source, err, extra){
    try{
      if(typeof logRuntimeError==='function') logRuntimeError(source, err, extra||{});
      else console.error('[AIshopr CardRedesign]', source, err, extra||{});
    }catch(e){console.error('[AIshopr CardRedesign diagnostic failed]', e);}
  }
  function escSafe(v){
    try{if(typeof esc==='function')return esc(v);}catch(e){}
    return String(v??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  }
  function getCfg(){
    try{return typeof LS!=='undefined'?LS.get('cardRedesign',{enabled:true}):{enabled:true};}catch(e){return{enabled:true};}
  }
  function saveCfg(next){try{if(typeof LS!=='undefined')LS.set('cardRedesign',Object.assign(getCfg(),next||{}));}catch(e){}}
  function imageOf(p){return String(p.image||p.image_url||'').trim();}
  function cardMode(p){
    try{if(window.AIshoprCardSystem)return AIshoprCardSystem.cardMode(p);}catch(e){}
    return imageOf(p)?'lifestyle':'packshot';
  }
  function claimText(p){
    const cat=(typeof catName==='function')?catName(p.cat):'Ordnung';
    if(String(p.cat||'').includes('ordnung'))return 'Ordnung, die <b>bleibt.</b>';
    if(String(p.cat||'').includes('tech'))return 'Technik, die <b>hilft.</b>';
    if(String(p.cat||'').includes('reise'))return 'Reisen, aber <b>sortiert.</b>';
    return escSafe(cat)+', die <b>passt.</b>';
  }
  function benefits(p){
    const arr=[];
    const pros=Array.isArray(p.pros)?p.pros:[];
    arr.push(pros[0]||'Passt zu deinem Alltag');
    arr.push(pros[1]||'Schnell verstanden');
    arr.push(pros[2]||'Mehr Nutzen, weniger Stress');
    return arr.slice(0,3);
  }
  function heroHtml(p,mode){
    const img=imageOf(p);
    const top=mode==='deal'?'Deal Pick':mode==='packshot'?'Top Pick':'Top Pick';
    const base=`<div class="ux-top-badge">★ ${top}</div><div class="ux-swipes">${S.swipes||0} Swipes</div>`;
    if(img)return `${base}<img src="${escSafe(img)}" alt="${escSafe(p.title)}"><div class="ux-image-claim">✓ ${claimText(p)}</div>`;
    return `${base}<div class="grad ${escSafe(p.grad||'grad-2')}"></div><div class="emoji">${escSafe(p.emoji||'📦')}</div><div class="ux-image-claim">✓ ${claimText(p)}</div>`;
  }
  function renderPremiumCard(){
    const stage=document.getElementById('feedStage');if(!stage)return;
    stage.querySelectorAll('.swipe-card').forEach(c=>c.remove());
    stage.querySelectorAll('div[style]').forEach(c=>{if(!c.classList.contains('swipe-hint'))c.remove();});
    if(S.feedIdx>=S.feedQueue.length){stage.insertAdjacentHTML('beforeend','<div style="text-align:center;color:var(--ink-3);padding:40px">Alle Ideen gesehen! Wechsle den Filter. 🎯</div>');return;}
    const p=S.feedQueue[S.feedIdx];S.currentCard=p;recordImpression(p.id);
    const mode=cardMode(p);
    const ben=benefits(p);
    const card=document.createElement('div');
    card.className=`swipe-card ux-redesign ux-${mode}`;
    card.innerHTML=`
      <div class="swipe-card-overlay yellow" id="overlayLeft"><div class="ov-icon"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div></div>
      <div class="swipe-card-overlay green" id="overlayRight"><div class="ov-icon"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg></div></div>
      <div class="swipe-card-overlay save" id="overlaySave"><div class="ov-icon"><svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg></div></div>
      <div class="swipe-card-overlay red" id="overlayReject"><div class="ov-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="8" y1="8" x2="16" y2="16"/><line x1="16" y1="8" x2="8" y2="16"/></svg></div></div>
      <div class="card-hero">${heroHtml(p,mode)}${p.sponsored?'<div class="card-ribbon">Gesponsert</div>':''}<span class="swipe-counter card-counter" id="swipeCounter">${S.swipes||0} Swipes</span></div>
      <div class="ux-dots"><span></span><span></span><span></span><span></span><span></span></div>
      <div class="card-body">
        <div class="card-hook">${escSafe(p.hook)}</div>
        <div class="card-title">${escSafe(p.title)}</div>
        <div class="ux-benefits"><div class="ux-benefit"><span class="ux-benefit-icon">▣</span><span>${escSafe(ben[0])}</span></div><div class="ux-benefit"><span class="ux-benefit-icon">◇</span><span>${escSafe(ben[1])}</span></div><div class="ux-benefit"><span class="ux-benefit-icon">✦</span><span>${escSafe(ben[2])}</span></div></div>
        <div class="card-problem">${escSafe(p.problem)}</div>
        <div class="card-tags"><span class="tag mint" data-label="Preis">${escSafe(p.price)}</span><span class="tag" data-label="Kategorie">${catIcon(p.cat)} ${catName(p.cat)}</span><span class="tag sun" data-label="Fit-Score">${p.fit}%</span></div>
      </div>
      <div class="ux-cta" onclick="openSheet&&openSheet('product')"><span>Jetzt ansehen</span><span class="ux-cta-arrow">›</span></div>
      <div class="ux-trust">♢ Vertrauenswürdig. Fair. Transparent.</div>
      <div class="card-foot"><div class="fit"><div class="fit-ring" style="--p:${p.fit}"><span>${p.fit}</span></div><div class="fit-label">Fit-Score</div></div><div class="price">${escSafe(p.price)}</div></div>`;
    stage.appendChild(card);updateActionStates();enableDrag(card);
    const img=card.querySelector('.card-hero img');
    if(img){img.loading='lazy';img.decoding='async';img.onerror=function(){try{img.remove();card.querySelector('.card-hero').insertAdjacentHTML('beforeend','<div class="image-error-note">Bild nicht geladen</div>');}catch(e){}};}
  }
  function install(){
    try{
      if(typeof renderCard!=='function'||renderCard.__uxRedesignPatched)return false;
      const original=renderCard;
      const patched=function(){
        const cfg=getCfg();
        if(cfg.enabled!==false)return renderPremiumCard();
        return original();
      };
      patched.__uxRedesignPatched=true;
      renderCard=patched;
      window.AIshoprCardRedesign={version:VERSION,getCfg,saveCfg,renderPremiumCard,enabled:()=>getCfg().enabled!==false};
      return true;
    }catch(err){safeLog('card-redesign:install',err);return false;}
  }
  if(!install())setTimeout(install,120);
})();
