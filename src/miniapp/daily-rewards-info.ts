export const DAILY_REWARDS_INFO_SECTION = `<section id="dailyrewardsinfo" class="view daily-rewards-info-view" aria-hidden="true">
  <style>
    .daily-rewards-info-view{display:block!important;position:fixed!important;inset:0!important;z-index:10040;height:100vh!important;width:100vw!important;overflow:hidden!important;padding:calc(66px + env(safe-area-inset-top)) 18px calc(16px + env(safe-area-inset-bottom))!important;background:rgba(0,0,0,.02)!important;backdrop-filter:blur(6px)!important;-webkit-backdrop-filter:blur(6px)!important;box-sizing:border-box;opacity:0!important;visibility:hidden!important;pointer-events:none!important;transform:translate3d(0,24px,0) scale(.975)!important;transition:opacity .26s cubic-bezier(.2,.8,.2,1),transform .30s cubic-bezier(.2,.8,.2,1),visibility 0s linear .30s!important;will-change:opacity,transform!important;contain:layout paint style!important}
    .daily-rewards-info-view.active{opacity:1!important;visibility:visible!important;pointer-events:auto!important;transform:translate3d(0,0,0) scale(1)!important;transition:opacity .26s cubic-bezier(.2,.8,.2,1),transform .30s cubic-bezier(.2,.8,.2,1),visibility 0s!important}
    .daily-rewards-info-view.is-closing{opacity:0!important;visibility:visible!important;pointer-events:none!important;transform:translate3d(0,18px,0) scale(.985)!important;transition:opacity .18s cubic-bezier(.4,0,1,1),transform .20s cubic-bezier(.4,0,1,1),visibility 0s linear .20s!important}
    .daily-rewards-info-shell{height:100%;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-bottom:96px;box-sizing:border-box}
    .daily-rewards-info-shell::-webkit-scrollbar{display:none}
    .daily-rewards-hero-uploaded{width:min(92vw,390px);height:clamp(210px,46vw,330px);margin:0 auto 18px;display:grid;place-items:center;position:relative;overflow:visible;pointer-events:none}
    .daily-rewards-hero-uploaded:before{content:"";position:absolute;inset:14% 4% 0;border-radius:42px;background:radial-gradient(circle at 50% 48%,rgba(255,210,115,.22),rgba(145,31,72,.13) 42%,rgba(0,0,0,0) 72%);filter:blur(8px);opacity:.9;animation:dailyRewardsHeroGlow 5.6s ease-in-out infinite}
    .daily-rewards-hero-uploaded img{position:relative;z-index:1;width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 24px 34px rgba(0,0,0,.46));animation:dailyRewardsHeroFloat 4.8s ease-in-out infinite;transform-origin:50% 52%;will-change:transform}
    .daily-rewards-hero-uploaded img.is-missing{display:none}
    @keyframes dailyRewardsHeroFloat{0%,100%{transform:translate3d(0,-6px,0) scale(1)}50%{transform:translate3d(0,10px,0) scale(1.018)}}
    @keyframes dailyRewardsHeroGlow{0%,100%{opacity:.68;transform:scale(.97)}50%{opacity:1;transform:scale(1.035)}}
  </style>
  <div class="daily-rewards-info-shell"><div class="daily-rewards-hero-uploaded" aria-hidden="true"><img src="/app/api/daily-rewards-hero-image.png?v=initial" alt="" decoding="async" onerror="this.classList.add('is-missing')"></div></div>
</section>`;
