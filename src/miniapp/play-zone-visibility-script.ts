export const PLAY_ZONE_VISIBILITY_SCRIPT = `
(function(){
  var endpoint='/app/api/play-zone-cards';
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
    var hidden={};
    (payload&&payload.cards||[]).forEach(function(card){hidden[String(card.id)]=card.visible===false});
    document.querySelectorAll('#playzone [data-play-zone-card-id]').forEach(function(card){
      var id=card.getAttribute('data-play-zone-card-id')||'';
      setCard(card,!hidden[id]);
    });
  }
  function refresh(){
    if(window.VexaTrustedAccess===true){apply({cards:[]});return}
    var uid=currentUserId();
    var url=endpoint+(uid?'?userId='+encodeURIComponent(uid):'');
    fetch(url,{credentials:'same-origin',cache:'no-store'})
      .then(function(r){return r.ok?r.json():null})
      .then(function(j){if(j)apply(j)})
      .catch(function(){});
  }
  window.VexaRefreshPlayZoneCards=refresh;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh);else refresh();
  document.addEventListener('visibilitychange',function(){if(!document.hidden)refresh()});
})();
`;
