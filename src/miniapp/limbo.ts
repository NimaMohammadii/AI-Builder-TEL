export const LIMBO_SECTION = `<section id="limbo" class="view limbo-view">
  <style>
    .limbo-view{padding:0 0 calc(120px + env(safe-area-inset-bottom))!important;overflow:hidden!important;background:radial-gradient(circle at 50% 12%,rgba(48,119,78,.20),transparent 36%),linear-gradient(180deg,#08110d,#020403 72%)!important}
    .limbo-game{height:calc(100dvh - 158px - env(safe-area-inset-top) - env(safe-area-inset-bottom));min-height:520px;display:grid;grid-template-rows:minmax(0,1fr) auto;gap:12px;padding:10px 14px 0;box-sizing:border-box}
    .limbo-screen{position:relative;overflow:hidden;border-radius:30px;border:1px solid rgba(255,255,255,.10);background:#06100b;box-shadow:0 28px 70px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.10)}
    .limbo-screen canvas{width:100%;height:100%;display:block}
    .limbo-vignette{position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 50% 45%,transparent 0 40%,rgba(0,0,0,.42) 76%,rgba(0,0,0,.86) 100%)}
    .limbo-hud{position:absolute;left:14px;right:14px;top:14px;display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:3}
    .limbo-pill{min-width:0;height:34px;padding:0 13px;border-radius:999px;background:rgba(0,0,0,.32);border:1px solid rgba(255,255,255,.12);display:flex;align-items:center;color:rgba(255,255,255,.86);font-size:12px;font-weight:900;letter-spacing:-.02em;box-shadow:inset 0 1px 0 rgba(255,255,255,.10);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}
    .limbo-message{position:absolute;left:14px;right:14px;bottom:14px;z-index:3;min-height:48px;padding:12px 14px;border-radius:20px;background:rgba(0,0,0,.38);border:1px solid rgba(255,255,255,.12);color:#fff;font-size:14px;font-weight:800;line-height:1.25;box-shadow:inset 0 1px 0 rgba(255,255,255,.10);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px)}
    .limbo-controls{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:0 4px 4px;align-items:center}
    .limbo-controls button{height:54px;border:1px solid rgba(255,255,255,.14);border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.16),rgba(255,255,255,.055));color:#fff;font-size:21px;font-weight:950;box-shadow:0 14px 30px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.22)}
    .limbo-controls button:active{transform:scale(.96)}
    .limbo-controls [data-limbo-move="forward"]{grid-column:2}
    .limbo-controls [data-limbo-move="left"]{grid-column:1;grid-row:2}
    .limbo-controls [data-limbo-move="back"]{grid-column:2;grid-row:2}
    .limbo-controls [data-limbo-move="right"]{grid-column:3;grid-row:2}
    .limbo-controls [data-limbo-reset]{grid-column:1/4;font-size:14px;height:46px;color:rgba(255,255,255,.76)}
    @media(max-width:380px){.limbo-game{height:calc(100dvh - 150px - env(safe-area-inset-top) - env(safe-area-inset-bottom));padding:8px 12px 0}.limbo-controls button{height:48px}.limbo-message{font-size:12.5px}}
  </style>
  <div class="limbo-game" data-limbo-game>
    <div class="limbo-screen">
      <canvas data-limbo-canvas aria-label="First person forest game"></canvas>
      <div class="limbo-hud"><span class="limbo-pill" data-limbo-inventory>No lantern</span><span class="limbo-pill" data-limbo-state>Forest maze</span></div>
      <div class="limbo-message" data-limbo-message>Find the lantern, then escape the forest.</div>
      <span class="limbo-vignette"></span>
    </div>
    <div class="limbo-controls">
      <button type="button" data-limbo-move="forward">↑</button>
      <button type="button" data-limbo-move="left">←</button>
      <button type="button" data-limbo-move="back">↓</button>
      <button type="button" data-limbo-move="right">→</button>
      <button type="button" data-limbo-reset>Reset</button>
    </div>
  </div>
  <script>
  (function(){
    var map=['111111111','100000001','101111101','101000101','101010101','100010001','111011101','1L00000E1','111111111'];
    var state={x:1.5,y:1.5,a:0,lantern:false,won:false,message:'Find the lantern, then escape the forest.'};
    var running=false,frame=0;
    function root(){return document.querySelector('#limbo[data-active],#limbo.active')||document.getElementById('limbo')}
    function canvas(){var r=root();return r&&r.querySelector('[data-limbo-canvas]')}
    function msg(){var r=root();return r&&r.querySelector('[data-limbo-message]')}
    function inv(){var r=root();return r&&r.querySelector('[data-limbo-inventory]')}
    function stat(){var r=root();return r&&r.querySelector('[data-limbo-state]')}
    function tile(x,y){var row=map[Math.floor(y)];return row?row[Math.floor(x)]||'1':'1'}
    function wall(x,y){return tile(x,y)==='1'}
    function setMessage(text){state.message=text;var n=msg();if(n)n.textContent=text}
    function sync(){var i=inv();var s=stat();if(i)i.textContent=state.lantern?'Lantern on':'No lantern';if(s)s.textContent=state.won?'Escaped':'Forest maze'}
    function checkTile(){var t=tile(state.x,state.y);if(t==='L'&&!state.lantern){state.lantern=true;setMessage('You found a lantern. The fog gets thinner.');sync();return}if(t==='E'){if(state.lantern){state.won=true;setMessage('You escaped the dark forest.');sync()}else setMessage('You found the exit, but the fog blocks it. Find the lantern first.');return}setMessage('You move between the trees.')}
    function move(step){if(state.won)return;var nx=state.x+Math.cos(state.a)*step,ny=state.y+Math.sin(state.a)*step;if(wall(nx,ny)){setMessage('Dense trees block the path.');return}state.x=nx;state.y=ny;checkTile()}
    function turn(v){if(state.won)return;state.a+=v;setMessage(v>0?'You turn right.':'You turn left.')}
    function draw(){var c=canvas();if(!c)return;var rect=c.getBoundingClientRect();var dpr=Math.min(2,window.devicePixelRatio||1);var w=Math.max(240,Math.floor(rect.width*dpr));var h=Math.max(320,Math.floor(rect.height*dpr));if(c.width!==w||c.height!==h){c.width=w;c.height=h}var ctx=c.getContext('2d');if(!ctx)return;frame+=.018;var sky=ctx.createLinearGradient(0,0,0,h*.52);sky.addColorStop(0,'#07120e');sky.addColorStop(1,'#153621');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h*.52);var ground=ctx.createLinearGradient(0,h*.48,0,h);ground.addColorStop(0,'#0c2014');ground.addColorStop(1,'#020403');ctx.fillStyle=ground;ctx.fillRect(0,h*.48,w,h);ctx.fillStyle='rgba(195,255,210,.08)';for(var s=0;s<32;s++){ctx.fillRect((Math.sin(frame+s*8.7)*.5+.5)*w,(Math.cos(frame*.6+s)*.5+.5)*h*.44,1.4*dpr,1.4*dpr)}var rays=Math.max(90,Math.floor(w/3));for(var i=0;i<rays;i++){var cam=(i/rays-.5)*1.08;var ang=state.a+cam;var dist=.04;var hit=false;var kind='1';while(dist<8&&!hit){kind=tile(state.x+Math.cos(ang)*dist,state.y+Math.sin(ang)*dist);if(kind==='1'||kind==='E')hit=true;else dist+=.035}var shade=Math.max(0,1-dist/8);var col=Math.ceil(w/rays)+1;var wh=Math.min(h,h/(dist*Math.cos(cam)+.06));var x=i*(w/rays);var y=(h-wh)/2;var alpha=Math.max(.10,shade*(state.lantern?1.3:.86));ctx.fillStyle=kind==='E'?'rgba(105,255,185,'+alpha+')':'rgba(27,91,52,'+alpha+')';ctx.fillRect(x,y,col,wh);ctx.fillStyle='rgba(0,0,0,'+((state.lantern?.40:.70)*(1-shade*.58))+')';ctx.fillRect(x,0,col,h)}var glow=ctx.createRadialGradient(w/2,h*.58,20,w/2,h*.58,w*.62);glow.addColorStop(0,state.lantern?'rgba(255,225,130,.24)':'rgba(255,255,255,.055)');glow.addColorStop(1,'rgba(0,0,0,.44)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);if(state.won){ctx.fillStyle='rgba(0,0,0,.48)';ctx.fillRect(0,0,w,h);ctx.fillStyle='#fff';ctx.font=Math.floor(28*dpr)+'px sans-serif';ctx.textAlign='center';ctx.fillText('ESCAPED',w/2,h/2)}if(running)requestAnimationFrame(draw)}
    function bind(){var r=document.getElementById('limbo');if(!r||r.dataset.limboBound==='1')return;r.dataset.limboBound='1';r.querySelectorAll('[data-limbo-move]').forEach(function(btn){btn.addEventListener('click',function(e){e.preventDefault();var m=btn.getAttribute('data-limbo-move');if(m==='forward')move(.55);if(m==='back')move(-.45);if(m==='left')turn(-Math.PI/2);if(m==='right')turn(Math.PI/2);sync()})});var reset=r.querySelector('[data-limbo-reset]');if(reset)reset.addEventListener('click',function(e){e.preventDefault();state={x:1.5,y:1.5,a:0,lantern:false,won:false,message:'Find the lantern, then escape the forest.'};setMessage(state.message);sync()});setMessage(state.message);sync();running=true;requestAnimationFrame(draw)}
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
  })();
  </script>
</section>`;
