export const REWARDS_SECTION = `<section id="rewards" class="view rewards-view">
  <style>
    #rewards{overflow-y:auto!important;overflow-x:hidden!important;padding:0 16px 120px!important;-webkit-overflow-scrolling:touch;scrollbar-width:none;box-sizing:border-box!important}
    #rewards::-webkit-scrollbar{display:none}
    #rewards .rewards-hero-image-wrap{position:relative;width:min(50vw,205px);height:clamp(78px,24vw,128px);margin:calc(-46px + env(safe-area-inset-top)) auto 0;display:grid;place-items:center;pointer-events:none;animation:rewardsHeroFloat 5.8s ease-in-out infinite;will-change:transform;filter:drop-shadow(0 16px 24px rgba(0,0,0,.27))}
    #rewards .rewards-hero-image-wrap:before{content:'';position:absolute;inset:14% 8% 4%;border-radius:999px;background:radial-gradient(circle,rgba(255,255,255,.10),rgba(135,31,62,.18) 42%,rgba(0,0,0,0) 72%);filter:blur(16px);transform:translateY(16px);z-index:-1}
    #rewards .rewards-hero-image{width:100%;height:100%;object-fit:contain;display:block;opacity:0;transition:opacity .28s ease}
    #rewards .rewards-hero-image.is-loaded{opacity:1}
    #rewards .rewards-mission-list{width:min(76vw,310px)!important;margin:54px auto 0 0!important;display:grid!important;gap:10px!important;align-content:start!important;justify-items:start!important}
    #rewards .rewards-mission-card{width:100%!important;margin:0!important;border-radius:24px!important;padding:11px!important;min-height:122px!important;background:rgba(13,13,13,.54)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.105),inset 0 -1px 0 rgba(255,255,255,.06),inset 0 0 18px rgba(255,255,255,.05),0 14px 30px rgba(0,0,0,.20)!important;display:grid!important;gap:7px!important;align-content:space-between!important;backdrop-filter:blur(10px) saturate(1.12)!important;-webkit-backdrop-filter:blur(10px) saturate(1.12)!important;box-sizing:border-box!important}
    #rewards .rewards-mission-head{display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:8px!important}
    #rewards .rewards-mission-head strong{color:#fff!important;font-size:14px!important;font-weight:950!important;letter-spacing:-.03em!important}
    #rewards .rewards-mission-tag{height:26px!important;min-width:62px!important;padding:0 8px!important;border-radius:999px!important;background:rgba(255,255,255,.075)!important;color:rgba(255,255,255,.72)!important;font-size:10px!important;font-weight:900!important;display:flex!important;align-items:center!important;justify-content:center!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08),inset 0 -1px 0 rgba(255,255,255,.045)!important;white-space:nowrap!important}
    #rewards .rewards-mission-info{height:34px!important;width:100%!important;border-radius:15px!important;background:rgba(0,0,0,.22)!important;color:#fff!important;font-size:12px!important;font-weight:900!important;display:flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;padding:0 10px!important;box-sizing:border-box!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06),inset 0 -1px 0 rgba(255,255,255,.04)!important}
    #rewards .rewards-friend-progress{display:grid!important;gap:6px!important;margin:-1px 0 0!important}
    #rewards .rewards-friend-progress-top{display:flex!important;align-items:center!important;justify-content:space-between!important;color:rgba(255,255,255,.58)!important;font-size:10px!important;font-weight:900!important;padding:0 2px!important}
    #rewards .rewards-friend-progress-track{height:7px!important;border-radius:999px!important;background:rgba(0,0,0,.26)!important;overflow:hidden!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.055),inset 0 -1px 0 rgba(255,255,255,.035)!important}
    #rewards .rewards-friend-progress-fill{display:block!important;height:100%!important;width:0%!important;border-radius:999px!important;background:linear-gradient(90deg,rgba(82,9,32,.95),rgba(135,31,62,.95))!important;box-shadow:0 0 16px rgba(135,31,62,.28)!important;transition:width .55s cubic-bezier(.2,.9,.24,1)!important}
    #rewards .rewards-mission-button{width:100%!important;height:36px!important;border-radius:15px!important;border:0!important;background:linear-gradient(180deg,rgba(98,18,42,.92),rgba(54,8,24,.94))!important;color:#fff!important;font-size:12px!important;font-weight:950!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.09),inset 0 -1px 0 rgba(255,255,255,.055),0 12px 24px rgba(0,0,0,.2)!important;backdrop-filter:blur(10px) saturate(1.12)!important;-webkit-backdrop-filter:blur(10px) saturate(1.12)!important}
    #rewards .rewards-mission-button:active{transform:scale(.98)!important;background:linear-gradient(180deg,rgba(118,22,50,.94),rgba(64,10,29,.96))!important}
    @keyframes rewardsHeroFloat{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-9px,0)}}
    @media(prefers-reduced-motion:reduce){#rewards .rewards-hero-image-wrap{animation:none}}
    @media(max-width:380px){#rewards{padding-left:14px!important;padding-right:14px!important}#rewards .rewards-hero-image-wrap{width:min(47vw,180px);height:clamp(72px,22vw,112px);margin-top:calc(-46px + env(safe-area-inset-top))}#rewards .rewards-mission-list{width:min(78vw,290px)!important;margin-top:52px!important}#rewards .rewards-mission-card{min-height:116px!important;border-radius:23px!important;padding:10px!important}#rewards .rewards-mission-info{font-size:11px!important;height:32px!important}}
  </style>
  <div class="rewards-hero-image-wrap" aria-hidden="true"><img class="rewards-hero-image" src="/app/api/daily-rewards-hero-image.png" alt="" decoding="async" onload="this.classList.add('is-loaded')" onerror="this.parentNode.style.display='none'"/></div>
  <div class="rewards-mission-list" aria-label="Rewards missions">
    <article class="rewards-mission-card" data-rewards-invite-card>
      <div class="rewards-mission-head"><strong>Invite Friend</strong><span class="rewards-mission-tag">Mission</span></div>
      <div class="rewards-mission-info">Invite 20 friends and unlock your reward</div>
      <div class="rewards-friend-progress" aria-label="Invite friends progress"><div class="rewards-friend-progress-top"><span>Friends invited</span><b data-rewards-invite-count>0 / 20</b></div><div class="rewards-friend-progress-track"><i class="rewards-friend-progress-fill" data-rewards-invite-fill></i></div></div>
      <button class="rewards-mission-button" type="button" data-rewards-invite-claim>Claim</button>
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
  <script>
    (function(){
      var count=0,max=20;
      function sync(){var label=document.querySelector('[data-rewards-invite-count]'),fill=document.querySelector('[data-rewards-invite-fill]');if(label)label.textContent=count+' / '+max;if(fill)fill.style.width=Math.min(100,(count/max)*100)+'%'}
      document.addEventListener('click',function(ev){var btn=ev.target&&ev.target.closest&&ev.target.closest('[data-rewards-invite-claim]');if(!btn)return;ev.preventDefault();count=Math.min(max,count+1);sync()},true);
      sync();
    })();
  </script>
</section>`;
