export const BOOT_LOADER_SCRIPT = `
(function(){
  function hide(){var boot=document.getElementById('vexaBoot');if(boot){boot.classList.add('hide');setTimeout(function(){if(boot&&boot.parentNode)boot.parentNode.removeChild(boot)},520)}}
  if(document.readyState==='complete')setTimeout(hide,650);else window.addEventListener('load',function(){setTimeout(hide,650)});
  setTimeout(hide,2200);

  var BG='/assets/Crash.PNG?v=1';
  var TON='/app/api/uploaded-image/ton-icon.png';
  var STAGE_META_KEY='vexa:crash-stage-manifest:v1';
  var kept=window.__vexaCrashPreloadedImages=window.__vexaCrashPreloadedImages||[];
  var imageJobs=window.__vexaCrashPreloadImageJobs=window.__vexaCrashPreloadImageJobs||{};
  var rocketReady=Promise.resolve(true);
  function image(url){
    if(!url)return Promise.resolve(false);
    if(imageJobs[url])return imageJobs[url];
    imageJobs[url]=new Promise(function(resolve){
      var img=new Image(),done=false;
      kept.push(img);
      function finish(ok){if(done)return;done=true;resolve(ok)}
      img.onload=function(){if(typeof img.decode==='function')img.decode().then(function(){finish(true)}).catch(function(){finish(true)});else finish(true)};
      img.onerror=function(){finish(false)};
      img.decoding='async';
      img.src=url;
    });
    return imageJobs[url]
  }
  function stageUrls(manifest){
    if(!manifest||!manifest.images)return [];
    var list=Array.isArray(manifest.preload)?manifest.preload:Object.keys(manifest.images).map(function(k){return manifest.images[k]});
    return list.filter(function(url){return typeof url==='string'&&url.length>0})
  }
  function useStageManifest(manifest){
    if(!manifest||!manifest.images)return manifest;
    window.__vexaCrashStageManifest=manifest;
    window.__vexaCrashStageImagesReady=Promise.allSettled(stageUrls(manifest).map(function(url){return image(url)})).then(function(){return true});
    return manifest
  }
  function startAssets(){
    if(window.__vexaCrashAssetsPreloadStarted)return window.__vexaCrashAssetsReady||Promise.resolve(true);
    window.__vexaCrashAssetsPreloadStarted=true;
    try{
      var cached=JSON.parse(localStorage.getItem(STAGE_META_KEY)||'null');
      if(cached&&cached.images)useStageManifest(cached)
    }catch(e){}
    var stagePromise=fetch('/app/api/crash-stage-images',{cache:'no-store',credentials:'same-origin',headers:{accept:'application/json'}})
      .then(function(r){if(!r.ok)throw new Error('stage manifest failed');return r.json()})
      .then(function(manifest){
        useStageManifest(manifest);
        try{localStorage.setItem(STAGE_META_KEY,JSON.stringify(manifest))}catch(e){}
        return manifest
      })
      .catch(function(){return window.__vexaCrashStageManifest||null});
    window.__vexaCrashStageManifestPromise=stagePromise;
    var stagesReady=stagePromise.then(function(){return window.__vexaCrashStageImagesReady||true});
    window.__vexaCrashAssetsReady=Promise.allSettled([image(BG),image(TON),stagesReady,rocketReady]).then(function(){return true});
    return window.__vexaCrashAssetsReady
  }
  function warmCrash(){
    if(window.__vexaCrashWarmupStarted)return;
    window.__vexaCrashWarmupStarted=true;
    var lazy=window.VexaLazySections;
    if(!lazy||typeof lazy.ensure!=='function'){startAssets();return}
    lazy.ensure('crash');
    var rocket=document.getElementById('crashRocket');
    var rocketSrc=rocket?String(rocket.getAttribute('src')||''):'';
    if(rocket&&rocketSrc)rocket.removeAttribute('src');
    if(rocket){
      rocketReady=new Promise(function(resolve){
        var done=false;
        function finish(ok){if(done)return;done=true;resolve(ok)}
        rocket.addEventListener('load',function(){finish(true)},{once:true});
        rocket.addEventListener('error',function(){finish(false)},{once:true});
      });
      window.__vexaCrashRocketReady=rocketReady;
    }
    var live=window.VexaCrashLiveD1;
    var liveRequest=live&&typeof live.load==='function'?Promise.resolve(live.load()).catch(function(){return false}):Promise.resolve(false);
    window.__vexaCrashLiveWarmupPromise=liveRequest;
    var liveGate=Promise.race([liveRequest,new Promise(function(resolve){setTimeout(resolve,1200)})]);
    function releaseHeavy(){if(rocket&&rocketSrc&&!rocket.getAttribute('src'))rocket.setAttribute('src',rocketSrc);return startAssets()}
    liveGate.then(releaseHeavy,releaseHeavy)
  }
  setTimeout(warmCrash,0);
})();
`;