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

  function applyServerCredit(value){
    if(value===null||value===undefined)return;
    var credit=writeCreditToUi(value);
    confirmedCredit=credit;
    pendingCredit=credit;
    try{window.dispatchEvent(new CustomEvent('vexa-credit-sync',{detail:{credit:credit}}))}catch(e){}
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
    var delta=Number.isFinite(Number(explicitDelta))?Math.floor(Number(explicitDelta)):nextCredit-previous;
    pendingCredit=Math.max(0,previous+delta);
    creditVersion++;
    if(delta===0)return;
    creditInFlight++;
    creditQueue=creditQueue.then(function(){
      return fetch('/app/api/credit/game-delta',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({userId:id,delta:delta})})
        .then(function(r){return r.json().catch(function(){return null})})
        .then(function(j){if(j&&j.credit!==undefined)applyServerCredit(j.credit)})
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
  setTimeout(function(){sendActivity(true)},600);
  setInterval(function(){sendActivity(false)},20000);
})();
`;
