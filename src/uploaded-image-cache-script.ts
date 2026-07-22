export const UPLOADED_IMAGE_CACHE_SCRIPT = `
(function(){
  var KEY_PREFIX='vexaUploadedImages:v1:';
  var META_KEY_PREFIX='vexaUploadedImagesUpdatedAt:v1:';
  var TTL=900000;
  var preloaded={};
  var inFlight={};
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
  }
  function applyTonIcon(url){
    if(!url)return;
    preload(url);
    document.querySelectorAll('.top-balance-pill .ton-mini-icon img,img[data-ton-icon]').forEach(function(img){
      if(img.getAttribute('src')!==url)img.setAttribute('src',url);
    });
  }
  function applyPlinkoBall(url){
    if(!url)return;
    preload(url);
    try{window.dispatchEvent(new CustomEvent('vexa-credit-icon-sync',{detail:{url:url,source:'plinko-ball'}}))}catch(e){}
  }
  function applyMinesImages(data){
    if(!data)return;
    if(data.minesSafeUrl)preload(data.minesSafeUrl);
    if(data.minesBombUrl)preload(data.minesBombUrl);
    if(data.minesSafeUrl||data.minesBombUrl){
      try{window.dispatchEvent(new CustomEvent('vexa-mines-images-sync',{detail:{safeUrl:data.minesSafeUrl||'',bombUrl:data.minesBombUrl||''}}))}catch(e){}
    }
  }
  function applyRpsImages(data){
    if(!data)return;
    var urls=[data.rpsYouRockUrl,data.rpsYouPaperUrl,data.rpsYouScissorsUrl,data.rpsBotRockUrl,data.rpsBotPaperUrl,data.rpsBotScissorsUrl].filter(Boolean);
    urls.forEach(preload);
    if(urls.length){
      try{window.dispatchEvent(new CustomEvent('vexa-rps-images-sync',{detail:{rpsYouRockUrl:data.rpsYouRockUrl||'',rpsYouPaperUrl:data.rpsYouPaperUrl||'',rpsYouScissorsUrl:data.rpsYouScissorsUrl||'',rpsBotRockUrl:data.rpsBotRockUrl||'',rpsBotPaperUrl:data.rpsBotPaperUrl||'',rpsBotScissorsUrl:data.rpsBotScissorsUrl||''}}))}catch(e){}
    }
  }
  function cacheKey(context){return KEY_PREFIX+(context||'home')}
  function metaKey(context){return META_KEY_PREFIX+(context||'home')}
  function read(context){try{return JSON.parse(localStorage.getItem(cacheKey(context))||'null')}catch(e){return null}}
  function write(context,data){try{localStorage.setItem(cacheKey(context),JSON.stringify(data||{}));localStorage.setItem(metaKey(context),String(Date.now()))}catch(e){}}
  function apply(data,withPreload){
    if(!data)return;
    if(data.creditIconUrl)applyCreditIcon(data.creditIconUrl);
    if(data.tonIconUrl)applyTonIcon(data.tonIconUrl);
    if(data.plinkoBallUrl)applyPlinkoBall(data.plinkoBallUrl);
    applyMinesImages(data);
    applyRpsImages(data);
    if(withPreload)(data.preload||[]).slice(0,24).forEach(preload);
  }
  function currentContext(){
    if(document.querySelector('.view.active#rps'))return 'rps';
    if(document.querySelector('.view.active#mines'))return 'mines';
    if(document.querySelector('.view.active#plinko'))return 'plinko';
    if(document.querySelector('.view.active#playzone'))return 'playzone';
    return 'home';
  }
  function needsImages(context){
    if(context&&context!=='home')return true;
    if(document.querySelector('.view.active#home'))return true;
    if(document.querySelector('img[src^="/app/api/credit-icon"],img[src^="/app/api/uploaded-image/credit-icon"],img[data-ton-icon]'))return true;
    return false;
  }
  function load(force,context){
    context=context||currentContext();
    var cached=read(context);
    if(cached)apply(cached,false);
    var last=Number(localStorage.getItem(metaKey(context))||0);
    if(!force&&cached&&last&&Date.now()-last<TTL)return Promise.resolve(cached);
    if(!force&&!needsImages(context))return Promise.resolve(cached);
    if(inFlight[context])return inFlight[context];
    inFlight[context]=fetch('/app/api/uploaded-images?context='+encodeURIComponent(context),{cache:'default'}).then(function(r){return r.json()}).then(function(data){write(context,data);apply(data,true);return data}).catch(function(){return cached}).finally(function(){delete inFlight[context]});
    return inFlight[context];
  }
  window.VexaUploadedImages={reload:function(context){return load(true,context)},load:function(context){return load(false,context)},read:read};
  installAccessCodeKeyboardCss();
  apply(read(currentContext()),false);
  document.addEventListener('click',function(e){var b=e.target&&e.target.closest&&e.target.closest('[data-view="playzone"],[data-view="market"],[data-game-view]');if(b)setTimeout(function(){load(false)},120)},true);
})();
`;
