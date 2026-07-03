export const REWARDS_SECTION = `<section id="rewards" class="view rewards-view">
  <style>
    #rewards{overflow-y:auto!important;overflow-x:hidden!important;padding-top:0!important;padding-bottom:120px!important;-webkit-overflow-scrolling:touch;scrollbar-width:none;background:radial-gradient(ellipse 118% 52% at 50% -15%,rgba(92,10,35,.44),transparent 64%),linear-gradient(180deg,rgba(12,2,5,.48),rgba(3,3,3,.10) 54%,rgba(2,2,2,.20))!important}
    #rewards::-webkit-scrollbar{display:none}
    #rewards:before{content:'';position:fixed;left:50%;top:calc(88px + env(safe-area-inset-top));width:min(100%,560px);height:calc(100dvh - 172px);transform:translateX(-50%);pointer-events:none;z-index:0;background:linear-gradient(112deg,transparent 0 16%,rgba(0,0,0,.42) 16.25%,rgba(0,0,0,.42) 16.85%,rgba(92,10,35,.18) 17.05%,transparent 19.1%),linear-gradient(112deg,transparent 0 34%,rgba(0,0,0,.35) 34.25%,rgba(0,0,0,.35) 34.85%,rgba(92,10,35,.14) 35.05%,transparent 37%),linear-gradient(112deg,transparent 0 55%,rgba(0,0,0,.40) 55.25%,rgba(0,0,0,.40) 55.9%,rgba(92,10,35,.15) 56.1%,transparent 58.2%),linear-gradient(112deg,transparent 0 76%,rgba(0,0,0,.36) 76.25%,rgba(0,0,0,.36) 76.85%,rgba(92,10,35,.13) 77.05%,transparent 79%);filter:drop-shadow(0 0 18px rgba(92,10,35,.24))}
    #rewards>*{position:relative;z-index:1}
    #rewards .rewards-live-card{margin:-4px 0 14px!important;border:0!important;outline:0!important;border-radius:30px!important;background:linear-gradient(145deg,rgba(92,10,35,.18),rgba(255,255,255,.024) 46%,rgba(0,0,0,.18))!important;color:#fff!important;border:1px solid rgba(92,10,35,.34)!important;box-shadow:0 22px 52px rgba(0,0,0,.34),0 0 0 1px rgba(0,0,0,.24),0 0 34px rgba(92,10,35,.12),inset 0 1px 0 rgba(255,255,255,.10)!important;backdrop-filter:blur(3px) saturate(1.08)!important;-webkit-backdrop-filter:blur(3px) saturate(1.08)!important;overflow:hidden!important;padding:0!important;position:relative!important}
    #rewards .rewards-live-hero{height:168px!important;display:grid!important;place-items:center!important;background:transparent!important;overflow:visible!important;margin-top:-8px!important}
    #rewards .rewards-live-hero img{width:100%!important;height:100%!important;object-fit:contain!important;display:block!important;background:transparent!important;border:0!important;box-shadow:none!important;filter:drop-shadow(0 18px 34px rgba(0,0,0,.28))!important}
    #rewards .rewards-live-copy{padding:0 18px 16px!important;margin-top:-6px!important}
    #rewards .rewards-live-copy h2{margin:0 0 6px!important;font-size:24px!important;line-height:1.04!important;font-weight:900!important;letter-spacing:-.055em!important;color:#fff!important}
    #rewards .rewards-live-copy p{margin:0!important;color:rgba(255,255,255,.60)!important;font-size:13px!important;line-height:1.42!important;font-weight:650!important}
    #rewards .rewards-winners{display:grid!important;gap:8px!important;margin-top:8px!important}
    #rewards .rewards-winner-row{min-height:54px!important;border:1px solid rgba(92,10,35,.22)!important;outline:0!important;border-radius:21px!important;background:linear-gradient(135deg,rgba(0,0,0,.18),rgba(92,10,35,.08),rgba(255,255,255,.012))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.035),0 10px 24px rgba(0,0,0,.12)!important;display:grid!important;grid-template-columns:38px minmax(0,1fr) auto!important;align-items:center!important;gap:10px!important;padding:8px 4px!important;backdrop-filter:blur(3px) saturate(1.04)!important;-webkit-backdrop-filter:blur(3px) saturate(1.04)!important}
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
