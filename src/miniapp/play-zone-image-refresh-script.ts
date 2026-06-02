export const PLAY_ZONE_IMAGE_REFRESH_SCRIPT = `
(function(){
  var games=['mines','plinko','crash','wheel','dice','rps','tower','coinflip','hilo'];
  var ads=games.map(function(id){return 'playzone-card-ad-'+id});
  var legacyAds=['playzone-row-ad-1','playzone-row-ad-2','playzone-row-ad-3','playzone-row-ad-right','playzone-row-ad-left'];
  var all=games.concat(ads).concat(legacyAds);
  var KEY='vexaPlayZoneImageUrls:v13';
  var OLD_KEYS=['vexaPlayZoneImageUrls:v12','vexaPlayZoneImageUrls:v11','vexaPlayZoneImageUrls:v10','vexaPlayZoneImageUrls:v9','vexaPlayZoneImageUrls:v8','vexaPlayZoneImageUrls:v7'];
  var SECTION_LOCKS_KEY='vexaSectionLocks:v1';
  var countersStarted=false;
  var refreshInFlight=null;
  var EMPTY='data:image/gif;base64,R0lGODlhAQABAAAAACw=';
  function dropOldCaches(){try{OLD_KEYS.forEach(function(k){localStorage.removeItem(k)});Object.keys(localStorage).forEach(function(k){if(k.indexOf('vexaPlayZoneImageUrlsUpdatedAt')===0)localStorage.removeItem(k)})}catch(e){}}
  function readCache(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return {}}}
  function writeCache(map){try{localStorage.setItem(KEY,JSON.stringify(map||{}))}catch(e){}}
  function readSectionLocks(){try{return JSON.parse(localStorage.getItem(SECTION_LOCKS_KEY)||'null')}catch(e){return null}}
  function stripCacheParams(url){try{var u=new URL(String(url||''),location.href);u.searchParams.delete('rt');u.searchParams.delete('av');return u.pathname+u.search+u.hash}catch(e){return String(url||'').replace(/([?&])(rt|av)=\d+(&?)/g,'$1').replace(/[?&]$/,'')}}
  function baseGameUrl(id){return '/app/api/section-lock-image/'+id+'/locked.png'}
  function stable(url){return stripCacheParams(url)}
  function allowed(url){return Boolean(url)&&String(url).indexOf('/app/api/section-lock-image/shared/')<0}
  function setImage(img,url){
    if(!img)return;
    var raw=allowed(url)?url:(img.getAttribute('data-section-image-src')||'');
    if(!raw)return;
    var next=stable(raw);
    img.onerror=function(){this.onerror=null;this.src=this.dataset.fallbackSrc||next||this.src;this.style.display=''};
    if(next&&img.getAttribute('src')!==next)img.src=next;
    img.setAttribute('data-section-image-src',next);
    img.setAttribute('data-fallback-src',next);
    img.classList.remove('is-empty');
    img.style.display='';
    img.loading='eager';
    img.decoding='async';
  }
  function findGameImg(id){return document.querySelector('#playzone .game-card-shell[data-game-view="'+id+'"] .game-image img')||document.querySelector('#playzone .game-card[data-game-view="'+id+'"] .game-image img')||document.querySelector('#playzone .game-card[data-view="'+id+'"] .game-image img')}
  function apply(map){
    games.forEach(function(id){var img=findGameImg(id);var url=map[id]||baseGameUrl(id);if(img&&(img.getAttribute('src')===EMPTY||img.getAttribute('src')!==url))setImage(img,url)});
    ads.concat(legacyAds).forEach(function(id){setImage(document.querySelector('#playzone [data-play-zone-ad="'+id+'"]'),map[id])});
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
  function nextCount(current){var base=parseInt(current,10);if(!isFinite(base))base=100+Math.floor(Math.random()*301);var delta=Math.floor(Math.random()*11)-5;if(delta===0)delta=1;var value=base+delta;if(value<100)value=100+Math.floor(Math.random()*12);if(value>400)value=400-Math.floor(Math.random()*12);return value}
  function flipDigit(el,text){el.classList.add('is-counting');setTimeout(function(){el.textContent=text;el.classList.remove('is-counting')},135)}
  function animateNumber(el,value){if(!el)return;var from=String(parseInt(el.textContent,10)||0).padStart(3,'0');var to=String(value).padStart(3,'0');var order=[2,1,0];order.forEach(function(index,step){if(from.charAt(index)===to.charAt(index))return;setTimeout(function(){var current=String(parseInt(el.textContent,10)||0).padStart(3,'0').split('');current[index]=to.charAt(index);flipDigit(el,String(parseInt(current.join(''),10)))},step*170)})}
  function tickCounters(){document.querySelectorAll('#playzone .game-card-shell[data-game-view] .game-players b').forEach(function(el){var shell=el.closest&&el.closest('.game-card-shell[data-game-view]');var id=shell&&shell.getAttribute('data-game-view');var next=nextCount(el.textContent);animateNumber(el,next);setTimeout(function(){if(window.VexaLiveGameCounts&&window.VexaLiveGameCounts.setCount)window.VexaLiveGameCounts.setCount(id,next)},560)})}
  function startCounters(){if(countersStarted)return;countersStarted=true;setInterval(tickCounters,3000)}
  dropOldCaches();refresh(false);
  document.addEventListener('click',function(e){var b=e.target&&e.target.closest&&e.target.closest('[data-view="playzone"]');if(b)setTimeout(function(){refresh(false)},80)},true);
  window.VexaRefreshPlayZoneImages=function(){return refresh(false)};
})();
`;