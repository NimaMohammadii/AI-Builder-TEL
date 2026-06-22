export const GHOST_RUN_SECTION = `
<section id="ghostrun" class="view ghost-run-view" aria-label="Ghost Run">
  <style>
    #ghostrun .ghost-run-scene{width:100vw!important;max-width:100vw!important;margin-left:calc(50% - 50vw)!important;margin-right:calc(50% - 50vw)!important;border-radius:0!important;box-shadow:inset 0 18px 26px rgba(0,0,0,.42)!important}
    #ghostrun .ghost-run-scene:before{content:'';position:absolute;z-index:30;left:0;right:0;top:0;height:34px;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.58),rgba(0,0,0,.24) 48%,transparent 100%)}
    #ghostrun .ghost-run-controls{margin-top:-1px!important}
    #ghostrun .ghost-run-shadow-fade{bottom:-28px!important;height:72px!important;background:linear-gradient(180deg,transparent 0%,rgba(12,2,6,.46) 52%,rgba(0,0,0,.88) 100%)!important}
    #ghostrun .ghost-run-ground{height:172px!important;left:-80%!important;right:-80%!important;background-size:auto 100%!important;background-repeat:repeat-x!important;background-position:0 bottom!important;z-index:5!important;animation:ghostRunUploadedGround 3.2s linear infinite!important}
    #ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-ground{animation-duration:1.45s!important}
    #ghostrun .ghost-run-uploaded-trees,#ghostrun .ghost-run-uploaded-houses{display:block!important;background-repeat:repeat-x!important;background-position:var(--ghost-art-offset,0) bottom!important;background-size:var(--ghost-art-tile,420px) auto!important;opacity:var(--ghost-art-opacity,.82)!important;visibility:visible!important;filter:drop-shadow(0 14px 16px rgba(0,0,0,.32)) saturate(.86) brightness(.82)!important}
    #ghostrun .ghost-run-uploaded-tree-1{z-index:4!important;left:-55%!important;right:-55%!important;bottom:146px!important;height:154px!important;--ghost-art-tile:520px;--ghost-art-offset:0;--ghost-art-opacity:.52}
    #ghostrun .ghost-run-uploaded-tree-2{z-index:5!important;left:-50%!important;right:-50%!important;bottom:138px!important;height:178px!important;--ghost-art-tile:470px;--ghost-art-offset:180px;--ghost-art-opacity:.60}
    #ghostrun .ghost-run-uploaded-tree-3{z-index:6!important;left:-45%!important;right:-45%!important;bottom:130px!important;height:204px!important;--ghost-art-tile:430px;--ghost-art-offset:74px;--ghost-art-opacity:.68}
    #ghostrun .ghost-run-uploaded-house-1{z-index:5!important;left:-58%!important;right:-58%!important;bottom:144px!important;height:108px!important;--ghost-art-tile:560px;--ghost-art-offset:286px;--ghost-art-opacity:.56}
    #ghostrun .ghost-run-uploaded-house-2{z-index:6!important;left:-52%!important;right:-52%!important;bottom:136px!important;height:124px!important;--ghost-art-tile:520px;--ghost-art-offset:38px;--ghost-art-opacity:.62}
    #ghostrun .ghost-run-uploaded-house-3{z-index:7!important;left:-48%!important;right:-48%!important;bottom:128px!important;height:140px!important;--ghost-art-tile:490px;--ghost-art-offset:224px;--ghost-art-opacity:.68}
    @media(max-width:380px){#ghostrun .ghost-run-scene{border-radius:0!important}}
  </style>
  <div class="ghost-run-screen" data-ghost-state="idle">
    <div class="ghost-run-scene" aria-label="Ghost Run 2D forest scene">
      <div class="ghost-run-sky"></div>
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
      <button class="ghost-run-main-button" type="button" data-ghost-action>Start Run</button>
      <p class="ghost-run-note">Cash out before the ghost vanishes.</p>
    </div>
  </div>
  <script>
  (function(){
    var root=document.currentScript&&document.currentScript.closest('#ghostrun');
    if(!root||root.dataset.ghostReady==='1')return;
    root.dataset.ghostReady='1';
    var screen=root.querySelector('.ghost-run-screen');
    var button=root.querySelector('[data-ghost-action]');
    var multiplierEl=root.querySelector('[data-ghost-multiplier]');
    var messageEl=root.querySelector('[data-ghost-message]');
    var previewEl=root.querySelector('[data-ghost-preview]');
    var betEl=root.querySelector('[data-ghost-bet]');
    var timer=0, startTime=0, crashAt=0, running=false, ended=false;
    function bet(){return Number(betEl&&betEl.textContent||0.10)||0.10}
    function setState(state,msg){if(screen)screen.setAttribute('data-ghost-state',state);if(messageEl)messageEl.textContent=msg||''}
    function setMultiplier(value){var text=value.toFixed(2)+'x';if(multiplierEl)multiplierEl.textContent=text;if(previewEl)previewEl.textContent=(bet()*value).toFixed(2)}
    function nextCrash(){return 1.18+Math.pow(Math.random(),1.75)*7.2}
    function tick(){
      if(!running)return;
      var elapsed=(Date.now()-startTime)/1000;
      var current=1+elapsed*0.42+elapsed*elapsed*0.055;
      setMultiplier(current);
      if(current>=crashAt){
        running=false;ended=true;setMultiplier(crashAt);setState('lost','');button.textContent='Play Again';return;
      }
      timer=window.requestAnimationFrame(tick);
    }
    function start(){
      if(timer)window.cancelAnimationFrame(timer);
      running=true;ended=false;startTime=Date.now();crashAt=nextCrash();setMultiplier(1);setState('running','');button.textContent='Cash Out';tick();
    }
    function cashout(){
      if(!running){start();return}
      running=false;ended=true;if(timer)window.cancelAnimationFrame(timer);setState('won','');button.textContent='Play Again';
    }
    button&&button.addEventListener('click',function(){if(!running&&ended){start();return}running?cashout():start()});
    setMultiplier(1);
  })();
  </script>
</section>
`;