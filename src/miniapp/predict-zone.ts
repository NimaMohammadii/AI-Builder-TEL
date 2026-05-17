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
      <h2>Will Bitcoin go Up or Down in 5 minutes?</h2>
      <div class="predict-zone-live-meta" aria-label="Bitcoin preview price">
        <div><span>Start</span><strong>$102,400</strong></div>
        <div><span>Live</span><strong class="predict-zone-live-price">$102,618</strong></div>
      </div>
      <div class="predict-zone-chart-preview" aria-label="Bitcoin live chart preview">
        <div class="predict-zone-chart-grid"></div>
        <ul class="predict-zone-price-scale" aria-hidden="true">
          <li>$102,800</li>
          <li>$102,650</li>
          <li>$102,500</li>
          <li>$102,350</li>
          <li>$102,200</li>
        </ul>
        <svg viewBox="0 0 360 210" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="predictBtcLine" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stop-color="rgba(255,255,255,.24)"/>
              <stop offset="55%" stop-color="rgba(255,255,255,.96)"/>
              <stop offset="100%" stop-color="rgba(255,255,255,.48)"/>
            </linearGradient>
            <linearGradient id="predictBtcFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="rgba(255,255,255,.16)"/>
              <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
            </linearGradient>
          </defs>
          <path class="predict-zone-chart-fill" d="M0 142 C36 120 72 156 110 122 S176 66 220 92 S278 156 318 116 S346 92 360 68 L360 210 L0 210 Z"/>
          <path class="predict-zone-chart-line" d="M0 142 C36 120 72 156 110 122 S176 66 220 92 S278 156 318 116 S346 92 360 68"/>
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