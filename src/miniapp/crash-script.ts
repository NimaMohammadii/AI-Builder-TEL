export const CRASH_SCRIPT = `
(function(){
  var UNIT=1000000000;
  var HOUSE_EDGE=.04;
  var WAIT_BETWEEN_MS=5000;
  var MAX_RUN_MS=15000;
  var SCHEDULE_EPOCH=1704067200000;
  var activeBet=null;
  var settledRoundId=null;
  var currentRoundId=-1;
  var current=1;
  var chartCurrent=1;
  var lastDraw=0;
  var lastProgress=0;
  var lastHistoryId=null;
  var canvasCache=null;
  var ctxCache=null;
  function q(id){return document.getElementById(id)}
  function show(text){var n=q('toast');if(!n)return;n.textContent=text;n.style.display='block';setTimeout(function(){n.style.display='none'},2200)}
  function balance(){return window.VexaTonBalance?Math.max(0,Math.floor(Number(window.VexaTonBalance.read())||0)):0}
  function change(delta){if(window.VexaTonBalance)window.VexaTonBalance.add(Math.floor(Number(delta)||0));else window.dispatchEvent(new CustomEvent('vexa-ton-balance-game-change',{detail:{deltaNano:Math.floor(Number(delta)||0)}}))}
  function toNano(value){return Math.max(0,Math.floor((Number(String(value||'').replace(',','.'))||0)*UNIT))}
  function toTon(nano){var v=Math.max(0,Math.floor(Number(nano)||0))/UNIT;return v.toFixed(4).replace(/\.0+$/,'').replace(/(\.\d*?)0+$/,'$1')}
  function normalizeAmount(){var input=q('crashAmount');var n=toNano(input&&input.value);if(n<1)n=1;if(input)input.value=toTon(n);return n}
  function fmt(v){return Math.max(1,Number(v)||1).toFixed(2)+'x'}
  function status(text){var n=q('crashStatus');if(n)n.textContent=text}
  function mult(v){var n=q('crashMultiplier');if(n)n.textContent=fmt(v)}
  function nextLabel(text){var n=q('crashNextRound');if(n)n.textContent=text}
  function setCountdown(text,hide){var box=q('crashStarting'),n=q('crashCountdown');if(n)n.textContent=text;if(box)box.classList.toggle('hidden',!!hide)}
  function setTotal(seconds){var n=q('crashTotalTime');if(n)n.textContent='Total '+Math.max(0,Math.floor(seconds))+'s'}
  function seeded(seed){var x=Math.sin(seed*9301.777+49297.31)*233280;return x-Math.floor(x)}
  function roundStop(roundId){var u=Math.max(.000001,seeded(roundId));var raw=(1-HOUSE_EDGE)/u;if(seeded(roundId+17)<HOUSE_EDGE)raw=1;return Math.max(1,Math.min(60,Math.floor(raw*100)/100))}
  function multAt(seconds){return 1+seconds*.105+seconds*seconds*.024}
  function stopTime(stop){var target=Math.max(1,Number(stop)||1);var lo=0,hi=MAX_RUN_MS;for(var i=0;i<24;i++){var mid=(lo+hi)/2;if(multAt(mid/1000)>=target)hi=mid;else lo=mid}return hi}
  function cycleFor(id){var stop=roundStop(id);var runMs=Math.max(900,Math.min(MAX_RUN_MS,stopTime(stop)));return{id:id,stop:stop,runMs:runMs,cycleMs:runMs+WAIT_BETWEEN_MS}}
  function locateRound(now){var elapsed=Math.max(0,now-SCHEDULE_EPOCH);var approx=Math.max(0,Math.floor(elapsed/(WAIT_BETWEEN_MS+5200))-40);var t=SCHEDULE_EPOCH;for(var i=0;i<approx;i++){t+=cycleFor(i).cycleMs}var id=approx;while(true){var c=cycleFor(id);if(now<t+c.cycleMs){var local=now-t;var running=local<c.runMs;var waitElapsed=running?0:local-c.runMs;var nextIn=running?0:Math.max(0,WAIT_BETWEEN_MS-waitElapsed);return{id:id,start:t,local:local,runElapsed:Math.min(local,c.runMs),waitElapsed:waitElapsed,stop:c.stop,runMs:c.runMs,running:running,waiting:!running,nextIn:nextIn}}t+=c.cycleMs;id++}}
  function previousRoundIds(state,count){var ids=[];for(var id=state.id-(state.waiting?0:1);ids.length<count&&id>=0;id--)ids.push(id);return ids}
  function progressAt(runElapsed){return Math.min(.995,runElapsed/11200)}
  function getCanvas(){var canvas=q('crashCanvas');if(!canvas)return null;var dpr=Math.min(window.devicePixelRatio||1,2);var rect=canvas.getBoundingClientRect();var w=Math.max(320,Math.floor(rect.width||360));var h=Math.max(260,Math.floor(rect.height||320));if(canvasCache!==canvas||canvas.width!==w*dpr||canvas.height!==h*dpr){canvas.width=w*dpr;canvas.height=h*dpr;canvasCache=canvas;ctxCache=canvas.getContext('2d')}ctxCache.setTransform(dpr,0,0,dpr,0,0);ctxCache.__w=w;ctxCache.__h=h;return ctxCache}
  function drawGrid(ctx,w,h){ctx.save();var bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#050506');bg.addColorStop(.58,'#000');bg.addColorStop(1,'#070405');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);var glow=ctx.createRadialGradient(w*.50,h*.10,0,w*.50,h*.10,Math.max(w,h)*.78);glow.addColorStop(0,'rgba(92,10,31,.18)');glow.addColorStop(.42,'rgba(92,10,31,.045)');glow.addColorStop(1,'rgba(92,10,31,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);ctx.strokeStyle='rgba(255,255,255,.055)';ctx.lineWidth=1;for(var y=36;y<h;y+=42){ctx.beginPath();ctx.moveTo(0,Math.round(y)+.5);ctx.lineTo(w,Math.round(y)+.5);ctx.stroke()}ctx.strokeStyle='rgba(255,255,255,.034)';for(var x=-h;x<w+h;x+=46){ctx.beginPath();ctx.moveTo(x,h);ctx.lineTo(x+h,0);ctx.stroke()}ctx.strokeStyle='rgba(255,255,255,.018)';for(var x2=0;x2<w;x2+=58){ctx.beginPath();ctx.moveTo(Math.round(x2)+.5,0);ctx.lineTo(Math.round(x2)+.5,h);ctx.stroke()}ctx.restore()}
  function drawTip(ctx,x,y,ended){ctx.save();ctx.shadowColor=ended?'rgba(255,125,145,.30)':'rgba(255,255,255,.38)';ctx.shadowBlur=14;ctx.fillStyle=ended?'rgba(255,125,145,.96)':'#fff';ctx.beginPath();ctx.arc(x,y,6.5,0,Math.PI*2);ctx.fill();ctx.restore()}
  function drawGraph(progress,ended){var now=performance.now();if(!ended&&now-lastDraw<18)return;lastDraw=now;var ctx=getCanvas();if(!ctx)return;var w=ctx.__w,h=ctx.__h;ctx.clearRect(0,0,w,h);drawGrid(ctx,w,h);var visual=ended?chartCurrent:current;var left=4,bottom=h-8,right=w-16,top=8;var maxM=Math.max(3.25,visual,4.8);var p=Math.min(1,Math.max(0,progress));lastProgress=p;var easeP=1-Math.pow(1-Math.min(.995,p),1.03);var tipX=left+(right-left)*easeP;var normalized=Math.min(1,(Math.max(1,visual)-1)/(Math.max(3.25,maxM)-1));var visualY=Math.pow(Math.max(.02,normalized),1.56);var tipY=bottom-(bottom-top)*Math.max(.022,visualY);var points=[];for(var i=0;i<=110;i++){var tt=i/110;var px=left+(tipX-left)*tt;var py=bottom-(bottom-tipY)*Math.pow(tt,2.08);points.push([px,py])}ctx.save();ctx.beginPath();ctx.moveTo(left,bottom);for(var a=0;a<points.length;a++)ctx.lineTo(points[a][0],points[a][1]);ctx.lineTo(tipX,h);ctx.lineTo(left,h);ctx.closePath();var shadow=ctx.createLinearGradient(0,top,0,h);shadow.addColorStop(0,ended?'rgba(255,125,145,.30)':'rgba(255,255,255,.31)');shadow.addColorStop(.42,ended?'rgba(255,125,145,.14)':'rgba(255,255,255,.145)');shadow.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=shadow;ctx.globalAlpha=.86;ctx.fill();ctx.restore();ctx.save();var line=ctx.createLinearGradient(left,bottom,tipX,tipY);line.addColorStop(0,'rgba(255,255,255,.32)');line.addColorStop(.55,'rgba(255,255,255,1)');line.addColorStop(1,ended?'rgba(255,125,145,.72)':'rgba(255,255,255,.64)');ctx.strokeStyle=line;ctx.lineWidth=4.2;ctx.lineCap='round';ctx.lineJoin='round';ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.beginPath();ctx.moveTo(left,bottom);for(var c=0;c<points.length;c++)ctx.lineTo(points[c][0],points[c][1]);ctx.stroke();ctx.restore();drawTip(ctx,tipX,tipY,ended);if(!ended)chartCurrent=visual}
  function drawIdle(){current=1;chartCurrent=1;mult(1);drawGraph(0,true)}
  function renderHistory(state){var n=q('crashHistory');if(!n)return;var ids=previousRoundIds(state,12);n.innerHTML=ids.map(function(id){return '<span>'+fmt(roundStop(id))+'</span>'}).join('')}
  function buttons(state){var s=q('crashStart'),c=q('crashCashout');var hasBet=activeBet&&activeBet.roundId===state.id&&!activeBet.settled;if(s){s.disabled=!!hasBet||state.waiting;s.textContent=hasBet?'Bet Placed':state.waiting?'Wait Start':'Place Bet'}if(c){c.disabled=!hasBet||state.waiting||activeBet.cashed;c.textContent=activeBet&&activeBet.cashed?'Cashed Out':'Cash Out'}}
  function placeBet(){var state=locateRound(Date.now());if(state.waiting){show('Wait for round start');return}if(activeBet&&activeBet.roundId===state.id&&!activeBet.settled){show('Bet already placed');return}var bet=normalizeAmount();if(balance()<bet){show('Not enough TON balance');return}change(-bet);activeBet={roundId:state.id,amount:bet,cashed:false,settled:false};show('Bet placed')}
  function cashout(){var state=locateRound(Date.now());if(!activeBet||activeBet.roundId!==state.id||activeBet.settled||activeBet.cashed||state.waiting)return;activeBet.cashed=true;activeBet.settled=true;var back=Math.max(0,Math.floor(activeBet.amount*current));change(back);status('Cashed +' + toTon(back) + ' TON');show('Cashed at '+fmt(current));buttons(state)}
  function settleIfNeeded(state){if(activeBet&&activeBet.roundId!==state.id&&!activeBet.settled)activeBet.settled=true;if(settledRoundId!==state.id&&state.waiting){settledRoundId=state.id;renderHistory(state)}}
  function update(){var now=Date.now();var state=locateRound(now);if(currentRoundId!==state.id){currentRoundId=state.id;chartCurrent=1;current=1;lastProgress=0;lastHistoryId=null}setTotal(state.local/1000);if(state.waiting){var waitLeft=(state.nextIn/1000).toFixed(1);nextLabel('Round starts '+waitLeft+'s');setCountdown(waitLeft+'s',false);status('Waiting');drawIdle()}else{nextLabel('');setCountdown('',true);status('Running');current=Math.min(state.stop,multAt(state.runElapsed/1000));chartCurrent=current;mult(current);drawGraph(progressAt(state.runElapsed),false)}if(state.waiting&&lastHistoryId!==state.id){lastHistoryId=state.id;renderHistory(state)}settleIfNeeded(state);buttons(state);requestAnimationFrame(update)}
  function half(){var input=q('crashAmount');var value=normalizeAmount();if(input)input.value=toTon(Math.max(1,Math.floor(value/2)))}
  function doubleAmount(){var input=q('crashAmount');var value=normalizeAmount();if(input)input.value=toTon(Math.max(1,Math.min(balance(),value*2)))}
  function bind(){mult(1);status('Waiting');renderHistory(locateRound(Date.now()));var s=q('crashStart'),c=q('crashCashout'),input=q('crashAmount');if(s)s.onclick=placeBet;if(c)c.onclick=cashout;if(input)input.addEventListener('change',normalizeAmount);document.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('button');if(!b)return;var a=b.getAttribute('data-action');if(a==='crash-half'){ev.preventDefault();half()}if(a==='crash-double'){ev.preventDefault();doubleAmount()}});window.addEventListener('resize',function(){var state=locateRound(Date.now());drawGraph(lastProgress,state.waiting)});requestAnimationFrame(update)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
`;