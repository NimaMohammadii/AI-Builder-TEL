export const DAILY_REWARDS_INFO_SECTION = `<section id="dailyrewardsinfo" class="view daily-rewards-info-view" aria-hidden="true">
  <style>
    .daily-rewards-info-view{display:block!important;position:fixed!important;inset:0!important;z-index:10040;height:100vh!important;width:100vw!important;overflow:hidden!important;padding:calc(66px + env(safe-area-inset-top)) 18px calc(16px + env(safe-area-inset-bottom))!important;background:rgba(0,0,0,.02)!important;backdrop-filter:blur(6px)!important;-webkit-backdrop-filter:blur(6px)!important;box-sizing:border-box;opacity:0!important;visibility:hidden!important;pointer-events:none!important;transform:translate3d(0,24px,0) scale(.975)!important;transition:opacity .26s cubic-bezier(.2,.8,.2,1),transform .30s cubic-bezier(.2,.8,.2,1),visibility 0s linear .30s!important;will-change:opacity,transform!important;contain:layout paint style!important}
    .daily-rewards-info-view.active{opacity:1!important;visibility:visible!important;pointer-events:auto!important;transform:translate3d(0,0,0) scale(1)!important;transition:opacity .26s cubic-bezier(.2,.8,.2,1),transform .30s cubic-bezier(.2,.8,.2,1),visibility 0s!important}
    .daily-rewards-info-view.is-closing{opacity:0!important;visibility:visible!important;pointer-events:none!important;transform:translate3d(0,18px,0) scale(.985)!important;transition:opacity .18s cubic-bezier(.4,0,1,1),transform .20s cubic-bezier(.4,0,1,1),visibility 0s linear .20s!important}
    .daily-rewards-info-shell{height:100%;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-bottom:96px;box-sizing:border-box}
    .daily-rewards-info-shell::-webkit-scrollbar{display:none}
    .daily-rewards-live-card{margin:-4px 0 14px!important;border:0!important;outline:0!important;border-radius:30px!important;background:rgba(255,255,255,.026)!important;color:#fff!important;box-shadow:0 18px 42px rgba(0,0,0,.16),inset 0 1px 0 rgba(255,255,255,.10)!important;backdrop-filter:blur(3px) saturate(1.08)!important;-webkit-backdrop-filter:blur(3px) saturate(1.08)!important;overflow:hidden!important;padding:0!important;position:relative!important}
    .daily-rewards-live-hero{height:168px!important;display:grid!important;place-items:center!important;background:transparent!important;overflow:visible!important;margin-top:-8px!important}
    .daily-rewards-live-hero img{width:100%!important;height:100%!important;object-fit:contain!important;display:block!important;background:transparent!important;border:0!important;box-shadow:none!important;filter:drop-shadow(0 18px 34px rgba(0,0,0,.28))!important}
    .daily-rewards-live-copy{padding:0 18px 16px!important;margin-top:-6px!important}
    .daily-rewards-live-copy h2{margin:0 0 6px!important;font-size:24px!important;line-height:1.04!important;font-weight:900!important;letter-spacing:-.055em!important;color:#fff!important}
    .daily-rewards-live-copy p{margin:0!important;color:rgba(255,255,255,.60)!important;font-size:13px!important;line-height:1.42!important;font-weight:650!important}
    .daily-rewards-winners{display:grid!important;gap:8px!important;margin-top:8px!important}
    .daily-rewards-winner-row{min-height:54px!important;border:0!important;outline:0!important;border-radius:21px!important;background:transparent!important;box-shadow:none!important;display:grid!important;grid-template-columns:38px minmax(0,1fr) auto!important;align-items:center!important;gap:10px!important;padding:8px 4px!important;backdrop-filter:blur(3px) saturate(1.04)!important;-webkit-backdrop-filter:blur(3px) saturate(1.04)!important}
    .daily-rewards-winner-row img{width:38px!important;height:38px!important;border-radius:50%!important;object-fit:cover!important;display:block!important;background:transparent!important;box-shadow:none!important}
    .daily-rewards-winner-row strong{display:block!important;color:#fff!important;font-size:13px!important;font-weight:900!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
    .daily-rewards-winner-row span{display:block!important;margin-top:3px!important;color:rgba(255,255,255,.48)!important;font-size:10px!important;font-weight:750!important}
    .daily-rewards-winner-row b{color:#fff!important;font-size:13px!important;font-weight:950!important;white-space:nowrap!important}
  </style>
  <div class="daily-rewards-info-shell">
    <section class="daily-rewards-live-card" aria-label="Live winner rewards">
      <div class="daily-rewards-live-hero" aria-hidden="true"><img src="/app/api/home-finance-image.png" alt="" decoding="async" loading="eager"/></div>
      <div class="daily-rewards-live-copy"><h2>Live Winners</h2><p>Latest lucky rewards from active players.</p>
        <div class="daily-rewards-winners">
          <article class="daily-rewards-winner-row"><img src="https://t.me/i/userpic/320/telegram.jpg" alt="" decoding="async"/><div><strong>@NikaWin</strong><span>Lucky Zone</span></div><b>+1.25 TON</b></article>
          <article class="daily-rewards-winner-row"><img src="https://t.me/i/userpic/320/durov.jpg" alt="" decoding="async"/><div><strong>@ParsaFlow</strong><span>Lucky Zone</span></div><b>+0.84 TON</b></article>
          <article class="daily-rewards-winner-row"><img src="https://t.me/i/userpic/320/TelegramTips.jpg" alt="" decoding="async"/><div><strong>@MinaLucky</strong><span>Lucky Zone</span></div><b>+0.47 TON</b></article>
        </div>
      </div>
    </section>
  </div>
</section>`;
