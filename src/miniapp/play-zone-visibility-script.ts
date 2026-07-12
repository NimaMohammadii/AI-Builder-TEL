export const PLAY_ZONE_VISIBILITY_SCRIPT = `
(function(){
  var endpoint='/app/api/play-zone-cards';
  var CACHE_MS=60000;
  var lastRefreshAt=0;
  var inFlight=null;
  var lastPayload=null;
  function currentUserId(){
    var tg=window.Telegram&&window.Telegram.WebApp;
    var user=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{};
    return String(user.id||localStorage.getItem('ownerId')||'').trim();
  }
  function setCard(card,visible){
    if(!card)return;
    if(visible){
      card.removeAttribute('data-play-zone-card-hidden');
      card.removeAttribute('aria-hidden');
      card.style.removeProperty('display');
    }else{
      card.setAttribute('data-play-zone-card-hidden','true');
      card.setAttribute('aria-hidden','true');
      card.style.setProperty('display','none','important');
    }
  }
  function apply(payload){
    lastPayload=payload||lastPayload;
    var hidden={};
    (payload&&payload.cards||[]).forEach(function(card){hidden[String(card.id)]=card.visible===false});
    document.querySelectorAll('#playzone [data-play-zone-card-id]').forEach(function(card){
      var id=card.getAttribute('data-play-zone-card-id')||'';
      setCard(card,!hidden[id]);
    });
  }
  function refresh(force){
    if(window.VexaTrustedAccess===true){apply({cards:[]});return Promise.resolve({cards:[]})}
    var now=Date.now();
    if(!force&&lastPayload&&lastRefreshAt&&now-lastRefreshAt<CACHE_MS){apply(lastPayload);return Promise.resolve(lastPayload)}
    if(inFlight)return inFlight;
    var uid=currentUserId();
    var url=endpoint+(uid?'?userId='+encodeURIComponent(uid):'');
    inFlight=fetch(url,{credentials:'same-origin',cache:'no-store'})
      .then(function(r){return r.ok?r.json():null})
      .then(function(j){if(j){lastRefreshAt=Date.now();apply(j)}return j||lastPayload})
      .catch(function(){return lastPayload})
      .finally(function(){inFlight=null});
    return inFlight;
  }
  window.VexaRefreshPlayZoneCards=function(){return refresh(true)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){refresh(false)});else refresh(false);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)refresh(false)});

  document.addEventListener('click',function(ev){
    var button=ev.target&&ev.target.closest?ev.target.closest('#slotBetMax'):null;
    if(!button)return;
    ev.preventDefault();
    ev.stopImmediatePropagation();
    if(button.disabled)return;
    var input=document.getElementById('slotAmount');
    if(!input)return;
    var current=Math.max(1,Math.floor(Number(input.value)||1));
    input.value=String(Math.min(999,current*2));
    input.dispatchEvent(new Event('input',{bubbles:true}));
    input.dispatchEvent(new Event('change',{bubbles:true}));
  },true);
})();
`;