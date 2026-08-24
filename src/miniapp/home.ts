export const HOME_STYLES = `
#home{padding-top:4px}
#rankPill{display:none!important}
#home #homeDrawInfoCard.home-draw-info-card,
#home .home-ticket-card{
  position:relative!important;
  overflow:hidden!important;
  border-radius:28px!important;
  background:transparent!important;
  background-color:transparent!important;
  background-image:none!important;
  border:0!important;
  outline:0!important;
  box-shadow:
    0 12px 30px rgba(31,1,10,.32),
    0 0 18px rgba(69,5,26,.15),
    inset 3px 3px .5px -3.5px rgba(255,255,255,.10),
    inset -3px -3px .5px -3.5px rgba(156,38,70,.48),
    inset 1px 1px 1px -.5px rgba(140,29,61,.30),
    inset -1px -1px 1px -.5px rgba(124,22,53,.24),
    inset 0 0 6px 6px rgba(255,255,255,.055),
    inset 0 0 2px 2px rgba(255,255,255,.035)!important;
  backdrop-filter:blur(22px) saturate(1.40) brightness(1.05) contrast(1.04)!important;
  -webkit-backdrop-filter:blur(22px) saturate(1.40) brightness(1.05) contrast(1.04)!important;
  isolation:isolate!important;
  transform:translateZ(0)!important;
}
#home #homeDrawInfoCard.home-draw-info-card:before,
#home .home-ticket-card:before{
  content:''!important;
  position:absolute!important;
  inset:0!important;
  z-index:0!important;
  border-radius:inherit!important;
  display:block!important;
  pointer-events:none!important;
  background:
    radial-gradient(34px 34px at 0 0,rgba(186,53,87,.16) 0%,rgba(146,35,66,.07) 42%,rgba(104,18,44,0) 76%),
    radial-gradient(36px 36px at 100% 100%,rgba(172,46,79,.15) 0%,rgba(133,30,60,.065) 43%,rgba(94,16,39,0) 78%),
    radial-gradient(118% 76% at 10% -16%,rgba(255,255,255,.12) 0%,rgba(255,255,255,.032) 30%,rgba(255,255,255,0) 58%),
    radial-gradient(96% 72% at 102% 108%,rgba(255,255,255,.052) 0%,rgba(255,255,255,.010) 34%,rgba(255,255,255,0) 62%),
    radial-gradient(92% 78% at 88% 112%,rgba(72,5,27,.11) 0%,rgba(42,3,16,0) 60%)!important;
  box-shadow:inset 0 1px 0 rgba(112,18,49,.065),inset 0 -1px 0 rgba(88,12,37,.15)!important;
  opacity:1!important;
}
#home #homeDrawInfoCard.home-draw-info-card>*,
#home .home-ticket-card>*{position:relative!important;z-index:1!important}
#home .home-ticket-card .home-ticket-count{
  box-shadow:inset 0 1px 0 rgba(255,255,255,.12),inset 0 -1px 0 rgba(255,255,255,.08)!important;
}
#home .home-ticket-card .home-ticket-step,
#home .home-ticket-card .home-ticket-button{
  position:relative!important;
  overflow:hidden!important;
  height:38px!important;
  padding:0 12px!important;
  border:0!important;
  border-radius:18px!important;
  background:rgba(0,0,0,.22)!important;
  color:#fff!important;
  font-size:12px!important;
  font-weight:950!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.06),inset 0 -1px 0 rgba(255,255,255,.04)!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}
#home .home-ticket-card .home-ticket-step{font-size:0!important;line-height:0!important;color:transparent!important}
#home .home-ticket-card .home-ticket-button{width:100%!important}
#home .home-ticket-card .home-ticket-step:before,
#home .home-ticket-card .home-ticket-step:after{
  content:''!important;
  position:absolute!important;
  left:50%!important;
  top:50%!important;
  width:16px!important;
  height:2.6px!important;
  border-radius:999px!important;
  background:#fff!important;
  box-shadow:none!important;
  transform:translate(-50%,-50%)!important;
  pointer-events:none!important;
}
#home .home-ticket-card .home-ticket-step[data-ticket-minus]:after{display:none!important}
#home .home-ticket-card .home-ticket-step[data-ticket-plus]:after{display:block!important;width:2.6px!important;height:16px!important}
html body:has(#home.active){
  isolation:isolate!important;
  background:#000!important;
}
html body:has(#home.active)::before{
  content:""!important;
  display:block!important;
  position:fixed!important;
  inset:0!important;
  width:100vw!important;
  height:100dvh!important;
  z-index:-1!important;
  pointer-events:none!important;
  background-color:#000!important;
  background-image:url('/assets/Home.PNG?v=1')!important;
  background-size:cover!important;
  background-position:center top!important;
  background-repeat:no-repeat!important;
  transform:none!important;
  animation:none!important;
  filter:none!important;
  opacity:1!important;
}
html body:has(#home.active)::after,
html body:has(#home.active) .app::before,
html body:has(#home.active) .app::after{
  display:none!important;
  content:none!important;
  background:none!important;
  background-image:none!important;
}
html body:has(#home.active) .app,
html body:has(#home.active) main.app,
html body:has(#home.active) .content,
html body:has(#home.active) #home.view,
html body:has(#home.active) .top,
html body:has(#home.active) header.top{
  background:transparent!important;
  background-color:transparent!important;
  background-image:none!important;
}
`

// Home owns its markup, styles, asset synchronization, and client behavior.
const EMPTY_HOME_SLOT_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';

function htmlAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function homeSection(homeSlotImageUrl = EMPTY_HOME_SLOT_IMAGE): string {
  return `<section id="home" class="view active" data-home-slot-image="${htmlAttribute(encodeURIComponent(homeSlotImageUrl))}"></section>`;
}

const HOME_MARKUP_SCRIPT = `
(function(){
  function q(s,r){return (r||document).querySelector(s)}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function css(){
    var old=q('#homeLuckyCodeStyle');if(old)old.outerHTML='';
    var st=document.createElement('style');st.id='homeLuckyCodeStyle';
    st.textContent=[
      '#home{overflow-y:auto!important;overflow-x:hidden!important;padding-bottom:calc(98px + env(safe-area-inset-bottom))!important;background:transparent!important;-webkit-overflow-scrolling:touch!important;scrollbar-width:none!important}',
      '#homeLuckyCodeSection{display:block!important;padding:0!important;margin:0!important;background:transparent!important;box-shadow:none!important;overflow:visible!important}',
      'body:has(#home.active) #home{overflow-y:auto!important;overflow-x:hidden!important}',
      '.home-lucky-card{background:none!important;border:0!important;box-shadow:none!important;padding:0!important;overflow:visible!important}',
      '.home-lucky-head{display:none!important}',
      '#home .home-lottery-slot-card{width:100%!important;height:88px!important;min-height:88px!important;max-height:88px!important;margin:0 0 10px!important;border:0!important;outline:0!important;border-radius:22px!important;background:transparent!important;background-color:transparent!important;background-image:none!important;box-shadow:none!important;backdrop-filter:blur(10px) saturate(1.12)!important;-webkit-backdrop-filter:blur(10px) saturate(1.12)!important;overflow:hidden!important;padding:0!important;position:relative!important;box-sizing:border-box!important}',
      '#home .home-lottery-slot-card:before,#home .home-lottery-slot-card:after{display:none!important;content:none!important}',
      '#home .home-lottery-slot-image{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;display:block!important;object-fit:cover!important;object-position:center!important;border:0!important;outline:0!important;border-radius:22px!important;background:transparent!important;box-shadow:none!important;opacity:1!important}',
      '#home .home-slot-number-grid{position:absolute!important;inset:0!important;z-index:2!important;display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:8px!important;padding:7px 8px!important;box-sizing:border-box!important;pointer-events:none!important}',
      '#home .home-slot-number-reel{position:relative!important;display:block!important;border-radius:17px!important;overflow:hidden!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}',
      '#home .home-slot-number-reel:before{display:none!important;content:none!important}',
      '#home .home-slot-number-strip{position:absolute!important;left:0!important;right:0!important;top:50%!important;display:grid!important;grid-auto-rows:40px!important;will-change:transform!important;transition:none!important}',
      '#home .home-slot-number-reel.is-spinning .home-slot-number-strip{filter:blur(1.2px)!important}',
      '#home .home-slot-number-digit{height:40px!important;display:flex!important;align-items:center!important;justify-content:center!important;color:#fff!important;font-size:34px!important;line-height:1!important;font-weight:950!important;letter-spacing:-.065em!important;text-shadow:0 1px 0 rgba(255,255,255,.32),0 0 16px rgba(255,86,137,.54),0 12px 26px rgba(0,0,0,.54)!important;font-variant-numeric:tabular-nums!important;background:linear-gradient(180deg,#fff 0%,#ffe9f1 42%,#d85a7a 100%)!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important}',
      '.home-ticket-layout{margin-top:14px!important;display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:12px!important;align-items:stretch!important}',
      '.home-ticket-card{margin:0!important;border-radius:28px!important;padding:14px!important;min-height:154px!important;display:grid!important;gap:10px!important;align-content:space-between!important}',
      '.home-ticket-card-head{display:flex!important;align-items:flex-start!important;justify-content:flex-start!important;gap:10px!important}.home-ticket-card-head strong{color:#fff!important;font-size:16px!important;font-weight:950!important}.home-ticket-count{height:44px!important;width:100%!important;border-radius:18px!important;background:rgba(0,0,0,.22)!important;color:#fff!important;font-size:20px!important;font-weight:950!important;display:flex!important;align-items:center!important;justify-content:center!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06),inset 0 -1px 0 rgba(255,255,255,.04)!important}',
      '.home-ticket-stepper{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important}',
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
  function placeSection(home,sec){if(home.firstChild!==sec)home.insertBefore(sec,home.firstChild)}
  function ensureDrawerPortal(sec){['homeTicketDrawerBackdrop','homeTicketDrawer'].forEach(function(id){var el=q('#'+id,sec);if(el&&el.parentNode!==document.body)document.body.appendChild(el)})}
  function setDrawer(open,sec){ensureDrawerPortal(sec);var drawer=q('#homeTicketDrawer'),backdrop=q('#homeTicketDrawerBackdrop');if(drawer)drawer.classList.toggle('is-open',!!open);if(backdrop)backdrop.classList.toggle('is-open',!!open)}
  function build(){
    var home=q('#home');if(!home)return null;
    var sec=q('#homeLuckyCodeSection',home);
    if(!sec){
      sec=document.createElement('section');
      sec.id='homeLuckyCodeSection';
      sec.innerHTML='<div class="home-ticket-drawer-backdrop" id="homeTicketDrawerBackdrop"></div><div class="home-ticket-drawer" id="homeTicketDrawer"><div class="home-ticket-drawer-head"><strong>My Tickets</strong><button class="home-ticket-drawer-close" id="homeTicketDrawerClose" type="button">×</button></div><div class="home-ticket-drawer-count" data-ticket-count>0 tickets</div><div class="home-ticket-list" id="homeTicketList"></div></div><div class="home-lucky-card"><div class="home-lucky-head" aria-hidden="true"></div><section class="home-lottery-slot-card" aria-label="Lottery slot image"><img class="home-lottery-slot-image" src="'+decodeURIComponent(home.getAttribute('data-home-slot-image')||'')+'" alt="" decoding="async" loading="eager"/>'+slotsHtml()+'</section><div class="home-ticket-layout"><div class="home-ticket-card"><div class="home-ticket-card-head"><strong>Get Ticket</strong></div><div class="home-ticket-count" data-ticket-count>1 ticket</div><div class="home-ticket-stepper"><button class="home-ticket-step" type="button" data-ticket-minus>-</button><button class="home-ticket-step" type="button" data-ticket-plus>+</button></div><button class="home-ticket-button" id="homeTicketButton" type="button">Get Ticket</button></div><div class="home-ticket-finance-visual" aria-hidden="true"></div></div></div>';
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
  function init(){css();var sec=build();if(sec)bind(sec)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
`;

const HOME_SLOT_SCRIPT = `
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
      '#home .home-draw-actions{display:flex!important;align-items:center!important;gap:7px!important;flex:0 0 auto!important}.home-draw-actions .home-ticket-image-button{height:38px!important;min-width:88px!important;padding:0 12px!important;border:0!important;border-radius:18px!important;background:rgba(0,0,0,.22)!important;color:#fff!important;font-size:12px!important;font-weight:950!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06),inset 0 -1px 0 rgba(255,255,255,.04)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}.home-bonus-button{width:38px!important;height:38px!important;border:0!important;border-radius:18px!important;background:rgba(0,0,0,.22)!important;color:#fff!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06),inset 0 -1px 0 rgba(255,255,255,.04)!important;display:grid!important;place-items:center!important;padding:0!important;position:relative!important;overflow:hidden!important}.home-bonus-svg{width:27px!important;height:27px!important;display:block!important;fill:none!important;stroke-linecap:round!important;stroke-linejoin:round!important;filter:drop-shadow(0 5px 10px rgba(0,0,0,.28))!important}.home-bonus-svg path{stroke:currentColor!important}.home-action-pop{animation:homeActionPop .42s cubic-bezier(.18,.9,.22,1.25)!important;transform-origin:center!important}@keyframes homeActionPop{0%{transform:scale(1)}34%{transform:scale(.9) translateY(1px)}68%{transform:scale(1.07) translateY(-1px)}100%{transform:scale(1)}}',
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
  function drawInfoHtml(){return '<div class="home-draw-info-card" id="homeDrawInfoCard"><div class="home-draw-copy"><span class="home-draw-label">Next Draw in</span><strong class="home-draw-time" data-draw-time>--:--:--</strong></div><div class="home-draw-actions" id="homeDrawActions"><button class="home-ticket-image-button" id="homeTicketImageButton" type="button">My Tickets</button><button class="home-bonus-button" id="homeBonusButton" type="button" aria-label="Rewards"><svg class="home-bonus-svg" viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M17 27.5h30v23H17v-23Z" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/><path d="M13.5 18.5h37v9h-37v-9Z" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/><path d="M32 18.5v32" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/><path d="M31.6 18.2c-7.4-.5-12-3.1-12-7 0-2.8 2.2-4.6 4.9-4.1 3.4.6 5.7 4.5 7.1 11.1Z" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/><path d="M32.4 18.2c7.4-.5 12-3.1 12-7 0-2.8-2.2-4.6-4.9-4.1-3.4.6-5.7 4.5-7.1 11.1Z" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/><path d="M21 38h22" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".5"/></svg></button></div></div>'}
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

const HOME_ASSET_SCRIPT = `
(function(){
  var introAppliedUrl='';
  var tonLogoAppliedUrl='';
  var homeSlotAppliedUrl='';
  var tonLogoInFlight=null;
  var introInFlight=null;
  var homeSlotInFlight=null;
  var tonLogoCheckedAt=0;
  var homeSlotCheckedAt=0;
  var META_CACHE_MS=300000;
  var TON_META_KEY='vexaTonLogoMeta:v1';
  var INTRO_META_KEY='vexaHomeIntroImageMeta:v1';
  var HOME_SLOT_META_KEY='vexaHomeLotterySlotMeta:v1';
  function cacheIntro(url){try{if(!url||!('caches'in window))return;var req=new Request(url,{cache:'force-cache'});caches.open('vexa-home-intro-images-v1').then(function(cache){cache.match(req).then(function(hit){if(hit)return;fetch(req,{cache:'force-cache'}).then(function(res){if(res&&res.ok)cache.put(req,res.clone())}).catch(function(){})}).catch(function(){})}).catch(function(){})}catch(e){}}
  function setRewardsIntroAspect(url){try{var img=new Image();img.onload=function(){if(!img.naturalWidth||!img.naturalHeight)return;var ratio=img.naturalWidth+'/'+img.naturalHeight;document.querySelectorAll('#rewards .rewards-home-intro-card,#rewards .rewards-home-intro-image-frame').forEach(function(n){n.style.setProperty('--rewards-intro-aspect',ratio);n.style.setProperty('aspect-ratio',ratio,'important');n.style.setProperty('height','auto','important');n.style.setProperty('min-height','0','important')})};img.src=url}catch(e){}}
  function applyIntroUrl(url){if(!url)return;if(introAppliedUrl!==url){introAppliedUrl=url;cacheIntro(url);setRewardsIntroAspect(url)}var bg='url("'+String(url).replace(/"/g,'')+'")';var frames=document.querySelectorAll('#rewards .home-intro-image-frame,#rewards .rewards-home-intro-image-frame');for(var j=0;j<frames.length;j++){frames[j].style.setProperty('background-image',bg,'important');if(frames[j].classList&&frames[j].classList.contains('rewards-home-intro-image-frame')){frames[j].style.setProperty('background-size','100% 100%','important');frames[j].style.setProperty('background-position','center center','important')}}var rewardCards=document.querySelectorAll('#rewards .rewards-home-intro-card');for(var k=0;k<rewardCards.length;k++){rewardCards[k].style.setProperty('background-image','none','important');rewardCards[k].style.setProperty('--rewards-intro-bg',bg)}}
  function applyTonLogo(url){if(!url)return;tonLogoAppliedUrl=url;var icons=document.querySelectorAll('.ton-mini-icon img');for(var i=0;i<icons.length;i++){if(icons[i].getAttribute('src')!==url)icons[i].setAttribute('src',url)}}
  function applyHomeSlotUrl(url){
    if(!url)return false;
    homeSlotAppliedUrl=url;
    var nodes=document.querySelectorAll('#home .home-lottery-slot-image');
    var applied=false;
    for(var i=0;i<nodes.length;i++){
      var img=nodes[i];
      if(img.getAttribute('data-vexa-home-slot-url')===url){applied=true;continue}
      img.setAttribute('data-vexa-home-slot-url',url);
      img.setAttribute('data-vexa-home-slot-retry','0');
      img.onload=function(){this.setAttribute('data-vexa-home-slot-retry','0')};
      img.onerror=function(){
        if(this.getAttribute('data-vexa-home-slot-retry')==='1')return;
        this.setAttribute('data-vexa-home-slot-retry','1');
        var wanted=this.getAttribute('data-vexa-home-slot-url')||'';
        if(!wanted)return;
        this.src=wanted+(wanted.indexOf('?')>=0?'&':'?')+'retry='+Date.now();
      };
      if(img.getAttribute('src')!==url)img.setAttribute('src',url);
      applied=true;
    }
    return applied;
  }
  function readMeta(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch(e){return null}}
  function saveMeta(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch(e){}}
  function loadHomeSlotVersion(force){
    try{
      var cached=readMeta(HOME_SLOT_META_KEY);
      if(cached&&cached.url)applyHomeSlotUrl(cached.url);
      if(!force&&cached&&cached.checkedAt&&Date.now()-Number(cached.checkedAt)<META_CACHE_MS){homeSlotCheckedAt=Number(cached.checkedAt)||0;return Promise.resolve(cached)}
      if(!force&&homeSlotCheckedAt)return Promise.resolve(cached);
      if(homeSlotInFlight)return homeSlotInFlight;
      homeSlotInFlight=fetch('/app/api/home-lottery-slot-meta',{cache:'no-store',credentials:'same-origin',headers:{'accept':'application/json'}})
        .then(function(r){return r.ok?r.json():null})
        .then(function(meta){
          homeSlotCheckedAt=Date.now();
          if(meta&&meta.hasImage&&meta.url){var next={url:meta.url,version:meta.version||'',checkedAt:homeSlotCheckedAt};saveMeta(HOME_SLOT_META_KEY,next);applyHomeSlotUrl(meta.url);return next}
          return cached;
        })
        .catch(function(){return cached})
        .finally(function(){homeSlotInFlight=null});
      return homeSlotInFlight;
    }catch(e){return Promise.resolve(null)}
  }
  function loadTonLogo(force){
    try{
      var cached=readMeta(TON_META_KEY);if(cached&&cached.url){applyTonLogo(cached.url);tonLogoCheckedAt=Math.max(tonLogoCheckedAt,Number(cached.checkedAt)||0)}
      var now=Date.now();if(!force&&tonLogoAppliedUrl&&tonLogoCheckedAt&&now-tonLogoCheckedAt<META_CACHE_MS)return Promise.resolve(cached);
      if(tonLogoInFlight)return tonLogoInFlight;
      tonLogoInFlight=fetch('/app/api/uploaded-images?context=home',{cache:'no-store',headers:{'accept':'application/json'}})
        .then(function(r){return r.ok?r.json():null})
        .then(function(meta){tonLogoCheckedAt=Date.now();if(meta&&meta.tonIconUrl){var next={url:meta.tonIconUrl,checkedAt:tonLogoCheckedAt};saveMeta(TON_META_KEY,next);applyTonLogo(meta.tonIconUrl);return next}return meta})
        .catch(function(){return cached})
        .finally(function(){tonLogoInFlight=null});
      return tonLogoInFlight;
    }catch(e){return Promise.resolve(null)}
  }
  function loadIntroImageVersion(force){
    try{
      var cached=readMeta(INTRO_META_KEY);if(cached&&cached.url)applyIntroUrl(cached.url);
      if(!force&&cached&&cached.checkedAt&&Date.now()-Number(cached.checkedAt)<META_CACHE_MS)return Promise.resolve(cached);
      if(introInFlight)return introInFlight;
      introInFlight=fetch('/app/api/home-intro-image-meta',{headers:{'accept':'application/json'}})
        .then(function(r){return r.ok?r.json():null})
        .then(function(meta){if(meta&&meta.url){meta.checkedAt=Date.now();saveMeta(INTRO_META_KEY,meta);applyIntroUrl(meta.url)}return meta})
        .catch(function(){return cached})
        .finally(function(){introInFlight=null});
      return introInFlight;
    }catch(e){return Promise.resolve(null)}
  }
  function apply(){loadHomeSlotVersion(false);loadTonLogo(false);loadIntroImageVersion(false)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  window.VexaRefreshHomeLotteryChrome=apply;window.VexaRefreshHomeIntroImage=function(){return loadIntroImageVersion(true)};window.VexaRefreshTonLogo=function(){return loadTonLogo(true)};window.VexaRefreshHomeLotterySlotImage=function(){homeSlotCheckedAt=0;return loadHomeSlotVersion(true)};
})();
`;

export const HOME_SCRIPT = HOME_ASSET_SCRIPT + HOME_MARKUP_SCRIPT + HOME_SLOT_SCRIPT;

export const HOME_LOTTERY_CLIENT_SCRIPT = `
<script>
(function(){
  var state=null,busy=false,loading=false,quantity=1,MAX_QTY=20,serverOffsetMs=0,clockStarted=false,drawRefreshPending=false;
  var lifecycleTimer=0,lifecycleRetryMs=800,lastLoadAt=0;
  var drawInitialized=false,lastDrawId='',winnerEffectDrawId='',drawSpinTimer=0,scheduledDrawId='';
  var officialSpinActive=false,suppressedWindowFocus=false;
  var DRAW_DELAY_MS=5000,DRAW_ANIMATION_MS=18260,NEXT_ROUND_DELAY_MS=10000;
  function q(s,r){return (r||document).querySelector(s)}
  function initData(){var tg=window.Telegram&&window.Telegram.WebApp;return String(tg&&tg.initData||'')}
  function gram(nano){var value=Math.max(0,Number(nano)||0)/1000000000;return value.toFixed(2).replace(/\\.00$/,'').replace(/(\\.\\d)0$/,'$1')}
  function gramPrice(nano){var value=Math.max(0,Number(nano)||0)/1000000000,text=value.toFixed(4).replace(/0+$/,'');var dot=text.indexOf('.');if(dot<0)return text+'.00';var decimals=text.length-dot-1;if(decimals===0)return text+'00';if(decimals===1)return text+'0';return text}
  function purchaseId(){
    try{if(crypto&&crypto.randomUUID)return 'lp_'+crypto.randomUUID().replace(/-/g,'')}catch(e){}
    try{var bytes=new Uint8Array(12);crypto.getRandomValues(bytes);return 'lp_'+Array.prototype.map.call(bytes,function(v){return v.toString(16).padStart(2,'0')}).join('')}catch(e){}
    return 'lp_'+Date.now().toString(36)
  }
  function haptic(kind){try{var tg=window.Telegram&&window.Telegram.WebApp;if(tg&&tg.HapticFeedback){if(kind==='success'||kind==='error')tg.HapticFeedback.notificationOccurred(kind);else tg.HapticFeedback.impactOccurred(kind||'light')}}catch(e){}}
  function syncServerClock(payload,requestStartedAt,receivedAt){
    var serverNow=Number(payload&&payload.serverNowMs);if(!Number.isFinite(serverNow)||serverNow<=0)return;
    var started=Number(requestStartedAt)||receivedAt,total=Math.max(0,receivedAt-started),serverStarted=Number(payload&&payload.serverStartedAtMs);
    var processing=Number.isFinite(serverStarted)&&serverStarted>0?Math.max(0,serverNow-serverStarted):0;
    var transitRtt=Math.max(0,total-processing);
    serverOffsetMs=(serverNow+(transitRtt/2))-receivedAt;window.VexaLotteryServerOffsetMs=serverOffsetMs;
  }
  function liveServerNow(){return Date.now()+serverOffsetMs}
  function roundTime(name,fallback){
    var round=state&&state.round,raw=round&&round[name],value=Date.parse(String(raw||''));
    if(Number.isFinite(value))return value;
    var drawAt=Date.parse(String(round&&round.drawAt||''));
    return Number.isFinite(drawAt)?drawAt+(Number(fallback)||0):0;
  }
  function formatCountdown(ms){var s=Math.max(0,Math.floor(ms/1000)),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0')}
  function lifecycleDueTime(){
    var round=state&&state.round;if(!round)return 0;
    return round.status==='open'?roundTime('drawAt',0):roundTime('nextRoundStartsAt',DRAW_DELAY_MS+DRAW_ANIMATION_MS+NEXT_ROUND_DELAY_MS);
  }
  function clearLifecycleTimer(){if(lifecycleTimer){clearTimeout(lifecycleTimer);lifecycleTimer=0}}
  function scheduleLifecycleRefresh(delay){
    clearLifecycleTimer();
    lifecycleTimer=setTimeout(function(){lifecycleTimer=0;refreshLifecycle()},Math.max(80,Math.floor(Number(delay)||0)));
  }
  function armLifecycle(){
    clearLifecycleTimer();
    var due=lifecycleDueTime();if(!due)return;
    var now=liveServerNow();
    if(due>now){lifecycleRetryMs=800;scheduleLifecycleRefresh(due-now+80);return}
    scheduleLifecycleRefresh(lifecycleRetryMs);
  }
  function refreshLifecycle(){
    if(drawRefreshPending||busy||loading){if(!lifecycleTimer)scheduleLifecycleRefresh(lifecycleRetryMs);return}
    drawRefreshPending=true;
    load(true).finally(function(){drawRefreshPending=false});
  }
  function updateCountdown(){
    var round=state&&state.round,time=q('#homeDrawInfoCard [data-draw-time]'),now=liveServerNow();
    if(!round){if(time)time.textContent='--:--:--';return}
    var drawAt=roundTime('drawAt',0);
    if(round.status==='open'){
      if(drawAt&&now<drawAt){if(time)time.textContent=formatCountdown(drawAt-now);return}
      if(time)time.textContent='00:00:00';
      if(!lifecycleTimer&&!drawRefreshPending&&!loading)scheduleLifecycleRefresh(80);
      return;
    }
    if(time)time.textContent='00:00:00';
    var nextStartsAt=roundTime('nextRoundStartsAt',DRAW_DELAY_MS+DRAW_ANIMATION_MS+NEXT_ROUND_DELAY_MS);
    if(nextStartsAt&&now>=nextStartsAt&&!lifecycleTimer&&!drawRefreshPending&&!loading)scheduleLifecycleRefresh(80);
  }
  function listHtml(tickets){
    if(!tickets||!tickets.length)return '<div class="home-ticket-list-item"><b>No tickets</b><span>empty</span></div>';
    return tickets.map(function(ticket){var label=ticket.isFree?'FREE':gram(ticket.priceNano)+' GRAM';return '<div class="home-ticket-list-item"><b>#'+String(ticket.ticketNumber||'').padStart(5,'0').slice(-5)+'</b><span>'+label+'</span></div>'}).join('');
  }
  function purchaseCostNano(){if(!state)return 0;var free=state.freeTicketAvailable?1:0;return Math.max(0,quantity-free)*Math.max(0,Number(state.settings&&state.settings.ticketPriceNano)||150000000)}
  function remainingLimit(){if(!state||!state.settings)return MAX_QTY;var limit=Math.max(0,Number(state.settings.maxTicketsPerUser)||0);if(!limit)return MAX_QTY;return Math.max(0,limit-Math.max(0,Number(state.ticketCount)||0))}
  function maxSelectable(){return Math.max(1,Math.min(MAX_QTY,remainingLimit()||1))}
  function balanceIconSrc(){var img=q('.top-balance-pill .ton-mini-icon img');return String(img&&(img.getAttribute('src')||img.src)||'')}
  function paidButtonHtml(cost){var src=balanceIconSrc(),icon=src?'<img src="'+src+'" alt="" aria-hidden="true" style="width:28px;height:28px;display:block;object-fit:contain;transform:translateY(1px)">':'';return '<span style="display:flex;width:100%;align-items:center;justify-content:center;gap:1px"><span style="font-size:calc(1em + 2px);line-height:1">'+gramPrice(cost)+'</span>'+icon+'</span>'}
  function prizeRowsHtml(prizes){
    var rows=Array.isArray(prizes)?prizes:[],html='';
    for(var i=0;i<15;i++){
      var prize=rows[i]||{rank:i+1,prizeNano:0},rank=i+1,premium=rank<=3?'<div class="vexa-bonus-premium" aria-hidden="true"></div>':'';
      html+='<article class="home-bonus-row home-bonus-top-card home-live-winner-card">'+premium+'<div class="home-live-winner-avatar home-bonus-rank-avatar">#'+rank+'</div><div class="home-live-winner-user" aria-hidden="true"></div><div class="home-live-winner-amount">'+gram(prize.prizeNano)+' GRAM</div></article>';
    }
    return html;
  }
  function roundTicketCount(){return Math.max(0,Math.floor(Number(state&&state.roundTicketCount)||0))}
  function renderClaimedTickets(){
    var value=q('#homeBonusTotal [data-lottery-round-ticket-count]');if(value)value.textContent=roundTicketCount().toLocaleString('en-US');
  }
  function renderPrizePanel(){var list=q('#homeBonusPanel .home-bonus-list');if(list&&state&&Array.isArray(state.prizes))list.innerHTML=prizeRowsHtml(state.prizes);renderClaimedTickets()}
  function render(){
    var cardCount=q('#home .home-ticket-card [data-ticket-count]'),drawerCount=q('#homeTicketDrawer [data-ticket-count]'),list=q('#homeTicketList'),button=q('#homeTicketButton');
    var count=Math.max(0,Number(state&&state.ticketCount)||0),limitReached=!!(state&&state.settings&&Number(state.settings.maxTicketsPerUser)>0&&remainingLimit()<=0);
    var max=maxSelectable();if(quantity>max)quantity=max;if(quantity<1)quantity=1;
    if(cardCount)cardCount.textContent=quantity+' ticket'+(quantity===1?'':'s');
    if(drawerCount)drawerCount.textContent=count+' ticket'+(count===1?'':'s');
    if(list)list.innerHTML=listHtml(state&&state.tickets||[]);
    var minus=q('#home [data-ticket-minus]'),plus=q('#home [data-ticket-plus]');
    if(minus)minus.disabled=busy||quantity<=1||limitReached;
    if(plus)plus.disabled=busy||quantity>=max||!state||!state.canBuy||limitReached;
    if(button){
      var cost=purchaseCostNano();
      if(busy){button.textContent='Getting Ticket…';button.removeAttribute('aria-label')}
      else if(limitReached){button.textContent='Ticket limit reached';button.removeAttribute('aria-label')}
      else if(state&&state.canBuy&&cost<=0){button.textContent='Get Free Ticket';button.setAttribute('aria-label','Get Free Ticket')}
      else if(state&&state.canBuy){button.innerHTML=paidButtonHtml(cost);button.setAttribute('aria-label',gramPrice(cost)+' GRAM')}
      else if(state&&state.reason){button.textContent=state.reason;button.removeAttribute('aria-label')}
      else if(!initData()){button.textContent='Open in Telegram';button.removeAttribute('aria-label')}
      button.disabled=busy||!state||!state.canBuy||!initData()||limitReached;
    }
    renderPrizePanel();
    updateCountdown();
  }
  function slotEngine(){return window.VexaLotterySlotEngine||null}
  function replaySuppressedFocus(){
    if(!suppressedWindowFocus)return;
    suppressedWindowFocus=false;
    setTimeout(function(){
      try{window.dispatchEvent(new Event('focus'))}
      catch(e){try{var event=document.createEvent('Event');event.initEvent('focus',false,false);window.dispatchEvent(event)}catch(x){}}
    },0);
  }
  function setOfficialSpinActive(active){officialSpinActive=!!active;if(!officialSpinActive)replaySuppressedFocus()}
  function guardOfficialSpinFocus(event){
    if(!officialSpinActive||event&&event.target!==window)return;
    suppressedWindowFocus=true;
    if(event&&typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
  }
  function setStaticCode(code){
    var engine=slotEngine();if(!engine||typeof engine.setCode!=='function')return;
    try{engine.setCode(code)}catch(e){}
  }
  function winnerEffectAlreadyShown(drawId){try{return localStorage.getItem('vexaLotteryWinnerEffect:'+drawId)==='1'}catch(e){return false}}
  function markWinnerEffectShown(drawId){try{localStorage.setItem('vexaLotteryWinnerEffect:'+drawId,'1')}catch(e){}}
  function playWinnerEffect(){try{if(typeof window.VexaLotteryWinnerEffect==='function')window.VexaLotteryWinnerEffect()}catch(e){}}
  function triggerWinnerEffect(drawId){
    if(!drawId||winnerEffectDrawId===drawId||winnerEffectAlreadyShown(drawId))return;
    winnerEffectDrawId=drawId;markWinnerEffectShown(drawId);haptic('success');playWinnerEffect();
  }
  function scheduleLiveDraw(drawId,code,won,startAt){
    if(!drawId||!/^\\d{5}$/.test(String(code||''))||scheduledDrawId===drawId)return;
    scheduledDrawId=drawId;if(drawSpinTimer)clearTimeout(drawSpinTimer);
    var run=function(){
      var engine=slotEngine();
      if(!engine||typeof engine.spinTo!=='function'){scheduledDrawId='';return}
      setOfficialSpinActive(true);
      var started=false;
      try{started=engine.spinTo(code,function(){setOfficialSpinActive(false);setStaticCode(code);haptic('success');if(won)triggerWinnerEffect(drawId);scheduledDrawId=''})}catch(e){started=false}
      if(!started){setOfficialSpinActive(false);scheduledDrawId=''}
    };
    drawSpinTimer=setTimeout(run,Math.max(0,(Number(startAt)||liveServerNow())-liveServerNow()));
  }
  function applyDrawResult(){
    var draw=state&&state.lastDraw,drawId=draw&&String(draw.roundId||''),code=draw&&String(draw.winningCode||''),won=!!(state&&state.lastDrawWon);
    if(!drawId||!/^\\d{5}$/.test(code))return;
    var round=state&&state.round,sameClosedRound=!!(round&&round.status==='closed'&&String(round.id||'')===drawId),now=liveServerNow();
    var startAt=sameClosedRound?roundTime('drawStartsAt',DRAW_DELAY_MS):0;
    var engine=slotEngine(),duration=engine&&Number(engine.durationMs)>0?Number(engine.durationMs):DRAW_ANIMATION_MS;
    var animationEndsAt=startAt?startAt+duration:0;
    if(!drawInitialized){
      drawInitialized=true;lastDrawId=drawId;
      if(sameClosedRound&&animationEndsAt&&now<animationEndsAt)scheduleLiveDraw(drawId,code,won,Math.max(now,startAt));
      else{setStaticCode(code);if(won&&sameClosedRound)triggerWinnerEffect(drawId)}
      return;
    }
    if(drawId===lastDrawId)return;
    lastDrawId=drawId;
    if(sameClosedRound)scheduleLiveDraw(drawId,code,won,Math.max(now,startAt||now));
    else setStaticCode(code);
  }
  async function load(force){
    if(loading)return false;
    var now=Date.now();if(!force&&now-lastLoadAt<500)return false;
    var data=initData();
    if(!data){state={ticketCount:0,roundTicketCount:0,tickets:[],round:null,lastDraw:null,lastDrawWon:false,freeTicketAvailable:true,canBuy:false,reason:'Open in Telegram',prizes:[],settings:{ticketPriceNano:150000000,maxTicketsPerUser:0,drawIntervalMinutes:1440}};clearLifecycleTimer();render();return false}
    loading=true;lastLoadAt=now;
    var started=Date.now();
    try{
      var response=await fetch('/app/api/lottery/state',{cache:'no-store',headers:{'accept':'application/json','x-telegram-init-data':data}});
      var payload=await response.json().catch(function(){return null}),received=Date.now();
      if(!response.ok)throw new Error(payload&&payload.error||'Could not load Lottery');
      syncServerClock(payload,started,received);state=payload;render();applyDrawResult();
      var due=lifecycleDueTime();
      if(due&&due<=liveServerNow())lifecycleRetryMs=Math.min(5000,Math.max(800,Math.round(lifecycleRetryMs*1.7)));
      else lifecycleRetryMs=800;
      armLifecycle();
      return true;
    }catch(error){
      state={ticketCount:0,roundTicketCount:0,tickets:[],round:null,lastDraw:null,lastDrawWon:false,freeTicketAvailable:false,canBuy:false,reason:String(error&&error.message||'Lottery unavailable'),prizes:[],settings:{ticketPriceNano:150000000,maxTicketsPerUser:0,drawIntervalMinutes:1440}};render();
      lifecycleRetryMs=Math.min(15000,Math.max(1200,Math.round(lifecycleRetryMs*1.8)));
      if(q('#home.active')&&!document.hidden)scheduleLifecycleRefresh(lifecycleRetryMs);
      return false;
    }finally{loading=false}
  }
  async function buy(){
    if(busy||!state||!state.canBuy||!initData()||remainingLimit()<=0&&Number(state.settings&&state.settings.maxTicketsPerUser)>0)return;
    busy=true;render();
    try{
      var response=await fetch('/app/api/lottery/tickets',{method:'POST',headers:{'content-type':'application/json','accept':'application/json'},body:JSON.stringify({initData:initData(),quantity:quantity,purchaseId:purchaseId()})});
      var payload=await response.json().catch(function(){return null});
      if(!response.ok)throw new Error(payload&&payload.error||'Could not get ticket');
      if(window.VexaTonBalance&&typeof window.VexaTonBalance.write==='function'&&payload.gramBalanceNano!==undefined)window.VexaTonBalance.write(Number(payload.gramBalanceNano)||0,0);
      quantity=1;haptic('success');await load(true);
    }catch(error){
      haptic('error');var button=q('#homeTicketButton');if(button){button.textContent=String(error&&error.message||'Could not get ticket');setTimeout(render,1200)}
    }finally{busy=false;setTimeout(render,0)}
  }
  function handleTicketControls(event){
    var target=event.target&&event.target.closest?event.target.closest('#homeTicketButton,#home [data-ticket-plus],#home [data-ticket-minus]'):null;if(!target)return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
    if(target.id==='homeTicketButton'){buy();return}
    if(busy||!state||!state.canBuy||remainingLimit()<=0&&Number(state.settings&&state.settings.maxTicketsPerUser)>0)return;
    if(target.hasAttribute('data-ticket-plus'))quantity=Math.min(maxSelectable(),quantity+1);
    if(target.hasAttribute('data-ticket-minus'))quantity=Math.max(1,quantity-1);
    haptic('light');render();
  }
  function handleSmartRefresh(event){
    var target=event.target&&event.target.closest?event.target:null;if(!target)return;
    var homeLink=target.closest('[data-view="home"]'),bonus=target.closest('#homeBonusButton');
    if(homeLink)setTimeout(function(){if(q('#home.active')&&!busy)load(false)},60);
    else if(bonus)setTimeout(function(){if(q('#home.active')&&!busy)load(false)},0);
  }
  function startClock(){if(clockStarted)return;clockStarted=true;setInterval(updateCountdown,250)}
  function refreshWhenVisible(){if(!document.hidden&&q('#home.active')&&!busy)load(false)}
  function init(){renderClaimedTickets();document.addEventListener('click',handleTicketControls,true);document.addEventListener('click',handleSmartRefresh,true);load(true);startClock();window.VexaLotteryRefresh=function(){return load(true)}}
  window.addEventListener('focus',guardOfficialSpinFocus,true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('focus',refreshWhenVisible);
  document.addEventListener('visibilitychange',refreshWhenVisible);
})();
</script>
`;
