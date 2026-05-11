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
  var history=[];
  var lastDraw=0;
  var canvasCache=null;
  var ctxCache=null;
  var crashTipImage=null;
  var crashTipReady=false;
  var crashTipFailed=false;
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
  function loadCrashTipImage(){
    if(crashTipImage||crashTipFailed)return;
    var img=new Image();
    img.decoding='async';
    img.onload=function(){crashTipReady=true;drawGraph(0,true)};
    img.onerror=function(){crashTipFailed=true;crashTipReady=false};
    img.src='/app/api/crash-tip-image.png?v=stable';
    crashTipImage=img;
  }
  function getCanvas(){var canvas=q('crashCanvas');if(!canvas)return null;var dpr=Math.min(window.devicePixelRatio||1,2);var rect=canvas.getBoundingClientRect();var w=Math.max(320,Math.floor(rect.width||360));var h=Math.max(320,Math.floor(rect.height||390));if(canvasCache!==canvas||canvas.width!==w*dpr||canvas.height!==h*dpr){canvas.width=w*dpr;canvas.height=h*dpr;canvasCache=canvas;ctxCache=canvas.getContext('2d')}ctxCache.setTransform(dpr,0,0,dpr,0,0);ctxCache.__w=w;ctxCache.__h=h;return ctxCache}
  function drawTip(ctx,x,y,ended){
    if(crashTipReady&&crashTipImage&&crashTipImage.naturalWidth){
      var size=ended?34:42;
      ctx.save();ctx.shadowColor='rgba(255,255,255,.18)';ctx.shadowBlur=16;ctx.drawImage(crashTipImage,x-size/2,y-size/2,size,size);ctx.restore();return;
    }
    ctx.save();ctx.shadowColor='rgba(255,255,255,.32)';ctx.shadowBlur=12;ctx.fillStyle=ended?'rgba(255,255,255,.75)':'#fff';ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  function drawAxes(ctx,left,bottom,right,top,maxM,elapsed){
    ctx.save();
    ctx.strokeStyle='rgba(160,190,210,.20)';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(left,bottom);ctx.lineTo(left,top);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.07)';ctx.lineWidth=1;
    var ticks=[1,1.2,1.3,1.5,1.7,1.8];
    ctx.font='700 11px system-ui,-apple-system,BlinkMacSystemFont,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ticks.forEach(function(v){var y=bottom-(bottom-top)*Math.min(1,(v-1)/(Math.max(1.85,maxM)-1));ctx.fillStyle='rgba(210,225,240,.72)';var label=String(v.toFixed(1))+'x';var tw=ctx.measureText(label).width+14;roundRect(ctx,left-tw-8,y-12,tw,24,4);ctx.fillStyle='rgba(120,145,162,.22)';ctx.fill();ctx.fillStyle='rgba(220,232,244,.78)';ctx.fillText(label,left-tw/2-8,y)});
    ctx.fillStyle='rgba(255,255,255,.86)';ctx.font='800 11px system-ui,-apple-system,BlinkMacSystemFont,sans-serif';ctx.textBaseline='middle';[2,4,6,8].forEach(function(s){var x=left+(right-left)*s/10;ctx.fillText(s+'s',x,bottom+26)});
    ctx.restore();
  }
  function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath()}
  function drawGraph(progress,ended){
    var now=performance.now();if(!ended&&now-lastDraw<24)return;lastDraw=now;
    var ctx=getCanvas();if(!ctx)return;var w=ctx.__w,h=ctx.__h;ctx.clearRect(0,0,w,h);
    var left=58,bottom=h-58,right=w-22,top=38;
    var elapsed=phase==='running'?(performance.now()-startTime)/1000:0;
    var maxM=Math.max(1.85,current,stopAt||1.85);
    drawAxes(ctx,left,bottom,right,top,maxM,elapsed);
    var p=Math.min(1,Math.max(0,progress));
    var tipX=left+(right-left)*Math.min(.98,p);
    var normalized=Math.min(1,(Math.max(1,current)-1)/(Math.max(1.85,maxM)-1));
    var tipY=bottom-(bottom-top)*Math.max(.02,normalized);
    ctx.save();
    ctx.strokeStyle=ended?'rgba(255,255,255,.38)':'rgba(255,255,255,.90)';ctx.lineWidth=3;ctx.lineCap='round';ctx.lineJoin='round';ctx.shadowColor='rgba(255,255,255,.20)';ctx.shadowBlur=12;
    ctx.beginPath();ctx.moveTo(left,bottom);
    for(var i=0;i<=72;i++){var t=i/72;var px=left+(tipX-left)*t;var py=bottom-(bottom-tipY)*Math.pow(t,1.7);ctx.lineTo(px,py)}
    ctx.stroke();ctx.restore();
    drawTip(ctx,tipX,tipY,ended);
  }
  function buttons(){var s=q('crashStart'),c=q('crashCashout');if(s){s.disabled=running||phase==='countdown';s.textContent=phase==='countdown'?'Starting':phase==='running'?'Running':'Start Round'}if(c)c.disabled=!(phase==='running')||cashed}
  function renderHistory(){var n=q('crashHistory');if(!n)return;n.innerHTML=history.slice(0,9).map(function(v){return '<span>'+fmt(v)+'</span>'}).join('')}
  function start(){if(running||phase==='countdown')return;var bet=normalizeAmount();if(balance()<bet){show('Not enough TON balance');return}amountNano=bet;change(-bet);running=false;cashed=false;phase='countdown';countdownStart=performance.now();stopAt=nextStop();current=1;mult(1);status('Starting');setCountdown('2.2s',false);setTotal(0);buttons();drawGraph(0,true);requestAnimationFrame(countdownTick)}
  function countdownTick(now){if(phase!=='countdown')return;var left=Math.max(0,COUNTDOWN_MS-(now-countdownStart));setCountdown((left/1000).toFixed(1)+'s',false);drawGraph(0,true);if(left<=0){phase='running';running=true;startTime=performance.now();status('Running');setCountdown('',true);buttons();requestAnimationFrame(tick);return}requestAnimationFrame(countdownTick)}
  function cashout(){if(phase!=='running'||cashed)return;cashed=true;var back=Math.max(0,Math.floor(amountNano*current));change(back);status('Cashed +' + toTon(back) + ' TON');buttons();show('Cashed at '+fmt(current))}
  function finish(){running=false;phase='crashed';history.unshift(stopAt);history=history.slice(0,12);renderHistory();status(cashed?'Round ended':'Crashed');setCountdown('Crashed',false);buttons();drawGraph(1,true);setTimeout(function(){if(phase==='crashed'){phase='ready';setCountdown('Ready',false);buttons();drawGraph(0,true)}},1800)}
  function tick(now){if(phase!=='running')return;var elapsed=(now-startTime)/1000;setTotal(elapsed);current=1+elapsed*.22+elapsed*elapsed*.055;if(current>=stopAt){current=stopAt;mult(current);finish();return}mult(current);drawGraph(Math.min(.98,elapsed/10),false);requestAnimationFrame(tick)}
  function half(){var input=q('crashAmount');var value=normalizeAmount();if(input)input.value=toTon(Math.max(1,Math.floor(value/2)))}
  function doubleAmount(){var input=q('crashAmount');var value=normalizeAmount();if(input)input.value=toTon(Math.max(1,Math.min(balance(),value*2)))}
  function bind(){loadCrashTipImage();mult(1);status('Ready');setCountdown('Ready',false);setTotal(0);drawGraph(0,true);buttons();var s=q('crashStart'),c=q('crashCashout'),input=q('crashAmount');if(s)s.onclick=start;if(c)c.onclick=cashout;if(input)input.addEventListener('change',normalizeAmount);document.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('button');if(!b)return;var a=b.getAttribute('data-action');if(a==='crash-half'){ev.preventDefault();half()}if(a==='crash-double'){ev.preventDefault();doubleAmount()}});window.addEventListener('resize',function(){drawGraph(phase==='running'?Math.min(.98,(performance.now()-startTime)/10000):0,true)})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
`;
