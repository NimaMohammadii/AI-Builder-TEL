export const BOOT_LOADER_SCRIPT = `
(function(){
  var bootHidden=false;
  var READY_TIMEOUT_MS=12000;
  function hide(){if(bootHidden)return;bootHidden=true;var boot=document.getElementById('vexaBoot');if(boot){boot.classList.add('hide');setTimeout(function(){if(boot&&boot.parentNode)boot.parentNode.removeChild(boot)},520)}}
  function settle(promise,ms,fallback){
    return new Promise(function(resolve){
      var done=false,timer=setTimeout(function(){finish(fallback)},ms);
      function finish(value){if(done)return;done=true;clearTimeout(timer);resolve(value)}
      Promise.resolve(promise).then(finish,function(){finish(fallback)})
    })
  }
  function call(fn,ms,fallback){try{return typeof fn==='function'?settle(fn(),ms,fallback):Promise.resolve(fallback)}catch(e){return Promise.resolve(fallback)}}
  function windowReady(){return document.readyState==='complete'?Promise.resolve(true):new Promise(function(resolve){window.addEventListener('load',function(){resolve(true)},{once:true})})}
  function observeUntil(check,ms){
    return new Promise(function(resolve){
      var observer=null,done=false,timer=setTimeout(function(){finish(false)},ms);
      function finish(value){if(done)return;done=true;clearTimeout(timer);if(observer)observer.disconnect();resolve(value)}
      function test(){if(done)return;var value=false;try{value=check()}catch(e){}if(value)finish(value)}
      test();if(done)return;
      if(window.MutationObserver){observer=new MutationObserver(test);observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src','class','style','data-vexa-home-slot-url','data-ton-balance-raw']})}
      test();
    })
  }
  function imageReady(img,ms){
    return new Promise(function(resolve){
      if(!img){resolve(false);return}
      var done=false,source=String(img.currentSrc||img.src||''),timer=setTimeout(function(){finish(false)},ms);
      function cleanup(){clearTimeout(timer);try{img.removeEventListener('load',loaded);img.removeEventListener('error',failed)}catch(e){}}
      function finish(ok){if(done)return;done=true;cleanup();resolve(!!ok)}
      function decode(){if(img.naturalWidth<=0){finish(false);return}if(typeof img.decode==='function')img.decode().then(function(){finish(true)}).catch(function(){finish(img.naturalWidth>0)});else finish(true)}
      function loaded(){source=String(img.currentSrc||img.src||source);decode()}
      function failed(){setTimeout(function(){if(done)return;var next=String(img.currentSrc||img.src||'');if(next&&next!==source){source=next;if(img.complete&&img.naturalWidth>0)decode();return}finish(false)},0)}
      img.addEventListener('load',loaded);img.addEventListener('error',failed);
      if(img.complete){if(img.naturalWidth>0)decode();else failed()}
    })
  }
  function backgroundUrl(el){
    if(!el||!window.getComputedStyle)return '';
    try{
      var value=String(getComputedStyle(el).backgroundImage||'');
      var start=value.indexOf('url(');if(start<0)return '';
      var end=value.indexOf(')',start+4);if(end<0)return '';
      var raw=value.slice(start+4,end).trim();
      if(raw.length>1&&((raw.charAt(0)==='"'&&raw.charAt(raw.length-1)==='"')||(raw.charAt(0)==="'"&&raw.charAt(raw.length-1)==="'")))raw=raw.slice(1,-1);
      return raw
    }catch(e){return ''}
  }
  function urlReady(url,ms){
    url=String(url||'');if(!url||url==='none')return Promise.resolve(true);
    var img=new Image();img.decoding='async';img.src=url;return imageReady(img,ms)
  }

  var GAME_IMAGE_RETRY_MS=900;
  var GAME_IMAGE_ATTEMPT_TIMEOUT_MS=15000;
  var GAME_IMAGE_STATIC_URLS=[
    '/assets/Home.PNG?v=1',
    '/assets/Playhub.PNG?v=1',
    '/assets/Rewards.PNG?v=1',
    '/assets/Mines.PNG?v=1',
    '/assets/Plinko.PNG?v=1',
    '/assets/Crash.PNG?v=1',
    '/assets/Slotbackground.PNG?v=1',
    '/assets/Wheel.PNG?v=1',
    '/assets/Dice.PNG?v=1',
    '/app/api/uploaded-image/ton-icon.png',
    '/assets/plinko-glass/ball.webp',
    '/assets/plinko-glass/peg.webp',
    '/assets/plinko-glass/houses.webp',
    '/assets/plinko-glass/control-panel-new.webp',
    '/assets/plinko-glass/point-amount-card.webp?v=2',
    '/assets/plinko-glass/half-button.webp',
    '/assets/plinko-glass/double-button.webp',
    '/assets/plinko-glass/risk-easy.webp',
    '/assets/plinko-glass/risk-medium.webp',
    '/assets/plinko-glass/risk-hard.webp',
    '/assets/plinko-glass/control-primary.webp'
  ];
  var gameImageKeep=window.__vexaGamePreloadedImages=window.__vexaGamePreloadedImages||[];
  var gameImageJobs=window.__vexaGameImagePreloadJobs=window.__vexaGameImagePreloadJobs||{};
  function gameImageDelay(ms){return new Promise(function(resolve){setTimeout(resolve,ms)})}
  function fetchJsonAttempt(url){
    return new Promise(function(resolve,reject){
      var done=false,controller=typeof AbortController==='function'?new AbortController():null;
      var options={cache:'no-store',credentials:'same-origin',headers:{accept:'application/json'}};
      if(controller)options.signal=controller.signal;
      var timer=setTimeout(function(){if(done)return;done=true;try{if(controller)controller.abort()}catch(e){}reject(new Error('image manifest timeout'))},GAME_IMAGE_ATTEMPT_TIMEOUT_MS);
      fetch(url,options)
        .then(function(r){if(!r.ok)throw new Error('image manifest failed');return r.json()})
        .then(function(value){if(done)return;done=true;clearTimeout(timer);resolve(value)},function(error){if(done)return;done=true;clearTimeout(timer);reject(error)})
    })
  }
  function fetchJsonStrict(url){
    return fetchJsonAttempt(url)
      .catch(function(){return gameImageDelay(GAME_IMAGE_RETRY_MS).then(function(){return fetchJsonStrict(url)})})
  }
  function preloadGameImageStrict(url){
    url=String(url||'').trim();
    if(!url||url==='none'||url.indexOf('data:image/')===0)return Promise.resolve(true);
    if(gameImageJobs[url])return gameImageJobs[url];
    function attempt(){
      return new Promise(function(resolve,reject){
        var img=new Image(),done=false;
        var timer=setTimeout(function(){finish(false)},GAME_IMAGE_ATTEMPT_TIMEOUT_MS);
        function cleanup(){clearTimeout(timer);try{img.removeEventListener('load',loaded);img.removeEventListener('error',failed)}catch(e){}}
        function finish(ok){if(done)return;done=true;cleanup();if(ok){gameImageKeep.push(img);resolve(true)}else reject(new Error('game image failed'))}
        function decoded(){
          if(img.naturalWidth<=0){finish(false);return}
          if(typeof img.decode==='function')img.decode().then(function(){finish(true)}).catch(function(){finish(img.naturalWidth>0)});else finish(true)
        }
        function loaded(){decoded()}
        function failed(){finish(false)}
        img.addEventListener('load',loaded);
        img.addEventListener('error',failed);
        img.decoding='async';
        img.loading='eager';
        img.src=url;
        if(img.complete&&img.naturalWidth>0)decoded()
      }).catch(function(){return gameImageDelay(GAME_IMAGE_RETRY_MS).then(attempt)})
    }
    gameImageJobs[url]=attempt();
    return gameImageJobs[url]
  }
  function addGameImageUrl(urls,seen,value){
    var url=String(value||'').trim();
    if(!url||url==='none'||url.indexOf('data:image/')===0||seen[url])return;
    seen[url]=true;urls.push(url)
  }
  function collectGameImageUrls(){
    var urls=[],seen={};
    GAME_IMAGE_STATIC_URLS.forEach(function(url){addGameImageUrl(urls,seen,url)});
    var jobs=[
      fetchJsonStrict('/app/api/game-card-images').then(function(j){var map=j&&j.images&&typeof j.images==='object'?j.images:{};Object.keys(map).forEach(function(key){addGameImageUrl(urls,seen,map[key])})}),
      fetchJsonStrict('/app/api/uploaded-images').then(function(j){(j&&Array.isArray(j.preload)?j.preload:[]).forEach(function(url){addGameImageUrl(urls,seen,url)})}),
      fetchJsonStrict('/app/api/section-backgrounds').then(function(j){(j&&Array.isArray(j.preload)?j.preload:[]).forEach(function(url){addGameImageUrl(urls,seen,url)})}),
      fetchJsonStrict('/app/api/crash-stage-images').then(function(j){(j&&Array.isArray(j.preload)?j.preload:[]).forEach(function(url){addGameImageUrl(urls,seen,url)})}),
      fetchJsonStrict('/app/api/ghost-run-assets').then(function(j){var map=j&&j.urls&&typeof j.urls==='object'?j.urls:{};Object.keys(map).forEach(function(key){addGameImageUrl(urls,seen,map[key])})}),
      fetchJsonStrict('/app/api/slot-frame').then(function(j){addGameImageUrl(urls,seen,j&&j.slotFrameUrl)}),
      fetchJsonStrict('/app/api/slot-symbols').then(function(j){(j&&Array.isArray(j.symbols)?j.symbols:[]).forEach(function(item){addGameImageUrl(urls,seen,item&&item.imageUrl)})}),
      fetchJsonStrict('/app/api/slot-controls').then(function(j){(j&&Array.isArray(j.controls)?j.controls:[]).forEach(function(item){if(item&&item.id==='spin')addGameImageUrl(urls,seen,item.imageUrl)})})
    ];
    return Promise.all(jobs).then(function(){return urls})
  }
  function gameImagesReady(){
    if(window.__vexaAllGameImagesReady)return window.__vexaAllGameImagesReady;
    window.__vexaAllGameImagesReady=collectGameImageUrls()
      .then(function(urls){return Promise.all(urls.map(preloadGameImageStrict))})
      .then(function(){gameImageKeep.length=0;return true});
    return window.__vexaAllGameImagesReady
  }

  function headerAndHomeAssetsReady(){
    var jobs=[];
    jobs.push(call(window.VexaRefreshHomeLotterySlotImage,5500,false));
    jobs.push(call(window.VexaRefreshHomeIntroImage,5500,false));
    jobs.push(call(window.VexaRefreshTonLogo,5500,false));
    jobs.push(call(window.VexaApplySectionBackgrounds,5500,false));
    jobs.push(window.VexaTonBalance&&typeof window.VexaTonBalance.load==='function'?settle(window.VexaTonBalance.load(),5500,false):Promise.resolve(false));
    if(window.VexaLevel&&typeof window.VexaLevel.load==='function')jobs.push(settle(window.VexaLevel.load(),5500,false));
    return Promise.all(jobs)
  }
  function homeReady(){
    return observeUntil(function(){
      var section=document.getElementById('homeLuckyCodeSection');
      var draw=document.getElementById('homeDrawInfoCard');
      var baseStyle=document.getElementById('homeLuckyCodeStyle');
      var tuningStyle=document.getElementById('homeSlotTuningStyle');
      var img=document.querySelector('#home .home-lottery-slot-image');
      return section&&draw&&baseStyle&&tuningStyle&&img?img:false
    },7000).then(function(firstImg){
      if(!firstImg)return false;
      return headerAndHomeAssetsReady().then(function(){
        return observeUntil(function(){
          var img=document.querySelector('#home .home-lottery-slot-image');
          var balance=document.getElementById('topTonBalance');
          return img&&balance&&String(balance.textContent||'').trim()?img:false
        },2500)
      }).then(function(finalImg){
        if(!finalImg)return false;
        var assets=[imageReady(finalImg,5000)];
        var intro=document.querySelector('#home .home-intro-card');
        var introUrl=backgroundUrl(intro);if(introUrl)assets.push(urlReady(introUrl,5000));
        var home=document.getElementById('home');
        var homeBg=backgroundUrl(home);if(homeBg)assets.push(urlReady(homeBg,5000));
        var ton=document.querySelector('.top-balance-pill .ton-mini-icon img');
        var tonSrc=ton?String(ton.currentSrc||ton.src||''):'';if(ton&&tonSrc&&tonSrc.indexOf('data:image/')!==0)assets.push(imageReady(ton,4500));
        return settle(Promise.all(assets),6000,false).then(function(){return true})
      })
    })
  }
  function playHubReady(){
    var manifest=window.__vexaPlayZoneImagesReady||Promise.resolve(false);
    var visibility=window.__vexaPlayZoneVisibilityReady||Promise.resolve(false);
    return Promise.all([settle(manifest,6500,false),settle(visibility,6500,false)]).then(function(){
      return observeUntil(function(){
        if(!document.documentElement.classList.contains('play-zone-visibility-ready'))return false;
        var cards=document.querySelectorAll('#playzone [data-play-zone-card-id]');
        var imgs=document.querySelectorAll('#playzone [data-play-zone-card-id] .game-image img');
        if(cards.length!==9||imgs.length!==9)return false;
        for(var i=0;i<imgs.length;i++){var src=String(imgs[i].getAttribute('src')||'');if(!src||src.indexOf('data:image/gif')===0)return false}
        return Array.prototype.slice.call(imgs)
      },7000)
    }).then(function(imgs){
      if(!imgs||!imgs.length)return false;
      return settle(Promise.all(imgs.map(function(img){return imageReady(img,5500)})),6500,false).then(function(){return true})
    })
  }
  function revealWhenReady(){
    if(window.__vexaInitialUiReadyStarted)return;
    window.__vexaInitialUiReadyStarted=true;
    var ready=Promise.all([
      settle(windowReady(),8000,true),
      settle(homeReady(),10000,false),
      settle(playHubReady(),10000,false)
    ]);
    var timedUiReady=settle(ready,READY_TIMEOUT_MS,false);
    window.__vexaInitialUiReady=Promise.all([timedUiReady,gameImagesReady()]).then(function(){return new Promise(function(resolve){requestAnimationFrame(function(){requestAnimationFrame(function(){hide();resolve(true)})})})})
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