export const BOOT_LOADER_SCRIPT = `
(function(){
  var bootHidden=false;
  function hide(){if(bootHidden)return;bootHidden=true;var boot=document.getElementById('vexaBoot');if(boot){boot.classList.add('hide');setTimeout(function(){if(boot&&boot.parentNode)boot.parentNode.removeChild(boot)},520)}}
  function windowReady(){return document.readyState==='complete'?Promise.resolve(true):new Promise(function(resolve){window.addEventListener('load',function(){resolve(true)},{once:true})})}
  function observeUntil(check){
    return new Promise(function(resolve){
      var observer=null,done=false;
      function test(){if(done)return;var value=false;try{value=check()}catch(e){}if(!value)return;done=true;if(observer)observer.disconnect();resolve(value)}
      test();if(done)return;
      observer=new MutationObserver(test);
      observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src','class','data-vexa-home-slot-url']});
      test();
    })
  }
  function imageReady(img){
    return new Promise(function(resolve){
      if(!img){resolve(false);return}
      var done=false,source=String(img.currentSrc||img.src||'');
      function cleanup(){try{img.removeEventListener('load',loaded);img.removeEventListener('error',failed)}catch(e){}}
      function finish(ok){if(done)return;done=true;cleanup();resolve(ok)}
      function decode(){if(typeof img.decode==='function')img.decode().then(function(){finish(true)}).catch(function(){finish(true)});else finish(true)}
      function loaded(){decode()}
      function failed(){setTimeout(function(){var next=String(img.currentSrc||img.src||'');if(next&&next!==source){cleanup();imageReady(img).then(resolve);return}finish(false)},0)}
      if(img.complete){if(img.naturalWidth>0)decode();else failed();return}
      img.addEventListener('load',loaded,{once:true});img.addEventListener('error',failed,{once:true});
    })
  }
  function homeReady(){
    return observeUntil(function(){
      var section=document.getElementById('homeLuckyCodeSection');
      var draw=document.getElementById('homeDrawInfoCard');
      var baseStyle=document.getElementById('homeLuckyCodeStyle');
      var tuningStyle=document.getElementById('homeSlotTuningStyle');
      var img=document.querySelector('#home .home-lottery-slot-image');
      return section&&draw&&baseStyle&&tuningStyle&&img?img:false
    }).then(function(img){return imageReady(img)})
  }
  function playHubReady(){
    return observeUntil(function(){
      var tg=window.Telegram&&window.Telegram.WebApp;
      var needsVisibility=!!String(tg&&tg.initData||'');
      if(needsVisibility&&!document.documentElement.classList.contains('play-zone-visibility-ready'))return false;
      var cards=document.querySelectorAll('#playzone [data-play-zone-card-id]');
      var imgs=document.querySelectorAll('#playzone [data-play-zone-card-id] .game-image img');
      if(cards.length!==9||imgs.length!==9)return false;
      for(var i=0;i<imgs.length;i++){var src=String(imgs[i].getAttribute('src')||'');if(!src||src.indexOf('data:image/gif')===0)return false}
      return Array.prototype.slice.call(imgs)
    }).then(function(imgs){return Promise.allSettled(imgs.map(function(img){return imageReady(img)})).then(function(){return true})})
  }
  function revealWhenReady(){
    if(window.__vexaInitialUiReadyStarted)return;
    window.__vexaInitialUiReadyStarted=true;
    window.__vexaInitialUiReady=Promise.all([windowReady(),homeReady(),playHubReady()]).then(function(){return new Promise(function(resolve){requestAnimationFrame(function(){requestAnimationFrame(function(){hide();resolve(true)})})})});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',revealWhenReady,{once:true});else revealWhenReady();

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