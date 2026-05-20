export const TOP_PLAYERS_HOME_CARD_SCRIPT = `
(function(){
  function q(id){return document.getElementById(id)}
  function injectPolish(){
    if(document.getElementById('topPlayersPolishStyle'))return;
    var style=document.createElement('style');
    style.id='topPlayersPolishStyle';
    style.textContent='body:has(#topplayers.active) .top,body:has(#topplayers.active) .tabs{display:none!important}body:has(#topplayers.active) .content{height:100vh!important;padding:0!important;overflow:hidden!important}.top-players-page{gap:12px!important}.top-players-hero{min-height:176px!important;padding:22px 10px 18px 18px!important;grid-template-columns:minmax(0,1fr) 150px!important;gap:0!important}.top-players-hero h2{font-size:34px!important;margin-top:0!important}.top-players-hero p{max-width:222px!important;font-size:11px!important;margin-top:10px!important}.top-players-kicker,.top-players-mini-meta,.top-players-stats,.top-players-orbit,.top-players-crown-line{display:none!important}.top-players-hero-image{width:178px!important;height:178px!important;margin:-32px -34px 0 -2px!important;background:none!important;box-shadow:none!important;border-radius:0!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;overflow:visible!important}.top-players-hero-image img{object-fit:contain!important;filter:drop-shadow(0 24px 30px rgba(0,0,0,.42))!important}.top-players-hero:after{display:none!important}.top-players-hero:before{width:210px!important;height:210px!important;right:-74px!important;top:-86px!important;background:radial-gradient(circle,rgba(126,20,48,.38),rgba(126,20,48,.12) 44%,rgba(126,20,48,0) 70%)!important}.top-players-filters{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;margin:0 0 4px!important;padding:6px!important;border-radius:27px!important;background:rgba(255,255,255,.035)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.09),0 14px 32px rgba(0,0,0,.14)!important;backdrop-filter:blur(2px)!important;-webkit-backdrop-filter:blur(2px)!important}.top-filter-card{height:42px!important;border-radius:22px!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;display:grid!important;grid-template-columns:auto minmax(0,1fr)!important;align-items:center!important;gap:7px!important;padding:0 11px!important;overflow:hidden!important}.top-filter-card:first-child{background:rgba(255,255,255,.045)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important}.top-filter-card span{color:rgba(255,255,255,.38)!important;font-size:7.5px!important;font-weight:900!important;text-transform:uppercase!important;letter-spacing:.13em!important;white-space:nowrap!important}.top-filter-card select{min-width:0!important;width:100%!important;background:transparent!important;border:0!important;outline:0!important;color:#fff!important;-webkit-text-fill-color:#fff!important;font-size:12px!important;font-weight:900!important;text-align:right!important;appearance:none!important;-webkit-appearance:none!important;padding-right:12px!important}.top-filter-card:after{content:"⌄"!important;color:rgba(255,255,255,.46)!important;font-size:12px!important;margin-left:-13px!important;pointer-events:none!important}.top-filter-card:focus-within{background:rgba(126,20,48,.13)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.10)!important}';
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
