export const PREDICT_ZONE_SETTINGS_SCRIPT = `
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
  function setupPredictBackButton(){
    var tg=window.Telegram&&window.Telegram.WebApp;
    if(!tg||!tg.BackButton||window.__vexaPredictBackReady)return;
    window.__vexaPredictBackReady=true;
    var back=tg.BackButton;
    function isPredictActive(){
      var root=document.getElementById('predictzone');
      return !!(root&&root.classList.contains('active'));
    }
    function goPlayZone(){
      if(!isPredictActive())return;
      var sheet=document.querySelector('#predictzone [data-predict-bet-sheet]');
      if(sheet){sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true');}
      var playButton=document.querySelector('[data-view="playzone"]');
      if(playButton)playButton.click();
      syncBackButton();
    }
    function syncBackButton(){
      try{if(isPredictActive())back.show();else back.hide();}catch(e){}
    }
    try{back.onClick(goPlayZone)}catch(e){}
    try{tg.onEvent&&tg.onEvent('backButtonClicked',goPlayZone)}catch(e){}
    document.addEventListener('click',function(){setTimeout(syncBackButton,40)},true);
    document.addEventListener('visibilitychange',syncBackButton);
    window.addEventListener('focus',syncBackButton);
    if(window.MutationObserver){
      var root=document.getElementById('predictzone');
      if(root)new MutationObserver(syncBackButton).observe(root,{attributes:true,attributeFilter:['class']});
    }
    syncBackButton();
    setTimeout(syncBackButton,120);
    setTimeout(syncBackButton,450);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){load();setupPredictBackButton();});else{load();setupPredictBackButton();}
  window.addEventListener('focus',load);
})();
`;