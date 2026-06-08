export const ACTIVITY_CORE_SCRIPT = `
(function(){
  var tg=window.Telegram&&window.Telegram.WebApp;
  var user=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{};
  var lastPayload='';
  var lastSent=0;
  var lastSection='';
  function activeSection(){var active=document.querySelector('.view.active');return active&&active.id?active.id:'home'}
  function userId(){return String(user.id||localStorage.getItem('ownerId')||'').trim()}
  function applyServerTonBalance(value){var balance=Math.max(0,Math.floor(Number(value)||0));if(!Number.isFinite(balance))return;try{window.dispatchEvent(new CustomEvent('vexa-ton-balance-sync',{detail:{tonBalanceNano:balance}}))}catch(e){}}
  function sendActivity(force){if(document.hidden)return;var section=activeSection();var body={userId:userId(),username:user.username||null,firstName:user.first_name||null,section:section};if(!body.userId)return;var encoded=JSON.stringify(body);var now=Date.now();var sectionChanged=section!==lastSection;if(!force&&!sectionChanged&&encoded===lastPayload&&now-lastSent<300000)return;lastPayload=encoded;lastSent=now;lastSection=section;fetch('/app/api/activity',{method:'POST',headers:{'content-type':'application/json'},body:encoded,keepalive:true}).then(function(r){return r.json().catch(function(){return null})}).then(function(j){if(j&&j.ok&&j.tonBalanceNano!==undefined)applyServerTonBalance(j.tonBalanceNano)}).catch(function(){});}
  function smartSync(){sendActivity(false)}
  document.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('button');if(b&&(b.getAttribute('data-action')||b.getAttribute('data-tab')||b.closest('.tabs')))setTimeout(smartSync,120)},true);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)sendActivity(false)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){sendActivity(true)});else sendActivity(true)
})();
`;
