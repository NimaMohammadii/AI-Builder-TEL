export const CRASH_SCRIPT = `
(function(){
  var UNIT=1000000000;
  var HOUSE_EDGE=.04;
  var running=false;
  var cashed=false;
  var amountNano=0;
  var startTime=0;
  var stopAt=1;
  var current=1;
  var history=[];
  var lastDraw=0;
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
  function nextStop(){var u=Math.max(.000001,Math.random());var raw=(1-HOUSE_EDGE)/u;if(Math.random()<HOUSE_EDGE)raw=1;return Math.max(1,Math.min(35,Math.floor(raw*100)/100))}
  function getCanvas(){var canvas=q('crashCanvas');if(!canvas)return null;var dpr=Math.min(window.devicePixelRatio||1,2);var w=320,h=290;if(canvasCache!==canvas||canvas.width!==w*dpr||canvas.height!==h*dpr){canvas.width=w*dpr;canvas.height=h*dpr;canvasCache=canvas;ctxCache=canvas.getContext('2d')}ctxCache.setTransform(dpr,0,0,dpr,0,0);return ctxCache}
  function draw(progress, ended){var now=performance.now();if(!ended&&now-lastDraw<32)return;lastDraw=now;var ctx=getCanvas();if(!ctx)return;var w=320,h=290;ctx.clearRect(0,0,w,h);ctx.strokeStyle='rgba(255,255,255,.055)';ctx.lineWidth=1;for(var x=24;x<w;x+=42){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}for(var y=36;y<h;y+=42){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}var left=24,bottom=244,right=296,top=52;var p=Math.min(1,Math.max(0,progress));var maxX=left+(right-left)*p;ctx.strokeStyle=ended?'rgba(255,255,255,.38)':'rgba(255,255,255,.92)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(left,bottom);for(var i=0;i<=38;i++){var t=i/38;var px=left+(maxX-left)*t;var py=bottom-(bottom-top)*Math.pow(t,1.65)*Math.min(1,p*.92+.08);ctx.lineTo(px,py)}ctx.stroke();ctx.fillStyle=ended?'rgba(255,255,255,.55)':'#fff';ctx.beginPath();ctx.arc(maxX,bottom-(bottom-top)*Math.min(1,p*.92+.08),5.5,0,Math.PI*2);ctx.fill()}
  function buttons(){var s=q('crashStart'),c=q('crashCashout');if(s)s.disabled=running;if(c)c.disabled=!running||cashed}
  function renderHistory(){var n=q('crashHistory');if(!n)return;n.innerHTML=history.slice(0,9).map(function(v){return '<span>'+fmt(v)+'</span>'}).join('')}
  function start(){if(running)return;var bet=normalizeAmount();if(balance()<bet){show('Not enough TON balance');return}amountNano=bet;change(-bet);running=true;cashed=false;startTime=performance.now();stopAt=nextStop();current=1;status('Running');mult(1);buttons();draw(0,false);requestAnimationFrame(tick)}
  function cashout(){if(!running||cashed)return;cashed=true;var back=Math.max(0,Math.floor(amountNano*current));change(back);status('Cashed +' + toTon(back) + ' TON');buttons();show('Cashed at '+fmt(current))}
  function finish(){running=false;history.unshift(stopAt);history=history.slice(0,12);renderHistory();status(cashed?'Round ended':'Crashed');buttons();draw(1,true)}
  function tick(now){if(!running)return;var elapsed=(now-startTime)/1000;current=1+elapsed*.42+elapsed*elapsed*.11;if(current>=stopAt){current=stopAt;mult(current);finish();return}mult(current);draw(Math.min(.985,current/Math.max(2.5,stopAt)),false);requestAnimationFrame(tick)}
  function half(){var input=q('crashAmount');var value=normalizeAmount();if(input)input.value=toTon(Math.max(1,Math.floor(value/2)))}
  function doubleAmount(){var input=q('crashAmount');var value=normalizeAmount();if(input)input.value=toTon(Math.max(1,Math.min(balance(),value*2)))}
  function bind(){mult(1);status('Ready');draw(0,true);buttons();var s=q('crashStart'),c=q('crashCashout'),input=q('crashAmount');if(s)s.onclick=start;if(c)c.onclick=cashout;if(input)input.addEventListener('change',normalizeAmount);document.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('button');if(!b)return;var a=b.getAttribute('data-action');if(a==='crash-half'){ev.preventDefault();half()}if(a==='crash-double'){ev.preventDefault();doubleAmount()}});window.addEventListener('resize',function(){draw(running?Math.min(.985,current/Math.max(2.5,stopAt)):0,true)})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
`;
