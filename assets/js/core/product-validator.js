/* Fix 16 — Product schema and import validator
   Validates AIshopr product data before import/activation.
   Pure browser JS, no external dependencies. */
(function(){
  const VERSION='1.6.0';
  const REQUIRED=['id','title','hook','cat','price','fit','problem','solution','status'];
  const VALID_STATUS=new Set(['active','inactive','draft']);

  function safeLog(source, err, extra){
    try{
      if(typeof logRuntimeError==='function') logRuntimeError(source, err, extra||{});
      else console.error('[AIshopr ProductValidator]', source, err, extra||{});
    }catch(e){console.error('[AIshopr ProductValidator diagnostic failed]', e);}
  }

  function asArray(v){return Array.isArray(v)?v:[];}
  function str(v){return String(v??'').trim();}
  function isObj(v){return v && typeof v==='object' && !Array.isArray(v);}
  function isUrl(v){
    const s=str(v);
    if(!s)return true;
    try{const u=new URL(s);return ['http:','https:'].includes(u.protocol);}catch(e){return false;}
  }
  function slugOk(v){return /^[a-zA-Z0-9_-]+$/.test(str(v));}

  function getCategories(){
    try{
      if(typeof cats==='function')return cats().map(c=>c.id).filter(Boolean);
      if(typeof CATS!=='undefined')return asArray(CATS).map(c=>c.id).filter(Boolean);
      if(typeof LS!=='undefined')return asArray(LS.get('categories',[])).map(c=>c.id).filter(Boolean);
    }catch(e){safeLog('validator.getCategories',e);}
    return [];
  }

  function add(out,type,code,msg,idx,id,field){out[type].push({code,msg,index:idx,id:id||'',field:field||''});}

  function validateProduct(p,idx,ctx){
    const errors=[]; const warnings=[];
    const out={errors,warnings};
    const id=str(p&&p.id);
    if(!isObj(p)){add(out,'errors','not_object','Produkt ist kein Objekt',idx,'','');return out;}

    REQUIRED.forEach(f=>{if(str(p[f])==='')add(out,'errors','required_missing',`Pflichtfeld fehlt: ${f}`,idx,id,f);});

    if(id && !slugOk(id))add(out,'errors','bad_id','ID darf nur Buchstaben, Zahlen, Unterstrich und Bindestrich enthalten',idx,id,'id');
    if(str(p.title).length>255)add(out,'errors','title_too_long','Titel ist länger als 255 Zeichen',idx,id,'title');
    if(str(p.hook).length>255)add(out,'errors','hook_too_long','Hook ist länger als 255 Zeichen',idx,id,'hook');

    const fit=Number(p.fit);
    if(Number.isNaN(fit)||fit<0||fit>100)add(out,'errors','fit_range','Fit muss zwischen 0 und 100 liegen',idx,id,'fit');

    if(str(p.status) && !VALID_STATUS.has(str(p.status)))add(out,'errors','bad_status','Status muss active, inactive oder draft sein',idx,id,'status');

    if(p.price_value!==undefined && p.price_value!=='' && (Number.isNaN(Number(p.price_value))||Number(p.price_value)<0)){
      add(out,'errors','bad_price_value','price_value muss eine positive Zahl sein',idx,id,'price_value');
    }

    ['image_url','affiliate','affiliate_url'].forEach(f=>{if(!isUrl(p[f]))add(out,'errors','bad_url',`Ungültige URL in ${f}`,idx,id,f);});

    ['pros','cons','notfor','watch'].forEach(f=>{if(p[f]!==undefined && !Array.isArray(p[f]))add(out,'warnings','array_expected',`${f} sollte ein Array sein`,idx,id,f);});

    const cats=ctx.categories||[];
    if(str(p.cat) && cats.length && !cats.includes(str(p.cat)))add(out,'errors','unknown_category',`Unbekannte Kategorie: ${str(p.cat)}`,idx,id,'cat');

    const aff=str(p.affiliate_url||p.affiliate);
    if(p.sponsored===true && !aff)add(out,'warnings','sponsored_without_affiliate','Sponsored=true, aber kein Affiliate-/Ziel-Link gesetzt',idx,id,'sponsored');
    if(aff && !str(p.merchant_name))add(out,'warnings','merchant_missing','Affiliate-Link vorhanden, aber merchant_name fehlt',idx,id,'merchant_name');

    if(str(p.title) && str(p.hook) && str(p.title)===str(p.hook))add(out,'warnings','title_equals_hook','Titel und Hook sind identisch',idx,id,'hook');

    return out;
  }

  function validateProducts(products,opts){
    const list=asArray(products);
    const ctx=Object.assign({categories:getCategories()},opts||{});
    const errors=[]; const warnings=[]; const ids=new Map(); const titles=new Map();
    list.forEach((p,idx)=>{
      const id=str(p&&p.id);
      const title=str(p&&p.title).toLowerCase();
      if(id){
        if(ids.has(id))errors.push({code:'duplicate_id',msg:`Doppelte ID: ${id}`,index:idx,id,field:'id',firstIndex:ids.get(id)});
        else ids.set(id,idx);
      }
      if(title){
        if(titles.has(title))warnings.push({code:'duplicate_title',msg:`Doppelter Titel: ${p.title}`,index:idx,id,field:'title',firstIndex:titles.get(title)});
        else titles.set(title,idx);
      }
      const r=validateProduct(p,idx,ctx);
      errors.push(...r.errors); warnings.push(...r.warnings);
    });
    return {ok:errors.length===0,count:list.length,errors,warnings,categories:ctx.categories,version:VERSION,ts:new Date().toISOString()};
  }

  async function fetchProductsJson(){
    const res=await fetch('/new_sho_project_draft/data/products.json?v='+Date.now(),{cache:'no-store'});
    if(!res.ok)throw new Error('products.json HTTP '+res.status);
    const data=await res.json();
    if(!Array.isArray(data))throw new Error('products.json ist kein Array');
    return data;
  }

  async function validateExternalProducts(){
    const products=await fetchProductsJson();
    return validateProducts(products);
  }

  function saveReport(report,key){
    try{if(typeof LS!=='undefined')LS.set(key||'productValidationReport',report);}catch(e){safeLog('validator.saveReport',e);}
    return report;
  }

  window.AIshoprProductValidator={
    version:VERSION,
    required:REQUIRED.slice(),
    validateProduct,
    validateProducts,
    validateExternalProducts,
    fetchProductsJson,
    saveReport
  };
})();
