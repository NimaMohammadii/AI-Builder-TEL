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

function gameCard([id, label, description, action]: typeof playZoneGames[number], extraClass = ''): string {
  const viewAttr = action === 'Play' ? `data-game-view="${id}"` : '';
  return `<button class="game-card ${extraClass}" type="button" ${viewAttr}><span class="game-image"><img src="/app/api/section-lock-image/${id}/locked.png?v=${cardImageVersion}" alt="${label}" decoding="async" onerror="this.style.display='none'"/></span><span class="game-info"><strong>${label}</strong><small>${description}</small></span><span class="game-open">${action}</span></button>`;
}

export const PLAY_ZONE_SECTION = `<section id="playzone" class="view play-zone-view"><div class="play-zone-stage"><div class="play-zone-featured-row play-zone-grid-row">${playZoneGames.map((game, index) => gameCard(game, `play-zone-featured-card${index < 3 ? ` play-zone-featured-card-${index + 1}` : ' play-zone-muted-card'}`)).join('')}</div></div></section>`;