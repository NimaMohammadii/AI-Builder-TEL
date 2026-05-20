export const TOP_PLAYERS_HOME_CARD_SCRIPT = `
(function(){
  function inject(){
    var home=document.getElementById('home');
    if(!home||document.getElementById('homeTopPlayersEntry'))return;
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
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);else inject();
  setTimeout(inject,120);
  setTimeout(inject,700);
})();
`;
