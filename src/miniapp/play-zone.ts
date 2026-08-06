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

function gameCardImageUrl(id: string): string {
  return `/app/api/game-card-image/${id}.png`;
}

function gameCard([id, label, description, action]: typeof playZoneGames[number]): string {
  const imageUrl = gameCardImageUrl(id);

  return `
    <button class="game-card" type="button" data-game-view="${id}" data-play-zone-card-id="${id}" aria-label="${label}">
      <span class="game-image">
        <img src="${imageUrl}" data-section-image-src="${imageUrl}" data-fallback-src="${imageUrl}" alt="${label}" decoding="async" loading="eager" onerror="this.onerror=null;this.src='/app/api/section-lock-image/${id}/locked.png?v=1'"/>
      </span>
      <span class="game-info">
        <strong>${label}</strong>
        <small>${description}</small>
      </span>
      <span class="game-open">${action}</span>
    </button>
  `;
}

export const PLAY_ZONE_SECTION = `
<section id="playzone" class="view play-zone-view">
  <div class="play-zone-stage">
    <div class="game-grid">
      ${playZoneGames.map(gameCard).join('')}
    </div>
  </div>
</section>
`;
