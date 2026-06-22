export const GHOST_RUN_SECTION = `
<section id="ghostrun" class="view ghost-run-view" aria-label="Ghost Run">
  <div class="ghost-run-screen" data-ghost-state="idle" style="--ghost-speed:0;--ghost-intensity:0;">
    <div class="ghost-run-scene" aria-label="Ghost Run 2D forest scene">
      <div class="ghost-run-sky"></div>
      <div class="ghost-run-noise"></div>
      <div class="ghost-run-vignette"></div>
      <div class="ghost-run-moon"></div>
      <div class="ghost-run-stars"></div>
      <div class="ghost-run-cloud ghost-run-cloud-a"></div>
      <div class="ghost-run-cloud ghost-run-cloud-b"></div>
      <div class="ghost-run-layer ghost-run-mountains"></div>
      <div class="ghost-run-layer ghost-run-layer-far"></div>
      <div class="ghost-run-layer ghost-run-layer-mid"></div>
      <div class="ghost-run-layer ghost-run-layer-near"></div>
      <div class="ghost-run-branch ghost-run-branch-left"></div>
      <div class="ghost-run-branch ghost-run-branch-right"></div>
      <div class="ghost-run-runway">
        <span></span><span></span><span></span><span></span>
      </div>
      <div class="ghost-run-ground"></div>
      <div class="ghost-run-embers"></div>
      <div class="ghost-run-fog ghost-run-fog-a"></div>
      <div class="ghost-run-fog ghost-run-fog-b"></div>
      <div class="ghost-run-fog ghost-run-fog-c"></div>
      <div class="ghost-run-hud">
        <span class="ghost-run-pill">Ghost Run</span>
        <strong class="ghost-run-multiplier" data-ghost-multiplier>1.00x</strong>
        <span class="ghost-run-state" data-ghost-message>Ready to run</span>
      </div>
      <div class="ghost-run-ghost" aria-hidden="true">
        <span class="ghost-run-trail ghost-run-trail-a"></span>
        <span class="ghost-run-trail ghost-run-trail-b"></span>
        <span class="ghost-run-ghost-glow"></span>
        <span class="ghost-run-ghost-body">
          <i class="ghost-run-eye ghost-run-eye-left"></i>
          <i class="ghost-run-eye ghost-run-eye-right"></i>
          <i class="ghost-run-mouth"></i>
          <b></b><b></b><b></b><b></b>
        </span>
      </div>
      <div class="ghost-run-danger ghost-run-danger-a"></div>
      <div class="ghost-run-danger ghost-run-danger-b"></div>
      <div class="ghost-run-danger ghost-run-danger-c"></div>
      <div class="ghost-run-speed-lines"></div>
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
    function setState(state,msg){if(screen)screen.setAttribute('data-ghost-state',state);if(messageEl)messageEl.textContent=msg}
    function setVisual(value){
      if(!screen)return;
      var intensity=Math.max(0,Math.min(1,(value-1)/4.8));
      screen.style.setProperty('--ghost-intensity',String(intensity.toFixed(3)));
      screen.style.setProperty('--ghost-speed',String((running?1+intensity*1.85:0).toFixed(3)));
    }
    function setMultiplier(value){var text=value.toFixed(2)+'x';if(multiplierEl)multiplierEl.textContent=text;if(previewEl)previewEl.textContent=(bet()*value).toFixed(2);setVisual(value)}
    function nextCrash(){return 1.18+Math.pow(Math.random(),1.75)*7.2}
    function tick(){
      if(!running)return;
      var elapsed=(Date.now()-startTime)/1000;
      var current=1+elapsed*0.42+elapsed*elapsed*0.055;
      setMultiplier(current);
      if(current>=crashAt){
        running=false;ended=true;setMultiplier(crashAt);setState('lost','The ghost vanished');button.textContent='Play Again';return;
      }
      timer=window.requestAnimationFrame(tick);
    }
    function start(){
      if(timer)window.cancelAnimationFrame(timer);
      running=true;ended=false;startTime=Date.now();crashAt=nextCrash();setMultiplier(1);setState('running','Running through the dark');button.textContent='Cash Out';tick();
    }
    function cashout(){
      if(!running){start();return}
      running=false;ended=true;if(timer)window.cancelAnimationFrame(timer);setState('won','Cashed out safely');button.textContent='Play Again';setVisual(1.8);
    }
    button&&button.addEventListener('click',function(){if(!running&&ended){start();return}running?cashout():start()});
    setMultiplier(1);
  })();
  </script>
</section>
`;