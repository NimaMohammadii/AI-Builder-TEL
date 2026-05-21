import { PREDICT_TOOLBAR_SCRIPT } from './predict-toolbar-script';
import { PREDICT_CANDLE_SCRIPT } from './predict-candle-script';
import { PREDICT_HISTORY_GUARD_SCRIPT as PREDICT_HISTORY_SCRIPT } from './predict-history-guard-script';

const PREDICT_SETTINGS_SCRIPT = `
(function(){
  function apply(settings){
    var root=document.getElementById('predictzone');
    if(!root)return;
    root.classList.toggle('predict-live-bets-disabled', settings&&settings.liveBetsEnabled===false);
  }
  function load(){
    fetch('/app/api/predict-settings',{cache:'no-store'})
      .then(function(response){return response.json()})
      .then(apply)
      .catch(function(){apply({liveBetsEnabled:true})});
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',load);
  }else{
    load();
  }
  window.addEventListener('focus',load);
})();
`;

export const PREDICT_ZONE_SETTINGS_SCRIPT = PREDICT_SETTINGS_SCRIPT + PREDICT_TOOLBAR_SCRIPT + PREDICT_CANDLE_SCRIPT + PREDICT_HISTORY_SCRIPT;
