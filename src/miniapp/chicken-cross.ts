export const CHICKEN_CROSS_STYLES = `
body.cc-game-open .tabs{opacity:0!important;transform:translateY(90px)!important;pointer-events:none!important}
#hilo{--cc-wine:#64102f;--cc-rose:#ff6d9f;position:relative!important;height:calc(100% + 8px)!important;margin:0 -16px -8px!important;width:calc(100% + 32px)!important;padding:0!important;overflow:hidden!important;background:#050205!important}
#hilo.active{display:block!important}
#hilo .cc-world{position:absolute;inset:0;overflow:hidden;background:radial-gradient(circle at 50% 18%,#210710 0,#090306 48%,#020102 100%)}
#hilo canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;outline:0}
#hilo .cc-vignette{position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(180deg,rgba(2,0,1,.04) 0%,transparent 24%,transparent 54%,rgba(2,0,1,.28) 72%,#030102 100%);box-shadow:inset 0 0 80px rgba(0,0,0,.42)}
#hilo .cc-render-loading{position:absolute;z-index:8;inset:0;display:grid;place-items:center;color:rgba(255,255,255,.54);font-size:11px;font-weight:850;letter-spacing:.15em;text-transform:uppercase;background:radial-gradient(circle at 50% 44%,rgba(89,11,41,.20),transparent 32%);transition:opacity .45s ease,visibility .45s ease}
#hilo .cc-render-loading:after{content:'';position:absolute;width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,255,255,.09);border-top-color:rgba(255,109,159,.8);animation:ccLoad .9s linear infinite}
#hilo .cc-render-loading.ready{opacity:0;visibility:hidden}
@keyframes ccLoad{to{transform:rotate(360deg)}}
#hilo .cc-hud{position:absolute;z-index:5;left:18px;right:18px;top:14px;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;pointer-events:none}
#hilo .cc-multi{font-size:40px;font-weight:950;line-height:.9;letter-spacing:-.06em;color:#fff;text-shadow:0 0 30px rgba(255,72,139,.32),0 10px 30px rgba(0,0,0,.72)}
#hilo .cc-multi small{display:block;margin-top:9px;color:rgba(255,255,255,.48);font-size:9px;font-weight:850;letter-spacing:.14em;text-transform:uppercase}
#hilo .cc-step-pill{height:34px;padding:0 13px;border-radius:999px;display:flex;align-items:center;background:rgba(8,2,5,.34);border:1px solid rgba(255,255,255,.10);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);color:rgba(255,255,255,.78);font-size:11px;font-weight:900;box-shadow:inset 0 1px 0 rgba(255,255,255,.06)}
#hilo .cc-message{position:absolute;z-index:6;left:50%;top:82px;transform:translateX(-50%);max-width:82%;padding:8px 14px;border-radius:999px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:center;color:rgba(255,255,255,.70);font-size:10px;font-weight:850;background:rgba(6,1,4,.32);border:1px solid rgba(255,255,255,.07);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);transition:.2s ease}
#hilo .cc-message.win{color:#ffe3ed;border-color:rgba(255,109,159,.24);box-shadow:0 0 24px rgba(154,19,69,.14)}
#hilo .cc-progress{position:absolute;z-index:5;left:22px;right:22px;bottom:238px;display:flex;align-items:center;gap:4px;height:8px;pointer-events:none}
#hilo .cc-progress i{height:3px;flex:1;border-radius:99px;background:rgba(255,255,255,.09);box-shadow:0 1px 4px rgba(0,0,0,.4);transition:.22s ease}
#hilo .cc-progress i.done{height:4px;background:linear-gradient(90deg,#8e1b49,#ff6d9f);box-shadow:0 0 11px rgba(255,75,140,.42)}
#hilo .cc-controls{position:absolute;z-index:7;left:0;right:0;bottom:0;padding:36px 16px calc(16px + env(safe-area-inset-bottom));background:linear-gradient(180deg,transparent 0%,rgba(3,1,2,.76) 20%,rgba(3,1,2,.97) 64%,#030102 100%);pointer-events:none}
#hilo .cc-controls-inner{width:min(100%,470px);margin:0 auto;pointer-events:auto}
#hilo .cc-top-controls{display:grid;grid-template-columns:1fr 1.1fr;gap:9px;align-items:end}
#hilo .cc-label{display:flex;justify-content:space-between;align-items:center;margin:0 2px 7px;color:rgba(255,255,255,.42);font-size:8px;font-weight:850;letter-spacing:.10em;text-transform:uppercase}
#hilo .cc-difficulty{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}
#hilo .cc-difficulty button{height:42px;padding:0 2px;border-radius:13px;border:1px solid rgba(255,255,255,.075);background:rgba(255,255,255,.035);color:rgba(255,255,255,.42);font-size:9px;font-weight:900;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);transition:.18s ease}
#hilo .cc-difficulty button.active{color:#fff;background:linear-gradient(180deg,rgba(133,25,64,.88),rgba(67,7,29,.94));border-color:rgba(255,183,208,.22);box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 10px 24px rgba(76,4,29,.26)}
#hilo .cc-bet{display:grid;grid-template-columns:44px minmax(0,1fr) 44px;gap:5px}
#hilo .cc-bet button,#hilo .cc-bet input{height:42px;min-width:0;border-radius:13px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.035);color:#fff;text-align:center;font-size:14px;font-weight:950;outline:none;box-sizing:border-box;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
#hilo .cc-bet button{font-size:10px;color:rgba(255,255,255,.58)}
#hilo .cc-actions{display:grid;grid-template-columns:1fr;gap:8px;margin-top:9px}
#hilo .cc-actions.has-round{grid-template-columns:1.35fr .65fr}
#hilo .cc-primary,#hilo .cc-cashout{height:55px;border:0;border-radius:17px;font-size:15px;font-weight:950;letter-spacing:-.025em;transition:transform .12s ease,opacity .18s ease}
#hilo .cc-primary{color:#17040b;background:linear-gradient(180deg,#fff8fb,#dac8cf);box-shadow:0 14px 30px rgba(0,0,0,.34),inset 0 1px 0 #fff}
#hilo .cc-actions.has-round .cc-primary{color:#fff;background:linear-gradient(180deg,#a92959,#5d0b2c);box-shadow:0 14px 30px rgba(85,4,35,.38),inset 0 1px 0 rgba(255,255,255,.16)}
#hilo .cc-cashout{display:none;color:#fff;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.11);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
#hilo .cc-actions.has-round .cc-cashout{display:block}
#hilo button:active{transform:scale(.97)}
#hilo button:disabled,#hilo input:disabled{opacity:.40;transform:none}
#hilo .cc-proof{height:14px;margin:7px 3px 0;color:rgba(255,255,255,.23);font-size:8px;line-height:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#hilo .cc-proof b{color:rgba(255,255,255,.38)}
#hilo.cc-hit .cc-world{animation:ccImpact .40s ease}
@keyframes ccImpact{0%,100%{transform:translateX(0);filter:none}25%{transform:translateX(-7px);filter:saturate(1.45)}55%{transform:translateX(6px)}78%{transform:translateX(-3px)}}
@media(max-width:390px){#hilo .cc-top-controls{grid-template-columns:1fr}#hilo .cc-progress{bottom:282px}#hilo .cc-controls{padding-left:13px;padding-right:13px}#hilo .cc-difficulty button{height:36px}#hilo .cc-bet button,#hilo .cc-bet input{height:38px}}
@media(max-height:690px){#hilo .cc-controls{padding-top:25px;padding-bottom:calc(8px + env(safe-area-inset-bottom))}#hilo .cc-primary,#hilo .cc-cashout{height:48px}#hilo .cc-proof{display:none}#hilo .cc-progress{bottom:211px}}
@media(prefers-reduced-motion:reduce){#hilo *{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;

export const CHICKEN_CROSS_SECTION = `
<section id="hilo" class="view chicken-cross-view" aria-label="Chicken Cross">
  <div class="cc-world" data-cc-world>
    <canvas data-cc-canvas aria-label="Real-time 3D Chicken Cross game"></canvas>
    <div class="cc-vignette"></div>
    <div class="cc-render-loading" data-cc-loading>Loading 3D world</div>
    <div class="cc-hud">
      <div class="cc-multi"><span data-cc-multiplier>1.00x</span><small data-cc-next>Next 1.01x</small></div>
      <div class="cc-step-pill" data-cc-step>0 / 24</div>
    </div>
    <div class="cc-message" data-cc-message>Choose a risk and start</div>
    <div class="cc-progress" data-cc-progress aria-hidden="true"></div>
    <div class="cc-controls">
      <div class="cc-controls-inner">
        <div class="cc-top-controls">
          <div>
            <div class="cc-label"><span>Difficulty</span><span data-cc-risk>4% risk / lane</span></div>
            <div class="cc-difficulty" data-cc-difficulty>
              <button type="button" class="active" data-cc-mode="easy">Easy</button>
              <button type="button" data-cc-mode="medium">Medium</button>
              <button type="button" data-cc-mode="hard">Hard</button>
              <button type="button" data-cc-mode="hardcore">Extreme</button>
            </div>
          </div>
          <div>
            <div class="cc-label"><span>Bet amount</span><span>TON</span></div>
            <div class="cc-bet">
              <button type="button" data-cc-half>1/2</button>
              <input data-cc-amount inputmode="decimal" pattern="[0-9.]*" value="0.1" aria-label="Bet amount in TON" />
              <button type="button" data-cc-double>2x</button>
            </div>
          </div>
        </div>
        <div class="cc-actions" data-cc-actions>
          <button type="button" class="cc-primary" data-cc-primary>Start crossing</button>
          <button type="button" class="cc-cashout" data-cc-cashout disabled>Cash out</button>
        </div>
        <div class="cc-proof" data-cc-proof><b>Provably fair</b> · seed commitment appears when the round starts</div>
      </div>
    </div>
  </div>
</section>
`;

export const CHICKEN_CROSS_SCRIPT = `
(function(){
  function init(){
    var root=document.getElementById('hilo');
    if(!root||root.dataset.ccReady==='1')return;
    root.dataset.ccReady='1';
    var canvas=root.querySelector('[data-cc-canvas]'),world=root.querySelector('[data-cc-world]'),loading=root.querySelector('[data-cc-loading]');
    if(!canvas||!world)return;
    var q=function(s){return root.querySelector(s)};
    var modes={easy:{steps:24,risk:4,survival:.96},medium:{steps:20,risk:9,survival:.91},hard:{steps:17,risk:16,survival:.84},hardcore:{steps:15,risk:28,survival:.72}};
    var mode='easy',round=null,busy=false,engine=null;
    var amount=q('[data-cc-amount]'),primary=q('[data-cc-primary]'),cashout=q('[data-cc-cashout]'),actions=q('[data-cc-actions]');
    var multi=q('[data-cc-multiplier]'),next=q('[data-cc-next]'),step=q('[data-cc-step]'),message=q('[data-cc-message]'),risk=q('[data-cc-risk]'),proof=q('[data-cc-proof]'),progress=q('[data-cc-progress]');
    function userId(){var tg=window.Telegram&&window.Telegram.WebApp;var user=tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user;var id=String(user&&user.id||'');if(id)return id;try{return String(localStorage.getItem('ownerId')||'')}catch(_){return ''}}
    function haptic(kind){var tg=window.Telegram&&window.Telegram.WebApp;try{if(tg&&tg.HapticFeedback){if(kind==='success'||kind==='error')tg.HapticFeedback.notificationOccurred(kind);else tg.HapticFeedback.impactOccurred(kind||'light')}}catch(_){}}
    function toNano(value){return Math.max(0,Math.floor((Number(String(value||'').replace(',','.'))||0)*1000000000))}
    function toTon(nano){var value=Math.max(0,Number(nano)||0)/1000000000;return value.toFixed(2).replace(/\\.00$/,'').replace(/(\\.\\d)0$/,'$1')}
    function fmt(value){return (Math.floor((Number(value)||1)*100)/100).toFixed(2)+'x'}
    function currentBalance(){return window.VexaTonBalance&&typeof window.VexaTonBalance.read==='function'?Math.max(0,Number(window.VexaTonBalance.read())||0):0}
    function writeBalance(value){if(window.VexaTonBalance&&typeof window.VexaTonBalance.write==='function'&&Number.isFinite(Number(value)))window.VexaTonBalance.write(Math.max(0,Math.floor(Number(value))),0)}
    async function api(path,body){var response=await fetch(path,{method:'POST',headers:{'content-type':'application/json','accept':'application/json'},body:JSON.stringify(body)});var data=await response.json().catch(function(){return null});if(!response.ok)throw new Error(data&&data.error||'Request failed');return data}
    function setMessage(text,type){message.textContent=text;message.classList.toggle('win',type==='win')}
    function setBusy(value){busy=!!value;renderUi()}
    function syncActive(){document.body.classList.toggle('cc-game-open',root.classList.contains('active'));if(engine&&engine.setActive)engine.setActive(root.classList.contains('active'))}
    function syncModeButtons(){root.querySelectorAll('[data-cc-mode]').forEach(function(button){button.classList.toggle('active',button.getAttribute('data-cc-mode')===mode);button.disabled=!!round||busy})}
    function multiplierAt(name,index){return Math.max(1.01,Math.floor((.96/Math.pow(modes[name].survival,Math.max(1,index)))*100)/100)}
    function buildProgress(){var count=(round&&round.maxSteps)||modes[mode].steps;var visible=Math.min(12,count);progress.innerHTML='';for(var i=0;i<visible;i++){var dot=document.createElement('i');var threshold=Math.ceil((i+1)*count/visible);if(round&&round.currentStep>=threshold)dot.className='done';progress.appendChild(dot)}}
    function renderUi(){
      var config=modes[mode],active=round&&round.status==='active',ended=round&&round.status!=='active';
      var current=round?Number(round.multiplier||1):1,currentStep=round?Number(round.currentStep||0):0,max=round?Number(round.maxSteps||config.steps):config.steps;
      multi.textContent=fmt(current);next.textContent=active&&round.nextMultiplier?'Next '+fmt(round.nextMultiplier):active?'Final lane':ended?(round.status==='lost'?'Round ended':'Paid '+fmt(current)):'Next '+fmt(multiplierAt(mode,1));
      step.textContent=currentStep+' / '+max;risk.textContent=config.risk+'% risk / lane';actions.classList.toggle('has-round',!!active);
      primary.textContent=active?'Cross next lane':busy?'Starting...':'Start crossing';primary.disabled=busy;cashout.disabled=busy||!active||currentStep<1;cashout.textContent=active&&currentStep>0?'Cash '+fmt(current):'Cash out';
      amount.disabled=!!active||busy;root.querySelector('[data-cc-half]').disabled=!!active||busy;root.querySelector('[data-cc-double]').disabled=!!active||busy;syncModeButtons();buildProgress();
      if(round&&round.seedHash)proof.innerHTML='<b>Provably fair</b> · '+String(round.seedHash).slice(0,24)+'…'+(round.serverSeed?' · revealed':'');else proof.innerHTML='<b>Provably fair</b> · seed commitment appears when the round starts';
    }
    function setRound(value){round=value||null;if(round){mode=round.difficulty||mode;if(engine)engine.setStep(Number(round.currentStep||0),false)}else if(engine)engine.reset();renderUi()}
    function validateBet(){var nano=toNano(amount.value);if(nano<=0){setMessage('Enter a valid bet','error');return 0}var balance=currentBalance();if(balance>0&&nano>balance){setMessage('Not enough TON','error');return 0}return nano}
    async function start(){if(busy||round&&round.status==='active')return;var id=userId(),bet=validateBet();if(!id){setMessage('Open inside Telegram','error');return}if(!bet)return;setBusy(true);setMessage('Creating secure round');try{if(window.VexaTonBalance&&typeof window.VexaTonBalance.flush==='function')await window.VexaTonBalance.flush();var data=await api('/app/api/chicken-cross/start',{userId:id,amountNano:bet,difficulty:mode});setRound(data.round);if(data.tonBalanceNano!==undefined)writeBalance(data.tonBalanceNano);setMessage(data.resumed?'Round restored':'Road is live — choose your step','win');haptic('medium')}catch(error){setMessage(String(error&&error.message||'Could not start'),'error');if(window.VexaTonBalance&&window.VexaTonBalance.load)window.VexaTonBalance.load()}finally{setBusy(false)}}
    async function cross(){if(busy||!round||round.status!=='active')return;setBusy(true);setMessage('Crossing lane…');var before=Number(round.currentStep||0);try{var data=await api('/app/api/chicken-cross/cross',{userId:userId(),roundId:round.id});round=data.round;mode=round.difficulty||mode;if(data.tonBalanceNano!==undefined)writeBalance(data.tonBalanceNano);if(data.event==='hit'){if(engine)engine.hit(Number(round.currentStep||before));root.classList.add('cc-hit');setTimeout(function(){root.classList.remove('cc-hit')},500);setMessage('Hit — round lost','error');haptic('error');renderUi();setTimeout(clearEnded,1500)}else{if(engine)engine.setStep(Number(round.currentStep||0),true);renderUi();if(data.event==='finish'){setMessage('Road cleared · '+fmt(round.multiplier),'win');haptic('success');setTimeout(clearEnded,1600)}else if(Number(round.currentStep)>before){setMessage('Safe · '+fmt(round.multiplier),'win');haptic('light')}}}catch(error){setMessage(String(error&&error.message||'Cross failed'),'error')}finally{setBusy(false)}}
    async function cash(){if(busy||!round||round.status!=='active'||round.currentStep<1)return;setBusy(true);setMessage('Locking payout…');try{var data=await api('/app/api/chicken-cross/cashout',{userId:userId(),roundId:round.id});round=data.round;if(data.tonBalanceNano!==undefined)writeBalance(data.tonBalanceNano);renderUi();setMessage('Cashed '+toTon(round.payoutNano)+' TON','win');haptic('success');setTimeout(clearEnded,1400)}catch(error){setMessage(String(error&&error.message||'Cash out failed'),'error')}finally{setBusy(false)}}
    function clearEnded(){if(round&&round.status!=='active'){round=null;if(engine)engine.reset();renderUi();setMessage('Choose a risk and start')}}
    function scaleBet(factor){if(round||busy)return;var nano=Math.max(10000000,Math.floor((toNano(amount.value)||100000000)*factor));var balance=currentBalance();if(balance>0)nano=Math.min(nano,balance);amount.value=toTon(nano)}
    function createEngine(THREE){
      var renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,alpha:false,powerPreference:'high-performance',precision:'highp'});
      renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
      var scene=new THREE.Scene();scene.background=new THREE.Color(0x050205);scene.fog=new THREE.FogExp2(0x050205,.026);
      var camera=new THREE.PerspectiveCamera(40,1,.1,145);camera.position.set(0,9.2,13.6);
      var clock=new THREE.Clock(),active=true,targetStep=0,shownStep=0,jumpStart=0,impactStart=0,LANE=2.35;
      var hemi=new THREE.HemisphereLight(0xffdce8,0x17030b,1.55);scene.add(hemi);
      var key=new THREE.DirectionalLight(0xffdce7,3.4);key.position.set(-7,14,10);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-13;key.shadow.camera.right=13;key.shadow.camera.top=18;key.shadow.camera.bottom=-8;key.shadow.camera.near=1;key.shadow.camera.far=55;key.shadow.bias=-.00035;scene.add(key,key.target);
      var rim=new THREE.DirectionalLight(0xb71954,2.8);rim.position.set(9,5,-14);scene.add(rim);
      var wineGlow=new THREE.PointLight(0xff286f,24,22,2);wineGlow.position.set(0,3,-8);scene.add(wineGlow);
      function mat(color,rough,metal,emissive){return new THREE.MeshPhysicalMaterial({color:color,roughness:rough,metalness:metal,clearcoat:.28,clearcoatRoughness:.32,emissive:emissive||0x000000,emissiveIntensity:emissive?1.2:0})}
      function makeRoadTexture(){var c=document.createElement('canvas');c.width=256;c.height=512;var x=c.getContext('2d'),image=x.createImageData(c.width,c.height);for(var p=0;p<image.data.length;p+=4){var grain=7+Math.floor(Math.random()*17);image.data[p]=grain+5;image.data[p+1]=grain;image.data[p+2]=grain+3;image.data[p+3]=255}x.putImageData(image,0,0);x.globalAlpha=.22;for(var n=0;n<90;n++){x.fillStyle=n%4?'#21151b':'#4a1b2e';x.fillRect(Math.random()*256,Math.random()*512,1+Math.random()*2,8+Math.random()*34)}var t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(5,18);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t}
      var roadTexture=makeRoadTexture(),roadMat=mat(0x171014,.54,.24);roadMat.map=roadTexture;roadMat.bumpMap=roadTexture;roadMat.bumpScale=.045;roadMat.needsUpdate=true;var lineMat=mat(0xe6dbe0,.48,.2),curbMat=mat(0x240a14,.6,.28),neonMat=mat(0x8b143f,.32,.36,0x6d082c);
      var road=new THREE.Mesh(new THREE.PlaneGeometry(25,82),roadMat);road.rotation.x=-Math.PI/2;road.position.set(0,0,-31);road.receiveShadow=true;scene.add(road);
      var shoulderGeo=new THREE.BoxGeometry(2.2,.18,82),leftShoulder=new THREE.Mesh(shoulderGeo,curbMat),rightShoulder=leftShoulder.clone();leftShoulder.position.set(-13.5,.05,-31);rightShoulder.position.set(13.5,.05,-31);leftShoulder.receiveShadow=rightShoulder.receiveShadow=true;scene.add(leftShoulder,rightShoulder);
      var railGeo=new THREE.BoxGeometry(.10,.10,82),railA=new THREE.Mesh(railGeo,neonMat),railB=railA.clone();railA.position.set(-12.4,.16,-31);railB.position.set(12.4,.16,-31);scene.add(railA,railB);
      var dashGeo=new THREE.BoxGeometry(1.05,.025,.10);for(var lane=0;lane<28;lane++){var z=-lane*LANE-LANE*.5;for(var dx=-9;dx<=9;dx+=3){var dash=new THREE.Mesh(dashGeo,lineMat);dash.position.set(dx,.025,z);dash.receiveShadow=true;scene.add(dash)}}
      var buildingMat=[mat(0x12070c,.82,.12),mat(0x200913,.72,.18),mat(0x0c080a,.9,.08)];
      for(var b=0;b<30;b++){var side=b%2?1:-1,w=2.4+(b%4)*.55,h=2.8+(b*7%9)*.72,d=2.2+(b%3)*.8;var building=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),buildingMat[b%3]);building.position.set(side*(15.2+(b%4)*1.2),h/2-.08,-(b*.94)-4);building.castShadow=true;building.receiveShadow=true;scene.add(building);if(b%2===0){var sign=new THREE.Mesh(new THREE.BoxGeometry(.08,.18,d*.66),neonMat);sign.position.set(building.position.x-side*(w/2+.05),h*.66,building.position.z);scene.add(sign)}}
      var starGeo=new THREE.BufferGeometry(),starPositions=[];for(var s=0;s<180;s++){starPositions.push((Math.random()-.5)*80,6+Math.random()*35,-Math.random()*110)}starGeo.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));var stars=new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xffb7cf,size:.07,transparent:true,opacity:.58,sizeAttenuation:true}));scene.add(stars);
      var bodyWhite=mat(0xf2e8eb,.72,.02),feather=mat(0xdcc8cf,.82,.01),red=mat(0x8f173e,.56,.08),beakMat=mat(0xd88f3c,.64,.04),eyeMat=mat(0x070306,.18,.56),legMat=mat(0xc68135,.62,.02);
      var chicken=new THREE.Group();
      function mesh(geometry,material,x,y,z,sx,sy,sz){var m=new THREE.Mesh(geometry,material);m.position.set(x||0,y||0,z||0);m.scale.set(sx||1,sy||1,sz||1);m.castShadow=true;m.receiveShadow=true;return m}
      var sphere24=new THREE.SphereGeometry(1,24,18),body=mesh(sphere24,bodyWhite,0,1.08,0,.78,1.0,.72),head=mesh(sphere24,bodyWhite,0,2.05,-.10,.55,.58,.55);chicken.add(body,head);
      var wingL=mesh(sphere24,feather,-.70,1.18,.02,.25,.62,.50),wingR=mesh(sphere24,feather,.70,1.18,.02,.25,.62,.50);wingL.rotation.z=.30;wingR.rotation.z=-.30;chicken.add(wingL,wingR);
      var eyeGeo=new THREE.SphereGeometry(.09,16,12),eyeL=mesh(eyeGeo,eyeMat,-.23,2.18,.40),eyeR=mesh(eyeGeo,eyeMat,.23,2.18,.40);chicken.add(eyeL,eyeR);
      var beak=mesh(new THREE.ConeGeometry(.20,.54,4),beakMat,0,1.98,.62);beak.rotation.x=Math.PI/2;beak.rotation.z=Math.PI/4;chicken.add(beak);
      for(var c=-1;c<=1;c++){var comb=mesh(new THREE.SphereGeometry(.16,16,12),red,c*.17,2.61-.04*Math.abs(c),-.06,1,1.1,.82);chicken.add(comb)}
      var wattle=mesh(new THREE.SphereGeometry(.13,14,10),red,.03,1.72,.45,.8,1.35,.72);chicken.add(wattle);
      for(var featherIndex=0;featherIndex<9;featherIndex++){var angle=(featherIndex/8)*Math.PI,frontFeather=mesh(new THREE.SphereGeometry(.16,14,10),feather,(Math.cos(angle)*.50),.78+Math.sin(angle)*.36,.57,.95,1.35,.45);frontFeather.rotation.z=-Math.cos(angle)*.35;chicken.add(frontFeather)}
      for(var tailIndex=-2;tailIndex<=2;tailIndex++){var tail=mesh(sphere24,feather,tailIndex*.22,1.36,-.60,.19,.60,.16);tail.rotation.z=-tailIndex*.22;tail.rotation.x=-.34;chicken.add(tail)}
      var legGeo=new THREE.CylinderGeometry(.045,.055,.46,10),legL=mesh(legGeo,legMat,-.24,.35,.02),legR=mesh(legGeo,legMat,.24,.35,.02);chicken.add(legL,legR);
      var footGeo=new THREE.BoxGeometry(.30,.045,.08),footL=mesh(footGeo,legMat,-.25,.12,.14),footR=mesh(footGeo,legMat,.25,.12,.14);chicken.add(footL,footR);chicken.scale.set(.83,.83,.83);chicken.position.set(0,.02,1.2);scene.add(chicken);
      var wheelGeo=new THREE.CylinderGeometry(.31,.31,.22,18),bodyGeo=new THREE.BoxGeometry(2.15,.55,1.05),cabinGeo=new THREE.BoxGeometry(1.12,.48,.96),glassMat=mat(0x190d16,.12,.62),tireMat=mat(0x050405,.88,.03);
      var colors=[0x741437,0x2b1721,0xa94a69,0x160e13,0x8d254d];
      function createCar(index){var group=new THREE.Group(),carBody=mesh(bodyGeo,mat(colors[index%colors.length],.36,.42),0,.52,0),cabin=mesh(cabinGeo,glassMat,-.13,.96,-.01);cabin.rotation.y=.02;group.add(carBody,cabin);var bumper=mesh(new THREE.BoxGeometry(2.24,.13,1.08),mat(0x160c10,.3,.72),0,.32,0);group.add(bumper);for(var wx=-.72;wx<=.72;wx+=1.44){for(var wz=-.52;wz<=.52;wz+=1.04){var wheel=mesh(wheelGeo,tireMat,wx,.28,wz);wheel.rotation.x=Math.PI/2;wheel.userData.wheel=true;group.add(wheel)}}var lightMat=mat(0xffd7e4,.18,.32,0xff6a9f);var l1=mesh(new THREE.SphereGeometry(.075,10,8),lightMat,-1.09,.57,-.30),l2=mesh(new THREE.SphereGeometry(.075,10,8),lightMat,-1.09,.57,.30);group.add(l1,l2);group.traverse(function(o){if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});return group}
      var cars=[];for(var i=0;i<26;i++){var car=createCar(i),direction=i%2?1:-1;car.userData={lane:i+1,speed:direction*(3.4+(i%5)*.62),offset:(i*3.73)%24-12};car.position.set(car.userData.offset,.02,-car.userData.lane*LANE);if(direction>0)car.rotation.y=Math.PI;scene.add(car);cars.push(car)}
      var impactCar=createCar(4);impactCar.visible=false;impactCar.scale.set(1.08,1.08,1.08);scene.add(impactCar);
      function resize(){var rect=world.getBoundingClientRect(),w=Math.max(1,rect.width),h=Math.max(1,rect.height);renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
      function setStep(value,animate){targetStep=Math.max(0,Number(value)||0);if(!animate)shownStep=targetStep;else jumpStart=performance.now();impactStart=0}
      function hit(value){targetStep=Math.max(0,Number(value)||0);impactStart=performance.now();impactCar.visible=true;impactCar.position.set(-11,.02,-targetStep*LANE);impactCar.rotation.y=Math.PI;haptic('heavy')}
      function reset(){targetStep=0;jumpStart=performance.now();impactStart=0;impactCar.visible=false}
      function setActive(value){active=!!value;if(active){clock.getDelta();resize()}}
      function animate(){requestAnimationFrame(animate);if(!active||document.hidden)return;var dt=Math.min(.033,clock.getDelta()),time=performance.now();shownStep+=(targetStep-shownStep)*(1-Math.pow(.0008,dt));var chickenZ=1.2-shownStep*LANE;chicken.position.z=chickenZ;
        var jump=0;if(jumpStart){var jp=Math.min(1,(time-jumpStart)/620);jump=Math.sin(jp*Math.PI)*.86;if(jp>=1)jumpStart=0}chicken.position.y=.02+jump;chicken.rotation.y=Math.sin(time*.0024)*.055;wingL.rotation.z=.30+jump*.42;wingR.rotation.z=-.30-jump*.42;head.position.y=2.05+Math.sin(time*.004)*.035;
        cars.forEach(function(car){car.position.x+=car.userData.speed*dt;if(car.userData.speed>0&&car.position.x>15)car.position.x=-15;if(car.userData.speed<0&&car.position.x<-15)car.position.x=15;car.children.forEach(function(child){if(child.userData&&child.userData.wheel)child.rotation.y+=Math.abs(car.userData.speed)*dt*1.5})});
        if(impactStart){var p=(time-impactStart)/900;impactCar.position.x=-11+p*22;impactCar.position.z=chickenZ;if(p>.38){var impact=Math.min(1,(p-.38)/.42);chicken.rotation.z=-impact*1.35;chicken.rotation.x=impact*.48;chicken.position.x=impact*2.4;chicken.position.y=.02+Math.sin(Math.min(1,impact)*Math.PI)*1.1}if(p>=1){impactStart=0;impactCar.visible=false}}
        else{chicken.rotation.z*=.88;chicken.rotation.x*=.88;chicken.position.x*=.84}
        var desiredZ=chickenZ+14.5;camera.position.z+=(desiredZ-camera.position.z)*(1-Math.pow(.012,dt));camera.position.x+=(Math.sin(time*.00036)*.28-camera.position.x)*(1-Math.pow(.05,dt));camera.lookAt(0,1.05,chickenZ-5.8);wineGlow.position.z=chickenZ-5;key.position.z=chickenZ+9;key.target.position.set(0,0,chickenZ-5);stars.rotation.y+=dt*.004;renderer.render(scene,camera)}
      if(window.ResizeObserver)new ResizeObserver(resize).observe(world);else window.addEventListener('resize',resize);resize();animate();
      return{setStep:setStep,hit:hit,reset:reset,setActive:setActive};
    }
    root.querySelectorAll('[data-cc-mode]').forEach(function(button){button.addEventListener('click',function(){if(round||busy)return;mode=button.getAttribute('data-cc-mode')||'easy';renderUi();haptic('light')})});
    primary.addEventListener('click',function(){if(round&&round.status==='active')cross();else start()});cashout.addEventListener('click',cash);root.querySelector('[data-cc-half]').addEventListener('click',function(){scaleBet(.5)});root.querySelector('[data-cc-double]').addEventListener('click',function(){scaleBet(2)});amount.addEventListener('blur',function(){if(toNano(amount.value)<=0)amount.value='0.1'});
    new MutationObserver(syncActive).observe(root,{attributes:true,attributeFilter:['class']});syncActive();renderUi();
    import('/assets/three.module.min.js').then(function(THREE){engine=createEngine(THREE);loading.classList.add('ready');if(round)engine.setStep(Number(round.currentStep||0),false);syncActive()}).catch(function(){loading.textContent='3D engine unavailable';setMessage('Could not load 3D world','error')});
    var id=userId();if(id)fetch('/app/api/chicken-cross/state?userId='+encodeURIComponent(id),{cache:'no-store'}).then(function(r){return r.json()}).then(function(data){if(data&&data.round){setRound(data.round);setMessage('Round restored','win')}}).catch(function(){});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
`;
