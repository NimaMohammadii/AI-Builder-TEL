import { miniAppShellHtml } from './miniapp/shell';
import { SPECIAL_WHEEL_OVERLAY } from './special-wheel-mode';

const SPECIAL_WHEEL_VISUAL_FIX = `
<style id="special-wheel-visual-fix">
  body.special-wheel-active main.app > header.top {
    position: relative !important;
    z-index: 2147483647 !important;
    display: flex !important;
    visibility: visible !important;
    opacity: 1 !important;
    transform: none !important;
    background: #000 !important;
  }
  body.special-wheel-active main.app > header.top .brand,
  body.special-wheel-active main.app > header.top .top-balance-wrap {
    visibility: visible !important;
    opacity: 1 !important;
  }
  body.special-wheel-active main.app > header.top #rankPill {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }
  #specialWheelOverlay {
    background:
      radial-gradient(circle at 50% 42%, rgba(89, 28, 47, .075), transparent 46%),
      #000 !important;
  }
  #specialWheelOverlay > canvas.special-wheel-starfield {
    display: none !important;
  }
  #specialWheelRealStars {
    position: absolute;
    inset: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
    display: block;
    pointer-events: none;
  }
</style>
<script>
(function(){
  var overlay=document.getElementById('specialWheelOverlay');
  if(!overlay||document.getElementById('specialWheelRealStars'))return;

  var canvas=document.createElement('canvas');
  canvas.id='specialWheelRealStars';
  canvas.setAttribute('aria-hidden','true');
  overlay.insertBefore(canvas,overlay.firstChild);

  var ctx=canvas.getContext&&canvas.getContext('2d',{alpha:true});
  if(!ctx)return;

  var stars=[];
  var width=1;
  var height=1;
  var dpr=1;
  var raf=0;

  function random(seed){
    var value=Math.sin(seed*129.73+17.31)*43758.5453;
    return value-Math.floor(value);
  }

  function build(){
    stars=[];
    var count=Math.max(18,Math.min(30,Math.round(width*height/21000)));
    for(var i=0;i<count;i++){
      var r1=random(i+3);
      var r2=random(i+43);
      var r3=random(i+97);
      var r4=random(i+181);
      var r5=random(i+263);
      stars.push({
        x:r1*width,
        y:r2*height,
        size:1.8+r3*4.4,
        opacity:.16+r4*.34,
        phase:r5*Math.PI*2,
        speed:.00022+r3*.00028,
        warm:r2>.52,
        stretch:.88+r4*.24
      });
    }
  }

  function resize(){
    var rect=overlay.getBoundingClientRect();
    width=Math.max(1,rect.width);
    height=Math.max(1,rect.height);
    dpr=Math.min(3,Math.max(1,window.devicePixelRatio||1));
    canvas.width=Math.round(width*dpr);
    canvas.height=Math.round(height*dpr);
    canvas.style.width=width+'px';
    canvas.style.height=height+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    build();
  }

  function roundedStarPath(outer,inner,stretch){
    var vertical=outer*stretch;
    var control=inner*.72;
    ctx.beginPath();
    ctx.moveTo(0,-vertical);
    ctx.bezierCurveTo(control*.2,-inner,-inner*.2,-control,outer,0);
    ctx.bezierCurveTo(inner,control*.2,control*.2,inner,0,vertical);
    ctx.bezierCurveTo(-control*.2,inner,-inner,control*.2,-outer,0);
    ctx.bezierCurveTo(-inner,-control*.2,-control*.2,-inner,0,-vertical);
    ctx.closePath();
  }

  function drawStar(star,time){
    var pulse=.9+.1*Math.sin(time*star.speed+star.phase);
    var alpha=star.opacity*pulse;
    var outer=star.size*(.96+.04*pulse);
    var inner=Math.max(.72,outer*.28);
    var light=star.warm?'255,244,218':'239,246,255';

    ctx.save();
    ctx.translate(star.x,star.y);
    ctx.globalAlpha=alpha*.42;
    ctx.shadowColor='rgba('+light+',.46)';
    ctx.shadowBlur=outer*3.8;
    roundedStarPath(outer*1.08,inner*1.08,star.stretch);
    ctx.fillStyle='rgba('+light+',.34)';
    ctx.fill();

    ctx.globalAlpha=Math.min(.92,alpha*1.42);
    ctx.shadowColor='rgba('+light+',.28)';
    ctx.shadowBlur=outer*1.15;
    roundedStarPath(outer,inner,star.stretch);
    var gradient=ctx.createRadialGradient(-outer*.16,-outer*.2,0,0,0,outer*1.12);
    gradient.addColorStop(0,'rgba(255,255,255,.98)');
    gradient.addColorStop(.36,'rgba('+light+',.92)');
    gradient.addColorStop(1,'rgba('+light+',.56)');
    ctx.fillStyle=gradient;
    ctx.fill();

    ctx.globalAlpha=Math.min(1,alpha*1.7);
    ctx.shadowBlur=0;
    ctx.beginPath();
    ctx.arc(-outer*.13,-outer*.16,Math.max(.32,outer*.13),0,Math.PI*2);
    ctx.fillStyle='rgba(255,255,255,.88)';
    ctx.fill();
    ctx.restore();
  }

  function frame(time){
    if(!overlay.classList.contains('active')){
      raf=0;
      return;
    }
    ctx.clearRect(0,0,width,height);
    for(var i=0;i<stars.length;i++)drawStar(stars[i],time);
    raf=requestAnimationFrame(frame);
  }

  function start(){
    resize();
    if(!raf)raf=requestAnimationFrame(frame);
  }

  function stop(){
    if(raf){cancelAnimationFrame(raf);raf=0;}
    ctx.clearRect(0,0,width,height);
  }

  function sync(){
    if(overlay.classList.contains('active'))start();
    else stop();
  }

  new MutationObserver(sync).observe(overlay,{attributes:true,attributeFilter:['class']});
  window.addEventListener('resize',function(){if(overlay.classList.contains('active'))resize()},{passive:true});
  sync();
})();
</script>`;

export function miniAppHtml(): string {
  return miniAppShellHtml().replace(
    '</body>',
    `${SPECIAL_WHEEL_OVERLAY}${SPECIAL_WHEEL_VISUAL_FIX}</body>`,
  );
}
