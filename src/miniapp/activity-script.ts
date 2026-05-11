export const ACTIVITY_SCRIPT = `
(function(){
  var tg=window.Telegram&&window.Telegram.WebApp;
  var user=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{};
  var lastPayload='';
  var lastSent=0;
  var confirmedCredit=null;
  var pendingCredit=null;
  var creditQueue=Promise.resolve();
  var creditVersion=0;
  var creditInFlight=0;

  function injectPolish(){
    if(document.getElementById('vexaPolishStyle'))return;
    var css='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';
    var style=document.createElement('style');
    style.id='vexaPolishStyle';
    style.textContent=decodeURIComponent(escape(atob(css)));
    document.head.appendChild(style);
  }

  function activeSection(){
    var active=document.querySelector('.view.active');
    return active&&active.id?active.id:'home';
  }

  function userId(){
    return String(user.id||localStorage.getItem('ownerId')||'').trim();
  }

  function writeCreditToUi(value){
    var credit=Math.max(0,Math.floor(Number(value)||0));
    ['plinkoCredit','creditCount','plinkoCreditHeader'].forEach(function(id){var el=document.getElementById(id);if(el)el.textContent=String(credit)});
    return credit;
  }

  function syncCreditToGames(value){
    var credit=Math.max(0,Math.floor(Number(value)||0));
    try{window.dispatchEvent(new CustomEvent('vexa-credit-sync',{detail:{credit:credit}}))}catch(e){}
    return credit;
  }

  function applyServerCredit(value){
    if(value===null||value===undefined)return;
    var credit=writeCreditToUi(value);
    confirmedCredit=credit;
    pendingCredit=credit;
    syncCreditToGames(credit);
  }

  function sendActivity(force){
    var body={userId:userId(),username:user.username||null,firstName:user.first_name||null,section:activeSection()};
    if(!body.userId)return;
    var encoded=JSON.stringify(body);
    var now=Date.now();
    if(!force&&encoded===lastPayload&&now-lastSent<25000)return;
    lastPayload=encoded;
    lastSent=now;
    var requestCreditVersion=creditVersion;
    fetch('/app/api/activity',{method:'POST',headers:{'content-type':'application/json'},body:encoded,keepalive:true})
      .then(function(r){return r.json().catch(function(){return null})})
      .then(function(j){if(j&&j.ok&&j.credit!==undefined&&creditInFlight===0&&requestCreditVersion===creditVersion)applyServerCredit(j.credit)})
      .catch(function(){});
  }

  function readUiCredit(){
    var el=document.getElementById('plinkoCredit')||document.getElementById('creditCount')||document.getElementById('plinkoCreditHeader');
    return Math.max(0,Math.floor(Number(el&&el.textContent)||0));
  }

  function sendGameDelta(nextCredit, explicitDelta){
    var id=userId();
    if(!id)return;
    var previous=pendingCredit===null?(confirmedCredit===null?readUiCredit():confirmedCredit):pendingCredit;
    nextCredit=writeCreditToUi(nextCredit);
    syncCreditToGames(nextCredit);
    var delta=Number.isFinite(Number(explicitDelta))?Math.floor(Number(explicitDelta)):nextCredit-previous;
    pendingCredit=Math.max(0,previous+delta);
    creditVersion++;
    var requestCreditVersion=creditVersion;
    if(delta===0)return;
    creditInFlight++;
    creditQueue=creditQueue.then(function(){
      return fetch('/app/api/credit/game-delta',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({userId:id,delta:delta})})
        .then(function(r){return r.json().catch(function(){return null})})
        .then(function(j){if(j&&j.credit!==undefined){if(requestCreditVersion===creditVersion){applyServerCredit(j.credit)}else{confirmedCredit=Math.max(0,Math.floor(Number(j.credit)||0))}}})
        .catch(function(){})
        .then(function(){creditInFlight=Math.max(0,creditInFlight-1)});
    });
  }

  window.addEventListener('vexa-credit-game-change',function(ev){
    if(ev&&ev.detail&&ev.detail.credit!==undefined)sendGameDelta(ev.detail.credit,ev.detail.delta);
  });
  document.addEventListener('click',function(){setTimeout(function(){sendActivity(false)},80)},true);
  document.addEventListener('visibilitychange',function(){sendActivity(true)});
  window.addEventListener('beforeunload',function(){sendActivity(true)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',injectPolish);else injectPolish();
  setTimeout(function(){sendActivity(true)},600);
  setInterval(function(){sendActivity(false)},20000);
})();
`;