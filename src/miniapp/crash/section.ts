import { CRASH_PERFORMANCE_SCRIPT } from './scripts/performance';
import { CRASH_LIVE_D1_SCRIPT } from './scripts/live-bets';
import { CRASH_BACK_BUTTON_SCRIPT } from './scripts/back-button';
import { CRASH_BREAK_FX_SCRIPT } from './scripts/break-effect';

const CRASH_MULTIPLIER_DISPLAY_SCRIPT = `
(function(){
  function install(){
    var el=document.getElementById('crashMultiplier');
    if(!el||el.__vexaCrashSmoothText)return;
    el.__vexaCrashSmoothText=true;
    var desc=Object.getOwnPropertyDescriptor(Node.prototype,'textContent');
    if(!desc||!desc.get||!desc.set)return;
    var internal=false;
    var target=1;
    var display=1;
    var raf=0;
    var last=0;
    function parse(value){var n=Number(String(value||'').replace(/x/i,''));return Number.isFinite(n)&&n>0?n:1}
    function format(value){return Math.max(1,Number(value)||1).toFixed(2)+'x'}
    function paint(value){internal=true;var text=format(value);desc.set.call(el,text);el.setAttribute('data-crash-text',text);internal=false}
    function speedFor(value){
      if(value<1.35)return .30;
      if(value<1.75)return .44;
      if(value<2.15)return .62;
      if(value<2.5)return .86;
      if(value<4)return 1.9;
      return 4.2;
    }
    function frame(ts){
      raf=0;
      if(!last)last=ts;
      var dt=Math.min(34,Math.max(8,ts-last));
      last=ts;
      if(target<=1.005||target<display-.015){display=target;paint(display);last=0;return}
      var diff=target-display;
      if(diff>0){
        var maxStep=speedFor(display)*dt/1000;
        var easeStep=diff*(1-Math.exp(-5.2*dt/1000));
        var minStep=display<2.5?.0025:.006;
        display=Math.min(target,display+Math.max(minStep,Math.min(maxStep,easeStep)));
      }else{
        display=target;
      }
      paint(display);
      if(target>1.005&&target>=display)raf=requestAnimationFrame(frame);
    }
    Object.defineProperty(el,'textContent',{
      configurable:true,
      get:function(){return desc.get.call(el)},
      set:function(value){
        if(internal){desc.set.call(el,value);return}
        var next=parse(value);
        if(next<=1.005||next<target-.015){target=next;display=next;last=0;paint(display);return}
        target=next;
        if(!raf)raf=requestAnimationFrame(frame);
      }
    });
    paint(parse(desc.get.call(el)||'1'));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
`;

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
      <div class="crash-history" id="crashHistory"></div>
      <canvas id="crashCanvas" class="crash-canvas" width="360" height="340" aria-label="Crash graph"></canvas>
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
  <script>${CRASH_MULTIPLIER_DISPLAY_SCRIPT}</script>
  <script>${CRASH_HORIZONTAL_BACKGROUNDS_SCRIPT}</script>
  <script>${CRASH_PERFORMANCE_SCRIPT}</script>
  <script>${CRASH_LIVE_D1_SCRIPT}</script>
  <script>${CRASH_BACK_BUTTON_SCRIPT}</script>
  <script>${CRASH_BREAK_FX_SCRIPT}</script>
</section>`;