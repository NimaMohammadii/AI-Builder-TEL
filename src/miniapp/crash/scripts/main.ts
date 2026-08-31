export const CRASH_SCRIPT = `
(function(){
  var UNIT=1000000000, MIN_BET_NANO=10000000, MAX_MULTIPLIER=50, LOW_TAIL_EXP=1.537243573680482, HIGH_TAIL_EXP=3.26941239209809, WAIT_BETWEEN_MS=10000, CRASH_HOLD_MS=2200, MAX_RUN_MS=68000, DAY_MS=86400000;
  var activeBet=null, settledRoundId=null, currentRoundId=-1, current=1, lastHistoryId=null, scheduleCache=null, crashFrame=0, crashIdleTimer=0, roundEndSignalId=null, lastActiveRender=0, lastRocketSpin=-1, rocketDriftReady=false, lastRenderState='', lastRocketTurnAt=0, rocketTurnRad=0;
  function q(id){return document.getElementById(id)}
  function setText(node,text){if(node&&node.textContent!==text)node.textContent=text}
  function setVar(node,name,value){if(!node)return;var cache=node.__vexaCrashVars||(node.__vexaCrashVars={});if(cache[name]===value)return;cache[name]=value;node.style.setProperty(name,value)}
  function show(text){var n=q('toast');if(!n)return;n.textContent=text;n.style.display='block';setTimeout(function(){n.style.display='none'},2200)}
  function balance(){return window.VexaTonBalance?Math.max(0,Math.floor(Number(window.VexaTonBalance.read())||0)):0}
  function change(delta){var value=Math.floor(Number(delta)||0);if(window.VexaTonBalance&&typeof window.VexaTonBalance.read==='function'&&typeof window.VexaTonBalance.write==='function'){window.VexaTonBalance.write(Math.max(0,balance()+value),value,false);return}window.dispatchEvent(new CustomEvent('vexa-ton-balance-game-change',{detail:{deltaNano:value,section:'crash'}}))}
  function emitBet(roundId,amountNano){try{window.dispatchEvent(new CustomEvent('vexa-crash-bet',{detail:{roundId:roundId,amountNano:amountNano}}))}catch(e){}}
  function emitLoss(roundId,multiplier){try{window.dispatchEvent(new CustomEvent('vexa-crash-lost',{detail:{roundId:roundId,multiplier:Number(multiplier)||1}}))}catch(e){}}
  function toNano(value){return Math.max(0,Math.floor((Number(String(value||'').replace(/,/g,'.'))||0)*UNIT))}
  function toTon(nano){var v=Math.max(0,Math.floor(Number(nano)||0))/UNIT;return v.toFixed(2)}
  function normalizeAmount(){var input=q('crashAmount');var n=toNano(input&&input.value);if(n<MIN_BET_NANO)n=MIN_BET_NANO;if(input){input.setAttribute('step','0.01');input.setAttribute('inputmode','decimal');input.value=toTon(n)}return n}
  function normalizeAutoCashout(){var input=q('crashAutoCashout');if(!input)return 0;var v=Number(String(input.value||'').replace(/,/g,'.'))||0;if(v>0&&v<1.01)v=1.01;if(v>MAX_MULTIPLIER)v=MAX_MULTIPLIER;if(input.value&&String(input.value)!==String(v))input.value=v.toFixed(2).replace(/\.00$/,'');return v>=1.01?v:0}
  function fmt(v){return Math.max(1,Math.min(MAX_MULTIPLIER,Number(v)||1)).toFixed(2)+'x'}
  function status(text){setText(q('crashStatus'),text)}
  function mult(v){var text=fmt(v);setText(q('crashMultiplier'),text);setText(q('crashPanelMultiplier'),text)}
  function nextLabel(text){setText(q('crashNextRound'),text)}
  function setCountdown(text,hide){var box=q('crashStarting');setText(q('crashCountdown'),text);if(box){var shouldHide=!!hide;if(box.classList.contains('hidden')!==shouldHide)box.classList.toggle('hidden',shouldHide)}}
  function setTotal(seconds){setText(q('crashTotalTime'),'Total '+Math.max(0,Math.floor(seconds))+'s')}
  function seeded(seed){var x=Math.sin(seed*9301.777+49297.31)*233280;return x-Math.floor(x)}
  function rawRoundStop(roundId){var r=Math.max(.000001,seeded(roundId)),raw;if(r<.0005)raw=MAX_MULTIPLIER;else if(r<.01)raw=20*Math.pow(.01/r,1/HIGH_TAIL_EXP);else raw=Math.pow(1/r,1/LOW_TAIL_EXP);return Math.max(1,Math.min(MAX_MULTIPLIER,Math.floor(raw*100)/100))}
  function multAt(seconds){return Math.exp(Math.max(0,seconds)*.06)}
  function maxReachableStop(){return Math.floor(multAt(MAX_RUN_MS/1000)*100)/100}
  function roundStop(roundId){return Math.min(rawRoundStop(roundId),maxReachableStop())}
  function stopTime(stop){var target=Math.max(1,Number(stop)||1),lo=0,hi=MAX_RUN_MS;for(var i=0;i<24;i++){var mid=(lo+hi)/2;if(multAt(mid/1000)>=target)hi=mid;else lo=mid}return hi}
  function cycleFor(id){var stop=roundStop(id);var runMs=Math.max(1100,stopTime(stop));return{id:id,stop:stop,runMs:runMs,cycleMs:runMs+WAIT_BETWEEN_MS}}
  function locateRound(now){var dayStart=Math.floor(now/DAY_MS)*DAY_MS,baseId=Math.floor(dayStart/1000);if(!scheduleCache||scheduleCache.dayStart!==dayStart||now<scheduleCache.start){scheduleCache={dayStart:dayStart,baseId:baseId,localId:0,start:dayStart,cycle:cycleFor(baseId)}}while(now>=scheduleCache.start+scheduleCache.cycle.cycleMs){scheduleCache.start+=scheduleCache.cycle.cycleMs;scheduleCache.localId++;scheduleCache.cycle=cycleFor(scheduleCache.baseId+scheduleCache.localId)}var c=scheduleCache.cycle,local=now-scheduleCache.start,running=local<c.runMs,waitElapsed=running?0:local-c.runMs,nextIn=running?0:Math.max(0,WAIT_BETWEEN_MS-waitElapsed),inCrashHold=!running&&waitElapsed<CRASH_HOLD_MS;return{id:c.id,start:scheduleCache.start,local:local,runElapsed:Math.min(local,c.runMs),waitElapsed:waitElapsed,stop:c.stop,runMs:c.runMs,running:running,waiting:!running,inCrashHold:inCrashHold,nextIn:nextIn}}
  function previousRoundIds(state,count){var ids=[];for(var id=state.id-(state.waiting?0:1);ids.length<count;id--)ids.push(id);return ids}
  function targetBetRoundId(state){return state.waiting?state.id+1:state.id}
  function speedBoost(value){var v=Math.max(1,Number(value)||1);if(v>=2.2)return 3;if(v<1.4){var t=(v-1)/.4;return 1+t*t*(3-2*t)}var t=(v-1.4)/.8;return 2+t*t*(3-2*t)}
  function setRocket(value,state,entryElapsed){
    var flight=q('crashRocketFlight');if(!flight)return;
    var v=Math.max(1,Number(value)||1),raw=Math.max(0,v-1);
    var running=state==='running',crashed=state==='crashed',thrust=running?.66+Math.min(.52,raw*.04):.18;
    var turn=state==='waiting'?0:1-Math.exp(-Math.max(0,v-2.2)*.18),angle=Math.max(60,Math.min(80,80-(20*turn)));
    var spinProgress=running?Math.max(0,Math.min(1,(v-1.7)/2.3)):0;
    var travel=Math.min(560,Math.max(280,(window.innerWidth||360)-32))*.58,entryX=0;
    if(state==='waiting'){
      var entryT=Math.max(0,Math.min(1,(Number(entryElapsed)||0)/1100)),entryEase=1-Math.pow(1-entryT,4);
      entryX=-travel*(1-entryEase);
    }
    setVar(flight,'--rocket-angle',angle.toFixed(2)+'deg');
    setVar(flight,'--rocket-entry-x',entryX.toFixed(2)+'px');
    setVar(flight,'--rocket-thrust',crashed?'0':thrust.toFixed(3));
    if(!rocketDriftReady){
      rocketDriftReady=true;
      setVar(flight,'--rocket-drift-duration','6.4s');
    }
    var driftT=running?Math.max(0,Math.min(1,(v-1.7)/.1)):0,driftMix=driftT*driftT*(3-2*driftT),shake=12+24*driftMix,mid50=shake*(1-(2/3)*driftMix),mid75=shake*driftMix;
    setVar(flight,'--rocket-shake',shake.toFixed(2)+'px');
    setVar(flight,'--rocket-mid-50',mid50.toFixed(2)+'px');
    setVar(flight,'--rocket-mid-75',mid75.toFixed(2)+'px');
    var motionState=running&&v>=1.8?'boost':'calm';
    if(flight.getAttribute('data-motion')!==motionState)flight.setAttribute('data-motion',motionState);
    var rocket=q('crashRocket'),spinCurve=1-Math.pow(1-spinProgress,2),baseSpin=running?18+spinCurve*162:18,axisSpinBoost=v>=8?4:v>=5?2.5:1,spin=running?baseSpin*speedBoost(v)*axisSpinBoost:18;
    if(rocket&&(lastRocketSpin<0||Math.abs(spin-lastRocketSpin)>=3||(!running&&lastRocketSpin!==18))){
      lastRocketSpin=spin;
      var spinValue=spin.toFixed(1)+'deg';
      if(rocket.getAttribute('rotation-per-second')!==spinValue)rocket.setAttribute('rotation-per-second',spinValue)
    }
    try{window.__vexaCrashRocketAngleDeg=angle}catch(e){}
    if(flight.getAttribute('data-state')!==state)flight.setAttribute('data-state',state);
  }
  function turnRocket(ms,state){
    var rocket=q('crashRocket');
    if(!state.running||!rocket||typeof rocket.resetTurntableRotation!=='function'){lastRocketTurnAt=0;return}
    ms=Number(ms)||performance.now();
    if(!lastRocketTurnAt){var existing=Number(rocket.turntableRotation);if(Number.isFinite(existing))rocketTurnRad=existing;lastRocketTurnAt=ms;return}
    var dt=Math.max(0,ms-lastRocketTurnAt);lastRocketTurnAt=ms;
    var spin=parseFloat(rocket.getAttribute('rotation-per-second')||'18');if(!Number.isFinite(spin))spin=18;
    rocketTurnRad=(rocketTurnRad+(spin*Math.PI/180)*(dt/1000))%(Math.PI*2);
    rocket.resetTurntableRotation(rocketTurnRad)
  }
  function setRocketIdle(state){current=1;mult(1);setRocket(1,'waiting',Math.max(0,(state&&state.waitElapsed||0)-CRASH_HOLD_MS))}
  function showRocketCrashed(state){current=state.stop;mult(state.stop);setRocket(state.stop,'crashed',0)}
  function renderHistory(state){var n=q('crashHistory');if(!n)return;n.innerHTML=previousRoundIds(state,12).map(function(id){return '<span>'+fmt(roundStop(id))+'</span>'}).join('')}
  function activePayout(){return activeBet?Math.max(0,Math.floor(activeBet.amount*current)):0}
  function lockBetControls(locked){var input=q('crashAmount'),bet=q('crash'),next=!!locked;if(input&&input.disabled!==next)input.disabled=next;if(bet&&bet.classList.contains('bet-locked')!==next)bet.classList.toggle('bet-locked',next)}
  function betLocked(state){if(!activeBet)return false;if(state.waiting&&activeBet.roundId===state.id&&activeBet.settled)return false;if(activeBet.cashed&&state.waiting)return false;return activeBet.roundId===targetBetRoundId(state)||activeBet.roundId===state.id}
  function buttons(state){var a=q('crashAction'),betRound=targetBetRoundId(state),hasBet=activeBet&&activeBet.roundId===betRound&&!activeBet.settled,canCash=activeBet&&activeBet.roundId===state.id&&!activeBet.settled&&!activeBet.cashed&&state.running,cashed=activeBet&&activeBet.cashed&&activeBet.roundId===state.id&&state.running;if(!a)return;lockBetControls(betLocked(state));var cashState=!!canCash||!!cashed;if(a.classList.contains('cashout')!==cashState)a.classList.toggle('cashout',cashState);var disabled=(!!hasBet&&!canCash)||state.inCrashHold||(state.running&&!canCash&&!cashed);if(a.disabled!==disabled)a.disabled=disabled;setText(a,canCash?'Cash Out '+toTon(activePayout())+' TON':cashed?'Cashed +'+toTon(activeBet.payoutNano||0)+' TON':hasBet?'Bet Placed':state.running?'Round Running':state.inCrashHold?'Crashed':'Place Bet')}
  function placeBet(){var state=locateRound(Date.now());if(state.running||state.inCrashHold){show('Wait for next round');return}var betRound=targetBetRoundId(state);if(activeBet&&activeBet.roundId===betRound&&!activeBet.settled){show('Bet already placed');return}var bet=normalizeAmount();if(balance()<bet){show('Not enough TON balance');return}change(-bet);activeBet={roundId:betRound,amount:bet,cashed:false,settled:false,autoCashout:normalizeAutoCashout(),payoutNano:0};lockBetControls(true);emitBet(betRound,bet);show('Bet placed for next round');scheduleUpdate(0)}
  function cashout(){var state=locateRound(Date.now());if(!activeBet||activeBet.roundId!==state.id||activeBet.settled||activeBet.cashed||state.waiting)return;activeBet.cashed=true;activeBet.settled=true;var m=current,back=Math.max(0,Math.floor(activeBet.amount*m));activeBet.payoutNano=back;change(back);status('Cashed +' + toTon(back) + ' TON');show('Cashed at '+fmt(m));window.dispatchEvent(new CustomEvent('vexa-crash-cashout',{detail:{roundId:state.id,multiplier:m,payoutNano:back}}));buttons(state);scheduleUpdate(0)}
  function action(){var state=locateRound(Date.now()),canCash=activeBet&&activeBet.roundId===state.id&&!activeBet.settled&&!activeBet.cashed&&state.running;if(canCash)cashout();else placeBet()}
  function maybeAutoCashout(state){if(!activeBet||activeBet.roundId!==state.id||activeBet.settled||activeBet.cashed||!state.running)return;var target=Number(activeBet.autoCashout)||0;if(target>=1.01&&current>=target)cashout()}
  function settleIfNeeded(state){if(activeBet&&activeBet.roundId<state.id&&!activeBet.settled){if(!activeBet.cashed)emitLoss(activeBet.roundId,state.stop);activeBet.settled=true}if(activeBet&&activeBet.roundId===state.id&&state.waiting&&!activeBet.settled){if(!activeBet.cashed)emitLoss(state.id,state.stop);activeBet.settled=true;status(activeBet.cashed?'Round ended':'Crashed')}if(activeBet&&activeBet.roundId===state.id&&state.waiting)lockBetControls(false);if(settledRoundId!==state.id&&state.waiting){settledRoundId=state.id;renderHistory(state)}}
  function isCrashActive(){var view=q('crash');return !!(view&&view.classList.contains('active')&&!document.hidden)}
  function scheduleUpdate(delay){if(crashFrame||crashIdleTimer)return;if(delay&&delay>0){crashIdleTimer=setTimeout(function(){crashIdleTimer=0;scheduleUpdate(0)},delay);return}crashFrame=requestAnimationFrame(update)}
  function renderSpace(ms){try{if(typeof window.__vexaCrashSpaceFrame==='function')window.__vexaCrashSpaceFrame(ms,current)}catch(e){}}
  function inactiveDelay(state){
    if(!activeBet||activeBet.settled||activeBet.cashed)return 0;
    if(activeBet.roundId<state.id)return 1;
    if(state.running&&activeBet.roundId===state.id){var target=Number(activeBet.autoCashout)||0;if(target>=1.01&&target<state.stop&&current<target)return Math.max(16,stopTime(target)-state.runElapsed+20);return Math.max(16,state.runMs-state.runElapsed+40)}
    if(state.waiting&&activeBet.roundId===state.id+1)return Math.max(16,state.nextIn+40);
    if(state.waiting&&activeBet.roundId===state.id)return 16;
    return 0
  }
  function renderFrame(ms,state){
    var mode=state.inCrashHold?'crashed':state.waiting?'waiting':'running',changed=mode!==lastRenderState;
    if(changed){lastRenderState=mode;try{if(typeof window.__vexaCrashSetRunning==='function')window.__vexaCrashSetRunning(mode==='running')}catch(e){}}
    try{turnRocket(ms,state)}catch(e){}
    try{if(typeof window.__vexaCrashBlurFrame==='function')window.__vexaCrashBlurFrame(current)}catch(e){}
  }
  function update(ms){
    crashFrame=0;var active=isCrashActive();
    if(active&&lastActiveRender&&ms-lastActiveRender<32){renderSpace(ms);crashFrame=requestAnimationFrame(update);return}
    if(active)lastActiveRender=ms;else{lastActiveRender=0;lastRenderState='';lastRocketTurnAt=0}
    var now=Date.now(),state=locateRound(now);
    if(currentRoundId!==state.id){currentRoundId=state.id;current=1;lastHistoryId=null;roundEndSignalId=null;if(activeBet&&activeBet.roundId<state.id)lockBetControls(false)}
    if(active){setTotal(state.local/1000);if(state.inCrashHold){nextLabel('Crashed');setCountdown('Crashed',false);status('Crashed');if(roundEndSignalId!==state.id){roundEndSignalId=state.id;window.dispatchEvent(new CustomEvent('vexa-round-ended',{detail:{roundId:state.id,multiplier:state.stop}}))}showRocketCrashed(state)}else if(state.waiting){var waitLeft=(state.nextIn/1000).toFixed(1);nextLabel('Round starts '+waitLeft+'s');setCountdown(waitLeft+'s',false);status('Waiting');setRocketIdle(state)}else{nextLabel('');setCountdown('',true);status('Running');current=Math.min(state.stop,multAt(state.runElapsed/1000));mult(current);setRocket(current,'running',0);maybeAutoCashout(state)}renderSpace(ms);renderFrame(ms,state);if(state.waiting&&lastHistoryId!==state.id){lastHistoryId=state.id;renderHistory(state)}}else if(activeBet&&activeBet.roundId===state.id&&!activeBet.settled&&!activeBet.cashed&&state.running){current=Math.min(state.stop,multAt(state.runElapsed/1000));maybeAutoCashout(state)}
    settleIfNeeded(state);if(active)buttons(state);
    if(active)scheduleUpdate(0);else{var delay=inactiveDelay(state);if(delay)scheduleUpdate(delay)}
  }
  function half(){var state=locateRound(Date.now());if(betLocked(state))return;var input=q('crashAmount');var value=normalizeAmount();if(input)input.value=toTon(Math.max(MIN_BET_NANO,Math.floor(value/2)))}
  function doubleAmount(){var state=locateRound(Date.now());if(betLocked(state))return;var input=q('crashAmount');var value=normalizeAmount();if(input)input.value=toTon(Math.max(MIN_BET_NANO,Math.min(balance(),value*2)))}
  function cleanDecimalInput(input){if(!input)return;var raw=String(input.value||'').replace(/,/g,'.'),out='',dot=false;for(var i=0;i<raw.length;i++){var ch=raw.charAt(i);if(ch>='0'&&ch<='9'){out+=ch;continue}if(ch==='.'&&!dot){out+=ch;dot=true}}if(out!==raw)input.value=out}
  function bind(){mult(1);status('Waiting');renderHistory(locateRound(Date.now()));var a=q('crashAction'),input=q('crashAmount'),auto=q('crashAutoCashout');if(a)a.onclick=action;if(input){input.setAttribute('step','0.01');input.setAttribute('inputmode','decimal');input.addEventListener('input',function(){cleanDecimalInput(input)});input.addEventListener('change',normalizeAmount);input.addEventListener('blur',normalizeAmount)}if(auto){auto.setAttribute('max',String(MAX_MULTIPLIER));auto.addEventListener('input',function(){cleanDecimalInput(auto)});auto.addEventListener('change',normalizeAutoCashout);auto.addEventListener('blur',normalizeAutoCashout)}document.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('button');if(!b)return;var act=b.getAttribute('data-action');if(act==='crash-half'){ev.preventDefault();half()}if(act==='crash-double'){ev.preventDefault();doubleAmount()}if(b.getAttribute('data-game-view')==='crash'||b.getAttribute('data-view')==='crash')setTimeout(function(){normalizeAmount();lastActiveRender=0;lastRocketTurnAt=0;scheduleUpdate(0)},120)});window.addEventListener('vexa-crash-visible',function(){lastActiveRender=0;lastRenderState='';lastRocketTurnAt=0;scheduleUpdate(0)});window.addEventListener('vexa-crash-bet-failed',function(ev){var d=ev&&ev.detail||{};if(!activeBet||Number(d.roundId)!==Number(activeBet.roundId))return;if(!d.authoritativeBalance)change(activeBet.amount);activeBet=null;lockBetControls(false);show(d.error||'Bet failed');scheduleUpdate(0)});window.addEventListener('vexa-crash-cashout-failed',function(ev){var d=ev&&ev.detail||{};if(!activeBet||Number(d.roundId)!==Number(activeBet.roundId))return;if(!d.authoritativeBalance&&activeBet.payoutNano)change(-activeBet.payoutNano);activeBet.cashed=false;activeBet.settled=false;activeBet.payoutNano=0;show(d.error||'Cashout failed');scheduleUpdate(0)});document.addEventListener('visibilitychange',function(){if(!document.hidden){lastActiveRender=0;lastRenderState='';lastRocketTurnAt=0;scheduleUpdate(0)}});window.addEventListener('resize',function(){var state=locateRound(Date.now());setRocket(state.running?current:state.stop,state.inCrashHold?'crashed':state.running?'running':'waiting',state.waiting?Math.max(0,state.waitElapsed-CRASH_HOLD_MS):0)});scheduleUpdate(0)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
`;