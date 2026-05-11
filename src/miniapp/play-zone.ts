const cardImageVersion = Date.now();

const playZoneIntro = {
  title: 'Play Zone',
  subtitle: 'Curated game rooms with fast entries, clear risk cues, and premium rewards.',
} as const;

const playZoneGames = [
  ['mines', 'Mines', 'Reveal safe tiles, control the risk, and cash out with confidence.', 'Open'],
  ['plinko', 'Plinko', 'Drop the ball, track the bounce, and chase high multipliers.', 'Open'],
  ['crash', 'Crash', 'Ride the curve and secure profit before the market breaks.', 'Open'],
  ['wheel', 'Wheel', 'Spin reward tiers and aim for the premium prize segment.', 'Soon'],
  ['dice', 'Dice', 'Set a target, roll clean, and let probability do the talking.', 'Soon'],
  ['limbo', 'Limbo', 'Choose your multiplier and decide how far to push the round.', 'Soon'],
  ['tower', 'Tower', 'Climb level by level, then bank rewards before risk rises.', 'Soon'],
  ['coinflip', 'Coin Flip', 'Pick a side, confirm the call, and go for a clean win.', 'Soon'],
  ['hilo', 'Hi-Lo', 'Read the next card, call the move, and build a smart streak.', 'Soon'],
] as const;

function gameCard([id, label, description, action]: typeof playZoneGames[number]): string {
  return `<button class="game-card" type="button" data-view="${id}"><span class="game-image"><img src="/app/api/section-lock-image/${id}/locked.png?v=${cardImageVersion}" alt="${label}" decoding="async" onerror="this.style.display='none'"/></span><span class="game-info"><strong>${label}</strong><small>${description}</small></span><span class="game-open">${action}</span></button>`;
}

const rowAdCopy = {
  'playzone-row-ad-right': 'Enter a sharper arena: every move is timed, every round is measured, and every win starts with control.',
  'playzone-row-ad-left': 'Choose your pace, protect your balance, and push for rewards only when the setup feels right.',
} as const;

function rowAd(id: keyof typeof rowAdCopy, side: 'right' | 'left', label: string): string {
  return `<div class="play-zone-row-ad play-zone-row-ad--${side}" data-play-zone-ad="${id}"><p class="play-zone-row-ad__copy">${rowAdCopy[id]}</p><img src="/app/api/section-lock-image/${id}/locked.png?v=${cardImageVersion}" alt="${label}" decoding="async" onerror="this.closest('.play-zone-row-ad').classList.add('is-empty')"/></div>`;
}

export const PLAY_ZONE_SECTION = `<section id="playzone" class="view play-zone-view"><div class="play-zone-head"><h2>${playZoneIntro.title}</h2><p>${playZoneIntro.subtitle}</p></div><div class="game-grid">${playZoneGames.slice(0, 3).map(gameCard).join('')}${rowAd('playzone-row-ad-right', 'right', 'Play Zone promo image')}${playZoneGames.slice(3, 6).map(gameCard).join('')}${rowAd('playzone-row-ad-left', 'left', 'Play Zone promo image')}${playZoneGames.slice(6).map(gameCard).join('')}</div></section>`;
