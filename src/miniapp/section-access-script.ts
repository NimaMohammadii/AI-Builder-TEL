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
  var predictUserAccess={blocked:{bitcoin:false,gold:false,oil:false}};
  var predictUserAccessRequest=0;
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
  function refreshPredictUserAccess(){
    var id=userId();if(!id)return Promise.resolve(false);
    var requestId=++predictUserAccessRequest;
    return fetch('/app/api/user-controls?userId='+encodeURIComponent(id),{cache:'no-store'})
      .then(function(response){return response.ok?response.json():null})
      .then(function(result){
        if(requestId!==predictUserAccessRequest||!result)return false;
        var sections=Array.isArray(result.blockedSections)?result.blockedSections:[];
        predictUserAccess={blocked:{
          bitcoin:sections.indexOf('predict-bitcoin')>=0,
          gold:sections.indexOf('predict-gold')>=0,
          oil:sections.indexOf('predict-oil')>=0
        }};
        renderPredictOps();
        return true;
      })
      .catch(function(){return false});
  }
  function predictOpsBlockState(){
    var market=activePredictMarket();if(!market)return null;
    if(predictUserAccess&&predictUserAccess.blocked&&predictUserAccess.blocked[market])return{kind:'user',message:'Your access to this market is currently paused. If you have any questions, please contact an admin — we’re happy to help.'};
    var state=predictOpsState||window.VexaPredictOpsState;if(!state)return null;
    var item=state.markets&&state.markets[market];
    var custom=String(state.maintenanceMessage||'').trim();
    if(state.emergencyPaused)return{kind:'market',message:custom||'Predictions are temporarily unavailable. Please try again shortly.'};
    if(item&&item.manualPaused)return{kind:'market',message:custom||(market==='bitcoin'?'Bitcoin':market==='gold'?'Gold':'Oil')+' predictions are temporarily paused.'};
    if(item&&item.circuitOpen)return{kind:'market',message:custom||String(item.circuitReason||'Live price feed is temporarily unavailable. New predictions are paused.')};
    return null;
  }
  function removePredictOpsNotice(){var notice=document.getElementById('vexaPredictOpsNotice');if(notice)notice.remove()}
  function renderPredictOps(){
    var root=document.getElementById('predictzone');if(!root){removePredictOpsNotice();return}
    var block=predictOpsBlockState();
    if(!block||!block.message){removePredictOpsNotice();return}
    var card=root.querySelector('[data-predict-card]');if(!card)return;
    var notice=document.getElementById('vexaPredictOpsNotice');
    if(!notice){
      notice=document.createElement('div');notice.id='vexaPredictOpsNotice';notice.setAttribute('role','status');
      notice.style.cssText='position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:30;width:calc(100% - 32px);max-width:320px;min-height:44px;padding:11px 14px;box-sizing:border-box;border-radius:18px;border:1px solid rgba(255,255,255,.14);background:transparent;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);box-shadow:none;display:flex;align-items:center;justify-content:center;text-align:center;color:rgba(255,255,255,.94);font:750 11px/1.35 ui-rounded,"SF Pro Rounded","SF Pro Display",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:-.01em;pointer-events:none';
      card.appendChild(notice)
    }
    notice.setAttribute('data-vexa-predict-block-kind',block.kind||'market');
    if(notice.textContent!==block.message)notice.textContent=block.message;
  }
  function applyPredictOpsPayload(payload){
    if(!payload||!payload.state)return;
    predictOpsState=payload.state;window.VexaPredictOpsState=predictOpsState;renderPredictOps();refreshPredictUserAccess();
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
    try{liveSocket=new WebSocket(endpoint);liveSocket.onopen=function(){reconnectAttempt=0;refreshPredictUserAccess()};liveSocket.onmessage=function(event){try{var payload=JSON.parse(event.data);if(payload&&payload.type==='section-access')applyLivePayload(payload);else if(payload&&payload.type==='predict-ops')applyPredictOpsPayload(payload)}catch(e){}};liveSocket.onclose=function(){liveSocket=null;clearTimeout(liveReconnectTimer);if(!document.hidden)liveReconnectTimer=setTimeout(connectLive,reconnectDelay())};liveSocket.onerror=function(){try{liveSocket&&liveSocket.close()}catch(e){}}}catch(e){liveSocket=null;clearTimeout(liveReconnectTimer);liveReconnectTimer=setTimeout(connectLive,reconnectDelay())}
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
    var block=predictOpsBlockState();if(!block||!block.message)return;
    event.preventDefault();event.stopImmediatePropagation();renderPredictOps();
  },true);
  document.addEventListener('click',function(event){var target=event.target&&event.target.closest&&event.target.closest('#predictzone [data-vexa-predict-market]');if(target)queueMicrotask(renderPredictOps)},false);
  window.VexaSectionLocks={reload:reapply,refresh:function(){if(liveSocket)try{liveSocket.close()}catch(e){}else connectLive();return Promise.resolve(cache)}};
  window.addEventListener('vexa:section-mounted',function(){queueMicrotask(reapply)});
  window.addEventListener('vexa:view-changed',function(){queueMicrotask(renderPredictOps)});
  document.addEventListener('visibilitychange',function(){if(document.hidden){clearTimeout(liveReconnectTimer)}else if(!liveSocket){refreshPredictUserAccess();connectLive()}});
  window.addEventListener('online',function(){refreshPredictUserAccess();if(!liveSocket)connectLive()});
  function init(){refreshPredictUserAccess();connectLive()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init()
})();
`;
