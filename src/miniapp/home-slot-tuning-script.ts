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
      '.home-ticket-drawer-head{border-radius:28px!important;padding:14px!important;background:rgba(13,13,13,.54)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.105),inset 0 -1px 0 rgba(255,255,255,.06),inset 0 0 22px rgba(255,255,255,.055),0 16px 36px rgba(0,0,0,.22)!important;backdrop-filter:blur(10px) saturate(1.12)!important;-webkit-backdrop-filter:blur(10px) saturate(1.12)!important}',
      '.home-ticket-list-item{height:44px!important;border-radius:18px!important;background:rgba(0,0,0,.22)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06),inset 0 -1px 0 rgba(255,255,255,.04)!important;color:#fff!important;font-weight:950!important}'
    ].join('');
    document.head.appendChild(st);
  }
  function prepare(){
    tune();
    qa('#home .home-slot-number-reel').forEach(function(reel){
      var strip=q('[data-slot-strip]',reel);if(!strip)return;
      if(strip.dataset.tuned!=='3'){strip.innerHTML=digits();strip.dataset.tuned='3'}
      var v=Math.max(0,Math.min(9,Math.floor(Number(reel.getAttribute('data-slot-value')||'0'))));
      strip.style.setProperty('transition','none','important');strip.style.transform=y(indexFor(v,restLoop));strip.style.willChange='auto';
    });
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
  document.addEventListener('click',function(e){var t=e.target;if(t&&t.id==='homeSlotSpinButton'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();spin()}},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',prepare);else prepare();
  window.addEventListener('focus',prepare);
})();
`;