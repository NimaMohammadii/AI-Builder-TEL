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
] as const;

const transparentPixel = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';

function gameCard([id, label, _description, action]: typeof playZoneGames[number], extraClass = ''): string {
  const fallback = `/app/api/section-lock-image/${id}/locked.png`;
  const viewAttr = action === 'Play' ? `data-game-view="${id}"` : '';
  const footer = shouldShowLivePlayersOnCard(id) ? `<span class="game-footer game-footer-live"><span class="game-players" aria-label="Players online"><i></i><b>${livePlayersSeed(id)}</b><em>players</em></span></span>` : '';
  const countAttr = shouldShowLivePlayersOnCard(id) ? 'data-player-count-visible="true"' : 'data-player-count-visible="false"';

  return `
    <span class="game-card-shell ${extraClass}" ${viewAttr} ${countAttr}>
      <button class="game-card game-card-live" type="button" ${viewAttr} aria-label="${label}">
        <span class="game-image">
          <img src="${transparentPixel}" data-section-image-src="${fallback}" data-fallback-src="${fallback}" alt="${label}" decoding="async" loading="eager" onerror="this.onerror=null;this.src=this.dataset.fallbackSrc||this.src"/>
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