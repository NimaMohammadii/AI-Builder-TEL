export const GHOST_RUN_SECTION = `
<section id="ghostrun" class="view ghost-run-view" aria-label="Ghost Run">
  <style>
    #ghostrun{width:100vw!important;width:100dvw!important;max-width:100vw!important;max-width:100dvw!important;margin-left:calc(50% - 50vw)!important;margin-right:calc(50% - 50vw)!important}
    #ghostrun .ghost-run-screen{width:100vw!important;width:100dvw!important;max-width:100vw!important;max-width:100dvw!important}
    #ghostrun .ghost-run-scene{width:100vw!important;width:100dvw!important;max-width:100vw!important;max-width:100dvw!important;margin-left:0!important;margin-right:0!important;border-radius:0!important;box-shadow:none!important}
    #ghostrun .ghost-run-controls{margin-top:-1px!important}
    #ghostrun .ghost-run-shadow-fade{bottom:-28px!important;height:72px!important;background:linear-gradient(180deg,transparent 0%,rgba(12,2,6,.46) 52%,rgba(0,0,0,.88) 100%)!important}
    #ghostrun .ghost-run-moon,#ghostrun .ghost-run-ground,#ghostrun .ghost-run-uploaded-trees,#ghostrun .ghost-run-uploaded-houses{display:none!important;visibility:hidden!important}
    #ghostrun .ghost-run-ghost{left:var(--ghost-x,16%)!important;width:64px!important;height:76px!important;bottom:76px!important;transition:left .18s ease-out, transform .18s ease-out!important}
    #ghostrun .ghost-run-move-button{height:62px!important;border:0!important;border-radius:999px!important;font-size:16px!important;font-weight:1000!important;letter-spacing:-.02em!important;box-shadow:0 18px 42px rgba(255,255,255,.10),0 0 34px rgba(105,13,37,.18)!important}
    #ghostrun .ghost-run-back-button{grid-column:1!important;background:linear-gradient(180deg,rgba(255,255,255,.14),rgba(255,255,255,.06))!important;color:#fff!important;border:1px solid rgba(255,255,255,.08)!important}
    #ghostrun .ghost-run-forward-button{grid-column:2!important;background:linear-gradient(180deg,#fff,#d9d9d9)!important;color:#070205!important}
    #ghostrun .ghost-run-move-button:active{transform:scale(.985)!important}
    @media(max-width:380px){#ghostrun .ghost-run-scene{border-radius:0!important}#ghostrun .ghost-run-ghost{width:58px!important;height:70px!important;bottom:72px!important}}
  </style>
  <div class="ghost-run-screen" data-ghost-state="idle">
    <div class="ghost-run-scene" aria-label="Ghost Run 2D forest scene">
      <div class="ghost-run-sky"></div>
      <div class="ghost-run-uploaded-background"></div>
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
      <button class="ghost-run-move-button ghost-run-back-button" type="button" data-ghost-back>Back</button>
      <button class="ghost-run-move-button ghost-run-forward-button" type="button" data-ghost-forward>Forward</button>
      <p class="ghost-run-note">Move forward to slowly grow the multiplier.</p>
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
    var position=16, minPosition=8, maxPosition=76;
    function bet(){return Number(betEl&&betEl.textContent||0.10)||0.10}
    function setState(state,msg){if(screen)screen.setAttribute('data-ghost-state',state);if(messageEl)messageEl.textContent=msg||''}
    function multiplier(){return 1+Math.max(0,position-16)*0.012}
    function render(){
      var value=multiplier();
      root.style.setProperty('--ghost-x',position+'%');
      if(multiplierEl)multiplierEl.textContent=value.toFixed(2)+'x';
      if(previewEl)previewEl.textContent=(bet()*value).toFixed(2);
      if(backButton)backButton.disabled=position<=minPosition;
      if(forwardButton)forwardButton.disabled=position>=maxPosition;
    }
    function moveForward(){position=Math.min(maxPosition,position+4);setState('running','');render()}
    function moveBack(){position=Math.max(minPosition,position-4);setState(position<=16?'idle':'running','');render()}
    forwardButton&&forwardButton.addEventListener('click',moveForward);
    backButton&&backButton.addEventListener('click',moveBack);
    render();
  })();
  </script>
</section>
`;