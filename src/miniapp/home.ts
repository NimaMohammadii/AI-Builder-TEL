export const HOME_SECTION = `<section id="home" class="view active">
  <style>
    #home{overflow-y:auto!important;overflow-x:hidden!important;padding-bottom:120px!important;-webkit-overflow-scrolling:touch;scrollbar-width:none}
    #home::-webkit-scrollbar{display:none}
    #home .home-rewards-showcase{position:relative;margin:16px 0 12px;padding:14px;border-radius:30px;background:linear-gradient(135deg,rgba(255,255,255,.075),rgba(255,255,255,.026));box-shadow:0 22px 60px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.12);backdrop-filter:blur(10px) saturate(1.18);-webkit-backdrop-filter:blur(10px) saturate(1.18);overflow:hidden;color:#fff}
    #home .home-rewards-showcase:before{content:"";position:absolute;inset:-80px -70px auto auto;width:180px;height:180px;border-radius:999px;background:radial-gradient(circle,rgba(255,255,255,.09),rgba(255,255,255,.045) 42%,rgba(255,255,255,0) 70%);pointer-events:none}
    #home .home-rewards-head{position:relative;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin:0 0 12px}
    #home .home-rewards-kicker{display:inline-flex;align-items:center;gap:6px;margin:0 0 5px;color:rgba(255,255,255,.52);font-size:9px;font-weight:950;text-transform:uppercase;letter-spacing:.16em}
    #home .home-rewards-kicker:before{content:"";width:7px;height:7px;border-radius:999px;background:#fff;box-shadow:0 0 18px rgba(255,255,255,.8)}
    #home .home-rewards-head h3{margin:0;color:#fff;font-size:22px;line-height:.96;font-weight:950;letter-spacing:-.06em}
    #home .home-rewards-head p{margin:6px 0 0;max-width:250px;color:rgba(255,255,255,.58);font-size:10.5px;line-height:1.28;font-weight:650;letter-spacing:-.02em}
    #home .home-rewards-streak{height:34px;min-width:74px;border-radius:999px;display:grid;place-items:center;padding:0 12px;background:rgba(255,255,255,.075);box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 12px 24px rgba(0,0,0,.16);color:#fff;font-size:11px;font-weight:950;white-space:nowrap}
    #home .home-daily-reward-card{position:relative;display:grid;grid-template-columns:54px minmax(0,1fr) auto;gap:11px;align-items:center;margin:0 0 10px;padding:12px;border-radius:24px;background:linear-gradient(135deg,rgba(255,255,255,.065),rgba(255,255,255,.026));box-shadow:inset 0 1px 0 rgba(255,255,255,.13),0 18px 42px rgba(0,0,0,.18)}
    #home .home-daily-reward-orb{width:54px;height:54px;border-radius:20px;display:grid;place-items:center;background:linear-gradient(135deg,rgba(255,255,255,.20),rgba(255,255,255,.055));box-shadow:inset 0 1px 0 rgba(255,255,255,.22),0 14px 28px rgba(0,0,0,.18);font-size:26px;filter:none}
    #home .home-daily-reward-main{min-width:0}.home-daily-reward-main strong{display:block;color:#fff;font-size:16px;font-weight:950;line-height:1;letter-spacing:-.045em}.home-daily-reward-main span{display:block;margin-top:6px;color:rgba(255,255,255,.55);font-size:10px;font-weight:750;line-height:1.25}
    #home .home-daily-reward-action{border:0;border-radius:999px;padding:10px 13px;background:#fff;color:#050505;font-size:10px;font-weight:950;letter-spacing:-.02em;box-shadow:0 14px 28px rgba(255,255,255,.12);white-space:nowrap;opacity:.96}
    #home .home-reward-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
    #home .home-reward-mini{position:relative;min-height:78px;border-radius:21px;background:rgba(255,255,255,.045);box-shadow:inset 0 1px 0 rgba(255,255,255,.10),0 12px 26px rgba(0,0,0,.13);padding:10px 9px;overflow:hidden}
    #home .home-reward-mini:after{content:"";position:absolute;right:-20px;top:-24px;width:58px;height:58px;border-radius:999px;background:rgba(255,255,255,.055)}
    #home .home-reward-mini i{position:relative;display:block;font-style:normal;font-size:20px;line-height:1;margin-bottom:8px}.home-reward-mini strong{position:relative;display:block;color:#fff;font-size:11px;font-weight:950;line-height:1.05;letter-spacing:-.035em}.home-reward-mini span{position:relative;display:block;margin-top:5px;color:rgba(255,255,255,.48);font-size:8.8px;font-weight:750;line-height:1.15}
    @media(max-width:380px){#home .home-daily-reward-card{grid-template-columns:48px minmax(0,1fr);gap:9px}.home-daily-reward-action{grid-column:1 / -1;width:100%;height:38px}.home-reward-grid{gap:6px}.home-reward-mini{min-height:72px;padding:9px 8px}.home-reward-mini strong{font-size:10px}.home-reward-mini span{font-size:8px}}
  </style>
  <section class="home-intro-card">
    <h2>Welcome to Vexa FLOW</h2>
    <p>Vexa FLOW is your mini app for managing your TON balance, playing interactive games, and accessing future market features from one clean experience</p>
  </section>

  <section class="home-finance-split">
    <div class="home-finance-actions">
      <button class="home-finance-card" type="button" data-action="open-deposit">
        <span class="home-finance-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><path d="M24 8v24" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/><path d="M14 22l10 10 10-10" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><rect x="8" y="34" width="32" height="6" rx="3" fill="currentColor" opacity=".34"/></svg></span>
        <strong>Deposit</strong>
        <span>Add TON balance</span>
      </button>
      <button class="home-finance-card" type="button" data-action="open-withdraw">
        <span class="home-finance-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><path d="M24 40V16" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/><path d="M14 26l10-10 10 10" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><rect x="8" y="8" width="32" height="6" rx="3" fill="currentColor" opacity=".34"/></svg></span>
        <strong>Withdraw</strong>
        <span>Send TON out</span>
      </button>
    </div>
    <div class="home-finance-visual">
      <img src="/app/api/home-finance-image.png" alt="" decoding="async"/>
    </div>
  </section>

  <section class="home-rewards-showcase" aria-label="Daily rewards preview">
    <div class="home-rewards-head">
      <div>
        <div class="home-rewards-kicker">Rewards Hub</div>
        <h3>Daily Prize</h3>
        <p>Collect streak rewards, unlock mystery gifts, and build your Vexa status every day.</p>
      </div>
      <div class="home-rewards-streak">Day 1</div>
    </div>
    <div class="home-daily-reward-card">
      <div class="home-daily-reward-orb" aria-hidden="true">🎁</div>
      <div class="home-daily-reward-main">
        <strong>Today Reward</strong>
        <span>+50 XP · Bonus chest preview · Claim system coming soon</span>
      </div>
      <button class="home-daily-reward-action" type="button" disabled>Preview</button>
    </div>
    <div class="home-reward-grid">
      <div class="home-reward-mini"><i>⚡</i><strong>XP Boost</strong><span>Daily activity bonus</span></div>
      <div class="home-reward-mini"><i>💎</i><strong>Gift Box</strong><span>Mystery reward slot</span></div>
      <div class="home-reward-mini"><i>🔥</i><strong>Streak</strong><span>Return every day</span></div>
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