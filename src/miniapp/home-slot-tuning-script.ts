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
      '#home .home-slot-number-digit{height:34px!important;display:flex!important;align-items:center!important;justify-content:center!important;font-size:30px!important;font-weight:950!important;color:#ffeaf0!important;background:none!important;-webkit-background-clip:initial!important;background-clip:initial!important;text-shadow:0 1px 1px rgba(0,0,0,.62),0 0 10px rgba(90,8,26,.32),0 8px 18px rgba(0,0,0,.55)!important}',
      '.home-ticket-drawer{background:rgba(13,13,13,.54)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.105),inset 0 -1px 0 rgba(255,255,255,.06),inset 0 0 22px rgba(255,255,255,.055),0 16px 36px rgba(0,0,0,.22)!important;backdrop-filter:blur(10px) saturate(1.12)!important;-webkit-backdrop-filter:blur(10px) saturate(1.12)!important}',
      '.home-ticket-drawer-count{height:44px!important;border-radius:18px!important;background:rgba(0,0,0,.22)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06),inset 0 -1px 0 rgba(255,255,255,.04)!important;color:#fff!important;font-weight:950!important}',
      '.home-ticket-list-item{height:44px!important;border-radius:18px!important;background:rgba(0,0,0,.22)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06),inset 0 -1px 0 rgba(255,255,255,.04)!important;color:#fff!important;font-weight:950!important}',
      '.home-confetti-button{height:34px!important;width:34px!important;min-width:34px!important;padding:0!important;border:0!important;border-radius:999px!important;background:rgba(255,255,255,.075)!important;color:#ffe7a8!important;font-size:14px!important;font-weight:950!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.09),inset 0 -1px 0 rgba(255,255,255,.055),0 14px 30px rgba(0,0,0,.24)!important;backdrop-filter:blur(10px) saturate(1.12)!important;-webkit-backdrop-filter:blur(10px) saturate(1.12)!important}',
      '.vexa-confetti-layer{position:fixed!important;inset:0!important;z-index:999999!important;pointer-events:none!important;overflow:hidden!important}',
      '.vexa-confetti-piece{position:absolute!important;top:-18px!important;border-radius:2px!important;opacity:.96!important;transform:translate3d(0,-24px,0) rotate(0deg);animation:vexaConfettiFall 3000ms cubic-bezier(.12,.52,.18,1) forwards!important;box-shadow:0 0 10px rgba(255,210,90,.18)!important}',
      '@keyframes vexaConfettiFall{0%{transform:translate3d(var(--sx),-24px,0) rotate(0deg);opacity:0}8%{opacity:1}100%{transform:translate3d(var(--ex),108vh,0) rotate(var(--rot));opacity:0}}'
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
    var colors=['#ffd36a','#f6b83f','#ffe7a8','#c68b2e','#fff2c7'];
    for(var i=0;i<90;i++){
      var p=document.createElement('i');p.className='vexa-confetti-piece';
      var x=Math.random()*100, drift=(Math.random()*34)-17, w=4+Math.random()*6, h=7+Math.random()*11;
      p.style.left=x+'vw';p.style.width=w+'px';p.style.height=h+'px';p.style.background=colors[i%colors.length];p.style.animationDelay=(Math.random()*260)+'ms';p.style.animationDuration=(2700+Math.random()*500)+'ms';p.style.setProperty('--sx','0px');p.style.setProperty('--ex',drift+'vw');p.style.setProperty('--rot',(360+Math.random()*900)+'deg');
      layer.appendChild(p);
    }
    setTimeout(function(){layer.remove()},3300);
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