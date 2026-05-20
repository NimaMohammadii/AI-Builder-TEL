export const CRASH_PERFORMANCE_SCRIPT = `
(function(){
  if(window.__vexaCrashPerfPatch)return;
  window.__vexaCrashPerfPatch=true;
  document.addEventListener('visibilitychange',function(){
    if(document.hidden){
      try{window.dispatchEvent(new CustomEvent('vexa-crash-hidden'))}catch(e){}
    }else{
      try{window.dispatchEvent(new CustomEvent('vexa-crash-visible'))}catch(e){}
    }
  });
})();
`;
