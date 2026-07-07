export const DAILY_REWARDS_INFO_SECTION = `<section id="dailyrewardsinfo" class="view daily-rewards-info-view" aria-hidden="true">
  <style>
    .daily-rewards-info-view{display:block!important;position:fixed!important;inset:0!important;z-index:10040;height:100vh!important;width:100vw!important;overflow:hidden!important;padding:calc(64px + env(safe-area-inset-top)) 16px calc(16px + env(safe-area-inset-bottom))!important;background:radial-gradient(circle at 50% 0,rgba(92,10,35,.24),rgba(0,0,0,.02) 46%),rgba(0,0,0,.03)!important;backdrop-filter:blur(10px) saturate(1.1)!important;-webkit-backdrop-filter:blur(10px) saturate(1.1)!important;box-sizing:border-box;opacity:0!important;visibility:hidden!important;pointer-events:none!important;transform:translate3d(0,24px,0) scale(.975)!important;transition:opacity .26s cubic-bezier(.2,.8,.2,1),transform .30s cubic-bezier(.2,.8,.2,1),visibility 0s linear .30s!important;will-change:opacity,transform!important;contain:layout paint style!important}
    .daily-rewards-info-view.active{opacity:1!important;visibility:visible!important;pointer-events:auto!important;transform:translate3d(0,0,0) scale(1)!important;transition:opacity .26s cubic-bezier(.2,.8,.2,1),transform .30s cubic-bezier(.2,.8,.2,1),visibility 0s!important}
    .daily-rewards-info-view.is-closing{opacity:0!important;visibility:visible!important;pointer-events:none!important;transform:translate3d(0,18px,0) scale(.985)!important;transition:opacity .18s cubic-bezier(.4,0,1,1),transform .20s cubic-bezier(.4,0,1,1),visibility 0s linear .20s!important}
    .daily-rewards-info-shell{height:100%;max-width:430px;margin:0 auto;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-bottom:96px;box-sizing:border-box;display:grid;gap:12px;align-content:start}
    .daily-rewards-info-shell::-webkit-scrollbar{display:none}
    .daily-info-hero{position:relative;border-radius:32px;padding:18px 16px 16px;overflow:hidden;background:linear-gradient(145deg,rgba(255,255,255,.09),rgba(92,10,35,.13) 50%,rgba(0,0,0,.16));box-shadow:0 18px 46px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.11)}
    .daily-info-hero:before{content:"";position:absolute;inset:-40px -70px auto auto;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.2),rgba(255,255,255,0) 68%);pointer-events:none}
    .daily-info-kicker{margin:0 0 8px;color:rgba(255,255,255,.58);font-size:11px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}
    .daily-info-hero h2{margin:0;color:#fff;font-size:30px;line-height:.95;font-weight:950;letter-spacing:-.065em}
    .daily-info-hero p{margin:10px 0 0;max-width:300px;color:rgba(255,255,255,.64);font-size:12.5px;line-height:1.45;font-weight:700}
    .daily-info-rules{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
    .daily-info-rule{min-height:58px;border-radius:22px;background:rgba(255,255,255,.052);box-shadow:inset 0 1px 0 rgba(255,255,255,.08);display:grid;place-items:center;text-align:center;padding:8px 6px;color:rgba(255,255,255,.72);font-size:10.5px;font-weight:850;line-height:1.2}
    .daily-info-list{display:grid;gap:8px}
    .daily-info-row{min-height:76px;border-radius:25px;background:linear-gradient(135deg,rgba(255,255,255,.07),rgba(255,255,255,.022));box-shadow:0 12px 28px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.08);display:grid;grid-template-columns:58px minmax(0,1fr);gap:12px;align-items:center;padding:9px 12px;box-sizing:border-box}
    .daily-info-row.today{background:linear-gradient(135deg,rgba(92,10,35,.28),rgba(255,255,255,.055));box-shadow:0 14px 34px rgba(92,10,35,.14),inset 0 1px 0 rgba(255,255,255,.1)}
    .daily-info-img{width:58px;height:58px;display:grid;place-items:center;overflow:visible}
    .daily-info-img img{width:58px;height:58px;object-fit:contain;filter:drop-shadow(0 10px 16px rgba(0,0,0,.25))}
    .daily-info-img span{font-size:11px;font-weight:900;color:rgba(255,255,255,.55)}
    .daily-info-main{min-width:0;display:grid;gap:4px}
    .daily-info-day{font-style:normal;color:rgba(255,255,255,.42);font-size:10px;line-height:1;font-weight:900;text-transform:uppercase;letter-spacing:.09em}
    .daily-info-main b{display:block;color:#fff;font-size:16px;line-height:1;font-weight:950;letter-spacing:-.04em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .daily-info-main small{display:block;color:rgba(255,255,255,.58);font-size:11px;line-height:1.25;font-weight:720}
    @media(max-width:360px){.daily-rewards-info-view{padding-left:12px!important;padding-right:12px!important}.daily-info-hero h2{font-size:27px}.daily-info-rules{gap:6px}.daily-info-rule{font-size:10px;border-radius:20px}}
  </style>
  <div class="daily-rewards-info-shell">
    <div class="daily-info-hero">
      <p class="daily-info-kicker">Daily Gift</p>
      <h2>7 Days. Clean Rewards.</h2>
      <p>Claim one gift each day. Keep the streak alive and unlock the bigger weekly prize.</p>
    </div>
    <div class="daily-info-rules" aria-label="Reward rules">
      <div class="daily-info-rule">1 tap claim</div>
      <div class="daily-info-rule">Daily streak</div>
      <div class="daily-info-rule">Bigger finish</div>
    </div>
    <div id="dailyInfoList" class="daily-info-list" aria-label="Daily gift list"></div>
  </div>
</section>`;
