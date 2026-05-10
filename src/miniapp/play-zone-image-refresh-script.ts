export const PLAY_ZONE_IMAGE_REFRESH_SCRIPT = `
(function(){
  var games=['mines','plinko','crash','wheel','dice','limbo','tower','coinflip','hilo'];
  var KEY='vexaPlayZoneImageUrls:v2';
  var META_KEY='vexaPlayZoneImageUrlsUpdatedAt:v2';
  function readCache(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return {}}}
  function writeCache(map){try{localStorage.setItem(KEY,JSON.stringify(map));localStorage.setItem(META_KEY,String(Date.now()))}catch(e){}}
  function apply(map){
    games.forEach(function(id){
      var img=document.querySelector('#playzone .game-card[data-view="'+id+'"] .game-image img');
      if(!img)return;
      var url=map[id]||('/app/api/section-lock-image/'+id+'/locked.png?v=1');
      if(img.getAttribute('src')!==url)img.src=url;
      img.style.display='';
      img.loading='eager';
      img.decoding='async';
    });
  }
  async function refreshPlayZoneImages(force){
    var cached=readCache();
    apply(cached);
    var last=Number(localStorage.getItem(META_KEY)||0);
    if(!force&&last&&Date.now()-last<86400000)return;
    try{
      var r=await fetch('/app/api/section-locks',{cache:'force-cache'});
      var j=await r.json();
      if(!j||!Array.isArray(j.sections))return;
      var next={};
      j.sections.forEach(function(s){if(s&&s.id)next[s.id]=s.lockedImageUrl||('/app/api/section-lock-image/'+s.id+'/locked.png?v=1')});
      games.forEach(function(id){if(!next[id])next[id]=cached[id]||('/app/api/section-lock-image/'+id+'/locked.png?v=1')});
      writeCache(next);
      apply(next);
    }catch(e){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){refreshPlayZoneImages(false)});else refreshPlayZoneImages(false);
  window.VexaRefreshPlayZoneImages=function(){refreshPlayZoneImages(true)};
})();
`;
