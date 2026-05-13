export const PLAY_ZONE_IMAGE_REFRESH_SCRIPT = `
(function(){
  var games=['mines','plinko','crash','wheel','dice','limbo','tower','coinflip','hilo'];
  var ads=games.map(function(id){return 'playzone-card-ad-'+id});
  var legacyAds=['playzone-row-ad-1','playzone-row-ad-2','playzone-row-ad-3','playzone-row-ad-right','playzone-row-ad-left'];
  var all=games.concat(ads).concat(legacyAds);
  var KEY='vexaPlayZoneImageUrls:v6';
  var META_KEY='vexaPlayZoneImageUrlsUpdatedAt:v6';
  var OLD_KEYS=['vexaPlayZoneImageUrls:v5','vexaPlayZoneImageUrlsUpdatedAt:v5','vexaPlayZoneImageUrls:v4','vexaPlayZoneImageUrlsUpdatedAt:v4'];
  function clearOldCache(){try{OLD_KEYS.forEach(function(k){localStorage.removeItem(k)})}catch(e){}}
  function readCache(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return {}}}
  function writeCache(map){try{localStorage.setItem(KEY,JSON.stringify(map));localStorage.setItem(META_KEY,String(Date.now()))}catch(e){}}
  function normalizeUrl(url){return String(url||'').replace(/([?&])rt=\d+(&?)/,'$1').replace(/[?&]$/,'')}
  function isSharedLockImage(url){return String(url||'').indexOf('/app/api/section-lock-image/shared/')>=0}
  function isSafePlayZoneImage(url){return Boolean(url)&&!isSharedLockImage(url)}
  function applyImage(img,url){
    if(!img||!isSafePlayZoneImage(url))return;
    var next=normalizeUrl(url);
    if(img.getAttribute('src')!==next)img.src=next;
    img.style.display='';
    img.loading='eager';
    img.decoding='async';
  }
  function apply(map){
    games.forEach(function(id){applyImage(document.querySelector('#playzone .game-card[data-view="'+id+'"] .game-image img'),map[id])});
    ads.forEach(function(id){var slot=document.querySelector('#playzone .play-zone-card-ad[data-play-zone-ad="'+id+'"]');if(!slot)return;var img=slot.querySelector('img');if(map[id]){slot.classList.remove('is-empty');applyImage(img,map[id])}});
  }
  async function refreshPlayZoneImages(force){
    clearOldCache();
    var cached=readCache();
    apply(cached);
    var last=Number(localStorage.getItem(META_KEY)||0);
    if(!force&&last&&Date.now()-last<300000)return;
    try{
      var r=await fetch('/app/api/section-locks',{cache:'no-store'});
      var j=await r.json();
      if(!j||!Array.isArray(j.sections))return;
      var next={};
      j.sections.forEach(function(s){
        if(!s||!s.id)return;
        var url=normalizeUrl(s.lockedImageUrl||s.imageUrl||'');
        if(all.indexOf(s.id)>=0&&isSafePlayZoneImage(url))next[s.id]=url;
      });
      all.forEach(function(id){if(!next[id]&&isSafePlayZoneImage(cached[id]))next[id]=cached[id]});
      writeCache(next);
      apply(next);
    }catch(e){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){refreshPlayZoneImages(true)});else refreshPlayZoneImages(true);
  window.VexaRefreshPlayZoneImages=function(){refreshPlayZoneImages(true)};
})();
`;
