export const CRASH_PERFORMANCE_SCRIPT = `
(function(){
  if(window.__vexaCrashPerfPatch)return;
  window.__vexaCrashPerfPatch=true;
  var active=false,running=false,lastTurnAt=0,turnRad=0,turnObserver=null;
  function q(id){return document.getElementById(id)}
  function emit(name){try{window.dispatchEvent(new CustomEvent(name))}catch(e){}}
  function turnRocket(now){
    var rocket=q('crashRocket');
    if(!active||!running||!rocket||typeof rocket.resetTurntableRotation!=='function'){lastTurnAt=0;return}
    now=Number(now)||performance.now();
    if(!lastTurnAt){lastTurnAt=now;return}
    var dt=Math.max(0,Math.min(80,now-lastTurnAt));lastTurnAt=now;
    var spin=parseFloat(rocket.getAttribute('rotation-per-second')||'18');if(!Number.isFinite(spin))spin=18;
    turnRad=(turnRad+(spin*Math.PI/180)*(dt/1000))%(Math.PI*2);
    rocket.resetTurntableRotation(turnRad)
  }
  function syncRocket(){
    var rocket=q('crashRocket');if(!rocket)return;
    rocket.removeAttribute('auto-rotate');
    if(active&&running)turnRocket(performance.now());else lastTurnAt=0
  }
  function bindTurnSource(){
    if(turnObserver||!window.MutationObserver)return;
    var multiplier=q('crashMultiplier');if(!multiplier)return;
    turnObserver=new MutationObserver(function(){turnRocket(performance.now())});
    turnObserver.observe(multiplier,{childList:true,characterData:true,subtree:true})
  }
  function setActive(next){
    next=!!next&&!document.hidden;
    if(active===next){syncRocket();return}
    active=next;syncRocket();emit(active?'vexa-crash-visible':'vexa-crash-hidden');
  }
  function syncFromDom(){
    var root=q('crash'),flight=q('crashRocketFlight');
    running=!!(flight&&flight.getAttribute('data-state')==='running');
    bindTurnSource();setActive(!!(root&&root.classList.contains('active')))
  }
  window.__vexaCrashSetRunning=function(next){
    next=!!next;if(running===next)return;running=next;syncRocket()
  };
  customElements.whenDefined('model-viewer').then(function(){
    var ModelViewer=customElements.get('model-viewer');
    if(ModelViewer){ModelViewer.minimumRenderScale=.65;try{ModelViewer.powerPreference='low-power'}catch(e){}}
    bindTurnSource();syncRocket()
  });
  document.addEventListener('visibilitychange',function(){if(document.hidden)setActive(false);else syncFromDom()});
  window.addEventListener('vexa:view-changed',function(ev){var d=ev&&ev.detail||{};setActive(d.id==='crash')});
  syncFromDom();
})();
`;
