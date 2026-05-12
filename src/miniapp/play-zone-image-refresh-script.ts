export const PLAY_ZONE_IMAGE_REFRESH_SCRIPT = `
(function(){
  var games=['mines','plinko','crash','wheel','dice','limbo','tower','coinflip','hilo'];
  var ads=games.map(function(id){return 'playzone-card-ad-'+id});
  var legacyAds=['playzone-row-ad-1','playzone-row-ad-2','playzone-row-ad-3','playzone-row-ad-right','playzone-row-ad-left'];
  var all=games.concat(ads).concat(legacyAds);
  var KEY='vexaPlayZoneImageUrls:v5';
  var META_KEY='vexaPlayZoneImageUrlsUpdatedAt:v5';
  function readCache(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return {}}}
  function writeCache(map){try{localStorage.setItem(KEY,JSON.stringify(map));localStorage.setItem(META_KEY,String(Date.now()))}catch(e){}}
  function fallback(id){return '/app/api/section-lock-image/'+id+'/locked.png?v=1'}
  function normalizeUrl(url){return String(url||'').replace(/([?&])rt=\d+(&?)/,'$1').replace(/[?&]$/,'')}
  function applyImage(img,url){
    if(!img||!url)return;
    var next=normalizeUrl(url);
    if(img.getAttribute('src')!==next)img.src=next;
    img.style.display='';
    img.loading='eager';
    img.decoding='async';
  }
  function apply(map){
    games.forEach(function(id){applyImage(document.querySelector('#playzone .game-card[data-view="'+id+'"] .game-image img'),map[id]||fallback(id))});
    ads.forEach(function(id){var slot=document.querySelector('#playzone .play-zone-card-ad[data-play-zone-ad="'+id+'"]');if(!slot)return;var img=slot.querySelector('img');slot.classList.remove('is-empty');applyImage(img,map[id]||fallback(id))});
  }
  async function refreshPlayZoneImages(force){
    var cached=readCache();
    apply(cached);
    var last=Number(localStorage.getItem(META_KEY)||0);
    if(!force&&last&&Date.now()-last<900000)return;
    try{
      var r=await fetch('/app/api/section-locks',{cache:'no-store'});
      var j=await r.json();
      if(!j||!Array.isArray(j.sections))return;
      var next={};
      j.sections.forEach(function(s){if(s&&s.id&&s.lockedImageUrl)next[s.id]=normalizeUrl(s.lockedImageUrl)});
      all.forEach(function(id){if(!next[id])next[id]=cached[id]||fallback(id)});
      writeCache(next);
      apply(next);
    }catch(e){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){refreshPlayZoneImages(false)});else refreshPlayZoneImages(false);
  window.VexaRefreshPlayZoneImages=function(){refreshPlayZoneImages(true)};
})();
`;
