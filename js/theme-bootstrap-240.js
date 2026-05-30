/* Fix 24 — Darkmode Restore Theme Bootstrap
   Central theme source: light | dark | system. Defaults to system. */
(function(){
  const KEY='aishopr_theme';
  const LEGACY_KEYS=['theme','aishoprTheme','aiShoprTheme'];

  function safeGet(key){try{return localStorage.getItem(key);}catch(e){return null;}}
  function safeSet(key,value){try{localStorage.setItem(key,value);}catch(e){}}
  function safeRemove(key){try{localStorage.removeItem(key);}catch(e){}}
  function systemTheme(){
    return window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
  }
  function normalize(value){
    value=String(value||'').toLowerCase().trim();
    if(value==='dark'||value==='theme-dark')return'dark';
    if(value==='light'||value==='theme-light')return'light';
    if(value==='system'||value==='auto')return'system';
    return null;
  }
  function storedTheme(){
    let v=normalize(safeGet(KEY));
    if(v)return v;
    for(const k of LEGACY_KEYS){
      v=normalize(safeGet(k));
      if(v){safeSet(KEY,v);return v;}
    }
    return 'system';
  }
  function resolvedTheme(){
    const stored=storedTheme();
    return stored==='system'?systemTheme():stored;
  }
  function apply(theme){
    const resolved=theme==='system'?systemTheme():normalize(theme)||systemTheme();
    const root=document.documentElement;
    root.setAttribute('data-theme',resolved);
    root.setAttribute('data-theme-mode',normalize(theme)||storedTheme());
    root.classList.toggle('theme-dark',resolved==='dark');
    root.classList.toggle('theme-light',resolved==='light');
    if(document.body){
      document.body.setAttribute('data-theme',resolved);
      document.body.classList.toggle('theme-dark',resolved==='dark');
      document.body.classList.toggle('theme-light',resolved==='light');
    }
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content',resolved==='dark'?'#0f1117':'#FFF5F0');
    try{window.dispatchEvent(new CustomEvent('aishopr-theme-change',{detail:{theme:resolved,mode:normalize(theme)||storedTheme()}}));}catch(e){}
  }
  function setTheme(mode){
    mode=normalize(mode)||'system';
    safeSet(KEY,mode);
    apply(mode);
  }
  function toggle(){
    const next=resolvedTheme()==='dark'?'light':'dark';
    setTheme(next);
  }
  function useSystem(){
    safeSet(KEY,'system');
    apply('system');
  }
  function init(){
    apply(storedTheme());
    if(window.matchMedia){
      const media=window.matchMedia('(prefers-color-scheme: dark)');
      const listener=function(){if(storedTheme()==='system')apply('system');};
      if(media.addEventListener)media.addEventListener('change',listener);
      else if(media.addListener)media.addListener(listener);
    }
  }
  window.AIshoprTheme={
    current:resolvedTheme,
    mode:storedTheme,
    set:setTheme,
    toggle,
    useSystem,
    apply:()=>apply(storedTheme())
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
