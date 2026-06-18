export const PLINKO_PERFORMANCE_SCRIPT = `
(function(){
  var activeDrops=0;
  var lastDropAt=0;
  var MAX_SMOOTH_DROPS=3;
  var DROP_COOLDOWN_MS=420;
  var DROP_LIFETIME_MS=4300;
  function q(id){return document.getElementById(id)}
  function showToast(text){
    var n=q('toast');
    if(!n)return;
    n.textContent=text;
    n.style.display='flex';
    clearTimeout(n.__vexaTimer);
    n.__vexaTimer=setTimeout(function(){n.style.display='none'},2400);
  }
  function ensureStyle(){
    if(q('plinkoPerformanceGuardStyle'))return;
    var style=document.createElement('style');
    style.id='plinkoPerformanceGuardStyle';
    style.textContent='#plinkoCanvasV2,#plinko .plinko-stage{contain:layout paint style;transform:translateZ(0)}#plinkoLiveHistoryFeed{contain:layout paint style;content-visibility:auto;contain-intrinsic-size:374px 220px}.plinko-history-list{contain:layout paint style;content-visibility:auto;contain-intrinsic-size:350px 220px}';
    document.head.appendChild(style);
  }
  function isPlinkoVisible(){var view=q('plinko');return !!(view&&view.classList.contains('active'))}
  function releaseDrop(){activeDrops=Math.max(0,activeDrops-1)}
  ensureStyle();
  document.addEventListener('click',function(ev){
    var button=ev.target&&ev.target.closest&&ev.target.closest('[data-action="drop-plinko-ball"]');
    if(!button||!isPlinkoVisible())return;
    var now=performance.now();
    if(now-lastDropAt<DROP_COOLDOWN_MS){
      ev.preventDefault();
      ev.stopImmediatePropagation();
      return;
    }
    if(activeDrops>=MAX_SMOOTH_DROPS){
      ev.preventDefault();
      ev.stopImmediatePropagation();
      showToast('Please wait a moment');
      return;
    }
    lastDropAt=now;
    activeDrops+=1;
    button.classList.add('plinko-drop-active');
    setTimeout(function(){button.classList.remove('plinko-drop-active')},180);
    setTimeout(releaseDrop,DROP_LIFETIME_MS);
  },true);
  document.addEventListener('visibilitychange',function(){if(document.hidden)activeDrops=0});
})();
`;
