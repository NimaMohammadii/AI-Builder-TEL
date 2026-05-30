export const HOME_IMAGE_VERSION_SCRIPT = `
(function(){
  var CACHE_NAME='vexa-home-images-v1';
  var URL_PATH='/app/api/home-intro-image.png';
  var EMPTY='data:image/gif;base64,R0lGODlhAQABAAAAACw=';
  function installCss(){
    if(document.getElementById('vexaHomeIntroNoCssReload'))return;
    var style=document.createElement('style');
    style.id='vexaHomeIntroNoCssReload';
    style.textContent='#home .home-intro-card{background-image:none!important;background-color:transparent!important}#home .home-intro-card h2,#home .home-intro-card p{display:none!important}#home .home-intro-image-frame{display:block!important;width:100%!important;height:100%!important;min-height:144px!important;overflow:hidden!important;border:0!important;border-radius:24px!important;background:transparent!important;box-shadow:none!important}#home img.home-intro-image{display:block!important;width:100%!important;height:100%!important;min-height:144px!important;object-fit:cover!important;object-position:center!important;border:0!important;border-radius:23px!important;background:transparent!important;box-shadow:none!important}';
    document.head.appendChild(style);
  }
  function card(){return document.querySelector('#home .home-intro-card')}
  function ensureImg(){
    var c=card();
    if(!c)return null;
    var img=c.querySelector('img.home-intro-image');
    if(!img){
      c.innerHTML='<span class="home-intro-image-frame"><img class="home-intro-image" src="'+EMPTY+'" alt="" decoding="async" loading="eager"/></span>';
      img=c.querySelector('img.home-intro-image');
    }
    return img;
  }
  function load(){
    installCss();
    var img=ensureImg();
    if(!img)return;
    img.onerror=function(){this.onerror=null;this.src=URL_PATH};
    if(!('caches' in window)||!window.fetch){if(img.getAttribute('src')!==URL_PATH)img.src=URL_PATH;return;}
    caches.open(CACHE_NAME).then(function(cache){
      return cache.match(URL_PATH).then(function(hit){
        if(hit)return hit.blob();
        return fetch(URL_PATH,{credentials:'same-origin',cache:'force-cache'}).then(function(res){
          if(!res||!res.ok)throw new Error('home image failed');
          cache.put(URL_PATH,res.clone()).catch(function(){});
          return res.blob();
        });
      });
    }).then(function(blob){
      if(!blob)return;
      var objectUrl=URL.createObjectURL(blob);
      img.onload=function(){setTimeout(function(){try{URL.revokeObjectURL(objectUrl)}catch(e){}},30000)};
      img.src=objectUrl;
    }).catch(function(){if(img.getAttribute('src')!==URL_PATH)img.src=URL_PATH});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
  setTimeout(load,120);
  setTimeout(load,500);
})();
`;