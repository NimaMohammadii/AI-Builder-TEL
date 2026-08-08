import { livePlayersSeed, shouldShowLivePlayersOnCard } from './game-live-counts';

const playZoneGames = [
  ['mines', 'Mines', 'Reveal safe tiles and cash out', 'Play'],
  ['plinko', 'Plinko', 'Drop the ball and catch a multiplier', 'Play'],
  ['wheel', 'Wheel', 'Spin the wheel and hit a prize', 'Play'],
  ['slot', 'Slot', 'Spin the reels and chase a winning combo', 'Play'],
  ['ghostrun', 'Ghost Run', 'Run through the dark and survive', 'Play'],
  ['crash', 'Crash', 'Cash out before the line crashes', 'Play'],
  ['dice', 'Dice', 'Roll the dice and beat the target', 'Play'],
  ['hilo', 'Chicken Cross', 'Cross the road and collect rewards', 'Play'],
  ['coinflip', 'Pump', 'Pump the multiplier before it pops', 'Play'],
] as const;

function stableCardImageUrl(id: string): string {
  return `/app/api/game-card-image/${id}.png`;
}

function gameCard([id, label, _description, action]: typeof playZoneGames[number], extraClass = ''): string {
  const fallback = stableCardImageUrl(id);
  const initialSrc = fallback;
  const viewAttr = action === 'Play' ? `data-game-view="${id}"` : '';
  const footer = shouldShowLivePlayersOnCard(id) ? `<span class="game-footer game-footer-live"><span class="game-players" aria-label="Players online"><i></i><b>${livePlayersSeed(id)}</b><em>players</em></span></span>` : '';
  const countAttr = shouldShowLivePlayersOnCard(id) ? 'data-player-count-visible="true"' : 'data-player-count-visible="false"';

  return `
    <span class="game-card-shell ${extraClass}" data-play-zone-card-id="${id}" ${viewAttr} ${countAttr}>
      <button class="game-card game-card-live" type="button" ${viewAttr} aria-label="${label}">
        <span class="game-image">
          <img src="${initialSrc}" data-section-image-src="${fallback}" data-fallback-src="${fallback}" alt="${label}" decoding="async" loading="eager" onerror="this.onerror=null;this.src=this.dataset.fallbackSrc||this.src"/>
        </span>
      </button>
      ${footer}
    </span>
  `;
}

export const PLAY_ZONE_SECTION = `
<section id="playzone" class="view play-zone-view">
  <div class="play-zone-stage">
    <div class="play-zone-featured-row play-zone-grid-row">
      ${playZoneGames.map((game, index) => gameCard(game, `play-zone-featured-card play-zone-featured-card-${index + 1}`)).join('')}
    </div>
  </div>
</section>
`;

export const PLAY_ZONE_VISIBILITY_SCRIPT = `
(function(){
  var root=document.documentElement;
  var loaded=false;
  var inFlight=null;
  function finish(hidden,admin){
    var blocked={};(hidden||[]).forEach(function(id){blocked[String(id)]=true});
    document.querySelectorAll('[data-play-zone-card-id]').forEach(function(card){
      var hide=!admin&&blocked[card.getAttribute('data-play-zone-card-id')];
      card.hidden=!!hide;card.setAttribute('aria-hidden',hide?'true':'false');
    });
    root.classList.add('play-zone-visibility-ready');
  }
  function load(){
    if(loaded)return Promise.resolve();
    if(inFlight)return inFlight;
    var tg=window.Telegram&&window.Telegram.WebApp;
    var initData=String(tg&&tg.initData||'');
    if(!initData)return Promise.resolve();
    inFlight=fetch('/app/api/play-zone-card-visibility',{method:'POST',cache:'no-store',headers:{'content-type':'application/json'},body:JSON.stringify({initData:initData})})
      .then(function(r){if(!r.ok)throw new Error('unauthorized');return r.json()})
      .then(function(data){loaded=true;finish(data.hiddenIds,data.admin)}).catch(function(){}).finally(function(){inFlight=null});
    return inFlight;
  }
  function active(){var el=document.getElementById('playzone');return !!(el&&el.classList.contains('active'))}
  function loadIfActive(){if(active())load()}
  window.addEventListener('vexa:view-changed',function(ev){if(ev&&ev.detail&&ev.detail.id==='playzone')load()});
  if(window.MutationObserver){var play=document.getElementById('playzone');if(play)new MutationObserver(loadIfActive).observe(play,{attributes:true,attributeFilter:['class']})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadIfActive);else loadIfActive();
})();`;
