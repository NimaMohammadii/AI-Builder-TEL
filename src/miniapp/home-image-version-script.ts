export const HOME_IMAGE_VERSION_SCRIPT = `
(function(){
  function apply(url){
    if(!url)return;
    document.querySelectorAll('.home-finance-visual img').forEach(function(img){
      if(img.getAttribute('src')!==url)img.setAttribute('src',url);
    });
  }
  function load(){
    fetch('/app/api/home-finance-image-meta',{cache:'no-store',headers:{accept:'application/json'}})
      .then(function(r){return r.json()})
      .then(function(data){if(data&&data.url)apply(data.url)})
      .catch(function(){})
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();
`;
