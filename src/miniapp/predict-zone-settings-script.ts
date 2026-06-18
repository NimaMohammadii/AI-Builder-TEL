import { PREDICT_TOOLBAR_SCRIPT } from './predict-toolbar-script';
import { PREDICT_CANDLE_SCRIPT } from './predict-candle-script';
import { PREDICT_HISTORY_GUARD_SCRIPT as PREDICT_HISTORY_SCRIPT } from './predict-history-guard-script';

const PREDICT_SETTINGS_SCRIPT = `
(function(){
  function apply(settings){
    var root=document.getElementById('predictzone');
    if(!root)return;
    settings=settings||{liveBetsEnabled:true,hiddenCards:{}};
    window.VexaPredictSettings=settings;
    root.classList.toggle('predict-live-bets-disabled', settings.liveBetsEnabled===false);
    try{window.dispatchEvent(new CustomEvent('vexa-predict-settings',{detail:settings}))}catch(e){}
  }
  function currentUserId(){
    var tg=window.Telegram&&window.Telegram.WebApp;
    var user=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{};
    return String(user.id||localStorage.getItem('ownerId')||'').trim();
  }
  function settingsUrl(){
    var uid=currentUserId();
    return uid?'/app/api/predict-settings?userId='+encodeURIComponent(uid):'/app/api/predict-settings';
  }
  function load(){
    fetch(settingsUrl(),{cache:'no-store'})
      .then(function(response){return response.json()})
      .then(apply)
      .catch(function(){apply({liveBetsEnabled:true,hiddenCards:{}})});
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',load);
  }else{
    load();
  }
  window.addEventListener('focus',load);
})();
`;

const PREDICT_MARKET_LOCK_SCRIPT = `
(function(){
  function ready(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn()}
  ready(function(){
    var root=document.getElementById('predictzone');
    if(!root||root.dataset.predictMarketLockReady==='1')return;
    root.dataset.predictMarketLockReady='1';
    var lockedSelector='#predictzone [data-predict-market="politics"],#predictzone [data-predict-market="fun"],#predictzone [data-vexa-predict-market="politics"],#predictzone [data-vexa-predict-market="fun"]';
    function trusted(){return window.VexaTrustedAccess===true}
    function refresh(){
      var open=trusted();
      root.classList.toggle('predict-zone-trusted-access',open);
      root.querySelectorAll('[data-predict-market="politics"],[data-predict-market="fun"],[data-vexa-predict-market="politics"],[data-vexa-predict-market="fun"]').forEach(function(tab){
        tab.classList.toggle('predict-market-locked',!open);
        if(open){tab.removeAttribute('aria-disabled')}else{tab.setAttribute('aria-disabled','true')}
      });
    }
    function onClick(event){
      var tab=event.target&&event.target.closest?event.target.closest(lockedSelector):null;
      if(!tab)return;
      refresh();
      if(trusted())return;
      event.preventDefault();
      event.stopPropagation();
      if(event.stopImmediatePropagation)event.stopImmediatePropagation();
    }
    if(!document.getElementById('predictMarketLockStyle')){
      var style=document.createElement('style');
      style.id='predictMarketLockStyle';
      style.textContent='#predictzone.predict-zone-trusted-access .predict-zone-category-card[data-predict-market="politics"] span:after,#predictzone.predict-zone-trusted-access .predict-zone-category-card[data-predict-market="fun"] span:after,#predictzone.predict-zone-trusted-access .predict-zone-category-card[data-vexa-predict-market="politics"] span:after,#predictzone.predict-zone-trusted-access .predict-zone-category-card[data-vexa-predict-market="fun"] span:after{display:none!important}#predictzone:not(.predict-zone-trusted-access) .predict-zone-category-card[data-predict-market="politics"],#predictzone:not(.predict-zone-trusted-access) .predict-zone-category-card[data-predict-market="fun"],#predictzone:not(.predict-zone-trusted-access) .predict-zone-category-card[data-vexa-predict-market="politics"],#predictzone:not(.predict-zone-trusted-access) .predict-zone-category-card[data-vexa-predict-market="fun"]{cursor:not-allowed}';
      document.head.appendChild(style);
    }
    refresh();
    root.addEventListener('click',onClick,true);
    window.addEventListener('vexa-section-locks-updated',refresh);
    window.addEventListener('vexa-predict-settings',function(){setTimeout(refresh,0)});
    window.addEventListener('focus',refresh);
  });
})();
`;

export const PREDICT_ZONE_SETTINGS_SCRIPT = PREDICT_SETTINGS_SCRIPT + PREDICT_TOOLBAR_SCRIPT + PREDICT_MARKET_LOCK_SCRIPT + PREDICT_CANDLE_SCRIPT + PREDICT_HISTORY_SCRIPT;
