import { PREDICT_TOOLBAR_SCRIPT } from './predict-toolbar-script';
import { PREDICT_CANDLE_SCRIPT } from './predict-candle-script';
import { PREDICT_HISTORY_GUARD_SCRIPT as PREDICT_HISTORY_SCRIPT } from './predict-history-guard-script';

const PREDICT_SETTINGS_SCRIPT = `
(function(){
  if(!window.__vexaPredictLazyFetchGuard){
    window.__vexaPredictLazyFetchGuard=1;
    (function(){
      var nativeFetch=window.fetch&&window.fetch.bind(window);
      var waiting={};
      var inFlight={};
      var recent={};
      if(!nativeFetch)return;
      function urlOf(input){return String((input&&input.url)||input||'')}
      function methodOf(input,init){return String((init&&init.method)||(input&&input.method)||'GET').toUpperCase()}
      function isPredictApi(input){var url=urlOf(input);return url.indexOf('/app/api/predict-settings')>=0||url.indexOf('/app/api/predict-markets')>=0||url.indexOf('/app/api/predict-crypto-card-images')>=0||url.indexOf('/app/api/predict-button-images')>=0||url.indexOf('/app/api/predict-round')>=0}
      function recentTtl(key){return key.indexOf('/app/api/predict-round')>=0?2500:0}
      function isPredictActive(){var root=document.getElementById('predictzone');return !!(root&&root.classList.contains('active')&&!document.hidden)}
      function sharedFetch(input,init){
        if(methodOf(input,init)!=='GET')return nativeFetch(input,init);
        var key=urlOf(input),now=Date.now(),ttl=recentTtl(key),cached=recent[key];
        if(ttl&&cached&&now-cached.t<ttl)return Promise.resolve(cached.response.clone());
        var hit=inFlight[key];if(hit)return hit.then(function(r){return r.clone()});
        var base=nativeFetch(input,init).then(function(response){if(ttl)recent[key]={t:Date.now(),response:response.clone()};return response});
        inFlight[key]=base.then(function(r){return r.clone()}).finally(function(){delete inFlight[key]});
        return base;
      }
      function flush(){
        if(!isPredictActive())return;
        var jobs=waiting;waiting={};
        Object.keys(jobs).forEach(function(key){var job=jobs[key];sharedFetch(job.input,job.init).then(function(response){job.clients.forEach(function(client){client.resolve(response.clone())})},function(error){job.clients.forEach(function(client){client.reject(error)})})});
      }
      window.fetch=function(input,init){
        if(!isPredictApi(input))return nativeFetch(input,init);
        if(isPredictActive())return sharedFetch(input,init);
        if(methodOf(input,init)!=='GET')return nativeFetch(input,init);
        var key=urlOf(input);
        return new Promise(function(resolve,reject){var job=waiting[key];if(!job){job=waiting[key]={input:input,init:init,clients:[]}}job.clients.push({resolve:resolve,reject:reject})});
      };
      document.addEventListener('click',function(ev){var target=ev.target&&ev.target.closest?ev.target.closest('[data-view="predictzone"],[data-view="predict"]'):null;if(target)queueMicrotask(flush)},true);
      document.addEventListener('visibilitychange',function(){if(!document.hidden)queueMicrotask(flush)});
      if(window.MutationObserver){var root=document.getElementById('predictzone');if(root)new MutationObserver(flush).observe(root,{attributes:true,attributeFilter:['class']})}
    })();
  }
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
  window.addEventListener('focus',function(){load(false)});
  window.VexaReloadPredictSettings=function(){return load(true)};
})();
`;

export const PREDICT_ZONE_SETTINGS_SCRIPT = PREDICT_SETTINGS_SCRIPT + PREDICT_TOOLBAR_SCRIPT + PREDICT_CANDLE_SCRIPT + PREDICT_HISTORY_SCRIPT;