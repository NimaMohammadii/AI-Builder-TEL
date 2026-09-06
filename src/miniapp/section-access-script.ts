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
  var predictOpsState=null;
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
  function activePredictMarket(){
    var root=document.getElementById('predictzone');if(!root)return'';
    var button=root.querySelector('[data-vexa-predict-market].active');
    var market=String(button&&button.getAttribute('data-vexa-predict-market')||'bitcoin').toLowerCase();
    return market==='bitcoin'||market==='gold'||market==='oil'?market:'';
  }
  function predictOpsBlockReason(){
    var state=predictOpsState||window.VexaPredictOpsState;if(!state)return'';
    var market=activePredictMarket();if(!market)return'';
    var item=state.markets&&state.markets[market];
    var custom=String(state.maintenanceMessage||'').trim();
    if(state.emergencyPaused)return custom||'Predictions are temporarily unavailable. Please try again shortly.';
    if(item&&item.manualPaused)return custom||(market==='bitcoin'?'Bitcoin':market==='gold'?'Gold':'Oil')+' predictions are temporarily paused.';
    if(item&&item.circuitOpen)return custom||String(item.circuitReason||'Live price feed is temporarily unavailable. New predictions are paused.');
    return'';
  }
  function removePredictOpsNotice(){var notice=document.getElementById('vexaPredictOpsNotice');if(notice)notice.remove()}
  function renderPredictOps(){
    var root=document.getElementById('predictzone');if(!root){removePredictOpsNotice();return}
    var reason=predictOpsBlockReason();
    if(!reason){removePredictOpsNotice();return}
    var card=root.querySelector('[data-predict-card]');if(!card)return;
    var notice=document.getElementById('vexaPredictOpsNotice');
    if(!notice){notice=document.createElement('div');notice.id='vexaPredictOpsNotice';notice.setAttribute('role','status');notice.style.cssText='position:absolute;left:12px;right:12px;bottom:9px;z-index:30;min-height:38px;padding:8px 12px;box-sizing:border-box;border-radius:18px;border:1px solid rgba(179,19,50,.28);background:rgba(12,3,6,.94);display:flex;align-items:center;justify-content:center;text-align:center;color:#fff;font:800 11px/1.25 ui-rounded,"SF Pro Rounded","SF Pro Display",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:-.01em;pointer-events:none';card.appendChild(notice)}
    if(notice.textContent!==reason)notice.textContent=reason;
  }
  function applyPredictOpsPayload(payload){
    if(!payload||!payload.state)return;
    predictOpsState=payload.state;window.VexaPredictOpsState=predictOpsState;renderPredictOps();
    try{window.dispatchEvent(new CustomEvent('vexa:predict-ops',{detail:{state:predictOpsState,refreshRound:payload.refreshRound===true}}))}catch(e){}
    if(payload.refreshRound===true){
      var root=document.getElementById('predictzone');
      if(root&&root.classList.contains('active'))queueMicrotask(function(){var market=activePredictMarket(),button=market&&root.querySelector('[data-vexa-predict-market="'+market+'"]');if(button&&button.getAttribute('data-vexa-predict-locked')!=='1')try{button.click()}catch(e){}})
    }
  }
  function reconnectDelay(){return Math.min(30000,1000*Math.pow(2,Math.min(reconnectAttempt++,5)))}
  function connectLive(){
    if(liveSocket||!userId()||!window.WebSocket)return;
    var initData=String((tg&&tg.initData)||'');if(!initData)return;
    var proto=location.protocol==='https:'?'wss:':'ws:';
    var endpoint=proto+'//'+location.host+'/app/api/section-access/live?initData='+encodeURIComponent(initData);
    try{liveSocket=new WebSocket(endpoint);liveSocket.onopen=function(){reconnectAttempt=0};liveSocket.onmessage=function(event){try{var payload=JSON.parse(event.data);if(payload&&payload.type==='section-access')applyLivePayload(payload);else if(payload&&payload.type==='predict-ops')applyPredictOpsPayload(payload)}catch(e){}};liveSocket.onclose=function(){liveSocket=null;clearTimeout(liveReconnectTimer);if(!document.hidden)liveReconnectTimer=setTimeout(connectLive,reconnectDelay())};liveSocket.onerror=function(){try{liveSocket&&liveSocket.close()}catch(e){}}}catch(e){liveSocket=null;clearTimeout(liveReconnectTimer);liveReconnectTimer=setTimeout(connectLive,reconnectDelay())}
  }
  function apply(j){
    var active=document.querySelector('.view.active');var section=active&&active.id||'home';
    var lock=j&&j.locks&&((j.locks.app)||j.locks[section]);
    var signature=lock?lock.sectionId+':'+lock.lockedUntil:'';
    if(signature===last)return;
    last=signature;if(lock)render(lock);else remove();
  }
  function reapply(){expireLocks();renderPredictOps();return Promise.resolve(cache)}
  document.addEventListener('click',function(event){
    var target=event.target&&event.target.closest&&event.target.closest('#predictzone [data-predict-choice],#predictzone [data-predict-bet-submit],#predictzone [data-predict-bet-preset]');
    if(!target)return;
    var reason=predictOpsBlockReason();if(!reason)return;
    event.preventDefault();event.stopImmediatePropagation();renderPredictOps();
  },true);
  document.addEventListener('click',function(event){var target=event.target&&event.target.closest&&event.target.closest('#predictzone [data-vexa-predict-market]');if(target)queueMicrotask(renderPredictOps)},false);
  window.VexaSectionLocks={reload:reapply,refresh:function(){if(liveSocket)try{liveSocket.close()}catch(e){}else connectLive();return Promise.resolve(cache)}};
  window.addEventListener('vexa:section-mounted',function(){queueMicrotask(reapply)});
  window.addEventListener('vexa:view-changed',function(){queueMicrotask(renderPredictOps)});
  document.addEventListener('visibilitychange',function(){if(document.hidden){clearTimeout(liveReconnectTimer)}else if(!liveSocket)connectLive()});
  window.addEventListener('online',function(){if(!liveSocket)connectLive()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',connectLive);else connectLive()
})();
`;
