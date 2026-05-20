export const TOP_PLAYERS_HOME_CARD_SCRIPT = `
(function(){
  function q(id){return document.getElementById(id)}
  function injectPolish(){
    if(document.getElementById('topPlayersPolishStyle'))return;
    var style=document.createElement('style');
    style.id='topPlayersPolishStyle';
    style.textContent='body:has(#topplayers.active) .top,body:has(#topplayers.active) .tabs{display:none!important}body:has(#topplayers.active) .content{height:100vh!important;padding:0!important;overflow:hidden!important}.top-players-page{gap:12px!important}.top-players-hero{min-height:154px!important;padding:18px 10px 14px 18px!important;grid-template-columns:minmax(0,1fr) 132px!important;gap:0!important;border-radius:30px!important}.top-players-hero h2{font-size:32px!important;margin-top:0!important}.top-players-hero p{max-width:205px!important;font-size:11px!important;margin-top:8px!important;line-height:1.34!important}.top-players-kicker,.top-players-mini-meta,.top-players-stats,.top-players-orbit,.top-players-crown-line{display:none!important}.top-players-hero-image{width:144px!important;height:144px!important;margin:-24px -26px 0 -2px!important;background:none!important;box-shadow:none!important;border-radius:0!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;overflow:visible!important}.top-players-hero-image img{object-fit:contain!important;filter:drop-shadow(0 20px 26px rgba(0,0,0,.34))!important}.top-players-hero:after{display:none!important}.top-players-hero:before{width:184px!important;height:184px!important;right:-58px!important;top:-72px!important;background:radial-gradient(circle,rgba(126,20,48,.38),rgba(126,20,48,.12) 44%,rgba(126,20,48,0) 70%)!important}.top-players-filters{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;margin:0 0 12px!important;position:relative!important;z-index:40!important;padding:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}.top-filter-card{position:relative!important;flex:0 0 auto!important;min-width:118px!important;height:38px!important;border:0!important;border-radius:18px!important;background:rgba(255,255,255,.055)!important;color:#fff!important;padding:0 31px 0 13px!important;display:flex!important;align-items:center!important;gap:7px!important;box-shadow:0 18px 42px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.10)!important;-webkit-backdrop-filter:blur(3px) saturate(1.18)!important;backdrop-filter:blur(3px) saturate(1.18)!important;overflow:hidden!important}.top-filter-card span{display:none!important}.top-filter-card select{min-width:0!important;width:100%!important;height:100%!important;background:transparent!important;border:0!important;outline:0!important;color:#fff!important;-webkit-text-fill-color:#fff!important;font-size:12px!important;font-weight:800!important;appearance:none!important;-webkit-appearance:none!important;padding:0!important}.top-filter-card:after{content:"⌄"!important;position:absolute!important;right:13px!important;top:50%!important;transform:translateY(-52%)!important;color:rgba(255,255,255,.78)!important;font-size:14px!important;line-height:1!important;pointer-events:none!important}.top-filter-card:focus-within{background:rgba(255,255,255,.075)!important}';
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
  function bind(){inject()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
  setTimeout(inject,120);
  setTimeout(inject,700);
})();
`;
