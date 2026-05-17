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
    <article class="predict-zone-glass-card">
      <div class="predict-zone-card-top">
        <span>Prediction</span>
        <small>Ends today</small>
      </div>
      <h2>Will BTC close above $100K today?</h2>
      <div class="predict-zone-percent-row" aria-label="Current prediction percentages">
        <div class="predict-zone-percent-card predict-zone-percent-yes">
          <span>Yes</span>
          <strong>72%</strong>
        </div>
        <div class="predict-zone-percent-card predict-zone-percent-no">
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
  <script>(function(){var tg=window.Telegram&&window.Telegram.WebApp;if(!tg||!tg.BackButton)return;var back=tg.BackButton;function goPlayZone(){var btn=document.querySelector('[data-view="playzone"]');if(btn)btn.click();try{back.hide()}catch(e){}}try{back.onClick(goPlayZone)}catch(e){}function sync(){var page=document.getElementById('predictzone');try{if(page&&page.classList.contains('active'))back.show();else back.hide()}catch(e){}}document.addEventListener('click',function(){setTimeout(sync,30)},true);document.addEventListener('DOMContentLoaded',sync);setTimeout(sync,200)})();</script>
</section>`;