import { CRASH_PERFORMANCE_SCRIPT } from './crash-performance-script';
import { CRASH_LIVE_D1_SCRIPT } from './crash-live-d1-script';
import { CRASH_BACK_BUTTON_SCRIPT } from './crash-back-button-script';
import { CRASH_BREAK_FX_SCRIPT } from './crash-break-fx-script';

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
    function frame(ts){
      raf=0;
      if(!last)last=ts;
      var dt=Math.min(50,ts-last);
      last=ts;
      if(target<=1.005||target<display){display=target;paint(display);return}
      var diff=target-display;
      var rate=target<1.12?.42:target<1.35?.72:target<2?1.18:2.05;
      var move=diff*(1-Math.exp(-rate*dt/1000));
      if(move<.00055)move=.00055;
      display=Math.min(target,display+move);
      paint(display);
      if(Math.abs(target-display)>.003)raf=requestAnimationFrame(frame);
    }
    Object.defineProperty(el,'textContent',{
      configurable:true,
      get:function(){return desc.get.call(el)},
      set:function(value){
        if(internal){desc.set.call(el,value);return}
        var next=parse(value);
        if(next<=1.005||next<target-.02){target=next;display=next;last=0;paint(display);return}
        target=next;
        if(!raf){last=0;raf=requestAnimationFrame(frame)}
      }
    });
    paint(parse(desc.get.call(el)||'1'));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
`;

export const CRASH_SECTION = `<section id="crash" class="view crash-view">
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
  <script>${CRASH_MULTIPLIER_DISPLAY_SCRIPT}</script>
  <script>${CRASH_PERFORMANCE_SCRIPT}</script>
  <script>${CRASH_LIVE_D1_SCRIPT}</script>
  <script>${CRASH_BACK_BUTTON_SCRIPT}</script>
  <script>${CRASH_BREAK_FX_SCRIPT}</script>
</section>`;