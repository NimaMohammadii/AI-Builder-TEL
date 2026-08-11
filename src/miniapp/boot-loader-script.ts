export const BOOT_LOADER_SCRIPT = `
(function(){
  function hide(){var boot=document.getElementById('vexaBoot');if(boot){boot.classList.add('hide');setTimeout(function(){if(boot&&boot.parentNode)boot.parentNode.removeChild(boot)},520)}}
  if(document.readyState==='complete')setTimeout(hide,650);else window.addEventListener('load',function(){setTimeout(hide,650)});
  setTimeout(hide,2200);

  if(window.__vexaCrashAssetsPreloadStarted)return;
  window.__vexaCrashAssetsPreloadStarted=true;
  var BG='/assets/Crash.PNG?v=1';
  var ROCKET='/assets/Rocket3D.glb?v=2440b00e70f8e34a2366d642d3f99035d366618a';
  var TON='/app/api/uploaded-image/ton-icon.png';
  var STAGE_META_KEY='vexa:crash-stage-manifest:v1';
  var kept=window.__vexaCrashPreloadedImages=window.__vexaCrashPreloadedImages||[];
  var imageJobs=window.__vexaCrashPreloadImageJobs=window.__vexaCrashPreloadImageJobs||{};
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
  function binary(url){
    return fetch(url,{cache:'force-cache',credentials:'same-origin'}).then(function(r){if(!r.ok)throw new Error('asset preload failed');return r.arrayBuffer()}).then(function(){return true}).catch(function(){return false})
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
  window.__vexaCrashAssetsReady=Promise.allSettled([image(BG),image(TON),binary(ROCKET),stagesReady]).then(function(){return true});
})();
`;