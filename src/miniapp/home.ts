export const HOME_SECTION = `<section id="home" class="view active">
  <style>
    #home{overflow-y:auto!important;overflow-x:hidden!important;padding-bottom:120px!important;-webkit-overflow-scrolling:touch;scrollbar-width:none}
    #home::-webkit-scrollbar{display:none}
    #home .home-rewards-showcase{position:relative;margin:22px 0 12px;padding:0;color:#fff;overflow:visible;background:transparent;box-shadow:none;backdrop-filter:none;-webkit-backdrop-filter:none;border-radius:0}
    #home .home-rewards-showcase:before{display:none}
    #home .home-rewards-head{position:relative;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin:0 0 14px}
    #home .home-rewards-kicker{display:inline-flex;align-items:center;gap:6px;margin:0 0 5px;color:rgba(255,255,255,.48);font-size:8.5px;font-weight:950;text-transform:uppercase;letter-spacing:.17em}
    #home .home-rewards-kicker:before{content:"";width:6px;height:6px;border-radius:999px;background:#fff;box-shadow:0 0 14px rgba(255,255,255,.62)}
    #home .home-rewards-head h3{margin:0;color:#fff;font-size:25px;line-height:.92;font-weight:1000;letter-spacing:-.07em}
    #home .home-rewards-head p{margin:7px 0 0;max-width:265px;color:rgba(255,255,255,.48);font-size:10.5px;line-height:1.32;font-weight:650;letter-spacing:-.02em}
    #home .home-rewards-streak{height:32px;min-width:66px;border-radius:999px;display:grid;place-items:center;padding:0 11px;background:#fff;color:#050505;font-size:10px;font-weight:1000;white-space:nowrap}
    #home .home-reward-days{display:flex;gap:7px;overflow-x:auto;overflow-y:hidden;margin:0 -18px 16px;padding:0 18px 6px;scroll-snap-type:x proximity;scrollbar-width:none;-webkit-overflow-scrolling:touch}
    #home .home-reward-days::-webkit-scrollbar{display:none}
    #home .home-reward-day{position:relative;flex:0 0 54px;height:66px;border:0;border-radius:19px;background:rgba(255,255,255,.045);box-shadow:inset 0 1px 0 rgba(255,255,255,.09);color:#fff;padding:8px 7px 7px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;scroll-snap-align:center;opacity:.68;overflow:hidden}
    #home .home-reward-day.done{opacity:.86;background:rgba(255,255,255,.065)}
    #home .home-reward-day.current{opacity:1;background:rgba(255,255,255,.12);color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 14px 26px rgba(0,0,0,.12)}
    #home .home-reward-day svg{width:17px;height:17px;display:block;stroke:currentColor;stroke-width:2.1;stroke-linecap:round;stroke-linejoin:round;fill:none;opacity:.9}
    #home .home-reward-day small{font-size:7px;font-weight:1000;text-transform:uppercase;letter-spacing:.09em;opacity:.68;line-height:1}
    #home .home-reward-day strong{font-size:17px;font-weight:1000;letter-spacing:-.06em;line-height:1}
    #home .home-reward-day.current:after{content:"Today";position:absolute;top:5px;right:5px;height:13px;padding:0 5px;border-radius:999px;background:#fff;color:#050505;font-size:6.5px;font-weight:1000;display:grid;place-items:center;box-shadow:none}
    #home .home-daily-reward-card{position:relative;display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:11px;align-items:center;margin:0 0 14px;padding:0 0 15px;border-radius:0;background:transparent;box-shadow:none;border-bottom:1px solid rgba(255,255,255,.08)}
    #home .home-daily-reward-orb{width:44px;height:44px;border-radius:17px;display:grid;place-items:center;background:rgba(255,255,255,.065);box-shadow:inset 0 1px 0 rgba(255,255,255,.12);filter:none;color:#fff}
    #home .home-daily-reward-orb svg{width:21px;height:21px;display:block;stroke:currentColor;stroke-width:2.1;stroke-linecap:round;stroke-linejoin:round;fill:none}
    #home .home-daily-reward-main{min-width:0}.home-daily-reward-main strong{display:block;color:#fff;font-size:15.5px;font-weight:950;line-height:1;letter-spacing:-.045em}.home-daily-reward-main span{display:block;margin-top:6px;color:rgba(255,255,255,.47);font-size:9.5px;font-weight:750;line-height:1.25}
    #home .home-daily-reward-action{border:0;border-radius:999px;padding:9px 12px;background:#fff;color:#050505;font-size:9.5px;font-weight:950;letter-spacing:-.02em;box-shadow:none;white-space:nowrap;opacity:.96}
    #home .home-missions-title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:4px 0 6px;color:#fff}
    #home .home-missions-title strong{font-size:13px;font-weight:1000;letter-spacing:-.04em;line-height:1}
    #home .home-missions-title span{height:22px;padding:0 8px;border-radius:999px;display:grid;place-items:center;background:rgba(255,255,255,.075);color:rgba(255,255,255,.62);font-size:8px;font-weight:950;box-shadow:inset 0 1px 0 rgba(255,255,255,.10)}
    #home .home-missions-list{position:relative;display:grid;gap:7px;margin-top:0}
    #home .home-missions-list:before{display:none}
    #home .home-mission-row{position:relative;display:grid;grid-template-columns:32px minmax(0,1fr) auto;gap:10px;align-items:center;min-height:52px;padding:8px 9px;border-radius:16px;background:rgba(255,255,255,.038);box-shadow:inset 0 1px 0 rgba(255,255,255,.075);overflow:hidden;border-bottom:0}
    #home .home-mission-row.primary{background:rgba(255,255,255,.065);box-shadow:inset 0 1px 0 rgba(255,255,255,.12)}
    #home .home-mission-row:after{content:"";position:absolute;right:-28px;top:-32px;width:70px;height:70px;border-radius:999px;background:rgba(255,255,255,.028);pointer-events:none}
    #home .home-mission-icon{position:relative;z-index:1;width:32px;height:32px;border-radius:12px;display:grid;place-items:center;background:rgba(255,255,255,.065);box-shadow:inset 0 1px 0 rgba(255,255,255,.12);color:#fff}
    #home .home-mission-row.primary .home-mission-icon{background:#fff;color:#050505}
    #home .home-mission-icon svg{width:16px;height:16px;display:block;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;fill:none}
    #home .home-mission-main{position:relative;z-index:1;min-width:0}.home-mission-main strong{display:block;color:#fff;font-size:12.5px;font-weight:950;line-height:1;letter-spacing:-.035em}.home-mission-main span{display:block;margin-top:5px;color:rgba(255,255,255,.43);font-size:8.6px;font-weight:750;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #home .home-mission-reward{position:relative;z-index:1;height:24px;padding:0 8px;border-radius:999px;display:grid;place-items:center;background:rgba(255,255,255,.07);color:rgba(255,255,255,.74);font-size:8.5px;font-weight:950;white-space:nowrap;box-shadow:inset 0 1px 0 rgba(255,255,255,.1)}
    #home .home-mission-row.primary .home-mission-reward{background:#fff;color:#050505;box-shadow:none}
    @media(max-width:380px){#home .home-rewards-head h3{font-size:23px}#home .home-reward-day{flex-basis:50px;height:63px;border-radius:18px}.home-daily-reward-card{grid-template-columns:42px minmax(0,1fr);gap:9px}.home-daily-reward-action{grid-column:1 / -1;width:100%;height:36px}.home-daily-reward-orb{width:42px;height:42px;border-radius:16px}.home-mission-row{grid-template-columns:30px minmax(0,1fr) auto;gap:8px;min-height:49px;padding:7px 8px}.home-mission-icon{width:30px;height:30px;border-radius:11px}.home-mission-main strong{font-size:11.7px}.home-mission-main span{font-size:8px}.home-mission-reward{height:23px;font-size:8px;padding:0 7px}}
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
        <p>Complete daily missions, keep your streak active, and unlock bigger prizes soon.</p>
      </div>
      <div class="home-rewards-streak">Day 3</div>
    </div>
    <div class="home-reward-days" aria-label="Weekly reward days">
      <button class="home-reward-day done" type="button"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7"/></svg><small>Day</small><strong>1</strong></button>
      <button class="home-reward-day done" type="button"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7"/></svg><small>Day</small><strong>2</strong></button>
      <button class="home-reward-day current" type="button"><svg viewBox="0 0 24 24"><path d="M20 12v8H4v-8"/><path d="M2.5 7h19v5h-19z"/><path d="M12 7v13"/><path d="M12 7H8.4A2.2 2.2 0 1 1 12 4.8V7z"/><path d="M12 7h3.6A2.2 2.2 0 1 0 12 4.8V7z"/></svg><small>Day</small><strong>3</strong></button>
      <button class="home-reward-day" type="button"><svg viewBox="0 0 24 24"><path d="M13 2L4 14h7l-1 8 10-13h-7l1-7z"/></svg><small>Day</small><strong>4</strong></button>
      <button class="home-reward-day" type="button"><svg viewBox="0 0 24 24"><path d="M6 3h12l4 6-10 12L2 9l4-6z"/><path d="M2 9h20"/><path d="M8 3l4 18 4-18"/></svg><small>Day</small><strong>5</strong></button>
      <button class="home-reward-day" type="button"><svg viewBox="0 0 24 24"><path d="M12 3s6 5.2 6 10.5A6 6 0 0 1 6 13.5C6 8.2 12 3 12 3z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 5 0c0-1.8-2.5-4.5-2.5-4.5s-2.5 2.7-2.5 4.5z"/></svg><small>Day</small><strong>6</strong></button>
      <button class="home-reward-day" type="button"><svg viewBox="0 0 24 24"><path d="M4 18h16"/><path d="M5 18l1.5-10 4 4 1.5-7 1.5 7 4-4L19 18"/></svg><small>Day</small><strong>7</strong></button>
    </div>
    <div class="home-daily-reward-card">
      <div class="home-daily-reward-orb" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20 12v8H4v-8"/><path d="M2.5 7h19v5h-19z"/><path d="M12 7v13"/><path d="M12 7H8.4A2.2 2.2 0 1 1 12 4.8V7z"/><path d="M12 7h3.6A2.2 2.2 0 1 0 12 4.8V7z"/></svg></div>
      <div class="home-daily-reward-main">
        <strong>Day 3 Reward</strong>
        <span>Current day · +90 XP · bonus chest preview</span>
      </div>
      <button class="home-daily-reward-action" type="button" disabled>Preview</button>
    </div>
    <div class="home-missions-title"><strong>Today missions</strong><span>0 / 6 done</span></div>
    <div class="home-missions-list">
      <div class="home-mission-row primary"><div class="home-mission-icon"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7"/></svg></div><div class="home-mission-main"><strong>Daily Check-in</strong><span>Open Vexa FLOW once today</span></div><div class="home-mission-reward">+50 XP</div></div>
      <div class="home-mission-row"><div class="home-mission-icon"><svg viewBox="0 0 24 24"><path d="M6 8h12v8H6z"/><path d="M8 12h3"/><path d="M9.5 10.5v3"/><path d="M15 11.5h.01"/><path d="M17 13.5h.01"/></svg></div><div class="home-mission-main"><strong>Play 3 Games</strong><span>Complete any three Play Zone rounds</span></div><div class="home-mission-reward">+90 XP</div></div>
      <div class="home-mission-row"><div class="home-mission-icon"><svg viewBox="0 0 24 24"><path d="M12 3v3"/><path d="M12 18v3"/><path d="M3 12h3"/><path d="M18 12h3"/><path d="M7.8 7.8l2.1 2.1"/><path d="M14.1 14.1l2.1 2.1"/><path d="M16.2 7.8l-2.1 2.1"/><path d="M9.9 14.1l-2.1 2.1"/><circle cx="12" cy="12" r="3"/></svg></div><div class="home-mission-main"><strong>Use AI Builder</strong><span>Generate or test one AI action</span></div><div class="home-mission-reward">+40 XP</div></div>
      <div class="home-mission-row"><div class="home-mission-icon"><svg viewBox="0 0 24 24"><path d="M7 17L17 7"/><path d="M9 7h8v8"/></svg></div><div class="home-mission-main"><strong>Invite a Friend</strong><span>Bring one new player to Vexa</span></div><div class="home-mission-reward">Gift</div></div>
      <div class="home-mission-row"><div class="home-mission-icon"><svg viewBox="0 0 24 24"><path d="M12 3l8 8-8 10-8-10 8-8z"/><path d="M4 11h16"/></svg></div><div class="home-mission-main"><strong>Open Rewards Hub</strong><span>Check today’s reward missions</span></div><div class="home-mission-reward">+15 XP</div></div>
      <div class="home-mission-row"><div class="home-mission-icon"><svg viewBox="0 0 24 24"><path d="M12 3s6 5.2 6 10.5A6 6 0 0 1 6 13.5C6 8.2 12 3 12 3z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 5 0c0-1.8-2.5-4.5-2.5-4.5s-2.5 2.7-2.5 4.5z"/></svg></div><div class="home-mission-main"><strong>Keep Streak Alive</strong><span>Return tomorrow for a higher streak</span></div><div class="home-mission-reward">Streak</div></div>
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