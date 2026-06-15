export const HOME_SECTION = `<section id="home" class="view active">
  <style>
    #home{overflow-y:auto!important;overflow-x:hidden!important;padding-bottom:120px!important;-webkit-overflow-scrolling:touch;scrollbar-width:none}
    #home::-webkit-scrollbar{display:none}
    #home .home-finance-split{align-items:start!important}
    #home .home-finance-actions{display:grid!important;grid-template-rows:118px 118px 118px!important;grid-auto-rows:118px!important;align-content:start!important;gap:10px!important}
    #home .home-finance-actions>.home-finance-card{height:118px!important;min-height:118px!important;max-height:118px!important;margin:0!important;box-sizing:border-box!important;padding:0!important;display:block!important;overflow:hidden!important;position:relative!important;border-radius:28px!important;background:rgba(255,255,255,.026)!important}
    #home .home-action-card-image{width:100%!important;height:100%!important;object-fit:cover!important;object-position:center!important;border-radius:28px!important;display:block!important;background:transparent!important}
    #home .home-finance-card>.home-finance-icon,#home .home-finance-card>strong,#home .home-finance-card>span:not(.home-action-card-image){display:none!important}
    #home .home-finance-visual-stack{min-width:0!important;display:grid!important;grid-template-rows:184px 184px!important;gap:6px!important;align-items:start!important}
    #home .home-finance-visual{height:184px!important;min-height:184px!important;max-height:184px!important}
    #home .home-finance-extra-visual{height:184px!important;min-height:184px!important;max-height:184px!important;margin:0!important;border-radius:0!important;overflow:visible!important;background:transparent!important;padding:0!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;box-sizing:border-box!important}
    #home .home-finance-extra-visual img{width:100%!important;height:100%!important;object-fit:contain!important;object-position:center!important;border-radius:0!important;display:block!important;background:transparent!important;box-shadow:none!important;filter:drop-shadow(0 18px 34px rgba(0,0,0,.22))}
  </style>
  <section class="home-intro-card">
    <h2>Welcome to Vexa</h2>
    <p>Vexa is your mini app for managing your TON balance, playing interactive games, and accessing future market features from one clean experience</p>
  </section>

  <section class="home-finance-split">
    <div class="home-finance-actions">
      <button class="home-finance-card" type="button" data-action="open-deposit">
        <img class="home-action-card-image" src="/app/api/section-lock-image/home-deposit-card/locked.png" alt="" decoding="async" onerror="this.style.display='none'"/>
      </button>
      <button class="home-finance-card" type="button" data-action="open-withdraw">
        <img class="home-action-card-image" src="/app/api/section-lock-image/home-withdraw-card/locked.png" alt="" decoding="async" onerror="this.style.display='none'"/>
      </button>
      <button class="home-finance-card home-referral-card" type="button" data-view="referral">
        <img class="home-action-card-image" src="/app/api/section-lock-image/home-referral-card/locked.png" alt="" decoding="async" onerror="this.style.display='none'"/>
      </button>
    </div>
    <div class="home-finance-visual-stack">
      <div class="home-finance-visual">
        <img src="/app/api/home-finance-image.png" alt="" decoding="async"/>
      </div>
      <div class="home-finance-extra-visual">
        <img src="/app/api/section-lock-image/home/locked.png" alt="" decoding="async" onerror="this.closest('.home-finance-extra-visual').style.display='none'"/>
      </div>
    </div>
  </section>


  <div id="depositSheet" class="deposit-sheet" aria-hidden="true">
    <div class="deposit-backdrop" data-action="close-deposit"></div>
    <div class="deposit-panel card">
      <div class="pad">
        <div class="title deposit-title">
          <div class="deposit-title-main"><img class="deposit-credit-icon" src="/app/api/credit-icon.png" alt="" decoding="async"/><h3>Charge TON Balance</h3></div>
          <button class="ghost deposit-close" type="button" data-action="close-deposit" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></button>
        </div>
        <p class="deposit-copy">Your balance will be charged as TON after Telegram confirms the payment</p>
        <div class="field deposit-custom-field"><label>Custom Stars Amount</label><div class="deposit-amount-row"><input id="starsAmountSheet" inputmode="numeric" placeholder="Stars amount" value="100" /><span id="starsTonEquivalent" class="deposit-ton-equivalent">≈ 0.589 TON</span></div></div>
        <button class="primary deposit-pay-button" type="button" data-action="deposit-custom-stars-sheet">Pay With Stars</button>
        <div class="deposit-stars-logo" aria-hidden="true"><svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="25" fill="url(#starsHalo)" opacity=".24"/><path d="M32 6.5l5.15 15.15L52.8 16.9 43.2 29.7l14.55 6.65-16.05.4 6.15 14.8L32 41.45 16.15 51.55l6.15-14.8-16.05-.4 14.55-6.65-9.6-12.8 15.65 4.75L32 6.5z" fill="url(#starsBody)"/><path d="M32 15.4l3.3 9.72 10.05-3.05-6.16 8.22 9.34 4.27-10.3.26 3.95 9.5L32 37.83l-10.18 6.49 3.95-9.5-10.3-.26 9.34-4.27-6.16-8.22 10.05 3.05L32 15.4z" fill="rgba(255,255,255,.9)"/><defs><radialGradient id="starsHalo" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(32 32) rotate(90) scale(28)"><stop stop-color="#ffeaa0"/><stop offset="1" stop-color="#ffb21f" stop-opacity="0"/></radialGradient><linearGradient id="starsBody" x1="16" y1="10" x2="48" y2="54" gradientUnits="userSpaceOnUse"><stop stop-color="#fff4b8"/><stop offset=".38" stop-color="#ffd45a"/><stop offset="1" stop-color="#ff9d18"/></linearGradient></defs></svg><span>Telegram Stars</span></div>
      </div>
    </div>
  </div>

  <div id="withdrawSheet" class="deposit-sheet withdraw-sheet" aria-hidden="true">
    <div class="deposit-backdrop" data-action="close-withdraw"></div>
    <div class="deposit-panel card">
      <div class="pad withdraw-content">
        <div class="title deposit-title"><div class="deposit-title-main"><span class="withdraw-title-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><path d="M24 39V15" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/><path d="M14 25l10-10 10 10" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="24" cy="24" r="19" stroke="currentColor" stroke-opacity=".28" stroke-width="2"/></svg></span><h3>Withdraw TON</h3></div><button class="ghost deposit-close" type="button" data-action="close-withdraw" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></button></div>
        <p class="deposit-copy">Enter your TON wallet and the amount you want to withdraw</p>
        <div class="field deposit-custom-field"><label>TON Amount</label><div class="deposit-amount-row"><input id="withdrawAmountTon" inputmode="decimal" placeholder="0.00" /><span class="deposit-ton-equivalent">TON</span></div></div>
        <div class="field deposit-custom-field"><label>TON Wallet Address</label><div class="deposit-amount-row withdraw-wallet-row"><input id="withdrawWalletAddress" inputmode="text" placeholder="UQ... wallet address" /></div></div>
        <button class="primary deposit-pay-button" type="button" data-action="submit-withdraw">Confirm Withdraw</button>
        <p id="withdrawStatus" class="withdraw-status"></p>
        <div id="withdrawSuccess" class="withdraw-success" aria-hidden="true"><svg viewBox="0 0 96 96" fill="none"><circle cx="48" cy="48" r="40" fill="rgba(23,210,116,.14)"/><circle cx="48" cy="48" r="31" stroke="#19e681" stroke-width="5"/><path d="M33 48.5l10 10L64 37" stroke="#19e681" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg><strong>Request submitted</strong><span>Your withdrawal is pending review</span></div>
      </div>
    </div>
  </div>

  <div id="transactionsSheet" class="deposit-sheet transactions-sheet" aria-hidden="true">
    <div class="deposit-backdrop" data-action="close-transactions"></div>
    <div class="deposit-panel card transactions-panel">
      <div class="pad">
        <div class="title deposit-title"><div class="deposit-title-main"><span class="withdraw-title-icon transactions-title-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><path d="M14 17h20M14 24h20M14 31h12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><rect x="8" y="8" width="32" height="32" rx="12" stroke="currentColor" stroke-opacity=".28" stroke-width="2"/></svg></span><h3>Transactions</h3></div><button class="ghost deposit-close" type="button" data-action="close-transactions" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></button></div>
        <p class="deposit-copy transactions-copy">Your deposits and withdrawal requests are shown here</p>
        <div id="transactionsList" class="transactions-list"><div class="transactions-empty">Loading transactions</div></div>
      </div>
    </div>
  </div>
</section>`;