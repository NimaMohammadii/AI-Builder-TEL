export const TELEGRAM_BACK_BUTTON_SCRIPT = `
(function(){
  function setupTelegramBackButton(){
    var tg=window.Telegram&&window.Telegram.WebApp;
    if(!tg||!tg.BackButton||window.__vexaTelegramBackReady)return;
    window.__vexaTelegramBackReady=true;
    var back=tg.BackButton;
    var originalHide=back.hide&&back.hide.bind(back);
    var originalShow=back.show&&back.show.bind(back);
    var backTarget='';
    var backSections=['predictzone','crash','plinko','mines','slot','topplayers','wheel','dice','rps','referral'];
    function isDailyRewardsOpen(){
      var page=document.getElementById('dailyRewardsPage');
      return document.body.classList.contains('daily-rewards-open')||!!(page&&page.classList.contains('open'));
    }
    function activeBackSection(){
      for(var i=0;i<backSections.length;i++){
        var node=document.getElementById(backSections[i]);
        if(node&&node.classList.contains('active'))return backSections[i];
      }
      if(isDailyRewardsOpen()||document.body.classList.contains('rewards-open')||document.getElementById('rewardsPage'))return 'rewards';
      return '';
    }
    function targetFor(section){
      if(section==='topplayers'||section==='referral')return 'home';
      if(section==='predictzone'||section==='crash'||section==='plinko'||section==='mines'||section==='slot'||section==='wheel'||section==='dice'||section==='rps')return 'playzone';
      if(section==='rewards')return 'home';
      return '';
    }
    function hasBackSection(){return !!activeBackSection();}
    if(originalHide&&!back.__vexaBackHideGuarded){
      back.__vexaBackHideGuarded=true;
      back.hide=function(){
        if(hasBackSection())return;
        return originalHide();
      };
    }
    function closeOverlays(section){
      if(section==='predictzone'){
        var predict=document.getElementById('predictzone');
        if(predict&&predict.classList.contains('football-match-detail-open')&&window.VexaFootballPredictBack){
          try{if(window.VexaFootballPredictBack())return true}catch(e){}
        }
        var sheet=document.querySelector('#predictzone [data-predict-bet-sheet]');
        if(sheet){sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true');}
      }
      if(section==='rewards'){
        document.body.classList.remove('daily-rewards-open');
        var daily=document.getElementById('dailyRewardsPage');
        if(daily){daily.classList.remove('open');daily.setAttribute('aria-hidden','true');}
        document.body.classList.remove('rewards-open');
        var rewards=document.getElementById('rewardsPage');
        if(rewards&&rewards.parentNode)try{rewards.parentNode.removeChild(rewards)}catch(e){}
      }
      return false;
    }
    function goBack(){
      var section=activeBackSection()||backTarget;
      var target=targetFor(section)||backTarget;
      if(!target)return;
      if(closeOverlays(section)){syncBackButton();return;}
      var button=document.querySelector('[data-view="'+target+'"]');
      if(button)button.click();
      else{
        document.querySelectorAll('.view').forEach(function(n){n.classList.remove('active')});
        var home=document.getElementById(target);
        if(home)home.classList.add('active');
        document.querySelectorAll('.tab').forEach(function(n){n.classList.toggle('active',n.getAttribute('data-view')===target)});
        var title=document.getElementById('brandTitle');
        if(title)title.textContent=target==='home'?'Home':'Vexa';
      }
      try{if(originalHide)originalHide();else back.hide();}catch(e){}
    }
    function syncBackButton(){
      var section=activeBackSection();
      backTarget=targetFor(section);
      try{
        if(section&&backTarget){if(originalShow)originalShow();else back.show();}
        else if(originalHide){originalHide();}
        else back.hide();
      }catch(e){}
    }
    try{back.onClick(goBack)}catch(e){}
    try{tg.onEvent&&tg.onEvent('backButtonClicked',goBack)}catch(e){}
    document.addEventListener('click',function(){setTimeout(syncBackButton,40);setTimeout(syncBackButton,160);setTimeout(syncBackButton,360)},true);
    document.addEventListener('visibilitychange',syncBackButton);
    window.addEventListener('focus',syncBackButton);
    window.addEventListener('vexa-football-detail-change',syncBackButton);
    if(window.MutationObserver){
      backSections.forEach(function(id){
        var node=document.getElementById(id);
        if(node)new MutationObserver(syncBackButton).observe(node,{attributes:true,attributeFilter:['class']});
      });
      new MutationObserver(syncBackButton).observe(document.body,{attributes:true,attributeFilter:['class']});
    }
    syncBackButton();
    setTimeout(syncBackButton,120);
    setTimeout(syncBackButton,450);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setupTelegramBackButton);else setupTelegramBackButton();
})();
`;