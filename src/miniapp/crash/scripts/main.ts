export const CRASH_SCRIPT = `
(function(){
  var UNIT=1000000000, MIN_BET_NANO=10000000, HOUSE_EDGE=.04, WAIT_BETWEEN_MS=10000, CRASH_HOLD_MS=2200, MAX_RUN_MS=68000, DAY_MS=86400000;
  var activeBet=null, settledRoundId=null, currentRoundId=-1, current=1, lastHistoryId=null, scheduleCache=null, crashFrame=0, crashIdleTimer=0, roundEndSignalId=null, lastActiveRender=0;
  function q(id){return document.getElementById(id)}
  function show(text){var n=q('toast');if(!n)return;n.textContent=text;n.style.display='block';setTimeout(function(){n.style.display='none'},2200)}
  function balance(){return window.VexaTonBalance?Math.max(0,Math.floor(Number(window.VexaTonBalance.read())||0)):0}
  function change(delta){var value=Math.floor(Number(delta)||0);if(window.VexaTonBalance&&typeof window.VexaTonBalance.read==='function'&&typeof window.VexaTonBalance.write==='function'){window.VexaTonBalance.write(Math.max(0,balance()+value),value,false);return}window.dispatchEvent(new CustomEvent('vexa-ton-balance-game-change',{detail:{deltaNano:value,section:'crash'}}))}
  function emitBet(roundId,amountNano){try{window.dispatchEvent(new CustomEvent('vexa-crash-bet',{detail:{roundId:roundId,amountNano:amountNano}}))}catch(e){}}
  function emitLoss(roundId,multiplier){try{window.dispatchEvent(new CustomEvent('vexa-crash-lost',{detail:{roundId:roundId,multiplier:Number(multiplier)||1}}))}catch(e){}}
  function toNano(value){return Math.max(0,Math.floor((Number(String(value||'').replace(/,/g,'.'))||0)*UNIT))}
  function toTon(nano){var v=Math.max(0,Math.floor(Number(nano)||0))/UNIT;return v.toFixed(2)}
  function normalizeAmount(){var input=q('crashAmount');var n=toNano(input&&input.value);if(n<MIN_BET_NANO)n=MIN_BET_NANO;if(input){input.setAttribute('step','0.01');input.setAttribute('inputmode','decimal');input.value=toTon(n)}return n}
  function normalizeAutoCashout(){var input=q('crashAutoCashout');if(!input)return 0;var v=Number(String(input.value||'').replace(/,/g,'.'))||0;if(v>0&&v<1.01)v=1.01;if(v>200)v=200;if(input.value&&String(input.value)!==String(v))input.value=v.toFixed(2).replace(/\.00$/,'');return v>=1.01?v:0}
  function fmt(v){return Math.max(1,Number(v)||1).toFixed(2)+'x'}
  function status(text){var n=q('crashStatus');if(n)n.textContent=text}
  function mult(v){var text=fmt(v),n=q('crashMultiplier'),p=q('crashPanelMultiplier');if(n)n.textContent=text;if(p)p.textContent=text}
  function nextLabel(text){var n=q('crashNextRound');if(n)n.textContent=text}
  function setCountdown(text,hide){var box=q('crashStarting'),n=q('crashCountdown');if(n)n.textContent=text;if(box)box.classList.toggle('hidden',!!hide)}
  function setTotal(seconds){var n=q('crashTotalTime');if(n)n.textContent='Total '+Math.max(0,Math.floor(seconds))+'s'}
  function seeded(seed){var x=Math.sin(seed*9301.777+49297.31)*233280;return x-Math.floor(x)}
  function rawRoundStop(roundId){var u=Math.max(.000001,seeded(roundId));var raw=(1-HOUSE_EDGE)/u;if(seeded(roundId+17)<HOUSE_EDGE)raw=1;return Math.max(1,Math.min(60,Math.floor(raw*100)/100))}
  function multAt(seconds){return 1+seconds*.06+seconds*seconds*.00105}
  function maxReachableStop(){return Math.floor(multAt(MAX_RUN_MS/1000)*100)/100}
  function roundStop(roundId){return Math.min(rawRoundStop(roundId),maxReachableStop())}
  function stopTime(stop){var target=Math.max(1,Number(stop)||1),lo=0,hi=MAX_RUN_MS;for(var i=0;i<24;i++){var mid=(lo+hi)/2;if(multAt(mid/1000)>=target)hi=mid;else lo=mid}return hi}
  function cycleFor(id){var stop=roundStop(id);var runMs=Math.max(1100,stopTime(stop));return{id:id,stop:stop,runMs:runMs,cycleMs:runMs+WAIT_BETWEEN_MS}}
  function locateRound(now){var dayStart=Math.floor(now/DAY_MS)*DAY_MS,baseId=Math.floor(dayStart/1000);if(!scheduleCache||scheduleCache.dayStart!==dayStart||now<scheduleCache.start){scheduleCache={dayStart:dayStart,baseId:baseId,localId:0,start:dayStart,cycle:cycleFor(baseId)}}while(now>=scheduleCache.start+scheduleCache.cycle.cycleMs){scheduleCache.start+=scheduleCache.cycle.cycleMs;scheduleCache.localId++;scheduleCache.cycle=cycleFor(scheduleCache.baseId+scheduleCache.localId)}var c=scheduleCache.cycle,local=now-scheduleCache.start,running=local<c.runMs,waitElapsed=running?0:local-c.runMs,nextIn=running?0:Math.max(0,WAIT_BETWEEN_MS-waitElapsed),inCrashHold=!running&&waitElapsed<CRASH_HOLD_MS;return{id:c.id,start:scheduleCache.start,local:local,runElapsed:Math.min(local,c.runMs),waitElapsed:waitElapsed,stop:c.stop,runMs:c.runMs,running:running,waiting:!running,inCrashHold:inCrashHold,nextIn:nextIn}}
  function previousRoundIds(state,count){var ids=[];for(var id=state.id-(state.waiting?0:1);ids.length<count;id--)ids.push(id);return ids}
  function targetBetRoundId(state){return state.waiting?state.id+1:state.id}
  function setRocket(value,state,entryElapsed){
    var flight=q('crashRocketFlight');if(!flight)return;
    var v=Math.max(1,Number(value)||1),raw=Math.max(0,v-1);
    var running=state==='running',crashed=state==='crashed',thrust=running?.66+Math.min(.52,raw*.04):.18;
    var turn=state==='waiting'?0:1-Math.exp(-Math.max(0,v-2.2)*.18),angle=Math.max(60,Math.min(80,80-(20*turn)));
    var speedMotion=running?Math.max(0,Math.min(1,(v-1.35)/5.65)):0,shake=2+speedMotion*5,duration=3.6-speedMotion*3.1;
    var travel=Math.min(560,Math.max(280,(window.innerWidth||360)-32))*.58,entryX=0;
    if(state==='waiting'){
      var entryT=Math.max(0,Math.min(1,(Number(entryElapsed)||0)/1100)),entryEase=1-Math.pow(1-entryT,4);
      entryX=-travel*(1-entryEase);
    }
    flight.style.setProperty('--rocket-angle',angle.toFixed(2)+'deg');
    flight.style.setProperty('--rocket-entry-x',entryX.toFixed(2)+'px');
    flight.style.setProperty('--rocket-thrust',crashed?'0':thrust.toFixed(3));
    flight.style.setProperty('--rocket-shake',shake.toFixed(2)+'px');
    flight.style.setProperty('--rocket-drift-duration',duration.toFixed(2)+'s');
    try{window.__vexaCrashRocketAngleDeg=angle}catch(e){}
    if(flight.getAttribute('data-state')!==state)flight.setAttribute('data-state',state);
  }
  function setRocketIdle(state){current=1;mult(1);setRocket(1,'waiting',Math.max(0,(state&&state.waitElapsed||0)-CRASH_HOLD_MS))}
  function showRocketCrashed(state){current=state.stop;mult(state.stop);setRocket(state.stop,'crashed',0)}
  function renderHistory(state){var n=q('crashHistory');if(!n)return;n.innerHTML=previousRoundIds(state,12).map(function(id){return '<span>'+fmt(roundStop(id))+'</span>'}).join('')}
  function activePayout(){return activeBet?Math.max(0,Math.floor(activeBet.amount*current)):0}
  function lockBetControls(locked){var input=q('crashAmount'),bet=q('crash');if(input)input.disabled=!!locked;if(bet)bet.classList.toggle('bet-locked',!!locked)}
  function betLocked(state){if(!activeBet)return false;if(activeBet.cashed&&state.waiting)return false;return activeBet.roundId===targetBetRoundId(state)||activeBet.roundId===state.id}
  function buttons(state){var a=q('crashAction'),betRound=targetBetRoundId(state),hasBet=activeBet&&activeBet.roundId===betRound&&!activeBet.settled,canCash=activeBet&&activeBet.roundId===state.id&&!activeBet.settled&&!activeBet.cashed&&state.running,cashed=activeBet&&activeBet.cashed&&activeBet.roundId===state.id&&state.running;if(!a)return;lockBetControls(betLocked(state));a.classList.toggle('cashout',!!canCash||!!cashed);a.disabled=(!!hasBet&&!canCash)||state.inCrashHold||(state.running&&!canCash&&!cashed);a.textContent=canCash?'Cash Out '+toTon(activePayout())+' TON':cashed?'Cashed +'+toTon(activeBet.payoutNano||0)+' TON':hasBet?'Bet Placed':state.running?'Round Running':state.inCrashHold?'Crashed':'Place Bet'}
  function placeBet(){var state=locateRound(Date.now());if(state.running||state.inCrashHold){show('Wait for next round');return}var betRound=targetBetRoundId(state);if(activeBet&&activeBet.roundId===betRound&&!activeBet.settled){show('Bet already placed');return}var bet=normalizeAmount();if(balance()<bet){show('Not enough TON balance');return}change(-bet);activeBet={roundId:betRound,amount:bet,cashed:false,settled:false,autoCashout:normalizeAutoCashout(),payoutNano:0};lockBetControls(true);emitBet(betRound,bet);show('Bet placed for next round');scheduleUpdate(0)}
  function cashout(){var state=locateRound(Date.now());if(!activeBet||activeBet.roundId!==state.id||activeBet.settled||activeBet.cashed||state.waiting)return;activeBet.cashed=true;activeBet.settled=true;var m=current,back=Math.max(0,Math.floor(activeBet.amount*m));activeBet.payoutNano=back;change(back);status('Cashed +' + toTon(back) + ' TON');show('Cashed at '+fmt(m));window.dispatchEvent(new CustomEvent('vexa-crash-cashout',{detail:{roundId:state.id,multiplier:m,payoutNano:back}}));buttons(state);scheduleUpdate(0)}
  function action(){var state=locateRound(Date.now()),canCash=activeBet&&activeBet.roundId===state.id&&!activeBet.settled&&!activeBet.cashed&&state.running;if(canCash)cashout();else placeBet()}
  function maybeAutoCashout(state){if(!activeBet||activeBet.roundId!==state.id||activeBet.settled||activeBet.cashed||!state.running)return;var target=Number(activeBet.autoCashout)||0;if(target>=1.01&&current>=target)cashout()}
  function settleIfNeeded(state){if(activeBet&&activeBet.roundId<state.id&&!activeBet.settled){if(!activeBet.cashed)emitLoss(activeBet.roundId,state.stop);activeBet.settled=true}if(activeBet&&activeBet.roundId===state.id&&state.waiting&&!activeBet.settled){if(!activeBet.cashed)emitLoss(state.id,state.stop);activeBet.settled=true;status(activeBet.cashed?'Round ended':'Crashed')}if(activeBet&&activeBet.roundId===state.id&&state.waiting)lockBetControls(false);if(settledRoundId!==state.id&&state.waiting){settledRoundId=state.id;renderHistory(state)}}
  function isCrashActive(){var view=q('crash');return !!(view&&view.classList.contains('active')&&!document.hidden)}
  function scheduleUpdate(delay){if(crashFrame||crashIdleTimer)return;if(delay&&delay>0){crashIdleTimer=setTimeout(function(){crashIdleTimer=0;scheduleUpdate(0)},delay);return}crashFrame=requestAnimationFrame(update)}
  function inactiveDelay(state){
    if(!activeBet||activeBet.settled||activeBet.cashed)return 0;
    if(activeBet.roundId<state.id)return 1;
    if(state.running&&activeBet.roundId===state.id){var target=Number(activeBet.autoCashout)||0;if(target>=1.01&&target<state.stop&&current<target)return Math.max(16,stopTime(target)-state.runElapsed+20);return Math.max(16,state.runMs-state.runElapsed+40)}
    if(state.waiting&&activeBet.roundId===state.id+1)return Math.max(16,state.nextIn+40);
    if(state.waiting&&activeBet.roundId===state.id)return 16;
    return 0
  }
  function update(ms){
    crashFrame=0;var active=isCrashActive();
    if(active&&lastActiveRender&&ms-lastActiveRender<32){crashFrame=requestAnimationFrame(update);return}
    if(active)lastActiveRender=ms;else lastActiveRender=0;
    var now=Date.now(),state=locateRound(now);
    if(currentRoundId!==state.id){currentRoundId=state.id;current=1;lastHistoryId=null;roundEndSignalId=null;if(activeBet&&activeBet.roundId<state.id)lockBetControls(false)}
    if(active){setTotal(state.local/1000);if(state.inCrashHold){nextLabel('Crashed');setCountdown('Crashed',false);status('Crashed');if(roundEndSignalId!==state.id){roundEndSignalId=state.id;window.dispatchEvent(new CustomEvent('vexa-round-ended',{detail:{roundId:state.id,multiplier:state.stop}}))}showRocketCrashed(state)}else if(state.waiting){var waitLeft=(state.nextIn/1000).toFixed(1);nextLabel('Round starts '+waitLeft+'s');setCountdown(waitLeft+'s',false);status('Waiting');setRocketIdle(state)}else{nextLabel('');setCountdown('',true);status('Running');current=Math.min(state.stop,multAt(state.runElapsed/1000));mult(current);setRocket(current,'running',0);maybeAutoCashout(state)}if(state.waiting&&lastHistoryId!==state.id){lastHistoryId=state.id;renderHistory(state)}}else if(activeBet&&activeBet.roundId===state.id&&!activeBet.settled&&!activeBet.cashed&&state.running){current=Math.min(state.stop,multAt(state.runElapsed/1000));maybeAutoCashout(state)}
    settleIfNeeded(state);if(active)buttons(state);
    if(active)scheduleUpdate(0);else{var delay=inactiveDelay(state);if(delay)scheduleUpdate(delay)}
  }
  function half(){var state=locateRound(Date.now());if(betLocked(state))return;var input=q('crashAmount');var value=normalizeAmount();if(input)input.value=toTon(Math.max(MIN_BET_NANO,Math.floor(value/2)))}
  function doubleAmount(){var state=locateRound(Date.now());if(betLocked(state))return;var input=q('crashAmount');var value=normalizeAmount();if(input)input.value=toTon(Math.max(MIN_BET_NANO,Math.min(balance(),value*2)))}
  function cleanDecimalInput(input){if(!input)return;var raw=String(input.value||'').replace(/,/g,'.'),out='',dot=false;for(var i=0;i<raw.length;i++){var ch=raw.charAt(i);if(ch>='0'&&ch<='9'){out+=ch;continue}if(ch==='.'&&!dot){out+=ch;dot=true}}if(out!==raw)input.value=out}
  function bind(){mult(1);status('Waiting');renderHistory(locateRound(Date.now()));var a=q('crashAction'),input=q('crashAmount'),auto=q('crashAutoCashout');if(a)a.onclick=action;if(input){input.setAttribute('step','0.01');input.setAttribute('inputmode','decimal');input.addEventListener('input',function(){cleanDecimalInput(input)});input.addEventListener('change',normalizeAmount);input.addEventListener('blur',normalizeAmount)}if(auto){auto.addEventListener('input',function(){cleanDecimalInput(auto)});auto.addEventListener('change',normalizeAutoCashout);auto.addEventListener('blur',normalizeAutoCashout)}document.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('button');if(!b)return;var act=b.getAttribute('data-action');if(act==='crash-half'){ev.preventDefault();half()}if(act==='crash-double'){ev.preventDefault();doubleAmount()}if(b.getAttribute('data-game-view')==='crash'||b.getAttribute('data-view')==='crash')setTimeout(function(){normalizeAmount();lastActiveRender=0;scheduleUpdate(0)},120)});window.addEventListener('vexa-crash-visible',function(){lastActiveRender=0;scheduleUpdate(0)});window.addEventListener('vexa-crash-bet-failed',function(ev){var d=ev&&ev.detail||{};if(!activeBet||Number(d.roundId)!==Number(activeBet.roundId))return;if(!d.authoritativeBalance)change(activeBet.amount);activeBet=null;lockBetControls(false);show(d.error||'Bet failed');scheduleUpdate(0)});window.addEventListener('vexa-crash-cashout-failed',function(ev){var d=ev&&ev.detail||{};if(!activeBet||Number(d.roundId)!==Number(activeBet.roundId))return;if(!d.authoritativeBalance&&activeBet.payoutNano)change(-activeBet.payoutNano);activeBet.cashed=false;activeBet.settled=false;activeBet.payoutNano=0;show(d.error||'Cashout failed');scheduleUpdate(0)});document.addEventListener('visibilitychange',function(){if(!document.hidden){lastActiveRender=0;scheduleUpdate(0)}});window.addEventListener('resize',function(){var state=locateRound(Date.now());setRocket(state.running?current:state.stop,state.inCrashHold?'crashed':state.running?'running':'waiting',state.waiting?Math.max(0,state.waitElapsed-CRASH_HOLD_MS):0)});scheduleUpdate(0)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
`;