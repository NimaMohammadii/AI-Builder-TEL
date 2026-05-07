export const UPLOADED_IMAGE_CACHE_SCRIPT = `
(function(){
  var preloaded={};
  function preload(url){
    if(!url||preloaded[url])return;
    preloaded[url]=true;
    var img=new Image();
    img.decoding='async';
    img.src=url;
  }
  function applyCreditIcon(url){
    if(!url)return;
    preload(url);
    document.querySelectorAll('img[src^="/app/api/credit-icon"]').forEach(function(img){
      if(img.getAttribute('src')!==url)img.setAttribute('src',url);
    });
  }
  function load(){
    fetch('/app/api/uploaded-images',{cache:'no-store'}).then(function(r){return r.json()}).then(function(data){
      if(data&&data.creditIconUrl)applyCreditIcon(data.creditIconUrl);
      (data&&data.preload||[]).forEach(preload);
    }).catch(function(){});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
  setInterval(load,20000);
})();
`;
