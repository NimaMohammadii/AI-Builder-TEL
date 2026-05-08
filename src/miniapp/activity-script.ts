export const ACTIVITY_SCRIPT = `
(function(){
  var tg=window.Telegram&&window.Telegram.WebApp;
  var user=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{};
  var lastPayload='';
  var lastSent=0;
  var confirmedCredit=null;
  var pendingCredit=null;
  var creditQueue=Promise.resolve();

  function activeSection(){
    var active=document.querySelector('.view.active');
    return active&&active.id?active.id:'home';
  }

  function userId(){
    return String(user.id||localStorage.getItem('ownerId')||'').trim();
  }

  function writeCreditToUi(value){
    var credit=Math.max(0,Math.floor(Number(value)||0));
    try{localStorage.setItem('vexaCredit',String(credit));localStorage.setItem('plinkoCredit',String(credit))}catch(e){}
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
    fetch('/app/api/activity',{method:'POST',headers:{'content-type':'application/json'},body:encoded,keepalive:true})
      .then(function(r){return r.json().catch(function(){return null})})
      .then(function(j){if(j&&j.ok&&j.credit!==undefined)applyServerCredit(j.credit)})
      .catch(function(){});
  }

  function sendGameDelta(nextCredit){
    var id=userId();
    if(!id)return;
    nextCredit=writeCreditToUi(nextCredit);
    if(pendingCredit===null)pendingCredit=confirmedCredit===null?nextCredit:confirmedCredit;
    var delta=nextCredit-pendingCredit;
    pendingCredit=nextCredit;
    if(delta===0)return;
    creditQueue=creditQueue.then(function(){
      return fetch('/app/api/credit/game-delta',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({userId:id,delta:delta})})
        .then(function(r){return r.json().catch(function(){return null})})
        .then(function(j){if(j&&j.credit!==undefined)applyServerCredit(j.credit)})
        .catch(function(){});
    });
  }

  window.addEventListener('vexa-credit-game-change',function(ev){
    if(ev&&ev.detail&&ev.detail.credit!==undefined)sendGameDelta(ev.detail.credit);
  });
  document.addEventListener('click',function(){setTimeout(function(){sendActivity(false)},80)},true);
  document.addEventListener('visibilitychange',function(){sendActivity(true)});
  window.addEventListener('beforeunload',function(){sendActivity(true)});
  setTimeout(function(){sendActivity(true)},600);
  setInterval(function(){sendActivity(false)},20000);
})();
`;
