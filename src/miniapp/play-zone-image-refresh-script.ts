export const PLAY_ZONE_IMAGE_REFRESH_SCRIPT = `
(function(){
  function refreshPlayZoneImages(){
    var stamp=String(Date.now());
    document.querySelectorAll('#playzone .game-image img').forEach(function(img){
      var src=img.getAttribute('src')||'';
      if(!src)return;
      src=src.replace(/\?.*$/,'');
      img.style.display='';
      img.src=src+'?tg='+stamp;
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refreshPlayZoneImages);else refreshPlayZoneImages();
  window.addEventListener('focus',refreshPlayZoneImages);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)refreshPlayZoneImages()});
})();
`;
