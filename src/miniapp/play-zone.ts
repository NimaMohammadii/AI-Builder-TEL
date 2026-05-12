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

function gameCard([id, label, description, action]: typeof playZoneGames[number]): string {
  return `<button class="game-card" type="button" data-view="${id}"><span class="game-image"><img src="/app/api/section-lock-image/${id}/locked.png?v=${cardImageVersion}" alt="${label}" decoding="async" onerror="this.style.display='none'"/></span><span class="game-info"><strong>${label}</strong><small>${description}</small></span><span class="game-open">${action}</span></button>`;
}

function cardAd(id: string, label: string): string {
  return `<div class="play-zone-card-ad" data-play-zone-ad="${id}"><img src="/app/api/section-lock-image/${id}/locked.png?v=${cardImageVersion}" alt="${label}" decoding="async" onerror="this.closest('.play-zone-card-ad').classList.add('is-empty')"/></div>`;
}

function row(start: number): string {
  const items = playZoneGames.slice(start, start + 3);
  return `${items.map(gameCard).join('')}${items.map(([id, label]) => cardAd(`playzone-card-ad-${id}`, `${label} row image`)).join('')}`;
}

export const PLAY_ZONE_SECTION = `<section id="playzone" class="view play-zone-view"><div class="game-grid">${row(0)}${row(3)}${row(6)}</div></section>`;
