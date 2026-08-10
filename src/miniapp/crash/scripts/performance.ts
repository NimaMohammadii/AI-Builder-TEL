export const CRASH_PERFORMANCE_SCRIPT = `
(function(){
  if(window.__vexaCrashPerfPatch)return;
  window.__vexaCrashPerfPatch=true;
  function visible(){try{window.dispatchEvent(new CustomEvent('vexa-crash-visible'))}catch(e){}}
  document.addEventListener('visibilitychange',function(){
    if(document.hidden){
      try{window.dispatchEvent(new CustomEvent('vexa-crash-hidden'))}catch(e){}
    }else{
      visible();
    }
  });
  window.addEventListener('vexa:view-changed',function(ev){var d=ev&&ev.detail||{};if(d.id==='crash')requestAnimationFrame(visible)});
})();
`;
