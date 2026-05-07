export const PLINKO_SCRIPT = `
(function(){
  var state=null;
  var risk='medium';
  var rows=7;
  var rowOptions=[7,9,12];
  var credit=Number(localStorage.getItem('plinkoCredit')||'1000')||1000;
  var multiplierTable={
    7:{
      low:[2,1.4,1.1,.9,.9,1.1,1.4,2],
      medium:[5,2,1.2,.5,.5,1.2,2,5],
      high:[12,4,1.5,.2,.2,1.5,4,12]
    },
    9:{
      low:[3,1.6,1.3,1.1,.8,.8,1.1,1.3,1.6,3],
      medium:[8,3,1.6,1.1,.4,.4,1.1,1.6,3,8],
      high:[25,8,3,1.3,.2,.2,1.3,3,8,25]
    },
    12:{
      low:[5,2,1.6,1.3,1.1,.9,.8,.9,1.1,1.3,1.6,2,5],
      medium:[18,5,2.5,1.6,1.1,.5,.3,.5,1.1,1.6,2.5,5,18],
      high:[80,18,7,3,1.5,.5,.2,.5,1.5,3,7,18,80]
    }
  };

  function q(id){return document.getElementById(id)}
  function toast(message){var n=q('toast');if(!n)return;n.textContent=message;n.style.display='block';setTimeout(function(){n.style.display='none'},2500)}
  function saveCredit(){localStorage.setItem('plinkoCredit',String(Math.max(0,Math.round(credit))))}
  function updateCredit(){var el=q('plinkoCredit');if(el)el.textContent=String(Math.max(0,Math.round(credit)));saveCredit()}
  function getBet(){var input=q('plinkoBet');var value=Math.floor(Number(input&&input.value)||0);if(value<1)value=1;if(value>credit)value=Math.floor(credit);if(input)input.value=String(value);return value}
  function fmt(n){return Number.isInteger(n)?'X'+n:'X'+String(n).replace(/^0/,'')}
  function currentMultipliers(){return multiplierTable[rows][risk]}
  function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath()}

  function setRisk(next){
    risk=next||'medium';
    document.querySelectorAll('[data-risk]').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-risk')===risk)});
    rebuildBoard();
  }

  function setRows(next){
    rows=Number(next)||7;
    var el=q('plinkoRowsValue');if(el)el.textContent=String(rows);
    rebuildBoard();
  }

  function rebuildBoard(){
    if(!state)return init(true);
    state.pegs=makePegs();
    state.bins=makeBins();
    state.balls=[];
    draw();
  }

  function makePegs(){
    var pegs=[];
    var boardW=320, top=16, bottom=236;
    var rowGap=(bottom-top)/Math.max(1,rows-1);
    for(var row=0;row<rows;row++){
      var count=row+3;
      var maxWidth=Math.min(292,36+row*22);
      var gap=count>1?maxWidth/(count-1):0;
      var start=boardW/2-maxWidth/2;
      var y=top+row*rowGap;
      for(var i=0;i<count;i++)pegs.push({x:start+i*gap,y:y,r:4});
    }
    return pegs;
  }

  function makeBins(){
    var multipliers=currentMultipliers();
    var count=rows+1;
    var bins=[];
    var left=12,top=250,width=296,height=46,gutter=3;
    var binW=width/count;
    for(var j=0;j<count;j++)bins.push({x:left+j*binW+gutter/2,y:top,w:binW-gutter,h:height,label:fmt(multipliers[j]),mult:multipliers[j]});
    return bins;
  }

  function init(force){
    var canvas=q('plinkoCanvasV2');
    if(!canvas)return;
    if(state&&state.canvas===canvas&&!force){draw();return}
    var dpr=Math.min(window.devicePixelRatio||1,3);
    canvas.width=320*dpr;
    canvas.height=306*dpr;
    var ctx=canvas.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.imageSmoothingEnabled=true;
    ctx.imageSmoothingQuality='high';
    var img=new Image();
    img.onload=function(){draw()};
    img.src='/app/api/credit-icon.png';
    state={canvas:canvas,ctx:ctx,dpr:dpr,pegs:makePegs(),bins:makeBins(),balls:[],last:0,raf:state&&state.raf||0,tokenImg:img};
    updateCredit();
    setRows(rows);
    setRisk(risk);
    draw();
    if(!state.raf)state.raf=requestAnimationFrame(tick);
  }

  function drop(){
    init();
    if(!state)return;
    var bet=getBet();
    if(!bet||credit<bet){toast('Not enough credit');return}
    credit-=bet;
    updateCredit();
    state.balls.push({x:160+(Math.random()*14-7),y:8,vx:Math.random()*.8-.4,vy:0,r:9,bet:bet,sinking:false,sink:0,paid:false});
  }

  function settle(ball,bin){
    if(ball.paid)return;
    ball.paid=true;
    credit+=ball.bet*bin.mult;
    updateCredit();
  }

  function tick(time){
    if(!state)return;
    var dt=Math.min(24,(time-(state.last||time))||16)/16.67;
    state.last=time;
    var balls=state.balls;
    var bins=state.bins;
    var left=bins[0].x,right=bins[bins.length-1].x+bins[bins.length-1].w,binTop=bins[0].y,binBottom=bins[0].y+bins[0].h;
    for(var b=balls.length-1;b>=0;b--){
      var ball=balls[b];
      if(ball.sinking){ball.sink+=dt;ball.y+=.7*dt;ball.r*=.965;if(ball.sink>32||ball.r<1.2)balls.splice(b,1);continue}
      ball.vy+=.36*dt;ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;
      if(ball.x<left+ball.r){ball.x=left+ball.r;ball.vx=Math.abs(ball.vx)*.64}
      if(ball.x>right-ball.r){ball.x=right-ball.r;ball.vx=-Math.abs(ball.vx)*.64}
      for(var p=0;p<state.pegs.length;p++){
        var peg=state.pegs[p];var dx=ball.x-peg.x,dy=ball.y-peg.y;var min=ball.r+peg.r;var d=Math.sqrt(dx*dx+dy*dy)||1;
        if(d<min){var nx=dx/d,ny=dy/d;ball.x=peg.x+nx*min;ball.y=peg.y+ny*min;var dot=ball.vx*nx+ball.vy*ny;ball.vx=(ball.vx-1.42*dot*nx)*.72+(Math.random()-.5)*.18;ball.vy=(ball.vy-1.42*dot*ny)*.72;if(ball.vy<.54)ball.vy=.54}
      }
      if(ball.y+ball.r>binTop+5){
        var idx=Math.max(0,Math.min(bins.length-1,Math.floor((ball.x-left)/((right-left)/bins.length))));
        var bin=bins[idx];var holeX=bin.x+bin.w/2;ball.vx+=(holeX-ball.x)*.018*dt;
        for(var s=1;s<bins.length;s++){var wall=left+s*(right-left)/bins.length;if(Math.abs(ball.x-wall)<ball.r&&ball.y>binTop-4&&ball.y<binBottom){if(ball.x<wall){ball.x=wall-ball.r;ball.vx=-Math.abs(ball.vx)*.36}else{ball.x=wall+ball.r;ball.vx=Math.abs(ball.vx)*.36}}}
        if(ball.y+ball.r>bin.y+bin.h*.42){ball.x+=(holeX-ball.x)*.18;ball.vx*=.38;ball.vy*=.22;settle(ball,bin);ball.sinking=true;ball.sink=0}
      }
      if(ball.y>302){balls.splice(b,1)}
    }
    draw();state.raf=requestAnimationFrame(tick);
  }

  function draw(){
    if(!state)return;
    var ctx=state.ctx,dpr=state.dpr||1;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,320,306);ctx.fillStyle='#fff';
    for(var p=0;p<state.pegs.length;p++){var peg=state.pegs[p];ctx.beginPath();ctx.arc(peg.x,peg.y,peg.r,0,Math.PI*2);ctx.fill()}
    var bins=state.bins;ctx.font='800 9px Inter, system-ui, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    for(var i=0;i<bins.length;i++){var bin=bins[i];roundRect(ctx,bin.x,bin.y,bin.w,bin.h,8);ctx.fillStyle='rgba(255,255,255,.035)';ctx.fill();ctx.strokeStyle='rgba(255,255,255,.62)';ctx.lineWidth=1.1;ctx.stroke();ctx.fillStyle='rgba(255,255,255,.86)';ctx.fillText(bin.label,bin.x+bin.w/2,bin.y+bin.h-14)}
    for(var b=0;b<state.balls.length;b++){var ball=state.balls[b];var img=state.tokenImg;var alpha=ball.sinking?Math.max(0,1-ball.sink/30):1;ctx.save();ctx.globalAlpha=alpha;if(img&&img.complete&&img.naturalWidth>0){var size=ball.r*2.45;ctx.drawImage(img,ball.x-size/2,ball.y-size/2,size,size)}else{ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill()}ctx.restore()}
  }

  document.addEventListener('click',function(ev){
    var button=ev.target&&ev.target.closest&&ev.target.closest('button');if(!button)return;
    if(button.getAttribute('data-view')==='plinko')setTimeout(init,0);
    var action=button.getAttribute('data-action');
    if(action==='drop-plinko-ball'){ev.preventDefault();ev.stopPropagation();drop()}
    if(action==='plinko-risk'){ev.preventDefault();setRisk(button.getAttribute('data-risk'))}
    if(action==='plinko-rows'){ev.preventDefault();var idx=rowOptions.indexOf(rows);setRows(rowOptions[(idx+1)%rowOptions.length])}
  },true);

  document.addEventListener('input',function(ev){if(ev.target&&ev.target.id==='plinkoBet')getBet()});
  if(q('plinkoCanvasV2'))init();
})();
`;
