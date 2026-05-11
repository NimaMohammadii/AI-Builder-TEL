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
        <div class="title">
          <h3>Charge TON Balance</h3>
          <button class="ghost" type="button" data-action="close-deposit">Close</button>
        </div>
        <div class="notice">Choose a Stars package. Your balance will be charged as TON after Telegram confirms the payment.</div>
        <div class="deposit-presets connect-style-presets">
          <button type="button" data-stars-deposit="50"><b>50</b><span>Stars</span></button>
          <button type="button" data-stars-deposit="100"><b>100</b><span>Stars</span></button>
          <button type="button" data-stars-deposit="200"><b>200</b><span>Stars</span></button>
        </div>
        <div class="field">
          <label>Custom Stars Amount</label>
          <input id="starsAmountSheet" inputmode="numeric" placeholder="Enter Stars amount" value="100" />
        </div>
        <button class="primary" type="button" data-action="deposit-custom-stars-sheet">Pay With Stars</button>
      </div>
    </div>
  </div>
</section>`;
