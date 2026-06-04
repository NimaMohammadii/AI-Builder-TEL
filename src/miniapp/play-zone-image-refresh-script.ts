export const PLAY_ZONE_IMAGE_REFRESH_SCRIPT = `
(function(){
  var games=['mines','plinko','crash','wheel','dice','rps','slot','coinflip','hilo'];
  var legacyAds=['playzone-row-ad-1','playzone-row-ad-2','playzone-row-ad-3','playzone-row-ad-right','playzone-row-ad-left'];
  var all=games.concat(legacyAds);
  var KEY='vexaPlayZoneImageUrls:v13';
  var OLD_KEYS=['vexaPlayZoneImageUrls:v12','vexaPlayZoneImageUrls:v11','vexaPlayZoneImageUrls:v10','vexaPlayZoneImageUrls:v9','vexaPlayZoneImageUrls:v8','vexaPlayZoneImageUrls:v7'];
  var SECTION_LOCKS_KEY='vexaSectionLocks:v1';
  var countersStarted=false;
  var refreshInFlight=null;
  var EMPTY='data:image/gif;base64,R0lGODlhAQABAAAAACw=';
  var IMAGE_CACHE='vexa-play-zone-card-images-v1';
  var imageState=window.__vexaPlayZoneCardImageState=window.__vexaPlayZoneCardImageState||{objectUrls:{},promises:{}};
  function dropOldCaches(){try{OLD_KEYS.forEach(function(k){localStorage.removeItem(k)});Object.keys(localStorage).forEach(function(k){if(k.indexOf('vexaPlayZoneImageUrlsUpdatedAt')===0)localStorage.removeItem(k)})}catch(e){}}
  function readCache(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return {}}}
  function writeCache(map){try{localStorage.setItem(KEY,JSON.stringify(map||{}))}catch(e){}}
  function readSectionLocks(){try{return JSON.parse(localStorage.getItem(SECTION_LOCKS_KEY)||'null')}catch(e){return null}}
  function stripCacheParams(url){try{var u=new URL(String(url||''),location.href);u.searchParams.delete('rt');u.searchParams.delete('av');return u.pathname+u.search+u.hash}catch(e){return String(url||'').replace(/([?&])(rt|av)=\d+(&?)/g,'$1').replace(/[?&]$/,'')}}
  function baseGameUrl(id){return '/app/api/section-lock-image/'+id+'/locked.png'}
  function stable(url){return stripCacheParams(url)}
  function allowed(url){return Boolean(url)&&String(url).indexOf('/app/api/section-lock-image/shared/')<0}
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
  function refreshFromCache(){var next=mapFromSectionLocks(readCache());writeCache(next);apply(next);startCounters();return next}
  function refresh(force){
    if(force&&window.VexaSectionLocks&&window.VexaSectionLocks.reload){
      if(refreshInFlight)return refreshInFlight;
      refreshInFlight=window.VexaSectionLocks.reload(true).then(function(){return refreshFromCache()}).catch(function(){return refreshFromCache()}).finally(function(){refreshInFlight=null});
      return refreshInFlight;
    }
    return Promise.resolve(refreshFromCache());
  }
  var countProfiles={mines:{offset:-36,width:18},plinko:{offset:24,width:32},rps:{offset:-12,width:-8},wheel:{offset:58,width:24},dice:{offset:-28,width:14},crash:{offset:72,width:38},hilo:{offset:-44,width:20},coinflip:{offset:10,width:-12},slot:{offset:46,width:28}};
  var countRanges=[{start:5,end:11,min:80,max:220},{start:12,end:16,min:180,max:360},{start:17,end:23,min:500,max:700},{start:0,end:4,min:500,max:700}];
  function baseCountRange(hour){for(var i=0;i<countRanges.length;i++){var r=countRanges[i];if(hour>=r.start&&hour<=r.end)return r}return countRanges[0]}
  function gameCountRange(id){var base=baseCountRange((new Date()).getHours());var profile=countProfiles[id]||{offset:0,width:0};var low=Math.max(40,base.min+profile.offset);var high=Math.max(low+35,base.max+profile.offset+profile.width);return {min:low,max:high}}
  function nextCount(id,current){var r=gameCountRange(id);var base=parseInt(current,10);if(!isFinite(base)||base<r.min||base>r.max){base=window.VexaLiveGameCounts&&window.VexaLiveGameCounts.get?window.VexaLiveGameCounts.get(id):r.min+Math.floor(Math.random()*(r.max-r.min+1))}var span=Math.max(3,Math.min(9,Math.round((r.max-r.min)*.035)));var delta=Math.floor(Math.random()*(span*2+1))-span;if(delta===0)delta=id&&id.length%2?1:-1;var value=base+delta;if(value<r.min)value=r.min+Math.floor(Math.random()*Math.min(12,r.max-r.min+1));if(value>r.max)value=r.max-Math.floor(Math.random()*Math.min(12,r.max-r.min+1));return value}
  function flipDigit(el,text){el.classList.add('is-counting');setTimeout(function(){el.textContent=text;el.classList.remove('is-counting')},135)}
  function animateNumber(el,value){if(!el)return;var from=String(parseInt(el.textContent,10)||0).padStart(3,'0');var to=String(value).padStart(3,'0');var order=[2,1,0];order.forEach(function(index,step){if(from.charAt(index)===to.charAt(index))return;setTimeout(function(){var current=String(parseInt(el.textContent,10)||0).padStart(3,'0').split('');current[index]=to.charAt(index);flipDigit(el,String(parseInt(current.join(''),10)))},step*170)})}
  function tickCounters(){document.querySelectorAll('#playzone .game-card-shell[data-game-view] .game-players b').forEach(function(el){var shell=el.closest&&el.closest('.game-card-shell[data-game-view]');var id=shell&&shell.getAttribute('data-game-view');var next=nextCount(id,el.textContent);animateNumber(el,next);setTimeout(function(){if(window.VexaLiveGameCounts&&window.VexaLiveGameCounts.setCount)window.VexaLiveGameCounts.setCount(id,next)},560)})}
  function startCounters(){if(countersStarted)return;countersStarted=true;setInterval(tickCounters,3000)}
  dropOldCaches();refresh(false);
  document.addEventListener('click',function(e){var b=e.target&&e.target.closest&&e.target.closest('[data-view="playzone"]');if(b)setTimeout(function(){refresh(false)},80)},true);
  window.VexaRefreshPlayZoneImages=function(){return refresh(false)};
})();
`;