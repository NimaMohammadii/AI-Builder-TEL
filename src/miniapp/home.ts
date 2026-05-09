export const HOME_SECTION = `<section id="home" class="view active">
  <div class="home-hero glass-card">
    <div>
      <p class="home-kicker">Wallet</p>
      <h2>TON Balance</h2>
      <p>Charge with Telegram Stars now. Your balance updates automatically after Telegram confirms the payment.</p>
    </div>
    <div class="home-balance-orb">
      <svg viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="27" fill="rgba(0,136,204,.16)" stroke="rgba(255,255,255,.34)"/><path d="M14.2 17.8h27.6c1.9 0 3.1 2.1 2.1 3.7L30.1 43.2c-.9 1.4-3.1 1.4-4 0L12.1 21.5c-1-1.6.2-3.7 2.1-3.7Zm3.4 3.5 8.7 15V21.3h-8.7Zm12.1 0v15l8.7-15h-8.7Z" fill="#fff"/></svg>
    </div>
  </div>

  <div class="home-actions-grid home-actions-single">
    <button class="home-action primary-glass home-deposit-large" type="button" data-action="open-deposit">
      <span class="home-action-icon">＋</span>
      <span><b>Deposit</b><small>Charge with Telegram Stars</small></span>
    </button>
  </div>

  <div id="depositSheet" class="deposit-sheet" aria-hidden="true">
    <div class="deposit-backdrop" data-action="close-deposit"></div>
    <div class="deposit-panel glass-card">
      <div class="deposit-head">
        <div><p class="home-kicker">Deposit</p><h3>Charge TON Balance</h3></div>
        <button class="deposit-close" type="button" data-action="close-deposit">×</button>
      </div>
      <p class="deposit-copy">Choose a Stars package. Your balance will be charged as TON after Telegram confirms the payment.</p>
      <div class="deposit-presets">
        <button type="button" data-stars-deposit="50"><b>50</b><span>Stars</span></button>
        <button type="button" data-stars-deposit="100"><b>100</b><span>Stars</span></button>
        <button type="button" data-stars-deposit="200"><b>200</b><span>Stars</span></button>
      </div>
      <div class="deposit-custom">
        <input id="starsAmount" inputmode="numeric" placeholder="Custom Stars amount" value="100" />
        <button type="button" data-action="deposit-custom-stars">Pay</button>
      </div>
      <p id="depositStatus" class="deposit-status">1 Star ≈ 0.00589 TON after 4% commission.</p>
    </div>
  </div>
</section>`;
