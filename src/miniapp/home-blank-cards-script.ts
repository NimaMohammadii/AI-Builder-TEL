export const HOME_BLANK_CARDS_SCRIPT = `
(function(){
  function q(id){return document.getElementById(id)}
  var scheduled=false;
  function addStyle(){
    var style=q('homeBlankCardsStyle');
    if(!style){
      style=document.createElement('style');
      style.id='homeBlankCardsStyle';
      document.head.appendChild(style);
    }
    style.textContent=[
      '#dailyRewardsMount,#dailyRewardsEntry,#dailyRewardsPage,#home .home-daily-rewards-entry,#home .home-rewards-entry,#home [data-action="open-daily-rewards"],#home [data-action="open-rewards"],#home button:has(.home-daily-rewards-main),#home button:has(.home-rewards-entry-main){display:none!important;visibility:hidden!important;pointer-events:none!important;width:0!important;height:0!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:hidden!important;opacity:0!important}',
      '#home .home-blank-cards-wrap{position:relative;margin:18px 0 0;width:100%;overflow:visible!important;box-sizing:border-box;z-index:2}',
      '#home .home-blank-cards-track{display:flex;gap:12px;width:100%;max-width:100%;overflow-x:auto;overflow-y:visible!important;-webkit-overflow-scrolling:touch;scrollbar-width:none;scroll-snap-type:x proximity;padding:0 18px 22px;box-sizing:border-box;overscroll-behavior-x:contain}',
      '#home .home-blank-cards-track::-webkit-scrollbar{display:none}',
      '#home .home-blank-card{flex:0 0 128px;height:164px;border:0!important;outline:0!important;border-radius:28px;background:rgba(255,255,255,.026)!important;background-image:none!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 16px 42px rgba(0,0,0,.24)!important;backdrop-filter:blur(3px) saturate(1.14)!important;-webkit-backdrop-filter:blur(3px) saturate(1.14)!important;scroll-snap-align:start;box-sizing:border-box;overflow:hidden}',
      '#home .home-blank-card:before,#home .home-blank-card:after{display:none!important;content:none!important;background:none!important;border:0!important;box-shadow:none!important}'
    ].join('');
  }
  function removeDailyPrize(){
    document.querySelectorAll('#dailyRewardsMount,#dailyRewardsEntry,#dailyRewardsPage,#home .home-daily-rewards-entry,#home .home-rewards-entry,#home [data-action="open-daily-rewards"],#home [data-action="open-rewards"]').forEach(function(n){try{n.remove()}catch(e){}});
    document.querySelectorAll('#home button').forEach(function(b){
      var txt=(b.textContent||'').toLowerCase();
      if(txt.indexOf('daily prize')>-1||txt.indexOf('daily rewards')>-1||txt.indexOf('rewards hub')>-1)try{b.remove()}catch(e){}
    });
    document.body.classList.remove('daily-rewards-open','rewards-open');
  }
  function addBlankCards(){
    var home=q('home');
    if(!home)return;
    var anchor=home.querySelector('.home-finance-split')||home.querySelector('.home-finance');
    var wrap=q('homeBlankCardsWrap');
    if(!wrap){
      wrap=document.createElement('div');
      wrap.id='homeBlankCardsWrap';
      wrap.className='home-blank-cards-wrap';
      var cards='';
      for(var i=0;i<7;i++)cards+='<div class="home-blank-card" aria-hidden="true"></div>';
      wrap.innerHTML='<div class="home-blank-cards-track">'+cards+'</div>';
    }
    if(anchor&&anchor.parentNode){
      if(wrap.parentNode!==anchor.parentNode||wrap.previousElementSibling!==anchor)anchor.parentNode.insertBefore(wrap,anchor.nextSibling);
    }else if(wrap.parentNode!==home){
      home.appendChild(wrap);
    }
  }
  function run(){scheduled=false;addStyle();removeDailyPrize();addBlankCards()}
  function schedule(){if(scheduled)return;scheduled=true;setTimeout(run,0)}
  function observe(){
    if(window.__vexaHomeBlankCardsObserver)return;
    window.__vexaHomeBlankCardsObserver=true;
    if(window.MutationObserver)new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){run();observe()});else{run();observe()}
  setTimeout(run,50);setTimeout(run,180);setTimeout(run,600);setTimeout(run,1400);setTimeout(run,3000);
})();
`;