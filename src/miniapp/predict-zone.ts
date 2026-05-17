export const PREDICT_ZONE_SECTION = `<section id="predictzone" class="view predict-zone-view">
  <div class="predict-zone-simple-shell">
    <button class="predict-zone-back" type="button" data-view="playzone" aria-label="Back to Play Zone">‹</button>
    <article class="predict-zone-glass-card">
      <div class="predict-zone-card-top">
        <span>Prediction</span>
        <small>Ends today</small>
      </div>
      <h2>Will BTC close above $100K today?</h2>
      <div class="predict-zone-percent-row" aria-label="Current prediction percentages">
        <div>
          <span>Yes</span>
          <strong>72%</strong>
        </div>
        <div>
          <span>No</span>
          <strong>28%</strong>
        </div>
      </div>
      <div class="predict-zone-progress" aria-hidden="true">
        <i style="--yes:72%"></i>
      </div>
      <div class="predict-zone-actions">
        <button type="button" class="predict-zone-choice predict-zone-choice-yes">Yes</button>
        <button type="button" class="predict-zone-choice predict-zone-choice-no">No</button>
      </div>
    </article>
  </div>
</section>`;
