export const GHOST_RUN_SECTION = `
<section id="ghostrun" class="view ghost-run-view" aria-label="Ghost Run">
  <style>
    #ghostrun{width:100vw!important;width:100dvw!important;max-width:100vw!important;max-width:100dvw!important;margin-left:calc(50% - 50vw)!important;margin-right:calc(50% - 50vw)!important}
    #ghostrun .ghost-run-screen{width:100vw!important;width:100dvw!important;max-width:100vw!important;max-width:100dvw!important}
    #ghostrun .ghost-run-scene{width:100vw!important;width:100dvw!important;max-width:100vw!important;max-width:100dvw!important;margin-left:0!important;margin-right:0!important;border-radius:0!important;box-shadow:none!important;background:#000!important;background-color:#000!important;background-image:none!important}
    #ghostrun .ghost-run-controls{margin-top:-1px!important}
    #ghostrun .ghost-run-shadow-fade{display:none!important;background:none!important}
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
    #ghostrun .crash-live{margin:12px 12px 22px!important;border-radius:32px!important;background:#050505!important;border:1px solid rgba(255,255,255,.10)!important;box-shadow:0 24px 74px rgba(0,0,0,.50),inset 0 1px 0 rgba(255,255,255,.08)!important;padding:14px!important;overflow:hidden!important;transition:max-height .34s cubic-bezier(.2,.8,.2,1),padding .28s ease,opacity .2s ease!important;max-height:min(430px,calc(100dvh - 238px))!important;display:flex!important;flex-direction:column!important;min-height:0!important}
    #ghostrun .crash-live:not(.open){max-height:54px!important;padding-bottom:12px!important}
    #ghostrun .crash-live-head{display:flex!important;align-items:center!important;justify-content:space-between!important;margin-bottom:10px!important;color:rgba(255,255,255,.50)!important;font-size:13px!important;font-weight:850!important;letter-spacing:-.02em!important}
    #ghostrun .crash-live-title{display:inline-flex!important;align-items:center!important;gap:7px!important;color:rgba(255,255,255,.58)!important;min-width:0!important}
    #ghostrun .crash-live-title svg{width:17px!important;height:17px!important;color:rgba(255,255,255,.55)!important;flex:0 0 auto!important}
    #ghostrun .crash-live-title svg path{fill:none!important;stroke:currentColor!important;stroke-width:1.9!important;stroke-linecap:round!important;stroke-linejoin:round!important}
    #ghostrun .crash-live-head-actions{display:flex!important;align-items:center!important;gap:8px!important}
    #ghostrun .crash-live-head b{color:rgba(255,255,255,.92)!important;font-size:13px!important;font-weight:900!important}
    #ghostrun .crash-live-toggle{width:28px!important;height:28px!important;border:0!important;border-radius:10px!important;background:rgba(255,255,255,.055)!important;color:rgba(255,255,255,.85)!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:0!important}
    #ghostrun .crash-live-toggle svg{width:18px!important;height:18px!important;transition:transform .28s cubic-bezier(.2,.8,.2,1)!important}
    #ghostrun .crash-live.open .crash-live-toggle svg{transform:rotate(180deg)!important}
    #ghostrun .crash-live-list{display:grid!important;gap:6px!important;max-height:min(394px,calc(100dvh - 300px))!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior-y:contain!important;-webkit-overflow-scrolling:touch!important;padding-right:2px!important;scrollbar-width:thin!important;scrollbar-color:rgba(255,255,255,.18) transparent!important}
    #ghostrun .crash-live:not(.open) .crash-live-list{max-height:0!important;opacity:0!important;pointer-events:none!important}
    #ghostrun .crash-live-empty{font-size:12px!important;font-weight:820!important;color:rgba(255,255,255,.45)!important;padding:14px 0!important;text-align:center!important}
    #ghostrun .crash-live-row{display:grid!important;grid-template-columns:minmax(0,1fr) auto auto!important;align-items:center!important;gap:8px!important;min-height:34px!important;border-radius:17px!important;background:#030303!important;border:1px solid rgba(255,255,255,.08)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.035)!important;color:#fff!important;padding:2px 10px!important}
    #ghostrun .crash-live-user{min-width:0!important;font-size:12px!important;font-weight:900!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;color:rgba(255,255,255,.92)!important}
    #ghostrun .crash-live-amount{font-size:11px!important;font-weight:900!important;color:rgba(255,255,255,.62)!important;white-space:nowrap!important}
    #ghostrun .crash-live-status{display:flex!important;justify-content:flex-end!important;gap:5px!important;font-size:11px!important;font-weight:930!important;color:rgba(255,255,255,.84)!important;white-space:nowrap!important}
    #ghostrun .crash-live-mult{color:rgba(255,255,255,.62)!important;font-size:12px!important;font-weight:950!important}
    #ghostrun .crash-live-lost{color:#ff5b6b!important;font-size:12px!important;font-weight:930!important}
    #ghostrun .crash-live-row.cashout .crash-live-amount,#ghostrun .crash-live-plus{color:#78ffb3!important}
    #ghostrun .crash-live-plus{display:inline-block!important;margin-right:3px!important;font-weight:950!important}
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
        <div class="ghost-run-fear-wrap" aria-label="Soul Fear meter">
          <div class="ghost-run-fear-top"><span>Soul Fear</span><strong data-ghost-fear-label>0%</strong></div>
          <div class="ghost-run-fear-track"><i data-ghost-fear-bar></i></div>
        </div>
        <strong class="ghost-run-multiplier" data-ghost-multiplier>1.00x</strong>
        <span class="ghost-run-state" data-ghost-message></span>
      </div>
      <div class="ghost-run-reaper" aria-hidden="true"><i></i><b></b></div>
      <div class="ghost-run-curse-overlay" aria-hidden="true"></div>
      <div class="ghost-run-result" data-ghost-result aria-live="polite">
        <strong data-ghost-result-title></strong>
        <span data-ghost-result-detail></span>
        <button type="button" data-ghost-reset>New Round</button>
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
      <label class="ghost-run-control-card ghost-run-bet-card">
        <span>Bet Amount</span>
        <strong><input data-ghost-bet-input type="number" min="0.01" step="0.01" inputmode="decimal" value="0.10" aria-label="Ghost Run bet amount"/> TON</strong>
      </label>
      <div class="ghost-run-control-card ghost-run-win-card">
        <span>Win Preview</span>
        <strong><em data-ghost-preview>0.10</em> TON</strong>
      </div>
      <button class="ghost-run-move-button ghost-run-back-button" type="button" aria-label="Move back" data-ghost-back></button>
      <button class="ghost-run-move-button ghost-run-forward-button" type="button" aria-label="Move forward" data-ghost-forward></button>
      <button class="ghost-run-main-button ghost-run-start-button" type="button" data-ghost-start>Place Bet</button>
      <button class="ghost-run-main-button ghost-run-claim-button" type="button" data-ghost-claim>Claim Escape</button>
      <p class="ghost-run-note">Push for multiplier, retreat to calm the curse, or claim before Azrael catches you.</p>
    </div>
    <div class="crash-live open" id="ghostLive">
      <div class="crash-live-head">
        <span class="crash-live-title">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.2 11.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"/><path d="M3.4 18.4c.6-3 2.3-4.6 4.8-4.6s4.2 1.6 4.8 4.6"/><path d="M16.3 10.2a2.6 2.6 0 1 0 0-5.2"/><path d="M15.4 13.6c2.4.2 3.9 1.7 4.4 4.3"/></svg>
          <span>Live Bets</span>
        </span>
        <div class="crash-live-head-actions">
          <b id="ghostLiveTotal">0 TON</b>
          <button id="ghostLiveToggle" class="crash-live-toggle" type="button" aria-label="Toggle live bets" aria-expanded="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5"/></svg></button>
        </div>
      </div>
      <div class="crash-live-list" id="ghostLiveList"><div class="crash-live-empty">No bets yet</div></div>
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
    var claimButton=root.querySelector('[data-ghost-claim]');
    var startButton=root.querySelector('[data-ghost-start]');
    var betInput=root.querySelector('[data-ghost-bet-input]');
    var multiplierEl=root.querySelector('[data-ghost-multiplier]');
    var messageEl=root.querySelector('[data-ghost-message]');
    var previewEl=root.querySelector('[data-ghost-preview]');
    var betEl=root.querySelector('[data-ghost-bet]');
    var fearBar=root.querySelector('[data-ghost-fear-bar]');
    var fearLabel=root.querySelector('[data-ghost-fear-label]');
    var result=root.querySelector('[data-ghost-result]');
    var resultTitle=root.querySelector('[data-ghost-result-title]');
    var resultDetail=root.querySelector('[data-ghost-result-detail]');
    var resetButton=root.querySelector('[data-ghost-reset]');
    var position=16, minPosition=10, leftEdge=18, rightEdge=68, backgroundOffset=0, distance=0, direction=0, raf=0, lastTime=0;
    var fear=0, multiplierValue=1, retreatCharge=0, state='idle', activeBetNano=0, roundActive=false, settled=false;
    var roundProfile=null, ghostLiveRows=[], ghostLiveLoaded=false, ghostLiveSeq=1;
    var dangerRates=[1,1.22,1.48,1.82,2.22,2.75];
    var houseProfileKey='vexa:ghostrun:house-profile:v1';
    function loadHouseStats(){try{var raw=localStorage.getItem(houseProfileKey);var data=raw?JSON.parse(raw):{};return {rounds:Math.max(0,Number(data.rounds)||0),wins:Math.max(0,Number(data.wins)||0),losses:Math.max(0,Number(data.losses)||0),streak:Math.max(0,Number(data.streak)||0),microNext:data.microNext==='1'||data.microNext===true}}catch(e){return {rounds:0,wins:0,losses:0,streak:0,microNext:false}}}
    function saveHouseStats(stats){try{localStorage.setItem(houseProfileKey,JSON.stringify(stats||{}))}catch(e){}}
    function pickRoundProfile(){var stats=loadHouseStats();var seed=Math.random();if(stats.microNext){stats.microNext=false;saveHouseStats(stats);return {name:'micro-recovery',maxMultiplier:1.08,pressureAfter:1.045,pressureRate:46,forceCatchAfter:1.085}}if(stats.streak>=3)return {name:'streak-choke',maxMultiplier:1.05,pressureAfter:1.025,pressureRate:64,forceCatchAfter:1.052,setsMicroNext:true};if(seed<.90)return {name:'low-ceiling',maxMultiplier:1.80,pressureAfter:1.58,pressureRate:28,forceCatchAfter:1.805};if(seed<.985)return {name:'medium-ceiling',maxMultiplier:2.45,pressureAfter:2.08,pressureRate:18,forceCatchAfter:2.455};return {name:'rare-ceiling',maxMultiplier:3.20,pressureAfter:2.70,pressureRate:12,forceCatchAfter:3.205}}
    function recordRoundResult(won){var stats=loadHouseStats();stats.rounds+=1;if(won){stats.wins+=1;stats.streak+=1}else{stats.losses+=1;stats.streak=0}if(roundProfile&&roundProfile.setsMicroNext)stats.microNext=true;saveHouseStats(stats)}
    function cssUrl(url){return "url('"+String(url||'').replace(/['\\]/g,'')+"')"}
    function setVersionedBackground(selector,url){var el=root.querySelector(selector);if(el&&url)el.style.setProperty('background-image',cssUrl(url),'important')}
    function injectAssetUrls(urls){
      if(!urls)return;
      setVersionedBackground('.ghost-run-background-panel-1',urls.background);
      setVersionedBackground('.ghost-run-background-panel-2',urls.background2);
      setVersionedBackground('.ghost-run-background-panel-3',urls.background3);
      setVersionedBackground('.ghost-run-background-panel-4',urls.background4);
      setVersionedBackground('.ghost-run-background-panel-5',urls.background5);
      setVersionedBackground('.ghost-run-background-panel-6',urls.background6);
      setVersionedBackground('.ghost-run-background-panel-copy',urls.background);
      var style=document.getElementById('ghostRunVersionedAssetStyle');
      if(!style){style=document.createElement('style');style.id='ghostRunVersionedAssetStyle';document.head.appendChild(style)}
      style.textContent=[
        "#ghostrun .ghost-run-ghost{background-image:"+cssUrl(urls.ghostidle)+"!important;background-size:contain!important;background-position:center!important;background-repeat:no-repeat!important}",
        "#ghostrun .ghost-run-screen[data-ghost-state='movingForward'] .ghost-run-ghost,#ghostrun .ghost-run-screen[data-ghost-state='movingBack'] .ghost-run-ghost{background-image:"+cssUrl(urls.ghostmove)+"!important}"
      ].join("\n");
    }
    function loadAssetUrls(){fetch('/app/api/ghost-run-assets',{cache:'force-cache'}).then(function(r){return r.ok?r.json():null}).then(function(j){if(j&&j.urls)injectAssetUrls(j.urls)}).catch(function(){});}
    function tonToNano(v){var n=Number(String(v||'').replace(',','.'));return Number.isFinite(n)?Math.max(0,Math.floor(n*1000000000)):0}
    function nanoToTon(n){return (Math.max(0,Math.floor(Number(n)||0))/1000000000)}
    function readBalance(){return window.VexaTonBalance&&window.VexaTonBalance.read?Math.max(0,Math.floor(Number(window.VexaTonBalance.read())||0)):0}
    function changeBalance(delta){if(window.VexaTonBalance&&window.VexaTonBalance.add)window.VexaTonBalance.add(Math.floor(Number(delta)||0),'ghostrun');else window.dispatchEvent(new CustomEvent('vexa-ton-balance-game-change',{detail:{deltaNano:Math.floor(Number(delta)||0),section:'ghostrun'}}))}
    function bet(){return nanoToTon(activeBetNano||tonToNano(betInput&&betInput.value||0.10)||100000000)}
    function viewportWidth(){return Math.max(1,window.innerWidth||document.documentElement.clientWidth||360)}
    function cycleLength(){return 6*viewportWidth()}
    function normalizeBackgroundOffset(){var cycle=cycleLength();while(backgroundOffset<=-cycle)backgroundOffset+=cycle;while(backgroundOffset>0)backgroundOffset-=cycle;}
    function stageIndex(){return Math.max(0,Math.min(5,Math.floor((((-backgroundOffset)%cycleLength())+cycleLength())%cycleLength()/viewportWidth())))}
    function stageDanger(){return dangerRates[stageIndex()]||1}
    function setState(next,msg,dir){state=next;if(screen){screen.setAttribute('data-ghost-state',next);screen.setAttribute('data-ghost-direction',dir<0?'back':'forward');screen.setAttribute('data-danger-stage',String(stageIndex()+1));screen.setAttribute('data-fear-tier',fear>=85?'critical':fear>=65?'haunted':fear>=40?'uneasy':'calm')}if(messageEl)messageEl.textContent=msg||''}
    function updateMultiplier(dt){var cap=roundProfile&&Number(roundProfile.maxMultiplier)||1.8;if(direction>0){multiplierValue+=dt*(0.055+stageIndex()*0.014)+(Math.max(0,distance)*0.0000015);if(multiplierValue>cap)multiplierValue=cap}else if(direction<0){multiplierValue=Math.max(1,multiplierValue-dt*(0.024+stageIndex()*0.004));if(multiplierValue>cap)multiplierValue=cap}}
    function updateFear(dt){var deep=stageDanger();var pressure=roundProfile&&Number(roundProfile.pressureAfter)||1.58;if(direction>0){retreatCharge=0;fear+=8.6*deep*dt+Math.min(8,distance/viewportWidth())*0.16*dt;if(multiplierValue>=pressure)fear+=(roundProfile&&Number(roundProfile.pressureRate)||28)*dt}else if(direction<0){retreatCharge+=dt;var relief=Math.max(0,retreatCharge-.55);if(fear<60)fear-=5.2*dt+relief*2.2*dt;else if(fear<85)fear-=Math.max(.35,relief*2.4)*dt;else fear+=(1.1*deep-Math.max(0,relief*3.4))*dt}else{retreatCharge=0;if(stageIndex()>=2)fear+=(0.22+stageIndex()*0.18)*dt}fear=Math.max(0,Math.min(100,fear));}
    function warningText(){if(fear>=100)return 'The Reaper Caught You';if(fear>=85)return 'Retreat or Claim — The Reaper is near';if(fear>=65)return 'Azrael\'s shadow is closing in';if(fear>=40)return 'Fear is rising';return ''}
    function cleanText(v){return String(v==null?'':v).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]})}
    function tonText(n){return (Math.max(0,Number(n)||0)).toFixed(2).replace(/\.00$/,'').replace(/(\.\d)0$/,'$1')}
    function renderGhostLive(){var list=document.getElementById('ghostLiveList'),total=document.getElementById('ghostLiveTotal');if(!list)return;var sum=0;ghostLiveRows.forEach(function(r){sum+=Number(r.amount)||0});if(total)total.textContent=tonText(sum)+' TON';if(!ghostLiveRows.length){list.innerHTML='<div class="crash-live-empty">No bets yet</div>';return}list.innerHTML=ghostLiveRows.slice().sort(function(a,b){var rank={cashout:0,crashed:1,bet:2};var ra=rank[a.status]??3,rb=rank[b.status]??3;if(ra!==rb)return ra-rb;if(a.status==='cashout'&&b.status==='cashout')return Number(b.cashoutMultiplier||0)-Number(a.cashoutMultiplier||0);return Number(b.amount||0)-Number(a.amount||0)}).map(function(r){var cash=r.status==='cashout',crashed=r.status==='crashed';var status=cash?'<span class="crash-live-mult">'+cleanText(Number(r.cashoutMultiplier||1).toFixed(2).replace(/\.00$/,'')+'×')+'</span>':(crashed?'<span class="crash-live-lost">Lost</span>':'Bet');return '<div class="crash-live-row '+(cash?'cashout':crashed?'crashed':'')+'"><span class="crash-live-user">'+cleanText(r.name)+'</span><span class="crash-live-amount">'+(cash?'<span class="crash-live-plus">+</span>':'')+cleanText(tonText(r.amount)+' TON')+'</span><span class="crash-live-status">'+status+'</span></div>'}).join('')}
    function pickBetOption(user,i){var bets=Array.isArray(user&&user.bets)?user.bets:[];return bets.length?bets[(Date.now()+i*17)%bets.length]:{amount:.1,cashoutMultiplier:1.5}}
    function prepareGhostLive(){ghostLiveRows=[];var fallback=[{name:'Ari Stone',bets:[{amount:5,cashoutMultiplier:1.35}]},{name:'کیان مهر',bets:[{amount:6,cashoutMultiplier:1.28}]},{name:'Maya Chen',bets:[{amount:8,cashoutMultiplier:2.1}]}];function build(users){ghostLiveRows=(users||fallback).slice(0,24).map(function(u,i){var b=pickBetOption(u,i);return {id:ghostLiveSeq++,name:u.name||'Player',amount:Number(b.amount)||.1,target:Number(b.cashoutMultiplier)||1.5,status:'bet'}});renderGhostLive()}if(ghostLiveLoaded&&window.__ghostLiveUsers){build(window.__ghostLiveUsers);return}fetch('/app/api/ghost-run-virtual-users',{cache:'no-store'}).then(function(r){return r.ok?r.json():null}).then(function(j){window.__ghostLiveUsers=j&&Array.isArray(j.users)?j.users:fallback;ghostLiveLoaded=true;build(window.__ghostLiveUsers)}).catch(function(){build(fallback)})}
    function updateGhostLive(){if(!roundActive)return;var changed=false;ghostLiveRows.forEach(function(r){if(r.status==='bet'&&Number(r.target)<=multiplierValue){r.status='cashout';r.cashoutMultiplier=Number(r.target);changed=true}});if(changed)renderGhostLive()}
    function crashGhostLive(){var changed=false;ghostLiveRows.forEach(function(r){if(r.status==='bet'){r.status='crashed';changed=true}});if(changed)renderGhostLive()}
    function render(){
      normalizeBackgroundOffset();
      root.style.setProperty('--ghost-x',position+'%');root.style.setProperty('--ghost-bg-x',backgroundOffset.toFixed(1)+'px');root.style.setProperty('--ghost-fear',fear.toFixed(2)+'%');root.style.setProperty('--ghost-danger',String(stageIndex()+1));
      if(multiplierEl)multiplierEl.textContent=multiplierValue.toFixed(2)+'x';
      if(previewEl)previewEl.textContent=(bet()*multiplierValue).toFixed(2);
      if(fearBar)fearBar.style.width=fear.toFixed(1)+'%';
      if(fearLabel)fearLabel.textContent=Math.round(fear)+'%';
      if(screen)screen.setAttribute('data-fear-tier',fear>=85?'critical':fear>=65?'haunted':fear>=40?'uneasy':'calm');
      if(betEl)betEl.textContent=bet().toFixed(2);
      if(backButton)backButton.disabled=(!roundActive||state==='claimed'||state==='caught'||(position<=minPosition&&distance<=0));
      if(forwardButton)forwardButton.disabled=(!roundActive||state==='claimed'||state==='caught');
      if(claimButton)claimButton.disabled=(!roundActive||state==='claimed'||state==='caught');
      if(startButton)startButton.disabled=(roundActive&&!settled);
      if(betInput)betInput.disabled=(roundActive&&!settled);
      if(messageEl&&state!=='claimed'&&state!=='caught')messageEl.textContent=warningText();
    }
    function stopHold(){direction=0;lastTime=0;if(raf)window.cancelAnimationFrame(raf);raf=0;if(forwardButton)forwardButton.removeAttribute('data-holding');if(backButton)backButton.removeAttribute('data-holding');if(state!=='claimed'&&state!=='caught')setState('idle',warningText(),direction);render();}
    function endCaught(){if(settled)return;settled=true;roundActive=false;crashGhostLive();recordRoundResult(false);stopHold();setState('caught','The Reaper Caught You',1);if(resultTitle)resultTitle.textContent='The Reaper Caught You';if(resultDetail)resultDetail.textContent='Lost '+nanoToTon(activeBetNano).toFixed(2)+' TON';if(result)result.setAttribute('data-visible','1');setTimeout(function(){render()},20)}

    function resetRound(){stopHold();position=16;backgroundOffset=0;distance=0;fear=0;multiplierValue=1;retreatCharge=0;direction=0;state='idle';roundActive=false;settled=false;activeBetNano=0;roundProfile=null;if(result)result.removeAttribute('data-visible');setState('idle','Place a bet to start',1);render()}
    function startRound(){if(roundActive&&!settled)return;var amount=tonToNano(betInput&&betInput.value||0);if(amount<=0){setState('idle','Enter a valid bet',1);return}if(readBalance()<amount){setState('idle','Not enough TON balance',1);return}resetRound();activeBetNano=amount;roundProfile=pickRoundProfile();roundActive=true;settled=false;prepareGhostLive();changeBalance(-amount);setState('idle','Bet placed — move forward or claim',1);render()}
    function claim(){if(!roundActive||settled||state==='claimed'||state==='caught'||fear>=100)return;settled=true;roundActive=false;updateGhostLive();crashGhostLive();recordRoundResult(multiplierValue>1);stopHold();setState('claimed','Escaped the curse',direction);var payoutNano=Math.max(0,Math.floor(activeBetNano*multiplierValue));changeBalance(payoutNano);if(resultTitle)resultTitle.textContent='Escaped Before the Curse';if(resultDetail)resultDetail.textContent='Won '+nanoToTon(payoutNano).toFixed(2)+' TON at '+multiplierValue.toFixed(2)+'x';if(result)result.setAttribute('data-visible','1');render()}
    function step(now){if(!direction||state==='claimed'||state==='caught')return;if(!lastTime)lastTime=now;var dt=Math.min(48,now-lastTime)/1000;lastTime=now;setState(direction>0?'movingForward':'movingBack','',direction);if(direction>0){if(position<rightEdge){position=Math.min(rightEdge,position+(22*dt))}else{var forward=42*dt;backgroundOffset-=forward;distance+=forward}}else{if(position>leftEdge){position=Math.max(leftEdge,position-(24*dt))}else if(distance>0){var reverse=42*dt;backgroundOffset+=reverse;distance=Math.max(0,distance-reverse)}else{position=Math.max(minPosition,position-(20*dt))}}updateMultiplier(dt);updateFear(dt);updateGhostLive();render();var catchAfter=roundProfile&&Number(roundProfile.forceCatchAfter)||0;if((catchAfter&&multiplierValue>=catchAfter)||fear>=100){endCaught();return}raf=window.requestAnimationFrame(step)}
    function startHold(dir,button){if(!roundActive){setState('idle','Place a bet first',dir);return}if(state==='claimed'||state==='caught')return;direction=dir;if(button)button.setAttribute('data-holding','1');if(dir>0&&backButton)backButton.removeAttribute('data-holding');if(dir<0&&forwardButton)forwardButton.removeAttribute('data-holding');if(raf)window.cancelAnimationFrame(raf);lastTime=0;raf=window.requestAnimationFrame(step)}
    function bindHold(button,dir){if(!button)return;button.addEventListener('pointerdown',function(e){e.preventDefault();button.setPointerCapture&&button.setPointerCapture(e.pointerId);startHold(dir,button)});button.addEventListener('pointerup',stopHold);button.addEventListener('pointercancel',stopHold);button.addEventListener('pointerleave',stopHold);button.addEventListener('contextmenu',function(e){e.preventDefault()})}
    var ghostToggle=document.getElementById('ghostLiveToggle'),ghostBox=document.getElementById('ghostLive');if(ghostToggle&&ghostBox)ghostToggle.onclick=function(){var open=!ghostBox.classList.contains('open');ghostBox.classList.toggle('open',open);ghostToggle.setAttribute('aria-expanded',open?'true':'false')};renderGhostLive();bindHold(forwardButton,1);bindHold(backButton,-1);if(startButton)startButton.addEventListener('click',startRound);if(claimButton)claimButton.addEventListener('click',claim);if(resetButton)resetButton.addEventListener('click',resetRound);if(betInput)betInput.addEventListener('input',render);window.addEventListener('resize',render);loadAssetUrls();setState('idle','',1);render();
  })();
  </script>
</section>
`;
