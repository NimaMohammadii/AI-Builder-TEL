export const HOME_SECTION = `<section id="home" class="view active">
  <style>
    #home{overflow-y:auto!important;overflow-x:hidden!important;padding-bottom:120px!important;-webkit-overflow-scrolling:touch;scrollbar-width:none}
    #home::-webkit-scrollbar{display:none}
    #home .home-finance-split{align-items:start!important}
    #home .home-finance-actions{display:grid!important;grid-template-rows:118px 118px!important;grid-auto-rows:118px!important;align-content:start!important;gap:10px!important}
    #home .home-finance-actions>.home-finance-card,#home .home-finance-visual-stack>.home-finance-card{height:118px!important;min-height:118px!important;max-height:118px!important;margin:0!important;box-sizing:border-box!important;border:0!important;border-radius:28px!important;background:linear-gradient(145deg,rgba(92,10,35,.18),rgba(255,255,255,.024) 46%,rgba(0,0,0,.16))!important;color:#fff!important;border:1px solid rgba(92,10,35,.34)!important;box-shadow:0 18px 42px rgba(0,0,0,.28),0 0 0 1px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.09)!important;text-align:center!important;padding:12px 10px!important;display:grid!important;place-items:center!important;align-content:center!important;gap:5px!important;overflow:hidden!important;position:relative!important}
    #home .home-finance-icon{width:32px!important;height:32px!important;border-radius:14px!important;display:grid!important;place-items:center!important;color:#fff!important;background:rgba(255,255,255,.06)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 12px 26px rgba(0,0,0,.18)!important;backdrop-filter:blur(4px)!important;-webkit-backdrop-filter:blur(4px)!important}
    #home .home-finance-icon svg{width:24px!important;height:24px!important;display:block!important;filter:drop-shadow(0 6px 12px rgba(255,255,255,.08))!important}
    #home .home-finance-card strong{display:block!important;font-size:18px!important;line-height:1!important;font-weight:900!important;letter-spacing:-.055em!important;text-align:center!important}
    #home .home-finance-card span:not(.home-finance-icon){display:block!important;font-size:11px!important;line-height:1.25!important;font-weight:650!important;color:rgba(255,255,255,.58)!important;text-align:center!important}
    #home .home-finance-visual-stack{min-width:0!important;display:grid!important;grid-template-rows:auto!important;gap:10px!important;align-items:start!important}
    #home .home-finance-visual{appearance:none!important;-webkit-appearance:none!important;width:100%!important;height:184px!important;min-height:184px!important;max-height:184px!important;margin:24px 0 0 0!important;border:0!important;outline:0!important;background:transparent!important;background-color:transparent!important;background-image:none!important;padding:0!important;display:grid!important;place-items:center!important;border-radius:0!important;overflow:visible!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;color:transparent!important;pointer-events:none!important}
    #home .home-finance-visual:before,#home .home-finance-visual:after{display:none!important;content:none!important}
    #home .home-finance-visual img{pointer-events:none!important;width:100%!important;height:100%!important;object-fit:contain!important;display:block!important;background:transparent!important;border:0!important;box-shadow:none!important;border-radius:0!important;filter:drop-shadow(0 18px 34px rgba(0,0,0,.26))!important}
    #home .home-daily-reward-card{cursor:pointer!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 18px 42px rgba(0,0,0,.24)!important}

    #home .home-live-winners-card{margin:10px 0 14px!important;border:0!important;border-radius:30px!important;background:rgba(255,255,255,.026)!important;color:#fff!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 16px 42px rgba(0,0,0,.24)!important;backdrop-filter:blur(3px) saturate(1.14)!important;-webkit-backdrop-filter:blur(3px) saturate(1.14)!important;overflow:hidden!important;padding:3px!important;position:relative!important;box-sizing:border-box!important}
    #home .home-live-winners-card:before{content:""!important;position:absolute!important;inset:3px!important;border-radius:27px!important;background:linear-gradient(145deg,rgba(92,10,35,.18),rgba(255,255,255,.024) 46%,rgba(0,0,0,.16))!important;pointer-events:none!important}
    #home .home-live-winners-copy{position:relative!important;z-index:1!important;padding:16px 15px 15px!important;margin:0!important}
    #home .home-live-winners-copy h2{margin:0 0 6px!important;font-size:24px!important;line-height:1.04!important;font-weight:900!important;letter-spacing:-.055em!important;color:#fff!important}
    #home .home-live-winners-copy p{margin:0!important;color:rgba(255,255,255,.60)!important;font-size:13px!important;line-height:1.42!important;font-weight:650!important}
    #home .home-live-winners-list{display:grid!important;gap:8px!important;margin-top:8px!important;max-height:302px!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior-y:contain!important;scrollbar-width:none!important;padding-right:2px!important}#home .home-live-winners-list::-webkit-scrollbar{display:none!important}
    #home .home-live-winner-row{min-height:54px!important;border:1px solid rgba(92,10,35,.22)!important;border-radius:21px!important;background:linear-gradient(135deg,rgba(0,0,0,.18),rgba(92,10,35,.08),rgba(255,255,255,.012))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.035),0 10px 24px rgba(0,0,0,.12)!important;display:grid!important;grid-template-columns:38px minmax(0,1fr) auto!important;align-items:center!important;gap:10px!important;padding:8px 4px!important;backdrop-filter:blur(3px) saturate(1.04)!important;-webkit-backdrop-filter:blur(3px) saturate(1.04)!important}
    #home .home-live-winner-row img{width:38px!important;height:38px!important;border-radius:50%!important;object-fit:cover!important;display:block!important;background:transparent!important;box-shadow:none!important}
    #home .home-live-winner-row strong{display:block!important;color:#fff!important;font-size:13px!important;font-weight:900!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
    #home .home-live-winner-row span{display:block!important;margin-top:3px!important;color:rgba(255,255,255,.48)!important;font-size:10px!important;font-weight:750!important}
    #home .home-live-winner-row b{color:#fff!important;font-size:13px!important;font-weight:950!important;white-space:nowrap!important}
    #home .home-live-winners-card{display:none!important}
    #home .home-lottery-slot-card{width:100%!important;min-height:302px!important;margin:10px 0 14px!important;border:0!important;outline:0!important;border-radius:30px!important;background:transparent!important;background-color:transparent!important;background-image:none!important;box-shadow:none!important;backdrop-filter:blur(14px) saturate(1.22)!important;-webkit-backdrop-filter:blur(14px) saturate(1.22)!important;overflow:hidden!important;padding:0!important;position:relative!important;box-sizing:border-box!important}
    #home .home-lottery-slot-card:before,#home .home-lottery-slot-card:after{display:none!important;content:none!important}
    #home .home-lottery-slot-image{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;display:block!important;object-fit:cover!important;object-position:center!important;border:0!important;outline:0!important;border-radius:30px!important;background:transparent!important;box-shadow:none!important;opacity:1!important}
  </style>
  <section class="home-finance-split">
    <div class="home-finance-actions">
      <button class="home-finance-card home-referral-card" type="button" data-view="referral">
        <span class="home-finance-icon home-referral-icon" aria-hidden="true"><svg viewBox="0 0 64 64" fill="none"><circle cx="24" cy="25" r="9" fill="currentColor" opacity=".92"/><circle cx="43" cy="21" r="7" fill="currentColor" opacity=".42"/><circle cx="41" cy="43" r="8" fill="currentColor" opacity=".28"/><path d="M12 48c1.7-9 6.1-14 12-14s10.3 5 12 14" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M36 32c3.9.8 7 3.7 9 8" stroke="currentColor" stroke-opacity=".42" stroke-width="3.4" stroke-linecap="round"/><path d="M34.5 23.5l7.5-2.5M32.5 30.5l7.5 8.5" stroke="currentColor" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/><path d="M49 10l1.45 4.05 4.05 1.45-4.05 1.45L49 21l-1.45-4.05-4.05-1.45 4.05-1.45L49 10z" fill="currentColor" opacity=".9"/></svg></span>
        <strong>Referral</strong>
        <span>Invite friends to Vexa</span>
      </button>
      <button class="home-finance-card home-daily-reward-card" type="button" data-action="open-daily-guide" aria-label="Open rewards page">
        <span class="home-finance-icon" aria-hidden="true"><svg viewBox="0 0 64 64" fill="none"><path d="M16 24h32v28H16z" fill="currentColor" opacity=".34"/><path d="M14 20h36v11H14z" fill="currentColor" opacity=".58"/><path d="M32 20v32" stroke="currentColor" stroke-width="4" stroke-linecap="round" opacity=".9"/><path d="M32 20c-8-2-13-6-11-10 2-4 9 0 11 10Zm0 0c8-2 13-6 11-10-2-4-9 0-11 10Z" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
        <strong>Rewards</strong>
        <span>View live rewards</span>
      </button>
    </div>
    <div class="home-finance-visual-stack">
      <section class="home-lottery-slot-card" aria-label="Lottery slot image">
        <img class="home-lottery-slot-image" src="/app/api/home-lottery-slot.png?v=home-lottery" alt="" decoding="async" loading="eager"/>
      </section>
    </div>
  </section>


  <div id="depositSheet" class="deposit-sheet" aria-hidden="true">
    <div class="deposit-backdrop" data-action="close-deposit"></div>
    <div class="deposit-panel card">
      <div class="pad">
        <div class="title deposit-title">
          <div class="deposit-title-main"><span class="deposit-wallet-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><path d="M10 17.5c0-3 2.4-5.5 5.5-5.5h20.2c2.1 0 3.8 1.7 3.8 3.8v3.1" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M8 20.5c0-3.2 2.6-5.8 5.8-5.8h22.4c3.2 0 5.8 2.6 5.8 5.8v15.7c0 3.2-2.6 5.8-5.8 5.8H13.8C10.6 42 8 39.4 8 36.2V20.5Z" stroke="currentColor" stroke-width="3"/><path d="M32 27h10v8H32c-2.2 0-4-1.8-4-4s1.8-4 4-4Z" stroke="currentColor" stroke-width="3"/><circle cx="33" cy="31" r="1.6" fill="currentColor"/></svg></span><h3>Charge TON Balance</h3></div>
          <button class="ghost deposit-close" type="button" data-action="close-deposit" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></button>
        </div>
        <p class="deposit-copy">Your balance will be charged as TON after Telegram confirms the payment</p>
        <div class="field deposit-custom-field"><label>Custom Stars Amount</label><div class="deposit-amount-row"><input id="starsAmountSheet" inputmode="numeric" placeholder="Stars amount" value="100" /><span id="starsTonEquivalent" class="deposit-ton-equivalent">≈ 0.589 TON</span></div></div>
        <button class="primary deposit-pay-button" type="button" data-action="deposit-custom-stars-sheet">Pay With Stars</button>
        <div class="deposit-stars-logo" aria-hidden="true"><svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="25" fill="url(#starsHalo)" opacity=".24"/><path d="M32 6.5l5.15 15.15L52.8 16.9 43.2 29.7l14.55 6.65-16.05.4 6.15 14.8L32 41.45 16.15 51.55l6.15-14.8-16.05-.4 14.55-6.65-9.6-12.8 15.65 4.75L32 6.5z" fill="url(#starsBody)"/><path d="M32 15.4l3.3 9.72 10.05-3.05-6.16 8.22 9.34 4.27-10.3.26 3.95 9.5L32 37.83l-10.18 6.49 3.95-9.5-10.3-.26 9.34-4.27-6.16-8.22 10.05 3.05L32 15.4z" fill="rgba(255,255,255,.9)"/><defs><radialGradient id="starsHalo" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(32 32) rotate(90) scale(28)"><stop stop-color="#ffeaa0"/><stop offset="1" stop-color="#ffb21f" stop-opacity="0"/></radialGradient><linearGradient id="starsBody" x1="16" y1="10" x2="48" y2="54" gradientUnits="userSpaceOnUse"><stop stop-color="#fff4b8"/><stop offset=".38" stop-color="#ffd45a"/><stop offset="1" stop-color="#ff9d18"/></linearGradient></defs></svg><span>Telegram Stars</span></div>
      </div>
    </div>
  </div>

  <script>
    (function(){
      var isTransitioning=false;
      function q(id){return document.getElementById(id)}
      function sheet(){return q('depositSheet')}
      function addStyle(){
        if(q('vexaDepositMethodPickerStyle'))return;
        var style=document.createElement('style');
        style.id='vexaDepositMethodPickerStyle';
        style.textContent='#depositSheet .deposit-method-screen{display:none!important;width:min(100%,370px)!important;margin:0 auto 2px!important;position:relative!important}#depositSheet.deposit-choosing .deposit-method-screen{display:grid!important;gap:10px!important}#depositSheet.deposit-choosing .deposit-copy:not(.deposit-method-copy),#depositSheet.deposit-choosing .deposit-custom-field,#depositSheet.deposit-choosing .deposit-action-row,#depositSheet.deposit-choosing #depositMainPayButton,#depositSheet.deposit-choosing .ton-wallet-status,#depositSheet.deposit-choosing .deposit-status-inline,#depositSheet.deposit-choosing .deposit-stars-logo{display:none!important}.deposit-method-copy{margin:0 0 12px!important;text-align:center!important;color:rgba(255,255,255,.58)!important;font-size:13px!important;font-weight:760!important;line-height:1.35!important;transition:opacity .22s ease,transform .22s ease}.deposit-method-option{appearance:none!important;-webkit-appearance:none!important;width:100%!important;min-height:76px!important;border:0!important;border-radius:25px!important;background:linear-gradient(135deg,rgba(255,255,255,.07),rgba(255,255,255,.022))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.09),0 16px 36px rgba(0,0,0,.24)!important;color:#fff!important;padding:10px 12px!important;display:grid!important;grid-template-columns:58px minmax(0,1fr) 24px!important;gap:12px!important;align-items:center!important;text-align:left!important;transform-origin:center!important;will-change:transform,opacity,filter!important}.deposit-method-option:active{transform:scale(.988)!important}.deposit-method-image{width:58px!important;height:58px!important;border-radius:0!important;display:grid!important;place-items:center!important;background:transparent!important;box-shadow:none!important;overflow:visible!important}.deposit-method-image img{width:54px!important;height:54px!important;object-fit:contain!important;display:block!important;background:transparent!important;border:0!important;box-shadow:none!important;filter:drop-shadow(0 10px 18px rgba(0,0,0,.28))}.deposit-method-copybox{min-width:0!important;display:grid!important;gap:5px!important}.deposit-method-copybox strong{font-size:17px!important;line-height:1!important;font-weight:950!important;letter-spacing:-.045em!important;color:#fff!important}.deposit-method-copybox span{font-size:11.5px!important;line-height:1.25!important;font-weight:720!important;color:rgba(255,255,255,.54)!important}.deposit-method-arrow{font-size:24px!important;line-height:1!important;color:rgba(255,255,255,.34)!important;text-align:right!important}#depositSheet .deposit-action-row{width:min(100%,370px)!important;grid-template-columns:1fr!important;margin:0 auto 18px!important}#depositSheet .deposit-action-row .deposit-pay-button,#depositSheet #depositMainPayButton{width:100%!important}#depositPaymentModeSwitch{display:none!important}.deposit-nft-soon{min-height:18px!important;text-align:center!important;margin:8px 0 0!important;color:#ffcf6b!important;font-size:11px!important;font-weight:800!important}.deposit-method-screen.vexa-leaving .deposit-method-copy{opacity:0!important;transform:translateY(-8px)!important}.deposit-method-screen.vexa-leaving:after{content:""!important;position:absolute!important;inset:-12px -8px!important;border-radius:30px!important;background:linear-gradient(100deg,transparent 0%,rgba(255,255,255,.16) 48%,transparent 62%)!important;transform:translateX(-120%)!important;animation:vexaDepositSweep .54s cubic-bezier(.2,.9,.2,1) forwards!important;pointer-events:none!important}.deposit-method-option.vexa-selected{animation:vexaDepositSelect .52s cubic-bezier(.16,1,.3,1) forwards!important;z-index:4!important}.deposit-method-option.vexa-selected .deposit-method-image img{animation:vexaDepositIconFly .52s cubic-bezier(.16,1,.3,1) forwards!important}.deposit-method-option.vexa-fade{animation:vexaDepositFade .34s ease forwards!important}.deposit-transitioning .deposit-method-option{pointer-events:none!important}.deposit-paying-reveal .deposit-custom-field,.deposit-paying-reveal .deposit-action-row,.deposit-paying-reveal #depositMainPayButton,.deposit-paying-reveal .ton-wallet-status,.deposit-paying-reveal .deposit-status-inline{animation:vexaPaymentIn .42s cubic-bezier(.16,1,.3,1) both!important}@keyframes vexaDepositSelect{0%{transform:scale(1);filter:none}45%{transform:scale(1.035) translateY(-2px);filter:brightness(1.2)}100%{transform:scale(.82) translateY(-18px);opacity:0;filter:blur(10px) brightness(1.35)}}@keyframes vexaDepositIconFly{0%{transform:scale(1) rotate(0)}55%{transform:scale(1.22) rotate(-6deg)}100%{transform:scale(.55) translateY(-20px) rotate(8deg);opacity:0}}@keyframes vexaDepositFade{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.94) translateY(12px);filter:blur(6px)}}@keyframes vexaPaymentIn{0%{opacity:0;transform:translateY(18px) scale(.97);filter:blur(8px)}100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}}@keyframes vexaDepositSweep{0%{transform:translateX(-120%)}100%{transform:translateX(120%)}}';
        document.head.appendChild(style);
      }
      function methodImg(type){
        var src=type==='ton'?'/app/api/credit-icon.png':('/app/api/deposit-method-icon/'+(type==='nft'?'nft':'stars')+'.png');
        return '<img src="'+src+'" alt="" decoding="async" loading="eager">';
      }
      function ensurePicker(){
        addStyle();
        var s=sheet();if(!s)return;
        var title=s.querySelector('.deposit-title');if(!title)return;
        if(!s.querySelector('.deposit-method-screen')){
          var box=document.createElement('div');
          box.className='deposit-method-screen';
          box.innerHTML='<p class="deposit-copy deposit-method-copy">Choose how you want to deposit</p>'+
            '<button class="deposit-method-option" type="button" data-action="choose-deposit-method" data-method="stars"><span class="deposit-method-image">'+methodImg('stars')+'</span><span class="deposit-method-copybox"><strong>Pay with Stars</strong><span>Fast Telegram Stars payment</span></span><span class="deposit-method-arrow">›</span></button>'+
            '<button class="deposit-method-option" type="button" data-action="choose-deposit-method" data-method="ton"><span class="deposit-method-image">'+methodImg('ton')+'</span><span class="deposit-method-copybox"><strong>Pay with TON</strong><span>Deposit directly with TON wallet</span></span><span class="deposit-method-arrow">›</span></button>'+
            '<button class="deposit-method-option" type="button" data-action="choose-deposit-method" data-method="nft"><span class="deposit-method-image">'+methodImg('nft')+'</span><span class="deposit-method-copybox"><strong>NFT</strong><span>NFT deposit option</span></span><span class="deposit-method-arrow">›</span></button>'+
            '<p id="depositNftSoon" class="deposit-nft-soon"></p>';
          title.insertAdjacentElement('afterend',box);
        }
        var pay=q('depositMainPayButton')||s.querySelector('[data-action="deposit-custom-stars-sheet"],[data-action="confirm-ton-payment"]');
        if(pay)pay.id='depositMainPayButton';
      }
      function showPicker(){
        ensurePicker();
        var s=sheet();if(!s)return;
        s.classList.remove('deposit-paying-reveal');
        s.classList.add('deposit-choosing');
        var screen=s.querySelector('.deposit-method-screen');if(screen)screen.classList.remove('vexa-leaving');
        Array.prototype.forEach.call(s.querySelectorAll('.deposit-method-option'),function(item){item.classList.remove('vexa-selected','vexa-fade')});
        var msg=q('depositNftSoon');if(msg)msg.textContent='';
        isTransitioning=false;
      }
      function finishMode(method){
        var s=sheet();if(!s)return;
        if(method==='nft'){
          var msg=q('depositNftSoon');if(msg)msg.textContent='NFT deposits will be available soon';
          setTimeout(showPicker,520);
          return;
        }
        var target=document.querySelector('#depositPaymentModeSwitch button[data-mode="'+(method==='ton'?'ton':'stars')+'"]');
        if(target)target.click();
        s.classList.remove('deposit-choosing');
        s.classList.add('deposit-paying-reveal');
        setTimeout(function(){s.classList.remove('deposit-paying-reveal');isTransitioning=false},760);
      }
      function animateMode(method,btn){
        ensurePicker();
        var s=sheet();if(!s||isTransitioning)return;
        isTransitioning=true;
        s.classList.add('deposit-transitioning');
        var screen=s.querySelector('.deposit-method-screen');if(screen)screen.classList.add('vexa-leaving');
        Array.prototype.forEach.call(s.querySelectorAll('.deposit-method-option'),function(item){
          if(item===btn)item.classList.add('vexa-selected');else item.classList.add('vexa-fade');
        });
        setTimeout(function(){s.classList.remove('deposit-transitioning');finishMode(method)},520);
      }
      function pickMode(method,btn){animateMode(method,btn)}
      document.addEventListener('click',function(ev){
        var btn=ev.target&&ev.target.closest?ev.target.closest('button'):null;if(!btn)return;
        var action=btn.getAttribute('data-action');
        if(action==='open-deposit'||action==='connect-deposit')setTimeout(showPicker,90);
        if(action==='choose-deposit-method'){ev.preventDefault();ev.stopPropagation();if(ev.stopImmediatePropagation)ev.stopImmediatePropagation();pickMode(btn.getAttribute('data-method'),btn)}
        if(action==='close-deposit')setTimeout(function(){var s=sheet();if(s){s.classList.remove('deposit-choosing','deposit-transitioning','deposit-paying-reveal');isTransitioning=false}},380);
      },true);
      if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(ensurePicker,240)});else setTimeout(ensurePicker,240);
    })();
  </script>

  <div id="withdrawSheet" class="deposit-sheet withdraw-sheet" aria-hidden="true">
    <div class="deposit-backdrop" data-action="close-withdraw"></div>
    <div class="deposit-panel card">
      <div class="pad withdraw-content">
        <div class="title deposit-title"><div class="deposit-title-main"><span class="withdraw-title-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><path d="M24 39V15" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/><path d="M14 25l10-10 10 10" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="24" cy="24" r="19" stroke="currentColor" stroke-opacity=".28" stroke-width="2"/></svg></span><h3>Withdraw TON</h3></div><button class="ghost deposit-close" type="button" data-action="close-withdraw" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></button></div>
        <p class="deposit-copy">Enter your TON wallet and the amount you want to withdraw</p>
        <div class="field deposit-custom-field"><label>TON Amount</label><div class="deposit-amount-row"><input id="withdrawAmountTon" inputmode="decimal" placeholder="0.00" /><span id="withdrawUsdEquivalent" class="deposit-ton-equivalent">≈ $0.00</span></div></div>
        <div class="field deposit-custom-field"><label>TON Wallet Address</label><div class="deposit-amount-row withdraw-wallet-row"><input id="withdrawWalletAddress" inputmode="text" placeholder="UQ... wallet address" /></div></div>
        <button class="primary deposit-pay-button" type="button" data-action="submit-withdraw">Confirm Withdraw</button>
        <p id="withdrawStatus" class="withdraw-status"></p>
        <div id="withdrawSuccess" class="withdraw-success" aria-hidden="true"><svg viewBox="0 0 96 96" fill="none"><circle cx="48" cy="48" r="40" fill="rgba(23,210,116,.14)"/><circle cx="48" cy="48" r="31" stroke="#19e681" stroke-width="5"/><path d="M33 48.5l10 10L64 37" stroke="#19e681" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg><strong>Request submitted</strong><span>Your withdrawal is pending review</span></div>
      </div>
    </div>
  </div>

  <div id="transactionsSheet" class="deposit-sheet transactions-sheet" aria-hidden="true">
    <div class="deposit-backdrop" data-action="close-transactions"></div>
    <div class="deposit-panel card transactions-panel">
      <div class="pad">
        <div class="title deposit-title"><div class="deposit-title-main"><span class="withdraw-title-icon transactions-title-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><path d="M14 17h20M14 24h20M14 31h12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><rect x="8" y="8" width="32" height="32" rx="12" stroke="currentColor" stroke-opacity=".28" stroke-width="2"/></svg></span><h3>Transactions</h3></div><button class="ghost deposit-close" type="button" data-action="close-transactions" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></button></div>
        <p class="deposit-copy transactions-copy">Your deposits and withdrawal requests are shown here</p>
        <div id="transactionsList" class="transactions-list"><div class="transactions-empty">Loading transactions</div></div>
      </div>
    </div>
  </div>
</section>`;
