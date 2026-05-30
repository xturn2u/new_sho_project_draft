/* Mega-Fix 23 — Card UX Redesign renderer override */
(function(){
  const VERSION='2.3.7';

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
  function saveCfg(next){try{if(typeof LS!=='undefined')LS.set('cardRedesign',Object.assign(getCfg(),next||{}));}catch(e){} }
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
  function pulseValue(p){
    const base=Number(p.fit||75);
    let seed=0;
    String(p.id||p.title||'').split('').forEach(ch=>seed=(seed+ch.charCodeAt(0))%97);
    return Math.max(38,Math.min(99,Math.round(base*.58+seed*.42)));
  }
  function savesToday(p){
    const pulse=pulseValue(p);
    const base=Math.max(18,Math.round(pulse*1.7));
    return base+((String(p.id||'').length*7)%41);
  }
  function svgIcon(type){
    const attrs='viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
    if(type==='bag')return `<svg ${attrs}><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>`;
    if(type==='trust')return `<svg ${attrs}><path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z"/><path d="M9 12l2 2 4-5"/></svg>`;
    if(type==='fit')return `<svg ${attrs}><path d="M12 2l2.7 6.3 6.8.6-5.1 4.4 1.5 6.7-5.9-3.5L6.1 20l1.5-6.7-5.1-4.4 6.8-.6L12 2z"/></svg>`;
    if(type==='protect')return `<svg ${attrs}><path d="M12 3l7 4v5c0 4.4-3 7.4-7 9-4-1.6-7-4.6-7-9V7l7-4z"/></svg>`;
    if(type==='pulse')return `<svg ${attrs}><path d="M3 12h4l2-6 4 12 3-8 2 2h3"/></svg>`;
    return `<svg ${attrs}><path d="M12 5v14"/><path d="M5 12h14"/></svg>`;
  }
  function heroHtml(p,mode){
    const img=imageOf(p);
    const top=mode==='deal'?'Deal Pick':mode==='packshot'?'Top Pick':'Top Pick';
    const base=`<div class="ux-top-badge"><span class="ux-pill-star">★</span>${top}</div><div class="ux-swipes">${S.swipes||0} Swipes</div>`;
    if(img)return `${base}<img src="${escSafe(img)}" alt="${escSafe(p.title)}"><div class="ux-image-claim"><span class="ux-claim-check">✓</span>${claimText(p)}</div>`;
    return `${base}<div class="grad ${escSafe(p.grad||'grad-2')}"></div><div class="emoji">${escSafe(p.emoji||'📦')}</div><div class="ux-image-claim"><span class="ux-claim-check">✓</span>${claimText(p)}</div>`;
  }
  function renderPremiumCard(){
    const stage=document.getElementById('feedStage');if(!stage)return;
    stage.querySelectorAll('.swipe-card').forEach(c=>c.remove());
    stage.querySelectorAll('div[style]').forEach(c=>{if(!c.classList.contains('swipe-hint'))c.remove();});
    if(S.feedIdx>=S.feedQueue.length){stage.insertAdjacentHTML('beforeend','<div style="text-align:center;color:var(--ink-3);padding:40px">Alle Ideen gesehen! Wechsle den Filter. 🎯</div>');return;}
    const p=S.feedQueue[S.feedIdx];S.currentCard=p;recordImpression(p.id);
    const mode=cardMode(p);
    const ben=benefits(p);
    const pulse=pulseValue(p);
    const saves=savesToday(p);
    const card=document.createElement('div');
    card.className=`swipe-card ux-redesign ux-${mode}`;
    card.innerHTML=`
      <div class="swipe-card-overlay yellow" id="overlayLeft"><div class="ov-icon"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div></div>
      <div class="swipe-card-overlay green" id="overlayRight"><div class="ov-icon"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg></div></div>
      <div class="swipe-card-overlay save" id="overlaySave"><div class="ov-icon"><svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg></div></div>
      <div class="swipe-card-overlay red" id="overlayReject"><div class="ov-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="8" y1="8" x2="16" y2="16"/><line x1="16" y1="8" x2="8" y2="16"/></svg></div></div>
      <div class="card-hero">${heroHtml(p,mode)}${p.sponsored?'<div class="card-ribbon">Gesponsert</div>':''}<span class="swipe-counter card-counter" id="swipeCounter">${S.swipes||0} Swipes</span></div>
      <div class="card-body">
        <div class="card-hook">${escSafe(p.hook)}</div>
        <div class="card-title">${escSafe(p.title)}</div>
        <div class="ux-benefits"><div class="ux-benefit"><span class="ux-benefit-icon">${svgIcon('bag')}</span><span>${escSafe(ben[0])}</span></div><div class="ux-benefit"><span class="ux-benefit-icon">${svgIcon('protect')}</span><span>${escSafe(ben[1])}</span></div><div class="ux-benefit"><span class="ux-benefit-icon">${svgIcon('fit')}</span><span>${escSafe(ben[2])}</span></div></div>
        <div class="card-problem">${escSafe(p.problem)}</div>
        <div class="card-tags"><span class="tag mint" data-label="Preis">${escSafe(p.price)}</span><span class="tag save-tag" data-label="Saves heute">${saves}</span><span class="tag pulse-tag" data-label="AIshopr Pulse">${pulse}</span></div>
      </div>
      <div class="ux-cta" onclick="openSheet&&openSheet('product')"><span class="ux-bag-icon">${svgIcon('bag')}</span><span>Jetzt ansehen</span><span class="ux-cta-arrow">›</span></div>
      <div class="ux-trust"><span class="ux-trust-icon">${svgIcon('trust')}</span><span>Vertrauenswürdig. Fair. Transparent.</span></div>
      <div class="card-foot ux-kpi-foot"><div class="fit ux-match"><div class="fit-ring" style="--p:${p.fit}"><span>${p.fit}</span></div><div class="fit-label">Fit-Score</div></div><div class="price">${escSafe(p.price)}</div></div>`;
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