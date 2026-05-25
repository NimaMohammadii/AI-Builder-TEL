const cardImageVersion = Date.now();
const playZoneGames = [
  ['mines', 'Mines', 'Reveal safe tiles and cash out', 'Play'],
  ['plinko', 'Plinko', 'Drop the ball and catch a multiplier', 'Play'],
  ['crash', 'Crash', 'Cash out before the line crashes', 'Play'],
  ['wheel', 'Wheel', 'Spin the wheel and hit a prize', 'Play'],
  ['dice', 'Dice', 'Roll the dice and beat the target', 'Play'],
  ['rps', 'Rock Paper Scissors', 'Choose rock, paper, or scissors', 'Soon'],
  ['tower', 'Tower', 'Climb higher and raise the payout', 'Soon'],
  ['coinflip', 'Coin Flip', 'Pick a side and flip for the win', 'Soon'],
  ['hilo', 'Hi-Lo', 'Call higher or lower to build streaks', 'Soon'],
] as const;

const liveGames = playZoneGames.filter((game) => game[3] === 'Play');
const upcomingGames = playZoneGames.filter((game) => game[3] !== 'Play');

function playersOnline(id: string): number {
  const seed = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return 100 + (seed % 301);
}

function gameCard([id, label, description, action]: typeof playZoneGames[number], extraClass = ''): string {
  const fallback = `/app/api/section-lock-image/${id}/locked.png?v=${cardImageVersion}`;
  const viewAttr = action === 'Play' ? `data-game-view="${id}"` : '';
  if (action === 'Play') {
    return `<button class="game-card game-card-live ${extraClass}" type="button" ${viewAttr} aria-label="${label}"><span class="game-image"><img src="${fallback}" data-fallback-src="${fallback}" alt="${label}" decoding="async" onerror="this.onerror=null;this.src=this.dataset.fallbackSrc||this.src"/></span><span class="game-footer game-footer-live"><span class="game-players" aria-label="Players online"><i></i><b>${playersOnline(id)}</b><em>players</em></span></span></button>`;
  }
  return `<button class="game-card ${extraClass}" type="button"><span class="game-image"><img src="${fallback}" data-fallback-src="${fallback}" alt="${label}" decoding="async" onerror="this.onerror=null;this.src=this.dataset.fallbackSrc||this.src"/></span><span class="game-info"><strong>${label}</strong><small>${description}</small></span><span class="game-footer"><span class="game-open">${action}</span></span></button>`;
}

export const PLAY_ZONE_SECTION = `<section id="playzone" class="view play-zone-view">
  <div class="play-zone-stage">
    <div class="play-zone-section-head"><strong>Live games</strong><span>Ready to play</span></div>
    <div class="play-zone-featured-row play-zone-grid-row">${liveGames.map((game, index) => gameCard(game, `play-zone-featured-card play-zone-featured-card-${index + 1}`)).join('')}</div>
    <div class="play-zone-section-head play-zone-upcoming-head"><strong>Coming next</strong><span>New rooms soon</span></div>
    <div class="play-zone-upcoming-row">${upcomingGames.map((game) => gameCard(game, 'play-zone-muted-card')).join('')}</div>
  </div>
</section>`;