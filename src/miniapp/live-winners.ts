export const REWARDS_SECTION = `<section id="rewards" class="view rewards-view">
  <style>
    #rewards{overflow-y:auto!important;overflow-x:hidden!important;padding-top:0!important;padding-bottom:120px!important;-webkit-overflow-scrolling:touch;scrollbar-width:none}
    #rewards::-webkit-scrollbar{display:none}
    #rewards .rewards-live-card{margin:-4px 0 14px!important;border:0!important;outline:0!important;border-radius:30px!important;background:rgba(255,255,255,.026)!important;color:#fff!important;box-shadow:0 18px 42px rgba(0,0,0,.16),inset 0 1px 0 rgba(255,255,255,.10)!important;backdrop-filter:blur(3px) saturate(1.08)!important;-webkit-backdrop-filter:blur(3px) saturate(1.08)!important;overflow:hidden!important;padding:0!important;position:relative!important}
    #rewards .rewards-live-hero{height:168px!important;display:grid!important;place-items:center!important;background:transparent!important;overflow:visible!important;margin-top:-8px!important}
    #rewards .rewards-live-hero img{width:100%!important;height:100%!important;object-fit:contain!important;display:block!important;background:transparent!important;border:0!important;box-shadow:none!important;filter:drop-shadow(0 18px 34px rgba(0,0,0,.28))!important}
    #rewards .rewards-live-copy{padding:0 18px 16px!important;margin-top:-6px!important}
    #rewards .rewards-live-copy h2{margin:0 0 6px!important;font-size:24px!important;line-height:1.04!important;font-weight:900!important;letter-spacing:-.055em!important;color:#fff!important}
    #rewards .rewards-live-copy p{margin:0!important;color:rgba(255,255,255,.60)!important;font-size:13px!important;line-height:1.42!important;font-weight:650!important}
    #rewards .rewards-winners{display:grid!important;gap:8px!important;margin-top:8px!important}
    #rewards .rewards-winner-row{min-height:54px!important;border:0!important;outline:0!important;border-radius:21px!important;background:transparent!important;box-shadow:none!important;display:grid!important;grid-template-columns:38px minmax(0,1fr) auto!important;align-items:center!important;gap:10px!important;padding:8px 4px!important;backdrop-filter:blur(3px) saturate(1.04)!important;-webkit-backdrop-filter:blur(3px) saturate(1.04)!important}
    #rewards .rewards-winner-row img{width:38px!important;height:38px!important;border-radius:50%!important;object-fit:cover!important;display:block!important;background:transparent!important;box-shadow:none!important}
    #rewards .rewards-winner-row strong{display:block!important;color:#fff!important;font-size:13px!important;font-weight:900!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
    #rewards .rewards-winner-row span{display:block!important;margin-top:3px!important;color:rgba(255,255,255,.48)!important;font-size:10px!important;font-weight:750!important}
    #rewards .rewards-winner-row b{color:#fff!important;font-size:13px!important;font-weight:950!important;white-space:nowrap!important}
  </style>
  <section class="rewards-live-card" aria-label="Live winner rewards">
    <div class="rewards-live-hero" aria-hidden="true"><img src="/app/api/home-finance-image.png" alt="" decoding="async" loading="eager"/></div>
    <div class="rewards-live-copy"><h2>Live Winners</h2><p>Latest lucky rewards from active players.</p>
      <div class="rewards-winners">
        <article class="rewards-winner-row"><img src="https://t.me/i/userpic/320/telegram.jpg" alt="" decoding="async"/><div><strong>@NikaWin</strong><span>Lucky Zone</span></div><b>+1.25 TON</b></article>
        <article class="rewards-winner-row"><img src="https://t.me/i/userpic/320/durov.jpg" alt="" decoding="async"/><div><strong>@ParsaFlow</strong><span>Lucky Zone</span></div><b>+0.84 TON</b></article>
        <article class="rewards-winner-row"><img src="https://t.me/i/userpic/320/TelegramTips.jpg" alt="" decoding="async"/><div><strong>@MinaLucky</strong><span>Lucky Zone</span></div><b>+0.47 TON</b></article>
      </div>
    </div>
  </section>
</section>`;
