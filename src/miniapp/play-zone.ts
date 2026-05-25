const cardImageVersion = Date.now();
const playZoneGames = [
  ['mines', 'Mines', 'Reveal safe tiles and cash out', 'Play'],
  ['plinko', 'Plinko', 'Drop the ball and catch a multiplier', 'Play'],
  ['crash', 'Crash', 'Cash out before the line crashes', 'Play'],
  ['wheel', 'Wheel', 'Spin the wheel and hit a prize', 'Play'],
  ['dice', 'Dice', 'Roll the dice and beat the target', 'Play'],
  ['rps', 'Rock Paper Scissors', 'Choose rock, paper, or scissors', 'Play'],
] as const;

function playersOnline(id: string): number {
  const seed = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return 100 + (seed % 301);
}

function gameCard([id, label, _description, action]: typeof playZoneGames[number], extraClass = ''): string {
  const fallback = `/app/api/section-lock-image/${id}/locked.png?v=${cardImageVersion}`;
  const viewAttr = action === 'Play' ? `data-game-view="${id}"` : '';
  return `<span class="game-card-shell ${extraClass}" ${viewAttr}><button class="game-card game-card-live" type="button" ${viewAttr} aria-label="${label}"><span class="game-image"><img src="${fallback}" data-fallback-src="${fallback}" alt="${label}" decoding="async" onerror="this.onerror=null;this.src=this.dataset.fallbackSrc||this.src"/></span></button><span class="game-footer game-footer-live"><span class="game-players" aria-label="Players online"><i></i><b>${playersOnline(id)}</b><em>players</em></span></span></span>`;
}

export const PLAY_ZONE_SECTION = `<section id="playzone" class="view play-zone-view">
  <div class="play-zone-stage">
    <section class="play-zone-nft-strip" data-play-zone-nft-strip hidden>
      <div class="play-zone-nft-head"><strong>Market Picks</strong><span>Low price NFTs</span></div>
      <div class="play-zone-nft-viewport"><div class="play-zone-nft-track" data-play-zone-nft-track></div></div>
    </section>
    <div class="play-zone-section-head"><strong>Live games</strong><span>Ready to play</span></div>
    <div class="play-zone-featured-row play-zone-grid-row">${playZoneGames.map((game, index) => gameCard(game, `play-zone-featured-card play-zone-featured-card-${index + 1}`)).join('')}</div>
  </div>
</section>`;