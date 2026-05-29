export const HOME_IMAGE_VERSION_SCRIPT = `
(function(){
  var KEY='vexaHomeFinanceImageUrl:v2';
  var META_KEY='vexaHomeFinanceImageUpdatedAt:v2';
  var TTL=900000;
  var DEFAULT_URL='/app/api/home-finance-image-cached.png?v=default';
  var inFlight=null;

  function normalizeUrl(url){
    return String(url||'')
      .replace(/([?&])rt=\d+(&?)/,'$1')
      .replace(/[?&]$/,'');
  }

  function ensureIntroImageStyle(){
    if(document.getElementById('homeIntroImageStyle'))return;
    var style=document.createElement('style');
    style.id='homeIntroImageStyle';
    style.textContent=[
      '#home .home-intro-card{',
      '  min-height:156px!important;',
      '  display:grid!important;',
      '  place-items:center!important;',
      '  padding:0!important;',
      '  overflow:hidden!important;',
      '  background-size:contain!important;',
      '  background-position:center!important;',
      '  background-repeat:no-repeat!important;',
      '}',
      '#home .home-intro-card h2,',
      '#home .home-intro-card p{',
      '  display:none!important;',
      '}',
      '#home .home-intro-card img.home-intro-image{',
      '  display:block!important;',
      '  width:100%!important;',
      '  height:100%!important;',
      '  max-height:156px!important;',
      '  object-fit:contain!important;',
      '  object-position:center!important;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function ensureIntroImageElement(){
    var card=document.querySelector('#home .home-intro-card');
    if(!card)return null;
    var img=card.querySelector('img.home-intro-image');
    if(!img){
      img=document.createElement('img');
      img.className='home-intro-image';
      img.alt='';
      img.decoding='async';
      img.loading='eager';
      card.appendChild(img);
    }
    return img;
  }

  function apply(url){
    ensureIntroImageStyle();
    var next=normalizeUrl(url||DEFAULT_URL);
    var introImg=ensureIntroImageElement();
    if(introImg&&introImg.getAttribute('src')!==next)introImg.setAttribute('src',next);
    var introCard=document.querySelector('#home .home-intro-card');
    if(introCard)introCard.style.backgroundImage='url("'+next.replace(/"/g,'\\"')+'")';
    document.querySelectorAll('.home-finance-visual img').forEach(function(img){
      if(img.getAttribute('src')!==next)img.setAttribute('src',next);
      img.loading='eager';
      img.decoding='async';
    });
  }

  function read(){
    try{return localStorage.getItem(KEY)||''}catch(e){return ''}
  }

  function write(url){
    try{
      localStorage.setItem(KEY,normalizeUrl(url));
      localStorage.setItem(META_KEY,String(Date.now()));
    }catch(e){}
  }

  function homeActive(){
    var h=document.getElementById('home');
    return Boolean(h&&h.classList.contains('active'));
  }

  function load(force){
    var cached=read();
    apply(cached||DEFAULT_URL);
    var last=Number(localStorage.getItem(META_KEY)||0);
    if(!force&&cached&&last&&Date.now()-last<TTL)return Promise.resolve(cached);
    if(!force&&!homeActive())return Promise.resolve(cached||DEFAULT_URL);
    if(inFlight)return inFlight;
    inFlight=fetch('/app/api/home-finance-image-meta',{cache:'no-store',headers:{accept:'application/json'}})
      .then(function(r){return r.json()})
      .then(function(data){
        if(data&&data.url){
          write(data.url);
          apply(data.url);
          return data.url;
        }
        return cached||DEFAULT_URL;
      })
      .catch(function(){return cached||DEFAULT_URL})
      .finally(function(){inFlight=null});
    return inFlight;
  }

  window.VexaRefreshHomeFinanceImage=function(){return load(true)};
  apply(read()||DEFAULT_URL);
  document.addEventListener('click',function(e){
    var b=e.target&&e.target.closest&&e.target.closest('[data-view="home"]');
    if(b)setTimeout(function(){load(false)},120);
  },true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){load(false)},120)});else setTimeout(function(){load(false)},120);
})();
`;