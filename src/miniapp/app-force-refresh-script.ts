export const APP_FORCE_REFRESH_SCRIPT = `
(function(){
  var KEY='vexa-app-cache-version';
  var CHECK_INTERVAL=60000;
  var checking=false;
  var cacheNames=['vexa-play-zone-card-images-v1','vexa-daily-reward-images-v2','vexa-dice-assets-v1','ghost-run-assets-v1'];
  function removeLocalCaches(){
    try{
      Object.keys(localStorage).forEach(function(k){
        if(k.indexOf('vexaUploadedImages:')===0||k.indexOf('vexaUploadedImagesUpdatedAt:')===0||k.indexOf('vexaPlayZoneImageUrls')===0||k.indexOf('vexaSectionLocks:')===0||k.indexOf('vexaSectionLocksUpdatedAt:')===0)localStorage.removeItem(k);
      });
    }catch(e){}
  }
  function clearBrowserCaches(){
    try{if(!('caches' in window))return Promise.resolve();return Promise.all(cacheNames.map(function(name){return caches.delete(name).catch(function(){return false})}))}catch(e){return Promise.resolve()}
  }
  function stripCacheParams(url){
    try{var u=new URL(String(url||''),location.href);u.searchParams.delete('rt');u.searchParams.delete('av');return u.pathname+u.search+u.hash}catch(e){return String(url||'')}
  }
  function bumpImages(version){
    var stamp=encodeURIComponent(String(version||Date.now()));
    document.querySelectorAll('img[src]').forEach(function(img){
      var raw=stripCacheParams(img.getAttribute('src')||'');
      if(!raw||raw.indexOf('/app/api/')!==0)return;
      try{var u=new URL(raw,location.href);u.searchParams.set('av',stamp);img.src=u.pathname+u.search+u.hash}catch(e){}
    });
  }
  function refreshHelpers(){
    try{window.VexaUploadedImages&&window.VexaUploadedImages.reload&&window.VexaUploadedImages.reload()}catch(e){}
    try{window.VexaRefreshPlayZoneImages&&window.VexaRefreshPlayZoneImages(true)}catch(e){}
    try{window.VexaSectionLocks&&window.VexaSectionLocks.reload&&window.VexaSectionLocks.reload()}catch(e){}
  }
  function apply(version,skipReload){
    version=String(version||'');
    if(!version)return Promise.resolve(false);
    try{localStorage.setItem(KEY,version)}catch(e){}
    removeLocalCaches();
    return clearBrowserCaches().then(function(){bumpImages(version);refreshHelpers();if(!skipReload)setTimeout(function(){try{location.reload()}catch(e){}},250);return true});
  }
  function check(){
    if(checking)return Promise.resolve(false);
    checking=true;
    return fetch('/app/api/app-version?ts='+Date.now(),{cache:'no-store',headers:{'cache-control':'no-store','pragma':'no-cache'}}).then(function(r){return r.ok?r.json():null}).then(function(j){
      var version=String(j&&j.version||'');
      var current='';try{current=localStorage.getItem(KEY)||''}catch(e){}
      if(version&&current&&version!==current)return apply(version,false);
      if(version&&!current)try{localStorage.setItem(KEY,version)}catch(e){}
      return false;
    }).catch(function(){return false}).finally(function(){checking=false});
  }
  window.VexaAppRefresh={check:check,apply:apply,refreshImages:function(){return apply(String(Date.now()),true)}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',check,{once:true});else check();
  setInterval(check,CHECK_INTERVAL);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)check()});
})();
`;
