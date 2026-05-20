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
  function setupGameBackButton(){
    var tg=window.Telegram&&window.Telegram.WebApp;
    if(!tg||!tg.BackButton||window.__vexaGameBackReady)return;
    window.__vexaGameBackReady=true;
    var back=tg.BackButton;
    var originalHide=back.hide&&back.hide.bind(back);
    var originalShow=back.show&&back.show.bind(back);
    var backTarget='';
    function activeGameId(){
      var ids=['predictzone','crash','plinko','mines','topplayers'];
      for(var i=0;i<ids.length;i++){
        var node=document.getElementById(ids[i]);
        if(node&&node.classList.contains('active'))return ids[i];
      }
      if(document.body.classList.contains('rewards-open')||document.getElementById('rewardsPage'))return 'rewards';
      return '';
    }
    function targetFor(id){
      if(id==='predictzone'||id==='crash'||id==='plinko'||id==='mines'||id==='topplayers')return 'playzone';
      if(id==='rewards')return 'home';
      return '';
    }
    function isBackSectionActive(){return !!activeGameId();}
    if(originalHide&&!back.__vexaGameHideGuarded){
      back.__vexaGameHideGuarded=true;
      back.hide=function(){
        if(isBackSectionActive())return;
        return originalHide();
      };
    }
    function goBackSection(){
      var active=activeGameId()||backTarget;
      var target=targetFor(active)||backTarget;
      if(!target)return;
      if(active==='predictzone'){
        var sheet=document.querySelector('#predictzone [data-predict-bet-sheet]');
        if(sheet){sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true');}
      }
      if(active==='rewards'){
        document.body.classList.remove('rewards-open');
        var rewards=document.getElementById('rewardsPage');
        if(rewards&&rewards.parentNode)try{rewards.parentNode.removeChild(rewards)}catch(e){}
      }
      var button=document.querySelector('[data-view="'+target+'"]');
      if(button)button.click();
      try{if(originalHide)originalHide();else back.hide();}catch(e){}
    }
    function syncBackButton(){
      var active=activeGameId();
      backTarget=targetFor(active);
      try{
        if(active&&backTarget){if(originalShow)originalShow();else back.show();}
        else if(originalHide){originalHide();}
        else back.hide();
      }catch(e){}
    }
    try{back.onClick(goBackSection)}catch(e){}
    try{tg.onEvent&&tg.onEvent('backButtonClicked',goBackSection)}catch(e){}
    document.addEventListener('click',function(){setTimeout(syncBackButton,40);setTimeout(syncBackButton,160);setTimeout(syncBackButton,360)},true);
    document.addEventListener('visibilitychange',syncBackButton);
    window.addEventListener('focus',syncBackButton);
    if(window.MutationObserver){
      ['predictzone','crash','plinko','mines','topplayers'].forEach(function(id){
        var node=document.getElementById(id);
        if(node)new MutationObserver(syncBackButton).observe(node,{attributes:true,attributeFilter:['class']});
      });
      new MutationObserver(syncBackButton).observe(document.body,{attributes:true,attributeFilter:['class']});
    }
    syncBackButton();
    setTimeout(syncBackButton,120);
    setTimeout(syncBackButton,450);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){load();setupGameBackButton();});else{load();setupGameBackButton();}
  window.addEventListener('focus',load);
})();
`;