export const PREDICT_ZONE_SECTION = `<section id="predictzone" class="view predict-zone-view">
  <div class="predict-zone-simple-shell">
    <div class="predict-zone-menu-wrap">
      <nav class="predict-zone-category-menu" aria-label="Predict Zone categories">
        <button type="button" class="predict-zone-category-card active" data-predict-category="bitcoin"><span>Bitcoin</span></button>
        <button type="button" class="predict-zone-category-card" data-predict-category="ton"><span>TON</span></button>
        <button type="button" class="predict-zone-category-card" data-predict-category="gold"><span>Gold</span></button>
        <button type="button" class="predict-zone-category-card" data-predict-category="oil"><span>Oil</span></button>
        <button type="button" class="predict-zone-category-card" data-predict-category="football"><span>Football</span></button>
        <button type="button" class="predict-zone-category-card" data-predict-category="politics"><span>Politics</span></button>
        <button type="button" class="predict-zone-category-card" data-predict-category="fun"><span>Fun</span></button>
      </nav>
    </div>
    <div class="predict-zone-page-content active" data-predict-panel="bitcoin">
      <div class="predict-zone-card-top">
        <span></span>
        <small>05:00</small>
      </div>
      <h2>Will Bitcoin go Up or Down?</h2>
      <div class="predict-zone-live-meta" aria-label="Bitcoin preview price">
        <div><span>Start</span><strong>$102,400</strong></div>
        <div><span>Live</span><strong class="predict-zone-live-price">$102,618</strong></div>
      </div>
      <div class="predict-zone-chart-preview" aria-label="Bitcoin live chart preview">
        <div class="predict-zone-chart-grid"></div>
        <svg viewBox="0 0 360 126" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="predictBtcLine" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stop-color="rgba(255,255,255,.22)"/>
              <stop offset="48%" stop-color="rgba(255,255,255,.92)"/>
              <stop offset="100%" stop-color="rgba(255,255,255,.38)"/>
            </linearGradient>
            <linearGradient id="predictBtcFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="rgba(255,255,255,.16)"/>
              <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
            </linearGradient>
          </defs>
          <path class="predict-zone-chart-fill" d="M0 82 C28 70 48 92 76 74 S126 46 156 58 S206 108 236 84 S282 38 314 50 S346 72 360 42 L360 126 L0 126 Z"/>
          <path class="predict-zone-chart-line" d="M0 82 C28 70 48 92 76 74 S126 46 156 58 S206 108 236 84 S282 38 314 50 S346 72 360 42"/>
        </svg>
        <span class="predict-zone-chart-dot"></span>
        <div class="predict-zone-chart-timer"><span></span></div>
      </div>
      <div class="predict-zone-actions">
        <button type="button" class="predict-zone-choice predict-zone-choice-up">Up</button>
        <button type="button" class="predict-zone-choice predict-zone-choice-down">Down</button>
      </div>
    </div>
    <div class="predict-zone-page-content predict-zone-empty-panel" data-predict-panel="ton">
      <svg viewBox="0 0 96 96" aria-hidden="true"><circle cx="48" cy="48" r="35"/><path d="M33 39h.1M63 39h.1"/><path d="M34 62c8-9 20-9 28 0"/><path d="M25 24l6 6M71 24l-6 6"/></svg>
      <h3>No predictions yet</h3><p>New markets will appear here soon</p>
    </div>
    <div class="predict-zone-page-content predict-zone-empty-panel" data-predict-panel="gold">
      <svg viewBox="0 0 96 96" aria-hidden="true"><circle cx="48" cy="48" r="35"/><path d="M33 39h.1M63 39h.1"/><path d="M34 62c8-9 20-9 28 0"/><path d="M25 24l6 6M71 24l-6 6"/></svg>
      <h3>No predictions yet</h3><p>New markets will appear here soon</p>
    </div>
    <div class="predict-zone-page-content predict-zone-empty-panel" data-predict-panel="oil">
      <svg viewBox="0 0 96 96" aria-hidden="true"><circle cx="48" cy="48" r="35"/><path d="M33 39h.1M63 39h.1"/><path d="M34 62c8-9 20-9 28 0"/><path d="M25 24l6 6M71 24l-6 6"/></svg>
      <h3>No predictions yet</h3><p>New markets will appear here soon</p>
    </div>
    <div class="predict-zone-page-content predict-zone-empty-panel" data-predict-panel="football">
      <svg viewBox="0 0 96 96" aria-hidden="true"><circle cx="48" cy="48" r="35"/><path d="M33 39h.1M63 39h.1"/><path d="M34 62c8-9 20-9 28 0"/><path d="M25 24l6 6M71 24l-6 6"/></svg>
      <h3>No predictions yet</h3><p>New markets will appear here soon</p>
    </div>
    <div class="predict-zone-page-content predict-zone-empty-panel" data-predict-panel="politics">
      <svg viewBox="0 0 96 96" aria-hidden="true"><circle cx="48" cy="48" r="35"/><path d="M33 39h.1M63 39h.1"/><path d="M34 62c8-9 20-9 28 0"/><path d="M25 24l6 6M71 24l-6 6"/></svg>
      <h3>No predictions yet</h3><p>New markets will appear here soon</p>
    </div>
    <div class="predict-zone-page-content predict-zone-empty-panel" data-predict-panel="fun">
      <svg viewBox="0 0 96 96" aria-hidden="true"><circle cx="48" cy="48" r="35"/><path d="M33 39h.1M63 39h.1"/><path d="M34 62c8-9 20-9 28 0"/><path d="M25 24l6 6M71 24l-6 6"/></svg>
      <h3>No predictions yet</h3><p>New markets will appear here soon</p>
    </div>
  </div>
  <script>(function(){function setupPredictTabs(){var root=document.getElementById('predictzone');if(!root)return;var tabs=root.querySelectorAll('[data-predict-category]');var panels=root.querySelectorAll('[data-predict-panel]');tabs.forEach(function(tab){tab.addEventListener('click',function(){var key=tab.getAttribute('data-predict-category');tabs.forEach(function(t){t.classList.toggle('active',t===tab)});panels.forEach(function(panel){panel.classList.toggle('active',panel.getAttribute('data-predict-panel')===key)});});});}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setupPredictTabs);else setupPredictTabs();var tg=window.Telegram&&window.Telegram.WebApp;if(!tg||!tg.BackButton)return;var back=tg.BackButton;function goPlayZone(){var btn=document.querySelector('[data-view="playzone"]');if(btn)btn.click();try{back.hide()}catch(e){}}try{back.onClick(goPlayZone)}catch(e){}function sync(){var page=document.getElementById('predictzone');try{if(page&&page.classList.contains('active'))back.show();else back.hide()}catch(e){}}document.addEventListener('click',function(){setTimeout(sync,30)},true);document.addEventListener('DOMContentLoaded',sync);setTimeout(sync,200)})();</script>
</section>`;