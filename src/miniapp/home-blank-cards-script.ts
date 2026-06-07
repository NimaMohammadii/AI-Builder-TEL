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
    style.textContent='#dailyRewardsEntry,#dailyRewardsPage,#rewardsPage,#home .home-daily-rewards-entry,#home .home-rewards-entry,#home [data-action="open-daily-rewards"],#home [data-action="open-rewards"],#home button:has(.home-daily-rewards-main),#home button:has(.home-rewards-entry-main){display:none!important;visibility:hidden!important;pointer-events:none!important;width:0!important;height:0!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:hidden!important;opacity:0!important}';
  }
  function removeLegacyDailyPrize(){
    document.querySelectorAll('#dailyRewardsEntry,#dailyRewardsPage,#rewardsPage,#home .home-daily-rewards-entry,#home .home-rewards-entry,#home [data-action="open-daily-rewards"],#home [data-action="open-rewards"]').forEach(function(n){try{n.remove()}catch(e){}});
    document.body.classList.remove('daily-rewards-open','rewards-open');
  }
  function addDailyCardsMount(){
    var home=q('home');
    if(!home)return;
    document.querySelectorAll('#homeBlankCardsWrap').forEach(function(n){try{n.remove()}catch(e){}});
    var wrap=q('dailyRewardsMount');
    if(!wrap){
      wrap=document.createElement('section');
      wrap.id='dailyRewardsMount';
      wrap.className='home-daily-rewards-section';
      wrap.setAttribute('aria-labelledby','dailyRewardsHomeTitle');
      wrap.innerHTML='<div class="home-daily-rewards-head"><div><p class="home-daily-rewards-kicker">Daily Rewards</p><h2 id="dailyRewardsHomeTitle">Daily Prize</h2></div><span id="dailyRewardsHomeStatus" class="home-daily-rewards-status">7 days</span></div><div id="dailyRewardsDays" class="daily-rewards-days home-daily-rewards-days" aria-label="Daily reward days"></div>';
    }
    var anchor=home.querySelector('.home-finance-split')||home.querySelector('.home-finance');
    var deposit=q('depositSheet');
    if(anchor&&anchor.parentNode){
      if(wrap.parentNode!==anchor.parentNode||wrap.previousElementSibling!==anchor)anchor.parentNode.insertBefore(wrap,anchor.nextSibling);
    }else if(deposit&&deposit.parentNode){
      if(wrap.parentNode!==deposit.parentNode||wrap.nextElementSibling!==deposit)deposit.parentNode.insertBefore(wrap,deposit);
    }else if(wrap.parentNode!==home){
      home.appendChild(wrap);
    }
  }
  function run(){scheduled=false;addStyle();removeLegacyDailyPrize();addDailyCardsMount()}
  function schedule(){if(scheduled)return;scheduled=true;setTimeout(run,0)}
  function observe(){
    if(window.__vexaHomeDailyCardsObserver)return;
    window.__vexaHomeDailyCardsObserver=true;
    if(window.MutationObserver)new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){run();observe()});else{run();observe()}
  setTimeout(run,50);setTimeout(run,180);setTimeout(run,600);setTimeout(run,1400);setTimeout(run,3000);
})();
`;
