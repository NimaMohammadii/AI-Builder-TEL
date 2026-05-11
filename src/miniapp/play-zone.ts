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

const rowAdCopy = {
  'playzone-row-ad-right': 'ربات وارد میشه و بازی رو روشن میکنه هر اسپین یه شانس تازه برای بردای بزرگه',
  'playzone-row-ad-left': 'اینجا هر انتخاب میتونه مسیر برد رو عوض کنه با تمرکز برو بالا و جایزه رو شکار کن',
} as const;

function rowAd(id: keyof typeof rowAdCopy, side: 'right' | 'left', label: string): string {
  return `<div class="play-zone-row-ad play-zone-row-ad--${side}" data-play-zone-ad="${id}"><p class="play-zone-row-ad__copy">${rowAdCopy[id]}</p><img src="/app/api/section-lock-image/${id}/locked.png?v=${cardImageVersion}" alt="${label}" decoding="async" onerror="this.closest('.play-zone-row-ad').classList.add('is-empty')"/></div>`;
}

export const PLAY_ZONE_SECTION = `<section id="playzone" class="view play-zone-view"><div class="game-grid">${playZoneGames.slice(0, 3).map(gameCard).join('')}${rowAd('playzone-row-ad-right', 'right', 'Play Zone promo image')}${playZoneGames.slice(3, 6).map(gameCard).join('')}${rowAd('playzone-row-ad-left', 'left', 'Play Zone promo image')}${playZoneGames.slice(6).map(gameCard).join('')}</div></section>`;
