export const PLINKO_SCRIPT = `
(function(){
  var state=null;
  var risk='medium';
  var rows=7;
  var rowOptions=[7,9,11];
  var credit=Number(localStorage.getItem('vexaCredit')||localStorage.getItem('plinkoCredit')||'1000')||1000;
  var creditIconUrl='/app/api/uploaded-image/credit-icon.png';
  var plinkoControl=null;
  var multiplierTable={
    7:{low:[2,1.4,1.1,.9,.9,1.1,1.4,2],medium:[5,2,1.2,.5,.5,1.2,2,5],high:[12,4,1.5,.2,.2,1.5,4,12]},
    9:{low:[3,1.6,1.3,1.1,.8,.8,1.1,1.3,1.6,3],medium:[8,3,1.6,1.1,.4,.4,1.1,1.6,3,8],high:[25,8,3,1.3,.2,.2,1.3,3,8,25]},
    11:{low:[4,1.8,1.5,1.2,1,.85,.85,1,1.2,1.5,1.8,4],medium:[14,4,2.2,1.5,1,.5,.5,1,1.5,2.2,4,14],high:[60,14,6,2.5,1.2,.25,.25,1.2,2.5,6,14,60]}
  };

  function q(id){return document.getElementById(id)}
  function toast(message){var n=q('toast');if(!n)return;n.textContent=message;n.style.display='block';setTimeout(function(){n.style.display='none'},2500)}
  function saveCredit(){var value=Math.max(0,Math.round(credit));localStorage.setItem('vexaCredit',String(value));localStorage.setItem('plinkoCredit',String(value))}
  function updateCredit(){var value=Math.max(0,Math.round(credit));['plinkoCredit','creditCount','plinkoCreditHeader'].forEach(function(id){var el=q(id);if(el)el.textContent=String(value)});saveCredit();try{window.dispatchEvent(new CustomEvent('vexa-credit-set',{detail:{credit:value}}))}catch(e){}}
  function forceCredit(next){var value=Math.max(0,Math.floor(Number(next)||0));if(value===Math.max(0,Math.round(credit)))return;credit=value;updateCredit();var input=q('plinkoBet');if(input&&Number(input.value)>credit)input.value=String(Math.max(1,Math.floor(credit)))}
  window.addEventListener('vexa-credit-sync',function(ev){if(ev&&ev.detail)forceCredit(ev.detail.credit)});
  window.addEventListener('storage',function(ev){if(ev&&(ev.key==='vexaCredit'||ev.key==='plinkoCredit'))forceCredit(ev.newValue)});
  window.addEventListener('vexa-credit-icon-sync',function(ev){if(ev&&ev.detail&&ev.detail.url)updateTokenImage(ev.detail.url)});
  function getBet(){var input=q('plinkoBet');var value=Math.floor(Number(input&&input.value)||0);if(value<1)value=1;if(value>credit)value=Math.floor(credit);if(input)input.value=String(value);return value}
  function fmt(n){var value=Number.isInteger(n)?String(n):String(n).replace(/^0/,'0');return value+'x'}
  function controlItem(){var rk=String(rows);return plinkoControl&&plinkoControl.enabled!==false&&plinkoControl.rows&&plinkoControl.rows[rk]&&plinkoControl.rows[rk][risk]?plinkoControl.rows[rk][risk]:null}
  function currentMultipliers(){var item=controlItem();return item&&Array.isArray(item.multipliers)&&item.multipliers.length===rows+1?item.multipliers:multiplierTable[rows][risk]}
  function currentWeights(){var item=controlItem();if(item&&Array.isArray(item.weights)&&item.weights.length===rows+1)return item.weights.map(function(v){return Math.max(0,Number(v)||0)});return Array(rows+1).fill(1)}
  function isControlled(){return plinkoControl&&plinkoControl.enabled!==false&&(plinkoControl.mode==='weighted'||plinkoControl.mode==='house')}
  function chooseWeightedIndex(){var weights=currentWeights();var sum=weights.reduce(function(a,b){return a+b},0);if(sum<=0)return Math.floor(Math.random()*(rows+1));var r=Math.random()*sum;for(var i=0;i<weights.length;i++){r-=weights[i];if(r<=0)return i}return weights.length-1}
  function pegRadius(){return rows===7?4.6:rows===9?4.35:3.48}
  function pegVisualRadius(){return rows===7?6.6:rows===9?5.25:pegRadius()}
  function ballRadius(){return rows===7?7.6:rows===9?6.75:5.65}
  function binTextSize(count){return count>=12?7.4:count>=10?8.1:8.8}
  function clamp(n,min,max){return Math.max(min,Math.min(max,n))}
  function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath()}
  function updateTokenImage(url){creditIconUrl=url||creditIconUrl;if(state&&state.tokenImg&&state.tokenImg.src!==creditIconUrl){state.tokenImg.src=creditIconUrl}}

  function loadPlinkoControl(){
    fetch('/app/api/plinko-control',{cache:'no-store'}).then(function(r){return r.json()}).then(function(data){
      if(data&&data.rows){plinkoControl=data;rebuildBoard()}
    }).catch(function(){});
  }

  function drawGlassPeg(ctx,x,y,r){
    ctx.save();
    ctx.shadowColor='rgba(255,255,255,.22)';
    ctx.shadowBlur=Math.max(2,r*.55);
    var edge=ctx.createRadialGradient(x-r*.34,y-r*.42,r*.12,x,y,r);
    edge.addColorStop(0,'rgba(255,255,255,.98)');edge.addColorStop(.34,'rgba(255,255,255,.78)');edge.addColorStop(.68,'rgba(255,255,255,.33)');edge.addColorStop(1,'rgba(255,255,255,.12)');
    ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=edge;ctx.fill();ctx.shadowBlur=0;
    var core=ctx.createRadialGradient(x-r*.24,y-r*.28,r*.05,x+r*.05,y+r*.08,r*.9);
    core.addColorStop(0,'rgba(255,255,255,.82)');core.addColorStop(.42,'rgba(255,255,255,.34)');core.addColorStop(1,'rgba(255,255,255,.07)');
    ctx.beginPath();ctx.arc(x,y,r*.78,0,Math.PI*2);ctx.fillStyle=core;ctx.fill();
    ctx.beginPath();ctx.arc(x-r*.24,y-r*.32,Math.max(1,r*.28),0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,.72)';ctx.fill();
    ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.strokeStyle='rgba(255,255,255,.62)';ctx.lineWidth=Math.max(.65,r*.11);ctx.stroke();ctx.restore();
  }
  function drawGlassBin(ctx,bin){
    ctx.save();ctx.shadowColor='rgba(255,255,255,.13)';ctx.shadowBlur=5;roundRect(ctx,bin.x,bin.y,bin.w,bin.h,8);
    var fill=ctx.createLinearGradient(bin.x,bin.y,bin.x,bin.y+bin.h);fill.addColorStop(0,'rgba(255,255,255,.20)');fill.addColorStop(.46,'rgba(255,255,255,.075)');fill.addColorStop(1,'rgba(255,255,255,.025)');ctx.fillStyle=fill;ctx.fill();ctx.shadowBlur=0;
    roundRect(ctx,bin.x+.7,bin.y+.7,bin.w-1.4,bin.h-1.4,7.4);ctx.strokeStyle='rgba(255,255,255,.48)';ctx.lineWidth=1.05;ctx.stroke();
    roundRect(ctx,bin.x+2,bin.y+2,bin.w-4,Math.max(7,bin.h*.42),6);var shine=ctx.createLinearGradient(bin.x,bin.y,bin.x,bin.y+bin.h*.55);shine.addColorStop(0,'rgba(255,255,255,.34)');shine.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=shine;ctx.fill();ctx.restore();
  }

  function setRisk(next){risk=next||'medium';document.querySelectorAll('[data-risk]').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-risk')===risk)});rebuildBoard()}
  function setRows(next){rows=Number(next)||7;var el=q('plinkoRowsValue');if(el)el.textContent=String(rows);rebuildBoard()}
  function rebuildBoard(){if(!state)return init(true);state.pegs=makePegs();state.bins=makeBins();state.balls=[];draw()}

  function makePegs(){
    var pegs=[];var top=14;var bottom=rows===11?238:rows===9?235:230;var rowGap=(bottom-top)/Math.max(1,rows-1);var slotCount=rows+1;var slotLeft=12;var slotWidth=296;var slotGap=slotWidth/slotCount;var r=pegRadius();var vr=pegVisualRadius();
    for(var row=0;row<rows;row++){var count=row+3;var start=slotLeft+((slotCount-(count-1))*slotGap)/2;var y=top+row*rowGap;for(var i=0;i<count;i++)pegs.push({x:start+i*slotGap,y:y,r:r,vr:vr})}
    return pegs;
  }

  function makeBins(){
    var multipliers=currentMultipliers();var count=rows+1;var bins=[];var left=12,top=256,width=296,height=34,gutter=3;var binW=width/count;
    for(var j=0;j<count;j++)bins.push({x:left+j*binW+gutter/2,y:top,w:binW-gutter,h:height,label:fmt(multipliers[j]),mult:Number(multipliers[j])||0});return bins;
  }

  function targetLaneX(ball,bins){if(ball.targetIndex===null||ball.targetIndex===undefined)return null;var idx=clamp(ball.targetIndex,0,bins.length-1);var target=bins[idx].x+bins[idx].w/2;var topLane=160+(idx-(bins.length-1)/2)*5.8;var progress=clamp((ball.y-18)/205,0,1);return topLane+(target-topLane)*progress}
  function binIndexFromX(x,bins,left,right){return clamp(Math.floor((x-left)/((right-left)/bins.length)),0,bins.length-1)}

  function init(force){
    var canvas=q('plinkoCanvasV2');if(!canvas)return;if(state&&state.canvas===canvas&&!force){draw();return}
    var dpr=Math.min(window.devicePixelRatio||1,3);canvas.width=320*dpr;canvas.height=306*dpr;var ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    var img=new Image();img.onload=function(){draw()};img.src=creditIconUrl;state={canvas:canvas,ctx:ctx,dpr:dpr,pegs:makePegs(),bins:makeBins(),balls:[],last:0,raf:state&&state.raf||0,tokenImg:img};
    updateCredit();setRows(rows);setRisk(risk);draw();if(!state.raf)state.raf=requestAnimationFrame(tick);
  }

  function drop(){init();if(!state)return;var bet=getBet();if(!bet||credit<bet){toast('Not enough credit');return}credit-=bet;updateCredit();var target=isControlled()?chooseWeightedIndex():null;var startX=160+(target!==null&&target!==undefined?(target-(rows/2))*5.8:0)+(Math.random()*10-5);var vx=(target!==null&&target!==undefined?(target-(rows/2))*.075:0)+(Math.random()*.42-.21);state.balls.push({x:startX,y:5,vx:vx,vy:0,r:ballRadius(),bet:bet,targetIndex:target,age:0,hitCount:0,sinking:false,sink:0,paid:false})}
  function settle(ball,bin){if(ball.paid)return;ball.paid=true;credit+=ball.bet*bin.mult;updateCredit()}

  function tick(time){
    if(!state)return;var rawDt=(time-(state.last||time))||16;var dt=Math.min(20,rawDt)/16.67;state.last=time;var balls=state.balls,bins=state.bins;var left=bins[0].x,right=bins[bins.length-1].x+bins[bins.length-1].w,binTop=bins[0].y,binBottom=bins[0].y+bins[0].h;
    for(var b=balls.length-1;b>=0;b--){var ball=balls[b];ball.age=(ball.age||0)+dt;if(ball.sinking){ball.sink+=dt;ball.y+=.46*dt;ball.r*=.978;if(ball.sink>42||ball.r<1.2)balls.splice(b,1);continue}
      ball.vy+=.205*dt;ball.vx*=.994;if(ball.vy>3.15)ball.vy=3.15;
      var lane=targetLaneX(ball,bins);if(lane!==null&&ball.y>24&&ball.y<210&&ball.age>4){var guide=ball.y<90?.0038:ball.y<155?.0048:.0035;ball.vx+=(lane-ball.x)*guide*dt;ball.vx+=(Math.random()-.5)*.025*dt}else{ball.vx+=(Math.random()-.5)*.018*dt}
      ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;if(ball.x<left+ball.r){ball.x=left+ball.r;ball.vx=Math.abs(ball.vx)*.58}if(ball.x>right-ball.r){ball.x=right-ball.r;ball.vx=-Math.abs(ball.vx)*.58}
      for(var p=0;p<state.pegs.length;p++){var peg=state.pegs[p],dx=ball.x-peg.x,dy=ball.y-peg.y,min=ball.r+peg.r,d=Math.sqrt(dx*dx+dy*dy)||1;if(d<min){ball.hitCount=(ball.hitCount||0)+1;var nx=dx/d,ny=dy/d;ball.x=peg.x+nx*min;ball.y=peg.y+ny*min;var dot=ball.vx*nx+ball.vy*ny;ball.vx=(ball.vx-1.55*dot*nx)*.82+(Math.random()-.5)*.34;ball.vy=(ball.vy-1.46*dot*ny)*.72;if(ball.vy<.32)ball.vy=.32;if(ball.vy>2.65)ball.vy=2.65}}
      if(ball.y+ball.r>binTop+5){var idx=binIndexFromX(ball.x,bins,left,right);var bin=bins[idx],holeX=bin.x+bin.w/2;ball.vx+=(holeX-ball.x)*.006*dt;ball.vy*=.965;for(var s=1;s<bins.length;s++){var wall=left+s*(right-left)/bins.length;if(Math.abs(ball.x-wall)<ball.r&&ball.y>binTop-6&&ball.y<binBottom){if(ball.x<wall){ball.x=wall-ball.r;ball.vx=-Math.abs(ball.vx)*.42}else{ball.x=wall+ball.r;ball.vx=Math.abs(ball.vx)*.42}ball.vy*=.82}}if(ball.y+ball.r>bin.y+bin.h*.62){ball.x+=(holeX-ball.x)*.10;ball.vx*=.46;ball.vy*=.18;settle(ball,bin);ball.sinking=true;ball.sink=0}}
      if(ball.y>316)balls.splice(b,1)}
    draw();state.raf=requestAnimationFrame(tick);
  }

  function draw(){if(!state)return;var ctx=state.ctx,dpr=state.dpr||1;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,320,306);for(var p=0;p<state.pegs.length;p++){var peg=state.pegs[p];drawGlassPeg(ctx,peg.x,peg.y,peg.vr||peg.r)}var bins=state.bins;var size=binTextSize(bins.length);ctx.font='800 '+size+'px Inter, system-ui, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';for(var i=0;i<bins.length;i++){var bin=bins[i];drawGlassBin(ctx,bin);ctx.fillStyle='rgba(255,255,255,.94)';ctx.fillText(bin.label,bin.x+bin.w/2,bin.y+bin.h/2)}for(var b=0;b<state.balls.length;b++){var ball=state.balls[b],img=state.tokenImg,alpha=ball.sinking?Math.max(0,1-ball.sink/40):1;ctx.save();ctx.globalAlpha=alpha;if(img&&img.complete&&img.naturalWidth>0){var sizeImg=ball.r*2.45;ctx.drawImage(img,ball.x-sizeImg/2,ball.y-sizeImg/2,sizeImg,sizeImg)}else{ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill()}ctx.restore()}}

  document.addEventListener('click',function(ev){var button=ev.target&&ev.target.closest&&ev.target.closest('button');if(!button)return;if(button.getAttribute('data-view')==='plinko')setTimeout(init,0);var action=button.getAttribute('data-action');if(action==='drop-plinko-ball'){ev.preventDefault();ev.stopPropagation();drop()}if(action==='plinko-risk'){ev.preventDefault();setRisk(button.getAttribute('data-risk'))}if(action==='plinko-rows'){ev.preventDefault();var idx=rowOptions.indexOf(rows);setRows(rowOptions[(idx+1)%rowOptions.length])}},true);
  document.addEventListener('input',function(ev){if(ev.target&&ev.target.id==='plinkoBet')getBet()});loadPlinkoControl();setInterval(loadPlinkoControl,20000);if(q('plinkoCanvasV2'))init();
})();
`;
