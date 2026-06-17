export const ACTIVITY_CORE_SCRIPT = `
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
  var resetHandled=false;
  function activeSection(){var active=document.querySelector('.view.active');return active&&active.id?active.id:'home'}
  function userId(){return String(user.id||localStorage.getItem('ownerId')||'').trim()}
  function pendingDeltaKey(){var id=userId();return id?'vexa:pending-credit-delta:'+id:''}
  function resetKey(){var id=userId();return id?'vexa:client-reset-version:'+id:''}
  function resetAllKey(){return 'vexa:client-reset-version:all'}
  function loadPendingGameDelta(){var id=userId();if(!id)return 0;if(pendingGameDeltaUser===id)return Math.floor(Number(pendingGameDelta)||0);pendingGameDeltaUser=id;try{pendingGameDelta=Math.floor(Number(localStorage.getItem(pendingDeltaKey())||0)||0)}catch(e){pendingGameDelta=0}return pendingGameDelta}
  function savePendingGameDelta(){var key=pendingDeltaKey();if(!key)return;try{var value=Math.floor(Number(pendingGameDelta)||0);if(value)localStorage.setItem(key,String(value));else localStorage.removeItem(key)}catch(e){}}
  function hasPendingGameDelta(){return Math.floor(Number(loadPendingGameDelta())||0)!==0}
  function writeCreditToUi(value){var credit=Math.max(0,Math.floor(Number(value)||0));['plinkoCredit','creditCount','plinkoCreditHeader'].forEach(function(id){var el=document.getElementById(id);if(el)el.textContent=String(credit)});return credit}
  function syncCreditToGames(value){var credit=Math.max(0,Math.floor(Number(value)||0));try{window.dispatchEvent(new CustomEvent('vexa-credit-sync',{detail:{credit:credit}}))}catch(e){}return credit}
  function applyServerCredit(value){if(value===null||value===undefined)return;var credit=writeCreditToUi(value);confirmedCredit=credit;pendingCredit=credit;syncCreditToGames(credit)}
  function applyServerTonBalance(value){var balance=Math.max(0,Math.floor(Number(value)||0));if(!Number.isFinite(balance))return;try{window.dispatchEvent(new CustomEvent('vexa-ton-balance-sync',{detail:{tonBalanceNano:balance}}))}catch(e){}}
  function needsReset(j){var userReset=String(j&&j.resetVersion||'');var allReset=String(j&&j.resetAllVersion||'');var current='',currentAll='';try{current=localStorage.getItem(resetKey())||'';currentAll=localStorage.getItem(resetAllKey())||''}catch(e){}return Boolean((userReset&&userReset!==current)||(allReset&&allReset!==currentAll))}
  function clearUserCache(j){if(resetHandled)return;resetHandled=true;var id=userId();var userReset=String(j&&j.resetVersion||'');var allReset=String(j&&j.resetAllVersion||'');try{var keepOwner=localStorage.getItem('ownerId')||'';Object.keys(localStorage).forEach(function(k){if(k==='ownerId')return;if(/^vexa:/.test(k)||/^vexa/.test(k)||k.indexOf(id)>=0)localStorage.removeItem(k)});if(keepOwner)localStorage.setItem('ownerId',keepOwner);if(userReset)localStorage.setItem(resetKey(),userReset);if(allReset)localStorage.setItem(resetAllKey(),allReset)}catch(e){}try{sessionStorage.clear()}catch(e){}try{if('caches' in window)caches.keys().then(function(keys){keys.forEach(function(k){if(/^vexa/i.test(k))caches.delete(k)})})}catch(e){}confirmedCredit=null;pendingCredit=null;pendingGameDelta=0;pendingGameDeltaUser='';writeCreditToUi(0);syncCreditToGames(0);try{window.dispatchEvent(new CustomEvent('vexa-user-cache-reset',{detail:{userId:id}}))}catch(e){}setTimeout(function(){try{location.reload()}catch(e){}},80)}
  function sendActivity(force){if(document.hidden)return;var section=activeSection();var body={userId:userId(),username:user.username||null,firstName:user.first_name||null,section:section};if(!body.userId)return;var encoded=JSON.stringify(body);var now=Date.now();var sectionChanged=section!==lastSection;if(!force&&!sectionChanged&&encoded===lastPayload&&now-lastSent<300000)return;lastPayload=encoded;lastSent=now;lastSection=section;var requestCreditVersion=creditVersion;fetch('/app/api/activity',{method:'POST',headers:{'content-type':'application/json'},body:encoded,keepalive:true}).then(function(r){return r.json().catch(function(){return null})}).then(function(j){if(j&&j.ok){if(needsReset(j)){clearUserCache(j);return}if(j.tonBalanceNano!==undefined)applyServerTonBalance(j.tonBalanceNano);if(j.winChancePercent!==undefined&&window.VexaGameChance&&window.VexaGameChance.set)window.VexaGameChance.set(j.winChancePercent);if(j.credit!==undefined&&creditInFlight===0&&!hasPendingGameDelta()&&requestCreditVersion===creditVersion)applyServerCredit(j.credit)}}).catch(function(){});}
  function readUiCredit(){var el=document.getElementById('plinkoCredit')||document.getElementById('creditCount')||document.getElementById('plinkoCreditHeader');return Math.max(0,Math.floor(Number(el&&el.textContent)||0))}
  function scheduleCreditFlush(delay){if(creditFlushTimer)return;creditFlushTimer=setTimeout(function(){creditFlushTimer=0;flushGameDelta(false)},Math.max(1000,Math.floor(Number(delay)||CREDIT_FLUSH_MS)));}
  function flushGameDelta(force){var id=userId();if(!id)return Promise.resolve();loadPendingGameDelta();var delta=Math.floor(Number(pendingGameDelta)||0);if(delta===0)return Promise.resolve();pendingGameDelta=0;savePendingGameDelta();creditVersion++;var requestCreditVersion=creditVersion;creditInFlight++;creditQueue=creditQueue.then(function(){return fetch('/app/api/credit/game-delta',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({userId:id,delta:delta}),keepalive:!!force}).then(function(r){return r.json().catch(function(){return null})}).then(function(j){if(j&&j.credit!==undefined){if(!hasPendingGameDelta()&&requestCreditVersion===creditVersion){applyServerCredit(j.credit)}else{confirmedCredit=Math.max(0,Math.floor(Number(j.credit)||0))}}}).catch(function(){loadPendingGameDelta();pendingGameDelta+=delta;savePendingGameDelta();if(!document.hidden)scheduleCreditFlush(CREDIT_FLUSH_MS)}).then(function(){creditInFlight=Math.max(0,creditInFlight-1);if(hasPendingGameDelta()&&!document.hidden)scheduleCreditFlush(CREDIT_FLUSH_MS)});});return creditQueue;}
  function queueGameDelta(nextCredit, explicitDelta){var id=userId();if(!id)return;var previous=pendingCredit===null?(confirmedCredit===null?readUiCredit():confirmedCredit):pendingCredit;nextCredit=writeCreditToUi(nextCredit);syncCreditToGames(nextCredit);var delta=Number.isFinite(Number(explicitDelta))?Math.floor(Number(explicitDelta)):nextCredit-previous;pendingCredit=Math.max(0,previous+delta);creditVersion++;if(delta===0)return;loadPendingGameDelta();pendingGameDelta+=delta;savePendingGameDelta();scheduleCreditFlush(CREDIT_FLUSH_MS);}
  function smartSync(){sendActivity(false)}
  window.addEventListener('vexa-credit-game-change',function(ev){if(ev&&ev.detail&&ev.detail.credit!==undefined)queueGameDelta(ev.detail.credit,ev.detail.delta)});
  document.addEventListener('click',function(ev){var sectionBefore=activeSection();var b=ev.target&&ev.target.closest&&ev.target.closest('button');if(b&&(b.getAttribute('data-action')||b.getAttribute('data-tab')||b.closest('.tabs')))setTimeout(function(){smartSync();if(sectionBefore==='plinko'&&activeSection()!=='plinko')flushGameDelta(true)},120);},true);
  document.addEventListener('visibilitychange',function(){if(document.hidden){flushGameDelta(true)}else sendActivity(true)});
  window.addEventListener('beforeunload',function(){flushGameDelta(true)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){loadPendingGameDelta();if(hasPendingGameDelta())scheduleCreditFlush(CREDIT_FLUSH_MS);sendActivity(true)});else{loadPendingGameDelta();if(hasPendingGameDelta())scheduleCreditFlush(CREDIT_FLUSH_MS);sendActivity(true)}
})();
`;