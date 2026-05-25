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

const readyGames = playZoneGames.filter((game) => game[3] === 'Play');
const lockedGames = playZoneGames.filter((game) => game[3] !== 'Play');

function gameCard([id, label, _description, action]: typeof playZoneGames[number], extraClass = ''): string {
  const viewAttr = action === 'Play' ? `data-game-view="${id}"` : '';
  return `<button class="game-card ${extraClass}" type="button" ${viewAttr} aria-label="${label}"><span class="game-image"><img src="/app/api/section-lock-image/${id}/locked.png?v=${cardImageVersion}" alt="${label}" decoding="async" onerror="this.style.display='none'"/></span><span class="game-open">${action}</span></button>`;
}

export const PLAY_ZONE_SECTION = `<section id="playzone" class="view play-zone-view">
  <div class="play-zone-stage">
    <section class="play-zone-hero">
      <p class="play-zone-kicker">Vexa Arcade</p>
      <h2>Play Zone</h2>
      <p class="play-zone-copy">Choose a room, enter fast, and keep the whole arcade one tap away.</p>
    </section>
    <div class="play-zone-featured-row play-zone-grid-row">${readyGames.map((game, index) => gameCard(game, `play-zone-featured-card play-zone-featured-card-${index + 1}`)).join('')}</div>
    <div class="play-zone-upcoming-row">${lockedGames.map((game) => gameCard(game, 'play-zone-muted-card')).join('')}</div>
  </div>
</section>`;