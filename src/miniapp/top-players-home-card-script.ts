export const TOP_PLAYERS_HOME_CARD_SCRIPT = `
(function(){
  function q(id){return document.getElementById(id)}
  function injectPolish(){
    if(document.getElementById('topPlayersPolishStyle'))return;
    var style=document.createElement('style');
    style.id='topPlayersPolishStyle';
    style.textContent='body:has(#topplayers.active) .top,body:has(#topplayers.active) .tabs{display:none!important}body:has(#topplayers.active) .content{height:100vh!important;padding:0!important;overflow:hidden!important}.top-players-hero{min-height:226px!important;padding:25px 10px 25px 18px!important;grid-template-columns:minmax(0,1fr) 162px!important;gap:0!important}.top-players-stats{display:none!important}.top-players-hero-image{width:190px!important;height:190px!important;margin:-30px -34px 0 -4px!important;background:none!important;box-shadow:none!important;border-radius:0!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;overflow:visible!important}.top-players-hero-image img{object-fit:contain!important;filter:drop-shadow(0 24px 30px rgba(0,0,0,.42))!important}.top-players-mini-meta{display:flex!important;gap:7px!important;flex-wrap:wrap!important;margin-top:18px!important}.top-players-mini-meta span{height:28px!important;padding:0 10px!important;border-radius:999px!important;display:flex!important;align-items:center!important;background:rgba(255,255,255,.052)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.10)!important;color:rgba(255,255,255,.62)!important;font-size:8.5px!important;font-weight:850!important;text-transform:uppercase!important;letter-spacing:.08em!important;backdrop-filter:blur(3px)!important;-webkit-backdrop-filter:blur(3px)!important}.top-players-orbit,.top-players-crown-line{position:absolute!important;z-index:1!important;fill:none!important;stroke:rgba(255,255,255,.13)!important;stroke-width:2!important;stroke-linecap:round!important;stroke-linejoin:round!important;pointer-events:none!important}.top-players-orbit-a{width:116px!important;height:116px!important;right:92px!important;top:18px!important;opacity:.45!important;transform:rotate(-16deg)!important}.top-players-orbit-b{width:82px!important;height:82px!important;left:22px!important;bottom:24px!important;opacity:.28!important;transform:rotate(21deg)!important}.top-players-crown-line{width:178px!important;height:42px!important;right:12px!important;bottom:30px!important;opacity:.22!important;stroke:rgba(255,255,255,.16)!important}.top-players-hero:before{width:230px!important;height:230px!important;right:-70px!important;top:-84px!important;background:radial-gradient(circle,rgba(126,20,48,.46),rgba(126,20,48,.16) 44%,rgba(126,20,48,0) 70%)!important}.top-players-hero:after{content:""!important;position:absolute!important;left:22px!important;right:22px!important;bottom:23px!important;height:1px!important;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.16),rgba(255,255,255,0))!important;opacity:.9!important;pointer-events:none!important}';
    document.head.appendChild(style);
  }
  function inject(){
    injectPolish();
    var home=q('home');
    if(!home||q('homeTopPlayersEntry'))return;
    var btn=document.createElement('button');
    btn.id='homeTopPlayersEntry';
    btn.className='home-top-players-entry';
    btn.type='button';
    btn.setAttribute('data-view','topplayers');
    btn.innerHTML='<span class="home-top-players-icon" aria-hidden="true">♛</span><span class="home-top-players-main"><span>Vexa League</span><strong>Top Players</strong><small>See the strongest players this week</small></span><span class="home-top-players-arrow" aria-hidden="true">›</span>';
    var rewards=home.querySelector('.home-rewards-entry');
    if(rewards&&rewards.parentNode)rewards.parentNode.insertBefore(btn,rewards.nextSibling);
    else home.appendChild(btn);
  }
  function isTopPlayersActive(){var n=q('topplayers');return !!(n&&n.classList.contains('active'))}
  function goHome(){
    var tab=document.querySelector('button[data-view="home"],.tab[data-view="home"]');
    if(tab&&typeof tab.click==='function'){tab.click();return}
    document.querySelectorAll('.view').forEach(function(n){n.classList.remove('active')});
    var home=q('home');if(home)home.classList.add('active');
    document.querySelectorAll('.tab').forEach(function(n){n.classList.toggle('active',n.getAttribute('data-view')==='home')});
    var title=q('brandTitle');if(title)title.textContent='Home';
  }
  function syncBackButton(){
    var tg=window.Telegram&&window.Telegram.WebApp;
    if(!tg||!tg.BackButton)return;
    try{tg.BackButton.offClick(goHome)}catch(e){}
    if(isTopPlayersActive()){
      try{tg.BackButton.onClick(goHome);tg.BackButton.show()}catch(e){}
    }else{
      try{tg.BackButton.hide()}catch(e){}
    }
  }
  function bind(){
    inject();
    syncBackButton();
    document.addEventListener('click',function(){setTimeout(syncBackButton,80);setTimeout(syncBackButton,260)},true);
    try{new MutationObserver(syncBackButton).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']})}catch(e){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
  setTimeout(inject,120);
  setTimeout(inject,700);
})();
`;
