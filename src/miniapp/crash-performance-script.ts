export const CRASH_PERFORMANCE_SCRIPT = `
(function(){
  if(window.__vexaCrashPerfPatch)return;
  window.__vexaCrashPerfPatch=true;
  var nativeRAF=window.requestAnimationFrame.bind(window);
  var nativeCAF=window.cancelAnimationFrame&&window.cancelAnimationFrame.bind(window);
  var lastByName={};
  function active(){var c=document.getElementById('crash');return !!(c&&c.classList.contains('active'))}
  function minDelay(name){
    if(document.hidden)return 1000;
    if(!active())return 0;
    if(name==='update')return 34;
    if(name==='frame')return 900;
    return 34;
  }
  window.requestAnimationFrame=function(cb){
    var name=(cb&&cb.name)||'anon';
    var wrapped=function(ts){
      var delay=minDelay(name);
      if(delay<=0)return cb(ts);
      var now=performance.now(),last=lastByName[name]||0,wait=delay-(now-last);
      if(wait>1){
        return setTimeout(function(){lastByName[name]=performance.now();cb(performance.now())},wait);
      }
      lastByName[name]=now;
      return cb(ts);
    };
    return nativeRAF(wrapped);
  };
  if(nativeCAF){window.cancelAnimationFrame=function(id){try{clearTimeout(id)}catch(e){} return nativeCAF(id)}}
})();
`;
