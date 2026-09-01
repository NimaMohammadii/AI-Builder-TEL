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
  var GAME_MANIFEST_ATTEMPT_TIMEOUT_MS=6000;
  var GAME_IMAGE_ATTEMPT_TIMEOUT_MS=15000;
  var GAME_IMAGE_MAX_ATTEMPTS=2;
  var GAME_IMAGE_MANIFEST_CACHE_KEY='vexa:game-image-manifests:v1';
  var GAME_IMAGE_COMMON_URLS=[
    '/assets/Home.PNG?v=1',
    '/assets/Playhub.PNG?v=1',
    '/assets/Rewards.PNG?v=1',
    '/assets/Predict.PNG?v=1',
    '/app/api/uploaded-image/ton-icon.png'
  ];
  var GAME_IMAGE_STATIC_BY_GAME={
    mines:['/assets/Mines.PNG?v=1'],
    plinko:[
      '/assets/Plinko.PNG?v=1',
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
    ],
    crash:['/assets/Crash.PNG?v=60f79b66'],
    slot:['/assets/Slotbackground.PNG?v=1'],
    wheel:['/assets/Wheel.PNG?v=1'],
    dice:['/assets/Dice.PNG?v=1']
  };
  var gameImageKeep=window.__vexaGamePreloadedImages=window.__vexaGamePreloadedImages||[];
  var gameImageJobs=window.__vexaGameImagePreloadJobs=window.__vexaGameImagePreloadJobs||{};
  var gameImageFailures={};
  function visibility(){return window.VexaPlayZoneVisibility||null}
  function shouldPreloadGame(id){var state=visibility();return !state||typeof state.shouldPreload!=='function'||state.shouldPreload(id)}
  function staticUrlsForVisibleGames(){
    var out=GAME_IMAGE_COMMON_URLS.slice();
    Object.keys(GAME_IMAGE_STATIC_BY_GAME).forEach(function(id){if(shouldPreloadGame(id))out=out.concat(GAME_IMAGE_STATIC_BY_GAME[id])});
    return out
  }
  function gameImageDelay(ms){return new Promise(function(resolve){setTimeout(resolve,ms)})}
  function readManifestCache(){try{var value=JSON.parse(localStorage.getItem(GAME_IMAGE_MANIFEST_CACHE_KEY)||'{}');return value&&typeof value==='object'?value:{}}catch(e){return {}}}
  function writeManifestCache(cache){try{localStorage.setItem(GAME_IMAGE_MANIFEST_CACHE_KEY,JSON.stringify(cache||{}))}catch(e){}}
  function fetchJsonAttempt(url){
    return new Promise(function(resolve,reject){
      var done=false,controller=typeof AbortController==='function'?new AbortController():null;
      var options={cache:'no-store',credentials:'same-origin',headers:{accept:'application/json'}};
      if(controller)options.signal=controller.signal;
      var timer=setTimeout(function(){if(done)return;done=true;try{if(controller)controller.abort()}catch(e){}reject(new Error('image manifest timeout'))},GAME_MANIFEST_ATTEMPT_TIMEOUT_MS);
      fetch(url,options)
        .then(function(r){if(!r.ok)throw new Error('image manifest failed');return r.json()})
        .then(function(value){if(done)return;done=true;clearTimeout(timer);resolve(value)},function(error){if(done)return;done=true;clearTimeout(timer);reject(error)})
    })
  }
  function fetchJsonStrict(url,attempt){
    attempt=Math.max(0,Math.floor(Number(attempt)||0));
    return fetchJsonAttempt(url).catch(function(){
      if(attempt+1>=GAME_IMAGE_MAX_ATTEMPTS)return null;
      return gameImageDelay(GAME_IMAGE_RETRY_MS).then(function(){return fetchJsonStrict(url,attempt+1)})
    })
  }
  function preloadGameImageStrict(url){
    url=String(url||'').trim();
    if(!url||url==='none'||url.indexOf('data:image/')===0)return Promise.resolve(true);
    if(gameImageJobs[url])return gameImageJobs[url];
    function attempt(attemptNo){
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
      }).catch(function(){
        if(attemptNo+1>=GAME_IMAGE_MAX_ATTEMPTS)return false;
        return gameImageDelay(GAME_IMAGE_RETRY_MS).then(function(){return attempt(attemptNo+1)})
      })
    }
    gameImageJobs[url]=attempt(0).then(function(ok){if(ok)delete gameImageFailures[url];else gameImageFailures[url]=true;return ok});
    return gameImageJobs[url]
  }
  function cleanGameImageUrl(value){
    var url=String(value||'').trim();
    return !url||url==='none'||url.indexOf('data:image/')===0?'':url
  }
  function preloadUrlList(values){
    var seen={},jobs=[];
    (Array.isArray(values)?values:[]).forEach(function(value){
      var url=cleanGameImageUrl(value);
      if(!url||seen[url])return;
      seen[url]=true;
      jobs.push(preloadGameImageStrict(url))
    });
    return Promise.all(jobs)
  }
  function preloadArrayUrls(j){return j&&Array.isArray(j.preload)?j.preload:[]}
  function sectionBackgroundUrls(j){
    var out=[],sections=j&&Array.isArray(j.sections)?j.sections:[];
    sections.forEach(function(section){var id=String(section&&section.id||''),url=section&&section.backgroundUrl;if(url&&shouldPreloadGame(id))out.push(url)});
    return out
  }
  function ghostRunUrls(j){
    var out=[],map=j&&j.urls&&typeof j.urls==='object'?j.urls:{};
    Object.keys(map).forEach(function(key){out.push(map[key])});
    return out
  }
  function slotFrameUrls(j){return [j&&j.slotFrameUrl]}
  function slotSymbolUrls(j){return (j&&Array.isArray(j.symbols)?j.symbols:[]).map(function(item){return item&&item.imageUrl})}
  function slotControlUrls(j){
    return (j&&Array.isArray(j.controls)?j.controls:[]).filter(function(item){return item&&item.id==='spin'}).map(function(item){return item.imageUrl})
  }
  var GAME_IMAGE_MANIFESTS=[
    {url:'/app/api/uploaded-images?context=startup',urls:preloadArrayUrls},
    {url:'/app/api/uploaded-images?context=mines',game:'mines',urls:preloadArrayUrls},
    {url:'/app/api/uploaded-images?context=plinko',game:'plinko',urls:preloadArrayUrls},
    {url:'/app/api/section-backgrounds',urls:sectionBackgroundUrls},
    {url:'/app/api/ghost-run-assets',game:'ghostrun',urls:ghostRunUrls},
    {url:'/app/api/slot-frame',game:'slot',urls:slotFrameUrls},
    {url:'/app/api/slot-symbols',game:'slot',urls:slotSymbolUrls},
    {url:'/app/api/slot-controls',game:'slot',urls:slotControlUrls}
  ];
  function preloadManifest(spec,cache){
    if(spec.game&&!shouldPreloadGame(spec.game))return Promise.resolve(true);
    var cached=cache&&cache[spec.url];
    var cachedJob=preloadUrlList(spec.urls(cached));
    return fetchJsonStrict(spec.url,0).then(function(j){
      if(!j)return cachedJob.then(function(){return true});
      cache[spec.url]=j;
      writeManifestCache(cache);
      return preloadUrlList(spec.urls(j)).then(function(){return true})
    })
  }
  function gameImagesReady(){
    if(window.__vexaAllGameImagesReady)return window.__vexaAllGameImagesReady;
    window.__vexaAllGameImagesReady=Promise.resolve(window.__vexaPlayZoneVisibilityReady||false).then(function(){
      var manifestCache=readManifestCache();
      var jobs=[preloadUrlList(staticUrlsForVisibleGames())];
      GAME_IMAGE_MANIFESTS.forEach(function(spec){jobs.push(preloadManifest(spec,manifestCache))});
      return Promise.all(jobs)
    }).then(function(){
      window.__vexaGameImagePreloadFailures=Object.keys(gameImageFailures);
      gameImageKeep.length=0;
      return true
    }).catch(function(){
      window.__vexaGameImagePreloadFailures=Object.keys(gameImageFailures);
      gameImageKeep.length=0;
      return true
    });
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
    var selectedHome=document.getElementById('home');
    if(selectedHome&&selectedHome.getAttribute('data-home-variant')==='two')return Promise.resolve(true);
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
    var visibilityReady=window.__vexaPlayZoneVisibilityReady||Promise.resolve(false);
    return Promise.all([settle(manifest,6500,false),settle(visibilityReady,6500,false)]).then(function(){
      return observeUntil(function(){
        if(!document.documentElement.classList.contains('play-zone-visibility-ready'))return false;
        var cards=Array.prototype.slice.call(document.querySelectorAll('#playzone [data-play-zone-card-id]')).filter(function(card){return !card.hidden});
        var imgs=cards.map(function(card){return card.querySelector('.game-image img')}).filter(Boolean);
        if(!cards.length)return [];
        if(imgs.length!==cards.length)return false;
        for(var i=0;i<imgs.length;i++){var src=String(imgs[i].getAttribute('src')||'');if(!src||src.indexOf('data:image/gif')===0)return false}
        return imgs
      },7000)
    }).then(function(imgs){
      if(!Array.isArray(imgs))return false;
      if(!imgs.length)return true;
      return settle(Promise.all(imgs.map(function(img){return imageReady(img,5500)})),6500,false).then(function(){return true})
    })
  }
  function lazySectionsReady(){
    var lazy=window.VexaLazySections;
    return lazy&&typeof lazy.preload==='function'?settle(lazy.preload(),10000,false):Promise.resolve(false)
  }
  function revealWhenReady(){
    if(window.__vexaInitialUiReadyStarted)return;
    window.__vexaInitialUiReadyStarted=true;
    var ready=Promise.all([
      settle(windowReady(),8000,true),
      settle(homeReady(),10000,false),
      settle(playHubReady(),10000,false),
      lazySectionsReady()
    ]);
    var timedUiReady=settle(ready,READY_TIMEOUT_MS,false);
    window.__vexaInitialUiReady=Promise.all([timedUiReady,gameImagesReady()]).then(function(){return new Promise(function(resolve){requestAnimationFrame(function(){requestAnimationFrame(function(){hide();resolve(true)})})})})
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',revealWhenReady,{once:true});else revealWhenReady();
})();
`;
