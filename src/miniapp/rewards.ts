export const REWARDS_SECTION = `<section id="rewards" class="view rewards-view">
  <style>
    html:has(#rewards.active),body:has(#rewards.active){background:#000!important;background-color:#000!important;background-image:none!important}
    body:has(#rewards.active):before,body:has(#rewards.active):after,body:has(#rewards.active) .app:before,body:has(#rewards.active) .app:after{display:none!important;content:none!important;background:none!important;background-image:none!important}
    body:has(#rewards.active) .app,body:has(#rewards.active) main.app,body:has(#rewards.active) .content,body:has(#rewards.active) .view.active,body:has(#rewards.active) .top,body:has(#rewards.active) header.top{background:#000!important;background-color:#000!important;background-image:none!important}
    body:has(#rewards.active) .content:before,body:has(#rewards.active) .content:after,body:has(#rewards.active) #rewards:before,body:has(#rewards.active) #rewards:after{display:none!important;content:none!important;background:none!important;background-image:none!important}
    #rewards{overflow-y:auto!important;overflow-x:hidden!important;padding:0 0 120px!important;-webkit-overflow-scrolling:touch;scrollbar-width:none;box-sizing:border-box!important;background:#000!important;background-color:#000!important;background-image:none!important}
    #rewards::-webkit-scrollbar{display:none}
    #rewards .rewards-home-intro-card{--rewards-intro-bg:url('/app/api/home-intro-image.png');width:97%!important;max-width:430px!important;min-height:0!important;display:block!important;position:relative!important;left:48%!important;transform:translateX(-50%)!important;padding:0!important;overflow:visible!important;box-sizing:border-box!important;background:transparent!important;background-image:none!important;border:0!important;border-radius:0!important;margin:0 0 14px!important;aspect-ratio:var(--rewards-intro-aspect,12/5)!important;box-shadow:none!important;filter:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;isolation:isolate!important}
    #rewards .rewards-home-intro-card:before{display:none!important;content:none!important}
    #rewards .rewards-home-intro-card:after{display:none!important;content:none!important}
    #rewards .rewards-home-intro-image-frame{position:relative!important;z-index:1!important;width:100%!important;height:100%!important;min-height:0!important;display:block!important;overflow:visible!important;border:0!important;border-radius:0!important;aspect-ratio:var(--rewards-intro-aspect,12/5)!important;background:transparent url('/app/api/home-intro-image.png') center center/100% 100% no-repeat!important;box-shadow:none!important;filter:none!important;box-sizing:border-box!important}
    @keyframes rewardsHeroFloat{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-8px,0)}}
    @media(prefers-reduced-motion:reduce){#rewards .rewards-hero-image-wrap{animation:none}}
    @media(max-width:380px){#rewards{padding-left:3px!important;padding-right:3px!important}#rewards .rewards-home-intro-card{margin-top:8px!important;min-height:0!important}#rewards .rewards-home-intro-image-frame{min-height:0!important}#rewards .rewards-hero-image-wrap{width:min(42vw,155px);height:clamp(58px,18vw,92px);margin-top:26px!important}}
  </style>
  <div class="rewards-home-intro-card" aria-hidden="true"><div class="rewards-home-intro-image-frame"></div></div>
</section>`;
