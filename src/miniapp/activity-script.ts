import { VEXA_LEAGUE_SCRIPT } from './vexa-league-script';

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

  function activeSection(){var active=document.querySelector('.view.active');return active&&active.id?active.id:'home'}
  function userId(){return String(user.id||localStorage.getItem('ownerId')||'').trim()}

  function writeCreditToUi(value){var credit=Math.max(0,Math.floor(Number(value)||0));['plinkoCredit','creditCount','plinkoCreditHeader'].forEach(function(id){var el=document.getElementById(id);if(el)el.textContent=String(credit)});return credit}
  function syncCreditToGames(value){var credit=Math.max(0,Math.floor(Number(value)||0));try{window.dispatchEvent(new CustomEvent('vexa-credit-sync',{detail:{credit:credit}}))}catch(e){}return credit}
  function applyServerCredit(value){if(value===null||value===undefined)return;var credit=writeCreditToUi(value);confirmedCredit=credit;pendingCredit=credit;syncCreditToGames(credit)}

  function sendActivity(force){
    if(document.hidden&&!force)return;
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
      .then(function(j){if(j&&j.ok&&j.credit!==undefined&&creditInFlight===0&&requestCreditVersion===creditVersion)applyServerCredit(j.credit)})
      .catch(function(){});
  }

  function readUiCredit(){var el=document.getElementById('plinkoCredit')||document.getElementById('creditCount')||document.getElementById('plinkoCreditHeader');return Math.max(0,Math.floor(Number(el&&el.textContent)||0))}
  function sendGameDelta(nextCredit, explicitDelta){
    var id=userId();if(!id)return;
    var previous=pendingCredit===null?(confirmedCredit===null?readUiCredit():confirmedCredit):pendingCredit;
    nextCredit=writeCreditToUi(nextCredit);syncCreditToGames(nextCredit);
    var delta=Number.isFinite(Number(explicitDelta))?Math.floor(Number(explicitDelta)):nextCredit-previous;
    pendingCredit=Math.max(0,previous+delta);creditVersion++;
    var requestCreditVersion=creditVersion;
    if(delta===0)return;
    creditInFlight++;
    creditQueue=creditQueue.then(function(){return fetch('/app/api/credit/game-delta',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({userId:id,delta:delta})})
      .then(function(r){return r.json().catch(function(){return null})})
      .then(function(j){if(j&&j.credit!==undefined){if(requestCreditVersion===creditVersion){applyServerCredit(j.credit)}else{confirmedCredit=Math.max(0,Math.floor(Number(j.credit)||0))}}})
      .catch(function(){})
      .then(function(){creditInFlight=Math.max(0,creditInFlight-1)});});
  }

  function smartSync(){sendActivity(false)}
  window.addEventListener('vexa-credit-game-change',function(ev){if(ev&&ev.detail&&ev.detail.credit!==undefined)sendGameDelta(ev.detail.credit,ev.detail.delta)});
  document.addEventListener('click',function(ev){
    var b=ev.target&&ev.target.closest&&ev.target.closest('button');
    if(b&&(b.getAttribute('data-action')||b.getAttribute('data-tab')||b.closest('.tabs')))setTimeout(smartSync,120);
  },true);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)sendActivity(false);else sendActivity(true)});
  window.addEventListener('beforeunload',function(){sendActivity(true)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){sendActivity(true)});else sendActivity(true);
})();
` + VEXA_LEAGUE_SCRIPT;