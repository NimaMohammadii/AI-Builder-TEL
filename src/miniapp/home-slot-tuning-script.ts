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
      '#home .home-slot-number-reel{margin:5px 13px 6px!important;border-radius:11px!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;mask-image:linear-gradient(180deg,rgba(0,0,0,.34) 0%,#000 36%,#000 64%,rgba(0,0,0,.34) 100%)!important;-webkit-mask-image:linear-gradient(180deg,rgba(0,0,0,.34) 0%,#000 36%,#000 64%,rgba(0,0,0,.34) 100%)!important}',
      '#home .home-slot-number-reel:first-child{transform:translateX(1px)!important}',
      '#home .home-slot-number-reel:nth-child(2){transform:translateX(0px)!important}',
      '#home .home-slot-number-reel:nth-child(4){transform:translateX(-2px)!important}',
      '#home .home-slot-number-reel:last-child{transform:translateX(-3px)!important}',
      '#home .home-slot-number-strip{position:absolute!important;left:0!important;right:0!important;top:49%!important;display:grid!important;grid-auto-rows:34px!important;will-change:transform!important;transition:none!important}',
      '#home .home-slot-number-reel.is-spinning .home-slot-number-strip{filter:blur(2px)!important}',
      '#home .home-slot-number-digit{height:34px!important;display:flex!important;align-items:center!important;justify-content:center!important;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter","Segoe UI",sans-serif!important;font-size:31px!important;font-weight:900!important;letter-spacing:-.045em!important;color:transparent!important;background:linear-gradient(180deg,#fff2f4 0%,#d48994 18%,#7f182b 46%,#3b0711 72%,#b94a5d 100%)!important;-webkit-background-clip:text!important;background-clip:text!important;-webkit-text-stroke:.35px rgba(255,205,215,.34)!important;text-shadow:0 1px 0 rgba(255,210,218,.22),0 2px 2px rgba(0,0,0,.74),0 0 12px rgba(115,10,30,.34),0 10px 20px rgba(0,0,0,.64)!important;filter:drop-shadow(0 0 7px rgba(110,7,25,.22))!important}',
      '.home-ticket-drawer{background:rgba(13,13,13,.54)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.105),inset 0 -1px 0 rgba(255,255,255,.06),inset 0 0 22px rgba(255,255,255,.055),0 16px 36px rgba(0,0,0,.22)!important;backdrop-filter:blur(10px) saturate(1.12)!important;-webkit-backdrop-filter:blur(10px) saturate(1.12)!important}',
      '.home-ticket-drawer-count{height:44px!important;border-radius:18px!important;background:rgba(0,0,0,.22)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06),inset 0 -1px 0 rgba(255,255,255,.04)!important;color:#fff!important;font-weight:950!important}',
      '.home-ticket-list-item{height:44px!important;border-radius:18px!important;background:rgba(0,0,0,.22)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06),inset 0 -1px 0 rgba(255,255,255,.04)!important;color:#fff!important;font-weight:950!important}',
      '.home-confetti-button{height:34px!important;width:34px!important;min-width:34px!important;padding:0!important;border:0!important;border-radius:999px!important;background:rgba(255,255,255,.075)!important;color:#ffe7a8!important;font-size:14px!important;font-weight:950!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.09),inset 0 -1px 0 rgba(255,255,255,.055),0 14px 30px rgba(0,0,0,.24)!important;backdrop-filter:blur(10px) saturate(1.12)!important;-webkit-backdrop-filter:blur(10px) saturate(1.12)!important}',
      '.vexa-confetti-layer{position:fixed!important;inset:0!important;z-index:999999!important;pointer-events:none!important;overflow:hidden!important;opacity:1!important;transition:opacity 420ms ease!important}',
      '.vexa-confetti-layer.is-ending{opacity:0!important}',
      '.vexa-confetti-piece{position:absolute!important;top:var(--y)!important;left:var(--x)!important;width:var(--w)!important;height:var(--h)!important;border-radius:var(--r)!important;background:var(--c)!important;opacity:.94;transform-origin:center!important;animation:vexaConfettiFall 6000ms linear 0ms forwards!important;box-shadow:0 0 9px rgba(255,210,90,.18)!important}',
      '@keyframes vexaConfettiFall{0%{transform:translate3d(0,-42px,0) rotate(0deg)}78%{transform:translate3d(var(--ex),172vh,0) rotate(var(--r3))}100%{transform:translate3d(var(--ex),230vh,0) rotate(var(--r3))}}'
    ].join('');
    document.head.appendChild(st);
  }
  function ensureConfettiButton(){var spin=q('#homeSlotSpinButton');if(!spin||q('#homeConfettiButton'))return;var b=document.createElement('button');b.id='homeConfettiButton';b.className='home-confetti-button';b.type='button';b.textContent='✦';spin.parentNode.insertBefore(b,spin.nextSibling)}
  function prepare(){
    tune();ensureConfettiButton();
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
  function spin(){
    if(busy)return;prepare();busy=true;
    var btn=q('#homeSlotSpinButton');if(btn)btn.classList.add('is-spinning');
    var reels=qa('#home .home-slot-number-reel');var pending=reels.length;
    reels.forEach(function(reel,i){
      var strip=q('[data-slot-strip]',reel);if(!strip){pending--;return}
      var current=Math.max(0,Math.min(9,Math.floor(Number(reel.getAttribute('data-slot-value')||'0'))));
      var final=Math.floor(Math.random()*10);var loops=spinLoops+i*2;var finalIndex=indexFor(final,restLoop+loops);
      reel.setAttribute('data-slot-value',String(final));
      strip.style.setProperty('transition','none','important');strip.style.transform=y(indexFor(current,restLoop));strip.style.willChange='transform';reel.classList.add('is-spinning');
      setTimeout(function(){strip.style.setProperty('transition','transform '+(totalSpinMs+i*reelStopGapMs)+'ms linear','important');strip.style.transform=y(finalIndex)},30+i*60);
      setTimeout(function(){strip.style.setProperty('transition','none','important');strip.style.transform=y(indexFor(final,restLoop));strip.style.willChange='auto';reel.classList.remove('is-spinning');pending--;if(pending<=0){if(btn)btn.classList.remove('is-spinning');busy=false}},totalSpinMs+i*reelStopGapMs+260);
    });
  }
  document.addEventListener('click',function(e){var t=e.target;if(t&&t.id==='homeSlotSpinButton'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();spin()}if(t&&t.id==='homeConfettiButton'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();confetti()}},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',prepare);else prepare();
  window.addEventListener('focus',prepare);
})();
`;