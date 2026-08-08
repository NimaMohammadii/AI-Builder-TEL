export const PUMP_SECTION = String.raw`
<section id="coinflip" class="view pump-view">
  <style>
    body:has(#coinflip.active) .tabs { display: none !important; }
    body:has(#coinflip.active), body:has(#coinflip.active) .app, body:has(#coinflip.active) .content, body:has(#coinflip.active) .view.active, body:has(#coinflip.active) header.top {
      background: #030102 !important; background-image: none !important; box-shadow: none !important;
    }
    .pump-view {
      min-height: 100%; height: 100%; overflow-y: auto !important; overflow-x: hidden;
      padding: 0 14px calc(32px + env(safe-area-inset-bottom)); color: #fff; box-sizing: border-box;
      background: radial-gradient(ellipse 110% 52% at 50% -16%, #260b16 0%, #0a0407 48%, #020202 86%) !important;
    }
    .pump-page { width: min(100%, 440px); min-height: calc(100vh - 76px); margin: 0 auto; padding: 8px 0 20px; box-sizing: border-box; }
    .pump-brand { display:flex; justify-content:space-between; align-items:center; margin: 4px 4px 0; font-size: 11px; letter-spacing: .24em; font-weight: 900; color: rgba(255,240,246,.68); }
    .pump-brand strong { color:#fff; letter-spacing:.16em; font-size:13px; }
    .pump-stage {
      position: relative; height: min(56vh, 475px); min-height: 350px; margin: 0 -14px 4px; overflow: hidden;
      isolation:isolate; border-radius: 0 0 38px 38px;
      background: radial-gradient(ellipse at 50% 65%, rgba(100,29,54,.24), transparent 44%), linear-gradient(180deg, rgba(22,7,13,.92), #050304 78%);
    }
    .pump-stage::after { content:""; pointer-events:none; position:absolute; inset:auto 0 0; height:31%; z-index:2; background:linear-gradient(transparent,rgba(1,0,1,.57)); }
    #pumpCanvas { position:absolute; inset:0; z-index:1; display:block; width:100%; height:100%; touch-action:none; }
    .pump-load { position:absolute; inset:0; z-index:3; display:grid; place-items:center; color:rgba(255,232,242,.7); letter-spacing:.18em; font-size:10px; font-weight:900; transition:opacity .35s ease; pointer-events:none; }
    .pump-load::after { content:""; width:22px; height:22px; border:2px solid rgba(255,255,255,.16); border-top-color:#ed7fa9; border-radius:50%; animation:pumpSpin .8s linear infinite; }
    .pump-stage.is-ready .pump-load { opacity:0; }
    .pump-hud { position:absolute; z-index:4; top:18px; left:0; right:0; text-align:center; pointer-events:none; }
    .pump-hud-label { display:block; font-size:10px; text-transform:uppercase; letter-spacing:.23em; color:rgba(255,235,244,.55); font-weight:900; margin-bottom:4px; }
    .pump-multiplier { font-size:48px; line-height:1; letter-spacing:-.055em; font-weight:950; text-shadow:0 3px 22px #000, 0 0 24px rgba(236,60,130,.32); }
    .pump-status { display:inline-flex; margin-top:10px; padding:7px 11px; border:1px solid rgba(255,198,221,.19); border-radius:999px; background:rgba(12,1,6,.42); backdrop-filter:blur(10px); color:rgba(255,232,241,.78); font-size:10px; letter-spacing:.12em; font-weight:850; }
    .pump-status i { width:6px; height:6px; margin:4px 6px 0 0; border-radius:50%; background:#9b204c; box-shadow:0 0 10px #be315e; }
    .pump-status.live i { background:#78e1ad; box-shadow:0 0 10px #78e1ad; }
    .pump-controls { position:relative; z-index:5; margin:0 auto; padding:16px; border:1px solid rgba(255,255,255,.12); border-radius:28px; background:linear-gradient(145deg,rgba(30,4,15,.88),rgba(4,2,4,.91)); box-shadow:inset 0 1px 0 rgba(255,255,255,.10),0 18px 46px rgba(0,0,0,.34); backdrop-filter:blur(20px); }
    .pump-label { display:block; margin:0 0 9px 3px; color:rgba(255,255,255,.55); font-weight:850; font-size:11px; letter-spacing:.13em; text-transform:uppercase; }
    .pump-bet-row { display:grid; grid-template-columns:88px minmax(0,1fr) 88px; gap:9px; }
    .pump-bet-row button,.pump-bet-row input { height:52px; min-width:0; border-radius:17px; border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.045); color:#fff; font:900 17px/1 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; text-align:center; outline:0; }
    .pump-bet-row button:active,.pump-action:active,.pump-cashout:active { transform:scale(.975); }
    .pump-action-row { display:grid; gap:9px; margin-top:12px; }
    .pump-action,.pump-cashout { height:60px; width:100%; border:0; border-radius:18px; font:950 18px/1 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; letter-spacing:.025em; transition:transform .18s ease,filter .18s ease; }
    .pump-action { color:#19030b; background:linear-gradient(112deg,#fff 0%,#ffe6ee 47%,#d89ab2 100%); box-shadow:0 8px 23px rgba(217,73,127,.23); }
    .pump-action.is-playing { color:#fff; background:linear-gradient(112deg,#9e204b,#4a071f); border:1px solid rgba(255,210,226,.19); box-shadow:inset 0 1px 0 rgba(255,255,255,.16),0 8px 22px rgba(126,15,53,.36); }
    .pump-cashout { display:none; color:#fff; border:1px solid rgba(151,239,191,.40); background:linear-gradient(112deg,#1d6948,#0c3525); box-shadow:0 8px 22px rgba(39,155,100,.20); }
    .pump-controls.is-playing .pump-cashout { display:block; }
    .pump-action:disabled,.pump-cashout:disabled,.pump-bet-row button:disabled,.pump-bet-row input:disabled { opacity:.48; }
    .pump-stage.is-burst #pumpCanvas { animation:pumpBurst .52s cubic-bezier(.16,.88,.28,1) both; }
    @keyframes pumpSpin { to { transform:rotate(360deg); } }
    @keyframes pumpBurst { 45% { filter:brightness(2.1) saturate(1.7); } 100% { filter:brightness(.34) blur(1px); } }
    @media (max-height:700px) { .pump-stage { height:350px; min-height:350px; } .pump-multiplier { font-size:43px; } }
  </style>

  <div class="pump-page">
    <div class="pump-brand"><strong>PUMP</strong><span>PUMP · HOLD · CASH OUT</span></div>
    <div id="pumpStage" class="pump-stage">
      <canvas id="pumpCanvas" aria-label="3D Pump game scene"></canvas>
      <div class="pump-load">LOADING&nbsp;&nbsp;</div>
      <div class="pump-hud">
        <span class="pump-hud-label">Current multiplier</span>
        <div id="pumpMultiplier" class="pump-multiplier">1.00x</div>
        <span id="pumpStatus" class="pump-status"><i></i><b>READY TO PUMP</b></span>
      </div>
    </div>

    <div id="pumpControls" class="pump-controls">
      <span class="pump-label">Bet amount</span>
      <div class="pump-bet-row">
        <button id="pumpHalf" type="button">1/2</button>
        <input id="pumpBet" inputmode="decimal" pattern="[0-9.]*" value="1" aria-label="Bet amount"/>
        <button id="pumpDouble" type="button">2×</button>
      </div>
      <div class="pump-action-row">
        <button id="pumpAction" class="pump-action" type="button">Start Pump</button>
        <button id="pumpCashout" class="pump-cashout" type="button">Cash Out</button>
      </div>
    </div>
  </div>

  <script>
  (function(){
    var NANO=1000000000, state='idle', betNano=0, multiplier=1, pumps=0, burstAt=2;
    var scene3d=null;

    function q(id){ return document.getElementById(id); }
    function readBalanceNano(){ return window.VexaTonBalance&&typeof window.VexaTonBalance.read==='function' ? Math.max(0,Math.floor(Number(window.VexaTonBalance.read())||0)) : 0; }
    function addBalanceNano(delta){ if(window.VexaTonBalance&&typeof window.VexaTonBalance.add==='function') window.VexaTonBalance.add(Math.floor(Number(delta)||0)); }
    function toNano(value){ var n=Number(String(value||'').replace(',','.'))||0; return Math.max(0,Math.floor(n*NANO)); }
    function toTon(nano){ var n=Math.max(0,Math.floor(Number(nano)||0))/NANO; return n.toFixed(2).replace(/\.00$/,'').replace(/(\.\d)0$/,'$1'); }
    function formatMultiplier(value){ return (Math.round((Number(value)||1)*100)/100).toFixed(2)+'x'; }
    function hiddenBurstPoint(){
      var forced=window.VexaGameChance&&typeof window.VexaGameChance.decideWin==='function'?window.VexaGameChance.decideWin():null;
      if(forced===true)return 24; if(forced===false)return 1.01;
      var roll=Math.random(), point=1.18+Math.pow(roll,1.9)*6.2;
      if(Math.random()<.055)point+=4+Math.random()*8;
      return Math.min(24,Math.round(point*100)/100);
    }
    function currentBetNano(){ var n=toNano(q('pumpBet')&&q('pumpBet').value); return n<1?NANO:n; }
    function setBetNano(nano){ var input=q('pumpBet'); if(input)input.value=toTon(Math.max(1,Math.floor(Number(nano)||NANO))); }
    function normalizeBet(){ var balance=readBalanceNano(), amount=currentBetNano(); if(balance>=NANO&&amount>balance)amount=balance; setBetNano(amount); return amount; }

    function render(){
      var controls=q('pumpControls'), action=q('pumpAction'), cashout=q('pumpCashout'), input=q('pumpBet'), half=q('pumpHalf'), double=q('pumpDouble'), status=q('pumpStatus'), stage=q('pumpStage');
      var playing=state==='playing', label=q('pumpMultiplier');
      if(label)label.textContent=formatMultiplier(multiplier);
      if(controls)controls.classList.toggle('is-playing',playing);
      if(action){ action.textContent=playing?'Pump balloon':'Start Pump'; action.classList.toggle('is-playing',playing); }
      if(cashout){ cashout.disabled=!playing||pumps<1; cashout.textContent='Cash Out  '+formatMultiplier(multiplier); }
      if(input)input.disabled=playing; if(half)half.disabled=playing; if(double)double.disabled=playing;
      if(status){ status.classList.toggle('live',playing); status.querySelector('b').textContent=state==='popped'?'BALLOON BURST':state==='cashed'?'CASHED OUT':playing?'PUMPING LIVE':'READY TO PUMP'; }
      if(stage)stage.classList.toggle('is-burst',state==='popped');
      if(scene3d)scene3d.setState(multiplier,pumps,state);
    }

    function startRound(){
      var balance=readBalanceNano(); betNano=normalizeBet(); if(balance<betNano)return;
      state='playing'; multiplier=1; pumps=0; burstAt=hiddenBurstPoint(); addBalanceNano(-betNano); render();
    }
    function resetSoon(delay){ setTimeout(function(){ state='idle'; multiplier=1; pumps=0; render(); },delay); }
    function pumpOnce(){
      if(state!=='playing'){startRound();return;}
      pumps+=1; multiplier=Math.round((multiplier+.09+multiplier*.085+pumps*.012)*100)/100;
      if(multiplier>=burstAt){state='popped';render();resetSoon(1250);return;}
      render();
    }
    function cashOut(){
      if(state!=='playing'||pumps<1)return;
      addBalanceNano(Math.floor(betNano*multiplier)); state='cashed'; render(); resetSoon(1050);
    }
    function multiplyBet(value){ if(state==='playing')return; var balance=readBalanceNano(),current=currentBetNano(),next=value<1?Math.max(NANO,Math.floor(current/2)):current*2; if(balance>=NANO)next=Math.min(balance,next); setBetNano(next); }
    function bind(){
      var action=q('pumpAction'),cashout=q('pumpCashout'),half=q('pumpHalf'),double=q('pumpDouble'),input=q('pumpBet');
      if(action&&!action.dataset.pumpBound){action.dataset.pumpBound='1';action.addEventListener('click',pumpOnce);}
      if(cashout&&!cashout.dataset.pumpBound){cashout.dataset.pumpBound='1';cashout.addEventListener('click',cashOut);}
      if(half&&!half.dataset.pumpBound){half.dataset.pumpBound='1';half.addEventListener('click',function(){multiplyBet(.5);});}
      if(double&&!double.dataset.pumpBound){double.dataset.pumpBound='1';double.addEventListener('click',function(){multiplyBet(2);});}
      if(input&&!input.dataset.pumpBound){input.dataset.pumpBound='1';input.addEventListener('change',normalizeBet);input.addEventListener('blur',normalizeBet);}
      window.addEventListener('vexa-ton-balance-sync',normalizeBet); render();
    }

    function bootThree(){
      import('https://cdn.jsdelivr.net/npm/three@0.183.2/build/three.module.min.js').then(function(THREE){
        var canvas=q('pumpCanvas'), stage=q('pumpStage'); if(!canvas||!stage)return;
        var renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
        renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
        renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.25; renderer.outputColorSpace=THREE.SRGBColorSpace;
        var scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(37,1,.1,100); camera.position.set(0,2.7,11.5);
        var group=new THREE.Group(); scene.add(group);
        var balloonGroup=new THREE.Group(); balloonGroup.position.set(0,.02,0); group.add(balloonGroup);
        var balloonMat=new THREE.MeshPhysicalMaterial({color:0x542039,metalness:.12,roughness:.18,clearcoat:1,clearcoatRoughness:.1,reflectivity:.82,iridescence:.08,iridescenceIOR:1.3});
        var balloon=new THREE.Mesh(new THREE.SphereGeometry(1.72,64,48),balloonMat); balloon.scale.set(.94,1.17,.94); balloon.castShadow=true; balloonGroup.add(balloon);
        var knot=new THREE.Mesh(new THREE.ConeGeometry(.17,.38,20),new THREE.MeshStandardMaterial({color:0x23000d,metalness:.72,roughness:.25})); knot.position.y=-2.05; knot.rotation.z=Math.PI; balloonGroup.add(knot);
        var shine=new THREE.Mesh(new THREE.SphereGeometry(1.73,48,32),new THREE.MeshBasicMaterial({color:0xffd7e5,transparent:true,opacity:.08,side:THREE.FrontSide})); shine.scale.set(.95,1.18,.95); shine.position.set(-.11,.12,.12); balloonGroup.add(shine);
        var key=new THREE.DirectionalLight(0xffe4ed,2.8);key.position.set(-4,5,7);scene.add(key);
        var fill=new THREE.PointLight(0x7a3853,9,10,2);fill.position.set(-3,1,3);scene.add(fill);
        var rim=new THREE.PointLight(0xd8a4b8,7,9,2);rim.position.set(2,3,-3);scene.add(rim);
        var targetScale=1, pop=0, clock=new THREE.Clock();
        function resize(){var r=stage.getBoundingClientRect(),w=Math.max(1,r.width),h=Math.max(1,r.height);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
        resize();window.addEventListener('resize',resize);stage.classList.add('is-ready');
        (function loop(){requestAnimationFrame(loop);var t=clock.getElapsedTime();if(!document.body.contains(canvas)){renderer.dispose();return;}
          group.rotation.y=Math.sin(t*.24)*.08;balloonGroup.rotation.y=Math.sin(t*.58)*.09;balloonGroup.position.y=.08+Math.sin(t*1.1)*.045;
          var bounce=1+pop*Math.sin(Math.min(1,pop*2.5)*Math.PI)*.075;balloonGroup.scale.set(targetScale*bounce,targetScale*(1-pop*.055),targetScale*bounce);
          pop*=.91;renderer.render(scene,camera);
        })();
        scene3d={setState:function(value,count,nextState){var next=1+Math.min(.42,(Math.max(1,value)-1)*.075+count*.013);targetScale=next;if(count>0)pop=1;if(nextState==='popped'){pop=7;balloonMat.emissive=new THREE.Color(0x8f254b);setTimeout(function(){balloonMat.emissive=new THREE.Color(0x000000);},500);}}};
        render();
      }).catch(function(){ var stage=q('pumpStage');if(stage){stage.classList.add('is-ready');} });
    }
    bind();
    var threeBooted=false;
    function ensureThree(){ if(threeBooted)return; var root=q('coinflip'); if(!root||!root.classList.contains('active'))return; threeBooted=true; bootThree(); }
    if(window.MutationObserver){ var observer=new MutationObserver(ensureThree); var root=q('coinflip'); if(root)observer.observe(root,{attributes:true,attributeFilter:['class']}); }
    document.addEventListener('click',function(){setTimeout(ensureThree,220)},true);
    ensureThree();
  })();
  </script>
</section>
`;
