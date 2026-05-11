export const PLINKO_GLASS_SKIN_SCRIPT = `
(function(){
  var last=0;
  var multipliers={
    7:{low:[2,1.4,1.1,.9,.9,1.1,1.4,2],medium:[5,2,1.2,.5,.5,1.2,2,5],high:[12,4,1.5,.2,.2,1.5,4,12]},
    9:{low:[3,1.6,1.3,1.1,.8,.8,1.1,1.3,1.6,3],medium:[8,3,1.6,1.1,.4,.4,1.1,1.6,3,8],high:[25,8,3,1.3,.2,.2,1.3,3,8,25]},
    11:{low:[4,1.8,1.5,1.2,1,.85,.85,1,1.2,1.5,1.8,4],medium:[14,4,2.2,1.5,1,.5,.5,1,1.5,2.2,4,14],high:[60,14,6,2.5,1.2,.25,.25,1.2,2.5,6,14,60]}
  };
  function q(id){return document.getElementById(id)}
  function rows(){var n=Number((q('plinkoRowsValue')||{}).textContent)||7;return [7,9,11].indexOf(n)>=0?n:7}
  function risk(){var b=document.querySelector('[data-risk].active');return b?String(b.getAttribute('data-risk')||'medium'):'medium'}
  function pegRadius(r){return r===7?7.2:r===9?6.6:4.55}
  function binTextSize(count){return count>=13?6.8:count>=12?7.1:count>=11?7.6:8.4}
  function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath()}
  function fmt(v){return Number.isInteger(v)?String(v):String(v).replace(/^0/,'0')}
  function drawPeg(ctx,x,y,r){
    ctx.save();
    ctx.globalCompositeOperation='source-over';
    ctx.shadowColor='rgba(255,255,255,.34)';
    ctx.shadowBlur=4;
    ctx.beginPath();
    ctx.arc(x,y,r*1.34,0,Math.PI*2);
    ctx.fillStyle='rgba(255,255,255,.055)';
    ctx.fill();
    ctx.shadowBlur=0;

    var glass=ctx.createRadialGradient(x-r*.42,y-r*.50,r*.04,x+r*.08,y+r*.10,r*1.16);
    glass.addColorStop(0,'rgba(255,255,255,.98)');
    glass.addColorStop(.16,'rgba(255,255,255,.78)');
    glass.addColorStop(.42,'rgba(255,255,255,.25)');
    glass.addColorStop(.72,'rgba(255,255,255,.075)');
    glass.addColorStop(1,'rgba(255,255,255,.18)');
    ctx.beginPath();
    ctx.arc(x,y,r*1.02,0,Math.PI*2);
    ctx.fillStyle=glass;
    ctx.fill();

    var inner=ctx.createRadialGradient(x-r*.18,y-r*.20,r*.05,x+r*.12,y+r*.14,r*.82);
    inner.addColorStop(0,'rgba(255,255,255,.48)');
    inner.addColorStop(.48,'rgba(255,255,255,.13)');
    inner.addColorStop(1,'rgba(20,20,24,.08)');
    ctx.beginPath();
    ctx.arc(x,y,r*.74,0,Math.PI*2);
    ctx.fillStyle=inner;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x-r*.33,y-r*.37,Math.max(1.1,r*.22),0,Math.PI*2);
    ctx.fillStyle='rgba(255,255,255,.95)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x+r*.22,y+r*.28,Math.max(.75,r*.12),0,Math.PI*2);
    ctx.fillStyle='rgba(255,255,255,.28)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x,y,r*1.03,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,255,255,.72)';
    ctx.lineWidth=Math.max(.85,r*.13);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x,y,r*.58,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,255,255,.16)';
    ctx.lineWidth=.7;
    ctx.stroke();
    ctx.restore();
  }
  function drawBin(ctx,bin,label,count){
    var radius=Math.min(11,Math.max(6,bin.w*.3));
    ctx.save();
    ctx.globalCompositeOperation='source-over';
    ctx.shadowColor='rgba(255,255,255,.16)';
    ctx.shadowBlur=4;
    roundRect(ctx,bin.x,bin.y,bin.w,bin.h,radius);
    var fill=ctx.createLinearGradient(bin.x,bin.y,bin.x,bin.y+bin.h);
    fill.addColorStop(0,'rgba(255,255,255,.24)');
    fill.addColorStop(.28,'rgba(255,255,255,.10)');
    fill.addColorStop(.68,'rgba(255,255,255,.035)');
    fill.addColorStop(1,'rgba(255,255,255,.075)');
    ctx.fillStyle=fill;
    ctx.fill();
    ctx.shadowBlur=0;

    roundRect(ctx,bin.x+1,bin.y+1,bin.w-2,bin.h-2,Math.max(4,radius-1));
    ctx.strokeStyle='rgba(255,255,255,.44)';
    ctx.lineWidth=1;
    ctx.stroke();

    var shine=ctx.createLinearGradient(bin.x,bin.y,bin.x,bin.y+bin.h*.45);
    shine.addColorStop(0,'rgba(255,255,255,.32)');
    shine.addColorStop(1,'rgba(255,255,255,0)');
    roundRect(ctx,bin.x+4,bin.y+3,Math.max(2,bin.w-8),Math.min(9,bin.h*.28),Math.min(7,radius));
    ctx.fillStyle=shine;
    ctx.fill();

    ctx.font='900 '+binTextSize(count)+'px system-ui,-apple-system,BlinkMacSystemFont,sans-serif';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.shadowColor='rgba(0,0,0,.35)';
    ctx.shadowBlur=5;
    ctx.fillStyle='rgba(255,255,255,.94)';
    ctx.fillText(label,bin.x+bin.w/2,bin.y+bin.h/2+1);
    ctx.restore();
  }
  function draw(){
    var canvas=q('plinkoCanvasV2');
    var view=q('plinko');
    if(!canvas||!view||!view.classList.contains('active'))return;
    var now=performance.now();
    if(now-last<24)return;
    last=now;
    var ctx=canvas.getContext('2d');
    if(!ctx)return;
    var dpr=Math.min(window.devicePixelRatio||1,2);
    ctx.save();
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.imageSmoothingEnabled=true;
    ctx.imageSmoothingQuality='high';

    var rws=rows();
    var count=rws+1;
    var top=32;
    var bottom=rws===11?238:rws===9?235:230;
    var rowGap=(bottom-top)/Math.max(1,rws-1);
    var slotLeft=12,slotWidth=296,slotGap=slotWidth/count;
    var pr=pegRadius(rws);
    for(var row=0;row<rws;row++){
      var pegCount=row+3;
      var start=slotLeft+((count-(pegCount-1))*slotGap)/2;
      var y=top+row*rowGap;
      var rr=row===rws-1?pr*.72:pr;
      for(var i=0;i<pegCount;i++)drawPeg(ctx,start+i*slotGap,y,rr);
    }

    var values=(multipliers[rws]&&multipliers[rws][risk()])||multipliers[7].medium;
    var left=12,binTop=256,width=296,height=34,gutter=3,binW=width/count;
    for(var j=0;j<count;j++)drawBin(ctx,{x:left+j*binW+gutter/2,y:binTop,w:binW-gutter,h:height},fmt(values[j]),count);
    ctx.restore();
  }
  function loop(){draw();requestAnimationFrame(loop)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loop);else loop();
})();
`;
