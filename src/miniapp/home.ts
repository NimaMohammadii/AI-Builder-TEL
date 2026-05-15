export const HOME_SECTION = `<section id="home" class="view active">
  <style>
    #home{overflow-y:auto!important;overflow-x:hidden!important;padding-bottom:120px!important;-webkit-overflow-scrolling:touch;scrollbar-width:none}
    #home::-webkit-scrollbar{display:none}
    #home .home-rewards-showcase{position:relative;margin:22px 0 12px;padding:0;color:#fff;overflow:visible;background:transparent;box-shadow:none;backdrop-filter:none;-webkit-backdrop-filter:none;border-radius:0}
    #home .home-rewards-showcase:before{display:none}
    #home .home-rewards-head{position:relative;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin:0 0 15px}
    #home .home-rewards-kicker{display:inline-flex;align-items:center;gap:6px;margin:0 0 5px;color:rgba(255,255,255,.52);font-size:9px;font-weight:950;text-transform:uppercase;letter-spacing:.16em}
    #home .home-rewards-kicker:before{content:"";width:7px;height:7px;border-radius:999px;background:#fff;box-shadow:0 0 18px rgba(255,255,255,.8)}
    #home .home-rewards-head h3{margin:0;color:#fff;font-size:26px;line-height:.92;font-weight:1000;letter-spacing:-.07em}
    #home .home-rewards-head p{margin:7px 0 0;max-width:270px;color:rgba(255,255,255,.52);font-size:11px;line-height:1.32;font-weight:650;letter-spacing:-.02em}
    #home .home-rewards-streak{height:34px;min-width:74px;border-radius:999px;display:grid;place-items:center;padding:0 12px;background:#fff;color:#050505;font-size:11px;font-weight:1000;white-space:nowrap}
    #home .home-reward-days{display:flex;gap:8px;overflow-x:auto;overflow-y:hidden;margin:0 -18px 15px;padding:0 18px 4px;scroll-snap-type:x proximity;scrollbar-width:none;-webkit-overflow-scrolling:touch}
    #home .home-reward-days::-webkit-scrollbar{display:none}
    #home .home-reward-day{position:relative;flex:0 0 58px;height:74px;border:0;border-radius:22px;background:rgba(255,255,255,.055);box-shadow:inset 0 1px 0 rgba(255,255,255,.10);color:#fff;padding:8px 7px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;scroll-snap-align:center;opacity:.72}
    #home .home-reward-day.done{opacity:.9;background:rgba(255,255,255,.075)}
    #home .home-reward-day.current{opacity:1;background:#fff;color:#050505;box-shadow:0 14px 28px rgba(255,255,255,.10)}
    #home .home-reward-day small{font-size:8px;font-weight:1000;text-transform:uppercase;letter-spacing:.08em;opacity:.72;line-height:1}
    #home .home-reward-day strong{font-size:18px;font-weight:1000;letter-spacing:-.055em;line-height:1}
    #home .home-reward-day span{font-size:14px;line-height:1}
    #home .home-reward-day.current:after{content:"Today";position:absolute;left:50%;bottom:-8px;transform:translateX(-50%);height:16px;padding:0 7px;border-radius:999px;background:rgba(255,255,255,.94);color:#050505;font-size:7px;font-weight:1000;display:grid;place-items:center;box-shadow:0 8px 18px rgba(0,0,0,.18)}
    #home .home-daily-reward-card{position:relative;display:grid;grid-template-columns:46px minmax(0,1fr) auto;gap:11px;align-items:center;margin:0 0 14px;padding:0 0 15px;border-radius:0;background:transparent;box-shadow:none;border-bottom:1px solid rgba(255,255,255,.09)}
    #home .home-daily-reward-orb{width:46px;height:46px;border-radius:18px;display:grid;place-items:center;background:rgba(255,255,255,.075);box-shadow:inset 0 1px 0 rgba(255,255,255,.13);font-size:22px;filter:none}
    #home .home-daily-reward-main{min-width:0}.home-daily-reward-main strong{display:block;color:#fff;font-size:16px;font-weight:950;line-height:1;letter-spacing:-.045em}.home-daily-reward-main span{display:block;margin-top:6px;color:rgba(255,255,255,.5);font-size:10px;font-weight:750;line-height:1.25}
    #home .home-daily-reward-action{border:0;border-radius:999px;padding:9px 12px;background:#fff;color:#050505;font-size:10px;font-weight:950;letter-spacing:-.02em;box-shadow:none;white-space:nowrap;opacity:.96}
    #home .home-missions-list{position:relative;display:grid;gap:0;margin-top:0}
    #home .home-missions-list:before{content:"";position:absolute;left:17px;top:20px;bottom:20px;width:1px;background:linear-gradient(180deg,rgba(255,255,255,.16),rgba(255,255,255,.04))}
    #home .home-mission-row{position:relative;display:grid;grid-template-columns:34px minmax(0,1fr) auto;gap:10px;align-items:center;min-height:54px;padding:9px 0;border-radius:0;background:transparent;box-shadow:none;overflow:visible;border-bottom:1px solid rgba(255,255,255,.055)}
    #home .home-mission-row:after{display:none}
    #home .home-mission-icon{position:relative;z-index:1;width:34px;height:34px;border-radius:13px;display:grid;place-items:center;background:rgba(255,255,255,.075);box-shadow:inset 0 1px 0 rgba(255,255,255,.13);font-size:15px;color:#fff;font-weight:950}
    #home .home-mission-main{position:relative;min-width:0}.home-mission-main strong{display:block;color:#fff;font-size:13px;font-weight:950;line-height:1;letter-spacing:-.035em}.home-mission-main span{display:block;margin-top:5px;color:rgba(255,255,255,.46);font-size:9px;font-weight:750;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #home .home-mission-reward{position:relative;height:25px;padding:0 9px;border-radius:999px;display:grid;place-items:center;background:rgba(255,255,255,.08);color:rgba(255,255,255,.78);font-size:9px;font-weight:950;white-space:nowrap;box-shadow:inset 0 1px 0 rgba(255,255,255,.11)}
    @media(max-width:380px){#home .home-rewards-head h3{font-size:24px}#home .home-reward-day{flex-basis:54px;height:70px;border-radius:20px}.home-daily-reward-card{grid-template-columns:42px minmax(0,1fr);gap:9px}.home-daily-reward-action{grid-column:1 / -1;width:100%;height:36px}.home-daily-reward-orb{width:42px;height:42px;border-radius:16px}.home-mission-row{grid-template-columns:32px minmax(0,1fr) auto;gap:8px;min-height:50px;padding:8px 0}.home-mission-icon{width:32px;height:32px;border-radius:12px}.home-mission-main strong{font-size:12px}.home-mission-main span{font-size:8.2px}.home-mission-reward{height:24px;font-size:8px;padding:0 7px}}
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
        <p>Complete daily missions, keep your streak alive, and unlock bigger prizes soon.</p>
      </div>
      <div class="home-rewards-streak">Day 3</div>
    </div>
    <div class="home-reward-days" aria-label="Weekly reward days">
      <button class="home-reward-day done" type="button"><span>✓</span><small>Day</small><strong>1</strong></button>
      <button class="home-reward-day done" type="button"><span>✓</span><small>Day</small><strong>2</strong></button>
      <button class="home-reward-day current" type="button"><span>🎁</span><small>Day</small><strong>3</strong></button>
      <button class="home-reward-day" type="button"><span>⚡</span><small>Day</small><strong>4</strong></button>
      <button class="home-reward-day" type="button"><span>💎</span><small>Day</small><strong>5</strong></button>
      <button class="home-reward-day" type="button"><span>🔥</span><small>Day</small><strong>6</strong></button>
      <button class="home-reward-day" type="button"><span>♛</span><small>Day</small><strong>7</strong></button>
    </div>
    <div class="home-daily-reward-card">
      <div class="home-daily-reward-orb" aria-hidden="true">🎁</div>
      <div class="home-daily-reward-main">
        <strong>Day 3 Reward</strong>
        <span>Current day · +90 XP · Bonus chest preview</span>
      </div>
      <button class="home-daily-reward-action" type="button" disabled>Preview</button>
    </div>
    <div class="home-missions-list">
      <div class="home-mission-row"><div class="home-mission-icon">✓</div><div class="home-mission-main"><strong>Daily Check-in</strong><span>Open Vexa FLOW once today</span></div><div class="home-mission-reward">+50 XP</div></div>
      <div class="home-mission-row"><div class="home-mission-icon">🎮</div><div class="home-mission-main"><strong>Play 3 Games</strong><span>Complete any three Play Zone rounds</span></div><div class="home-mission-reward">+90 XP</div></div>
      <div class="home-mission-row"><div class="home-mission-icon">AI</div><div class="home-mission-main"><strong>Use AI Builder</strong><span>Generate or test one AI action</span></div><div class="home-mission-reward">+40 XP</div></div>
      <div class="home-mission-row"><div class="home-mission-icon">↗</div><div class="home-mission-main"><strong>Invite a Friend</strong><span>Bring one new player to Vexa</span></div><div class="home-mission-reward">Gift</div></div>
      <div class="home-mission-row"><div class="home-mission-icon">◇</div><div class="home-mission-main"><strong>Open Rewards Hub</strong><span>Check today’s reward missions</span></div><div class="home-mission-reward">+15 XP</div></div>
      <div class="home-mission-row"><div class="home-mission-icon">🔥</div><div class="home-mission-main"><strong>Keep Streak Alive</strong><span>Return tomorrow for a higher streak</span></div><div class="home-mission-reward">Streak</div></div>
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