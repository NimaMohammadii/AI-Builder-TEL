export const HOME_IMAGE_VERSION_SCRIPT = `
(function(){
  var KEY='vexaHomeFinanceImageUrl:v2';
  var META_KEY='vexaHomeFinanceImageUpdatedAt:v2';
  var TTL=900000;
  var inFlight=null;
  function normalizeUrl(url){return String(url||'').replace(/([?&])rt=\d+(&?)/,'$1').replace(/[?&]$/,'')}
  function apply(url){
    if(!url)return;
    var next=normalizeUrl(url);
    document.querySelectorAll('.home-finance-visual img').forEach(function(img){
      if(img.getAttribute('src')!==next)img.setAttribute('src',next);
      img.loading='eager';
      img.decoding='async';
    });
  }
  function read(){try{return localStorage.getItem(KEY)||''}catch(e){return ''}}
  function write(url){try{localStorage.setItem(KEY,normalizeUrl(url));localStorage.setItem(META_KEY,String(Date.now()))}catch(e){}}
  function homeActive(){var h=document.getElementById('home');return Boolean(h&&h.classList.contains('active'))}
  function load(force){
    var cached=read();
    if(cached)apply(cached);
    var last=Number(localStorage.getItem(META_KEY)||0);
    if(!force&&cached&&last&&Date.now()-last<TTL)return Promise.resolve(cached);
    if(!force&&!homeActive())return Promise.resolve(cached);
    if(inFlight)return inFlight;
    inFlight=fetch('/app/api/home-finance-image-meta',{cache:'no-store',headers:{accept:'application/json'}})
      .then(function(r){return r.json()})
      .then(function(data){if(data&&data.url){write(data.url);apply(data.url);return data.url}return cached})
      .catch(function(){return cached})
      .finally(function(){inFlight=null});
    return inFlight;
  }
  window.VexaRefreshHomeFinanceImage=function(){return load(true)};
  apply(read());
  document.addEventListener('click',function(e){var b=e.target&&e.target.closest&&e.target.closest('[data-view="home"]');if(b)setTimeout(function(){load(false)},120)},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){load(false)},120)});else setTimeout(function(){load(false)},120);
})();
`;
