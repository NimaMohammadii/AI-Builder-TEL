export const SECTION_ACCESS_SCRIPT = `
(function(){
  var tg=window.Telegram&&window.Telegram.WebApp;
  var user=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{};
  var expiryTimer=0;
  var last='';
  var cache={locks:{}};
  var liveSocket=null;
  var liveReconnectTimer=0;
  var reconnectAttempt=0;
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
    if(remaining<=0){expireLocks();return}
    expiryTimer=setTimeout(function(){expiryTimer=0;expireLocks()},Math.ceil(remaining*1000)+50);
  }
  function expireLocks(){var now=Date.now()/1000,source=cache&&cache.locks||{},next={},changed=false;Object.keys(source).forEach(function(id){var lock=source[id];if(lock&&Number(lock.lockedUntil)>now)next[id]=lock;else changed=true});if(changed){cache={locks:next};last='__expired__'}apply(cache)}
  function applyLivePayload(payload){
    if(!payload||!payload.locks)return;
    cache={locks:payload.locks};apply(cache);
  }
  function reconnectDelay(){return Math.min(30000,1000*Math.pow(2,Math.min(reconnectAttempt++,5)))}
  function connectLive(){
    if(liveSocket||!userId()||!window.WebSocket)return;
    var initData=String((tg&&tg.initData)||'');if(!initData)return;
    var proto=location.protocol==='https:'?'wss:':'ws:';
    var endpoint=proto+'//'+location.host+'/app/api/section-access/live?initData='+encodeURIComponent(initData);
    try{liveSocket=new WebSocket(endpoint);liveSocket.onopen=function(){reconnectAttempt=0};liveSocket.onmessage=function(event){try{var payload=JSON.parse(event.data);if(payload&&payload.type==='section-access')applyLivePayload(payload)}catch(e){}};liveSocket.onclose=function(){liveSocket=null;clearTimeout(liveReconnectTimer);if(!document.hidden)liveReconnectTimer=setTimeout(connectLive,reconnectDelay())};liveSocket.onerror=function(){try{liveSocket&&liveSocket.close()}catch(e){}}}catch(e){liveSocket=null;clearTimeout(liveReconnectTimer);liveReconnectTimer=setTimeout(connectLive,reconnectDelay())}
  }
  function apply(j){
    var active=document.querySelector('.view.active');var section=active&&active.id||'home';
    var lock=j&&j.locks&&((j.locks.app)||j.locks[section]);
    var signature=lock?lock.sectionId+':'+lock.lockedUntil:'';
    if(signature===last)return;
    last=signature;if(lock)render(lock);else remove();
  }
  function reapply(){expireLocks();return Promise.resolve(cache)}
  window.VexaSectionLocks={reload:reapply,refresh:function(){if(liveSocket)try{liveSocket.close()}catch(e){}else connectLive();return Promise.resolve(cache)}};
  window.addEventListener('vexa:section-mounted',function(){queueMicrotask(reapply)});
  document.addEventListener('visibilitychange',function(){if(document.hidden){clearTimeout(liveReconnectTimer)}else if(!liveSocket)connectLive()});
  window.addEventListener('online',function(){if(!liveSocket)connectLive()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',connectLive);else connectLive()
})();
`;
