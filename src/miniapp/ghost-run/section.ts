export const GHOST_RUN_SECTION = `
<section id="ghostrun" class="view ghost-run-view" aria-label="Ghost Run">
  <style>
    #ghostrun{width:100vw!important;width:100dvw!important;max-width:100vw!important;max-width:100dvw!important;margin-left:calc(50% - 50vw)!important;margin-right:calc(50% - 50vw)!important}
    #ghostrun .ghost-run-screen{width:100vw!important;width:100dvw!important;max-width:100vw!important;max-width:100dvw!important}
    #ghostrun .ghost-run-scene{width:100vw!important;width:100dvw!important;max-width:100vw!important;max-width:100dvw!important;margin-left:0!important;margin-right:0!important;border-radius:0!important;box-shadow:none!important;background:#030206!important}
    #ghostrun .ghost-run-controls{margin-top:-1px!important}
    #ghostrun .ghost-run-shadow-fade{bottom:-28px!important;height:72px!important;background:linear-gradient(180deg,transparent 0%,rgba(12,2,6,.46) 52%,rgba(0,0,0,.88) 100%)!important}
    #ghostrun .ghost-run-moon,#ghostrun .ghost-run-ground,#ghostrun .ghost-run-uploaded-trees,#ghostrun .ghost-run-uploaded-houses{display:none!important;visibility:hidden!important}
    #ghostrun .ghost-run-background-strip{position:absolute!important;left:0!important;top:0!important;bottom:0!important;width:700vw!important;width:700dvw!important;height:100%!important;z-index:1!important;display:flex!important;pointer-events:none!important;transform:translate3d(var(--ghost-bg-x,0px),0,0)!important;will-change:transform!important}
    #ghostrun .ghost-run-background-panel{flex:0 0 100vw!important;flex-basis:100dvw!important;width:100vw!important;width:100dvw!important;height:100%!important;background-repeat:no-repeat!important;background-size:cover!important;background-position:center center!important}
    #ghostrun .ghost-run-background-panel-1{background-image:url('/app/api/ghost-run-asset/background.png')!important}
    #ghostrun .ghost-run-background-panel-2{background-image:url('/app/api/ghost-run-asset/background2.png')!important}
    #ghostrun .ghost-run-background-panel-3{background-image:url('/app/api/ghost-run-asset/background3.png')!important}
    #ghostrun .ghost-run-background-panel-4{background-image:url('/app/api/ghost-run-asset/background4.png')!important}
    #ghostrun .ghost-run-background-panel-5{background-image:url('/app/api/ghost-run-asset/background5.png')!important}
    #ghostrun .ghost-run-background-panel-6{background-image:url('/app/api/ghost-run-asset/background6.png')!important}
    #ghostrun .ghost-run-background-panel-copy{background-image:url('/app/api/ghost-run-asset/background.png')!important}
    #ghostrun .ghost-run-ghost{left:var(--ghost-x,16%)!important;width:64px!important;height:76px!important;bottom:76px!important;transition:left .08s linear, transform .08s linear!important}
    #ghostrun .ghost-run-move-button{height:62px!important;border-radius:999px!important;border:1px solid rgba(255,255,255,.16)!important;background:rgba(255,255,255,.025)!important;color:transparent!important;font-size:0!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),inset 0 -1px 0 rgba(255,255,255,.035),0 16px 34px rgba(0,0,0,.24)!important;backdrop-filter:blur(16px) saturate(1.25)!important;-webkit-backdrop-filter:blur(16px) saturate(1.25)!important;position:relative!important;overflow:hidden!important;touch-action:none!important;user-select:none!important;-webkit-user-select:none!important}
    #ghostrun .ghost-run-move-button:before{content:''!important;position:absolute!important;left:50%!important;top:50%!important;width:24px!important;height:24px!important;border-top:3px solid rgba(255,255,255,.92)!important;border-left:3px solid rgba(255,255,255,.92)!important;filter:drop-shadow(0 0 10px rgba(255,255,255,.22))!important}
    #ghostrun .ghost-run-move-button:after{content:''!important;position:absolute!important;left:50%!important;top:50%!important;width:42px!important;height:42px!important;border-radius:999px!important;border:1px solid rgba(255,255,255,.10)!important;transform:translate(-50%,-50%)!important}
    #ghostrun .ghost-run-back-button{grid-column:1!important}
    #ghostrun .ghost-run-forward-button{grid-column:2!important}
    #ghostrun .ghost-run-back-button:before{transform:translate(-34%,-50%) rotate(-45deg)!important}
    #ghostrun .ghost-run-forward-button:before{transform:translate(-66%,-50%) rotate(135deg)!important}
    #ghostrun .ghost-run-move-button:active,#ghostrun .ghost-run-move-button[data-holding='1']{background:rgba(255,255,255,.055)!important;transform:scale(.985)!important}
    #ghostrun .ghost-run-move-button:disabled{opacity:.28!important}
    @media(max-width:380px){#ghostrun .ghost-run-scene{border-radius:0!important}#ghostrun .ghost-run-ghost{width:58px!important;height:70px!important;bottom:72px!important}}
  </style>
  <div class="ghost-run-screen" data-ghost-state="idle">
    <div class="ghost-run-scene" aria-label="Ghost Run 2D forest scene">
      <div class="ghost-run-sky"></div>
      <div class="ghost-run-background-strip" aria-hidden="true">
        <div class="ghost-run-background-panel ghost-run-background-panel-1"></div>
        <div class="ghost-run-background-panel ghost-run-background-panel-2"></div>
        <div class="ghost-run-background-panel ghost-run-background-panel-3"></div>
        <div class="ghost-run-background-panel ghost-run-background-panel-4"></div>
        <div class="ghost-run-background-panel ghost-run-background-panel-5"></div>
        <div class="ghost-run-background-panel ghost-run-background-panel-6"></div>
        <div class="ghost-run-background-panel ghost-run-background-panel-copy"></div>
      </div>
      <div class="ghost-run-moon"></div>
      <div class="ghost-run-stars"></div>
      <div class="ghost-run-layer ghost-run-layer-far"></div>
      <div class="ghost-run-layer ghost-run-layer-mid"></div>
      <div class="ghost-run-layer ghost-run-near-realism"></div>
      <div class="ghost-run-layer ghost-run-layer-near"></div>
      <div class="ghost-run-uploaded-trees ghost-run-uploaded-tree-1"></div>
      <div class="ghost-run-uploaded-trees ghost-run-uploaded-tree-2"></div>
      <div class="ghost-run-uploaded-trees ghost-run-uploaded-tree-3"></div>
      <div class="ghost-run-uploaded-houses ghost-run-uploaded-house-1"></div>
      <div class="ghost-run-uploaded-houses ghost-run-uploaded-house-2"></div>
      <div class="ghost-run-uploaded-houses ghost-run-uploaded-house-3"></div>
      <div class="ghost-run-rock ghost-run-rock-a"></div>
      <div class="ghost-run-rock ghost-run-rock-b"></div>
      <div class="ghost-run-plant ghost-run-plant-a"><i></i><i></i><i></i></div>
      <div class="ghost-run-plant ghost-run-plant-b"><i></i><i></i><i></i></div>
      <div class="ghost-run-mushroom ghost-run-mushroom-a"></div>
      <div class="ghost-run-ground"></div>
      <div class="ghost-run-fog ghost-run-fog-a"></div>
      <div class="ghost-run-fog ghost-run-fog-b"></div>
      <div class="ghost-run-hud">
        <strong class="ghost-run-multiplier" data-ghost-multiplier>1.00x</strong>
        <span class="ghost-run-state" data-ghost-message></span>
      </div>
      <div class="ghost-run-ghost" aria-hidden="true">
        <span class="ghost-run-ghost-body">
          <i class="ghost-run-eye ghost-run-eye-left"></i>
          <i class="ghost-run-eye ghost-run-eye-right"></i>
          <b></b><b></b><b></b>
        </span>
        <span class="ghost-run-ghost-glow"></span>
      </div>
      <div class="ghost-run-danger ghost-run-danger-a"></div>
      <div class="ghost-run-danger ghost-run-danger-b"></div>
      <div class="ghost-run-shadow-fade"></div>
    </div>

    <div class="ghost-run-controls" aria-label="Ghost Run controls">
      <div class="ghost-run-control-card ghost-run-bet-card">
        <span>Bet Amount</span>
        <strong><em data-ghost-bet>0.10</em> TON</strong>
      </div>
      <div class="ghost-run-control-card ghost-run-win-card">
        <span>Win Preview</span>
        <strong><em data-ghost-preview>0.10</em> TON</strong>
      </div>
      <button class="ghost-run-move-button ghost-run-back-button" type="button" aria-label="Move back" data-ghost-back></button>
      <button class="ghost-run-move-button ghost-run-forward-button" type="button" aria-label="Move forward" data-ghost-forward></button>
      <p class="ghost-run-note">Hold to move. The scene moves only near the edges.</p>
    </div>
  </div>
  <script>
  (function(){
    var root=document.currentScript&&document.currentScript.closest('#ghostrun');
    if(!root||root.dataset.ghostReady==='1')return;
    root.dataset.ghostReady='1';
    var screen=root.querySelector('.ghost-run-screen');
    var forwardButton=root.querySelector('[data-ghost-forward]');
    var backButton=root.querySelector('[data-ghost-back]');
    var multiplierEl=root.querySelector('[data-ghost-multiplier]');
    var messageEl=root.querySelector('[data-ghost-message]');
    var previewEl=root.querySelector('[data-ghost-preview]');
    var betEl=root.querySelector('[data-ghost-bet]');
    var position=16, minPosition=10, leftEdge=18, rightEdge=68, backgroundOffset=0, distance=0, direction=0, raf=0, lastTime=0;
    function bet(){return Number(betEl&&betEl.textContent||0.10)||0.10}
    function setState(state,msg){if(screen)screen.setAttribute('data-ghost-state',state);if(messageEl)messageEl.textContent=msg||''}
    function viewportWidth(){return Math.max(1,window.innerWidth||document.documentElement.clientWidth||360)}
    function cycleLength(){return 6*viewportWidth()}
    function normalizeBackgroundOffset(){
      var cycle=cycleLength();
      while(backgroundOffset<=-cycle)backgroundOffset+=cycle;
      while(backgroundOffset>0)backgroundOffset-=cycle;
    }
    function multiplier(){return 1+(Math.max(0,position-16)*0.004)+(distance*0.00045)}
    function render(){
      normalizeBackgroundOffset();
      var value=multiplier();
      root.style.setProperty('--ghost-x',position+'%');
      root.style.setProperty('--ghost-bg-x',backgroundOffset.toFixed(1)+'px');
      if(multiplierEl)multiplierEl.textContent=value.toFixed(2)+'x';
      if(previewEl)previewEl.textContent=(bet()*value).toFixed(2);
      if(backButton)backButton.disabled=position<=minPosition&&distance<=0;
      if(forwardButton)forwardButton.disabled=false;
      setState(position>16||distance>0?'moving':'idle','');
    }
    function stopHold(){
      direction=0;lastTime=0;
      if(raf)window.cancelAnimationFrame(raf);
      raf=0;
      if(forwardButton)forwardButton.removeAttribute('data-holding');
      if(backButton)backButton.removeAttribute('data-holding');
      render();
    }
    function step(now){
      if(!direction)return;
      if(!lastTime)lastTime=now;
      var dt=Math.min(32,now-lastTime)/1000;
      lastTime=now;
      if(direction>0){
        if(position<rightEdge){
          position=Math.min(rightEdge,position+(22*dt));
        }else{
          var forward=42*dt;
          backgroundOffset-=forward;
          distance+=forward;
        }
      }else{
        if(position>leftEdge){
          position=Math.max(leftEdge,position-(24*dt));
        }else if(distance>0){
          var reverse=42*dt;
          backgroundOffset+=reverse;
          distance=Math.max(0,distance-reverse);
        }else{
          position=Math.max(minPosition,position-(20*dt));
        }
      }
      render();
      raf=window.requestAnimationFrame(step);
    }
    function startHold(dir,button){
      direction=dir;
      if(button)button.setAttribute('data-holding','1');
      if(dir>0&&backButton)backButton.removeAttribute('data-holding');
      if(dir<0&&forwardButton)forwardButton.removeAttribute('data-holding');
      if(raf)window.cancelAnimationFrame(raf);
      lastTime=0;
      raf=window.requestAnimationFrame(step);
    }
    function bindHold(button,dir){
      if(!button)return;
      button.addEventListener('pointerdown',function(e){e.preventDefault();button.setPointerCapture&&button.setPointerCapture(e.pointerId);startHold(dir,button)});
      button.addEventListener('pointerup',stopHold);
      button.addEventListener('pointercancel',stopHold);
      button.addEventListener('pointerleave',stopHold);
      button.addEventListener('contextmenu',function(e){e.preventDefault()});
    }
    bindHold(forwardButton,1);
    bindHold(backButton,-1);
    window.addEventListener('resize',render);
    render();
  })();
  </script>
</section>
`;