export const REFERRAL_SECTION = `<section id="referral" class="view referral-view">
  <style>
    #referral{overflow-y:auto!important;overflow-x:hidden!important;padding-bottom:120px!important;-webkit-overflow-scrolling:touch;scrollbar-width:none}
    #referral::-webkit-scrollbar{display:none}
    .referral-shell{display:grid;gap:12px;padding-top:2px}
    .referral-hero{border:0;border-radius:30px;background:linear-gradient(135deg,rgba(255,255,255,.055),rgba(90,8,18,.11));box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 18px 44px rgba(0,0,0,.24);backdrop-filter:blur(3px) saturate(1.14);-webkit-backdrop-filter:blur(3px) saturate(1.14);padding:18px 16px;display:grid;gap:13px;color:#fff;overflow:hidden;position:relative}
    .referral-hero:before{content:"";position:absolute;inset:auto -42px -72px auto;width:160px;height:160px;border-radius:999px;background:radial-gradient(circle,rgba(115,16,35,.32),rgba(115,16,35,0) 68%);pointer-events:none}
    .referral-hero-top{display:flex;align-items:center;gap:12px;position:relative;z-index:1}
    .referral-hero-icon{width:52px;height:52px;min-width:52px;border-radius:21px;display:grid;place-items:center;color:rgba(255,255,255,.9);background:rgba(255,255,255,.06);box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 12px 28px rgba(0,0,0,.2)}
    .referral-hero-icon svg{width:34px;height:34px;display:block}
    .referral-hero h2{margin:0;font-size:24px;line-height:.95;font-weight:950;letter-spacing:-.07em;color:#fff}
    .referral-hero p{margin:4px 0 0;font-size:12px;line-height:1.35;font-weight:650;color:rgba(255,255,255,.56)}
    .referral-reward-pill{position:relative;z-index:1;border-radius:20px;background:rgba(255,255,255,.055);box-shadow:inset 0 1px 0 rgba(255,255,255,.08);padding:12px;display:flex;align-items:center;justify-content:space-between;gap:10px}
    .referral-reward-pill span{font-size:11px;font-weight:750;color:rgba(255,255,255,.55)}
    .referral-reward-pill strong{font-size:18px;line-height:1;font-weight:950;letter-spacing:-.055em;color:#fff;white-space:nowrap}
    .referral-link-card{border:0;border-radius:26px;background:rgba(255,255,255,.035);box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 14px 34px rgba(0,0,0,.22);padding:14px;color:#fff;display:grid;gap:10px}
    .referral-link-card label{font-size:11px;font-weight:800;color:rgba(255,255,255,.52)}
    .referral-link-box{height:44px;border-radius:18px;background:rgba(0,0,0,.22);box-shadow:inset 0 1px 0 rgba(255,255,255,.055);display:flex;align-items:center;padding:0 12px;color:rgba(255,255,255,.66);font-size:12px;font-weight:700;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
    .referral-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .referral-action{height:46px;border:0;border-radius:18px;background:rgba(255,255,255,.065);box-shadow:inset 0 1px 0 rgba(255,255,255,.09),0 12px 28px rgba(0,0,0,.18);color:#fff;font-size:12px;font-weight:850}
    .referral-note{margin:0;color:rgba(255,255,255,.42);font-size:11px;line-height:1.35;font-weight:650;text-align:center}
  </style>
  <div class="referral-shell">
    <section class="referral-hero">
      <div class="referral-hero-top">
        <span class="referral-hero-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><path d="M15 26h13" stroke="currentColor" stroke-width="3.3" stroke-linecap="round"/><path d="M24 19l7 7-7 7" stroke="currentColor" stroke-width="3.3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="13" cy="26" r="6.5" stroke="currentColor" stroke-opacity=".45" stroke-width="2.6"/><circle cx="36" cy="15" r="5.5" fill="currentColor" opacity=".26"/><circle cx="36" cy="37" r="5.5" fill="currentColor" opacity=".26"/></svg></span>
        <span><h2>Referral Rewards</h2><p>Invite friends and earn TON after their first deposit.</p></span>
      </div>
      <div class="referral-reward-pill"><span>Reward per valid friend</span><strong>0.1 TON</strong></div>
    </section>
    <section class="referral-link-card">
      <label>Your referral link</label>
      <div class="referral-link-box">Referral link will appear here</div>
      <div class="referral-actions">
        <button class="referral-action" type="button">Copy Link</button>
        <button class="referral-action" type="button">Share</button>
      </div>
      <p class="referral-note">Reward unlocks when your invited friend makes their first deposit.</p>
    </section>
  </div>
</section>`;