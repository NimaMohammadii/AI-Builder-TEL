export const TOP_PLAYERS_HOME_CARD_SCRIPT = `
(function(){
  function q(id){return document.getElementById(id)}
  function injectPolish(){
    if(document.getElementById('topPlayersPolishStyle'))return;
    var style=document.createElement('style');
    style.id='topPlayersPolishStyle';
    style.textContent='body:has(#topplayers.active) .top,body:has(#topplayers.active) .tabs{display:none!important}body:has(#topplayers.active) .content{height:100vh!important;padding:0!important;overflow:hidden!important}.top-players-view{overflow:hidden!important;padding:calc(50px + env(safe-area-inset-top)) 18px calc(16px + env(safe-area-inset-bottom))!important}.top-players-page{height:100%!important;min-height:0!important;display:grid!important;grid-template-rows:auto auto minmax(0,1fr)!important;gap:8px!important}.top-players-hero{min-height:132px!important;padding:15px 10px 12px 17px!important;grid-template-columns:minmax(0,1fr) 118px!important;gap:0!important;border-radius:28px!important;box-shadow:0 18px 48px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.13)!important}.top-players-hero h2{font-size:30px!important;margin-top:0!important}.top-players-hero p{max-width:205px!important;font-size:10.5px!important;margin-top:7px!important;line-height:1.3!important}.top-players-kicker,.top-players-mini-meta,.top-players-stats,.top-players-orbit,.top-players-crown-line{display:none!important}.top-players-hero-image{width:132px!important;height:132px!important;margin:-25px -24px 0 -1px!important;background:none!important;box-shadow:none!important;border-radius:0!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;overflow:visible!important}.top-players-hero-image img{object-fit:contain!important;filter:drop-shadow(0 18px 24px rgba(0,0,0,.34))!important}.top-players-hero:after{display:none!important}.top-players-hero:before{width:174px!important;height:174px!important;right:-64px!important;top:-78px!important;background:radial-gradient(circle,rgba(126,20,48,.38),rgba(126,20,48,.12) 44%,rgba(126,20,48,0) 70%)!important}.top-players-filters{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;margin:0 0 2px!important;position:relative!important;z-index:40!important;padding:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}.top-filter-card{position:relative!important;flex:0 0 auto!important;width:auto!important;min-width:104px!important;height:34px!important;border:0!important;outline:0!important;border-radius:17px!important;background:rgba(255,255,255,.055)!important;color:#fff!important;padding:0 12px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;box-shadow:0 14px 34px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.10)!important;-webkit-backdrop-filter:blur(3px) saturate(1.18)!important;backdrop-filter:blur(3px) saturate(1.18)!important;overflow:hidden!important}.top-filter-card b{display:block!important;color:#fff!important;font-size:12px!important;font-weight:850!important;line-height:1!important;letter-spacing:-.015em!important;white-space:nowrap!important}.top-filter-card i{display:block!important;color:rgba(255,255,255,.72)!important;font-style:normal!important;font-size:12px!important;line-height:1!important;margin-top:-2px!important}.top-players-list{position:relative!important;min-height:0!important;display:grid!important;gap:8px!important;align-content:start!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior-y:contain!important;scrollbar-width:none!important;padding:0 0 54px!important;mask-image:linear-gradient(to bottom,#000 0,#000 calc(100% - 58px),rgba(0,0,0,0))!important;-webkit-mask-image:linear-gradient(to bottom,#000 0,#000 calc(100% - 58px),rgba(0,0,0,0))!important}.top-players-list::-webkit-scrollbar{display:none!important}#homeTopPlayersEntry,#home .home-top-players-entry{display:none!important}#home .home-intro-card{cursor:pointer;touch-action:manipulation}.top-players-view.top-players-soft-enter{animation:vexaTopPlayersIn .44s cubic-bezier(.18,.88,.24,1) both}.top-players-view.top-players-soft-enter .top-players-hero{animation:vexaTopPlayersHeroIn .48s cubic-bezier(.16,.9,.24,1) both}.top-players-view.top-players-soft-enter .top-players-filters,.top-players-view.top-players-soft-enter .top-players-list{animation:vexaTopPlayersContentIn .54s cubic-bezier(.16,.9,.24,1) both}@keyframes vexaTopPlayersIn{0%{opacity:0;transform:translateY(18px) scale(.975);filter:blur(7px)}62%{opacity:1;filter:blur(0)}100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}}@keyframes vexaTopPlayersHeroIn{0%{opacity:0;transform:translateY(20px) scale(.94)}100%{opacity:1;transform:translateY(0) scale(1)}}@keyframes vexaTopPlayersContentIn{0%{opacity:0;transform:translateY(16px)}38%{opacity:0;transform:translateY(16px)}100%{opacity:1;transform:translateY(0)}}';
    document.head.appendChild(style);
  }
  function showTopPlayersDirect(){
    document.querySelectorAll('.view').forEach(function(n){n.classList.remove('active')});
    var top=q('topplayers');
    if(top){
      top.classList.add('active','top-players-soft-enter');
      setTimeout(function(){try{top.classList.remove('top-players-soft-enter')}catch(e){}},560);
    }
    document.querySelectorAll('.tab').forEach(function(n){n.classList.remove('active')});
    var title=q('brandTitle');
    if(title)title.textContent='Top Players';
    document.body.classList.remove('header-glass-mode');
  }
  function openTopPlayers(){
    var card=q('home')&&q('home').querySelector('.home-intro-card');
    if(card&&card.__topPlayersOpening)return;
    if(card)card.__topPlayersOpening=true;
    showTopPlayersDirect();
    setTimeout(function(){if(card)card.__topPlayersOpening=false},620);
  }
  function bindHeroCard(){
    var home=q('home');
    if(!home)return;
    document.querySelectorAll('#homeTopPlayersEntry,#home .home-top-players-entry').forEach(function(n){try{n.remove()}catch(e){}});
    var card=home.querySelector('.home-intro-card');
    if(!card||card.getAttribute('data-top-players-bound')==='true')return;
    card.setAttribute('data-top-players-bound','true');
    card.setAttribute('role','button');
    card.setAttribute('tabindex','0');
    card.setAttribute('aria-label','Open Top Players');
    card.addEventListener('click',function(ev){ev.preventDefault();openTopPlayers()});
    card.addEventListener('keydown',function(ev){if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();openTopPlayers()}});
  }
  function inject(){
    injectPolish();
    bindHeroCard();
  }
  function bind(){inject()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
  setTimeout(inject,120);
  setTimeout(inject,700);
  setTimeout(inject,1500);
})();
`;