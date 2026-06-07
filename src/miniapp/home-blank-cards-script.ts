export const HOME_BLANK_CARDS_SCRIPT = `
(function(){
  function q(id){return document.getElementById(id)}
  function addStyle(){
    var old=q('homeBlankCardsStyle');
    if(old)old.remove();
    var style=document.createElement('style');
    style.id='homeBlankCardsStyle';
    style.textContent=[
      '#home .home-rewards-entry,#home [data-action="open-rewards"],#rewardsPage{display:none!important;visibility:hidden!important;pointer-events:none!important;width:0!important;height:0!important;margin:0!important;padding:0!important;overflow:hidden!important}',
      '#home .home-blank-cards-wrap{position:relative;margin:18px 0 0;width:100%;overflow:visible!important;box-sizing:border-box}',
      '#home .home-blank-cards-track{display:flex;gap:12px;width:100%;overflow-x:auto;overflow-y:visible!important;-webkit-overflow-scrolling:touch;scrollbar-width:none;scroll-snap-type:x proximity;padding:0 2px 16px;box-sizing:border-box}',
      '#home .home-blank-cards-track::-webkit-scrollbar{display:none}',
      '#home .home-blank-card{flex:0 0 128px;height:164px;border:1px solid rgba(255,255,255,.16)!important;border-radius:30px;background:transparent!important;background-color:transparent!important;background-image:none!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 14px 34px rgba(0,0,0,.10)!important;backdrop-filter:blur(10px) saturate(1.24)!important;-webkit-backdrop-filter:blur(10px) saturate(1.24)!important;scroll-snap-align:start;box-sizing:border-box;overflow:hidden}',
      '#home .home-blank-card:before,#home .home-blank-card:after{display:none!important;content:none!important;background:none!important}'
    ].join('');
    document.head.appendChild(style);
  }
  function removeDailyPrize(){
    document.querySelectorAll('#home .home-rewards-entry,#home [data-action="open-rewards"],#rewardsPage').forEach(function(n){try{n.remove()}catch(e){}});
  }
  function addBlankCards(){
    var home=q('home');
    if(!home)return;
    if(q('homeBlankCardsWrap'))return;
    var wrap=document.createElement('div');
    wrap.id='homeBlankCardsWrap';
    wrap.className='home-blank-cards-wrap';
    var cards='';
    for(var i=0;i<7;i++)cards+='<div class="home-blank-card" aria-hidden="true"></div>';
    wrap.innerHTML='<div class="home-blank-cards-track">'+cards+'</div>';
    var finance=home.querySelector('.home-finance');
    var deposit=q('depositSheet');
    if(finance&&finance.parentNode)finance.parentNode.insertBefore(wrap,finance.nextSibling);
    else if(deposit&&deposit.parentNode)deposit.parentNode.insertBefore(wrap,deposit);
    else home.appendChild(wrap);
  }
  function run(){addStyle();removeDailyPrize();addBlankCards()}
  function observe(){
    if(window.__vexaHomeBlankCardsObserver)return;
    window.__vexaHomeBlankCardsObserver=true;
    if(window.MutationObserver)new MutationObserver(run).observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){run();observe()});else{run();observe()}
  setTimeout(run,120);setTimeout(run,500);setTimeout(run,1200);setTimeout(run,2500);
})();
`;