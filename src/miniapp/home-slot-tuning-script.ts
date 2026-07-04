export const HOME_SLOT_TUNING_SCRIPT = `
(function(){
  var busy=false,row=34,restLoop=28,spinLoops=34,spinWarmupMs=1250,totalStopMs=1650,reelStopGapMs=420;
  function q(s,r){return (r||document).querySelector(s)}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function clampDigit(v){return Math.max(0,Math.min(9,Math.floor(Number(v)||0)))}
  function y(i){return 'translate3d(0,-'+((i*row)+(row/2))+'px,0)'}
  function digits(){var h='';for(var c=0;c<120;c++)for(var n=0;n<10;n++)h+='<span class="home-slot-number-digit">'+n+'</span>';return h}
  function indexFor(v,loop){return loop*10+clampDigit(v)}
  function tune(){
    if(q('#homeSlotTuningStyle'))return;
    var st=document.createElement('style');st.id='homeSlotTuningStyle';
    st.textContent=[
      '@keyframes homeSlotReelRun{0%{transform:translate3d(0,-952px,0)}100%{transform:translate3d(0,-4352px,0)}}',
      '#home .home-slot-number-grid{perspective:520px!important}',
      '#home .home-slot-number-reel{margin:8px 10px!important;border-radius:13px!important;background:linear-gradient(180deg,rgba(0,0,0,.30),rgba(255,255,255,.035) 46%,rgba(0,0,0,.34))!important;box-shadow:inset 0 10px 18px rgba(0,0,0,.42),inset 0 -10px 18px rgba(0,0,0,.38),inset 0 0 0 1px rgba(255,255,255,.08)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;transform:translateZ(0)!important}',
      '#home .home-slot-number-reel:after{content:""!important;position:absolute!important;left:0!important;right:0!important;top:50%!important;height:34px!important;transform:translateY(-50%)!important;border-top:1px solid rgba(255,255,255,.10)!important;border-bottom:1px solid rgba(255,255,255,.10)!important;box-shadow:0 0 20px rgba(255,255,255,.045)!important;pointer-events:none!important}',
      '#home .home-slot-number-strip{position:absolute!important;left:0!important;right:0!important;top:50%!important;display:grid!important;grid-auto-rows:34px!important;will-change:transform!important;transform:translateZ(0)!important;backface-visibility:hidden!important}',
      '#home .home-slot-number-reel.is-spinning .home-slot-number-strip{animation:homeSlotReelRun .34s linear infinite!important;filter:blur(3.2px)!important}',
      '#home .home-slot-number-digit{height:34px!important;display:flex!important;align-items:center!important;justify-content:center!important;font-size:30px!important;line-height:1!important;font-weight:950!important;color:#fff!important;background:none!important;-webkit-background-clip:initial!important;background-clip:initial!important;text-shadow:0 1px 1px rgba(0,0,0,.68),0 8px 18px rgba(0,0,0,.58)!important;font-variant-numeric:tabular-nums!important}'
    ].join('');
    document.head.appendChild(st);
  }
  function prepare(){
    tune();
    qa('#home .home-slot-number-reel').forEach(function(reel){
      var strip=q('[data-slot-strip]',reel);if(!strip)return;
      if(strip.dataset.tuned!=='4'){strip.innerHTML=digits();strip.dataset.tuned='4'}
      var v=clampDigit(reel.getAttribute('data-slot-value')||'0');
      strip.style.setProperty('animation','none','important');strip.style.transition='none';strip.style.transform=y(indexFor(v,restLoop));strip.style.willChange='auto';
      reel.classList.remove('is-spinning');
    });
  }
  function spin(){
    if(busy)return;prepare();busy=true;
    var btn=q('#homeSlotSpinButton');if(btn)btn.classList.add('is-spinning');
    var reels=qa('#home .home-slot-number-reel');var pending=reels.length;if(!pending){busy=false;return}
    reels.forEach(function(reel,i){
      var strip=q('[data-slot-strip]',reel);if(!strip){pending--;return}
      var current=clampDigit(reel.getAttribute('data-slot-value')||'0');
      var final=Math.floor(Math.random()*10);var loops=spinLoops+i*3;var finalIndex=indexFor(final,restLoop+loops);
      reel.setAttribute('data-slot-value',String(final));
      strip.style.transition='none';strip.style.removeProperty('animation');strip.style.transform=y(indexFor(current,restLoop));strip.style.willChange='transform';
      reel.classList.add('is-spinning');
      setTimeout(function(){
        strip.style.setProperty('animation','none','important');
        strip.style.transition='transform '+(totalStopMs+i*140)+'ms cubic-bezier(.08,.72,.08,1)';
        strip.style.transform=y(finalIndex);
      },spinWarmupMs+(i*reelStopGapMs));
      setTimeout(function(){
        strip.style.transition='none';strip.style.transform=y(indexFor(final,restLoop));strip.style.willChange='auto';
        reel.classList.remove('is-spinning');pending--;
        if(pending<=0){if(btn)btn.classList.remove('is-spinning');busy=false}
      },spinWarmupMs+(i*reelStopGapMs)+totalStopMs+(i*140)+220);
    });
  }
  document.addEventListener('click',function(e){var t=e.target;if(t&&t.id==='homeSlotSpinButton'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();spin()}},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',prepare);else prepare();
  window.addEventListener('focus',prepare);
})();
`;
