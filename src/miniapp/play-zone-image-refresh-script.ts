export const PLAY_ZONE_IMAGE_REFRESH_SCRIPT = `
(function(){
  var games=['mines','plinko','crash','wheel','dice','limbo','tower','coinflip','hilo'];
  var ads=games.map(function(id){return 'playzone-card-ad-'+id});
  var legacyAds=['playzone-row-ad-1','playzone-row-ad-2','playzone-row-ad-3','playzone-row-ad-right','playzone-row-ad-left'];
  var all=games.concat(ads).concat(legacyAds);
  var KEY='vexaPlayZoneImageUrls:v9';
  var SECTION_LOCKS_KEY='vexaSectionLocks:v1';
  function readCache(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return {}}}
  function writeCache(map){try{localStorage.setItem(KEY,JSON.stringify(map))}catch(e){}}
  function readSectionLocks(){try{return JSON.parse(localStorage.getItem(SECTION_LOCKS_KEY)||'null')}catch(e){return null}}
  function clean(url){var value=String(url||'');var marker=value.indexOf('?rt=');if(marker>=0)value=value.slice(0,marker);return value}
  function allowed(url){return Boolean(url)&&String(url).indexOf('/app/api/section-lock-image/shared/')<0}
  function setImage(img,url){if(!img||!allowed(url))return;var next=clean(url);if(img.getAttribute('src')!==next)img.src=next;img.classList.remove('is-empty');img.style.display='';img.loading='eager';img.decoding='async'}
  function apply(map){
    games.forEach(function(id){setImage(document.querySelector('#playzone .game-card[data-game-view="'+id+'"] .game-image img'),map[id]);setImage(document.querySelector('#playzone .game-card[data-view="'+id+'"] .game-image img'),map[id])});
    setImage(document.querySelector('#playzone .play-zone-center-image[data-play-zone-ad="playzone-card-ad-plinko"]'),map['playzone-card-ad-plinko']);
  }
  function mapFromSectionLocks(cached){
    var data=readSectionLocks();
    if(!data||!Array.isArray(data.sections))return cached;
    var next={};
    data.sections.forEach(function(section){var url=clean(section&&section.lockedImageUrl||section&&section.imageUrl||'');if(section&&all.indexOf(section.id)>=0&&allowed(url))next[section.id]=url});
    all.forEach(function(id){if(!next[id]&&allowed(cached[id]))next[id]=cached[id]});
    return next;
  }
  function refresh(){
    var cached=readCache();
    var next=mapFromSectionLocks(cached);
    if(next!==cached)writeCache(next);
    apply(next);
    return Promise.resolve(next);
  }
  apply(readCache());
  document.addEventListener('click',function(e){var b=e.target&&e.target.closest&&e.target.closest('[data-view="playzone"],[data-game-view]');if(b)setTimeout(refresh,160)},true);
  window.VexaRefreshPlayZoneImages=function(){return refresh()};
})();
`;