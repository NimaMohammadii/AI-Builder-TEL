export const PLAY_ZONE_IMAGE_REFRESH_SCRIPT = `
(function(){
  var games=['mines','plinko','crash','wheel'];
  function fallbackRefresh(){
    var stamp=String(Date.now());
    games.forEach(function(id){
      var img=document.querySelector('#playzone .game-card[data-view="'+id+'"] .game-image img');
      if(!img)return;
      img.style.display='';
      img.src='/app/api/section-lock-image/'+id+'/locked.png?tg='+stamp;
    });
  }
  async function refreshPlayZoneImages(){
    var stamp=String(Date.now());
    try{
      var r=await fetch('/app/api/section-locks?tg='+stamp,{cache:'no-store'});
      var j=await r.json();
      if(!j||!Array.isArray(j.sections)){fallbackRefresh();return}
      var byId={};
      j.sections.forEach(function(s){if(s&&s.id)byId[s.id]=s});
      games.forEach(function(id){
        var img=document.querySelector('#playzone .game-card[data-view="'+id+'"] .game-image img');
        if(!img)return;
        var item=byId[id];
        var url=item&&item.lockedImageUrl?item.lockedImageUrl:'/app/api/section-lock-image/'+id+'/locked.png';
        img.style.display='';
        img.src=url+(url.indexOf('?')>=0?'&':'?')+'tg='+stamp;
      });
    }catch(e){fallbackRefresh()}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refreshPlayZoneImages);else refreshPlayZoneImages();
  window.addEventListener('focus',refreshPlayZoneImages);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)refreshPlayZoneImages()});
})();
`;
