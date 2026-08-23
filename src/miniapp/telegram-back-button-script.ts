export const TELEGRAM_BACK_BUTTON_SCRIPT = `
(function(){
  function setup(){
    var tg=window.Telegram&&window.Telegram.WebApp;
    if(!tg||!tg.BackButton||window.__vexaTelegramBackReady)return;
    window.__vexaTelegramBackReady=true;
    var back=tg.BackButton;
    var originalShow=back.show&&back.show.bind(back);
    var originalHide=back.hide&&back.hide.bind(back);
    function isActive(id){var n=document.getElementById(id);return !!(n&&n.classList.contains('active'))}
    function show(){try{if(originalShow)originalShow();else back.show()}catch(e){}}
    function hide(){try{if(originalHide)originalHide();else back.hide()}catch(e){}}
    function setView(id){
      document.querySelectorAll('.view').forEach(function(n){n.classList.remove('active')});
      var v=document.getElementById(id);if(v)v.classList.add('active');
      document.querySelectorAll('.tab').forEach(function(n){n.classList.toggle('active',n.getAttribute('data-view')===id)});
      var title=document.getElementById('brandTitle');if(title)title.textContent=id==='home'?'Home':'Vexa';
    }
    function shouldShow(){
      var games=['crash','plinko','mines','slot','wheel','dice','ghostrun','coinflip'];
      for(var i=0;i<games.length;i++)if(isActive(games[i]))return true;
      var p=document.getElementById('predictzone');
      return !!(p&&p.classList.contains('active')&&(p.classList.contains('predict-market-detail-mode')||p.classList.contains('football-match-detail-open')));
    }
    if(originalHide&&!back.__vexaBackHideGuarded){
      back.__vexaBackHideGuarded=true;
      back.hide=function(){if(shouldShow())return;return originalHide()};
    }
    function goBack(){
      var p=document.getElementById('predictzone');
      if(p&&p.classList.contains('active')&&(p.classList.contains('predict-market-detail-mode')||p.classList.contains('football-match-detail-open'))){
        if(window.VexaPredictBack){try{if(window.VexaPredictBack()){setTimeout(sync,60);return}}catch(e){}}
        if(window.VexaFootballPredictBack){try{if(window.VexaFootballPredictBack()){setTimeout(sync,60);return}}catch(e){}}
        sync();return;
      }
      var games=['crash','plinko','mines','slot','wheel','dice','ghostrun','coinflip'];
      for(var i=0;i<games.length;i++){if(isActive(games[i])){setView('playzone');sync();return;}}
      sync();
    }
    function sync(){shouldShow()?show():hide()}
    try{back.onClick(goBack)}catch(e){}
    try{tg.onEvent&&tg.onEvent('backButtonClicked',goBack)}catch(e){}
    document.addEventListener('click',function(){setTimeout(sync,40);setTimeout(sync,180);setTimeout(sync,360)},true);
    window.addEventListener('focus',sync);
    document.addEventListener('visibilitychange',sync);
    if(window.MutationObserver)new MutationObserver(sync).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});
    sync();setTimeout(sync,200);setTimeout(sync,500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
`;
