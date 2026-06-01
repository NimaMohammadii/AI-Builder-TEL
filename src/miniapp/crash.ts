import { CRASH_PERFORMANCE_SCRIPT } from './crash-performance-script';
import { CRASH_LIVE_D1_SCRIPT } from './crash-live-d1-script';
import { CRASH_BET_INPUT_SCRIPT } from './crash-bet-input-script';
import { CRASH_BACK_BUTTON_SCRIPT } from './crash-back-button-script';
import { CRASH_BREAK_FX_SCRIPT } from './crash-break-fx-script';

export const CRASH_SECTION = `<section id="crash" class="view crash-view">
  <div class="crash-page">
    <div class="crash-stage">
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
        <div class="crash-field">
          <small>Multiplier</small>
          <b><span id="crashPanelMultiplier">1.00x</span><i>↗</i></b>
        </div>
        <div class="crash-field crash-auto-field">
          <small>Auto Cash Out</small>
          <b><span class="crash-auto"><input id="crashAutoCashout" inputmode="decimal" pattern="[0-9.]*" value="2.00"/><span>x</span></span></b>
        </div>
        <div class="crash-field">
          <small>Status</small>
          <b><span id="crashStatus">Waiting</span><i>•</i></b>
        </div>
      </div>
      <div class="crash-bet">
        <button type="button" data-action="crash-half">1/2</button>
        <span class="crash-bet-main active"><input id="crashAmount" inputmode="decimal" pattern="[0-9.]*" value="1" aria-label="Amount TON"/></span>
        <button type="button" data-action="crash-double">2x</button>
      </div>
      <div class="crash-actions">
        <button id="crashStart" class="crash-primary" type="button">Place Bet</button>
        <button id="crashCashout" class="crash-secondary" type="button" disabled>Cash Out</button>
      </div>
      <div class="crash-history" id="crashHistory"></div>
    </div>
    <div class="crash-live" id="crashLive">
      <div class="crash-live-head"><span>Live Bets</span><b id="crashLiveTotal">0 TON</b></div>
      <div class="crash-live-list" id="crashLiveList"><div class="crash-live-empty">No bets yet</div></div>
    </div>
  </div>
  <script>${CRASH_PERFORMANCE_SCRIPT}</script>
  <script>${CRASH_LIVE_D1_SCRIPT}</script>
  <script>${CRASH_BET_INPUT_SCRIPT}</script>
  <script>${CRASH_BACK_BUTTON_SCRIPT}</script>
  <script>${CRASH_BREAK_FX_SCRIPT}</script>
</section>`;
