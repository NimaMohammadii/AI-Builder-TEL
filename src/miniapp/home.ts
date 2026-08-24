// The active Home implementation mounts its content through
// HOME_BLANK_CARDS_SCRIPT. Keep the initial shell intentionally empty so there
// is only one markup path to maintain.
export const HOME_SECTION = `<section id="home" class="view active"></section>`;

export const HOME_BLANK_CARDS_SCRIPT = `
(function(){
  function q(s,r){return (r||document).querySelector(s)}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function cleanHome(){qa('#home .home-finance-split,#home .home-live-winners-card').forEach(function(n){n.outerHTML=''})}
  function css(){
    var old=q('#homeLuckyCodeStyle');if(old)old.outerHTML='';
    var st=document.createElement('style');st.id='homeLuckyCodeStyle';
    st.textContent=[
      '#home{overflow-y:auto!important;overflow-x:hidden!important;padding-bottom:calc(98px + env(safe-area-inset-bottom))!important;background:transparent!important;-webkit-overflow-scrolling:touch!important;scrollbar-width:none!important}',
      '#home .home-intro-card{display:grid!important;pointer-events:none!important;margin:0 0 14px!important}',
      '#homeLuckyCodeSection{display:block!important;padding:0!important;margin:0!important;background:transparent!important;box-shadow:none!important;overflow:visible!important}',
      'body:has(#home.active) #home{overflow-y:auto!important;overflow-x:hidden!important}',
      '.home-lucky-card{background:none!important;border:0!important;box-shadow:none!important;padding:0!important;overflow:visible!important}',
      '.home-lucky-head{display:none!important}',
      '#home .home-lottery-slot-card{width:100%!important;height:72px!important;min-height:72px!important;max-height:72px!important;margin:0 0 12px!important;border:0!important;outline:0!important;border-radius:20px!important;background:transparent!important;background-color:transparent!important;background-image:none!important;box-shadow:none!important;backdrop-filter:blur(10px) saturate(1.12)!important;-webkit-backdrop-filter:blur(10px) saturate(1.12)!important;overflow:hidden!important;padding:0!important;position:relative!important;box-sizing:border-box!important}',
      '#home .home-lottery-slot-card:before,#home .home-lottery-slot-card:after{display:none!important;content:none!important}',
      '#home .home-lottery-slot-image{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;display:block!important;object-fit:cover!important;object-position:center!important;border:0!important;outline:0!important;border-radius:20px!important;background:transparent!important;box-shadow:none!important;opacity:1!important}',
      '#home .home-slot-number-grid{position:absolute!important;inset:0!important;z-index:2!important;display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:8px!important;padding:7px 8px!important;box-sizing:border-box!important;pointer-events:none!important}',
      '#home .home-slot-number-reel{position:relative!important;display:block!important;border-radius:17px!important;overflow:hidden!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}',
      '#home .home-slot-number-reel:before{display:none!important;content:none!important}',
      '#home .home-slot-number-strip{position:absolute!important;left:0!important;right:0!important;top:50%!important;display:grid!important;grid-auto-rows:40px!important;will-change:transform!important;transition:none!important}',
      '#home .home-slot-number-reel.is-spinning .home-slot-number-strip{filter:blur(1.2px)!important}',
      '#home .home-slot-number-digit{height:40px!important;display:flex!important;align-items:center!important;justify-content:center!important;color:#fff!important;font-size:34px!important;line-height:1!important;font-weight:950!important;letter-spacing:-.065em!important;text-shadow:0 1px 0 rgba(255,255,255,.32),0 0 16px rgba(255,86,137,.54),0 12px 26px rgba(0,0,0,.54)!important;font-variant-numeric:tabular-nums!important;background:linear-gradient(180deg,#fff 0%,#ffe9f1 42%,#d85a7a 100%)!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important}',
      '.home-ticket-layout{margin-top:14px!important;display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:12px!important;align-items:stretch!important}',
      '#home #homeDrawInfoCard.home-draw-info-card,#home .home-ticket-card{position:relative!important;overflow:hidden!important;border-radius:28px!important;background:transparent!important;background-color:transparent!important;background-image:none!important;border:0!important;outline:0!important;box-shadow:0 12px 30px rgba(31,1,10,.32),0 0 18px rgba(69,5,26,.15),inset 3px 3px .5px -3.5px rgba(255,255,255,.10),inset -3px -3px .5px -3.5px rgba(156,38,70,.48),inset 1px 1px 1px -.5px rgba(140,29,61,.30),inset -1px -1px 1px -.5px rgba(124,22,53,.24),inset 0 0 6px 6px rgba(255,255,255,.055),inset 0 0 2px 2px rgba(255,255,255,.035)!important;backdrop-filter:blur(22px) saturate(1.40) brightness(1.05) contrast(1.04)!important;-webkit-backdrop-filter:blur(22px) saturate(1.40) brightness(1.05) contrast(1.04)!important;isolation:isolate!important;transform:translateZ(0)!important}',
      '#home #homeDrawInfoCard.home-draw-info-card:before,#home .home-ticket-card:before{content:""!important;position:absolute!important;inset:0!important;z-index:0!important;border-radius:inherit!important;display:block!important;pointer-events:none!important;background:radial-gradient(34px 34px at 0 0,rgba(186,53,87,.16) 0%,rgba(146,35,66,.07) 42%,rgba(104,18,44,0) 76%),radial-gradient(36px 36px at 100% 100%,rgba(172,46,79,.15) 0%,rgba(133,30,60,.065) 43%,rgba(94,16,39,0) 78%),radial-gradient(118% 76% at 10% -16%,rgba(255,255,255,.12) 0%,rgba(255,255,255,.032) 30%,rgba(255,255,255,0) 58%),radial-gradient(96% 72% at 102% 108%,rgba(255,255,255,.052) 0%,rgba(255,255,255,.010) 34%,rgba(255,255,255,0) 62%),radial-gradient(92% 78% at 88% 112%,rgba(72,5,27,.11) 0%,rgba(42,3,16,0) 60%)!important;box-shadow:inset 0 1px 0 rgba(112,18,49,.065),inset 0 -1px 0 rgba(88,12,37,.15)!important;opacity:1!important}',
      '#home #homeDrawInfoCard.home-draw-info-card>*,#home .home-ticket-card>*{position:relative!important;z-index:1!important}',
      '.home-ticket-card{margin:0!important;padding:10px 12px!important;min-height:154px!important;display:grid!important;gap:10px!important;align-content:space-between!important;box-sizing:border-box!important}',
      '.home-ticket-card-head{display:flex!important;align-items:flex-start!important;justify-content:flex-start!important;gap:10px!important}.home-ticket-card-head strong{color:#fff!important;font-size:16px!important;font-weight:950!important}.home-ticket-count{height:44px!important;width:100%!important;border-radius:18px!important;background:rgba(0,0,0,.22)!important;color:#fff!important;font-size:20px!important;font-weight:950!important;display:flex!important;align-items:center!important;justify-content:center!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),inset 0 -1px 0 rgba(255,255,255,.08)!important}',
      '.home-ticket-stepper{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important}',
      '#home .home-ticket-card .home-ticket-step,#home .home-ticket-card .home-ticket-button,#home .home-draw-actions .home-ticket-image-button{height:38px!important;padding:0 12px!important;border:0!important;border-radius:18px!important;background:rgba(0,0,0,.22)!important;color:#fff!important;font-size:12px!important;font-weight:950!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06),inset 0 -1px 0 rgba(255,255,255,.04)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}',
      '#home .home-draw-actions .home-ticket-image-button{min-width:88px!important}',
      '#home .home-ticket-card .home-ticket-step{position:relative!important;overflow:hidden!important;font-size:0!important;line-height:0!important;color:transparent!important}',
      '#home .home-ticket-card .home-ticket-button{width:100%!important;overflow:hidden!important}',
      '#home .home-ticket-card .home-ticket-step:before,#home .home-ticket-card .home-ticket-step:after{content:""!important;position:absolute!important;left:50%!important;top:50%!important;width:16px!important;height:2.6px!important;border-radius:999px!important;background:#fff!important;box-shadow:none!important;transform:translate(-50%,-50%)!important;pointer-events:none!important}',
      '#home .home-ticket-card .home-ticket-step[data-ticket-minus]:after{display:none!important}',
      '#home .home-ticket-card .home-ticket-step[data-ticket-plus]:after{display:block!important;width:2.6px!important;height:16px!important}',
      '.home-ticket-finance-visual{min-height:154px!important;height:100%!important;position:relative!important;display:grid!important;place-items:center!important;background:transparent!important;box-shadow:none!important;overflow:visible!important;pointer-events:none!important}',
      '.home-ticket-drawer-backdrop{position:fixed!important;inset:0!important;z-index:99994!important;background:transparent!important;display:none!important}.home-ticket-drawer-backdrop.is-open{display:block!important}',
      '.home-ticket-drawer{position:fixed!important;left:0!important;top:calc(120px + env(safe-area-inset-top))!important;bottom:calc(88px + env(safe-area-inset-bottom))!important;width:min(44vw,210px)!important;max-width:210px!important;z-index:99995!important;padding:24px 14px 14px!important;border-radius:0 30px 30px 0!important;color:#fff!important;transform:translate3d(-104%,0,0)!important;transition:transform .36s cubic-bezier(.18,.88,.24,1)!important;display:grid!important;grid-template-rows:auto auto minmax(0,1fr)!important;gap:14px!important;overflow:hidden!important}.home-ticket-drawer.is-open{transform:translate3d(0,0,0)!important}',
      '.home-ticket-drawer-head{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important}.home-ticket-drawer-head strong{font-size:16px!important;font-weight:950!important}.home-ticket-drawer-close{width:32px!important;height:32px!important;border-radius:13px!important;border:0!important;background:rgba(255,255,255,.07)!important;color:#fff!important;font-size:18px!important}',
      '.home-ticket-drawer-count{height:54px!important;border-radius:20px!important;background:rgba(0,0,0,.16)!important;display:flex!important;align-items:center!important;justify-content:center!important;color:#fff!important;font-size:20px!important;font-weight:950!important}.home-ticket-list{min-height:0!important;display:grid!important;align-content:start!important;gap:8px!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;scrollbar-width:none!important;padding:0 0 8px!important}.home-ticket-list::-webkit-scrollbar{display:none!important}.home-ticket-list-item{height:38px!important;border-radius:16px!important;background:rgba(255,255,255,.045)!important;color:#fff!important;display:flex!important;align-items:center!important;justify-content:space-between!important;padding:0 10px!important;font-size:12px!important;font-weight:850!important}.home-ticket-list-item span{color:rgba(255,255,255,.54)!important;font-size:11px!important}'
    ].join('');
    document.head.appendChild(st);
  }
  function reelY(index){return 'translate3d(0,-'+((index*40)+20)+'px,0)'}
  function reelDigitsHtml(){var html='';for(var cycle=0;cycle<4;cycle++)for(var n=0;n<10;n++)html+='<span class="home-slot-number-digit">'+n+'</span>';return html}
  function slotsHtml(){var html='';for(var i=0;i<5;i++){var v=(i+1)%10;html+='<div class="home-slot-number-reel" data-slot-index="'+i+'" data-slot-value="'+v+'"><div class="home-slot-number-strip" data-slot-strip style="transform:'+reelY(20+v)+'">'+reelDigitsHtml()+'</div></div>'}return '<div class="home-slot-number-grid" aria-hidden="true">'+html+'</div>'}
  function placeSection(home,sec){var intro=q('.home-intro-card',home);if(intro&&intro.nextSibling!==sec)intro.parentNode.insertBefore(sec,intro.nextSibling);else if(!intro&&home.firstChild!==sec)home.insertBefore(sec,home.firstChild)}
  function ensureDrawerPortal(sec){['homeTicketDrawerBackdrop','homeTicketDrawer'].forEach(function(id){var el=q('#'+id,sec);if(el&&el.parentNode!==document.body)document.body.appendChild(el)})}
  function setDrawer(open,sec){ensureDrawerPortal(sec);var drawer=q('#homeTicketDrawer'),backdrop=q('#homeTicketDrawerBackdrop');if(drawer)drawer.classList.toggle('is-open',!!open);if(backdrop)backdrop.classList.toggle('is-open',!!open)}
  function build(){
    var home=q('#home');if(!home)return null;
    cleanHome();
    var sec=q('#homeLuckyCodeSection',home);
    if(!sec){
      sec=document.createElement('section');
      sec.id='homeLuckyCodeSection';
      sec.innerHTML='<div class="home-ticket-drawer-backdrop" id="homeTicketDrawerBackdrop"></div><div class="home-ticket-drawer" id="homeTicketDrawer"><div class="home-ticket-drawer-head"><strong>My Tickets</strong><button class="home-ticket-drawer-close" id="homeTicketDrawerClose" type="button">×</button></div><div class="home-ticket-drawer-count" data-ticket-count>0 tickets</div><div class="home-ticket-list" id="homeTicketList"></div></div><div class="home-lucky-card"><div class="home-lucky-head" aria-hidden="true"></div><section class="home-lottery-slot-card" aria-label="Lottery slot image"><img class="home-lottery-slot-image" src="/app/api/home-lottery-slot.png?v=home-lottery" alt="" decoding="async" loading="eager"/>'+slotsHtml()+'</section><div class="home-ticket-layout"><div class="home-ticket-card"><div class="home-ticket-card-head"><strong>Get Ticket</strong></div><div class="home-ticket-count" data-ticket-count>1 ticket</div><div class="home-ticket-stepper"><button class="home-ticket-step" type="button" data-ticket-minus>-</button><button class="home-ticket-step" type="button" data-ticket-plus>+</button></div><button class="home-ticket-button" id="homeTicketButton" type="button">Get Ticket</button></div><div class="home-ticket-finance-visual" aria-hidden="true"></div></div></div>';
    }
    placeSection(home,sec);
    ensureDrawerPortal(sec);
    return sec;
  }
  function bind(sec){
    if(sec.dataset.ticketUiBound==='1')return;
    sec.dataset.ticketUiBound='1';
    sec.addEventListener('click',function(e){var t=e.target;if(t&&t.id==='homeTicketImageButton'){e.preventDefault();setDrawer(true,sec)}},true);
    document.addEventListener('click',function(e){var t=e.target;if(t&&t.id==='homeTicketDrawerClose'){e.preventDefault();setDrawer(false,sec);return}if(t&&t.id==='homeTicketDrawerBackdrop'){e.preventDefault();setDrawer(false,sec)}},true);
  }
  function init(){cleanHome();css();var sec=build();if(sec)bind(sec)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
`;

export const HOME_SLOT_TUNING_SCRIPT = `
(function(){
  var busy=false,row=34,restLoop=20,spinLoops=25,totalSpinMs=6000,reelStopGapMs=3000;
  function q(s,r){return (r||document).querySelector(s)}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function y(i){return 'translate3d(0,-'+((i*row)+(row/2))+'px,0)'}
  function digits(){var h='';for(var c=0;c<90;c++)for(var n=0;n<10;n++)h+='<span class="home-slot-number-digit">'+n+'</span>';return h}
  function indexFor(v,loop){return loop*10+Math.max(0,Math.min(9,Math.floor(Number(v)||0)))}
  function tune(){
    if(q('#homeSlotTuningStyle'))return;
    var st=document.createElement('style');st.id='homeSlotTuningStyle';
    st.textContent=[
      'body:has(#home.active) #home, #home.view.active{overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior-y:contain!important;touch-action:pan-y!important}#home .home-bonus-list,#home .home-ticket-drawer,#home .home-ticket-list,.home-bonus-list,.home-ticket-drawer{touch-action:pan-y!important;overscroll-behavior:contain!important}',
      '#home .home-lottery-slot-card{pointer-events:auto!important}',
      '#home .home-slot-number-reel{margin:5px 13px 6px!important;border-radius:11px!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;mask-image:linear-gradient(180deg,rgba(0,0,0,.34) 0%,#000 36%,#000 64%,rgba(0,0,0,.34) 100%)!important;-webkit-mask-image:linear-gradient(180deg,rgba(0,0,0,.34) 0%,#000 36%,#000 64%,rgba(0,0,0,.34) 100%)!important;pointer-events:auto!important}',
      '#home .home-slot-number-reel:first-child{transform:translateX(1px)!important}',
      '#home .home-slot-number-reel:nth-child(2){transform:translateX(0px)!important}',
      '#home .home-slot-number-reel:nth-child(4){transform:translateX(-2px)!important}',
      '#home .home-slot-number-reel:last-child{transform:translateX(-3px)!important}',
      '#home .home-slot-number-strip{position:absolute!important;left:0!important;right:0!important;top:49%!important;display:grid!important;grid-auto-rows:34px!important;will-change:transform!important;transition:none!important;pointer-events:none!important}',
      '#home .home-slot-number-reel.is-spinning .home-slot-number-strip{filter:blur(1px)!important}',
      '#home .home-slot-number-digit{height:34px!important;display:flex!important;align-items:center!important;justify-content:center!important;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter","Segoe UI",sans-serif!important;font-size:31px!important;font-weight:900!important;letter-spacing:-.045em!important;color:transparent!important;background:linear-gradient(180deg,#fff2f4 0%,#d48994 18%,#7f182b 46%,#3b0711 72%,#b94a5d 100%)!important;-webkit-background-clip:text!important;background-clip:text!important;-webkit-text-stroke:.35px rgba(255,205,215,.34)!important;text-shadow:0 1px 0 rgba(255,210,218,.22),0 2px 2px rgba(0,0,0,.74),0 0 12px rgba(115,10,30,.34),0 10px 20px rgba(0,0,0,.64)!important;filter:drop-shadow(0 0 7px rgba(110,7,25,.22))!important}',
      '#home .home-draw-info-card{height:58px!important;margin:0 0 12px!important;border-radius:28px!important;padding:10px 12px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;box-sizing:border-box!important}',
      '#home .home-draw-copy{min-width:0!important;display:flex!important;align-items:center!important;gap:7px!important;white-space:nowrap!important;overflow:hidden!important}.home-draw-label{color:rgba(255,255,255,.54)!important;font-size:12px!important;font-weight:900!important;letter-spacing:-.01em!important;text-transform:none!important}.home-draw-time{font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter","Segoe UI",sans-serif!important;color:transparent!important;background:linear-gradient(180deg,#ffffff 0%,#ffffff 26%,#d9d9dd 58%,#ffffff 100%)!important;-webkit-background-clip:text!important;background-clip:text!important;-webkit-text-stroke:0!important;font-size:19px!important;font-weight:950!important;letter-spacing:.055em!important;white-space:nowrap!important;font-variant-numeric:tabular-nums!important;text-shadow:0 1px 0 rgba(255,255,255,.12),0 2px 2px rgba(0,0,0,.62)!important;filter:none!important}',
      '#home .home-draw-actions{display:flex!important;align-items:center!important;gap:7px!important;flex:0 0 auto!important}.home-bonus-button{width:38px!important;height:38px!important;border:0!important;border-radius:18px!important;background:rgba(0,0,0,.22)!important;color:#fff!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06),inset 0 -1px 0 rgba(255,255,255,.04)!important;display:grid!important;place-items:center!important;padding:0!important;position:relative!important;overflow:hidden!important}.home-bonus-svg{width:27px!important;height:27px!important;display:block!important;fill:none!important;stroke-linecap:round!important;stroke-linejoin:round!important;filter:drop-shadow(0 5px 10px rgba(0,0,0,.28))!important}.home-bonus-svg path{stroke:currentColor!important}.home-action-pop{animation:homeActionPop .42s cubic-bezier(.18,.9,.22,1.25)!important;transform-origin:center!important}@keyframes homeActionPop{0%{transform:scale(1)}34%{transform:scale(.9) translateY(1px)}68%{transform:scale(1.07) translateY(-1px)}100%{transform:scale(1)}}',
      '.home-bonus-backdrop{position:fixed!important;inset:0!important;z-index:99994!important;background:transparent!important;display:none!important}.home-bonus-backdrop.is-open{display:block!important}.home-bonus-panel{position:fixed!important;left:0!important;top:calc(120px + env(safe-area-inset-top))!important;bottom:calc(88px + env(safe-area-inset-bottom))!important;width:min(43vw,202px)!important;max-width:202px!important;z-index:99995!important;padding:18px 11px 12px!important;border-radius:0 24px 24px 0!important;background:rgba(13,13,13,.54)!important;color:#fff!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.105),inset 0 -1px 0 rgba(255,255,255,.06),inset 0 0 22px rgba(255,255,255,.055),0 24px 54px rgba(0,0,0,.36)!important;backdrop-filter:blur(10px) saturate(1.12)!important;-webkit-backdrop-filter:blur(10px) saturate(1.12)!important;transform:translate3d(-104%,0,0)!important;transition:transform .36s cubic-bezier(.18,.88,.24,1)!important;display:grid!important;grid-template-rows:auto auto minmax(0,1fr)!important;gap:8px!important;overflow:hidden!important}.home-bonus-panel.is-open{transform:translate3d(0,0,0)!important}.home-bonus-head{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important}.home-bonus-head strong{font-size:17px!important;font-weight:950!important;letter-spacing:-.035em!important;line-height:1!important}.home-bonus-close{width:29px!important;height:29px!important;border-radius:12px!important;border:0!important;background:rgba(255,255,255,.07)!important;color:#fff!important;font-size:17px!important}.home-bonus-total{height:36px!important;border-radius:15px!important;background:rgba(0,0,0,.22)!important;display:flex!important;align-items:center!important;justify-content:center!important;color:#fff!important;font-size:11px!important;font-weight:950!important;white-space:nowrap!important;letter-spacing:-.01em!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06),inset 0 -1px 0 rgba(255,255,255,.04)!important}.home-bonus-list{min-height:0!important;display:grid!important;align-content:start!important;gap:6px!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;scrollbar-width:none!important;padding:0 0 8px!important}.home-bonus-list::-webkit-scrollbar{display:none!important}.home-bonus-row{height:33px!important;border-radius:14px!important;background:rgba(0,0,0,.22)!important;color:#fff!important;display:grid!important;grid-template-columns:34px minmax(0,1fr)!important;align-items:center!important;padding:0 9px!important;font-size:12px!important;font-weight:900!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.05),inset 0 -1px 0 rgba(255,255,255,.03)!important}.home-bonus-row span{color:rgba(255,255,255,.54)!important;font-size:11px!important;font-weight:900!important}.home-bonus-row b{text-align:right!important;color:#fff!important;font-size:12px!important;font-weight:950!important;white-space:nowrap!important}.home-bonus-row.home-bonus-top-card{min-height:64px!important;height:64px!important;border:0!important;outline:0!important;border-radius:28px!important;background:transparent!important;background-color:transparent!important;background-image:none!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.105),inset 0 -1px 0 rgba(255,255,255,.06),inset 0 0 22px rgba(255,255,255,.055),0 16px 36px rgba(0,0,0,.22)!important;display:grid!important;grid-template-columns:42px minmax(0,1fr) auto!important;align-items:center!important;gap:10px!important;padding:11px 14px!important;backdrop-filter:blur(3px) saturate(1.04)!important;-webkit-backdrop-filter:blur(3px) saturate(1.04)!important;position:relative!important;overflow:hidden!important}.home-bonus-row.home-bonus-top-card>*{position:relative!important;z-index:3!important}.home-bonus-row.home-bonus-top-card .vexa-bonus-premium{position:absolute!important;inset:0!important;z-index:1!important;pointer-events:none!important;border-radius:28px!important;overflow:hidden!important}.home-bonus-row.home-bonus-top-card .vexa-bonus-premium:before{content:""!important;position:absolute!important;inset:-18px!important;border-radius:32px!important;background:radial-gradient(circle at 82% 72%,rgba(92,10,35,.72),rgba(42,4,16,.40) 34%,rgba(42,4,16,.18) 54%,rgba(8,0,4,.04) 78%,rgba(8,0,4,0) 100%),linear-gradient(135deg,rgba(92,10,35,.18),rgba(255,255,255,.035) 45%,rgba(0,0,0,.14))!important;box-shadow:0 0 46px rgba(92,10,35,.34),inset 0 -22px 36px rgba(92,10,35,.18)!important}.home-bonus-rank-avatar{width:42px!important;height:42px!important;border-radius:50%!important;display:grid!important;place-items:center!important;color:#fff!important;font-size:13px!important;font-weight:950!important;background:rgba(255,255,255,.08)!important;box-shadow:none!important}.home-bonus-top-card .home-live-winner-user{min-width:0!important;display:grid!important;gap:3px!important}.home-bonus-top-card .home-live-winner-amount{color:#fff!important;font-size:13px!important;font-weight:950!important;white-space:nowrap!important}',
      '.home-ticket-drawer{background:rgba(13,13,13,.54)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.105),inset 0 -1px 0 rgba(255,255,255,.06),inset 0 0 22px rgba(255,255,255,.055),0 16px 36px rgba(0,0,0,.22)!important;backdrop-filter:blur(10px) saturate(1.12)!important;-webkit-backdrop-filter:blur(10px) saturate(1.12)!important}',
      '.home-ticket-drawer-count{height:44px!important;border-radius:18px!important;background:rgba(0,0,0,.22)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06),inset 0 -1px 0 rgba(255,255,255,.04)!important;color:#fff!important;font-weight:950!important}',
      '.home-ticket-list-item{height:44px!important;border-radius:18px!important;background:rgba(0,0,0,.22)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06),inset 0 -1px 0 rgba(255,255,255,.04)!important;color:#fff!important;font-weight:950!important}',
      '.vexa-confetti-layer{position:fixed!important;inset:0!important;z-index:999999!important;pointer-events:none!important;overflow:hidden!important;opacity:1!important;transition:opacity 420ms ease!important}',
      '.vexa-confetti-layer.is-ending{opacity:0!important}',
      '.vexa-confetti-piece{position:absolute!important;top:var(--y)!important;left:var(--x)!important;width:var(--w)!important;height:var(--h)!important;border-radius:var(--r)!important;background:var(--c)!important;opacity:.94;transform-origin:center!important;animation:vexaConfettiFall 6000ms linear 0ms forwards!important;box-shadow:0 0 9px rgba(255,210,90,.18)!important}',
      '@keyframes vexaConfettiFall{0%{transform:translate3d(0,-42px,0) rotate(0deg)}78%{transform:translate3d(var(--ex),172vh,0) rotate(var(--r3))}100%{transform:translate3d(var(--ex),230vh,0) rotate(var(--r3))}}'
    ].join('');
    document.head.appendChild(st);
  }
  function enableHomeScroll(){var h=q('#home');document.body.classList.remove('home-scroll-locked');if(h){h.style.removeProperty('overflow-y');h.style.removeProperty('touch-action');h.scrollLeft=0}}
  function drawInfoHtml(){return '<div class="home-draw-info-card" id="homeDrawInfoCard"><div class="home-draw-copy"><span class="home-draw-label">Next Draw in</span><strong class="home-draw-time" data-draw-time>--:--:--</strong></div><div class="home-draw-actions" id="homeDrawActions"><button class="home-ticket-image-button" id="homeTicketImageButton" type="button">My Tickets</button><button class="home-bonus-button" id="homeBonusButton" type="button" aria-label="Rewards"><svg class="home-bonus-svg" viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M17 27.5h30v23H17v-23Z" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/><path d="M13.5 18.5h37v9h-37v-9Z" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/><path d="M32 18.5v32" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/><path d="M31.6 18.2c-7.4-.5-12-3.1-12-7 0-2.8 2.2-4.6 4.9-4.1 3.4.6 5.7 4.5 7.1 11.1Z" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/><path d="M32.4 18.2c7.4-.5 12-3.1 12-7 0-2.8 2.2-4.6 4.9-4.1-3.4.6-5.7 4.5-7.1 11.1Z" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/><path d="M21 38h22" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".5"/></svg></button></div></div>'}
  function ensureBonusPanel(){
    if(q('#homeBonusPanel'))return;
    var wrap=document.createElement('div');
    wrap.innerHTML='<div class="home-bonus-backdrop" id="homeBonusBackdrop"></div><div class="home-bonus-panel" id="homeBonusPanel"><div class="home-bonus-head"><strong>Prize List</strong><button class="home-bonus-close" id="homeBonusClose" type="button">×</button></div><div class="home-bonus-total" id="homeBonusTotal"><span data-lottery-claimed-label>Claimed</span><span class="game-online-badge" data-lottery-claimed-dot aria-hidden="true"><i></i></span><span aria-hidden="true">:</span><span data-lottery-round-ticket-count>0</span></div><div class="home-bonus-list"></div></div>';
    while(wrap.firstChild)document.body.appendChild(wrap.firstChild);
  }
  function setBonusPanel(open){ensureBonusPanel();var d=q('#homeBonusPanel'),b=q('#homeBonusBackdrop');if(d)d.classList.toggle('is-open',!!open);if(b)b.classList.toggle('is-open',!!open)}
  function tapAction(el){if(!el)return;el.classList.remove('home-action-pop');void el.offsetWidth;el.classList.add('home-action-pop');setTimeout(function(){try{el.classList.remove('home-action-pop')}catch(e){}},440)}
  function ensureDrawInfoCard(){var slot=q('#home .home-lottery-slot-card');if(!slot)return;var card=q('#homeDrawInfoCard');if(!card)slot.insertAdjacentHTML('beforebegin',drawInfoHtml());ensureBonusPanel()}
  function prepare(){
    tune();enableHomeScroll();ensureDrawInfoCard();
    qa('#home .home-slot-number-reel').forEach(function(reel){
      var strip=q('[data-slot-strip]',reel);if(!strip)return;
      if(strip.dataset.tuned!=='3'){strip.innerHTML=digits();strip.dataset.tuned='3'}
      var v=Math.max(0,Math.min(9,Math.floor(Number(reel.getAttribute('data-slot-value')||'0'))));
      strip.style.setProperty('transition','none','important');strip.style.transform=y(indexFor(v,restLoop));strip.style.willChange='auto';
    });
  }
  function confetti(){
    var old=q('.vexa-confetti-layer');if(old)old.remove();
    var layer=document.createElement('div');layer.className='vexa-confetti-layer';document.body.appendChild(layer);
    var colors=['#ffd36a','#f5b33d','#ffe9a8','#c7892f','#fff4cf','#e0a43a'];
    for(var i=0;i<170;i++){
      var p=document.createElement('i');p.className='vexa-confetti-piece';
      var x=Math.random()*100,wind=(Math.random()*64)-32,w=3+Math.random()*9,h=5+Math.random()*14;
      p.style.setProperty('--y',(-8-Math.random()*150)+'vh');p.style.setProperty('--x',x+'vw');p.style.setProperty('--w',w+'px');p.style.setProperty('--h',h+'px');p.style.setProperty('--r',(Math.random()>.72?'999px':'2px'));p.style.setProperty('--c',colors[Math.floor(Math.random()*colors.length)]);p.style.setProperty('--ex',wind+'vw');p.style.setProperty('--r3',(960+Math.random()*960)+'deg');
      layer.appendChild(p);
    }
    setTimeout(function(){layer.classList.add('is-ending')},5700);
    setTimeout(function(){layer.remove()},6200);
  }
  function cleanSpinCode(code){var value=String(code||'').replace(/[^0-9]/g,'');return value.length===5?value:''}
  function setCode(code){
    var clean=cleanSpinCode(code);if(!clean||busy)return false;prepare();
    qa('#home .home-slot-number-reel').slice(0,5).forEach(function(reel,i){var strip=q('[data-slot-strip]',reel);if(!strip)return;var final=Number(clean.charAt(i));reel.setAttribute('data-slot-value',String(final));strip.style.setProperty('transition','none','important');strip.style.transform=y(indexFor(final,restLoop));strip.style.willChange='auto';reel.classList.remove('is-spinning')});
    return true;
  }
  function spin(targetCode,onComplete){
    if(busy)return false;prepare();busy=true;
    var clean=cleanSpinCode(targetCode);
    var reels=qa('#home .home-slot-number-reel').slice(0,5),pending=reels.length;
    if(!pending){busy=false;return false}
    reels.forEach(function(reel,i){
      var strip=q('[data-slot-strip]',reel);if(!strip){pending--;return}
      var current=Math.max(0,Math.min(9,Math.floor(Number(reel.getAttribute('data-slot-value')||'0'))));
      var final=clean?Number(clean.charAt(i)):Math.floor(Math.random()*10),loops=spinLoops+i*2,finalIndex=indexFor(final,restLoop+loops);
      reel.setAttribute('data-slot-value',String(final));
      strip.style.setProperty('transition','none','important');strip.style.transform=y(indexFor(current,restLoop));strip.style.willChange='transform';reel.classList.add('is-spinning');
      setTimeout(function(){strip.style.setProperty('transition','transform '+(totalSpinMs+i*reelStopGapMs)+'ms linear','important');strip.style.transform=y(finalIndex)},30+i*60);
      setTimeout(function(){strip.style.setProperty('transition','none','important');strip.style.transform=y(indexFor(final,restLoop));strip.style.willChange='auto';reel.classList.remove('is-spinning');pending--;if(pending<=0){busy=false;if(typeof onComplete==='function'){try{onComplete()}catch(e){}}}},totalSpinMs+i*reelStopGapMs+260);
    });
    return true;
  }
  window.VexaLotteryWinnerEffect=confetti;
  window.VexaLotterySlotEngine={spinTo:spin,setCode:setCode,durationMs:totalSpinMs+(4*reelStopGapMs)+260};
  document.addEventListener('click',function(e){
    var t=e.target,my=t&&t.closest&&t.closest('#homeTicketImageButton');
    if(my)tapAction(my);
    var bonus=t&&t.closest&&t.closest('#homeBonusButton');
    if(bonus){tapAction(bonus);e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();setBonusPanel(true);return}
    if(t&&t.id==='homeBonusClose'){e.preventDefault();setBonusPanel(false);return}
    if(t&&t.id==='homeBonusBackdrop'){e.preventDefault();setBonusPanel(false)}
  },true);
  document.addEventListener('scroll',function(){var h=q('#home');if(h&&h.classList.contains('active'))h.scrollLeft=0},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',prepare,{once:true});else prepare();
  window.addEventListener('focus',prepare);
})();
`;
