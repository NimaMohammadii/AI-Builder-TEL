import { PREDICT_TOOLBAR_SCRIPT } from './predict-toolbar-script';
import { PREDICT_CANDLE_SCRIPT } from './predict-candle-script';
import { PREDICT_HISTORY_GUARD_SCRIPT as PREDICT_HISTORY_SCRIPT } from './predict-history-guard-script';

const PREDICT_SETTINGS_SCRIPT = `
(function(){
  var CACHE_MS=60000;
  var lastLoadAt=0;
  var inFlight=null;
  var lastSettings=null;
  function apply(settings){
    var root=document.getElementById('predictzone');
    if(!root)return;
    settings=settings||{liveBetsEnabled:true,hiddenCards:{}};
    lastSettings=settings;
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
  function load(force){
    var now=Date.now();
    if(!force&&lastSettings&&lastLoadAt&&now-lastLoadAt<CACHE_MS){apply(lastSettings);return Promise.resolve(lastSettings)}
    if(inFlight)return inFlight;
    inFlight=fetch(settingsUrl(),{cache:'no-store'})
      .then(function(response){return response.json()})
      .then(function(settings){lastLoadAt=Date.now();apply(settings);return settings})
      .catch(function(){var fallback=lastSettings||{liveBetsEnabled:true,hiddenCards:{}};apply(fallback);return fallback})
      .finally(function(){inFlight=null});
    return inFlight;
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){load(false)});
  }else{
    load(false);
  }
  window.VexaReloadPredictSettings=function(){return load(true)};
})();
`;

export const PREDICT_ZONE_SETTINGS_SCRIPT = PREDICT_SETTINGS_SCRIPT + PREDICT_TOOLBAR_SCRIPT + PREDICT_CANDLE_SCRIPT + PREDICT_HISTORY_SCRIPT;
