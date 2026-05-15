export const HOME_SECTION = `<section id="home" class="view active">
  <style>
    #home{overflow-y:auto!important;overflow-x:hidden!important;padding-bottom:120px!important;-webkit-overflow-scrolling:touch;scrollbar-width:none}
    #home::-webkit-scrollbar{display:none}
    #home .home-rewards-entry{position:relative;margin:16px 0 12px;padding:14px;border:0;border-radius:30px;width:100%;display:grid;grid-template-columns:48px minmax(0,1fr) auto;gap:12px;align-items:center;text-align:left;color:#fff;background:linear-gradient(135deg,rgba(255,255,255,.075),rgba(255,255,255,.026));box-shadow:0 22px 60px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.11);overflow:hidden}
    #home .home-rewards-entry:before{content:"";position:absolute;right:-54px;top:-74px;width:160px;height:160px;border-radius:999px;background:radial-gradient(circle,rgba(255,255,255,.11),rgba(255,255,255,.04) 46%,rgba(255,255,255,0) 72%);pointer-events:none}
    #home .home-rewards-entry-icon{position:relative;z-index:1;width:48px;height:48px;border-radius:18px;display:grid;place-items:center;background:rgba(255,255,255,.075);box-shadow:inset 0 1px 0 rgba(255,255,255,.13);color:#fff}
    #home .home-rewards-entry-icon svg{width:22px;height:22px;stroke:currentColor;stroke-width:2.15;stroke-linecap:round;stroke-linejoin:round;fill:none}
    #home .home-rewards-entry-main{position:relative;z-index:1;min-width:0}.home-rewards-entry-main span{display:block;margin-bottom:5px;color:rgba(255,255,255,.48);font-size:8.5px;font-weight:800;text-transform:uppercase;letter-spacing:.16em}.home-rewards-entry-main strong{display:block;color:#fff;font-size:17px;font-weight:800;line-height:1;letter-spacing:-.035em}.home-rewards-entry-main small{display:block;margin-top:6px;color:rgba(255,255,255,.5);font-size:9.2px;font-weight:600;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #home .home-rewards-entry-arrow{position:relative;z-index:1;width:34px;height:34px;border-radius:999px;display:grid;place-items:center;background:#fff;color:#050505;box-shadow:0 12px 26px rgba(255,255,255,.08)}
    #home .home-rewards-entry-arrow svg{width:15px;height:15px;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;fill:none}
    #home .rewards-page{position:fixed;inset:0;z-index:10050;display:block;overflow:auto;padding:calc(54px + env(safe-area-inset-top)) 18px calc(98px + env(safe-area-inset-bottom));background:radial-gradient(circle at 50% -10%,rgba(255,255,255,.08),rgba(255,255,255,0) 34%),#050507;opacity:0;pointer-events:none;transform:translateX(18px);transition:opacity .26s ease,transform .32s cubic-bezier(.2,.9,.2,1);scrollbar-width:none}
    #home .rewards-page::-webkit-scrollbar{display:none}
    #home .rewards-page.open{opacity:1;pointer-events:auto;transform:translateX(0)}
    #home .rewards-page-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin:0 0 20px}.rewards-page-kicker{margin:0 0 6px;color:rgba(255,255,255,.48);font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.18em}.rewards-page-title{margin:0;color:#fff;font-size:34px;line-height:.9;font-weight:800;letter-spacing:-.055em}.rewards-page-sub{margin:10px 0 0;max-width:318px;color:rgba(255,255,255,.52);font-size:11px;line-height:1.35;font-weight:500;letter-spacing:-.01em}.rewards-page-back{width:38px;height:38px;border:0;border-radius:999px;background:rgba(255,255,255,.08);color:#fff;font-size:22px;font-weight:700;box-shadow:inset 0 1px 0 rgba(255,255,255,.12)}
    #home .rewards-status-strip{display:grid;grid-template-columns:48px minmax(0,1fr) auto;gap:11px;align-items:center;margin:0 0 18px;padding:0 0 16px;border-bottom:1px solid rgba(255,255,255,.08)}.rewards-status-icon{width:48px;height:48px;border-radius:18px;display:grid;place-items:center;background:rgba(255,255,255,.07);box-shadow:inset 0 1px 0 rgba(255,255,255,.12);color:#fff}.rewards-status-icon svg{width:22px;height:22px;stroke:currentColor;stroke-width:2.15;stroke-linecap:round;stroke-linejoin:round;fill:none}.rewards-status-main strong{display:block;color:#fff;font-size:17px;font-weight:800;line-height:1;letter-spacing:-.025em}.rewards-status-main span{display:block;margin-top:6px;color:rgba(255,255,255,.47);font-size:9.4px;font-weight:500}.rewards-status-pill{height:30px;padding:0 10px;border-radius:999px;background:rgba(255,255,255,.09);color:rgba(255,255,255,.78);font-size:9px;font-weight:700;display:grid;place-items:center;white-space:nowrap}
    #home .reward-days{display:flex;gap:7px;overflow-x:auto;overflow-y:visible;margin:0 -18px 22px;padding:0 18px 14px;scrollbar-width:none;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch}.reward-days::-webkit-scrollbar{display:none}.reward-day{position:relative;flex:0 0 54px;height:66px;border:0;border-radius:19px;background:rgba(255,255,255,.045);box-shadow:inset 0 1px 0 rgba(255,255,255,.09);color:#fff;padding:8px 7px 7px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;scroll-snap-align:center;opacity:.68;overflow:visible}.reward-day.done{opacity:.86;background:rgba(255,255,255,.065)}.reward-day.current{opacity:1;background:rgba(255,255,255,.12);color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 14px 26px rgba(0,0,0,.12)}.reward-day svg{width:17px;height:17px;stroke:currentColor;stroke-width:2.1;stroke-linecap:round;stroke-linejoin:round;fill:none;opacity:.9}.reward-day small{font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;opacity:.68;line-height:1}.reward-day strong{font-size:17px;font-weight:800;letter-spacing:-.035em;line-height:1}.reward-day.current:after{content:"Today";position:absolute;left:50%;bottom:-8px;transform:translateX(-50%);height:16px;padding:0 7px;border-radius:999px;background:#fff;color:#050505;font-size:7px;font-weight:800;display:grid;place-items:center;box-shadow:0 8px 16px rgba(0,0,0,.18)}
    #home .reward-today{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:11px;align-items:center;margin:0 0 18px;padding:0 0 16px;border-bottom:1px solid rgba(255,255,255,.08)}.reward-today-icon{width:44px;height:44px;border-radius:17px;display:grid;place-items:center;background:rgba(255,255,255,.065);box-shadow:inset 0 1px 0 rgba(255,255,255,.12);color:#fff}.reward-today-icon svg{width:21px;height:21px;stroke:currentColor;stroke-width:2.1;stroke-linecap:round;stroke-linejoin:round;fill:none}.reward-today-main strong{display:block;color:#fff;font-size:15.5px;font-weight:800;line-height:1;letter-spacing:-.025em}.reward-today-main span{display:block;margin-top:6px;color:rgba(255,255,255,.47);font-size:9.5px;font-weight:500;line-height:1.25}.reward-today-button{border:0;border-radius:999px;padding:9px 12px;background:#fff;color:#050505;font-size:9.5px;font-weight:700;white-space:nowrap}
    #home .missions-title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:4px 0 9px;color:#fff}.missions-title strong{font-size:14px;font-weight:800;letter-spacing:-.025em;line-height:1}.missions-title span{height:24px;padding:0 9px;border-radius:999px;display:grid;place-items:center;background:rgba(255,255,255,.075);color:rgba(255,255,255,.62);font-size:8.5px;font-weight:700;box-shadow:inset 0 1px 0 rgba(255,255,255,.10)}.missions-list{display:grid;gap:9px}.mission-row{position:relative;display:grid;grid-template-columns:40px minmax(0,1fr) auto;gap:12px;align-items:center;min-height:66px;padding:11px 12px;border-radius:21px;background:rgba(255,255,255,.038);box-shadow:inset 0 1px 0 rgba(255,255,255,.075),0 12px 26px rgba(0,0,0,.11);overflow:hidden}.mission-row.primary{background:rgba(255,255,255,.075);box-shadow:inset 0 1px 0 rgba(255,255,255,.13),0 12px 28px rgba(0,0,0,.12)}.mission-icon{position:relative;z-index:1;width:40px;height:40px;border-radius:15px;display:grid;place-items:center;background:rgba(255,255,255,.065);box-shadow:inset 0 1px 0 rgba(255,255,255,.12);color:#fff}.mission-row.primary .mission-icon{background:rgba(255,255,255,.12);color:#fff}.mission-icon svg{width:18px;height:18px;stroke:currentColor;stroke-width:2.15;stroke-linecap:round;stroke-linejoin:round;fill:none}.mission-main{position:relative;z-index:1;min-width:0}.mission-main strong{display:block;color:#fff;font-size:15px;font-weight:700;line-height:1;letter-spacing:-.02em}.mission-main span{display:block;margin-top:7px;color:rgba(255,255,255,.48);font-size:10.5px;font-weight:500;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mission-reward{position:relative;z-index:1;height:28px;padding:0 10px;border-radius:999px;display:grid;place-items:center;background:rgba(255,255,255,.075);color:rgba(255,255,255,.78);font-size:9.5px;font-weight:700;white-space:nowrap;box-shadow:inset 0 1px 0 rgba(255,255,255,.1)}.mission-row.primary .mission-reward{background:rgba(255,255,255,.13);color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.12)}
    @media(max-width:380px){#home .home-rewards-entry{grid-template-columns:44px minmax(0,1fr) 32px;padding:13px}.rewards-page-title{font-size:30px}.reward-day{flex-basis:50px;height:63px;border-radius:18px}.reward-today{grid-template-columns:42px minmax(0,1fr);gap:9px}.reward-today-button{grid-column:1 / -1;width:100%;height:36px}.reward-today-icon{width:42px;height:42px;border-radius:16px}.mission-row{grid-template-columns:36px minmax(0,1fr) auto;gap:10px;min-height:60px;padding:10px 10px}.mission-icon{width:36px;height:36px;border-radius:14px}.mission-main strong{font-size:13.5px}.mission-main span{font-size:9.5px}.mission-reward{height:26px;font-size:8.8px;padding:0 8px}}
  </style>
  <section class="home-intro-card">
    <h2>Welcome to Vexa</h2>
    <p>Vexa is your mini app for managing your TON balance, playing interactive games, and accessing future market features from one clean experience</p>
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

  <button class="home-rewards-entry" type="button" data-action="open-rewards">
    <span class="home-rewards-entry-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20 12v8H4v-8"/><path d="M2.5 7h19v5h-19z"/><path d="M12 7v13"/><path d="M12 7H8.4A2.2 2.2 0 1 1 12 4.8V7z"/><path d="M12 7h3.6A2.2 2.2 0 1 0 12 4.8V7z"/></svg></span>
    <span class="home-rewards-entry-main"><span>Rewards Hub</span><strong>Daily Prize</strong><small>Day 3 active · 6 missions available</small></span>
    <span class="home-rewards-entry-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></span>
  </button>

  <div id="rewardsPage" class="rewards-page" aria-hidden="true">
    <div class="rewards-page-top"><div><p class="rewards-page-kicker">Vexa Rewards</p><h2 class="rewards-page-title">Daily Prize</h2><p class="rewards-page-sub">Complete daily missions, keep your streak active, and unlock bigger prizes soon.</p></div><button class="rewards-page-back" type="button" data-action="close-rewards" aria-label="Back">‹</button></div>
    <div class="rewards-status-strip"><div class="rewards-status-icon"><svg viewBox="0 0 24 24"><path d="M12 3s6 5.2 6 10.5A6 6 0 0 1 6 13.5C6 8.2 12 3 12 3z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 5 0c0-1.8-2.5-4.5-2.5-4.5s-2.5 2.7-2.5 4.5z"/></svg></div><div class="rewards-status-main"><strong>Day 3 Streak</strong><span>Current day · reward preview only</span></div><div class="rewards-status-pill">0 / 6</div></div>
    <div class="reward-days" aria-label="Weekly reward days">
      <button class="reward-day done" type="button"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7"/></svg><small>Day</small><strong>1</strong></button>
      <button class="reward-day done" type="button"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7"/></svg><small>Day</small><strong>2</strong></button>
      <button class="reward-day current" type="button"><svg viewBox="0 0 24 24"><path d="M20 12v8H4v-8"/><path d="M2.5 7h19v5h-19z"/><path d="M12 7v13"/><path d="M12 7H8.4A2.2 2.2 0 1 1 12 4.8V7z"/><path d="M12 7h3.6A2.2 2.2 0 1 0 12 4.8V7z"/></svg><small>Day</small><strong>3</strong></button>
      <button class="reward-day" type="button"><svg viewBox="0 0 24 24"><path d="M13 2L4 14h7l-1 8 10-13h-7l1-7z"/></svg><small>Day</small><strong>4</strong></button>
      <button class="reward-day" type="button"><svg viewBox="0 0 24 24"><path d="M6 3h12l4 6-10 12L2 9l4-6z"/><path d="M2 9h20"/><path d="M8 3l4 18 4-18"/></svg><small>Day</small><strong>5</strong></button>
      <button class="reward-day" type="button"><svg viewBox="0 0 24 24"><path d="M12 3s6 5.2 6 10.5A6 6 0 0 1 6 13.5C6 8.2 12 3 12 3z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 5 0c0-1.8-2.5-4.5-2.5-4.5s-2.5 2.7-2.5 4.5z"/></svg><small>Day</small><strong>6</strong></button>
      <button class="reward-day" type="button"><svg viewBox="0 0 24 24"><path d="M4 18h16"/><path d="M5 18l1.5-10 4 4 1.5-7 1.5 7 4-4L19 18"/></svg><small>Day</small><strong>7</strong></button>
    </div>
    <div class="reward-today"><div class="reward-today-icon"><svg viewBox="0 0 24 24"><path d="M20 12v8H4v-8"/><path d="M2.5 7h19v5h-19z"/><path d="M12 7v13"/><path d="M12 7H8.4A2.2 2.2 0 1 1 12 4.8V7z"/><path d="M12 7h3.6A2.2 2.2 0 1 0 12 4.8V7z"/></svg></div><div class="reward-today-main"><strong>Day 3 Reward</strong><span>+90 XP · bonus chest preview</span></div><button class="reward-today-button" type="button" disabled>Preview</button></div>
    <div class="missions-title"><strong>Today missions</strong><span>0 / 6 done</span></div>
    <div class="missions-list">
      <div class="mission-row primary"><div class="mission-icon"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7"/></svg></div><div class="mission-main"><strong>Daily Check-in</strong><span>Open Vexa once today</span></div><div class="mission-reward">+50 XP</div></div>
      <div class="mission-row"><div class="mission-icon"><svg viewBox="0 0 24 24"><path d="M6 8h12v8H6z"/><path d="M8 12h3"/><path d="M9.5 10.5v3"/><path d="M15 11.5h.01"/><path d="M17 13.5h.01"/></svg></div><div class="mission-main"><strong>Play 3 Games</strong><span>Complete any three Play Zone rounds</span></div><div class="mission-reward">+90 XP</div></div>
      <div class="mission-row"><div class="mission-icon"><svg viewBox="0 0 24 24"><path d="M12 3v3"/><path d="M12 18v3"/><path d="M3 12h3"/><path d="M18 12h3"/><path d="M7.8 7.8l2.1 2.1"/><path d="M14.1 14.1l2.1 2.1"/><path d="M16.2 7.8l-2.1 2.1"/><path d="M9.9 14.1l-2.1 2.1"/><circle cx="12" cy="12" r="3"/></svg></div><div class="mission-main"><strong>Use AI Builder</strong><span>Generate or test one AI action</span></div><div class="mission-reward">+40 XP</div></div>
      <div class="mission-row"><div class="mission-icon"><svg viewBox="0 0 24 24"><path d="M7 17L17 7"/><path d="M9 7h8v8"/></svg></div><div class="mission-main"><strong>Invite a Friend</strong><span>Bring one new player to Vexa</span></div><div class="mission-reward">Gift</div></div>
      <div class="mission-row"><div class="mission-icon"><svg viewBox="0 0 24 24"><path d="M12 3l8 8-8 10-8-10 8-8z"/><path d="M4 11h16"/></svg></div><div class="mission-main"><strong>Open Rewards Hub</strong><span>Check today’s reward missions</span></div><div class="mission-reward">+15 XP</div></div>
      <div class="mission-row"><div class="mission-icon"><svg viewBox="0 0 24 24"><path d="M12 3s6 5.2 6 10.5A6 6 0 0 1 6 13.5C6 8.2 12 3 12 3z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 5 0c0-1.8-2.5-4.5-2.5-4.5s-2.5 2.7-2.5 4.5z"/></svg></div><div class="mission-main"><strong>Keep Streak Alive</strong><span>Return tomorrow for a higher streak</span></div><div class="mission-reward">Streak</div></div>
    </div>
  </div>

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