export const PREDICT_ZONE_SECTION = `<section id="predictzone" class="view predict-zone-view">
  <div class="predict-zone-shell">
    <header class="predict-zone-hero">
      <button class="predict-zone-back" type="button" data-view="playzone" aria-label="Back to Play Zone">‹</button>
      <div class="predict-zone-hero-copy">
        <span class="predict-zone-kicker">Vexa Predict</span>
        <h2>Predict Zone</h2>
        <p>Forecast real-world outcomes, choose Yes or No, and compete in clean prediction pools.</p>
      </div>
      <div class="predict-zone-hero-art" aria-hidden="true">
        <div class="predict-zone-orbit predict-zone-orbit-a"></div>
        <div class="predict-zone-orbit predict-zone-orbit-b"></div>
        <strong>72%</strong>
        <span>YES</span>
      </div>
    </header>

    <section class="predict-zone-stats" aria-label="Prediction preview stats">
      <div><span>Today</span><strong>3</strong><small>Markets</small></div>
      <div><span>Pool</span><strong>VEX</strong><small>XP soon</small></div>
      <div><span>Mode</span><strong>Y/N</strong><small>Simple</small></div>
    </section>

    <section class="predict-zone-market-card predict-zone-market-card-live">
      <div class="predict-zone-market-top">
        <span class="predict-zone-market-badge">Featured</span>
        <span class="predict-zone-market-time">Ends today</span>
      </div>
      <h3>Will BTC close above $100K today?</h3>
      <p>Pick a side before the timer ends. Final result will be resolved from the selected market source.</p>
      <div class="predict-zone-bars">
        <div class="predict-zone-bar-row"><span>Yes</span><strong>72%</strong><i style="--p:72%"></i></div>
        <div class="predict-zone-bar-row"><span>No</span><strong>28%</strong><i style="--p:28%"></i></div>
      </div>
      <div class="predict-zone-actions">
        <button type="button" class="predict-zone-choice predict-zone-choice-yes">Yes</button>
        <button type="button" class="predict-zone-choice predict-zone-choice-no">No</button>
      </div>
    </section>

    <section class="predict-zone-market-grid">
      <article class="predict-zone-mini-market">
        <span>Crypto</span>
        <strong>Will TON rise 5% this week?</strong>
        <small>Yes 58% · No 42%</small>
      </article>
      <article class="predict-zone-mini-market">
        <span>Sports</span>
        <strong>Will the favorite win tonight?</strong>
        <small>Yes 64% · No 36%</small>
      </article>
      <article class="predict-zone-mini-market">
        <span>Tech</span>
        <strong>Will a major AI model launch this week?</strong>
        <small>Yes 31% · No 69%</small>
      </article>
    </section>

    <section class="predict-zone-info-card">
      <strong>How it works</strong>
      <p>Users join a Yes/No pool. When the result is resolved, winners share the pool based on their entry amount.</p>
    </section>
  </div>
</section>`;
