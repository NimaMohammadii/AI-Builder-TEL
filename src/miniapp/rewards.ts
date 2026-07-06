export const REWARDS_SECTION = `<section id="rewards" class="view rewards-view">
  <style>
    #rewards{overflow-y:auto!important;overflow-x:hidden!important;padding:0 3px 120px!important;-webkit-overflow-scrolling:touch;scrollbar-width:none;box-sizing:border-box!important}
    #rewards::-webkit-scrollbar{display:none}
    #rewards .rewards-hero-image-wrap{position:relative;width:min(44vw,170px);height:clamp(62px,20vw,104px);margin:calc(-54px + env(safe-area-inset-top)) auto 0;display:grid;place-items:center;pointer-events:none;animation:rewardsHeroFloat 5.8s ease-in-out infinite;will-change:transform;filter:drop-shadow(0 14px 22px rgba(0,0,0,.26))}
    #rewards .rewards-hero-image-wrap:before{content:'';position:absolute;inset:14% 8% 4%;border-radius:999px;background:radial-gradient(circle,rgba(255,255,255,.10),rgba(135,31,62,.18) 42%,rgba(0,0,0,0) 72%);filter:blur(14px);transform:translateY(14px);z-index:-1}
    #rewards .rewards-hero-image{width:100%;height:100%;object-fit:contain;display:block;opacity:0;transition:opacity .28s ease}
    #rewards .rewards-hero-image.is-loaded{opacity:1}
    #rewards .rewards-mission-list{width:100%!important;max-width:none!important;margin:78px auto 0!important;display:grid!important;gap:10px!important;align-content:start!important;justify-items:stretch!important}
    #rewards .rewards-mission-card{width:100%!important;margin:0!important;border-radius:23px!important;padding:10px!important;min-height:114px!important;background:rgba(13,13,13,.54)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.105),inset 0 -1px 0 rgba(255,255,255,.06),inset 0 0 18px rgba(255,255,255,.05),0 14px 30px rgba(0,0,0,.20)!important;display:grid!important;gap:7px!important;align-content:space-between!important;backdrop-filter:blur(10px) saturate(1.12)!important;-webkit-backdrop-filter:blur(10px) saturate(1.12)!important;box-sizing:border-box!important}
    #rewards .rewards-mission-head{display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:8px!important}
    #rewards .rewards-mission-head strong{color:#fff!important;font-size:14px!important;font-weight:950!important;letter-spacing:-.03em!important}
    #rewards .rewards-mission-tag{height:26px!important;min-width:62px!important;padding:0 8px!important;border-radius:999px!important;background:rgba(255,255,255,.075)!important;color:rgba(255,255,255,.72)!important;font-size:10px!important;font-weight:900!important;display:flex!important;align-items:center!important;justify-content:center!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08),inset 0 -1px 0 rgba(255,255,255,.045)!important;white-space:nowrap!important}
    #rewards .rewards-mission-info{height:32px!important;width:100%!important;border-radius:14px!important;background:rgba(0,0,0,.22)!important;color:#fff!important;font-size:12px!important;font-weight:900!important;display:flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;padding:0 10px!important;box-sizing:border-box!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06),inset 0 -1px 0 rgba(255,255,255,.04)!important}
    #rewards .rewards-friend-progress{display:grid!important;gap:6px!important;margin:-1px 0 0!important}
    #rewards .rewards-friend-progress-top{display:flex!important;align-items:center!important;justify-content:space-between!important;color:rgba(255,255,255,.58)!important;font-size:10px!important;font-weight:900!important;padding:0 2px!important}
    #rewards .rewards-friend-progress-track{height:7px!important;border-radius:999px!important;background:rgba(0,0,0,.26)!important;overflow:hidden!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.055),inset 0 -1px 0 rgba(255,255,255,.035)!important}
    #rewards .rewards-friend-progress-fill{display:block!important;height:100%!important;width:0%;border-radius:999px!important;background:linear-gradient(90deg,rgba(82,9,32,.95),rgba(135,31,62,.95))!important;box-shadow:0 0 16px rgba(135,31,62,.28)!important;transition:width .9s cubic-bezier(.16,1,.3,1)!important;will-change:width!important}
    #rewards .rewards-mission-button{position:relative!important;z-index:2!important;width:100%!important;height:34px!important;border-radius:14px!important;border:0!important;background:linear-gradient(180deg,rgba(98,18,42,.92),rgba(54,8,24,.94))!important;color:#fff!important;font-size:12px!important;font-weight:950!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.09),inset 0 -1px 0 rgba(255,255,255,.055),0 12px 24px rgba(0,0,0,.2)!important;backdrop-filter:blur(10px) saturate(1.12)!important;-webkit-backdrop-filter:blur(10px) saturate(1.12)!important;pointer-events:auto!important;touch-action:manipulation!important;cursor:pointer!important}
    #rewards .rewards-mission-button:active{transform:scale(.98)!important;background:linear-gradient(180deg,rgba(118,22,50,.94),rgba(64,10,29,.96))!important}
    @keyframes rewardsHeroFloat{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-8px,0)}}
    @media(prefers-reduced-motion:reduce){#rewards .rewards-hero-image-wrap{animation:none}}
    @media(max-width:380px){#rewards{padding-left:3px!important;padding-right:3px!important}#rewards .rewards-hero-image-wrap{width:min(42vw,155px);height:clamp(58px,18vw,92px);margin-top:calc(-54px + env(safe-area-inset-top))}#rewards .rewards-mission-list{width:100%!important;max-width:none!important;margin-top:76px!important}#rewards .rewards-mission-card{min-height:110px!important;border-radius:22px!important;padding:10px!important}#rewards .rewards-mission-info{font-size:11px!important;height:30px!important}}
  </style>
  <div class="rewards-hero-image-wrap" aria-hidden="true"><img class="rewards-hero-image" src="/app/api/daily-rewards-hero-image.png" alt="" decoding="async" onload="this.classList.add('is-loaded')" onerror="this.parentNode.style.display='none'"/></div>
  <div class="rewards-mission-list" aria-label="Rewards missions">
    <article class="rewards-mission-card">
      <div class="rewards-mission-head"><strong>Daily Ticket</strong><span class="rewards-mission-tag">Today</span></div>
      <div class="rewards-mission-info">Claim your free daily ticket</div>
      <button class="rewards-mission-button" type="button" data-rewards-action="claim">Claim</button>
    </article>
    <article class="rewards-mission-card" data-rewards-invite-card data-rewards-invite-value="0">
      <div class="rewards-mission-head"><strong>Invite Friend</strong><span class="rewards-mission-tag">Mission</span></div>
      <div class="rewards-mission-info">Invite 20 friends and unlock your reward</div>
      <div class="rewards-friend-progress" aria-label="Invite friends progress"><div class="rewards-friend-progress-top"><span>Friends invited</span><b data-rewards-invite-count>0 / 20</b></div><div class="rewards-friend-progress-track"><i class="rewards-friend-progress-fill" data-rewards-invite-fill></i></div></div>
      <button class="rewards-mission-button" type="button" data-rewards-action="invite">Invite</button>
    </article>
    <article class="rewards-mission-card">
      <div class="rewards-mission-head"><strong>Join Channel</strong><span class="rewards-mission-tag">Bonus</span></div>
      <div class="rewards-mission-info">Join our channel and claim bonus</div>
      <button class="rewards-mission-button" type="button" data-rewards-action="done">Join</button>
    </article>
    <article class="rewards-mission-card">
      <div class="rewards-mission-head"><strong>Watch YouTube Video</strong><span class="rewards-mission-tag">Video</span></div>
      <div class="rewards-mission-info">Watch the video to unlock this reward</div>
      <button class="rewards-mission-button" type="button" data-rewards-action="done">Watch</button>
    </article>
    <article class="rewards-mission-card">
      <div class="rewards-mission-head"><strong>Subscribe YouTube</strong><span class="rewards-mission-tag">YouTube</span></div>
      <div class="rewards-mission-info">Subscribe to our YouTube channel</div>
      <button class="rewards-mission-button" type="button" data-rewards-action="done">Subscribe</button>
    </article>
  </div>
  <script>
    (function(){
      if(window.__vexaRewardsButtonsReady)return;
      window.__vexaRewardsButtonsReady=true;
      document.addEventListener('click',function(ev){
        var btn=ev.target&&ev.target.closest&&ev.target.closest('#rewards .rewards-mission-button');
        if(!btn)return;
        var action=btn.getAttribute('data-rewards-action');
        if(!action)return;
        ev.preventDefault();
        if(action==='invite'){
          var c=btn.closest('[data-rewards-invite-card]');
          if(!c)return;
          var n=Math.min(20,(Number(c.getAttribute('data-rewards-invite-value')||0)+1));
          c.setAttribute('data-rewards-invite-value',String(n));
          var label=c.querySelector('[data-rewards-invite-count]');
          var fill=c.querySelector('[data-rewards-invite-fill]');
          if(label)label.textContent=n+' / 20';
          if(fill)requestAnimationFrame(function(){fill.style.width=(n*5)+'%';});
          if(n>=20){btn.textContent='Claim';btn.setAttribute('data-rewards-action','claim');}
          return;
        }
        if(action==='done'){
          btn.textContent='Claim';
          btn.setAttribute('data-rewards-action','claim');
        }
      },true);
    })();
  </script>
</section>`;
