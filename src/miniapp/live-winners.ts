export const REWARDS_SECTION = `<section id="rewards" class="view rewards-view">
  <style>
    #rewards{overflow-y:auto!important;overflow-x:hidden!important;padding-top:0!important;padding-bottom:120px!important;-webkit-overflow-scrolling:touch;scrollbar-width:none}
    #rewards::-webkit-scrollbar{display:none}
    #rewards .rewards-hero-uploaded{width:min(92vw,410px);height:clamp(230px,54vw,360px);margin:calc(72px + env(safe-area-inset-top)) auto 18px;display:grid;place-items:center;position:relative;overflow:visible}
    #rewards .rewards-hero-uploaded:before{content:"";position:absolute;inset:16% 2% 0;border-radius:44px;background:radial-gradient(circle at 50% 46%,rgba(255,211,118,.22),rgba(130,22,62,.15) 44%,rgba(0,0,0,0) 74%);filter:blur(10px);animation:rewardsHeroGlow 5.6s ease-in-out infinite}
    #rewards .rewards-hero-uploaded img{position:relative;z-index:1;width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 26px 38px rgba(0,0,0,.48));animation:rewardsHeroFloat 4.8s ease-in-out infinite;transform-origin:50% 52%;will-change:transform}
    #rewards .rewards-hero-uploaded img.is-missing{display:none}
    @keyframes rewardsHeroFloat{0%,100%{transform:translate3d(0,-7px,0) scale(1)}50%{transform:translate3d(0,11px,0) scale(1.018)}}
    @keyframes rewardsHeroGlow{0%,100%{opacity:.68;transform:scale(.97)}50%{opacity:1;transform:scale(1.035)}}
  </style>
  <div class="rewards-hero-uploaded" aria-hidden="true"><img src="/app/api/daily-rewards-hero-image.png?v=initial" alt="" decoding="async" onerror="this.classList.add('is-missing')"></div>
</section>`;
