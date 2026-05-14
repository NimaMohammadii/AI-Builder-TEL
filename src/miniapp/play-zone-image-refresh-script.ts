export const PLAY_ZONE_IMAGE_REFRESH_SCRIPT = `
(function(){
  var games=['mines','plinko','crash','wheel','dice','limbo','tower','coinflip','hilo'];
  var ads=games.map(function(id){return 'playzone-card-ad-'+id});
  var legacyAds=['playzone-row-ad-1','playzone-row-ad-2','playzone-row-ad-3','playzone-row-ad-right','playzone-row-ad-left'];
  var all=games.concat(ads).concat(legacyAds);
  var KEY='vexaPlayZoneImageUrls:v9';
  var META_KEY='vexaPlayZoneImageUrlsUpdatedAt:v9';
  function readCache(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return {}}}
  function writeCache(map){try{localStorage.setItem(KEY,JSON.stringify(map));localStorage.setItem(META_KEY,String(Date.now()))}catch(e){}}
  function clean(url){var value=String(url||'');var marker=value.indexOf('?rt=');if(marker>=0)value=value.slice(0,marker);return value}
  function allowed(url){return Boolean(url)&&String(url).indexOf('/app/api/section-lock-image/shared/')<0}
  function setImage(img,url){if(!img||!allowed(url))return;var next=clean(url);if(img.getAttribute('src')!==next)img.src=next;img.classList.remove('is-empty');img.style.display='';img.loading='eager';img.decoding='async'}
  function apply(map){
    games.forEach(function(id){setImage(document.querySelector('#playzone .game-card[data-game-view="'+id+'"] .game-image img'),map[id]);setImage(document.querySelector('#playzone .game-card[data-view="'+id+'"] .game-image img'),map[id])});
    setImage(document.querySelector('#playzone .play-zone-center-image[data-play-zone-ad="playzone-card-ad-plinko"]'),map['playzone-card-ad-plinko']);
  }
  async function refresh(force){
    var cached=readCache();apply(cached);
    var last=Number(localStorage.getItem(META_KEY)||0);if(!force&&last&&Date.now()-last<300000)return;
    try{var response=await fetch('/app/api/section-locks',{cache:'no-store'});var data=await response.json();if(!data||!Array.isArray(data.sections))return;var next={};data.sections.forEach(function(section){var url=clean(section&&section.lockedImageUrl||section&&section.imageUrl||'');if(section&&all.indexOf(section.id)>=0&&allowed(url))next[section.id]=url});all.forEach(function(id){if(!next[id]&&allowed(cached[id]))next[id]=cached[id]});writeCache(next);apply(next)}catch(e){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){refresh(true)});else refresh(true);
  window.VexaRefreshPlayZoneImages=function(){refresh(true)};
})();
`;