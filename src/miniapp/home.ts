export const HOME_SECTION = `<section id="home" class="view active">
  <section class="card">
    <div class="pad">
      <div class="title">
        <h3>TON Balance</h3>
        <span id="homeTonBalance" data-ton-balance-display>0 TON</span>
      </div>
      <div class="notice">Charge with Telegram Stars. Your balance updates automatically after Telegram confirms the payment.</div>
      <button class="primary home-deposit-btn" type="button" data-action="open-deposit">Deposit</button>
      <div class="tiny" style="margin-top:10px">Stars payments are processed securely inside Telegram.</div>
    </div>
  </section>

  <section class="card">
    <div class="pad">
      <div class="title">
        <h3>Deposit Options</h3>
        <span>Stars</span>
      </div>
      <div class="deposit-presets connect-style-presets">
        <button type="button" data-stars-deposit="50"><b>50</b><span>Stars</span></button>
        <button type="button" data-stars-deposit="100"><b>100</b><span>Stars</span></button>
        <button type="button" data-stars-deposit="200"><b>200</b><span>Stars</span></button>
      </div>
      <div class="field">
        <label>Custom Stars Amount</label>
        <input id="starsAmount" inputmode="numeric" placeholder="Enter Stars amount" value="100" />
      </div>
      <button class="secondary" type="button" data-action="deposit-custom-stars">Pay With Stars</button>
      <div id="depositStatus" class="tiny" style="margin-top:10px">1 Star ≈ 0.00589 TON after 4% commission.</div>
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
