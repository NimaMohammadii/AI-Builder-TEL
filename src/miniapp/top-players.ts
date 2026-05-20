export const TOP_PLAYERS_SECTION = `<section id="topplayers" class="view top-players-view">
  <div class="top-players-page">
    <button class="top-players-back" type="button" data-view="home" aria-label="Back">‹</button>
    <div class="top-players-hero">
      <svg class="top-players-orbit top-players-orbit-a" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="42"/><circle cx="93" cy="35" r="4"/><path d="M24 76c22 22 58 22 80 0"/></svg>
      <svg class="top-players-orbit top-players-orbit-b" viewBox="0 0 100 100" aria-hidden="true"><path d="M18 50h64M50 18v64"/><circle cx="50" cy="50" r="24"/><circle cx="50" cy="50" r="5"/></svg>
      <svg class="top-players-crown-line" viewBox="0 0 180 42" aria-hidden="true"><path d="M8 31h164"/><path d="M32 31 48 12l19 19 23-24 23 24 19-19 16 19"/></svg>
      <div class="top-players-copy">
        <span class="top-players-kicker">Vexa League</span>
        <h2>Top Players</h2>
        <p>Weekly ranking of the strongest players in Vexa. Live data will be connected soon.</p>
        <div class="top-players-mini-meta"><span>Weekly ranking</span><span>Live soon</span></div>
      </div>
      <div class="top-players-hero-image" aria-hidden="true"><img src="/app/api/top-players-hero-image.png?v=1" alt="" loading="lazy" decoding="async"/></div>
    </div>
    <div class="top-players-filters" aria-label="Top players filters">
      <label class="top-filter-card"><span>Show</span><select id="topPlayersLimit" aria-label="Top players count"><option value="10">Top 10</option><option value="25">Top 25</option><option value="50">Top 50</option><option value="100">Top 100</option></select></label>
      <label class="top-filter-card"><span>Rank By</span><select id="topPlayersRankBy" aria-label="Top players ranking type"><option value="level">Level</option><option value="weekly_xp">Weekly XP</option></select></label>
    </div>
    <div class="top-players-list" aria-label="Top players list">
      <div class="top-player-row top-one"><span class="top-player-rank">1</span><span class="top-player-avatar">A</span><span class="top-player-main"><strong>Arman</strong><small>Crash Master</small></span><span class="top-player-score">128.4 TON</span></div>
      <div class="top-player-row"><span class="top-player-rank">2</span><span class="top-player-avatar">N</span><span class="top-player-main"><strong>Nika</strong><small>Auto Cashout Pro</small></span><span class="top-player-score">96.2 TON</span></div>
      <div class="top-player-row"><span class="top-player-rank">3</span><span class="top-player-avatar">K</span><span class="top-player-main"><strong>Kian</strong><small>Play Zone Elite</small></span><span class="top-player-score">84.7 TON</span></div>
      <div class="top-player-row"><span class="top-player-rank">4</span><span class="top-player-avatar">M</span><span class="top-player-main"><strong>Mira</strong><small>Daily Streak</small></span><span class="top-player-score">73.1 TON</span></div>
      <div class="top-player-row"><span class="top-player-rank">5</span><span class="top-player-avatar">S</span><span class="top-player-main"><strong>Sina</strong><small>Fast Cashout</small></span><span class="top-player-score">61.8 TON</span></div>
      <div class="top-player-row"><span class="top-player-rank">6</span><span class="top-player-avatar">L</span><span class="top-player-main"><strong>Luna</strong><small>Risk Hunter</small></span><span class="top-player-score">54.3 TON</span></div>
      <div class="top-player-row"><span class="top-player-rank">7</span><span class="top-player-avatar">R</span><span class="top-player-main"><strong>Radin</strong><small>Steady Player</small></span><span class="top-player-score">48.9 TON</span></div>
      <div class="top-player-row"><span class="top-player-rank">8</span><span class="top-player-avatar">D</span><span class="top-player-main"><strong>Daria</strong><small>Hot Streak</small></span><span class="top-player-score">43.6 TON</span></div>
    </div>
  </div>
</section>`;
