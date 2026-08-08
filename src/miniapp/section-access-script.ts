export const SECTION_ACCESS_SCRIPT = `
(function(){
  var tg=window.Telegram&&window.Telegram.WebApp;
  var user=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{};
  var expiryTimer=0;
  var last='';
  var cache=null;
  var inFlight=null;
  var lastFetchAt=0;
  var CACHE_MS=Number.POSITIVE_INFINITY;
  var liveSocket=null;
  var liveReconnectTimer=0;
  function userId(){return String(user.id||localStorage.getItem('ownerId')||'').trim()}
  function clearExpiry(){if(expiryTimer){clearTimeout(expiryTimer);expiryTimer=0}}
  function remove(){clearExpiry();var el=document.getElementById('vexaAccessLock');if(el)el.remove();document.documentElement.classList.remove('vexa-access-locked')}
  function render(lock){
    var existing=document.getElementById('vexaAccessLock');if(existing)existing.remove();
    clearExpiry();
    document.documentElement.classList.add('vexa-access-locked');
    var el=document.createElement('main');el.id='vexaAccessLock';el.className='vexa-access-lock-screen';
    el.innerHTML='<section class="vexa-access-lock-card" aria-label="Mini app update"><p class="vexa-access-lock-title"><span>Updating</span><span class="vexa-access-lock-dots" aria-hidden="true"><i></i><i></i><i></i></span></p><div class="vexa-access-lock-bar" aria-hidden="true"><span></span></div></section>';
    document.body.appendChild(el);
    var fill=el.querySelector('.vexa-access-lock-bar span');
    var offset=Number(lock.serverNow||0)-Date.now()/1000,from=Number(lock.lockedFrom)||0,until=Number(lock.lockedUntil)||0,total=Math.max(1,until-from);
    var now=Date.now()/1000+offset,progress=Math.min(100,Math.max(0,(now-from)/total*100)),remaining=Math.max(0,until-now);
    if(fill){fill.style.transition='none';fill.style.width=progress+'%';requestAnimationFrame(function(){if(!fill||!fill.isConnected)return;fill.style.transition='width '+remaining+'s linear';fill.style.width='100%'})}
    if(remaining<=0){location.reload();return}
    expiryTimer=setTimeout(function(){expiryTimer=0;location.reload()},Math.ceil(remaining*1000)+50);
  }
  function applyLivePayload(payload){
    if(!payload||!payload.locks)return;
    cache={locks:payload.locks};lastFetchAt=Date.now();apply(cache);
  }
  function connectLive(){
    if(liveSocket||!userId()||!window.WebSocket)return;
    var initData=String((tg&&tg.initData)||'');if(!initData)return;
    var proto=location.protocol==='https:'?'wss:':'ws:';
    var endpoint=proto+'//'+location.host+'/app/api/section-access/live?initData='+encodeURIComponent(initData);
    try{liveSocket=new WebSocket(endpoint);liveSocket.onmessage=function(event){try{var payload=JSON.parse(event.data);if(payload&&payload.type==='section-access')applyLivePayload(payload)}catch(e){}};liveSocket.onclose=function(){liveSocket=null;clearTimeout(liveReconnectTimer);if(!document.hidden)liveReconnectTimer=setTimeout(connectLive,3000)};liveSocket.onerror=function(){try{liveSocket&&liveSocket.close()}catch(e){}}}catch(e){liveSocket=null}
  }
  function apply(j){
    var active=document.querySelector('.view.active');var section=active&&active.id||'home';
    var lock=j&&j.locks&&((j.locks.app)||j.locks[section]);
    var signature=lock?lock.sectionId+':'+lock.lockedUntil:'';
    if(signature===last)return;
    last=signature;if(lock)render(lock);else remove();
  }
  function load(force){
    var id=userId();if(!id){remove();return Promise.resolve(null)}
    if(document.hidden&&!force)return Promise.resolve(cache);
    var now=Date.now();
    if(!force&&cache&&now-lastFetchAt<CACHE_MS){apply(cache);return Promise.resolve(cache)}
    if(inFlight)return inFlight;
    inFlight=fetch('/app/api/section-access?userId='+encodeURIComponent(id),{cache:'no-store'})
      .then(function(r){return r.ok?r.json():null})
      .then(function(j){if(j){cache=j;lastFetchAt=Date.now();apply(j)}return j})
      .catch(function(){if(cache)apply(cache);return cache})
      .finally(function(){inFlight=null});
    return inFlight;
  }
  window.VexaSectionLocks={reload:function(){return load(false)},refresh:function(){return load(true)}};
  window.addEventListener('vexa:section-mounted',function(){queueMicrotask(function(){load(false)})});
  document.addEventListener('visibilitychange',function(){if(!document.hidden)load(false)});
  window.addEventListener('focus',function(){load(false)});
  window.addEventListener('online',function(){load(false)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){load(false);connectLive()});else{load(false);connectLive()}
})();
`;
