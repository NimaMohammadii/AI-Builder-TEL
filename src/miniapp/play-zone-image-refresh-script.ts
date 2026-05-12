export const PLAY_ZONE_IMAGE_REFRESH_SCRIPT = `
(function(){
  var games=['mines','plinko','crash','wheel','dice','limbo','tower','coinflip','hilo'];
  var ads=['playzone-row-ad-1','playzone-row-ad-2','playzone-row-ad-3'];
  var legacyAds=['playzone-row-ad-right','playzone-row-ad-left'];
  var all=games.concat(ads).concat(legacyAds);
  var KEY='vexaPlayZoneImageUrls:v3';
  var META_KEY='vexaPlayZoneImageUrlsUpdatedAt:v3';
  function readCache(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return {}}}
  function writeCache(map){try{localStorage.setItem(KEY,JSON.stringify(map));localStorage.setItem(META_KEY,String(Date.now()))}catch(e){}}
  function fallback(id){return '/app/api/section-lock-image/'+id+'/locked.png?v='+Date.now()}
  function applyImage(img,url){if(!img)return;var next=url+(url.indexOf('?')>-1?'&':'?')+'rt='+Date.now();img.src=next;img.style.display='';img.loading='eager';img.decoding='async'}
  function apply(map){
    games.forEach(function(id){applyImage(document.querySelector('#playzone .game-card[data-view="'+id+'"] .game-image img'),map[id]||fallback(id))});
    ads.forEach(function(id){var slot=document.querySelector('#playzone .play-zone-row-ad[data-play-zone-ad="'+id+'"]');if(!slot)return;var img=slot.querySelector('img');slot.classList.remove('is-empty');applyImage(img,map[id]||fallback(id))});
  }
  async function refreshPlayZoneImages(force){
    if(!force)apply(readCache());
    try{
      var r=await fetch('/app/api/section-locks?rt='+Date.now(),{cache:'no-store'});
      var j=await r.json();
      if(!j||!Array.isArray(j.sections))return;
      var next={};
      j.sections.forEach(function(s){if(s&&s.id)next[s.id]=s.lockedImageUrl||fallback(s.id)});
      if(!next['playzone-row-ad-1']&&next['playzone-row-ad-right'])next['playzone-row-ad-1']=next['playzone-row-ad-right'];
      if(!next['playzone-row-ad-2']&&next['playzone-row-ad-left'])next['playzone-row-ad-2']=next['playzone-row-ad-left'];
      all.forEach(function(id){if(!next[id])next[id]=fallback(id)});
      writeCache(next);
      apply(next);
    }catch(e){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){refreshPlayZoneImages(true)});else refreshPlayZoneImages(true);
  window.VexaRefreshPlayZoneImages=function(){refreshPlayZoneImages(true)};
  setInterval(function(){refreshPlayZoneImages(true)},5000);
})();
`;
