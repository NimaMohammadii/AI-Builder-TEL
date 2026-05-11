export const HOME_SECTION = `<section id="home" class="view active">
  <section class="home-intro-card">
    <h2>Welcome to Vexa FLOW</h2>
    <p>Vexa FLOW is your mini app for managing your TON balance, playing interactive games, and accessing future market features from one clean experience.</p>
  </section>

  <section class="home-finance-split">
    <div class="home-finance-actions">
      <button class="home-finance-card" type="button" data-action="open-deposit">
        <strong>Deposit</strong>
        <span>Add TON balance</span>
      </button>
      <button class="home-finance-card" type="button">
        <strong>Withdraw</strong>
        <span>Coming soon</span>
      </button>
    </div>
    <div class="home-finance-visual">
      <img src="/app/api/home-finance-image.png" alt="" decoding="async"/>
    </div>
  </section>

  <div id="depositSheet" class="deposit-sheet" aria-hidden="true">
    <div class="deposit-backdrop" data-action="close-deposit"></div>
    <div class="deposit-panel card">
      <div class="pad">
        <div class="title deposit-title">
          <div class="deposit-title-main">
            <img class="deposit-credit-icon" src="/app/api/credit-icon.png" alt="" decoding="async"/>
            <h3>Charge TON Balance</h3>
          </div>
          <button class="ghost deposit-close" type="button" data-action="close-deposit" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>
          </button>
        </div>
        <p class="deposit-copy">Your balance will be charged as TON after Telegram confirms the payment.</p>
        <div class="field deposit-custom-field">
          <label>Custom Stars Amount</label>
          <input id="starsAmountSheet" inputmode="numeric" placeholder="Enter Stars amount" value="100" />
        </div>
        <button class="primary deposit-pay-button" type="button" data-action="deposit-custom-stars-sheet">Pay With Stars</button>
        <div class="deposit-stars-logo" aria-hidden="true">
          <svg viewBox="0 0 64 64" fill="none"><path d="M32 6l6.9 17.1L57 30l-17.4 7.4L32 58l-7.6-20.6L7 30l18.1-6.9L32 6z" fill="url(#starsGradient)"/><path d="M32 15l4.2 10.6L47 30l-10.4 4.6L32 47l-4.6-12.4L17 30l10.8-4.4L32 15z" fill="rgba(255,255,255,.78)"/><defs><linearGradient id="starsGradient" x1="12" y1="8" x2="52" y2="58" gradientUnits="userSpaceOnUse"><stop stop-color="#fff6b8"/><stop offset=".48" stop-color="#ffc642"/><stop offset="1" stop-color="#ff8a00"/></linearGradient></defs></svg>
          <span>Telegram Stars</span>
        </div>
      </div>
    </div>
  </div>
</section>`;
