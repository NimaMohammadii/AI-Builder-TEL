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

  var ctx=canvas.getContext&&canvas.getContext('2d',{alpha:true,desynchronized:true});
  if(!ctx)return;

  var stars=[];
  var width=1;
  var height=1;
  var dpr=1;
  var raf=0;

  function random(seed){
    var value=Math.sin(seed*137.17+19.73)*43758.5453123;
    return value-Math.floor(value);
  }

  function build(){
    stars=[];
    var count=Math.max(16,Math.min(28,Math.round(width*height/23000)));
    for(var i=0;i<count;i++){
      var r1=random(i+5);
      var r2=random(i+47);
      var r3=random(i+101);
      var r4=random(i+193);
      var r5=random(i+271);
      var r6=random(i+359);
      var depth=.35+r6*.65;
      stars.push({
        x:r1*width,
        y:r2*height,
        size:(1.45+r3*3.95)*depth,
        opacity:(.12+r4*.31)*(.72+depth*.28),
        phase:r5*Math.PI*2,
        speed:.00013+r3*.00018,
        warm:r2>.58,
        stretch:.94+r4*.16,
        rotation:(r6-.5)*.2,
        flare:r3>.68,
        depth:depth
      });
    }
  }

  function resize(){
    var rect=overlay.getBoundingClientRect();
    width=Math.max(1,rect.width);
    height=Math.max(1,rect.height);
    dpr=Math.min(4,Math.max(1,window.devicePixelRatio||1));
    canvas.width=Math.round(width*dpr);
    canvas.height=Math.round(height*dpr);
    canvas.style.width=width+'px';
    canvas.style.height=height+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.imageSmoothingEnabled=true;
    ctx.imageSmoothingQuality='high';
    build();
  }

  function roundedStarPath(horizontal,vertical,waist){
    var shoulderX=horizontal*.34;
    var shoulderY=vertical*.34;
    var curve=Math.max(.28,waist);
    ctx.beginPath();
    ctx.moveTo(0,-vertical);
    ctx.bezierCurveTo(shoulderX*curve,-shoulderY,-shoulderX,-waist,horizontal,0);
    ctx.bezierCurveTo(shoulderX,waist,shoulderX*curve,shoulderY,0,vertical);
    ctx.bezierCurveTo(-shoulderX*curve,shoulderY,-shoulderX,waist,-horizontal,0);
    ctx.bezierCurveTo(-shoulderX,-waist,-shoulderX*curve,-shoulderY,0,-vertical);
    ctx.closePath();
  }

  function drawStar(star,time){
    var twinkle=.94+.06*Math.sin(time*star.speed+star.phase);
    var alpha=star.opacity*twinkle;
    var horizontal=star.size*(.98+.02*twinkle);
    var vertical=horizontal*star.stretch;
    var waist=Math.max(.42,horizontal*.23);
    var rgb=star.warm?'255,245,222':'240,247,255';

    ctx.save();
    ctx.translate(star.x,star.y);
    ctx.rotate(star.rotation);
    ctx.globalCompositeOperation='screen';

    var haloRadius=horizontal*(star.flare?5.8:4.6);
    var halo=ctx.createRadialGradient(0,0,0,0,0,haloRadius);
    halo.addColorStop(0,'rgba('+rgb+','+(alpha*.32)+')');
    halo.addColorStop(.18,'rgba('+rgb+','+(alpha*.13)+')');
    halo.addColorStop(.52,'rgba('+rgb+','+(alpha*.035)+')');
    halo.addColorStop(1,'rgba('+rgb+',0)');
    ctx.fillStyle=halo;
    ctx.beginPath();
    ctx.arc(0,0,haloRadius,0,Math.PI*2);
    ctx.fill();

    if(star.flare){
      ctx.globalAlpha=Math.min(.38,alpha*.78);
      ctx.strokeStyle='rgba('+rgb+',.72)';
      ctx.lineWidth=Math.max(.34,horizontal*.11);
      ctx.lineCap='round';
      ctx.beginPath();
      ctx.moveTo(-horizontal*2.8,0);
      ctx.lineTo(horizontal*2.8,0);
      ctx.moveTo(0,-vertical*2.35);
      ctx.lineTo(0,vertical*2.35);
      ctx.stroke();
    }

    ctx.globalAlpha=Math.min(.96,alpha*1.65);
    ctx.shadowColor='rgba('+rgb+',.38)';
    ctx.shadowBlur=horizontal*1.7;
    roundedStarPath(horizontal,vertical,waist);
    var body=ctx.createRadialGradient(-horizontal*.18,-vertical*.2,0,0,0,horizontal*1.05);
    body.addColorStop(0,'rgba(255,255,255,1)');
    body.addColorStop(.3,'rgba('+rgb+',.98)');
    body.addColorStop(.72,'rgba('+rgb+',.78)');
    body.addColorStop(1,'rgba('+rgb+',.42)');
    ctx.fillStyle=body;
    ctx.fill();

    ctx.shadowBlur=0;
    ctx.globalAlpha=Math.min(1,alpha*1.95);
    var core=ctx.createRadialGradient(-horizontal*.12,-vertical*.14,0,0,0,horizontal*.52);
    core.addColorStop(0,'rgba(255,255,255,1)');
    core.addColorStop(.45,'rgba(255,255,255,.9)');
    core.addColorStop(1,'rgba('+rgb+',0)');
    ctx.fillStyle=core;
    ctx.beginPath();
    ctx.arc(0,0,horizontal*.54,0,Math.PI*2);
    ctx.fill();

    ctx.globalCompositeOperation='source-over';
    ctx.globalAlpha=Math.min(.78,alpha*1.35);
    ctx.beginPath();
    ctx.arc(-horizontal*.15,-vertical*.18,Math.max(.24,horizontal*.085),0,Math.PI*2);
    ctx.fillStyle='rgba(255,255,255,.96)';
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
