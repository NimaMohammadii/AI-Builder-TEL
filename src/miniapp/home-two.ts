export const HOME_TWO_SECTION = `<section id="home" class="view active" data-home-variant="two">
  <div class="home-draw-info-card" id="homeDrawInfoCard" aria-hidden="true"></div>
  <img class="home-two-top-image" src="/app/api/home-two-top-image" alt="" decoding="async" onerror="this.hidden=true">
  <style>
    #home[data-home-variant="two"]{padding-top:0;overflow-x:hidden}
    #home[data-home-variant="two"] #homeDrawInfoCard.home-draw-info-card{height:68px!important;margin:0 0 12px!important;border-radius:28px!important;padding:9px 12px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;box-sizing:border-box!important}
    #home[data-home-variant="two"] .home-two-top-image{display:block;width:calc(100% + 24px);max-width:none;height:auto;margin-left:-12px;object-fit:contain}
  </style>
</section>`;
