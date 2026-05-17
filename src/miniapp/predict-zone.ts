export const PREDICT_ZONE_SECTION = `<section id="predictzone" class="view predict-zone-view">
  <div class="predict-zone-simple-shell">
    <nav class="predict-zone-category-menu" aria-label="Predict Zone categories">
      <button type="button" class="predict-zone-category-card active"><span>Politics</span></button>
      <button type="button" class="predict-zone-category-card"><span>Sports</span></button>
      <button type="button" class="predict-zone-category-card"><span>Fun</span></button>
      <button type="button" class="predict-zone-category-card"><span>Live</span></button>
      <button type="button" class="predict-zone-category-card"><span>Crypto</span></button>
      <button type="button" class="predict-zone-category-card"><span>Weather</span></button>
      <button type="button" class="predict-zone-category-card"><span>Finance</span></button>
    </nav>
    <article class="predict-zone-glass-card predict-zone-btc-preview-card">
      <div class="predict-zone-card-top">
        <span>BTC Preview</span>
        <small class="predict-zone-countdown">05:00</small>
      </div>
      <h2>Up or Down?</h2>
      <div class="predict-zone-live-meta" aria-label="Bitcoin preview price">
        <div><span>Start</span><strong>$102,400</strong></div>
        <div><span>Live</span><strong class="predict-zone-live-price">$102,618</strong></div>
      </div>
      <div class="predict-zone-chart-preview" aria-label="Bitcoin live chart preview">
        <div class="predict-zone-chart-grid"></div>
        <div class="predict-zone-chart-price"><span>BTC</span><strong>$102,618</strong></div>
        <svg viewBox="0 0 360 150" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="predictBtcLine" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stop-color="rgba(255,255,255,.22)"/>
              <stop offset="48%" stop-color="rgba(255,255,255,.95)"/>
              <stop offset="100%" stop-color="rgba(255,255,255,.42)"/>
            </linearGradient>
            <linearGradient id="predictBtcFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="rgba(255,255,255,.18)"/>
              <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
            </linearGradient>
          </defs>
          <path class="predict-zone-chart-fill" d="M0 100 C30 84 52 108 82 86 S132 50 164 66 S214 128 246 94 S292 42 326 56 S350 82 360 52 L360 150 L0 150 Z"/>
          <path class="predict-zone-chart-line" d="M0 100 C30 84 52 108 82 86 S132 50 164 66 S214 128 246 94 S292 42 326 56 S350 82 360 52"/>
        </svg>
        <span class="predict-zone-chart-dot"></span>
        <div class="predict-zone-chart-timer"><span></span></div>
      </div>
      <div class="predict-zone-actions">
        <button type="button" class="predict-zone-choice predict-zone-choice-up">Up</button>
        <button type="button" class="predict-zone-choice predict-zone-choice-down">Down</button>
      </div>
    </article>
  </div>
  <script>(function(){var tg=window.Telegram&&window.Telegram.WebApp;if(!tg||!tg.BackButton)return;var back=tg.BackButton;function goPlayZone(){var btn=document.querySelector('[data-view="playzone"]');if(btn)btn.click();try{back.hide()}catch(e){}}try{back.onClick(goPlayZone)}catch(e){}function sync(){var page=document.getElementById('predictzone');try{if(page&&page.classList.contains('active'))back.show();else back.hide()}catch(e){}}document.addEventListener('click',function(){setTimeout(sync,30)},true);document.addEventListener('DOMContentLoaded',sync);setTimeout(sync,200)})();</script>
</section>`;