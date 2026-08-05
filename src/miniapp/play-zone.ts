import { livePlayersSeed, shouldShowLivePlayersOnCard } from './game-live-counts';

const playZoneGames = [
  ['mines', 'Mines', 'Reveal safe tiles and cash out', 'Play'],
  ['plinko', 'Plinko', 'Drop the ball and catch a multiplier', 'Play'],
  ['slot', 'Slot', 'Spin the reels and chase a winning combo', 'Play'],
  ['rps', 'Rock Paper Scissors', 'Choose rock, paper, or scissors', 'Play'],
  ['wheel', 'Wheel', 'Spin the wheel and hit a prize', 'Play'],
  ['dice', 'Dice', 'Roll the dice and beat the target', 'Play'],
  ['crash', 'Crash', 'Cash out before the line crashes', 'Play'],
  ['hilo', 'Chicken Cross', 'Cross the road and collect rewards', 'Play'],
  ['coinflip', 'Pump', 'Pump the multiplier before it pops', 'Play'],
  ['ghostrun', 'Ghost Run', 'Run through the dark and survive', 'Play'],
] as const;

const GAME_CARD_IMAGE_REVISION = '20260805-1';

function gameCardImageUrl(id: string): string {
  return `/app/api/game-card-image/${id}.png?v=${GAME_CARD_IMAGE_REVISION}`;
}

function gameCard([id, label, _description, action]: typeof playZoneGames[number], extraClass = ''): string {
  const imageUrl = gameCardImageUrl(id);
  const viewAttr = action === 'Play' ? `data-game-view="${id}"` : '';
  const footer = shouldShowLivePlayersOnCard(id) ? `<span class="game-footer game-footer-live"><span class="game-players" aria-label="Players online"><i></i><b>${livePlayersSeed(id)}</b><em>players</em></span></span>` : '';
  const countAttr = shouldShowLivePlayersOnCard(id) ? 'data-player-count-visible="true"' : 'data-player-count-visible="false"';

  return `
    <span class="game-card-shell ${extraClass}" data-play-zone-card-id="${id}" ${viewAttr} ${countAttr}>
      <button class="game-card game-card-live" type="button" ${viewAttr} aria-label="${label}">
        <span class="game-image">
          <img src="${imageUrl}" data-game-card-image-id="${id}" data-section-image-src="${imageUrl}" data-fallback-src="${imageUrl}" alt="${label}" decoding="async" loading="eager" onerror="this.onerror=null;this.src='/app/api/section-lock-image/${id}/locked.png?v=1'"/>
        </span>
      </button>
      ${footer}
    </span>
  `;
}

const PLAY_HUB_STORY_GRID_STYLES = `
#playzone.play-zone-view{padding-left:10px!important;padding-right:10px!important;overflow-x:hidden!important}
#playzone .play-zone-stage{width:100%!important;max-width:none!important;margin:0!important;padding:0!important;overflow:visible!important}
#playzone .play-zone-featured-row,#playzone .play-zone-grid-row{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;grid-auto-flow:row!important;align-items:start!important;gap:10px 8px!important;width:100%!important;max-width:none!important;margin:0!important;padding:0!important;overflow:visible!important;scroll-snap-type:none!important;transform:none!important}
#playzone .game-card-shell,#playzone .play-zone-featured-card{display:block!important;width:100%!important;min-width:0!important;max-width:none!important;height:auto!important;margin:0!important;padding:0!important;transform:none!important;scroll-snap-align:none!important}
#playzone .game-card{position:relative!important;display:block!important;width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;aspect-ratio:4/5!important;margin:0!important;padding:0!important;border-radius:17px!important;overflow:hidden!important;background:transparent!important}
#playzone .game-image{position:absolute!important;inset:0!important;display:block!important;width:100%!important;height:100%!important;margin:0!important;padding:0!important;border-radius:inherit!important;overflow:hidden!important}
#playzone .game-image img{display:block!important;width:100%!important;height:100%!important;min-width:0!important;min-height:0!important;object-fit:cover!important;object-position:center!important;border-radius:inherit!important}
#playzone .game-footer{display:flex!important;align-items:center!important;min-height:19px!important;margin:5px 2px 0!important;overflow:hidden!important}
#playzone .game-players{min-width:0!important;font-size:9px!important;gap:4px!important;white-space:nowrap!important}
#playzone .game-players em{font-size:8px!important}
@media(max-width:360px){#playzone.play-zone-view{padding-left:7px!important;padding-right:7px!important}#playzone .play-zone-featured-row,#playzone .play-zone-grid-row{gap:8px 6px!important}#playzone .game-card{border-radius:14px!important}}
`;

const GAME_CARD_IMAGE_GUARD_SCRIPT = `
<script>
(function(){
  var revision='${GAME_CARD_IMAGE_REVISION}';
  var root=document.getElementById('playzone');
  if(!root)return;
  function endpoint(id){return '/app/api/game-card-image/'+id+'.png?v='+revision}
  function repair(img,force){
    if(!img||img.tagName!=='IMG')return;
    var id=img.getAttribute('data-game-card-image-id');
    if(!id)return;
    var expectedPath='/app/api/game-card-image/'+id+'.png';
    var currentPath='';
    try{currentPath=new URL(img.getAttribute('src')||'',location.href).pathname}catch(e){}
    if(!force&&currentPath===expectedPath&&img.getAttribute('data-admin-bg-overridden')!=='1')return;
    var url=endpoint(id)+(force?'&t='+Date.now():'');
    img.removeAttribute('data-admin-bg-overridden');
    img.setAttribute('src',url);
    img.setAttribute('data-section-image-src',url);
    img.setAttribute('data-fallback-src',url);
    img.style.display='';
  }
  function repairAll(force){
    Array.prototype.forEach.call(root.querySelectorAll('img[data-game-card-image-id]'),function(img){repair(img,force)});
  }
  repairAll(true);
  new MutationObserver(function(records){
    records.forEach(function(record){if(record.type==='attributes')repair(record.target,false)});
  }).observe(root,{subtree:true,attributes:true,attributeFilter:['src','data-admin-bg-overridden']});
})();
</script>
`;

export const PLAY_ZONE_SECTION = `
<section id="playzone" class="view play-zone-view">
  <style id="playHubStoryGridStyles">${PLAY_HUB_STORY_GRID_STYLES}</style>
  <div class="play-zone-stage">
    <div class="play-zone-featured-row play-zone-grid-row">
      ${playZoneGames.map((game, index) => gameCard(game, `play-zone-featured-card play-zone-featured-card-${index + 1}`)).join('')}
    </div>
  </div>
  ${GAME_CARD_IMAGE_GUARD_SCRIPT}
</section>
`;
