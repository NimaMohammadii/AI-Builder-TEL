export const CRASH_SCRIPT = `
(function(){
  var UNIT=1000000000,MIN_BET_NANO=10000000,MAX_MULTIPLIER=50,MULTIPLIER_RATE=.112;
  var activeBet=null,settledRoundId=null,currentRoundId=-1,current=1,crashFrame=0,reconnectTimer=0,eventSource=null,serverOffset=0,roundState=null,lastActiveRender=0,lastRocketSpin=-1,rocketDriftReady=false,lastRenderState='',lastRocketTurnAt=0,rocketTurnRad=0,roundEndSignalId=null;
  function q(id){return document.getElementById(id)}
  function setText(node,text){if(node&&node.textContent!==text)node.textContent=text}
  function setVar(node,name,value){if(!node)return;var cache=node.__vexaCrashVars||(node.__vexaCrashVars={});if(cache[name]===value)return;cache[name]=value;node.style.setProperty(name,value)}
  function show(text){var n=q('toast');if(!n)return;n.textContent=text;n.style.display='block';setTimeout(function(){n.style.display='none'},2200)}
  function balance(){return window.VexaTonBalance?Math.max(0,Math.floor(Number(window.VexaTonBalance.read())||0)):0}
  function change(delta){var value=Math.floor(Number(delta)||0);if(window.VexaTonBalance&&typeof window.VexaTonBalance.read==='function'&&typeof window.VexaTonBalance.write==='function'){window.VexaTonBalance.write(Math.max(0,balance()+value),value,false);return}window.dispatchEvent(new CustomEvent('vexa-ton-balance-game-change',{detail:{deltaNano:value,section:'crash'}}))}
  function emitBet(roundId,amountNano){try{window.dispatchEvent(new CustomEvent('vexa-crash-bet',{detail:{roundId:roundId,amountNano:amountNano}}))}catch(e){}}
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
  function serverNow(){return Date.now()+serverOffset}
  function multAtMs(ms){return Math.max(1,Math.min(MAX_MULTIPLIER,Math.exp(MULTIPLIER_RATE*Math.max(0,Number(ms)||0)/1000)))}
  function stateCurrent(state){if(!state)return 1;if(state.phase==='ended')return Math.max(1,Number(state.crashMultiplier)||1);if(state.phase!=='running')return 1;return multAtMs(serverNow()-(Number(state.runningStartedAt)||serverNow()))}
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
    if(!rocketDriftReady){rocketDriftReady=true;setVar(flight,'--rocket-drift-duration','6.4s')}
    var driftT=running?Math.max(0,Math.min(1,(v-1.7)/.1)):0,driftMix=driftT*driftT*(3-2*driftT),shake=12+24*driftMix,mid50=shake*(1-(2/3)*driftMix),mid75=shake*driftMix;
    setVar(flight,'--rocket-shake',shake.toFixed(2)+'px');setVar(flight,'--rocket-mid-50',mid50.toFixed(2)+'px');setVar(flight,'--rocket-mid-75',mid75.toFixed(2)+'px');
    var motionState=running&&v>=1.8?'boost':'calm';if(flight.getAttribute('data-motion')!==motionState)flight.setAttribute('data-motion',motionState);
    var rocket=q('crashRocket'),spinCurve=1-Math.pow(1-spinProgress,2),baseSpin=running?18+spinCurve*162:18,axisSpinBoost=v>=8?4:v>=5?2.5:1,spin=running?baseSpin*speedBoost(v)*axisSpinBoost:18;
    if(rocket&&(lastRocketSpin<0||Math.abs(spin-lastRocketSpin)>=3||(!running&&lastRocketSpin!==18))){lastRocketSpin=spin;var spinValue=spin.toFixed(1)+'deg';if(rocket.getAttribute('rotation-per-second')!==spinValue)rocket.setAttribute('rotation-per-second',spinValue)}
    try{window.__vexaCrashRocketAngleDeg=angle}catch(e){}
    if(flight.getAttribute('data-state')!==state)flight.setAttribute('data-state',state)
  }
  function turnRocket(ms,state){
    var rocket=q('crashRocket');if(!state||state.phase!=='running'||!rocket||typeof rocket.resetTurntableRotation!=='function'){lastRocketTurnAt=0;return}
    ms=Number(ms)||performance.now();if(!lastRocketTurnAt){var existing=Number(rocket.turntableRotation);if(Number.isFinite(existing))rocketTurnRad=existing;lastRocketTurnAt=ms;return}
    var dt=Math.max(0,ms-lastRocketTurnAt);lastRocketTurnAt=ms;var spin=parseFloat(rocket.getAttribute('rotation-per-second')||'18');if(!Number.isFinite(spin))spin=18;rocketTurnRad=(rocketTurnRad+(spin*Math.PI/180)*(dt/1000))%(Math.PI*2);rocket.resetTurntableRotation(rocketTurnRad)
  }
  function setRocketIdle(state){current=1;mult(1);var elapsed=Math.max(0,serverNow()-(Number(state&&state.bettingStartedAt)||serverNow()));setRocket(1,'waiting',elapsed)}
  function showRocketCrashed(state){current=Math.max(1,Number(state&&state.crashMultiplier)||1);mult(current);setRocket(current,'crashed',0)}
  function renderHistory(state){var n=q('crashHistory');if(!n)return;var h=state&&Array.isArray(state.history)?state.history:[];n.innerHTML=h.slice(0,12).map(function(v){return '<span>'+fmt(v)+'</span>'}).join('')}
  function activePayout(){return activeBet?Math.max(0,Math.floor(activeBet.amount*current)):0}
  function lockBetControls(locked){var input=q('crashAmount'),bet=q('crash'),next=!!locked;if(input&&input.disabled!==next)input.disabled=next;if(bet&&bet.classList.contains('bet-locked')!==next)bet.classList.toggle('bet-locked',next)}
  function betLocked(state){if(!activeBet)return false;if(!state)return true;if(activeBet.cashed||activeBet.settled)return false;return Number(activeBet.roundId)===Number(state.id)}
  function buttons(state){var a=q('crashAction');if(!a)return;var phase=state&&state.phase||'connecting',hasBet=activeBet&&state&&Number(activeBet.roundId)===Number(state.id)&&!activeBet.settled,canCash=!!(hasBet&&!activeBet.cashed&&phase==='running'),cashed=!!(activeBet&&state&&Number(activeBet.roundId)===Number(state.id)&&activeBet.cashed);lockBetControls(betLocked(state));var cashState=canCash||cashed;if(a.classList.contains('cashout')!==cashState)a.classList.toggle('cashout',cashState);var disabled=!state||(hasBet&&!canCash&&!cashed)||phase==='ended'||(phase==='running'&&!canCash&&!cashed);if(a.disabled!==disabled)a.disabled=disabled;setText(a,canCash?'Cash Out '+toTon(activePayout())+' TON':cashed?'Cashed +'+toTon(activeBet.payoutNano||0)+' TON':hasBet?'Bet Placed':phase==='running'?'Round Running':phase==='ended'?'Crashed':phase==='betting'?'Place Bet':'Connecting')}
  function placeBet(){var state=roundState;if(!state||state.phase!=='betting'){show('Wait for next round');return}var roundId=Number(state.id)||0;if(!roundId)return;if(activeBet&&Number(activeBet.roundId)===roundId&&!activeBet.settled){show('Bet already placed');return}var bet=normalizeAmount();if(balance()<bet){show('Not enough TON balance');return}change(-bet);activeBet={roundId:roundId,amount:bet,cashed:false,settled:false,autoCashout:normalizeAutoCashout(),payoutNano:0};lockBetControls(true);emitBet(roundId,bet);show('Bet placed for this round');scheduleUpdate()}
  function cashout(){var state=roundState;if(!state||state.phase!=='running'||!activeBet||Number(activeBet.roundId)!==Number(state.id)||activeBet.settled||activeBet.cashed)return;activeBet.cashed=true;activeBet.settled=true;var m=current,back=Math.max(0,Math.floor(activeBet.amount*m));activeBet.payoutNano=back;change(back);status('Cashing out');window.dispatchEvent(new CustomEvent('vexa-crash-cashout',{detail:{roundId:Number(state.id),multiplier:m,payoutNano:back}}));buttons(state)}
  function action(){var canCash=roundState&&roundState.phase==='running'&&activeBet&&Number(activeBet.roundId)===Number(roundState.id)&&!activeBet.settled&&!activeBet.cashed;if(canCash)cashout();else placeBet()}
  function maybeAutoCashout(state){if(!state||state.phase!=='running'||!activeBet||Number(activeBet.roundId)!==Number(state.id)||activeBet.settled||activeBet.cashed)return;var target=Number(activeBet.autoCashout)||0;if(target>=1.01&&current>=target)cashout()}
  function settleIfNeeded(state){if(!state||state.phase!=='ended')return;var roundId=Number(state.id)||0;if(activeBet&&Number(activeBet.roundId)===roundId&&!activeBet.settled){activeBet.settled=true;status('Crashed')}if(activeBet&&Number(activeBet.roundId)===roundId)lockBetControls(false);if(settledRoundId!==roundId){settledRoundId=roundId;renderHistory(state)}}
  function isCrashActive(){var view=q('crash');return !!(view&&view.classList.contains('active')&&!document.hidden)}
  function scheduleUpdate(){if(crashFrame||!isCrashActive())return;crashFrame=requestAnimationFrame(update)}
  function renderSpace(ms){try{if(typeof window.__vexaCrashSpaceFrame==='function')window.__vexaCrashSpaceFrame(ms,current)}catch(e){}}
  function renderFrame(ms,state){var mode=!state?'waiting':state.phase==='ended'?'crashed':state.phase==='running'?'running':'waiting',changed=mode!==lastRenderState;if(changed){lastRenderState=mode;try{if(typeof window.__vexaCrashSetRunning==='function')window.__vexaCrashSetRunning(mode==='running')}catch(e){}}try{turnRocket(ms,state)}catch(e){}try{if(typeof window.__vexaCrashBlurFrame==='function')window.__vexaCrashBlurFrame(current)}catch(e){}}
  function update(ms){
    crashFrame=0;if(!isCrashActive()){lastActiveRender=0;lastRenderState='';lastRocketTurnAt=0;return}
    if(lastActiveRender&&ms-lastActiveRender<32){renderSpace(ms);crashFrame=requestAnimationFrame(update);return}lastActiveRender=ms;
    var state=roundState;if(!state){status('Connecting');nextLabel('');setCountdown('',true);current=1;mult(1);renderSpace(ms);renderFrame(ms,state);buttons(state);scheduleUpdate();return}
    if(currentRoundId!==Number(state.id)){currentRoundId=Number(state.id);current=1;roundEndSignalId=null;if(activeBet&&Number(activeBet.roundId)!==currentRoundId&&activeBet.settled)activeBet=null}
    var now=serverNow();if(state.phase==='ended'){nextLabel('Crashed');setCountdown('Crashed',false);status('Crashed');setTotal(Math.max(0,(now-Number(state.runningStartedAt||now))/1000));if(roundEndSignalId!==Number(state.id)){roundEndSignalId=Number(state.id);window.dispatchEvent(new CustomEvent('vexa-round-ended',{detail:{roundId:Number(state.id),multiplier:Number(state.crashMultiplier)||1}}))}showRocketCrashed(state)}else if(state.phase==='betting'){var left=Math.max(0,(Number(state.runningStartedAt)||now)-now),text=(left/1000).toFixed(1);nextLabel('Round starts '+text+'s');setCountdown(text+'s',false);status('Waiting');setTotal(0);setRocketIdle(state)}else{nextLabel('');setCountdown('',true);status('Running');current=stateCurrent(state);setTotal(Math.max(0,(now-Number(state.runningStartedAt||now))/1000));mult(current);setRocket(current,'running',0);maybeAutoCashout(state)}
    settleIfNeeded(state);renderSpace(ms);renderFrame(ms,state);buttons(state);scheduleUpdate()
  }
  function applyState(state){if(!state||!Number.isFinite(Number(state.id))||!state.phase)return;serverOffset=(Number(state.serverNow)||Date.now())-Date.now();roundState=state;current=stateCurrent(state);window.VexaCrashRound={getState:function(){return roundState},current:function(){return stateCurrent(roundState)}};try{window.dispatchEvent(new CustomEvent('vexa-crash-state',{detail:state}))}catch(e){}renderHistory(state);settleIfNeeded(state);lastActiveRender=0;scheduleUpdate()}
  function telegramInitData(){var tg=window.Telegram&&window.Telegram.WebApp;return String(tg&&tg.initData||'')}
  function clearReconnect(){if(reconnectTimer){clearTimeout(reconnectTimer);reconnectTimer=0}}
  function disconnect(){clearReconnect();if(eventSource){try{eventSource.close()}catch(e){}eventSource=null}}
  function connect(){if(!isCrashActive()||eventSource)return;var initData=telegramInitData();if(!initData){status('Connecting');return}var es=new EventSource('/app/api/crash-live/events?initData='+encodeURIComponent(initData));eventSource=es;es.onmessage=function(ev){if(eventSource!==es)return;try{applyState(JSON.parse(ev.data))}catch(e){}};es.onerror=function(){if(eventSource!==es)return;try{es.close()}catch(e){}eventSource=null;if(isCrashActive()){clearReconnect();reconnectTimer=setTimeout(function(){reconnectTimer=0;connect()},900)}}}
  function half(){if(betLocked(roundState))return;var input=q('crashAmount');var value=normalizeAmount();if(input)input.value=toTon(Math.max(MIN_BET_NANO,Math.floor(value/2)))}
  function doubleAmount(){if(betLocked(roundState))return;var input=q('crashAmount');var value=normalizeAmount();if(input)input.value=toTon(Math.max(MIN_BET_NANO,Math.min(balance(),value*2)))}
  function cleanDecimalInput(input){if(!input)return;var raw=String(input.value||'').replace(/,/g,'.'),out='',dot=false;for(var i=0;i<raw.length;i++){var ch=raw.charAt(i);if(ch>='0'&&ch<='9'){out+=ch;continue}if(ch==='.'&&!dot){out+=ch;dot=true}}if(out!==raw)input.value=out}
  function bind(){mult(1);status('Connecting');var a=q('crashAction'),input=q('crashAmount'),auto=q('crashAutoCashout');if(a)a.onclick=action;if(input){input.setAttribute('step','0.01');input.setAttribute('inputmode','decimal');input.addEventListener('input',function(){cleanDecimalInput(input)});input.addEventListener('change',normalizeAmount);input.addEventListener('blur',normalizeAmount)}if(auto){auto.setAttribute('max',String(MAX_MULTIPLIER));auto.addEventListener('input',function(){cleanDecimalInput(auto)});auto.addEventListener('change',normalizeAutoCashout);auto.addEventListener('blur',normalizeAutoCashout)}document.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('button');if(!b)return;var act=b.getAttribute('data-action');if(act==='crash-half'){ev.preventDefault();half()}if(act==='crash-double'){ev.preventDefault();doubleAmount()}if(b.getAttribute('data-game-view')==='crash'||b.getAttribute('data-view')==='crash')setTimeout(function(){normalizeAmount();lastActiveRender=0;lastRocketTurnAt=0;connect();scheduleUpdate()},120)});window.addEventListener('vexa-crash-visible',function(){lastActiveRender=0;lastRenderState='';lastRocketTurnAt=0;connect();scheduleUpdate()});window.addEventListener('vexa-crash-hidden',function(){disconnect();if(crashFrame){cancelAnimationFrame(crashFrame);crashFrame=0}});window.addEventListener('vexa-crash-bet-failed',function(ev){var d=ev&&ev.detail||{};if(!activeBet||Number(d.roundId)!==Number(activeBet.roundId))return;if(!d.authoritativeBalance)change(activeBet.amount);activeBet=null;lockBetControls(false);show(d.error||'Bet failed');scheduleUpdate()});window.addEventListener('vexa-crash-cashout-failed',function(ev){var d=ev&&ev.detail||{};if(!activeBet||Number(d.roundId)!==Number(activeBet.roundId))return;if(!d.authoritativeBalance&&activeBet.payoutNano)change(-activeBet.payoutNano);activeBet.cashed=false;activeBet.settled=false;activeBet.payoutNano=0;show(d.error||'Cashout failed');scheduleUpdate()});window.addEventListener('vexa-crash-cashout-confirmed',function(ev){var d=ev&&ev.detail||{};if(!activeBet||Number(d.roundId)!==Number(activeBet.roundId))return;var serverPayout=Math.max(0,Math.floor(Number(d.payoutNano)||0)),serverMultiplier=Number(d.multiplier)||0;if(serverPayout!==activeBet.payoutNano)activeBet.payoutNano=serverPayout;if(serverMultiplier>0)status('Cashed at '+fmt(serverMultiplier));buttons(roundState)});document.addEventListener('visibilitychange',function(){if(document.hidden)disconnect();else if(isCrashActive()){connect();scheduleUpdate()}});window.addEventListener('resize',function(){var state=roundState;if(!state)return;setRocket(state.phase==='running'?current:state.phase==='ended'?Number(state.crashMultiplier)||1:1,state.phase==='ended'?'crashed':state.phase==='running'?'running':'waiting',0)});if(isCrashActive()){connect();scheduleUpdate()}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
`;
