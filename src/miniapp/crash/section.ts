import { CRASH_PERFORMANCE_SCRIPT } from './scripts/performance';
import { CRASH_LIVE_D1_SCRIPT } from './scripts/live-bets';
import { CRASH_BACK_BUTTON_SCRIPT } from './scripts/back-button';
import { CRASH_BREAK_FX_SCRIPT } from './scripts/break-effect';

const CRASH_SPACE_ENVIRONMENT_SCRIPT = `
(function(){
  if(window.__vexaCrashSpaceEnvironment)return;
  window.__vexaCrashSpaceEnvironment=true;
  var canvas=document.getElementById('crashSpaceCanvas'),root=document.getElementById('crash'),multiplier=document.getElementById('crashMultiplier');
  if(!canvas||!root)return;
  var raf=0,delayTimer=0,lastTime=0,lastRender=0;
  function multiplierValue(){var v=parseFloat(String(multiplier&&multiplier.textContent||'1').replace(/x/i,''));return Number.isFinite(v)?Math.max(1,v):1}
  function streakIntensity(){
    var v=multiplierValue();
    if(v<1.2)return .055+(v-1)*.475;
    if(v<1.6)return .15+(v-1.2)*.375;
    if(v<2.2)return .30+(v-1.6)*.2833333333;
    if(v<3)return .47+(v-2.2)*.1875;
    if(v<5)return .62+(v-3)*.08;
    return Math.min(1,.78+(1-Math.exp(-(v-5)*.12))*.22)
  }
  function rocketAngleRad(){var deg=Number(window.__vexaCrashRocketAngleDeg);if(!Number.isFinite(deg))deg=80;deg=Math.max(-35,Math.min(80,deg));return deg*Math.PI/180}
  function canvasDpr(){return Math.min(1.4,Math.max(1,window.devicePixelRatio||1))}
  function resize(gl){var rect=canvas.getBoundingClientRect(),dpr=canvasDpr(),w=Math.max(2,Math.round(rect.width*dpr)),h=Math.max(2,Math.round(rect.height*dpr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}if(gl)gl.viewport(0,0,w,h)}
  function fallback2d(){
    var ctx=canvas.getContext('2d');if(!ctx){var replacement=document.createElement('canvas');replacement.id=canvas.id;replacement.className=canvas.className;replacement.setAttribute('aria-hidden','true');canvas.replaceWith(replacement);canvas=replacement;ctx=canvas.getContext('2d')}if(!ctx)return;
    var particles=[],seed=90210;
    function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
    for(var i=0;i<42;i++)particles.push({x:random(),y:random(),rank:random(),width:.45+random()*.65,length:.55+random()*.9});
    resize(null);
    function frame(ms){
      raf=0;if(!root.classList.contains('active')||document.hidden){lastTime=0;lastRender=0;delayTimer=setTimeout(function(){delayTimer=0;if(!raf)raf=requestAnimationFrame(frame)},320);return}
      if(lastRender&&ms-lastRender<15.5){raf=requestAnimationFrame(frame);return}
      var dt=Math.min(34,Math.max(8,ms-(lastTime||ms)));lastTime=ms;lastRender=ms;
      var intensity=streakIntensity(),angle=rocketAngleRad(),dx=-Math.sin(angle),dy=Math.cos(angle),w=canvas.width,h=canvas.height,dpr=canvasDpr(),speed=(10+intensity*145)*dpr;
      ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#000';ctx.fillRect(0,0,w,h);
      for(var i=0;i<particles.length;i++){
        var p=particles[i],visibility=.91-intensity*.48;if(p.rank<visibility)continue;
        var travel=(ms*.001*speed*(.62+p.rank*.65)),span=Math.abs(dx)*w+Math.abs(dy)*h+180*dpr;
        var offset=((travel+p.rank*span)%span),x=((p.x*w+dx*offset)%w+w)%w,y=((p.y*h+dy*offset)%h+h)%h;
        var trail=(9+intensity*68)*p.length*dpr;
        ctx.globalAlpha=.14+intensity*.60;ctx.strokeStyle=p.rank>.86?'#ffe9df':'#e8efff';ctx.lineWidth=p.width*dpr;
        ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-dx*trail,y-dy*trail);ctx.stroke();
      }
      ctx.globalAlpha=1;raf=requestAnimationFrame(frame)
    }
    window.addEventListener('resize',function(){resize(null)},{passive:true});
    window.addEventListener('vexa-crash-visible',function(){resize(null)},{passive:true});
    raf=requestAnimationFrame(frame)
  }
  function boot(){
    var gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false,powerPreference:'high-performance'});
    if(!gl){fallback2d();return}
    resize(gl);
    var vertex=[
      'attribute vec2 a_position;',
      'varying vec2 v_uv;',
      'void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.0,1.0);}'
    ].join(String.fromCharCode(10));
    var fragment=[
      'precision mediump float;',
      'varying vec2 v_uv;',
      'uniform float u_time;',
      'uniform float u_intensity;',
      'uniform float u_rocket_angle;',
      'float hash21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
      'vec3 streakLayer(vec2 uv,float cells,float seed,float gain){',
      'vec2 direction=normalize(vec2(-sin(u_rocket_angle),-cos(u_rocket_angle))),across=vec2(-direction.y,direction.x);',
      'vec2 rotated=vec2(dot(uv,across),dot(uv,direction));rotated.y-=u_time*mix(.018,.31,u_intensity);',
      'vec2 grid=rotated*vec2(cells,cells*.20),cell=floor(grid),gv=fract(grid)-.5;float rnd=hash21(cell+seed);',
      'vec2 jitter=(vec2(hash21(cell+seed+2.8),hash21(cell+seed+8.1))-.5)*vec2(.72,.68);vec2 delta=gv-jitter;',
      'float width=mix(.009,.029,u_intensity),trailLength=mix(.045,.39,u_intensity);',
      'float trail=(1.0-smoothstep(width,width*2.7,abs(delta.x)))*(1.0-smoothstep(trailLength,trailLength+.10,abs(delta.y)));',
      'float head=1.0-smoothstep(width,width*3.8,length(delta-vec2(0.0,-trailLength*.70)));',
      'float exists=smoothstep(mix(.9982,.976,u_intensity),1.0,rnd);vec3 tint=mix(vec3(.79,.86,1.0),vec3(1.0,.89,.82),hash21(cell+seed+13.7)*.52);',
      'return tint*(trail*.30+head*.86)*exists*gain*mix(.20,1.0,u_intensity);',
      '}',
      'void main(){vec2 uv=v_uv;vec3 color=vec3(0.0);color+=streakLayer(uv,27.0,21.4,.76);color+=streakLayer(uv+vec2(.17,.09),44.0,44.8,.46);gl_FragColor=vec4(color,1.0);}'
    ].join(String.fromCharCode(10));
    function shader(type,source){var s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);return null}return s}
    var vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment);if(!vs||!fs){fallback2d();return}
    var program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS)){fallback2d();return}
    gl.useProgram(program);var buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);var position=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    var time=gl.getUniformLocation(program,'u_time'),intensity=gl.getUniformLocation(program,'u_intensity'),rocketAngle=gl.getUniformLocation(program,'u_rocket_angle');
    function frame(ms){
      raf=0;if(!root.classList.contains('active')||document.hidden){lastTime=0;lastRender=0;delayTimer=setTimeout(function(){delayTimer=0;if(!raf)raf=requestAnimationFrame(frame)},320);return}
      if(lastRender&&ms-lastRender<15.5){raf=requestAnimationFrame(frame);return}
      lastTime=ms;lastRender=ms;gl.useProgram(program);gl.uniform1f(time,ms*.001);gl.uniform1f(intensity,streakIntensity());gl.uniform1f(rocketAngle,rocketAngleRad());gl.drawArrays(gl.TRIANGLES,0,6);raf=requestAnimationFrame(frame)
    }
    canvas.addEventListener('webglcontextlost',function(ev){ev.preventDefault();if(raf)cancelAnimationFrame(raf);raf=0});
    window.addEventListener('resize',function(){resize(gl)},{passive:true});
    window.addEventListener('vexa-crash-visible',function(){resize(gl)},{passive:true});
    raf=requestAnimationFrame(frame)
  }
  boot();
})();
`;
export const CRASH_SECTION = `<section id="crash" class="view crash-view">
  <style>
    html body:has(#crash.active){isolation:isolate!important;background:#000!important}
    html body:has(#crash.active)::before{content:""!important;display:block!important;position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important;z-index:-1!important;pointer-events:none!important;background-color:#000!important;background-image:url('/assets/Crash.PNG?v=1')!important;background-size:cover!important;background-position:center top!important;background-repeat:no-repeat!important;transform:none!important;animation:none!important;filter:none!important;opacity:1!important}
    html body:has(#crash.active)::after,html body:has(#crash.active) .app::before,html body:has(#crash.active) .app::after{display:none!important;content:none!important;background:none!important;background-image:none!important}
    html body:has(#crash.active) .app,html body:has(#crash.active) main.app,html body:has(#crash.active) .content,html body:has(#crash.active) .view.active,html body:has(#crash.active) #crash,html body:has(#crash.active) .crash-view,html body:has(#crash.active) .crash-page,html body:has(#crash.active) .top,html body:has(#crash.active) header.top{background:transparent!important;background-color:transparent!important;background-image:none!important;box-shadow:none!important}
    html body:has(#crash.active) #crash .crash-page{position:relative!important;isolation:isolate!important}
    html body:has(#crash.active) #crash #crashSpaceCanvas{position:absolute!important;left:0!important;top:0!important;width:100%!important;height:auto!important;aspect-ratio:1/1!important;transform:none!important;z-index:0!important;border-radius:0!important;background:#000!important}
    html body:has(#crash.active) #crash .crash-stage{position:relative!important;z-index:1!important;border-radius:0!important;overflow:visible!important;background:transparent!important;background-color:transparent!important;background-image:none!important;border:0!important;outline:0!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
    html body:has(#crash.active) #crash .crash-controls{position:relative!important;z-index:2!important}
    html body:has(#crash.active) #crash .crash-multiplier-wrap{left:18px!important;right:18px!important;top:50px!important;transform:none!important;text-align:center!important}
    html body:has(#crash.active) #crash .crash-multiplier{font-size:clamp(27px,calc(10vw - 5px),39px)!important}
    html body:has(#crash.active) #crash .crash-controls,html body:has(#crash.active) #crash #crashLive{border-radius:28px!important;background:#050505!important;border:1px solid rgba(255,255,255,.10)!important;outline:0!important;box-shadow:0 20px 58px rgba(0,0,0,.54),inset 0 1px 0 rgba(255,255,255,.08)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
    html body:has(#crash.active) #crash #crashLive{width:100%!important;margin:0!important;padding:8px!important}
  </style>
  <div class="crash-page">
    <canvas id="crashSpaceCanvas" class="crash-space-canvas" aria-hidden="true"></canvas>
    <div class="crash-stage">
      <div class="crash-history" id="crashHistory"></div>
      <div id="crashRocketScene" class="crash-rocket-scene" aria-label="3D crash rocket">
        <div id="crashRocketFlight" class="crash-rocket-flight" data-state="waiting">
          <div class="crash-rocket-heat" aria-hidden="true"></div>
          <div class="crash-rocket-flame" aria-hidden="true">
            <span class="crash-flame-outer"></span>
            <span class="crash-flame-middle"></span>
            <span class="crash-flame-core"></span>
            <i></i><i></i><i></i>
          </div>
          <model-viewer id="crashRocket" class="crash-rocket-model" src="/assets/Rocket3D.glb" alt="3D rocket" camera-orbit="0deg 78deg 108%" field-of-view="28deg" exposure="1.08" shadow-intensity=".9" shadow-softness=".9" auto-rotate auto-rotate-delay="0" rotation-per-second="18deg" interaction-prompt="none" disable-zoom touch-action="none" loading="eager" reveal="auto"></model-viewer>
        </div>
      </div>
      <div class="crash-multiplier-wrap">
        <div class="crash-multiplier" id="crashMultiplier">1.00x</div>
        <div class="crash-next-round" id="crashNextRound">Next round 5.0s</div>
      </div>
      <b id="crashCountdown" class="crash-hidden-state">Ready</b>
      <strong id="crashTotalTime" class="crash-hidden-state">Total 0s</strong>
    </div>
    <div class="crash-controls">
      <div class="crash-control-grid">
        <div class="crash-field crash-auto-field">
          <small>Auto Cash Out</small>
          <b><span class="crash-auto"><input id="crashAutoCashout" inputmode="decimal" pattern="[0-9.]*" value="2.00"/><span>x</span></span></b>
        </div>
      </div>
      <div class="crash-bet">
        <button type="button" data-action="crash-half">1/2</button>
        <span class="crash-bet-main active"><input id="crashAmount" inputmode="decimal" pattern="[0-9.]*" value="1.00" aria-label="Amount TON"/></span>
        <button type="button" data-action="crash-double">2x</button>
      </div>
      <div class="crash-actions">
        <button id="crashAction" class="crash-primary" type="button">Place Bet</button>
      </div>
      <div class="crash-live open" id="crashLive">
        <div class="crash-live-head">
          <span class="crash-live-title">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.2 11.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"/><path d="M3.4 18.4c.6-3 2.3-4.6 4.8-4.6s4.2 1.6 4.8 4.6"/><path d="M16.3 10.2a2.6 2.6 0 1 0 0-5.2"/><path d="M15.4 13.6c2.4.2 3.9 1.7 4.4 4.3"/></svg>
            <span>Live Bets</span>
          </span>
          <div class="crash-live-head-actions">
            <b id="crashLiveTotal">0 TON</b>
            <button id="crashLiveToggle" class="crash-live-toggle" type="button" aria-label="Toggle live bets" aria-expanded="true">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5"/></svg>
            </button>
          </div>
        </div>
        <div class="crash-live-list" id="crashLiveList"><div class="crash-live-empty">No bets yet</div></div>
      </div>
    </div>
  </div>
  <script type="module" src="https://cdn.jsdelivr.net/npm/@google/model-viewer@4.3.1/dist/model-viewer.min.js"></script>
  <script>customElements.whenDefined('model-viewer').then(function(){var ModelViewer=customElements.get('model-viewer');if(ModelViewer)ModelViewer.minimumRenderScale=1})</script>
  <script>${CRASH_SPACE_ENVIRONMENT_SCRIPT}</script>
  <script>${CRASH_PERFORMANCE_SCRIPT}</script>
  <script>${CRASH_LIVE_D1_SCRIPT}</script>
  <script>${CRASH_BACK_BUTTON_SCRIPT}</script>
  <script>${CRASH_BREAK_FX_SCRIPT}</script>
</section>`;