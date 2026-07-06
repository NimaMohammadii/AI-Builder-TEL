export const REWARDS_SECTION = `<section id="rewards" class="view rewards-view">
  <style>
    #rewards{overflow-y:auto!important;overflow-x:hidden!important;padding-top:0!important;padding-bottom:120px!important;-webkit-overflow-scrolling:touch;scrollbar-width:none}
    #rewards::-webkit-scrollbar{display:none}
    #rewards .rewards-hero-image-wrap{position:relative;width:min(92vw,420px);height:clamp(190px,54vw,285px);margin:calc(74px + env(safe-area-inset-top)) auto 18px;display:grid;place-items:center;pointer-events:none;animation:rewardsHeroFloat 5.8s ease-in-out infinite;will-change:transform;filter:drop-shadow(0 28px 42px rgba(0,0,0,.34))}
    #rewards .rewards-hero-image-wrap:before{content:'';position:absolute;inset:14% 8% 4%;border-radius:999px;background:radial-gradient(circle,rgba(255,255,255,.10),rgba(135,31,62,.18) 42%,rgba(0,0,0,0) 72%);filter:blur(18px);transform:translateY(20px);z-index:-1}
    #rewards .rewards-hero-image{width:100%;height:100%;object-fit:contain;display:block;opacity:0;transition:opacity .28s ease}
    #rewards .rewards-hero-image.is-loaded{opacity:1}
    #rewards .rewards-empty-note{margin:0 auto;padding:0 22px;color:rgba(255,255,255,.54);font-size:13px;font-weight:800;text-align:center;line-height:1.45}
    @keyframes rewardsHeroFloat{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-15px,0)}}
    @media(prefers-reduced-motion:reduce){#rewards .rewards-hero-image-wrap{animation:none}}
    @media(max-width:380px){#rewards .rewards-hero-image-wrap{height:clamp(170px,52vw,240px);margin-top:calc(66px + env(safe-area-inset-top))}}
  </style>
  <div class="rewards-hero-image-wrap" aria-hidden="true"><img class="rewards-hero-image" src="/app/api/daily-rewards-hero-image.png" alt="" decoding="async" onload="this.classList.add('is-loaded')" onerror="this.parentNode.style.display='none'"/></div>
  <p class="rewards-empty-note">Check your Daily Prize and weekly missions from the Home rewards card.</p>
</section>`;