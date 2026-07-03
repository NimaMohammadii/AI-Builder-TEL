export const PLAY_ZONE_IMAGE_REFRESH_SCRIPT = `
(function(){
  var games=['mines','plinko','crash','wheel','dice','rps','slot','coinflip','hilo','ghostrun'];
  var legacyAds=['playzone-row-ad-1','playzone-row-ad-2','playzone-row-ad-3','playzone-row-ad-right','playzone-row-ad-left'];
  var all=games.concat(legacyAds);
  var KEY='vexaPlayZoneImageUrls:v13';
  var OLD_KEYS=['vexaPlayZoneImageUrls:v12','vexaPlayZoneImageUrls:v11','vexaPlayZoneImageUrls:v10','vexaPlayZoneImageUrls:v9','vexaPlayZoneImageUrls:v8','vexaPlayZoneImageUrls:v7'];
  var SECTION_LOCKS_PREFIX='vexaSectionLocks:v1:';
  var countersStarted=false;
  var counterTimer=null;
  var refreshInFlight=null;
  var EMPTY='data:image/gif;base64,R0lGODlhAQABAAAAACw=';
  var IMAGE_CACHE='vexa-play-zone-card-images-v1';
  var imageState=window.__vexaPlayZoneCardImageState=window.__vexaPlayZoneCardImageState||{objectUrls:{},promises:{}};
  function dropOldCaches(){try{OLD_KEYS.forEach(function(k){localStorage.removeItem(k)});Object.keys(localStorage).forEach(function(k){if(k.indexOf('vexaPlayZoneImageUrlsUpdatedAt')===0)localStorage.removeItem(k)})}catch(e){}}
  function readCache(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return {}}}
  function writeCache(map){try{localStorage.setItem(KEY,JSON.stringify(map||{}))}catch(e){}}
  function readSectionLocks(){var merged={sections:[]};try{Object.keys(localStorage).forEach(function(key){if(key.indexOf(SECTION_LOCKS_PREFIX)!==0)return;var data=JSON.parse(localStorage.getItem(key)||'null');if(data&&Array.isArray(data.sections))merged.sections=merged.sections.concat(data.sections)})}catch(e){}return merged.sections.length?merged:null}
  function stripCacheParams(url){try{var u=new URL(String(url||''),location.href);u.searchParams.delete('rt');u.searchParams.delete('av');return u.pathname+u.search+u.hash}catch(e){return String(url||'').replace(/([?&])(rt|av)=\d+(&?)/g,'$1').replace(/[?&]$/,'')}}
  function baseGameUrl(id){return '/app/api/section-lock-image/'+id+'/locked.png?v=1'}
  function stable(url){return stripCacheParams(url)}
  function allowed(url){return Boolean(url)&&String(url).indexOf('/app/api/section-lock-image/shared/')<0}
  function isPlayZoneActive(){var root=document.getElementById('playzone');return !!(root&&root.classList.contains('active')&&!document.hidden)}
  function fetchCachedImage(url){
    if(!url)return Promise.resolve('');
    if(imageState.objectUrls[url])return Promise.resolve(imageState.objectUrls[url]);
    if(imageState.promises[url])return imageState.promises[url];
    if(!('caches' in window)||!window.fetch||!window.URL||!window.URL.createObjectURL)return Promise.resolve(url);
    imageState.promises[url]=caches.open(IMAGE_CACHE).then(function(cache){
      return cache.match(url).then(function(hit){
        if(hit)return hit.blob();
        return fetch(url,{credentials:'same-origin',cache:'force-cache'}).then(function(res){
          if(!res||!res.ok)throw new Error('play zone image failed');
          cache.put(url,res.clone()).catch(function(){});
          return res.blob();
        });
      });
    }).then(function(blob){
      if(!imageState.objectUrls[url])imageState.objectUrls[url]=URL.createObjectURL(blob);
      return imageState.objectUrls[url];
    }).catch(function(){return url}).finally(function(){delete imageState.promises[url]});
    return imageState.promises[url];
  }
  function setImage(img,url){
    if(!img)return;
    var raw=allowed(url)?url:(img.getAttribute('data-section-image-src')||'');
    if(!raw)return;
    var next=stable(raw);
    var currentKey=img.getAttribute('data-section-image-src')||'';
    img.onerror=function(){this.onerror=null;this.src=this.dataset.fallbackSrc||next||this.src;this.style.display=''};
    img.setAttribute('data-section-image-src',next);
    img.setAttribute('data-fallback-src',next);
    img.classList.remove('is-empty');
    img.style.display='';
    img.loading='eager';
    img.decoding='async';
    if(currentKey===next&&img.getAttribute('src')&&img.getAttribute('src')!==EMPTY)return;
    fetchCachedImage(next).then(function(src){
      if(!src||img.getAttribute('data-section-image-src')!==next)return;
      if(img.getAttribute('src')!==src)img.src=src;
    });
  }
  function findGameImg(id){return document.querySelector('#playzone .game-card-shell[data-game-view="'+id+'"] .game-image img')||document.querySelector('#playzone .game-card[data-game-view="'+id+'"] .game-image img')||document.querySelector('#playzone .game-card[data-view="'+id+'"] .game-image img')}
  function apply(map){
    games.forEach(function(id){var img=findGameImg(id);var url=map[id]||baseGameUrl(id);var next=stable(url);if(img&&(img.getAttribute('src')===EMPTY||img.getAttribute('data-section-image-src')!==next))setImage(img,url)});
    legacyAds.forEach(function(id){setImage(document.querySelector('#playzone [data-play-zone-ad="'+id+'"]'),map[id])});
  }
  function mapFromSectionLocks(cached){
    var data=readSectionLocks();
    var next={};
    if(data&&Array.isArray(data.sections)){
      data.sections.forEach(function(section){var url=stripCacheParams(section&&section.lockedImageUrl||section&&section.imageUrl||'');if(section&&all.indexOf(section.id)>=0&&allowed(url))next[section.id]=url});
    }
    all.forEach(function(id){if(!next[id]&&allowed(cached[id]))next[id]=stripCacheParams(cached[id])});
    games.forEach(function(id){if(!next[id])next[id]=baseGameUrl(id)});
    return next;
  }
  function refreshFromCache(){if(!isPlayZoneActive())return false;var next=mapFromSectionLocks(readCache());writeCache(next);apply(next);startCounters();return next}
  function refresh(force){
    if(!isPlayZoneActive())return Promise.resolve(false);
    if(force&&window.VexaSectionLocks&&window.VexaSectionLocks.reload){
      if(refreshInFlight)return refreshInFlight;
      refreshInFlight=window.VexaSectionLocks.reload(window.VexaSectionLocks.playZoneSections?window.VexaSectionLocks.playZoneSections():undefined).then(function(){return refreshFromCache()}).catch(function(){return refreshFromCache()}).finally(function(){refreshInFlight=null});
      return refreshInFlight;
    }
    return Promise.resolve(refreshFromCache());
  }
  function tickCounters(){
    if(!isPlayZoneActive()||!window.VexaLiveGameCounts)return;
    if(typeof window.VexaLiveGameCounts.sync==='function'){window.VexaLiveGameCounts.sync();return}
    if(typeof window.VexaLiveGameCounts.get!=='function'||typeof window.VexaLiveGameCounts.setCount!=='function')return;
    document.querySelectorAll('#playzone .game-card-shell[data-game-view] .game-players b').forEach(function(el){
      var shell=el.closest&&el.closest('.game-card-shell[data-game-view]');
      var id=shell&&shell.getAttribute('data-game-view');
      if(id)window.VexaLiveGameCounts.setCount(id,window.VexaLiveGameCounts.get(id));
    });
  }
  function stopCounters(){if(counterTimer){clearTimeout(counterTimer);counterTimer=null}countersStarted=false}
  function scheduleCounterTick(delay){if(counterTimer)clearTimeout(counterTimer);if(!isPlayZoneActive()){stopCounters();return}counterTimer=setTimeout(function(){counterTimer=null;if(!isPlayZoneActive()){stopCounters();return}tickCounters();scheduleCounterTick(3000)},Math.max(250,delay||3000))}
  function startCounters(){if(countersStarted)return;countersStarted=true;scheduleCounterTick(3000)}
  dropOldCaches();if(isPlayZoneActive())refresh(false);
  document.addEventListener('click',function(e){var b=e.target&&e.target.closest&&e.target.closest('[data-view="playzone"]');if(b)setTimeout(function(){refresh(false);tickCounters()},80)},true);
  document.addEventListener('visibilitychange',function(){if(!document.hidden&&isPlayZoneActive()){tickCounters();startCounters()}else stopCounters()});
  window.VexaRefreshPlayZoneImages=function(){return refresh(false)};
})();
`;