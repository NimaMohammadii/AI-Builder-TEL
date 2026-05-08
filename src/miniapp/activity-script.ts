export const ACTIVITY_SCRIPT = `
(function(){
  var tg=window.Telegram&&window.Telegram.WebApp;
  var user=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{};
  var lastPayload='';
  var lastSent=0;

  function activeSection(){
    var active=document.querySelector('.view.active');
    return active&&active.id?active.id:'home';
  }

  function currentCredit(){
    var ids=['plinkoCredit','creditCount','plinkoCreditHeader'];
    for(var i=0;i<ids.length;i++){
      var el=document.getElementById(ids[i]);
      if(el&&el.textContent){
        var n=Number(String(el.textContent).replace(/[^0-9]/g,''));
        if(Number.isFinite(n))return Math.max(0,Math.floor(n));
      }
    }
    return Math.max(0,Math.floor(Number(localStorage.getItem('vexaCredit')||localStorage.getItem('plinkoCredit')||'1000')||0));
  }

  function applyServerCredit(value){
    if(value===null||value===undefined)return;
    var credit=Math.max(0,Math.floor(Number(value)||0));
    try{localStorage.setItem('vexaCredit',String(credit));localStorage.setItem('plinkoCredit',String(credit))}catch(e){}
    ['plinkoCredit','creditCount','plinkoCreditHeader'].forEach(function(id){var el=document.getElementById(id);if(el)el.textContent=String(credit)});
    try{window.dispatchEvent(new CustomEvent('vexa-credit-sync',{detail:{credit:credit}}))}catch(e){}
  }

  function userId(){
    return String(user.id||localStorage.getItem('ownerId')||'').trim();
  }

  function payload(){
    return {
      userId:userId(),
      username:user.username||null,
      firstName:user.first_name||null,
      section:activeSection(),
      credit:currentCredit()
    };
  }

  function send(force){
    var body=payload();
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

  window.addEventListener('vexa-credit-set',function(ev){if(ev&&ev.detail&&ev.detail.credit!==undefined)applyServerCredit(ev.detail.credit)});
  document.addEventListener('click',function(){setTimeout(function(){send(false)},80)},true);
  document.addEventListener('visibilitychange',function(){send(true)});
  window.addEventListener('beforeunload',function(){send(true)});
  setTimeout(function(){send(true)},600);
  setInterval(function(){send(false)},20000);
})();
`;
