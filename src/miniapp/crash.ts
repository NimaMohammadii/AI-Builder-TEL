export const CRASH_SECTION = `<section id="crash" class="view crash-view">
  <div class="crash-zone-shell">
    <nav class="crash-zone-category-menu" aria-label="Crash mode">
      <button type="button" class="crash-zone-category-card active"><span>Crash</span></button>
      <button type="button" class="crash-zone-category-card"><span>Classic</span></button>
      <button type="button" class="crash-zone-category-card"><span>Fast</span></button>
    </nav>
    <article class="crash-zone-glass-card">
      <div class="crash-zone-card-top"><span></span><small id="crashCountdown">Ready</small></div>
      <h2 class="crash-zone-question-row"><span class="crash-zone-question-icon">↗</span><span>Crash multiplier</span></h2>
      <div class="crash-zone-live-meta">
        <div><span>Bet</span><strong id="crashBetPreview">0.01 TON</strong></div>
        <div><span>Status</span><strong id="crashStatus">Ready</strong></div>
      </div>
      <div class="crash-zone-chart-preview" aria-label="Crash chart">
        <div class="crash-zone-chart-grid"><span></span><span></span><span></span><span></span><span></span></div>
        <div class="crash-zone-axis"><span>4.0x</span><span>3.0x</span><span>2.0x</span><span>1.5x</span><span>1.0x</span></div>
        <canvas id="crashCanvas" class="crash-canvas" width="360" height="220" aria-label="Crash graph"></canvas>
        <div class="crash-multiplier" id="crashMultiplier">1.00x</div>
        <span class="crash-zone-live-dot" id="crashLiveDot"></span>
      </div>
      <div class="crash-zone-actions">
        <button id="crashStart" class="crash-zone-choice" type="button">Place bet</button>
        <button id="crashCashout" class="crash-zone-choice" type="button" disabled>Cash out</button>
      </div>
      <div class="crash-history" id="crashHistory"></div>
    </article>
  </div>
  <div class="crash-bet-sheet" id="crashBetSheet" aria-hidden="true">
    <div class="crash-bet-panel" role="dialog" aria-modal="true" aria-label="Place crash bet">
      <div class="crash-bet-head"><div><span>Crash</span><strong>Place bet</strong></div><button type="button" id="crashBetClose" aria-label="Close">×</button></div>
      <p class="crash-bet-question">Cash out before the chart crashes.</p>
      <label class="crash-bet-input-wrap"><input id="crashAmount" class="crash-bet-input" inputmode="decimal" pattern="[0-9.]*" value="0.01"/><span class="crash-bet-side"><span>TON</span><small id="crashBetEstimate">Ready</small></span></label>
      <div class="crash-bet-presets"><button type="button" data-crash-preset="0.01">0.01</button><button type="button" data-crash-preset="0.05">0.05</button><button type="button" data-crash-preset="0.1">0.1</button><button type="button" data-crash-preset="0.25">0.25</button></div>
      <button type="button" id="crashBetSubmit" class="crash-bet-submit">Start round</button>
      <p class="crash-bet-note">Bet is locked from your TON balance until cash out or crash.</p>
    </div>
  </div>
</section>`;
