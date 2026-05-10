export const CRASH_SCRIPT = `
(function(){
  var running=false;
  var cashed=false;
  var startTime=0;
  var stopAt=1;
  var current=1;
  var history=[];
  function q(id){return document.getElementById(id)}
  function show(text){var n=q('toast');if(!n)return;n.textContent=text;n.style.display='block';setTimeout(function(){n.style.display='none'},2200)}
  function fmt(v){return Math.max(1,Number(v)||1).toFixed(2)+'x'}
  function status(text){var n=q('crashStatus');if(n)n.textContent=text}
  function mult(v){var n=q('crashMultiplier');if(n)n.textContent=fmt(v)}
  function nextStop(){var r=Math.random();var v=1+Math.pow(r,2.15)*7.8;if(Math.random()<.2)v=1+Math.random()*.55;if(Math.random()<.035)v=9+Math.random()*14;return Math.max(1.01,Math.min(24,v))}
  function draw(progress, ended){var canvas=q('crashCanvas');if(!canvas)return;var dpr=Math.min(window.devicePixelRatio||1,2);var w=320,h=290;canvas.width=w*dpr;canvas.height=h*dpr;var ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);ctx.strokeStyle='rgba(255,255,255,.06)';ctx.lineWidth=1;for(var x=24;x<w;x+=42){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}for(var y=36;y<h;y+=42){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}var left=24,bottom=244,right=296,top=52;var maxX=left+(right-left)*Math.min(1,progress);ctx.strokeStyle=ended?'rgba(255,255,255,.34)':'rgba(255,255,255,.92)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(left,bottom);for(var i=0;i<=52;i++){var t=i/52;var px=left+(maxX-left)*t;var py=bottom-(bottom-top)*Math.pow(t,1.72)*Math.min(1,progress*.92+.08);ctx.lineTo(px,py)}ctx.stroke();ctx.fillStyle=ended?'rgba(255,255,255,.55)':'#fff';ctx.beginPath();ctx.arc(maxX,bottom-(bottom-top)*Math.min(1,progress*.92+.08),5.5,0,Math.PI*2);ctx.fill()}
  function buttons(){var s=q('crashStart'),c=q('crashCashout');if(s)s.disabled=running;if(c)c.disabled=!running||cashed}
  function renderHistory(){var n=q('crashHistory');if(!n)return;n.innerHTML=history.slice(0,9).map(function(v){return '<span>'+fmt(v)+'</span>'}).join('')}
  function start(){if(running)return;running=true;cashed=false;startTime=performance.now();stopAt=nextStop();current=1;status('Running');mult(1);buttons();draw(0,false);requestAnimationFrame(tick)}
  function cashout(){if(!running||cashed)return;cashed=true;status('Cashed at '+fmt(current));buttons();show('Cashed at '+fmt(current))}
  function finish(){running=false;history.unshift(stopAt);history=history.slice(0,12);renderHistory();status(cashed?'Round ended':'Crashed');buttons();draw(1,true)}
  function tick(now){if(!running)return;var elapsed=(now-startTime)/1000;current=1+elapsed*.45+elapsed*elapsed*.085;if(current>=stopAt){current=stopAt;mult(current);finish();return}mult(current);draw(Math.min(.98,current/Math.max(2.4,stopAt)),false);requestAnimationFrame(tick)}
  function half(){var input=q('crashAmount');var value=Math.max(.0001,Number(input&&input.value)||.01);if(input)input.value=String(Math.max(.0001,value/2).toFixed(4).replace(/\\.0+$/,'').replace(/(\\.\\d*?)0+$/,'$1'))}
  function doubleAmount(){var input=q('crashAmount');var value=Math.max(.0001,Number(input&&input.value)||.01);if(input)input.value=String((value*2).toFixed(4).replace(/\\.0+$/,'').replace(/(\\.\\d*?)0+$/,'$1'))}
  function bind(){mult(1);status('Ready');draw(0,false);buttons();var s=q('crashStart'),c=q('crashCashout');if(s)s.onclick=start;if(c)c.onclick=cashout;document.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('button');if(!b)return;var a=b.getAttribute('data-action');if(a==='crash-half'){ev.preventDefault();half()}if(a==='crash-double'){ev.preventDefault();doubleAmount()}});window.addEventListener('resize',function(){draw(running?Math.min(.98,current/Math.max(2.4,stopAt)):0,false)})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
`;
