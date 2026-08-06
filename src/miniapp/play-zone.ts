import { livePlayersSeed, shouldShowLivePlayersOnCard } from './game-live-counts';

const playZoneGames = [
  ['mines', 'Mines', 'Reveal safe tiles and cash out', 'Play'],
  ['plinko', 'Plinko', 'Drop the ball and catch a multiplier', 'Play'],
  ['slot', 'Slot', 'Spin the reels and chase a winning combo', 'Play'],
  ['wheel', 'Wheel', 'Spin the wheel and hit a prize', 'Play'],
  ['dice', 'Dice', 'Roll the dice and beat the target', 'Play'],
  ['crash', 'Crash', 'Cash out before the line crashes', 'Play'],
  ['hilo', 'Chicken Cross', 'Cross the road and collect rewards', 'Play'],
  ['coinflip', 'Pump', 'Pump the multiplier before it pops', 'Play'],
  ['ghostrun', 'Ghost Run', 'Run through the dark and survive', 'Play'],
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
