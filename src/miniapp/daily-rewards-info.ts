export const DAILY_REWARDS_INFO_SECTION = `<section id="dailyrewardsinfo" class="view daily-rewards-info-view" aria-hidden="true">
  <style>
    .daily-rewards-info-view{display:block!important;position:fixed!important;inset:0!important;z-index:10040;height:100vh!important;width:100vw!important;overflow:hidden!important;padding:calc(66px + env(safe-area-inset-top)) 18px calc(16px + env(safe-area-inset-bottom))!important;background:rgba(0,0,0,.02)!important;backdrop-filter:blur(6px)!important;-webkit-backdrop-filter:blur(6px)!important;box-sizing:border-box;opacity:0!important;visibility:hidden!important;pointer-events:none!important;transform:translate3d(0,24px,0) scale(.975)!important;transition:opacity .26s cubic-bezier(.2,.8,.2,1),transform .30s cubic-bezier(.2,.8,.2,1),visibility 0s linear .30s!important;will-change:opacity,transform!important;contain:layout paint style!important}
    .daily-rewards-info-view.active{opacity:1!important;visibility:visible!important;pointer-events:auto!important;transform:translate3d(0,0,0) scale(1)!important;transition:opacity .26s cubic-bezier(.2,.8,.2,1),transform .30s cubic-bezier(.2,.8,.2,1),visibility 0s!important}
    .daily-rewards-info-view.is-closing{opacity:0!important;visibility:visible!important;pointer-events:none!important;transform:translate3d(0,18px,0) scale(.985)!important;transition:opacity .18s cubic-bezier(.4,0,1,1),transform .20s cubic-bezier(.4,0,1,1),visibility 0s linear .20s!important}
    .daily-rewards-info-shell{height:100%;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-bottom:96px;box-sizing:border-box}
    .daily-rewards-info-shell::-webkit-scrollbar{display:none}
  </style>
  <div class="daily-rewards-info-shell"></div>
</section>`;
