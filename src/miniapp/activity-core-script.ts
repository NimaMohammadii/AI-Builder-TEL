export const ACTIVITY_CORE_SCRIPT = `
(function(){
  var tg=window.Telegram&&window.Telegram.WebApp;
  var user=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{};
  var lastPayload='';
  var lastSent=0;
  var lastSection='';
  var resetHandled=false;
  function activeSection(){var active=document.querySelector('.view.active');return active&&active.id?active.id:'home'}
  function userId(){return String(user.id||localStorage.getItem('ownerId')||'').trim()}
  function resetKey(){var id=userId();return id?'vexa:client-reset-version:'+id:''}
  function resetAllKey(){return 'vexa:client-reset-version:all'}
  function applyServerTonBalance(value){var balance=Math.max(0,Math.floor(Number(value)||0));if(!Number.isFinite(balance))return;try{window.dispatchEvent(new CustomEvent('vexa-ton-balance-sync',{detail:{tonBalanceNano:balance}}))}catch(e){}}
  function needsReset(j){var userReset=String(j&&j.resetVersion||'');var allReset=String(j&&j.resetAllVersion||'');var current='',currentAll='';try{current=localStorage.getItem(resetKey())||'';currentAll=localStorage.getItem(resetAllKey())||''}catch(e){}return Boolean((userReset&&userReset!==current)||(allReset&&allReset!==currentAll))}
  function clearUserCache(j){if(resetHandled)return;resetHandled=true;var id=userId();var userReset=String(j&&j.resetVersion||'');var allReset=String(j&&j.resetAllVersion||'');try{var keepOwner=localStorage.getItem('ownerId')||'';Object.keys(localStorage).forEach(function(k){if(k==='ownerId')return;if(/^vexa:/.test(k)||/^vexa/.test(k)||k.indexOf(id)>=0)localStorage.removeItem(k)});if(keepOwner)localStorage.setItem('ownerId',keepOwner);if(userReset)localStorage.setItem(resetKey(),userReset);if(allReset)localStorage.setItem(resetAllKey(),allReset)}catch(e){}try{sessionStorage.clear()}catch(e){}try{if('caches' in window)caches.keys().then(function(keys){keys.forEach(function(k){if(/^vexa/i.test(k))caches.delete(k)})})}catch(e){}try{window.dispatchEvent(new CustomEvent('vexa-user-cache-reset',{detail:{userId:id}}))}catch(e){}setTimeout(function(){try{location.reload()}catch(e){}},80)}
  function sendActivity(force){if(document.hidden)return;var section=activeSection();var body={userId:userId(),username:user.username||null,firstName:user.first_name||null,section:section};if(!body.userId)return;var encoded=JSON.stringify(body);var now=Date.now();var sectionChanged=section!==lastSection;if(!force&&!sectionChanged&&encoded===lastPayload&&now-lastSent<300000)return;lastPayload=encoded;lastSent=now;lastSection=section;fetch('/app/api/activity',{method:'POST',headers:{'content-type':'application/json'},body:encoded,keepalive:true}).then(function(r){return r.json().catch(function(){return null})}).then(function(j){if(j&&j.ok){if(needsReset(j)){clearUserCache(j);return}if(j.tonBalanceNano!==undefined)applyServerTonBalance(j.tonBalanceNano);if(j.winChancePercent!==undefined&&window.VexaGameChance&&window.VexaGameChance.set)window.VexaGameChance.set(j.winChancePercent)}}).catch(function(){});}
  function smartSync(){sendActivity(false)}
  document.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('button');if(b&&(b.getAttribute('data-action')||b.getAttribute('data-tab')||b.closest('.tabs')))setTimeout(function(){smartSync();},120);},true);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)sendActivity(true)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){sendActivity(true)});else sendActivity(true)
})();
`;
