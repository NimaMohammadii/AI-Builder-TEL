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
  var COUNTDOWN_MS=1800;
  function q(id){return document.getElementById(id)}
  function show(text){var n=q('toast');if(!n)return;n.textContent=text;n.style.display='block';setTimeout(function(){n.style.display='none'},2200)}
  function balance(){return window.VexaTonBalance?Math.max(0,Math.floor(Number(window.VexaTonBalance.read())||0)):0}
  function change(delta){if(window.VexaTonBalance)window.VexaTonBalance.add(Math.floor(Number(delta)||0));else window.dispatchEvent(new CustomEvent('vexa-ton-balance-game-change',{detail:{deltaNano:Math.floor(Number(delta)||0)}}))}
  function toNano(value){return Math.max(0,Math.floor((Number(String(value||'').replace(',','.'))||0)*UNIT))}
  function toTon(nano){var v=Math.max(0,Math.floor(Number(nano)||0))/UNIT;return v.toFixed(4).replace(/\.0+$/,'').replace(/(\.\d*?)0+$/,'$1')}
  function normalizeAmount(){var input=q('crashAmount');var n=toNano(input&&input.value);if(n<1)n=1;if(input)input.value=toTon(n);updateBetPreview();return n}
  function fmt(v){return Math.max(1,Number(v)||1).toFixed(2)+'x'}
  function status(text){var n=q('crashStatus');if(n)n.textContent=text}
  function mult(v){var n=q('crashMultiplier');if(n)n.textContent=fmt(v)}
  function setCountdown(text){var n=q('crashCountdown');if(n)n.textContent=text}
  function updateBetPreview(){var input=q('crashAmount'),preview=q('crashBetPreview'),estimate=q('crashBetEstimate');var nano=toNano(input&&input.value);if(preview)preview.textContent=toTon(nano||10000000)+' TON';if(estimate)estimate.textContent=phase==='running'?'Live '+fmt(current):'Ready'}
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
  function getCanvas(){var canvas=q('crashCanvas');if(!canvas)return null;var dpr=Math.min(window.devicePixelRatio||1,2);var rect=canvas.getBoundingClientRect();var w=Math.max(320,Math.floor(rect.width||360));var h=Math.max(220,Math.floor(rect.height||220));if(canvasCache!==canvas||canvas.width!==w*dpr||canvas.height!==h*dpr){canvas.width=w*dpr;canvas.height=h*dpr;canvasCache=canvas;ctxCache=canvas.getContext('2d')}ctxCache.setTransform(dpr,0,0,dpr,0,0);ctxCache.__w=w;ctxCache.__h=h;return ctxCache}
  function drawTip(ctx,x,y,ended){
    if(crashTipReady&&crashTipImage&&crashTipImage.naturalWidth){
      var size=ended?28:34;
      ctx.save();ctx.shadowColor='rgba(255,255,255,.16)';ctx.shadowBlur=14;ctx.drawImage(crashTipImage,x-size/2,y-size/2,size,size);ctx.restore();return;
    }
    ctx.save();ctx.shadowColor=ended?'rgba(255,125,145,.30)':'rgba(255,255,255,.36)';ctx.shadowBlur=13;ctx.fillStyle=ended?'rgba(255,125,145,.95)':'#fff';ctx.beginPath();ctx.arc(x,y,5.5,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  function drawGrid(ctx,w,h){
    ctx.save();ctx.strokeStyle='rgba(255,255,255,.045)';ctx.lineWidth=1;
    for(var i=1;i<5;i++){var x=w*i/5;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}
    for(var j=1;j<5;j++){var y=h*j/5;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
    ctx.restore();
  }
  function drawGraph(progress,ended){
    var now=performance.now();if(!ended&&now-lastDraw<24)return;lastDraw=now;
    var ctx=getCanvas();if(!ctx)return;var w=ctx.__w,h=ctx.__h;ctx.clearRect(0,0,w,h);drawGrid(ctx,w,h);
    var left=18,bottom=h-30,right=w-42,top=24;
    var maxM=Math.max(4,current,stopAt||4);
    var p=Math.min(1,Math.max(0,progress));
    var tipX=left+(right-left)*Math.min(.98,p);
    var normalized=Math.min(1,(Math.max(1,current)-1)/(Math.max(4,maxM)-1));
    var tipY=bottom-(bottom-top)*Math.max(.02,normalized);
    ctx.save();
    var grad=ctx.createLinearGradient(left,bottom,tipX,tipY);grad.addColorStop(0,'rgba(255,255,255,.18)');grad.addColorStop(.55,'rgba(255,255,255,.92)');grad.addColorStop(1,ended?'rgba(255,125,145,.68)':'rgba(255,255,255,.48)');
    ctx.strokeStyle=grad;ctx.lineWidth=3;ctx.lineCap='round';ctx.lineJoin='round';ctx.shadowColor=ended?'rgba(255,125,145,.24)':'rgba(255,255,255,.18)';ctx.shadowBlur=10;
    ctx.beginPath();ctx.moveTo(left,bottom);
    for(var i=0;i<=72;i++){var t=i/72;var px=left+(tipX-left)*t;var py=bottom-(bottom-tipY)*Math.pow(t,1.72);ctx.lineTo(px,py)}
    ctx.stroke();ctx.restore();
    drawTip(ctx,tipX,tipY,ended);
    var dot=q('crashLiveDot');if(dot){dot.style.left=(tipX/w*100)+'%';dot.style.bottom=((h-tipY)/h*100)+'%';dot.classList.toggle('show',phase==='running'||ended);dot.classList.toggle('crashed',!!ended&&phase==='crashed')}
  }
  function buttons(){var s=q('crashStart'),c=q('crashCashout'),submit=q('crashBetSubmit');if(s){s.disabled=phase==='countdown'||phase==='running';s.textContent=phase==='countdown'?'Starting':phase==='running'?'Running':'Place bet'}if(submit)submit.disabled=phase==='countdown'||phase==='running';if(c){c.disabled=!(phase==='running')||cashed;c.textContent=cashed?'Cashed out':'Cash out'}}
  function renderHistory(){var n=q('crashHistory');if(!n)return;n.innerHTML=history.slice(0,12).map(function(v){return '<span class="'+(v>=2?'high':'')+'">'+fmt(v)+'</span>'}).join('')}
  function openSheet(){if(phase==='running'||phase==='countdown')return;var sheet=q('crashBetSheet');if(sheet){sheet.classList.add('open');sheet.setAttribute('aria-hidden','false')}updateBetPreview()}
  function closeSheet(){var sheet=q('crashBetSheet');if(sheet){sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true')}}
  function start(){if(running||phase==='countdown')return;var bet=normalizeAmount();if(balance()<bet){show('Not enough TON balance');return}amountNano=bet;change(-bet);closeSheet();running=false;cashed=false;phase='countdown';countdownStart=performance.now();stopAt=nextStop();current=1;mult(1);status('Starting');setCountdown('1.8s');buttons();drawGraph(0,true);requestAnimationFrame(countdownTick)}
  function countdownTick(now){if(phase!=='countdown')return;var left=Math.max(0,COUNTDOWN_MS-(now-countdownStart));setCountdown((left/1000).toFixed(1)+'s');drawGraph(0,true);if(left<=0){phase='running';running=true;startTime=performance.now();status('Live');setCountdown('Live');buttons();requestAnimationFrame(tick);return}requestAnimationFrame(countdownTick)}
  function cashout(){if(phase!=='running'||cashed)return;cashed=true;var back=Math.max(0,Math.floor(amountNano*current));change(back);status('Cashed +' + toTon(back) + ' TON');buttons();show('Cashed at '+fmt(current));updateBetPreview()}
  function finish(){running=false;phase='crashed';history.unshift(stopAt);history=history.slice(0,12);renderHistory();status(cashed?'Round ended':'Crashed');setCountdown('Crashed');buttons();drawGraph(1,true);setTimeout(function(){if(phase==='crashed'){phase='ready';setCountdown('Ready');status('Ready');buttons();drawGraph(0,true);updateBetPreview()}},1800)}
  function tick(now){if(phase!=='running')return;var elapsed=(now-startTime)/1000;current=1+elapsed*.22+elapsed*elapsed*.055;if(current>=stopAt){current=stopAt;mult(current);finish();return}mult(current);updateBetPreview();drawGraph(Math.min(.98,elapsed/10),false);requestAnimationFrame(tick)}
  function bind(){loadCrashTipImage();mult(1);status('Ready');setCountdown('Ready');drawGraph(0,true);buttons();updateBetPreview();var s=q('crashStart'),c=q('crashCashout'),input=q('crashAmount'),close=q('crashBetClose'),submit=q('crashBetSubmit'),sheet=q('crashBetSheet');if(s)s.onclick=openSheet;if(c)c.onclick=cashout;if(close)close.onclick=closeSheet;if(submit)submit.onclick=start;if(sheet)sheet.addEventListener('click',function(ev){if(ev.target===sheet)closeSheet()});if(input)input.addEventListener('input',updateBetPreview);document.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('button');if(!b)return;var p=b.getAttribute('data-crash-preset');if(p!==null){ev.preventDefault();if(input){input.value=p;updateBetPreview()}}});window.addEventListener('resize',function(){drawGraph(phase==='running'?Math.min(.98,(performance.now()-startTime)/10000):0,true)})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
`;
