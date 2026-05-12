export const HOME_IMAGE_VERSION_SCRIPT = `
(function(){
  var KEY='vexaHomeFinanceImageUrl:v2';
  var META_KEY='vexaHomeFinanceImageUpdatedAt:v2';
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
  function load(force){
    var cached=read();
    if(cached)apply(cached);
    var last=Number(localStorage.getItem(META_KEY)||0);
    if(!force&&cached&&last&&Date.now()-last<900000)return;
    fetch('/app/api/home-finance-image-meta',{cache:'no-store',headers:{accept:'application/json'}})
      .then(function(r){return r.json()})
      .then(function(data){if(data&&data.url){write(data.url);apply(data.url)}})
      .catch(function(){})
  }
  window.VexaRefreshHomeFinanceImage=function(){load(true)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){load(false)});else load(false);
})();
`;
