export const CRASH_PERFORMANCE_SCRIPT = `
(function(){
  if(window.__vexaCrashPerfPatch)return;
  window.__vexaCrashPerfPatch=true;
  var active=false;
  function q(id){return document.getElementById(id)}
  function emit(name){try{window.dispatchEvent(new CustomEvent(name))}catch(e){}}
  function syncRocket(running){
    var rocket=q('crashRocket');if(!rocket)return;
    if(running)rocket.setAttribute('auto-rotate','');
    else rocket.removeAttribute('auto-rotate');
  }
  function setActive(next){
    next=!!next&&!document.hidden;
    if(active===next){syncRocket(next);return}
    active=next;syncRocket(active);emit(active?'vexa-crash-visible':'vexa-crash-hidden');
  }
  function syncFromDom(){var root=q('crash');setActive(!!(root&&root.classList.contains('active')))}
  customElements.whenDefined('model-viewer').then(function(){var ModelViewer=customElements.get('model-viewer');if(ModelViewer)ModelViewer.minimumRenderScale=.65;syncRocket(active)});
  document.addEventListener('visibilitychange',function(){if(document.hidden)setActive(false);else syncFromDom()});
  window.addEventListener('vexa:view-changed',function(ev){var d=ev&&ev.detail||{};setActive(d.id==='crash')});
  syncFromDom();
})();
`;
