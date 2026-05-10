export const PLINKO_TON_SCRIPT = `
(function(){
  var NANO=1000000000;
  var risk='medium';
  var rows=7;
  var running=false;
  var multipliers={
    7:{low:[2,1.4,1.1,.9,.9,1.1,1.4,2],medium:[5,2,1.2,.5,.5,1.2,2,5],high:[12,4,1.5,.2,.2,1.5,4,12]},
    9:{low:[3,1.6,1.3,1.1,.8,.8,1.1,1.3,1.6,3],medium:[8,3,1.6,1.1,.4,.4,1.1,1.6,3,8],high:[25,8,3,1.3,.2,.2,1.3,3,8,25]},
    11:{low:[4,1.8,1.5,1.2,1,.85,.85,1,1.2,1.5,1.8,4],medium:[14,4,2.2,1.5,1,.5,.5,1,1.5,2.2,4,14],high:[60,14,6,2.5,1.2,.25,.25,1.2,2.5,6,14,60]}
  };
  function q(id){return document.getElementById(id)}
  function toast(text){var n=q('toast');if(!n)return;n.textContent=text;n.style.display='block';setTimeout(function(){n.style.display='none'},2400)}
  function toNano(value){return Math.max(0,Math.floor((Number(String(value||'').replace(',','.'))||0)*NANO))}
  function toTon(nano){var v=Math.max(0,Math.floor(Number(nano)||0))/NANO;return v.toFixed(4).replace(/\.0+$/,'').replace(/(\.\d*?)0+$/,'$1')}
  function readBalance(){return window.VexaTonBalance?Math.max(0,Math.floor(Number(window.VexaTonBalance.read())||0)):0}
  function addBalance(deltaNano){if(window.VexaTonBalance)window.VexaTonBalance.add(Math.floor(Number(deltaNano)||0));else window.dispatchEvent(new CustomEvent('vexa-ton-balance-game-change',{detail:{deltaNano:Math.floor(Number(deltaNano)||0)}}))}
  function betNano(){var input=q('plinkoBet');var nano=toNano(input&&input.value);if(nano<1)nano=1;return nano}
  function setBetNano(nano){var input=q('plinkoBet');if(input)input.value=toTon(Math.max(1,Math.floor(Number(nano)||1)))}
  function currentMultipliers(){return (multipliers[rows]&&multipliers[rows][risk])||multipliers[7].medium}
  function round(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath()}
  function draw(ball){
    var canvas=q('plinkoCanvasV2');if(!canvas)return;
    var dpr=Math.min(window.devicePixelRatio||1,2);
    var w=320,h=430;
    if(canvas.width!==w*dpr)canvas.width=w*dpr;
    if(canvas.height!==h*dpr)canvas.height=h*dpr;
    var ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    ctx.save();ctx.fillStyle='rgba(255,255,255,.94)';ctx.shadowColor='rgba(255,255,255,.34)';ctx.shadowBlur=8;
    var top=34,bottom=286;
    for(var r=0;r<rows;r++){
      var count=r+3;var y=top+(bottom-top)/Math.max(1,rows-1)*r;
      for(var i=0;i<count;i++){var x=160-(count-1)*13.2+i*26.4;ctx.beginPath();ctx.arc(x,y,rows===11?3.8:rows===9?4.5:5.2,0,Math.PI*2);ctx.fill()}
    }
    ctx.restore();
    var arr=currentMultipliers();var left=12,width=296,binW=width/arr.length;
    for(var b=0;b<arr.length;b++){
      var x=left+b*binW+1.2;ctx.fillStyle='rgba(255,255,255,.08)';ctx.strokeStyle='rgba(255,255,255,.32)';ctx.lineWidth=1;round(ctx,x,344,binW-2.4,38,9);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.font='800 '+(arr.length>10?'7':'9')+'px system-ui';ctx.textAlign='center';ctx.fillText(String(arr[b])+'x',x+(binW-2.4)/2,367)
    }
    if(ball){ctx.fillStyle='#fff';ctx.shadowColor='rgba(255,255,255,.65)';ctx.shadowBlur=12;ctx.beginPath();ctx.arc(ball.x,ball.y,7,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0}
  }
  function animate(index,winNano){
    var arr=currentMultipliers();var target=12+(index+.5)*(296/arr.length);var frame=0,total=58;
    function step(){frame++;var t=frame/total;var x=160+(target-160)*t+Math.sin(t*Math.PI*rows)*16*(1-t);var y=8+348*t;draw({x:x,y:y});if(frame<total){requestAnimationFrame(step)}else{draw();if(winNano>0)addBalance(winNano);toast('Result '+toTon(winNano)+' TON');running=false}}
    step();
  }
  function drop(){
    if(running){toast('Wait for current ball');return}
    var bet=betNano();if(readBalance()<bet){toast('Not enough TON balance');return}
    running=true;addBalance(-bet);var arr=currentMultipliers();var index=Math.floor(Math.random()*arr.length);var win=Math.max(0,Math.floor(bet*(Number(arr[index])||0)));animate(index,win)
  }
  function normalizeInput(){var input=q('plinkoBet');if(!input)return;input.setAttribute('inputmode','decimal');input.setAttribute('step','0.0001');if(!input.value||Number(input.value)>1000)input.value='0.01'}
  document.addEventListener('click',function(ev){var button=ev.target&&ev.target.closest&&ev.target.closest('button');if(!button)return;var action=button.getAttribute('data-action');if(action==='drop-plinko-ball'){ev.preventDefault();ev.stopImmediatePropagation();drop();return}if(action==='plinko-risk'){risk=button.getAttribute('data-risk')||'medium';document.querySelectorAll('[data-risk]').forEach(function(x){x.classList.toggle('active',x===button)});draw();return}if(action==='plinko-rows'){rows=rows===7?9:rows===9?11:7;var el=q('plinkoRowsValue');if(el)el.textContent=String(rows);draw();return}if(action==='plinko-bet-half'){ev.preventDefault();setBetNano(Math.max(1,Math.floor(betNano()/2)));return}if(action==='plinko-bet-double'){ev.preventDefault();setBetNano(Math.max(1,Math.min(readBalance(),betNano()*2)));return}},true);
  window.addEventListener('resize',draw);window.addEventListener('vexa-ton-balance-sync',function(){normalizeInput();draw()});
  function start(){normalizeInput();draw();setTimeout(draw,250);setTimeout(draw,900)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
`;
