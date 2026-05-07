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
    var plinko=document.getElementById('plinkoCredit');
    var text=plinko&&plinko.textContent?plinko.textContent:localStorage.getItem('plinkoCredit')||'1000';
    return Math.max(0,Math.floor(Number(String(text).replace(/[^0-9]/g,''))||0));
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
    fetch('/app/api/activity',{method:'POST',headers:{'content-type':'application/json'},body:encoded,keepalive:true}).catch(function(){});
  }

  document.addEventListener('click',function(){setTimeout(function(){send(false)},80)},true);
  document.addEventListener('visibilitychange',function(){send(true)});
  window.addEventListener('beforeunload',function(){send(true)});
  setTimeout(function(){send(true)},600);
  setInterval(function(){send(false)},20000);
})();
`;
