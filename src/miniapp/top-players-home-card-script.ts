export const TOP_PLAYERS_HOME_CARD_SCRIPT = `
(function(){
  function q(id){return document.getElementById(id)}
  function inject(){
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
