const cardImageVersion = Date.now();
const playZoneGames = [
  ['mines', 'Mines', 'Reveal safe tiles and cash out', 'Play'],
  ['plinko', 'Plinko', 'Drop the ball and catch a multiplier', 'Play'],
  ['crash', 'Crash', 'Cash out before the line crashes', 'Play'],
  ['wheel', 'Wheel', 'Spin the wheel and hit a prize', 'Soon'],
  ['dice', 'Dice', 'Roll the dice and beat the target', 'Soon'],
  ['limbo', 'Limbo', 'Choose a multiplier and survive', 'Soon'],
  ['tower', 'Tower', 'Climb higher and raise the payout', 'Soon'],
  ['coinflip', 'Coin Flip', 'Pick a side and flip for the win', 'Soon'],
  ['hilo', 'Hi-Lo', 'Call higher or lower to build streaks', 'Soon'],
] as const;

function gameCard([id, label, description, action]: typeof playZoneGames[number], extraClass = ''): string {
  return `<button class="game-card ${extraClass}" type="button" data-game-view="${id}"><span class="game-image"><img src="/app/api/section-lock-image/${id}/locked.png?v=${cardImageVersion}" alt="${label}" decoding="async" onerror="this.style.display='none'"/></span><span class="game-info"><strong>${label}</strong><small>${description}</small></span><span class="game-open">${action}</span></button>`;
}

const featuredGames = playZoneGames.slice(0, 3);
const triangleGames = playZoneGames.slice(3);

export const PLAY_ZONE_SECTION = `<section id="playzone" class="view play-zone-view"><div class="play-zone-stage"><div class="play-zone-featured-row">${featuredGames.map((game, index) => gameCard(game, `play-zone-featured-card play-zone-featured-card-${index + 1}`)).join('')}</div><div class="play-zone-triangle"><div class="play-zone-triangle-row play-zone-triangle-row-3">${triangleGames.slice(0, 3).map((game) => gameCard(game, 'play-zone-triangle-card')).join('')}</div><div class="play-zone-triangle-row play-zone-triangle-row-2">${triangleGames.slice(3, 5).map((game) => gameCard(game, 'play-zone-triangle-card')).join('')}</div><div class="play-zone-triangle-row play-zone-triangle-row-1">${triangleGames.slice(5, 6).map((game) => gameCard(game, 'play-zone-triangle-card')).join('')}</div></div></div></section>`;
