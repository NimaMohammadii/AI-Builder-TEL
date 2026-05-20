export const TOP_PLAYERS_HOME_CARD_SCRIPT = `
(function(){
  function q(id){return document.getElementById(id)}
  function injectPolish(){
    if(document.getElementById('topPlayersPolishStyle'))return;
    var style=document.createElement('style');
    style.id='topPlayersPolishStyle';
    style.textContent='body:has(#topplayers.active) .top,body:has(#topplayers.active) .tabs{display:none!important}body:has(#topplayers.active) .content{height:100vh!important;padding:0!important;overflow:hidden!important}.top-players-page{gap:11px!important}.top-players-hero{min-height:188px!important;padding:20px 10px 18px 18px!important;grid-template-columns:minmax(0,1fr) 146px!important;gap:0!important}.top-players-hero h2{font-size:31px!important}.top-players-hero p{max-width:210px!important;font-size:10.5px!important;margin-top:8px!important}.top-players-stats{display:none!important}.top-players-hero-image{width:172px!important;height:172px!important;margin:-31px -31px 0 -2px!important;background:none!important;box-shadow:none!important;border-radius:0!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;overflow:visible!important}.top-players-hero-image img{object-fit:contain!important;filter:drop-shadow(0 24px 30px rgba(0,0,0,.42))!important}.top-players-mini-meta{display:flex!important;gap:7px!important;flex-wrap:wrap!important;margin-top:12px!important}.top-players-mini-meta span{height:25px!important;padding:0 9px!important;border-radius:999px!important;display:flex!important;align-items:center!important;background:rgba(255,255,255,.052)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.10)!important;color:rgba(255,255,255,.62)!important;font-size:8px!important;font-weight:850!important;text-transform:uppercase!important;letter-spacing:.08em!important;backdrop-filter:blur(3px)!important;-webkit-backdrop-filter:blur(3px)!important}.top-players-filters{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;margin:1px 0 3px!important}.top-filter-card{height:46px!important;border-radius:999px!important;background:rgba(255,255,255,.045)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.10),0 12px 28px rgba(0,0,0,.12)!important;backdrop-filter:blur(2px)!important;-webkit-backdrop-filter:blur(2px)!important;display:grid!important;grid-template-columns:auto minmax(0,1fr)!important;align-items:center!important;gap:6px!important;padding:0 11px!important;overflow:hidden!important}.top-filter-card span{color:rgba(255,255,255,.46)!important;font-size:8px!important;font-weight:900!important;text-transform:uppercase!important;letter-spacing:.12em!important;white-space:nowrap!important}.top-filter-card select{min-width:0!important;width:100%!important;background:transparent!important;border:0!important;outline:0!important;color:#fff!important;-webkit-text-fill-color:#fff!important;font-size:12px!important;font-weight:900!important;text-align:right!important;appearance:none!important;-webkit-appearance:none!important}.top-filter-card:after{content:"⌄"!important;color:rgba(255,255,255,.52)!important;font-size:12px!important;margin-left:-8px!important;pointer-events:none!important}.top-players-orbit,.top-players-crown-line{position:absolute!important;z-index:1!important;fill:none!important;stroke:rgba(255,255,255,.13)!important;stroke-width:2!important;stroke-linecap:round!important;stroke-linejoin:round!important;pointer-events:none!important}.top-players-orbit-a{width:106px!important;height:106px!important;right:78px!important;top:13px!important;opacity:.45!important;transform:rotate(-16deg)!important}.top-players-orbit-b{width:72px!important;height:72px!important;left:22px!important;bottom:18px!important;opacity:.25!important;transform:rotate(21deg)!important}.top-players-crown-line{width:160px!important;height:38px!important;right:12px!important;bottom:23px!important;opacity:.20!important;stroke:rgba(255,255,255,.16)!important}.top-players-hero:before{width:210px!important;height:210px!important;right:-66px!important;top:-82px!important;background:radial-gradient(circle,rgba(126,20,48,.46),rgba(126,20,48,.16) 44%,rgba(126,20,48,0) 70%)!important}.top-players-hero:after{content:""!important;position:absolute!important;left:22px!important;right:22px!important;bottom:18px!important;height:1px!important;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.16),rgba(255,255,255,0))!important;opacity:.9!important;pointer-events:none!important}';
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
