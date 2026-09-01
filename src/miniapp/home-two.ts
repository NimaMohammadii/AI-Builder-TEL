export const HOME_TWO_SECTION = `<section id="home" class="view active" data-home-variant="two">
  <div class="home-draw-info-card home-two-reel-card" id="homeDrawInfoCard" aria-label="Prize reel">
    <div class="home-two-reel-window" id="homeTwoReelWindow">
      <div class="home-two-reel-marker" id="homeTwoReelMarker" aria-hidden="true"></div>
      <div class="home-two-reel-track" id="homeTwoPrizeTrack" aria-live="polite"></div>
    </div>
    <button class="home-two-spin" id="homeTwoSpinButton" type="button">SPIN</button>
  </div>
  <img class="home-two-top-image" src="/app/api/home-two-top-image" alt="" decoding="async" onerror="this.hidden=true">
  <style>
    #home[data-home-variant="two"]{padding-top:0;overflow-x:hidden}
    #home[data-home-variant="two"] #homeDrawInfoCard.home-draw-info-card.home-two-reel-card{height:184px!important;min-height:184px!important;margin:0 0 12px!important;border-radius:28px!important;padding:10px!important;display:grid!important;grid-template-rows:minmax(0,1fr) 40px!important;align-items:stretch!important;gap:9px!important;box-sizing:border-box!important;overflow:hidden!important;box-shadow:0 12px 30px rgba(31,1,10,.28),0 0 14px rgba(69,5,26,.10),inset 3px 3px .5px -3.5px rgba(255,255,255,.025),inset -3px -3px .5px -3.5px rgba(156,38,70,.28),inset 1px 1px 1px -.5px rgba(140,29,61,.16),inset -1px -1px 1px -.5px rgba(124,22,53,.13),inset 0 0 5px 5px rgba(255,255,255,.014),inset 0 0 2px 2px rgba(255,255,255,.010)!important}
    #home[data-home-variant="two"] #homeDrawInfoCard.home-draw-info-card.home-two-reel-card:before{background:radial-gradient(34px 34px at 0 0,rgba(186,53,87,.13) 0%,rgba(146,35,66,.05) 42%,rgba(104,18,44,0) 76%),radial-gradient(36px 36px at 100% 100%,rgba(172,46,79,.12) 0%,rgba(133,30,60,.05) 43%,rgba(94,16,39,0) 78%),radial-gradient(118% 76% at 10% -16%,rgba(255,255,255,.045) 0%,rgba(255,255,255,.012) 30%,rgba(255,255,255,0) 58%),radial-gradient(96% 72% at 102% 108%,rgba(255,255,255,.018) 0%,rgba(255,255,255,.004) 34%,rgba(255,255,255,0) 62%),radial-gradient(92% 78% at 88% 112%,rgba(72,5,27,.09) 0%,rgba(42,3,16,0) 60%)!important;box-shadow:inset 0 1px 0 rgba(112,18,49,.045),inset 0 -1px 0 rgba(88,12,37,.10)!important}
    #home[data-home-variant="two"] .home-two-reel-window{position:relative!important;min-width:0!important;height:115px!important;border-radius:22px!important;overflow:hidden!important;background:linear-gradient(180deg,rgba(0,0,0,.72),rgba(7,7,7,.92))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.045),inset 0 -1px 0 rgba(255,255,255,.020),inset 0 0 22px rgba(55,4,20,.30)!important;isolation:isolate!important}
    #home[data-home-variant="two"] .home-two-reel-window:before,#home[data-home-variant="two"] .home-two-reel-window:after{content:''!important;position:absolute!important;top:0!important;bottom:0!important;width:42px!important;z-index:4!important;pointer-events:none!important}
    #home[data-home-variant="two"] .home-two-reel-window:before{left:0!important;background:linear-gradient(90deg,rgba(5,5,5,.98),rgba(5,5,5,.55) 48%,rgba(5,5,5,0))!important}
    #home[data-home-variant="two"] .home-two-reel-window:after{right:0!important;background:linear-gradient(270deg,rgba(5,5,5,.98),rgba(5,5,5,.55) 48%,rgba(5,5,5,0))!important}
    #home[data-home-variant="two"] .home-two-reel-marker{position:absolute!important;left:50%!important;top:7px!important;bottom:7px!important;width:5px!important;z-index:7!important;transform:translateX(-50%)!important;pointer-events:none!important;border-radius:999px!important;background:linear-gradient(90deg,#141414 0%,#5d5d5d 22%,#c8c8c8 44%,#f2f2f2 52%,#777 68%,#181818 100%)!important;box-shadow:0 1px 2px rgba(0,0,0,.86),0 0 0 1px rgba(0,0,0,.52),inset 1px 0 0 rgba(255,255,255,.24),inset -1px 0 0 rgba(0,0,0,.58)!important}
    #home[data-home-variant="two"] .home-two-reel-marker:before{content:''!important;position:absolute!important;left:50%!important;top:-7px!important;width:18px!important;height:13px!important;transform:translateX(-50%)!important;border-radius:5px 5px 7px 7px!important;clip-path:polygon(0 0,100% 0,74% 62%,58% 100%,42% 100%,26% 62%)!important;background:linear-gradient(180deg,#e0e0e0 0%,#9b9b9b 22%,#454545 56%,#171717 100%)!important;box-shadow:0 2px 4px rgba(0,0,0,.64),inset 0 1px 0 rgba(255,255,255,.42)!important}
    #home[data-home-variant="two"] .home-two-reel-marker:after{content:''!important;position:absolute!important;left:50%!important;bottom:3px!important;width:5px!important;height:5px!important;border-radius:50%!important;transform:translateX(-50%)!important;background:radial-gradient(circle at 35% 30%,#ededed 0%,#8d8d8d 34%,#2a2a2a 72%,#111 100%)!important;box-shadow:0 1px 1px rgba(0,0,0,.72)!important}
    #home[data-home-variant="two"] .home-two-reel-marker.is-hit:before{animation:homeTwoMarkerHit .20s cubic-bezier(.18,.88,.24,1)!important}
    @keyframes homeTwoMarkerHit{0%{transform:translateX(-50%) translateY(0) scale(1)}42%{transform:translateX(-50%) translateY(2px) scale(.94)}100%{transform:translateX(-50%) translateY(0) scale(1)}}
    #home[data-home-variant="two"] .home-two-reel-track{position:absolute!important;left:0!important;top:0!important;height:100%!important;display:flex!important;align-items:center!important;gap:8px!important;width:max-content!important;padding:0 8px!important;box-sizing:border-box!important;will-change:transform!important;transform:translate3d(0,0,0)}
    #home[data-home-variant="two"] .home-two-prize{position:relative!important;width:76px!important;height:91px!important;flex:0 0 76px!important;border-radius:18px!important;border:1px solid rgba(124,22,53,.24)!important;background:radial-gradient(36px 36px at 8% 8%,rgba(186,53,87,.17),rgba(146,35,66,.055) 46%,rgba(0,0,0,0) 76%),radial-gradient(40px 40px at 92% 100%,rgba(122,24,52,.18),rgba(69,5,26,.05) 52%,rgba(0,0,0,0) 80%),linear-gradient(180deg,#0b0b0b 0%,#050505 100%)!important;box-shadow:inset 3px 3px .5px -3.5px rgba(255,255,255,.065),inset -3px -3px .5px -3.5px rgba(156,38,70,.34),inset 5px 4px 12px -8px rgba(255,255,255,.055),0 8px 18px rgba(0,0,0,.30)!important;display:grid!important;grid-template-rows:48px 17px 12px!important;align-content:center!important;justify-items:center!important;gap:1px!important;overflow:hidden!important;transform:translateZ(0) scale(1)!important;transition:transform .34s cubic-bezier(.18,.88,.24,1),box-shadow .34s ease,filter .24s ease,opacity .24s ease!important}
    #home[data-home-variant="two"] .home-two-prize:before{content:''!important;position:absolute!important;left:8px!important;right:8px!important;top:0!important;height:1px!important;background:linear-gradient(90deg,transparent,rgba(255,255,255,.09),transparent)!important;pointer-events:none!important}
    #home[data-home-variant="two"] .home-two-prize-icon{width:43px!important;height:43px!important;display:grid!important;place-items:center!important;filter:drop-shadow(0 7px 10px rgba(0,0,0,.40))!important}
    #home[data-home-variant="two"] .home-two-prize-icon img{width:39px!important;height:39px!important;display:block!important;object-fit:contain!important}
    #home[data-home-variant="two"] .home-two-ticket-icon{position:relative!important;width:40px!important;height:29px!important;border-radius:7px!important;background:linear-gradient(145deg,#c75878,#6e142f)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.30),inset 0 -1px 0 rgba(36,0,10,.44),0 6px 12px rgba(0,0,0,.34)!important;transform:rotate(-6deg)!important}
    #home[data-home-variant="two"] .home-two-ticket-icon:before,#home[data-home-variant="two"] .home-two-ticket-icon:after{content:''!important;position:absolute!important;top:50%!important;width:8px!important;height:8px!important;border-radius:50%!important;background:#080808!important;transform:translateY(-50%)!important}
    #home[data-home-variant="two"] .home-two-ticket-icon:before{left:-4px!important}#home[data-home-variant="two"] .home-two-ticket-icon:after{right:-4px!important}
    #home[data-home-variant="two"] .home-two-ticket-icon i{position:absolute!important;left:50%!important;top:5px!important;bottom:5px!important;border-left:1px dashed rgba(255,255,255,.35)!important}
    #home[data-home-variant="two"] .home-two-prize strong{font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter","Segoe UI",sans-serif!important;color:#fff!important;font-size:15px!important;line-height:17px!important;font-weight:950!important;letter-spacing:-.035em!important;font-variant-numeric:tabular-nums!important;text-shadow:0 1px 0 rgba(255,255,255,.10),0 3px 8px rgba(0,0,0,.52)!important}
    #home[data-home-variant="two"] .home-two-prize small{color:rgba(255,255,255,.48)!important;font-size:8.5px!important;line-height:10px!important;font-weight:900!important;letter-spacing:.08em!important;text-transform:uppercase!important}
    #home[data-home-variant="two"] .home-two-reel-card.is-spinning .home-two-prize{opacity:.96!important;transform:translateZ(0) scale(.985)!important}
    #home[data-home-variant="two"] .home-two-prize.is-winner{z-index:3!important;transform:translateZ(0) scale(1.05)!important;border-color:rgba(255,255,255,.13)!important;filter:brightness(1.065) saturate(1.02)!important;box-shadow:inset 2px 2px .5px -3.5px rgba(255,255,255,.10),inset -2px -2px .5px -3.5px rgba(156,38,70,.28),0 9px 18px rgba(0,0,0,.34)!important;animation:homeTwoWinner .72s cubic-bezier(.18,.88,.24,1) both!important}
    @keyframes homeTwoWinner{0%{transform:scale(1)}45%{transform:scale(1.075)}72%{transform:scale(1.035)}100%{transform:scale(1.05)}}
    #home[data-home-variant="two"] .home-two-spin{position:relative!important;overflow:hidden!important;width:100%!important;height:40px!important;padding:0 14px!important;border:0!important;border-radius:28px!important;background:#000!important;background-image:none!important;color:#fff!important;font-size:12px!important;font-weight:950!important;letter-spacing:.08em!important;box-shadow:0 8px 18px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.045),inset 0 -1px 0 rgba(255,255,255,.018)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;transform:translate3d(0,0,0)!important;transform-origin:center!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important;transition:transform .24s cubic-bezier(.18,.88,.24,1),filter .18s ease,box-shadow .18s ease,opacity .28s ease!important}
    #home[data-home-variant="two"] .home-two-spin:disabled{opacity:.68!important}
    #home[data-home-variant="two"] .home-two-spin:active,#home[data-home-variant="two"] .home-two-spin.is-pressed{transform:translate3d(0,2px,0) scale(.95)!important;filter:brightness(.88)!important;box-shadow:0 3px 9px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.025)!important;transition-duration:.08s!important}
    #home[data-home-variant="two"] .home-two-top-image{display:block;width:calc(100% + 24px);max-width:none;height:auto;margin-left:-12px;object-fit:contain}
  </style>
  <script>
  (function(){
    var rewards=[
      {kind:'gram',amount:'1',label:'GRAM'},
      {kind:'ticket',amount:'10',label:'TICKETS'},
      {kind:'gram',amount:'2',label:'GRAM'},
      {kind:'ticket',amount:'25',label:'TICKETS'},
      {kind:'gram',amount:'5',label:'GRAM'},
      {kind:'ticket',amount:'50',label:'TICKETS'},
      {kind:'ticket',amount:'100',label:'TICKETS'}
    ];
    var card,win,track,button,marker,busy=false,target=null,currentX=0,rafId=0,currentIndex=6,lastTick=-1,spinAudioCtx=null;
    function q(s){return document.querySelector(s)}
    function randomInt(max){
      if(window.crypto&&window.crypto.getRandomValues){var a=new Uint32Array(1);window.crypto.getRandomValues(a);return a[0]%max}
      return Math.floor(Math.random()*max)
    }
    function liveGramIcon(){
      var img=q('.top-balance-pill .ton-mini-icon img');
      return img&&img.currentSrc?img.currentSrc:(img&&img.getAttribute('src')||'')
    }
    function iconHtml(kind){
      if(kind==='gram')return '<span class="home-two-prize-icon"><img data-home-two-gram-icon alt="" decoding="async"></span>';
      return '<span class="home-two-prize-icon"><span class="home-two-ticket-icon" aria-hidden="true"><i></i></span></span>'
    }
    function prizeHtml(p){return '<div class="home-two-prize" data-reward-kind="'+p.kind+'" data-reward-amount="'+p.amount+'" data-reward-label="'+p.label+'">'+iconHtml(p.kind)+'<strong>'+p.amount+'</strong><small>'+p.label+'</small></div>'}
    function syncGramIcons(){
      var src=liveGramIcon();
      if(!src)return;
      Array.prototype.forEach.call(track.querySelectorAll('[data-home-two-gram-icon]'),function(img){if(img.getAttribute('src')!==src)img.setAttribute('src',src)})
    }
    function centerX(el){return (win.clientWidth/2)-(el.offsetLeft+(el.offsetWidth/2))}
    function setX(x){currentX=x;track.style.transform='translate3d('+x.toFixed(3)+'px,0,0)'}
    function haptic(kind){
      try{
        var h=window.Telegram&&window.Telegram.WebApp&&window.Telegram.WebApp.HapticFeedback;
        if(!h)return;
        if(kind==='start'&&h.impactOccurred)h.impactOccurred('light');
        if(kind==='tick'&&h.selectionChanged)h.selectionChanged();
        if(kind==='win'&&h.notificationOccurred)h.notificationOccurred('success')
      }catch(e){}
    }
    function spinAudio(){
      try{
        var Ctor=window.AudioContext||window.webkitAudioContext;if(!Ctor)return null;
        if(!spinAudioCtx)spinAudioCtx=new Ctor({latencyHint:'interactive'});
        if(spinAudioCtx.state==='suspended')spinAudioCtx.resume().catch(function(){});
        return spinAudioCtx
      }catch(e){return null}
    }
    function spinClickSound(){
      var ctx=spinAudio();if(!ctx)return;
      try{
        var start=ctx.currentTime,end=start+.06,osc=ctx.createOscillator(),gain=ctx.createGain();
        osc.type='triangle';osc.frequency.setValueAtTime(190,start);osc.frequency.exponentialRampToValueAtTime(92,end);
        gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.045,start+.004);gain.gain.exponentialRampToValueAtTime(.0001,end);
        osc.connect(gain);gain.connect(ctx.destination);osc.start(start);osc.stop(end+.012)
      }catch(e){}
    }
    function buttonPress(){
      if(!button)return;
      button.classList.remove('is-pressed');void button.offsetWidth;button.classList.add('is-pressed');
      window.setTimeout(function(){if(button)button.classList.remove('is-pressed')},130)
    }
    function markerHit(){
      if(!marker||marker.classList.contains('is-hit'))return;
      marker.classList.add('is-hit');
      window.setTimeout(function(){if(marker)marker.classList.remove('is-hit')},220)
    }
    function appendRewards(count){
      var html='';
      for(var i=0;i<count;i++)html+=prizeHtml(rewards[randomInt(rewards.length)]);
      track.insertAdjacentHTML('beforeend',html);
      syncGramIcons()
    }
    function clearWinner(){
      Array.prototype.forEach.call(track.querySelectorAll('.is-winner'),function(el){el.classList.remove('is-winner')})
    }
    function buildInitial(){
      if(rafId){cancelAnimationFrame(rafId);rafId=0}
      track.innerHTML='';
      appendRewards(48);
      currentIndex=6;
      target=track.children[currentIndex];
      setX(centerX(target));
      lastTick=-1
    }
    function ensureAhead(count){
      while(track.children.length<=currentIndex+count)appendRewards(24)
    }
    function pruneBehind(){
      var remove=Math.max(0,currentIndex-5);
      if(!remove)return;
      for(var i=0;i<remove;i++)track.removeChild(track.firstElementChild);
      currentIndex-=remove;
      if(target)setX(centerX(target))
    }
    function finish(targetIndex){
      if(!busy)return;
      busy=false;
      rafId=0;
      currentIndex=targetIndex;
      card.classList.remove('is-spinning');
      button.disabled=false;
      button.textContent='SPIN';
      if(target){
        setX(centerX(target));
        target.classList.add('is-winner')
      }
      pruneBehind();
      markerHit();
      haptic('win')
    }
    function spin(){
      if(busy)return;
      buttonPress();
      spinClickSound();
      clearWinner();
      ensureAhead(58);
      var advance=42+randomInt(10),targetIndex=currentIndex+advance;
      target=track.children[targetIndex];
      if(!target)return;
      var startX=currentX,endX=centerX(target),direction=endX<startX?-1:1;
      var velocity=90,maxSpeed=1220,acceleration=2200,deceleration=520,lastTime=0;
      busy=true;
      lastTick=0;
      card.classList.add('is-spinning');
      button.disabled=true;
      button.textContent='SPINNING';
      haptic('start');
      function frame(now){
        if(!busy)return;
        if(!lastTime){lastTime=now;rafId=requestAnimationFrame(frame);return}
        var dt=Math.max(.001,Math.min(.032,(now-lastTime)/1000));
        lastTime=now;
        var remaining=Math.abs(endX-currentX);
        if(remaining<=.45){setX(endX);finish(targetIndex);return}
        var brakingSpeed=Math.sqrt(Math.max(0,2*deceleration*remaining));
        velocity=Math.min(maxSpeed,velocity+(acceleration*dt),brakingSpeed);
        var step=Math.min(remaining,velocity*dt);
        setX(currentX+(direction*step));
        var passed=Math.floor(Math.abs(currentX-startX)/84);
        if(passed!==lastTick){
          lastTick=passed;
          if(velocity<720){markerHit();haptic('tick')}
        }
        rafId=requestAnimationFrame(frame)
      }
      rafId=requestAnimationFrame(frame)
    }
    function init(){
      card=q('#home[data-home-variant="two"] .home-two-reel-card');
      win=q('#homeTwoReelWindow');
      track=q('#homeTwoPrizeTrack');
      button=q('#homeTwoSpinButton');
      marker=q('#homeTwoReelMarker');
      if(!card||!win||!track||!button)return;
      buildInitial();
      button.addEventListener('click',spin);
      window.addEventListener('resize',function(){if(!busy&&target)setX(centerX(target))},{passive:true})
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init()
  })();
  </script>
</section>`;
