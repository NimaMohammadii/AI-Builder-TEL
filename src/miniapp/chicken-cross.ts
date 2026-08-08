export const CHICKEN_CROSS_STYLES = `
#hilo{--cc-wine:#5a0b27;--cc-rose:#f15b91;--cc-ink:#070306;padding:0 0 calc(112px + env(safe-area-inset-bottom));overflow-x:hidden;background:
radial-gradient(circle at 50% 16%,rgba(112,13,48,.20),transparent 36%),linear-gradient(180deg,#090407 0%,#030203 78%)}
#hilo.active{display:block}
#hilo .cc-page{width:min(100%,520px);margin:0 auto;padding:8px 14px 26px;box-sizing:border-box}
#hilo .cc-stage{position:relative;height:clamp(330px,48vh,455px);min-height:330px;overflow:hidden;border-radius:30px;border:1px solid rgba(255,255,255,.09);background:#050204;box-shadow:0 28px 70px rgba(0,0,0,.58),inset 0 1px 0 rgba(255,255,255,.07);isolation:isolate}
#hilo .cc-stage:before{content:'';position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(180deg,rgba(8,1,4,.04),transparent 48%,rgba(4,1,2,.48));box-shadow:inset 0 -32px 56px rgba(0,0,0,.24)}
#hilo canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
#hilo .cc-stage-hud{position:absolute;z-index:4;inset:16px 16px auto;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;pointer-events:none}
#hilo .cc-multi{font-size:34px;font-weight:950;line-height:1;letter-spacing:-.05em;color:#fff;text-shadow:0 0 25px rgba(241,91,145,.32),0 8px 22px rgba(0,0,0,.72)}
#hilo .cc-multi small{display:block;margin-top:6px;color:rgba(255,255,255,.48);font-size:9px;font-weight:850;letter-spacing:.13em;text-transform:uppercase}
#hilo .cc-step-pill{height:34px;padding:0 13px;border-radius:999px;display:flex;align-items:center;background:rgba(9,3,6,.44);border:1px solid rgba(255,255,255,.10);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:rgba(255,255,255,.78);font-size:11px;font-weight:900}
#hilo .cc-stage-message{position:absolute;z-index:5;left:50%;bottom:20px;transform:translateX(-50%);min-width:132px;max-width:82%;padding:9px 15px;border-radius:999px;text-align:center;color:rgba(255,255,255,.78);font-size:11px;font-weight:850;background:rgba(7,2,5,.54);border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);transition:opacity .2s ease,transform .2s ease}
#hilo .cc-stage-message.win{color:#ffd8e6;border-color:rgba(241,91,145,.28);box-shadow:0 0 22px rgba(153,18,64,.16)}
#hilo .cc-progress{display:flex;align-items:center;gap:5px;height:22px;margin:12px 5px 2px;overflow:hidden}
#hilo .cc-progress i{height:4px;flex:1;border-radius:999px;background:rgba(255,255,255,.075);transition:background .22s ease,box-shadow .22s ease,transform .22s ease}
#hilo .cc-progress i.done{background:linear-gradient(90deg,#741133,#ef6496);box-shadow:0 0 10px rgba(238,77,133,.32);transform:scaleY(1.25)}
#hilo .cc-panel{margin-top:8px;padding:16px;border-radius:28px;background:rgba(18,7,12,.72);border:1px solid rgba(255,255,255,.09);box-shadow:inset 0 1px 0 rgba(255,255,255,.055),0 20px 50px rgba(0,0,0,.28);backdrop-filter:blur(18px) saturate(1.08);-webkit-backdrop-filter:blur(18px) saturate(1.08)}
#hilo .cc-label{display:flex;justify-content:space-between;align-items:center;margin:0 3px 9px;color:rgba(255,255,255,.52);font-size:10px;font-weight:850;letter-spacing:.07em;text-transform:uppercase}
#hilo .cc-difficulty{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:15px}
#hilo .cc-difficulty button{height:37px;padding:0 3px;border-radius:13px;border:1px solid rgba(255,255,255,.075);background:rgba(255,255,255,.025);color:rgba(255,255,255,.48);font-size:10px;font-weight:900;transition:.18s ease}
#hilo .cc-difficulty button.active{color:#fff;background:linear-gradient(180deg,rgba(113,17,51,.88),rgba(55,5,23,.94));border-color:rgba(255,175,204,.22);box-shadow:inset 0 1px 0 rgba(255,255,255,.10),0 8px 22px rgba(78,5,31,.26)}
#hilo .cc-difficulty button:disabled{opacity:.42}
#hilo .cc-bet{display:grid;grid-template-columns:70px minmax(0,1fr) 70px;gap:8px}
#hilo .cc-bet button,#hilo .cc-bet input{height:48px;min-width:0;border-radius:17px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.025);color:#fff;text-align:center;font-size:16px;font-weight:950;outline:none;box-sizing:border-box}
#hilo .cc-bet button{font-size:12px;color:rgba(255,255,255,.68)}
#hilo .cc-actions{display:grid;grid-template-columns:1fr;gap:8px;margin-top:12px}
#hilo .cc-actions.has-round{grid-template-columns:1.25fr .75fr}
#hilo .cc-primary,#hilo .cc-cashout{height:57px;border:0;border-radius:19px;font-size:16px;font-weight:950;letter-spacing:-.02em;transition:transform .12s ease,opacity .18s ease}
#hilo .cc-primary{color:#16040a;background:linear-gradient(180deg,#fff7fa,#decdd3);box-shadow:0 12px 26px rgba(0,0,0,.30),inset 0 1px 0 #fff}
#hilo .cc-actions.has-round .cc-primary{color:#fff;background:linear-gradient(180deg,#9b244e,#5b0b29);box-shadow:0 12px 30px rgba(78,4,31,.34),inset 0 1px 0 rgba(255,255,255,.16)}
#hilo .cc-cashout{display:none;color:#fff;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.11)}
#hilo .cc-actions.has-round .cc-cashout{display:block}
#hilo button:active{transform:scale(.97)}
#hilo button:disabled,#hilo input:disabled{opacity:.42;transform:none}
#hilo .cc-proof{margin:11px 4px 0;color:rgba(255,255,255,.28);font-size:9px;line-height:1.45;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#hilo .cc-proof b{color:rgba(255,255,255,.45);font-weight:800}
#hilo.cc-hit .cc-stage{animation:ccHit .42s ease}
@keyframes ccHit{0%,100%{transform:translateX(0);filter:none}25%{transform:translateX(-7px);filter:saturate(1.35)}55%{transform:translateX(6px)}78%{transform:translateX(-3px)}}
@media(max-height:700px){#hilo .cc-stage{height:326px}#hilo .cc-page{padding-top:4px}#hilo .cc-panel{padding:13px}#hilo .cc-difficulty{margin-bottom:11px}}
@media(prefers-reduced-motion:reduce){#hilo *{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;

export const CHICKEN_CROSS_SECTION = `
<section id="hilo" class="view chicken-cross-view" aria-label="Chicken Cross">
  <div class="cc-page">
    <div class="cc-stage" data-cc-stage>
      <canvas data-cc-canvas aria-label="Animated road with a chicken crossing traffic"></canvas>
      <div class="cc-stage-hud">
        <div class="cc-multi"><span data-cc-multiplier>1.00x</span><small data-cc-next>Next 1.01x</small></div>
        <div class="cc-step-pill" data-cc-step>0 / 24</div>
      </div>
      <div class="cc-stage-message" data-cc-message>Choose a risk and start</div>
    </div>
    <div class="cc-progress" data-cc-progress aria-hidden="true"></div>
    <div class="cc-panel">
      <div class="cc-label"><span>Difficulty</span><span data-cc-risk>4% risk / lane</span></div>
      <div class="cc-difficulty" data-cc-difficulty>
        <button type="button" class="active" data-cc-mode="easy">Easy</button>
        <button type="button" data-cc-mode="medium">Medium</button>
        <button type="button" data-cc-mode="hard">Hard</button>
        <button type="button" data-cc-mode="hardcore">Extreme</button>
      </div>
      <div class="cc-label"><span>Bet amount</span><span>TON</span></div>
      <div class="cc-bet">
        <button type="button" data-cc-half>1/2</button>
        <input data-cc-amount inputmode="decimal" pattern="[0-9.]*" value="0.1" aria-label="Bet amount in TON" />
        <button type="button" data-cc-double>2x</button>
      </div>
      <div class="cc-actions" data-cc-actions>
        <button type="button" class="cc-primary" data-cc-primary>Start crossing</button>
        <button type="button" class="cc-cashout" data-cc-cashout disabled>Cash out</button>
      </div>
      <div class="cc-proof" data-cc-proof><b>Provably fair</b> · seed commitment appears when the round starts</div>
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
    var canvas=root.querySelector('[data-cc-canvas]'),stage=root.querySelector('[data-cc-stage]');
    var ctx=canvas&&canvas.getContext?canvas.getContext('2d',{alpha:false}):null;
    if(!canvas||!stage||!ctx)return;
    var q=function(s){return root.querySelector(s)};
    var modes={easy:{steps:24,risk:4,survival:.96},medium:{steps:20,risk:9,survival:.91},hard:{steps:17,risk:16,survival:.84},hardcore:{steps:15,risk:28,survival:.72}};
    var mode='easy',round=null,busy=false,displayStep=0,targetStep=0,hitUntil=0,lastTime=performance.now(),cars=[],stars=[],cssW=1,cssH=1,dpr=1;
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
    function syncModeButtons(){root.querySelectorAll('[data-cc-mode]').forEach(function(button){button.classList.toggle('active',button.getAttribute('data-cc-mode')===mode);button.disabled=!!round||busy})}
    function multiplierAt(name,index){return Math.max(1.01,Math.floor((.96/Math.pow(modes[name].survival,Math.max(1,index)))*100)/100)}
    function buildProgress(){var count=(round&&round.maxSteps)||modes[mode].steps;var visible=Math.min(12,count);progress.innerHTML='';for(var i=0;i<visible;i++){var dot=document.createElement('i');var threshold=Math.ceil((i+1)*count/visible);if(round&&round.currentStep>=threshold)dot.className='done';progress.appendChild(dot)}}
    function renderUi(){
      var config=modes[mode],active=round&&round.status==='active',ended=round&&round.status!=='active';
      var current=round?Number(round.multiplier||1):1,currentStep=round?Number(round.currentStep||0):0,max=round?Number(round.maxSteps||config.steps):config.steps;
      multi.textContent=fmt(current);next.textContent=active&&round.nextMultiplier?'Next '+fmt(round.nextMultiplier):active?'Final lane':ended?(round.status==='lost'?'Round ended':'Paid '+fmt(current)):'Next '+fmt(multiplierAt(mode,1));
      step.textContent=currentStep+' / '+max;risk.textContent=config.risk+'% risk / lane';
      actions.classList.toggle('has-round',!!active);primary.textContent=active?'Cross next lane':busy?'Starting...':'Start crossing';
      primary.disabled=busy;cashout.disabled=busy||!active||currentStep<1;cashout.textContent=active&&currentStep>0?'Cash '+fmt(current):'Cash out';
      amount.disabled=!!active||busy;root.querySelector('[data-cc-half]').disabled=!!active||busy;root.querySelector('[data-cc-double]').disabled=!!active||busy;
      syncModeButtons();buildProgress();
      if(round&&round.seedHash)proof.innerHTML='<b>Provably fair</b> · '+String(round.seedHash).slice(0,24)+'…'+(round.serverSeed?' · revealed':'');
      else proof.innerHTML='<b>Provably fair</b> · seed commitment appears when the round starts';
    }
    function setRound(value){round=value||null;if(round){mode=round.difficulty||mode;targetStep=Number(round.currentStep||0);if(Math.abs(displayStep-targetStep)>3)displayStep=targetStep;if(round.status==='lost')hitUntil=performance.now()+1000}else{targetStep=0;displayStep=0}renderUi()}
    function validateBet(){var nano=toNano(amount.value);if(nano<=0){setMessage('Enter a valid bet','error');return 0}var balance=currentBalance();if(balance>0&&nano>balance){setMessage('Not enough TON','error');return 0}return nano}
    async function start(){if(busy||round&&round.status==='active')return;var id=userId(),bet=validateBet();if(!id){setMessage('Open inside Telegram','error');return}if(!bet)return;setBusy(true);setMessage('Creating secure round');try{if(window.VexaTonBalance&&typeof window.VexaTonBalance.flush==='function')await window.VexaTonBalance.flush();var data=await api('/app/api/chicken-cross/start',{userId:id,amountNano:bet,difficulty:mode});setRound(data.round);if(data.tonBalanceNano!==undefined)writeBalance(data.tonBalanceNano);setMessage(data.resumed?'Round restored':'Road is live — choose your step','win');haptic('medium')}catch(error){setMessage(String(error&&error.message||'Could not start'),'error');if(window.VexaTonBalance&&window.VexaTonBalance.load)window.VexaTonBalance.load()}finally{setBusy(false)}}
    async function cross(){if(busy||!round||round.status!=='active')return;setBusy(true);setMessage('Crossing lane…');var before=Number(round.currentStep||0);try{var data=await api('/app/api/chicken-cross/cross',{userId:userId(),roundId:round.id});setRound(data.round);if(data.tonBalanceNano!==undefined)writeBalance(data.tonBalanceNano);if(data.event==='hit'){root.classList.add('cc-hit');setTimeout(function(){root.classList.remove('cc-hit')},500);setMessage('Hit — round lost','error');haptic('error');setTimeout(clearEnded,1250)}else if(data.event==='finish'){setMessage('Road cleared · '+fmt(data.round.multiplier),'win');haptic('success');setTimeout(clearEnded,1400)}else if(Number(data.round.currentStep)>before){setMessage('Safe · '+fmt(data.round.multiplier),'win');haptic('light')}}catch(error){setMessage(String(error&&error.message||'Cross failed'),'error')}finally{setBusy(false)}}
    async function cash(){if(busy||!round||round.status!=='active'||round.currentStep<1)return;setBusy(true);setMessage('Locking payout…');try{var data=await api('/app/api/chicken-cross/cashout',{userId:userId(),roundId:round.id});setRound(data.round);if(data.tonBalanceNano!==undefined)writeBalance(data.tonBalanceNano);setMessage('Cashed '+toTon(data.round.payoutNano)+' TON','win');haptic('success');setTimeout(clearEnded,1250)}catch(error){setMessage(String(error&&error.message||'Cash out failed'),'error')}finally{setBusy(false)}}
    function clearEnded(){if(round&&round.status!=='active'){round=null;targetStep=0;setTimeout(function(){displayStep=0},300);renderUi();setMessage('Choose a risk and start')}}
    function scaleBet(factor){if(round||busy)return;var nano=Math.max(10000000,Math.floor((toNano(amount.value)||100000000)*factor));var balance=currentBalance();if(balance>0)nano=Math.min(nano,balance);amount.value=toTon(nano)}
    function resize(){var rect=stage.getBoundingClientRect();cssW=Math.max(1,rect.width);cssH=Math.max(1,rect.height);dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.round(cssW*dpr);canvas.height=Math.round(cssH*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);seedScene()}
    function seedScene(){cars=[];stars=[];for(var i=0;i<8;i++){cars.push({lane:i,speed:(i%2?1:-1)*(25+((i*17)%38)),offset:(i*79)%420,color:i%3===0?'#842142':i%3===1?'#2a111b':'#bb4a70'})}for(var j=0;j<26;j++)stars.push({x:(j*83)%997/997,y:(j*47)%431/431,a:.12+(j%5)*.035})}
    function roundRect(x,y,w,h,r){var rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath()}
    function drawBackground(time){
      var g=ctx.createLinearGradient(0,0,0,cssH);g.addColorStop(0,'#17060d');g.addColorStop(.38,'#090307');g.addColorStop(1,'#020102');ctx.fillStyle=g;ctx.fillRect(0,0,cssW,cssH);
      var glow=ctx.createRadialGradient(cssW*.5,cssH*.22,0,cssW*.5,cssH*.22,cssW*.62);glow.addColorStop(0,'rgba(111,14,47,.28)');glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,cssW,cssH*.8);
      stars.forEach(function(s){ctx.globalAlpha=s.a*(.72+.28*Math.sin(time*.001+s.x*18));ctx.fillStyle='#ffd8e7';ctx.fillRect(s.x*cssW,s.y*cssH*.54,1.2,1.2)});ctx.globalAlpha=1;
    }
    function laneY(index){var visible=7.2;var relative=index-displayStep;return cssH*.74-relative*(cssH*.58/visible)}
    function drawRoad(time){
      var laneH=cssH*.58/7.2;for(var i=-1;i<9;i++){var absolute=Math.floor(displayStep)+i-2;var y=laneY(absolute);if(y<-laneH||y>cssH+laneH)continue;var shade=(absolute%2+2)%2;ctx.fillStyle=shade?'rgba(22,10,15,.96)':'rgba(11,7,9,.98)';ctx.fillRect(0,y-laneH*.47,cssW,laneH*.94);ctx.strokeStyle='rgba(255,255,255,.055)';ctx.lineWidth=1;ctx.setLineDash([18,18]);ctx.beginPath();ctx.moveTo(0,y+laneH*.46);ctx.lineTo(cssW,y+laneH*.46);ctx.stroke();ctx.setLineDash([]);
        var marker=absolute+1;if(marker>0){ctx.fillStyle='rgba(244,105,154,.25)';ctx.font='800 9px system-ui';ctx.fillText(String(marker),9,y+3)}
      }
      cars.forEach(function(car,index){var lane=Math.floor(displayStep)+car.lane-3;var y=laneY(lane);if(y<65||y>cssH-20)return;var direction=car.speed>0?1:-1;var travel=((time*.001*Math.abs(car.speed)+car.offset)%(cssW+120))-60;var x=direction>0?travel:cssW-travel;drawCar(x,y,direction,car.color,index)});
    }
    function drawCar(x,y,direction,color,index){var w=46+(index%3)*5,h=19;ctx.save();ctx.translate(x,y);ctx.scale(direction,1);ctx.shadowColor='rgba(241,73,133,.22)';ctx.shadowBlur=13;ctx.fillStyle=color;roundRect(-w/2,-h/2,w,h,6);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='rgba(255,235,242,.20)';roundRect(-w*.17,-h*.37,w*.35,h*.42,3);ctx.fill();ctx.fillStyle='#f8d7e2';ctx.globalAlpha=.8;ctx.fillRect(w*.35,-h*.3,4,3);ctx.globalAlpha=1;ctx.fillStyle='#080407';ctx.beginPath();ctx.arc(-w*.28,h*.48,4,0,Math.PI*2);ctx.arc(w*.28,h*.48,4,0,Math.PI*2);ctx.fill();ctx.restore()}
    function drawChicken(time){var y=laneY(Math.round(displayStep));var x=cssW*.5;var hop=round&&round.status==='active'?Math.abs(Math.sin(time*.007))*2:Math.sin(time*.003)*1.3;var hit=performance.now()<hitUntil;ctx.save();ctx.translate(x+(hit?Math.sin(time*.08)*8:0),y-16-hop);var scale=Math.max(.82,Math.min(1.12,cssW/390));ctx.scale(scale,scale);ctx.shadowColor='rgba(0,0,0,.65)';ctx.shadowBlur=18;ctx.shadowOffsetY=12;ctx.fillStyle='#f2e8eb';ctx.beginPath();ctx.ellipse(0,2,18,20,0,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#fff8fa';ctx.beginPath();ctx.arc(0,-13,13,0,Math.PI*2);ctx.fill();ctx.fillStyle='#8f173d';ctx.beginPath();ctx.arc(-7,-25,4,0,Math.PI*2);ctx.arc(0,-27,4.5,0,Math.PI*2);ctx.arc(7,-24,3.8,0,Math.PI*2);ctx.fill();ctx.fillStyle='#e5a447';ctx.beginPath();ctx.moveTo(10,-13);ctx.lineTo(21,-8);ctx.lineTo(10,-5);ctx.closePath();ctx.fill();ctx.fillStyle='#13070c';ctx.beginPath();ctx.arc(5,-15,2.4,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(110,14,48,.72)';ctx.beginPath();ctx.ellipse(-16,2,8,12,-.45,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#d29b55';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-6,20);ctx.lineTo(-8,27);ctx.moveTo(6,20);ctx.lineTo(8,27);ctx.stroke();ctx.restore()}
    function frame(time){var dt=Math.min(.04,(time-lastTime)/1000);lastTime=time;var speed=1-Math.pow(.001,dt);displayStep+=(targetStep-displayStep)*speed;drawBackground(time);drawRoad(time);drawChicken(time);requestAnimationFrame(frame)}
    root.querySelectorAll('[data-cc-mode]').forEach(function(button){button.addEventListener('click',function(){if(round||busy)return;mode=button.getAttribute('data-cc-mode')||'easy';renderUi();haptic('light')})});
    primary.addEventListener('click',function(){if(round&&round.status==='active')cross();else start()});cashout.addEventListener('click',cash);root.querySelector('[data-cc-half]').addEventListener('click',function(){scaleBet(.5)});root.querySelector('[data-cc-double]').addEventListener('click',function(){scaleBet(2)});
    amount.addEventListener('blur',function(){if(toNano(amount.value)<=0)amount.value='0.1'});
    if(window.ResizeObserver)new ResizeObserver(resize).observe(stage);else window.addEventListener('resize',resize);resize();renderUi();requestAnimationFrame(frame);
    var id=userId();if(id)fetch('/app/api/chicken-cross/state?userId='+encodeURIComponent(id),{cache:'no-store'}).then(function(r){return r.json()}).then(function(data){if(data&&data.round){setRound(data.round);setMessage('Round restored','win')}}).catch(function(){});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
`;
