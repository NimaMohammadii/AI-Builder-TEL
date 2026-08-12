export const CRASH_PERFORMANCE_SCRIPT = `
(function(){
  if(window.__vexaCrashPerfPatch)return;
  window.__vexaCrashPerfPatch=true;
  var active=false,running=false;
  function q(id){return document.getElementById(id)}
  function emit(name){try{window.dispatchEvent(new CustomEvent(name))}catch(e){}}
  function setMotion(el,play){
    if(!el)return;
    if(play){el.style.removeProperty('animation-play-state');el.style.removeProperty('will-change')}
    else{el.style.setProperty('animation-play-state','paused','important');el.style.setProperty('will-change','auto','important')}
  }
  function syncMotion(){
    var root=q('crash'),play=active&&running;if(!root)return;
    setMotion(q('crashRocketFlight'),play);
    setMotion(q('crashStageBackgroundTrack'),play);
    setMotion(q('crashRocket'),play);
    var nodes=root.querySelectorAll('.crash-flame-outer,.crash-flame-middle,.crash-flame-core,.crash-rocket-heat');
    for(var i=0;i<nodes.length;i++)setMotion(nodes[i],play)
  }
  function syncRocket(){
    var rocket=q('crashRocket');
    if(rocket){if(active&&running)rocket.setAttribute('auto-rotate','');else rocket.removeAttribute('auto-rotate')}
    syncMotion()
  }
  function setActive(next){
    next=!!next&&!document.hidden;
    if(active===next){syncRocket();return}
    active=next;syncRocket();emit(active?'vexa-crash-visible':'vexa-crash-hidden');
  }
  function syncFromDom(){
    var root=q('crash'),flight=q('crashRocketFlight');
    running=!!(flight&&flight.getAttribute('data-state')==='running');
    setActive(!!(root&&root.classList.contains('active')))
  }
  window.__vexaCrashSetRunning=function(next){
    next=!!next;if(running===next){syncRocket();return}running=next;syncRocket()
  };
  customElements.whenDefined('model-viewer').then(function(){
    var ModelViewer=customElements.get('model-viewer');
    if(ModelViewer)ModelViewer.minimumRenderScale=.62;
    syncRocket()
  });
  document.addEventListener('visibilitychange',function(){if(document.hidden)setActive(false);else syncFromDom()});
  window.addEventListener('vexa:view-changed',function(ev){var d=ev&&ev.detail||{};setActive(d.id==='crash')});
  syncFromDom();
})();
`;
