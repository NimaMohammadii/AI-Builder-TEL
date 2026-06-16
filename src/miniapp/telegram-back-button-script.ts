export const TELEGRAM_BACK_BUTTON_SCRIPT = `
(function(){
  function ready(){
    var tg=window.Telegram&&window.Telegram.WebApp;
    if(!tg||!tg.BackButton||window.__vexaTelegramBackReady)return;
    window.__vexaTelegramBackReady=true;
    var back=tg.BackButton;
    function show(){try{back.show()}catch(e){}}
    function hide(){try{back.hide()}catch(e){}}
    function active(id){var n=document.getElementById(id);return !!(n&&n.classList.contains('active'))}
    function setView(id){
      document.querySelectorAll('.view').forEach(function(n){n.classList.remove('active')});
      var v=document.getElementById(id);if(v)v.classList.add('active');
      document.querySelectorAll('.tab').forEach(function(n){n.classList.toggle('active',n.getAttribute('data-view')===id)});
      var title=document.getElementById('brandTitle');if(title)title.textContent=id==='home'?'Home':'Vexa';
    }
    function goBack(){
      if(active('dailyrewardsinfo')){
        if(window.__vexaCloseDailyInfo){try{if(window.__vexaCloseDailyInfo())return}catch(e){}}
        var guide=document.getElementById('dailyrewardsinfo');if(guide){guide.classList.remove('active');guide.setAttribute('aria-hidden','true');hide();return;}
      }
      var predict=document.getElementById('predictzone');
      if(predict&&predict.classList.contains('active')&&(predict.classList.contains('predict-market-detail-mode')||predict.classList.contains('football-match-detail-open'))){
        if(window.VexaPredictBack){try{if(window.VexaPredictBack())return}catch(e){}}
        if(window.VexaFootballPredictBack){try{if(window.VexaFootballPredictBack())return}catch(e){}}
        show();return;
      }
      var games=['crash','plinko','mines','slot','wheel','dice','rps'];
      for(var i=0;i<games.length;i++){if(active(games[i])){setView('playzone');hide();return;}}
      if(active('topplayers')||active('referral')){setView('home');hide();return;}
      hide();
    }
    function sync(){
      var needs=active('dailyrewardsinfo')||active('topplayers')||active('referral')||active('crash')||active('plinko')||active('mines')||active('slot')||active('wheel')||active('dice')||active('rps');
      var predict=document.getElementById('predictzone');
      if(predict&&predict.classList.contains('active')&&(predict.classList.contains('predict-market-detail-mode')||predict.classList.contains('football-match-detail-open')))needs=true;
      needs?show():hide();
    }
    try{back.onClick(goBack)}catch(e){}
    try{tg.onEvent&&tg.onEvent('backButtonClicked',goBack)}catch(e){}
    document.addEventListener('click',function(){setTimeout(sync,50);setTimeout(sync,200)},true);
    document.addEventListener('visibilitychange',sync);
    window.addEventListener('focus',sync);
    if(window.MutationObserver)new MutationObserver(sync).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});
    sync();setTimeout(sync,250);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
`;