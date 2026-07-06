export const REWARDS_SECTION = `<section id="rewards" class="view rewards-view">
  <style>
    #rewards{overflow-y:auto!important;overflow-x:hidden!important;padding:0 16px 120px!important;-webkit-overflow-scrolling:touch;scrollbar-width:none;box-sizing:border-box!important}
    #rewards::-webkit-scrollbar{display:none}
    #rewards .rewards-hero-image-wrap{position:relative;width:min(48vw,190px);height:clamp(72px,22vw,112px);margin:calc(-16px + env(safe-area-inset-top)) auto 0;display:grid;place-items:center;pointer-events:none;animation:rewardsHeroFloat 5.8s ease-in-out infinite;will-change:transform;filter:drop-shadow(0 14px 22px rgba(0,0,0,.26))}
    #rewards .rewards-hero-image-wrap:before{content:'';position:absolute;inset:16% 10% 4%;border-radius:999px;background:radial-gradient(circle,rgba(255,255,255,.10),rgba(135,31,62,.17) 42%,rgba(0,0,0,0) 72%);filter:blur(14px);transform:translateY(14px);z-index:-1}
    #rewards .rewards-hero-image{width:100%;height:100%;object-fit:contain;display:block;opacity:0;transition:opacity .28s ease}
    #rewards .rewards-hero-image.is-loaded{opacity:1}
    #rewards .rewards-mission-list{margin:0!important;display:grid!important;gap:9px!important;align-content:start!important}
    #rewards .rewards-mission-card{margin:0!important;border-radius:24px!important;padding:11px!important;min-height:124px!important;background:rgba(13,13,13,.54)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.105),inset 0 -1px 0 rgba(255,255,255,.06),inset 0 0 18px rgba(255,255,255,.05),0 14px 30px rgba(0,0,0,.20)!important;display:grid!important;gap:8px!important;align-content:space-between!important;backdrop-filter:blur(10px) saturate(1.12)!important;-webkit-backdrop-filter:blur(10px) saturate(1.12)!important;box-sizing:border-box!important}
    #rewards .rewards-mission-head{display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:8px!important}
    #rewards .rewards-mission-head strong{color:#fff!important;font-size:15px!important;font-weight:950!important;letter-spacing:-.03em!important}
    #rewards .rewards-mission-tag{height:27px!important;min-width:64px!important;padding:0 9px!important;border-radius:999px!important;background:rgba(255,255,255,.065)!important;color:rgba(255,255,255,.68)!important;font-size:10px!important;font-weight:900!important;display:flex!important;align-items:center!important;justify-content:center!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08),inset 0 -1px 0 rgba(255,255,255,.04)!important;white-space:nowrap!important}
    #rewards .rewards-mission-info{height:36px!important;width:100%!important;border-radius:15px!important;background:rgba(0,0,0,.22)!important;color:#fff!important;font-size:12px!important;font-weight:900!important;display:flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;padding:0 10px!important;box-sizing:border-box!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06),inset 0 -1px 0 rgba(255,255,255,.04)!important}
    #rewards .rewards-mission-button{position:relative!important;width:100%!important;height:38px!important;border-radius:16px!important;border:0!important;overflow:hidden!important;background:linear-gradient(180deg,rgba(125,25,52,.96),rgba(54,8,24,.98))!important;color:#fff!important;font-size:12px!important;font-weight:950!important;letter-spacing:.01em!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.22),inset 0 -1px 0 rgba(0,0,0,.32),0 13px 26px rgba(82,8,31,.34),0 6px 18px rgba(0,0,0,.22)!important;backdrop-filter:blur(12px) saturate(1.18)!important;-webkit-backdrop-filter:blur(12px) saturate(1.18)!important;text-shadow:0 1px 8px rgba(0,0,0,.34)!important}
    #rewards .rewards-mission-button:before{content:'';position:absolute;left:8%;right:8%;top:5px;height:42%;border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.34),rgba(255,255,255,.06));filter:blur(.2px);opacity:.72;pointer-events:none}
    #rewards .rewards-mission-button:after{content:'';position:absolute;inset:0;border-radius:inherit;background:radial-gradient(circle at 50% 0%,rgba(255,255,255,.18),rgba(255,255,255,0) 48%);pointer-events:none}
    #rewards .rewards-mission-button:active{transform:scale(.98)!important;background:linear-gradient(180deg,rgba(150,31,64,.98),rgba(62,9,28,.99))!important}
    @keyframes rewardsHeroFloat{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-7px,0)}}
    @media(prefers-reduced-motion:reduce){#rewards .rewards-hero-image-wrap{animation:none}}
    @media(max-width:380px){#rewards{padding-left:14px!important;padding-right:14px!important}#rewards .rewards-hero-image-wrap{width:min(44vw,165px);height:clamp(64px,20vw,96px);margin-top:calc(-18px + env(safe-area-inset-top))}#rewards .rewards-mission-card{min-height:118px!important;border-radius:23px!important;padding:10px!important}#rewards .rewards-mission-info{font-size:11px!important}}
  </style>
  <div class="rewards-hero-image-wrap" aria-hidden="true"><img class="rewards-hero-image" src="/app/api/daily-rewards-hero-image.png" alt="" decoding="async" onload="this.classList.add('is-loaded')" onerror="this.parentNode.style.display='none'"/></div>
  <div class="rewards-mission-list" aria-label="Rewards missions">
    <article class="rewards-mission-card">
      <div class="rewards-mission-head"><strong>Invite Friend</strong><span class="rewards-mission-tag">Mission</span></div>
      <div class="rewards-mission-info">Invite 1 friend and unlock your reward</div>
      <button class="rewards-mission-button" type="button">Claim</button>
    </article>
    <article class="rewards-mission-card">
      <div class="rewards-mission-head"><strong>Daily Ticket</strong><span class="rewards-mission-tag">Today</span></div>
      <div class="rewards-mission-info">Claim your free daily ticket</div>
      <button class="rewards-mission-button" type="button">Claim Ticket</button>
    </article>
    <article class="rewards-mission-card">
      <div class="rewards-mission-head"><strong>Join Channel</strong><span class="rewards-mission-tag">Bonus</span></div>
      <div class="rewards-mission-info">Join our channel and claim bonus</div>
      <button class="rewards-mission-button" type="button">Claim</button>
    </article>
  </div>
</section>`;
