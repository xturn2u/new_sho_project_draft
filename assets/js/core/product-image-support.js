/* Fix 20 — Product image support
   The legacy card renderer uses product.image.
   Modern catalogs use image_url. This bridge maps image_url -> image without rewriting the renderer. */
(function(){
  const VERSION='2.0.0';

  function safeLog(source, err, extra){
    try{
      if(typeof logRuntimeError==='function') logRuntimeError(source, err, extra||{});
      else console.error('[AIshopr ProductImageSupport]', source, err, extra||{});
    }catch(e){console.error('[AIshopr ProductImageSupport diagnostic failed]', e);}
  }

  function cleanUrl(url){
    const raw=String(url||'').trim();
    if(!raw)return '';
    try{
      const u=new URL(raw, location.href);
      if(!['http:','https:','data:'].includes(u.protocol))return '';
      return u.href;
    }catch(e){return '';}
  }

  function withImage(product){
    if(!product || typeof product!=='object')return product;
    const img=cleanUrl(product.image || product.image_url || product.photo_url || product.img || '');
    if(img){
      product.image=img;
      product.image_url=product.image_url || img;
    }
    return product;
  }

  function install(){
    try{
      if(typeof normalizeProduct==='function' && !normalizeProduct.__imageSupportPatched){
        const original=normalizeProduct;
        const patched=function(product){
          const p=original(product);
          return withImage(p);
        };
        patched.__imageSupportPatched=true;
        normalizeProduct=patched;
      }

      if(typeof ideas==='function' && !ideas.__imageSupportPatched){
        const originalIdeas=ideas;
        const patchedIdeas=function(){
          return originalIdeas().map(p=>withImage(p));
        };
        patchedIdeas.__imageSupportPatched=true;
        ideas=patchedIdeas;
      }

      window.AIshoprProductImageSupport={version:VERSION,withImage,installed:true};
      return true;
    }catch(err){safeLog('product-image-support:install',err);return false;}
  }

  if(!install())setTimeout(install,80);
})();
