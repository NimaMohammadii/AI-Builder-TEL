export const CRASH_SCRIPT = `
(function(){
  var UNIT=1000000000;
  var HOUSE_EDGE=.04;
  var phase='ready';
  var running=false;
  var cashed=false;
  var amountNano=0;
  var countdownStart=0;
  var startTime=0;
  var stopAt=1;
  var current=1;
  var chartCurrent=1;
  var history=[];
  var lastDraw=0;
  var lastProgress=0;
  var canvasCache=null;
  var ctxCache=null;
  var COUNTDOWN_MS=2200;
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
  function setCountdown(text,hide){var box=q('crashStarting'),n=q('crashCountdown');if(n)n.textContent=text;if(box)box.classList.toggle('hidden',!!hide)}
  function setTotal(seconds){var n=q('crashTotalTime');if(n)n.textContent='Total '+Math.max(0,Math.floor(seconds))+'s'}
  function nextStop(){var u=Math.max(.000001,Math.random());var raw=(1-HOUSE_EDGE)/u;if(Math.random()<HOUSE_EDGE)raw=1;return Math.max(1,Math.min(60,Math.floor(raw*100)/100))}
  function getCanvas(){var canvas=q('crashCanvas');if(!canvas)return null;var dpr=Math.min(window.devicePixelRatio||1,2);var rect=canvas.getBoundingClientRect();var w=Math.max(320,Math.floor(rect.width||360));var h=Math.max(260,Math.floor(rect.height||320));if(canvasCache!==canvas||canvas.width!==w*dpr||canvas.height!==h*dpr){canvas.width=w*dpr;canvas.height=h*dpr;canvasCache=canvas;ctxCache=canvas.getContext('2d')}ctxCache.setTransform(dpr,0,0,dpr,0,0);ctxCache.__w=w;ctxCache.__h=h;return ctxCache}
  function drawGrid(ctx,w,h){
    ctx.save();
    var bg=ctx.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#050506');bg.addColorStop(.58,'#000');bg.addColorStop(1,'#070405');
    ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    var glow=ctx.createRadialGradient(w*.50,h*.10,0,w*.50,h*.10,Math.max(w,h)*.78);
    glow.addColorStop(0,'rgba(92,10,31,.18)');glow.addColorStop(.42,'rgba(92,10,31,.045)');glow.addColorStop(1,'rgba(92,10,31,0)');
    ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='rgba(255,255,255,.055)';ctx.lineWidth=1;
    for(var y=36;y<h;y+=42){ctx.beginPath();ctx.moveTo(0,Math.round(y)+.5);ctx.lineTo(w,Math.round(y)+.5);ctx.stroke()}
    ctx.strokeStyle='rgba(255,255,255,.034)';
    for(var x=-h;x<w+h;x+=46){ctx.beginPath();ctx.moveTo(x,h);ctx.lineTo(x+h,0);ctx.stroke()}
    ctx.strokeStyle='rgba(255,255,255,.018)';
    for(var x2=0;x2<w;x2+=58){ctx.beginPath();ctx.moveTo(Math.round(x2)+.5,0);ctx.lineTo(Math.round(x2)+.5,h);ctx.stroke()}
    ctx.restore();
  }
  function drawTip(ctx,x,y,ended){ctx.save();ctx.shadowColor=ended?'rgba(255,125,145,.30)':'rgba(255,255,255,.38)';ctx.shadowBlur=14;ctx.fillStyle=ended?'rgba(255,125,145,.96)':'#fff';ctx.beginPath();ctx.arc(x,y,6.5,0,Math.PI*2);ctx.fill();ctx.restore()}
  function drawGraph(progress,ended){
    var now=performance.now();if(!ended&&now-lastDraw<24)return;lastDraw=now;
    var ctx=getCanvas();if(!ctx)return;var w=ctx.__w,h=ctx.__h;ctx.clearRect(0,0,w,h);drawGrid(ctx,w,h);
    var visual=ended?chartCurrent:current;
    var left=10,bottom=h-18,right=w-34,top=14;
    var maxM=Math.max(3.2,visual,stopAt||3.2);
    var p=Math.min(1,Math.max(0,progress));lastProgress=p;
    var tipX=left+(right-left)*Math.min(.985,p);
    var normalized=Math.min(1,(Math.max(1,visual)-1)/(Math.max(3.2,maxM)-1));
    var tipY=bottom-(bottom-top)*Math.max(.02,normalized);
    ctx.save();
    var line=ctx.createLinearGradient(left,bottom,tipX,tipY);line.addColorStop(0,'rgba(255,255,255,.22)');line.addColorStop(.52,'rgba(255,255,255,.98)');line.addColorStop(1,ended?'rgba(255,125,145,.58)':'rgba(255,255,255,.46)');
    ctx.strokeStyle=line;ctx.lineWidth=3.4;ctx.lineCap='round';ctx.lineJoin='round';ctx.shadowColor=ended?'rgba(255,125,145,.18)':'rgba(255,255,255,.16)';ctx.shadowBlur=10;
    ctx.beginPath();ctx.moveTo(left,bottom);
    for(var i=0;i<=84;i++){var t=i/84;var px=left+(tipX-left)*t;var py=bottom-(bottom-tipY)*Math.pow(t,1.72);ctx.lineTo(px,py)}
    ctx.stroke();ctx.lineTo(tipX,h);ctx.lineTo(left,h);ctx.closePath();
    var fill=ctx.createLinearGradient(0,top,0,h);fill.addColorStop(0,ended?'rgba(255,125,145,.10)':'rgba(255,255,255,.10)');fill.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=fill;ctx.globalAlpha=.72;ctx.fill();ctx.restore();
    drawTip(ctx,tipX,tipY,ended);
    if(!ended)chartCurrent=visual;
  }
  function buttons(){var s=q('crashStart'),c=q('crashCashout');if(s){s.disabled=running||phase==='countdown';s.textContent=phase==='countdown'?'Starting':phase==='running'?'Running':'Start Round'}if(c)c.disabled=!(phase==='running')||cashed}
  function renderHistory(){var n=q('crashHistory');if(!n)return;n.innerHTML=history.slice(0,9).map(function(v){return '<span>'+fmt(v)+'</span>'}).join('')}
  function start(){if(running||phase==='countdown')return;var bet=normalizeAmount();if(balance()<bet){show('Not enough TON balance');return}amountNano=bet;change(-bet);running=false;cashed=false;phase='countdown';countdownStart=performance.now();stopAt=nextStop();current=1;chartCurrent=1;lastProgress=0;mult(1);status('Starting');setCountdown('2.2s',false);setTotal(0);buttons();drawGraph(0,true);requestAnimationFrame(countdownTick)}
  function countdownTick(now){if(phase!=='countdown')return;var left=Math.max(0,COUNTDOWN_MS-(now-countdownStart));setCountdown((left/1000).toFixed(1)+'s',false);drawGraph(0,true);if(left<=0){phase='running';running=true;startTime=performance.now();status('Running');setCountdown('',true);buttons();requestAnimationFrame(tick);return}requestAnimationFrame(countdownTick)}
  function cashout(){if(phase!=='running'||cashed)return;cashed=true;var back=Math.max(0,Math.floor(amountNano*current));change(back);status('Cashed +' + toTon(back) + ' TON');buttons();show('Cashed at '+fmt(current))}
  function finish(){running=false;phase='crashed';history.unshift(stopAt);history=history.slice(0,12);renderHistory();status(cashed?'Round ended':'Crashed');setCountdown('Crashed',false);buttons();drawGraph(lastProgress,true);setTimeout(function(){if(phase==='crashed'){phase='ready';setCountdown('Ready',false);buttons();current=1;chartCurrent=1;drawGraph(0,true)}},1800)}
  function tick(now){if(phase!=='running')return;var elapsed=(now-startTime)/1000;setTotal(elapsed);var next=1+elapsed*.22+elapsed*elapsed*.055;if(next>=stopAt){current=stopAt;mult(current);finish();return}current=next;chartCurrent=current;mult(current);drawGraph(Math.min(.985,elapsed/7.2),false);requestAnimationFrame(tick)}
  function half(){var input=q('crashAmount');var value=normalizeAmount();if(input)input.value=toTon(Math.max(1,Math.floor(value/2)))}
  function doubleAmount(){var input=q('crashAmount');var value=normalizeAmount();if(input)input.value=toTon(Math.max(1,Math.min(balance(),value*2)))}
  function bind(){mult(1);status('Ready');setCountdown('Ready',false);setTotal(0);drawGraph(0,true);buttons();var s=q('crashStart'),c=q('crashCashout'),input=q('crashAmount');if(s)s.onclick=start;if(c)c.onclick=cashout;if(input)input.addEventListener('change',normalizeAmount);document.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('button');if(!b)return;var a=b.getAttribute('data-action');if(a==='crash-half'){ev.preventDefault();half()}if(a==='crash-double'){ev.preventDefault();doubleAmount()}});window.addEventListener('resize',function(){drawGraph(phase==='running'?Math.min(.985,(performance.now()-startTime)/7200):0,true)})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
`;