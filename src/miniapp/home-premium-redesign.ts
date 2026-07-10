export const HOME_PREMIUM_REDESIGN_SCRIPT = `
(function(){
  function q(selector, root){return (root||document).querySelector(selector)}

  function installStyle(){
    var previous=q('#vexaHomePremiumRedesignStyle');
    if(previous)previous.remove();
    var style=document.createElement('style');
    style.id='vexaHomePremiumRedesignStyle';
    style.textContent=[
      '#home{padding-top:2px!important}',
      '#homeLuckyCodeSection{position:relative!important;isolation:isolate!important}',
      '#homeLuckyCodeSection:before{content:""!important;display:block!important;position:absolute!important;z-index:-1!important;left:7%!important;right:7%!important;top:20px!important;height:330px!important;background:radial-gradient(circle at 50% 20%,rgba(154,20,57,.16),transparent 68%)!important;filter:blur(30px)!important;pointer-events:none!important}',

      '.vexa-home-draw-title{height:42px!important;margin:1px 2px 10px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important}',
      '.vexa-home-draw-heading{min-width:0!important;display:grid!important;gap:2px!important}',
      '.vexa-home-draw-heading span{color:rgba(255,255,255,.42)!important;font-size:8px!important;line-height:1!important;font-weight:850!important;letter-spacing:.2em!important;text-transform:uppercase!important}',
      '.vexa-home-draw-heading strong{color:#fff!important;font-size:20px!important;line-height:1!important;font-weight:950!important;letter-spacing:-.052em!important;text-shadow:0 8px 22px rgba(0,0,0,.3)!important}',
      '.vexa-home-live-pill{height:27px!important;padding:0 11px!important;border:1px solid rgba(255,255,255,.08)!important;border-radius:999px!important;background:rgba(255,255,255,.045)!important;color:rgba(255,255,255,.72)!important;display:flex!important;align-items:center!important;gap:7px!important;font-size:9px!important;font-weight:900!important;letter-spacing:.08em!important;text-transform:uppercase!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.07)!important}',
      '.vexa-home-live-pill i{width:6px!important;height:6px!important;border-radius:50%!important;background:#ff4e78!important;box-shadow:0 0 0 4px rgba(255,51,101,.11),0 0 13px rgba(255,51,101,.82)!important;animation:vexaHomeLive 2s ease-in-out infinite!important}',

      '#home .home-draw-info-card{height:72px!important;margin:0 0 11px!important;padding:10px 11px 10px 17px!important;border:1px solid rgba(255,255,255,.075)!important;border-radius:25px!important;background:radial-gradient(circle at 14% 20%,rgba(139,18,51,.25),transparent 46%),linear-gradient(135deg,rgba(26,18,21,.88),rgba(7,7,8,.72))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.09),inset 0 -1px 0 rgba(255,255,255,.025),0 20px 46px rgba(0,0,0,.28),0 0 32px rgba(91,7,31,.08)!important;backdrop-filter:blur(18px) saturate(1.2)!important;-webkit-backdrop-filter:blur(18px) saturate(1.2)!important;overflow:hidden!important;position:relative!important}',
      '#home .home-draw-info-card:before{content:""!important;display:block!important;position:absolute!important;left:17px!important;right:52%!important;bottom:0!important;height:1px!important;background:linear-gradient(90deg,rgba(255,73,121,.72),transparent)!important;box-shadow:0 0 12px rgba(255,73,121,.48)!important}',
      '#home .home-draw-copy{display:grid!important;align-content:center!important;align-items:start!important;gap:4px!important;overflow:visible!important}',
      '#home .home-draw-label{color:rgba(255,255,255,.43)!important;font-size:9px!important;line-height:1!important;font-weight:850!important;letter-spacing:.12em!important;text-transform:uppercase!important}',
      '#home .home-draw-time{font-size:25px!important;line-height:1!important;font-weight:900!important;letter-spacing:.07em!important;background:linear-gradient(180deg,#fff 0%,#fff 34%,#b9b8bf 100%)!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important;text-shadow:none!important;filter:drop-shadow(0 6px 12px rgba(0,0,0,.35))!important}',
      '#home .home-draw-actions{gap:7px!important}',
      '#home .home-draw-actions .home-ticket-image-button,#home .home-bonus-button{height:42px!important;border:1px solid rgba(255,255,255,.075)!important;border-radius:16px!important;background:linear-gradient(145deg,rgba(255,255,255,.085),rgba(255,255,255,.025))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 10px 24px rgba(0,0,0,.18)!important;color:#fff!important}',
      '#home .home-draw-actions .home-ticket-image-button{min-width:82px!important;padding:0 12px!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;font-size:11px!important}',
      '#home .home-draw-actions .home-ticket-image-button svg{width:16px!important;height:16px!important;display:block!important}',
      '#home .home-bonus-button{width:42px!important}',
      '#home .home-bonus-svg{width:24px!important;height:24px!important}',

      '#home #homeLuckyCodeSection .home-lottery-slot-card{height:96px!important;min-height:96px!important;max-height:96px!important;margin:0!important;border:1px solid rgba(255,255,255,.09)!important;border-radius:29px!important;background:radial-gradient(circle at 50% 110%,rgba(131,11,44,.35),transparent 58%),linear-gradient(180deg,rgba(24,17,20,.88),rgba(7,7,8,.9))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),inset 0 -18px 30px rgba(60,0,18,.15),0 22px 50px rgba(0,0,0,.3)!important;backdrop-filter:blur(18px) saturate(1.18)!important;-webkit-backdrop-filter:blur(18px) saturate(1.18)!important}',
      '#home .home-lottery-slot-card:after{content:""!important;display:block!important;position:absolute!important;z-index:1!important;inset:0!important;border-radius:inherit!important;background:linear-gradient(90deg,rgba(0,0,0,.26),transparent 15%,transparent 85%,rgba(0,0,0,.26)),linear-gradient(180deg,rgba(255,255,255,.045),transparent 38%,rgba(95,4,31,.12))!important;pointer-events:none!important}',
      '#home #homeLuckyCodeSection .home-lottery-slot-image{border-radius:29px!important;opacity:.72!important;filter:saturate(.82) contrast(1.07)!important;mix-blend-mode:screen!important}',
      '#home .home-slot-number-grid{z-index:2!important;gap:7px!important;padding:8px 8px!important}',
      '#home .home-slot-number-reel{margin:0!important;border:1px solid rgba(255,255,255,.075)!important;border-radius:21px!important;background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.012))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.075),inset 0 -12px 18px rgba(74,0,22,.12),0 10px 20px rgba(0,0,0,.18)!important;mask-image:linear-gradient(180deg,rgba(0,0,0,.2),#000 31%,#000 69%,rgba(0,0,0,.2))!important;-webkit-mask-image:linear-gradient(180deg,rgba(0,0,0,.2),#000 31%,#000 69%,rgba(0,0,0,.2))!important;transform:none!important}',
      '#home .home-slot-number-reel:first-child,#home .home-slot-number-reel:nth-child(2),#home .home-slot-number-reel:nth-child(4),#home .home-slot-number-reel:last-child{transform:none!important}',
      '#home .home-slot-number-digit{font-size:32px!important;background:linear-gradient(180deg,#fff7f8 0%,#e8a7b2 22%,#a4314d 48%,#48101d 76%,#d36a80 100%)!important;-webkit-background-clip:text!important;background-clip:text!important;-webkit-text-stroke:.35px rgba(255,222,229,.28)!important;text-shadow:0 1px 0 rgba(255,255,255,.18),0 2px 3px rgba(0,0,0,.72),0 0 14px rgba(185,33,75,.38)!important;filter:drop-shadow(0 7px 12px rgba(0,0,0,.28))!important}',

      '#home .home-ticket-layout{min-height:232px!important;margin-top:13px!important;padding:12px!important;grid-template-columns:minmax(0,1.05fr) minmax(132px,.95fr)!important;gap:8px!important;align-items:stretch!important;border:1px solid rgba(255,255,255,.075)!important;border-radius:31px!important;background:radial-gradient(circle at 92% 20%,rgba(148,22,60,.2),transparent 42%),linear-gradient(145deg,rgba(23,17,20,.9),rgba(7,7,8,.82))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.095),inset 0 -1px 0 rgba(255,255,255,.02),0 24px 54px rgba(0,0,0,.3)!important;backdrop-filter:blur(18px) saturate(1.16)!important;-webkit-backdrop-filter:blur(18px) saturate(1.16)!important;position:relative!important;overflow:hidden!important}',
      '#home .home-ticket-layout:before{content:""!important;display:block!important;position:absolute!important;right:-52px!important;bottom:-66px!important;width:210px!important;height:210px!important;border-radius:50%!important;background:radial-gradient(circle,rgba(145,17,54,.23),transparent 66%)!important;filter:blur(8px)!important;pointer-events:none!important}',
      '#home .home-ticket-card{min-height:206px!important;margin:0!important;padding:9px 7px 7px!important;border:0!important;border-radius:23px!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;gap:10px!important;align-content:stretch!important;grid-template-rows:auto 1fr auto auto!important;position:relative!important;z-index:2!important}',
      '#home .home-ticket-card-head{display:grid!important;gap:4px!important}',
      '#home .home-ticket-card-head strong{font-size:19px!important;line-height:1!important;font-weight:950!important;letter-spacing:-.052em!important}',
      '#home .vexa-ticket-subtitle{display:block!important;color:rgba(255,255,255,.4)!important;font-size:9px!important;line-height:1!important;font-weight:800!important;letter-spacing:.06em!important;text-transform:uppercase!important}',
      '#home .home-ticket-count{height:auto!important;min-height:58px!important;border:1px solid rgba(255,255,255,.065)!important;border-radius:19px!important;background:linear-gradient(145deg,rgba(0,0,0,.36),rgba(255,255,255,.025))!important;color:#fff!important;font-size:22px!important;font-weight:950!important;letter-spacing:-.04em!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.055),0 10px 24px rgba(0,0,0,.14)!important}',
      '#home .home-ticket-stepper{gap:8px!important}',
      '#home .home-ticket-step{height:43px!important;border:1px solid rgba(255,255,255,.06)!important;border-radius:16px!important;background:linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.025))!important;font-size:22px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 9px 20px rgba(0,0,0,.16)!important;transition:transform .16s ease,background .16s ease!important}',
      '#home .home-ticket-step:active{transform:scale(.94)!important;background:rgba(255,255,255,.12)!important}',
      '#home .home-ticket-button{height:45px!important;border:1px solid rgba(255,255,255,.1)!important;border-radius:17px!important;background:linear-gradient(135deg,#8d1739 0%,#551124 58%,#321019 100%)!important;color:#fff!important;font-size:12px!important;font-weight:950!important;letter-spacing:-.02em!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 13px 26px rgba(92,7,31,.28)!important;transition:transform .16s ease,filter .16s ease!important}',
      '#home .home-ticket-button svg{width:15px!important;height:15px!important;display:block!important}',
      '#home .home-ticket-button:active{transform:scale(.97)!important;filter:brightness(1.12)!important}',
      '#home .home-ticket-button.is-ready{background:linear-gradient(135deg,#a7264c,#68142e 62%,#3a101c)!important}',

      '#home .home-ticket-finance-visual{min-height:206px!important;height:206px!important;align-self:end!important;place-items:end center!important;z-index:2!important;overflow:visible!important}',
      '#home .home-ticket-finance-visual img{width:150%!important;max-width:218px!important;height:178px!important;margin:0 -24% 33px!important;object-fit:contain!important;object-position:center bottom!important;filter:drop-shadow(0 20px 30px rgba(0,0,0,.38)) drop-shadow(0 0 16px rgba(143,21,57,.11))!important;animation:vexaHomeBotFloat 4.2s ease-in-out infinite!important}',
      '#home .home-ticket-actions{left:50%!important;right:auto!important;top:auto!important;bottom:0!important;transform:translateX(-50%)!important;width:max-content!important;max-width:100%!important;justify-content:center!important;gap:5px!important}',
      '#home .home-slot-spin-button,#home .home-slot-manual-button,#home .home-confetti-button{height:36px!important;border:1px solid rgba(255,255,255,.07)!important;border-radius:14px!important;background:linear-gradient(145deg,rgba(255,255,255,.085),rgba(255,255,255,.025))!important;color:#fff!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.09),0 10px 20px rgba(0,0,0,.18)!important;backdrop-filter:blur(10px)!important;-webkit-backdrop-filter:blur(10px)!important;font-size:10px!important;font-weight:950!important}',
      '#home .home-slot-spin-button{min-width:52px!important;background:linear-gradient(145deg,rgba(130,24,55,.72),rgba(63,11,27,.66))!important}',
      '#home .home-slot-manual-button{min-width:48px!important;padding:0 8px!important}',
      '#home .home-confetti-button{width:36px!important;min-width:36px!important;color:#ffdc8a!important}',

      '.home-ticket-drawer-backdrop,.home-bonus-backdrop{background:rgba(0,0,0,.46)!important;backdrop-filter:blur(5px)!important;-webkit-backdrop-filter:blur(5px)!important}',
      '.home-ticket-drawer,.home-bonus-panel{left:12px!important;right:12px!important;top:auto!important;bottom:calc(88px + env(safe-area-inset-bottom))!important;width:auto!important;max-width:520px!important;max-height:min(62vh,520px)!important;margin:0 auto!important;padding:16px!important;border:1px solid rgba(255,255,255,.09)!important;border-radius:29px!important;background:radial-gradient(circle at 90% 0,rgba(134,18,52,.18),transparent 42%),rgba(12,11,12,.91)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 30px 80px rgba(0,0,0,.58)!important;backdrop-filter:blur(26px) saturate(1.18)!important;-webkit-backdrop-filter:blur(26px) saturate(1.18)!important;transform:translate3d(0,calc(100% + 120px),0)!important;transition:transform .4s cubic-bezier(.16,1,.3,1)!important}',
      '.home-ticket-drawer.is-open,.home-bonus-panel.is-open{transform:translate3d(0,0,0)!important}',
      '.home-ticket-drawer-head strong,.home-bonus-head strong{font-size:19px!important;letter-spacing:-.045em!important}',
      '.home-ticket-drawer-close,.home-bonus-close{width:34px!important;height:34px!important;border-radius:13px!important;background:rgba(255,255,255,.07)!important}',
      '.home-ticket-drawer-count,.home-bonus-total{border:1px solid rgba(255,255,255,.055)!important;background:rgba(255,255,255,.035)!important}',

      '#home .home-draw-info-card,#home .home-lottery-slot-card,#home .home-ticket-layout{animation:vexaHomeReveal .55s cubic-bezier(.16,1,.3,1) both!important}',
      '#home .home-lottery-slot-card{animation-delay:.06s!important}',
      '#home .home-ticket-layout{animation-delay:.12s!important}',
      '@keyframes vexaHomeReveal{from{opacity:0;transform:translateY(12px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}',
      '@keyframes vexaHomeBotFloat{0%,100%{transform:translate3d(0,-3px,0) rotate(-.5deg)}50%{transform:translate3d(0,5px,0) rotate(.5deg)}}',
      '@keyframes vexaHomeLive{0%,100%{opacity:.6;transform:scale(.88)}50%{opacity:1;transform:scale(1.08)}}',

      '@media(max-width:370px){.vexa-home-draw-title{margin-bottom:7px!important}.vexa-home-draw-heading strong{font-size:18px!important}#home .home-draw-info-card{height:68px!important;padding-left:14px!important}#home .home-draw-time{font-size:22px!important}#home .home-draw-actions .home-ticket-image-button{min-width:72px!important;padding:0 9px!important}#home .home-ticket-layout{grid-template-columns:minmax(0,1.06fr) minmax(118px,.94fr)!important;padding:10px!important}#home .home-ticket-card{padding-left:4px!important;padding-right:4px!important}#home .home-ticket-finance-visual img{width:155%!important;margin-left:-28%!important;margin-right:-28%!important}.home-ticket-drawer,.home-bonus-panel{left:9px!important;right:9px!important}}',
      '@media(prefers-reduced-motion:reduce){.vexa-home-live-pill i,#home .home-draw-info-card,#home .home-lottery-slot-card,#home .home-ticket-layout,#home .home-ticket-finance-visual img{animation:none!important}}'
    ].join('');
    document.head.appendChild(style);
  }

  function installMarkup(){
    var home=q('#home');
    var lucky=q('#homeLuckyCodeSection',home);
    var card=q('.home-lucky-card',lucky);
    if(!home||!lucky||!card)return false;

    var drawCard=q('#homeDrawInfoCard',card);
    if(drawCard&&!q('.vexa-home-draw-title',card)){
      drawCard.insertAdjacentHTML('beforebegin','<div class="vexa-home-draw-title"><div class="vexa-home-draw-heading"><span>Daily game</span><strong>Lucky Draw</strong></div><div class="vexa-home-live-pill"><i></i>Live</div></div>');
    }

    var head=q('.home-ticket-card-head',card);
    if(head&&!q('.vexa-ticket-subtitle',head)){
      head.insertAdjacentHTML('beforeend','<span class="vexa-ticket-subtitle">Choose your entries</span>');
    }

    var finance=q('.home-ticket-finance-visual',card);
    if(finance)finance.removeAttribute('aria-hidden');

    var ticketButton=q('#homeTicketButton',card);
    if(ticketButton&&!q('svg',ticketButton)){
      ticketButton.dataset.premiumIcon='1';
      ticketButton.innerHTML='<span>Get Tickets'+(ticketButton.classList.contains('is-ready')?' ✓':'')+'</span><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 7.5h10M7 12h6M7 16.5h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5 3.5h14a1.5 1.5 0 0 1 1.5 1.5v14L18 17.5 15.5 19 13 17.5 10.5 19 8 17.5 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
    }

    var tickets=q('#homeTicketImageButton');
    if(tickets&&!q('svg',tickets)){
      tickets.dataset.premiumIcon='1';
      tickets.innerHTML='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7.5A2.5 2.5 0 0 0 6.5 10 2.5 2.5 0 0 0 4 12.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4.5a2.5 2.5 0 0 0 0-5V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v.5Z" stroke="currentColor" stroke-width="1.8"/><path d="M12 7.5v9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="1 3"/></svg><span>Tickets</span>';
    }

    return true;
  }

  function refresh(){installStyle();installMarkup()}
  function init(){
    refresh();
    var attempts=0;
    var timer=setInterval(function(){
      attempts++;
      installMarkup();
      if(attempts>12)clearInterval(timer);
    },120);
    var home=q('#home');
    if(home&&window.MutationObserver){
      new MutationObserver(function(){installMarkup()}).observe(home,{childList:true,subtree:true});
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  window.addEventListener('focus',function(){installMarkup()});
})();
`;
