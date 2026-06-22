export const GHOST_RUN_SECTION = `
<section id="ghostrun" class="view ghost-run-view" aria-label="Ghost Run">
  <style>
    #ghostrun .ghost-run-scene{border-radius:0!important;box-shadow:none!important}
    #ghostrun .ghost-run-controls{margin-top:-1px!important}
    #ghostrun .ghost-run-shadow-fade{bottom:-28px!important;height:72px!important;background:linear-gradient(180deg,transparent 0%,rgba(12,2,6,.46) 52%,rgba(0,0,0,.88) 100%)!important}
    #ghostrun .ghost-run-ground{height:180px!important;left:-100%!important;right:-100%!important;background-size:auto 118%!important;background-repeat:repeat-x!important;background-position:0 bottom!important;z-index:5!important;animation:ghostRunUploadedGround 3.2s linear infinite!important}
    #ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-ground{animation-duration:1.45s!important}
    #ghostrun .ghost-run-uploaded-trees,#ghostrun .ghost-run-uploaded-houses{display:block!important;background-repeat:repeat-x!important;background-position:0 bottom!important;visibility:visible!important}
    #ghostrun .ghost-run-uploaded-tree-1{bottom:146px!important;height:220px!important;background-size:620px 100%!important;background-position:0 bottom!important;opacity:.72!important;z-index:7!important}
    #ghostrun .ghost-run-uploaded-tree-2{bottom:150px!important;height:246px!important;background-size:760px 100%!important;background-position:210px bottom!important;opacity:.58!important;z-index:6!important}
    #ghostrun .ghost-run-uploaded-tree-3{bottom:154px!important;height:272px!important;background-size:900px 100%!important;background-position:430px bottom!important;opacity:.46!important;z-index:5!important}
    #ghostrun .ghost-run-uploaded-house-1{bottom:132px!important;height:158px!important;background-size:520px 100%!important;background-position:70px bottom!important;opacity:.92!important;z-index:8!important}
    #ghostrun .ghost-run-uploaded-house-2{bottom:136px!important;height:172px!important;background-size:680px 100%!important;background-position:290px bottom!important;opacity:.72!important;z-index:7!important}
    #ghostrun .ghost-run-uploaded-house-3{bottom:142px!important;height:184px!important;background-size:840px 100%!important;background-position:510px bottom!important;opacity:.55!important;z-index:6!important}
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