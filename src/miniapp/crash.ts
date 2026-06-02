import { CRASH_PERFORMANCE_SCRIPT } from './crash-performance-script';
import { CRASH_LIVE_D1_SCRIPT } from './crash-live-d1-script';
import { CRASH_BACK_BUTTON_SCRIPT } from './crash-back-button-script';
import { CRASH_BREAK_FX_SCRIPT } from './crash-break-fx-script';

export const CRASH_SECTION = `<section id="crash" class="view crash-view">
  <div class="crash-page">
    <div class="crash-stage">
      <div class="crash-history" id="crashHistory"></div>
      <canvas id="crashCanvas" class="crash-canvas" width="360" height="340" aria-label="Crash graph"></canvas>
      <div class="crash-multiplier-wrap">
        <div class="crash-multiplier" id="crashMultiplier">1.00x</div>
        <div class="crash-next-round" id="crashNextRound">Next round 5.0s</div>
      </div>
      <b id="crashCountdown" class="crash-hidden-state">Ready</b>
      <strong id="crashTotalTime" class="crash-hidden-state">Total 0s</strong>
    </div>
    <div class="crash-controls">
      <div class="crash-control-grid">
        <div class="crash-field crash-auto-field">
          <small>Auto Cash Out</small>
          <b><span class="crash-auto"><input id="crashAutoCashout" inputmode="decimal" pattern="[0-9.]*" value="2.00"/><span>x</span></span></b>
        </div>
      </div>
      <div class="crash-bet">
        <button type="button" data-action="crash-half">1/2</button>
        <span class="crash-bet-main active"><input id="crashAmount" inputmode="decimal" pattern="[0-9.]*" value="1.00" aria-label="Amount TON"/></span>
        <button type="button" data-action="crash-double">2x</button>
      </div>
      <div class="crash-actions">
        <button id="crashAction" class="crash-primary" type="button">Place Bet</button>
      </div>
    </div>
    <div class="crash-live open" id="crashLive">
      <div class="crash-live-head">
        <span class="crash-live-title">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.2 11.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"/><path d="M3.4 18.4c.6-3 2.3-4.6 4.8-4.6s4.2 1.6 4.8 4.6"/><path d="M16.3 10.2a2.6 2.6 0 1 0 0-5.2"/><path d="M15.4 13.6c2.4.2 3.9 1.7 4.4 4.3"/></svg>
          <span>Live Bets</span>
        </span>
        <div class="crash-live-head-actions">
          <b id="crashLiveTotal">0 TON</b>
          <button id="crashLiveToggle" class="crash-live-toggle" type="button" aria-label="Toggle live bets" aria-expanded="true">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5"/></svg>
          </button>
        </div>
      </div>
      <div class="crash-live-list" id="crashLiveList"><div class="crash-live-empty">No bets yet</div></div>
    </div>
  </div>
  <script>${CRASH_PERFORMANCE_SCRIPT}</script>
  <script>${CRASH_LIVE_D1_SCRIPT}</script>
  <script>${CRASH_BACK_BUTTON_SCRIPT}</script>
  <script>${CRASH_BREAK_FX_SCRIPT}</script>
</section>`;