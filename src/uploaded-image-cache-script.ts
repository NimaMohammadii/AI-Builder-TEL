export const UPLOADED_IMAGE_CACHE_SCRIPT = `
(function(){
  var preloaded={};
  function installAccessCodeKeyboardCss(){
    if(document.getElementById('accessCodeKeyboardCss'))return;
    var style=document.createElement('style');
    style.id='accessCodeKeyboardCss';
    style.textContent='body.section-code-keyboard-open{overflow:hidden!important}body.section-code-keyboard-open .app,body.section-code-keyboard-open .content,body.section-code-keyboard-open .view.active{overflow:visible!important}.section-code-view{touch-action:manipulation}body.section-code-keyboard-open .section-code-view{position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important;z-index:110!important;display:flex!important;align-items:flex-end!important;justify-content:center!important;padding:18px 24px calc(max(var(--section-keyboard-inset),0px) + 76px + env(safe-area-inset-bottom))!important;background:#000!important;overflow:visible!important}body.section-code-keyboard-open .section-code-view .code-card{width:min(100%,320px)!important;max-width:320px!important;margin:0 auto!important;transform:translate3d(0,0,0) scale(.98)!important;animation:accessCodeCardUp .28s cubic-bezier(.2,.8,.2,1) both}body.section-code-keyboard-open .section-code-view .section-lock-image{width:72px!important;height:72px!important}body.section-code-keyboard-open .section-code-input{height:44px!important;font-size:16px!important;-webkit-user-select:text!important;user-select:text!important}body.section-code-keyboard-open .section-code-submit{height:44px!important}body.section-code-keyboard-open .tabs{opacity:0!important;transform:translateY(90px)!important;pointer-events:none!important}body.section-code-keyboard-open .section-keyboard-dismiss{position:fixed!important;right:18px!important;bottom:calc(max(var(--section-keyboard-inset),0px) + 12px + env(safe-area-inset-bottom))!important;opacity:1!important;transform:translate3d(0,0,0) scale(1)!important;pointer-events:auto!important;z-index:140!important}@keyframes accessCodeCardUp{from{opacity:.2;transform:translateY(34px) scale(.96)}to{opacity:1;transform:translateY(0) scale(.98)}}';
    document.head.appendChild(style);
  }
  function preload(url){
    if(!url||preloaded[url])return;
    preloaded[url]=true;
    var img=new Image();
    img.decoding='async';
    img.src=url;
  }
  function applyCreditIcon(url){
    if(!url)return;
    preload(url);
    document.querySelectorAll('img[src^="/app/api/credit-icon"],img[src^="/app/api/uploaded-image/credit-icon"]').forEach(function(img){
      if(img.getAttribute('src')!==url)img.setAttribute('src',url);
    });
    try{window.dispatchEvent(new CustomEvent('vexa-credit-icon-sync',{detail:{url:url}}))}catch(e){}
  }
  function load(){
    fetch('/app/api/uploaded-images',{cache:'no-store'}).then(function(r){return r.json()}).then(function(data){
      if(data&&data.creditIconUrl)applyCreditIcon(data.creditIconUrl);
      (data&&data.preload||[]).forEach(preload);
    }).catch(function(){});
  }
  installAccessCodeKeyboardCss();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
  setInterval(load,20000);
})();
`;
