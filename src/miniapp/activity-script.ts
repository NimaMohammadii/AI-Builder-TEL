
export const ACTIVITY_SCRIPT = `
(function(){
  var tg=window.Telegram&&window.Telegram.WebApp;
  var user=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{};
  var lastPayload='';
  var lastSent=0;
  var lastSection='';
  var confirmedCredit=null;
  var pendingCredit=null;
  var creditQueue=Promise.resolve();
  var creditVersion=0;
  var creditInFlight=0;
  var CREDIT_FLUSH_MS=30000;
  var creditFlushTimer=0;
  var pendingGameDelta=0;
  var pendingGameDeltaUser='';

  function activeSection(){var active=document.querySelector('.view.active');return active&&active.id?active.id:'home'}
  function userId(){return String(user.id||localStorage.getItem('ownerId')||'').trim()}
  function pendingDeltaKey(){var id=userId();return id?'vexa:pending-credit-delta:'+id:''}
  function loadPendingGameDelta(){
    var id=userId();
    if(!id)return 0;
    if(pendingGameDeltaUser===id)return Math.floor(Number(pendingGameDelta)||0);
    pendingGameDeltaUser=id;
    try{pendingGameDelta=Math.floor(Number(localStorage.getItem(pendingDeltaKey())||0)||0)}catch(e){pendingGameDelta=0}
    return pendingGameDelta;
  }
  function savePendingGameDelta(){
    var key=pendingDeltaKey();
    if(!key)return;
    try{var value=Math.floor(Number(pendingGameDelta)||0);if(value)localStorage.setItem(key,String(value));else localStorage.removeItem(key)}catch(e){}
  }
  function hasPendingGameDelta(){return Math.floor(Number(loadPendingGameDelta())||0)!==0}

  function writeCreditToUi(value){var credit=Math.max(0,Math.floor(Number(value)||0));['plinkoCredit','creditCount','plinkoCreditHeader'].forEach(function(id){var el=document.getElementById(id);if(el)el.textContent=String(credit)});return credit}
  function syncCreditToGames(value){var credit=Math.max(0,Math.floor(Number(value)||0));try{window.dispatchEvent(new CustomEvent('vexa-credit-sync',{detail:{credit:credit}}))}catch(e){}return credit}
  function applyServerCredit(value){if(value===null||value===undefined)return;var credit=writeCreditToUi(value);confirmedCredit=credit;pendingCredit=credit;syncCreditToGames(credit)}
  function applyServerTonBalance(value){var balance=Math.max(0,Math.floor(Number(value)||0));if(!Number.isFinite(balance))return;try{window.dispatchEvent(new CustomEvent('vexa-ton-balance-sync',{detail:{tonBalanceNano:balance}}))}catch(e){}}

  function sendActivity(force){
    if(document.hidden)return;
    var section=activeSection();
    var body={userId:userId(),username:user.username||null,firstName:user.first_name||null,section:section};
    if(!body.userId)return;
    var encoded=JSON.stringify(body);
    var now=Date.now();
    var sectionChanged=section!==lastSection;
    if(!force&&!sectionChanged&&encoded===lastPayload&&now-lastSent<300000)return;
    lastPayload=encoded;lastSent=now;lastSection=section;
    var requestCreditVersion=creditVersion;
    fetch('/app/api/activity',{method:'POST',headers:{'content-type':'application/json'},body:encoded,keepalive:true})
      .then(function(r){return r.json().catch(function(){return null})})
      .then(function(j){if(j&&j.ok){if(j.tonBalanceNano!==undefined)applyServerTonBalance(j.tonBalanceNano);if(j.credit!==undefined&&creditInFlight===0&&!hasPendingGameDelta()&&requestCreditVersion===creditVersion)applyServerCredit(j.credit)}})
      .catch(function(){});
  }

  function readUiCredit(){var el=document.getElementById('plinkoCredit')||document.getElementById('creditCount')||document.getElementById('plinkoCreditHeader');return Math.max(0,Math.floor(Number(el&&el.textContent)||0))}
  function scheduleCreditFlush(delay){
    if(creditFlushTimer)return;
    creditFlushTimer=setTimeout(function(){creditFlushTimer=0;flushGameDelta(false)},Math.max(1000,Math.floor(Number(delay)||CREDIT_FLUSH_MS)));
  }
  function flushGameDelta(force){
    var id=userId();if(!id)return Promise.resolve();
    loadPendingGameDelta();
    var delta=Math.floor(Number(pendingGameDelta)||0);
    if(delta===0)return Promise.resolve();
    pendingGameDelta=0;savePendingGameDelta();
    creditVersion++;
    var requestCreditVersion=creditVersion;
    creditInFlight++;
    creditQueue=creditQueue.then(function(){return fetch('/app/api/credit/game-delta',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({userId:id,delta:delta}),keepalive:!!force})
      .then(function(r){return r.json().catch(function(){return null})})
      .then(function(j){if(j&&j.credit!==undefined){if(!hasPendingGameDelta()&&requestCreditVersion===creditVersion){applyServerCredit(j.credit)}else{confirmedCredit=Math.max(0,Math.floor(Number(j.credit)||0))}}})
      .catch(function(){loadPendingGameDelta();pendingGameDelta+=delta;savePendingGameDelta();if(!document.hidden)scheduleCreditFlush(CREDIT_FLUSH_MS)})
      .then(function(){creditInFlight=Math.max(0,creditInFlight-1);if(hasPendingGameDelta()&&!document.hidden)scheduleCreditFlush(CREDIT_FLUSH_MS)});});
    return creditQueue;
  }
  function queueGameDelta(nextCredit, explicitDelta){
    var id=userId();if(!id)return;
    var previous=pendingCredit===null?(confirmedCredit===null?readUiCredit():confirmedCredit):pendingCredit;
    nextCredit=writeCreditToUi(nextCredit);syncCreditToGames(nextCredit);
    var delta=Number.isFinite(Number(explicitDelta))?Math.floor(Number(explicitDelta)):nextCredit-previous;
    pendingCredit=Math.max(0,previous+delta);creditVersion++;
    if(delta===0)return;
    loadPendingGameDelta();
    pendingGameDelta+=delta;
    savePendingGameDelta();
    scheduleCreditFlush(CREDIT_FLUSH_MS);
  }

  function smartSync(){sendActivity(false)}
  window.addEventListener('vexa-credit-game-change',function(ev){if(ev&&ev.detail&&ev.detail.credit!==undefined)queueGameDelta(ev.detail.credit,ev.detail.delta)});
  document.addEventListener('click',function(ev){
    var sectionBefore=activeSection();
    var b=ev.target&&ev.target.closest&&ev.target.closest('button');
    if(b&&(b.getAttribute('data-action')||b.getAttribute('data-tab')||b.closest('.tabs')))setTimeout(function(){smartSync();if(sectionBefore==='plinko'&&activeSection()!=='plinko')flushGameDelta(true)},120);
  },true);
  document.addEventListener('visibilitychange',function(){if(document.hidden){flushGameDelta(true)}else sendActivity(false)});
  window.addEventListener('beforeunload',function(){flushGameDelta(true)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){loadPendingGameDelta();if(hasPendingGameDelta())scheduleCreditFlush(CREDIT_FLUSH_MS);sendActivity(true)});else{loadPendingGameDelta();if(hasPendingGameDelta())scheduleCreditFlush(CREDIT_FLUSH_MS);sendActivity(true)}
})();
`;