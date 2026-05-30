/* Mega-Fix 22 — Product card & image system
   Adds card layout modes without editing the legacy renderCard() directly.
   Modes: auto, lifestyle, packshot, deal. */
(function(){
  const VERSION='2.2.0';
  const MODES=['auto','lifestyle','packshot','deal'];

  function safeLog(source, err, extra){
    try{
      if(typeof logRuntimeError==='function') logRuntimeError(source, err, extra||{});
      else console.error('[AIshopr CardSystem]', source, err, extra||{});
    }catch(e){console.error('[AIshopr CardSystem diagnostic failed]', e);}
  }

  function getSettings(){
    try{return typeof LS!=='undefined'?LS.get('cardSystem',{mode:'auto',imageFit:'auto',showImageBadges:true}):{mode:'auto',imageFit:'auto',showImageBadges:true};}
    catch(e){return {mode:'auto',imageFit:'auto',showImageBadges:true};}
  }
  function saveSettings(next){
    try{if(typeof LS!=='undefined')LS.set('cardSystem',Object.assign(getSettings(),next||{}));}catch(e){}
  }

  function hasImage(p){return !!String((p&&p.image)||(p&&p.image_url)||'').trim();}
  function cardMode(product){
    const cfg=getSettings();
    const explicit=String(product&&product.card_mode||'').trim();
    if(MODES.includes(explicit)&&explicit!=='auto')return explicit;
    if(MODES.includes(cfg.mode)&&cfg.mode!=='auto')return cfg.mode;
    if(!hasImage(product))return 'lifestyle';
    if(String(product&&product.image_mode||'').trim()==='packshot')return 'packshot';
    if(String(product&&product.image_mode||'').trim()==='deal')return 'deal';
    const priceValue=Number(product&&product.price_value);
    if(Number.isFinite(priceValue)&&priceValue>0&&priceValue<25&&String(product&&product.price||'').match(/[0-9]/))return 'deal';
    if(String(product&&product.source||'').includes('image_demo'))return 'lifestyle';
    return 'lifestyle';
  }
  function imageFit(product,mode){
    const cfg=getSettings();
    const explicit=String(product&&product.image_fit||'').trim();
    if(['cover','contain'].includes(explicit))return explicit;
    if(['cover','contain'].includes(cfg.imageFit))return cfg.imageFit;
    return mode==='packshot'||mode==='deal'?'contain':'cover';
  }
  function escSafe(v){
    try{if(typeof esc==='function')return esc(v);}catch(e){}
    return String(v??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  }
  function merchant(product){return String(product&&product.merchant_name||product&&product.source||'').trim();}

  function enhanceCurrentCard(){
    try{
      const card=document.querySelector('.swipe-card');
      const p=(typeof S!=='undefined')?S.currentCard:null;
      if(!card||!p)return;
      const mode=cardMode(p);
      const fit=imageFit(p,mode);
      card.classList.remove('card-mode-lifestyle','card-mode-packshot','card-mode-deal','image-fit-cover','image-fit-contain','no-image');
      card.classList.add('card-mode-'+mode,'image-fit-'+fit);
      if(!hasImage(p))card.classList.add('no-image');
      card.dataset.cardMode=mode;
      card.dataset.imageFit=fit;

      const hero=card.querySelector('.card-hero');
      if(!hero)return;
      if(getSettings().showImageBadges!==false){
        if(!hero.querySelector('.card-image-badge')){
          hero.insertAdjacentHTML('beforeend',`<div class="card-image-badge">${mode==='packshot'?'Packshot':mode==='deal'?'Deal':'Lifestyle'}</div>`);
        }
        const m=merchant(p);
        if(m&&!hero.querySelector('.card-source-badge'))hero.insertAdjacentHTML('beforeend',`<div class="card-source-badge">${escSafe(m)}</div>`);
      }
      const img=hero.querySelector('img');
      if(img&&!img.__aishoprErrorBound){
        img.loading='lazy';
        img.decoding='async';
        img.__aishoprErrorBound=true;
        img.onerror=function(){
          try{
            hero.classList.add('image-load-failed');
            img.remove();
            if(!hero.querySelector('.grad'))hero.insertAdjacentHTML('afterbegin',`<div class="grad ${escSafe(p.grad||'grad-2')}"></div><div class="emoji">${escSafe(p.emoji||'📦')}</div><div class="image-error-note">Bild nicht geladen</div>`);
            if(typeof logRuntimeError==='function')logRuntimeError('card-image-error',new Error('Image failed'),{id:p.id,url:p.image||p.image_url});
          }catch(e){}
        };
      }
    }catch(err){safeLog('card-system:enhanceCurrentCard',err);}
  }

  function install(){
    try{
      if(typeof renderCard==='function'&&!renderCard.__cardSystemPatched){
        const original=renderCard;
        const patched=function(){
          const r=original();
          enhanceCurrentCard();
          return r;
        };
        patched.__cardSystemPatched=true;
        renderCard=patched;
      }
      window.AIshoprCardSystem={version:VERSION,getSettings,saveSettings,cardMode,imageFit,enhanceCurrentCard,modes:MODES.slice()};
      setTimeout(enhanceCurrentCard,100);
      return true;
    }catch(err){safeLog('card-system:install',err);return false;}
  }
  if(!install())setTimeout(install,100);
})();
