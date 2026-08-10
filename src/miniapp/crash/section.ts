import { CRASH_PERFORMANCE_SCRIPT } from './scripts/performance';
import { CRASH_LIVE_D1_SCRIPT } from './scripts/live-bets';
import { CRASH_BACK_BUTTON_SCRIPT } from './scripts/back-button';
import { CRASH_BREAK_FX_SCRIPT } from './scripts/break-effect';

const CRASH_HORIZONTAL_BACKGROUNDS_SCRIPT = `
(function(){
  function install(){
    var root=document.getElementById('crash');
    var stage=root&&root.querySelector('.crash-stage');
    var multiplier=document.getElementById('crashMultiplier');
    if(!root||!stage||!multiplier||stage.querySelector('.crash-horizontal-background-strip'))return;

    var style=document.getElementById('crashHorizontalBackgroundStyle');
    if(!style){
      style=document.createElement('style');
      style.id='crashHorizontalBackgroundStyle';
      style.textContent='#crash .crash-horizontal-background-strip{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;display:flex!important;flex-direction:row!important;z-index:0!important;pointer-events:none!important;transform:translate3d(0,0,0);will-change:transform!important}#crash .crash-horizontal-background-panel{flex:0 0 100%!important;width:100%!important;height:100%!important;min-width:100%!important;min-height:100%!important;background-color:transparent!important;background-repeat:no-repeat!important;background-size:cover!important;background-position:center center!important;pointer-events:none!important}';
      document.head.appendChild(style);
    }

    var strip=document.createElement('div');
    strip.className='crash-horizontal-background-strip';
    strip.id='crashHorizontalBackgroundStrip';
    strip.setAttribute('aria-hidden','true');
    for(var slot=1;slot<=10;slot++){
      var panel=document.createElement('div');
      panel.className='crash-horizontal-background-panel';
      panel.setAttribute('data-crash-background-slot',String(slot));
      strip.appendChild(panel);
    }
    stage.insertBefore(strip,stage.firstChild);

    function cssUrl(url){var clean=String(url||'').split("'").join('').split(')').join('').split('"').join('');return "url('"+clean+"')"}
    function loadImages(){
      fetch('/app/api/crash-stage-images',{cache:'no-store'}).then(function(r){return r.ok?r.json():null}).then(function(j){
        var images=j&&j.images;if(!images)return;
        Object.keys(images).forEach(function(key){
          var url=images[key];if(!url)return;
          var panel=strip.querySelector('[data-crash-background-slot="'+key+'"]');
          if(panel)panel.style.setProperty('background-image',cssUrl(url),'important');
          try{var img=new Image();img.decoding='async';img.src=url}catch(e){}
        });
      }).catch(function(){});
    }
    function updatePosition(){
      var value=parseFloat(String(multiplier.textContent||'1').replace(/x/i,''));
      if(!Number.isFinite(value))value=1;
      var step=Math.max(0,Math.min(9,(value-1)*(9/59)));
      var width=Math.max(1,stage.clientWidth||stage.getBoundingClientRect().width||1);
      var x=-step*width;
      strip.style.transform='translate3d('+x.toFixed(2)+'px,0,0)';
    }

    var observer=new MutationObserver(updatePosition);
    observer.observe(multiplier,{childList:true,characterData:true,subtree:true});
    window.addEventListener('resize',updatePosition,{passive:true});
    loadImages();
    updatePosition();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
`;

const CRASH_SPACE_ENVIRONMENT_SCRIPT = `
(function(){
  if(window.__vexaCrashSpaceEnvironment)return;
  window.__vexaCrashSpaceEnvironment=true;
  var canvas=document.getElementById('crashSpaceCanvas'),root=document.getElementById('crash'),multiplier=document.getElementById('crashMultiplier');
  if(!canvas||!root)return;
  var raf=0,delayTimer=0,lastTime=0,cameraX=0,cameraY=0,targetX=0,targetY=0;
  function multiplierProgress(){var v=parseFloat(String(multiplier&&multiplier.textContent||'1').replace(/x/i,''));if(!Number.isFinite(v))v=1;var raw=Math.max(0,v-1);return 1-(1/(1+raw*.42))}
  function resize(gl){var rect=canvas.getBoundingClientRect(),dpr=Math.min(2,Math.max(1,window.devicePixelRatio||1)),w=Math.max(2,Math.round(rect.width*dpr)),h=Math.max(2,Math.round(rect.height*dpr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}if(gl)gl.viewport(0,0,w,h)}
  function fallback2d(){
    var ctx=canvas.getContext('2d'),stars=[],seed=90210;
    function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
    for(var i=0;i<190;i++)stars.push({x:random(),y:random(),r:.28+random()*1.05,z:.25+random()*.75,w:random()*6.283});
    function frame(ms){
      raf=0;if(!root.classList.contains('active')||document.hidden){delayTimer=setTimeout(function(){delayTimer=0;if(!raf)raf=requestAnimationFrame(frame)},320);return}
      resize(null);var p=multiplierProgress(),ease=Math.min(1,(ms-(lastTime||ms))/120);lastTime=ms;targetX=p*.9;targetY=p*1.15;cameraX+=(targetX-cameraX)*Math.max(.035,ease*.12);cameraY+=(targetY-cameraY)*Math.max(.035,ease*.12);
      var w=canvas.width,h=canvas.height,dpr=Math.min(2,Math.max(1,window.devicePixelRatio||1));ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#010207';ctx.fillRect(0,0,w,h);
      for(var i=0;i<stars.length;i++){var s=stars[i],x=((s.x-cameraX*.028*s.z)%1+1)%1*w,y=((s.y+cameraY*.035*s.z)%1+1)%1*h,a=.48+.34*Math.sin(ms*.0012+s.w);ctx.globalAlpha=a;ctx.fillStyle=s.w>3.2?'#dce7ff':'#ffe8d8';ctx.beginPath();ctx.arc(x,y,s.r*dpr,0,Math.PI*2);ctx.fill()}
      var px=w*.18-cameraX*w*.012,py=h*.77+cameraY*h*.008,pr=Math.min(w,h)*.085,g=ctx.createRadialGradient(px-pr*.28,py-pr*.38,pr*.04,px,py,pr);g.addColorStop(0,'#7f9ab0');g.addColorStop(.34,'#263d50');g.addColorStop(.7,'#07101b');g.addColorStop(1,'#000');ctx.globalAlpha=.94;ctx.fillStyle=g;ctx.beginPath();ctx.arc(px,py,pr,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
      raf=requestAnimationFrame(frame)
    }
    raf=requestAnimationFrame(frame)
  }
  function boot(){
    var gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false,powerPreference:'high-performance'});
    if(!gl){fallback2d();return}
    var vertex=[
      'attribute vec2 a_position;',
      'varying vec2 v_uv;',
      'void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.0,1.0);}'
    ].join(String.fromCharCode(10));
    var fragment=[
      'precision highp float;',
      'varying vec2 v_uv;',
      'uniform vec2 u_resolution;',
      'uniform float u_time;',
      'uniform float u_progress;',
      'uniform vec2 u_camera;',
      'float hash21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
      'float noise2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash21(i),hash21(i+vec2(1.0,0.0)),f.x),mix(hash21(i+vec2(0.0,1.0)),hash21(i+vec2(1.0)),f.x),f.y);}',
      'float fbm(vec2 p){float f=0.0;f+=noise2(p)*.5;p=p*2.03+3.1;f+=noise2(p)*.25;p=p*2.01+1.7;f+=noise2(p)*.125;p=p*2.04+.9;f+=noise2(p)*.0625;return f;}',
      'vec3 starLayer(vec2 uv,float scale,float seed,float radius,float gain){vec2 cell=floor(uv*scale),gv=fract(uv*scale)-.5;float rnd=hash21(cell+seed);vec2 jitter=vec2(hash21(cell+seed+2.31),hash21(cell+seed+6.77))-.5;vec2 delta=gv-jitter*.76;float core=(1.0-smoothstep(radius,radius*3.2,length(delta)))*smoothstep(.958,1.0,rnd);float twinkle=.72+.28*sin(u_time*(.62+rnd*1.18)+rnd*41.0);vec3 cool=vec3(.65,.76,1.0),warm=vec3(1.0,.82,.65);return mix(cool,warm,hash21(cell+seed+11.4))*core*gain*twinkle;}',
      'void main(){',
      'vec2 uv=v_uv,aspectUv=uv-.5;aspectUv.x*=u_resolution.x/u_resolution.y;',
      'vec2 drift=vec2(u_time*.00008,-u_time*.000035),cam=u_camera;',
      'vec3 color=vec3(.0012,.0018,.0045);',
      'vec2 dustUv=aspectUv*2.1+vec2(.38,-.14)+cam*.018+drift*.16;float dust=fbm(dustUv)-.52;dust=max(0.0,dust);color+=vec3(.025,.032,.052)*dust*.42;',
      'color+=starLayer(uv+cam*.013+drift,28.0,2.7,.046,.75);',
      'color+=starLayer(uv+cam*.026+drift*1.7,54.0,7.2,.044,.92);',
      'color+=starLayer(uv+cam*.047+drift*2.8,96.0,14.6,.041,1.16);',
      'vec2 center=vec2(-.305,-.245)-cam*vec2(.012,.008);float radius=.086;vec2 spherePos=aspectUv-center;float distanceToPlanet=length(spherePos);float planetMask=1.0-smoothstep(radius-.0015,radius+.0015,distanceToPlanet);vec2 local=spherePos/radius;float z=sqrt(max(0.0,1.0-dot(local,local)));vec3 normal=normalize(vec3(local,z));vec3 lightDir=normalize(vec3(-.72,.58,1.08));float diffuse=max(0.0,dot(normal,lightDir));float terrain=fbm(local*3.7+vec2(.17,-.21));float clouds=fbm(local*8.3+vec2(u_time*.0012,.0));vec3 ocean=vec3(.012,.038,.071),land=vec3(.075,.105,.105);vec3 surface=mix(ocean,land,smoothstep(.49,.61,terrain));surface*=.055+.945*pow(diffuse,.82);surface+=vec3(.24,.27,.29)*smoothstep(.62,.75,clouds)*diffuse*.34;surface+=vec3(.12,.23,.36)*pow(1.0-z,3.3)*diffuse*.35;',
      'color=mix(color,surface,planetMask);float atmosphere=(1.0-smoothstep(radius,radius*1.17,distanceToPlanet))*(1.0-planetMask);color+=vec3(.08,.23,.48)*atmosphere*.34;',
      'float vignette=1.0-smoothstep(.58,.92,length((uv-.5)*vec2(1.0,.92)));color*=.72+.28*vignette;',
      'color=pow(color,vec3(.88));gl_FragColor=vec4(color,1.0);',
      '}'
    ].join(String.fromCharCode(10));
    function shader(type,source){var s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);return null}return s}
    var vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment);if(!vs||!fs){fallback2d();return}
    var program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS)){fallback2d();return}
    gl.useProgram(program);var buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);var position=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    var resolution=gl.getUniformLocation(program,'u_resolution'),time=gl.getUniformLocation(program,'u_time'),progress=gl.getUniformLocation(program,'u_progress'),camera=gl.getUniformLocation(program,'u_camera');
    function frame(ms){
      raf=0;if(!root.classList.contains('active')||document.hidden){delayTimer=setTimeout(function(){delayTimer=0;if(!raf)raf=requestAnimationFrame(frame)},320);return}
      resize(gl);var p=multiplierProgress(),dt=Math.min(34,Math.max(8,ms-(lastTime||ms)));lastTime=ms;targetX=p*.92;targetY=p*1.18;var follow=1-Math.exp(-dt*.0065);cameraX+=(targetX-cameraX)*follow;cameraY+=(targetY-cameraY)*follow;
      gl.useProgram(program);gl.uniform2f(resolution,canvas.width,canvas.height);gl.uniform1f(time,ms*.001);gl.uniform1f(progress,p);gl.uniform2f(camera,cameraX,cameraY);gl.drawArrays(gl.TRIANGLES,0,6);raf=requestAnimationFrame(frame)
    }
    canvas.addEventListener('webglcontextlost',function(ev){ev.preventDefault();if(raf)cancelAnimationFrame(raf);raf=0});
    window.addEventListener('resize',function(){resize(gl)},{passive:true});
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
    html body:has(#crash.active) #crash .crash-multiplier-wrap{left:18px!important;right:18px!important;top:50px!important;transform:none!important;text-align:center!important}
    html body:has(#crash.active) #crash .crash-multiplier{font-size:clamp(27px,calc(10vw - 5px),39px)!important}
    html body:has(#crash.active) #crash .crash-controls,html body:has(#crash.active) #crash #crashLive{border-radius:28px!important;background:#050505!important;border:1px solid rgba(255,255,255,.10)!important;outline:0!important;box-shadow:0 20px 58px rgba(0,0,0,.54),inset 0 1px 0 rgba(255,255,255,.08)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
    html body:has(#crash.active) #crash #crashLive{width:100%!important;margin:0!important;padding:8px!important}
  </style>
  <div class="crash-page">
    <div class="crash-stage">
      <canvas id="crashSpaceCanvas" class="crash-space-canvas" aria-hidden="true"></canvas>
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
  <script>${CRASH_HORIZONTAL_BACKGROUNDS_SCRIPT}</script>
  <script>${CRASH_PERFORMANCE_SCRIPT}</script>
  <script>${CRASH_LIVE_D1_SCRIPT}</script>
  <script>${CRASH_BACK_BUTTON_SCRIPT}</script>
  <script>${CRASH_BREAK_FX_SCRIPT}</script>
</section>`;