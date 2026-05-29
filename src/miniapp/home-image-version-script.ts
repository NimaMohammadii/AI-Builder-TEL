export const HOME_IMAGE_VERSION_SCRIPT = `
(function(){
  var FINANCE_KEY='vexaHomeFinanceImageUrl:v2';
  var FINANCE_META_KEY='vexaHomeFinanceImageUpdatedAt:v2';
  var INTRO_KEY='vexaHomeIntroImageUrl:v1';
  var INTRO_META_KEY='vexaHomeIntroImageUpdatedAt:v1';
  var TTL=900000;
  var DEFAULT_FINANCE_URL='/app/api/home-finance-image-cached.png?v=default';
  var DEFAULT_INTRO_URL='/app/api/home-intro-image-cached.png?v=default';
  var financeInFlight=null;
  var introInFlight=null;

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
      '  place-items:stretch!important;',
      '  padding:6px!important;',
      '  overflow:hidden!important;',
      '  box-sizing:border-box!important;',
      '  background-image:none!important;',
      '}',
      '#home .home-intro-card h2,',
      '#home .home-intro-card p{',
      '  display:none!important;',
      '}',
      '#home .home-intro-image-frame{',
      '  width:100%!important;',
      '  height:100%!important;',
      '  min-height:144px!important;',
      '  display:block!important;',
      '  overflow:hidden!important;',
      '  border:1px solid rgba(255,255,255,.18)!important;',
      '  border-radius:24px!important;',
      '  background:none!important;',
      '  box-shadow:none!important;',
      '  box-sizing:border-box!important;',
      '}',
      '#home .home-intro-image-frame img.home-intro-image{',
      '  display:block!important;',
      '  width:100%!important;',
      '  height:100%!important;',
      '  min-height:144px!important;',
      '  object-fit:cover!important;',
      '  object-position:center!important;',
      '  border-radius:23px!important;',
      '  background:transparent!important;',
      '  border:0!important;',
      '  box-shadow:none!important;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function ensureIntroImageElement(){
    var card=document.querySelector('#home .home-intro-card');
    if(!card)return null;
    var frame=card.querySelector('.home-intro-image-frame');
    if(!frame){
      frame=document.createElement('span');
      frame.className='home-intro-image-frame';
      card.appendChild(frame);
    }
    var img=frame.querySelector('img.home-intro-image');
    if(!img){
      img=document.createElement('img');
      img.className='home-intro-image';
      img.alt='';
      img.decoding='async';
      img.loading='eager';
      frame.appendChild(img);
    }
    return img;
  }

  function applyIntro(url){
    ensureIntroImageStyle();
    var next=normalizeUrl(url||DEFAULT_INTRO_URL);
    var img=ensureIntroImageElement();
    if(img&&img.getAttribute('src')!==next)img.setAttribute('src',next);
    var card=document.querySelector('#home .home-intro-card');
    if(card)card.style.backgroundImage='none';
  }

  function applyFinance(url){
    var next=normalizeUrl(url||DEFAULT_FINANCE_URL);
    document.querySelectorAll('.home-finance-visual img').forEach(function(img){
      if(img.getAttribute('src')!==next)img.setAttribute('src',next);
      img.loading='eager';
      img.decoding='async';
    });
  }

  function read(key){
    try{return localStorage.getItem(key)||''}catch(e){return ''}
  }

  function write(key,metaKey,url){
    try{
      localStorage.setItem(key,normalizeUrl(url));
      localStorage.setItem(metaKey,String(Date.now()));
    }catch(e){}
  }

  function fresh(metaKey){
    var last=Number(localStorage.getItem(metaKey)||0);
    return Boolean(last&&Date.now()-last<TTL);
  }

  function homeActive(){
    var h=document.getElementById('home');
    return Boolean(h&&h.classList.contains('active'));
  }

  function loadIntro(force){
    var cached=read(INTRO_KEY);
    applyIntro(cached||DEFAULT_INTRO_URL);
    if(!force&&cached&&fresh(INTRO_META_KEY))return Promise.resolve(cached);
    if(!force&&!homeActive())return Promise.resolve(cached||DEFAULT_INTRO_URL);
    if(introInFlight)return introInFlight;
    introInFlight=fetch('/app/api/home-intro-image-meta',{cache:'no-store',headers:{accept:'application/json'}})
      .then(function(r){return r.json()})
      .then(function(data){
        if(data&&data.url){
          write(INTRO_KEY,INTRO_META_KEY,data.url);
          applyIntro(data.url);
          return data.url;
        }
        return cached||DEFAULT_INTRO_URL;
      })
      .catch(function(){return cached||DEFAULT_INTRO_URL})
      .finally(function(){introInFlight=null});
    return introInFlight;
  }

  function loadFinance(force){
    var cached=read(FINANCE_KEY);
    applyFinance(cached||DEFAULT_FINANCE_URL);
    if(!force&&cached&&fresh(FINANCE_META_KEY))return Promise.resolve(cached);
    if(!force&&!homeActive())return Promise.resolve(cached||DEFAULT_FINANCE_URL);
    if(financeInFlight)return financeInFlight;
    financeInFlight=fetch('/app/api/home-finance-image-meta',{cache:'no-store',headers:{accept:'application/json'}})
      .then(function(r){return r.json()})
      .then(function(data){
        if(data&&data.url){
          write(FINANCE_KEY,FINANCE_META_KEY,data.url);
          applyFinance(data.url);
          return data.url;
        }
        return cached||DEFAULT_FINANCE_URL;
      })
      .catch(function(){return cached||DEFAULT_FINANCE_URL})
      .finally(function(){financeInFlight=null});
    return financeInFlight;
  }

  function loadAll(force){
    return Promise.all([loadIntro(force),loadFinance(force)]);
  }

  window.VexaRefreshHomeIntroImage=function(){return loadIntro(true)};
  window.VexaRefreshHomeFinanceImage=function(){return loadFinance(true)};
  applyIntro(read(INTRO_KEY)||DEFAULT_INTRO_URL);
  applyFinance(read(FINANCE_KEY)||DEFAULT_FINANCE_URL);
  document.addEventListener('click',function(e){
    var b=e.target&&e.target.closest&&e.target.closest('[data-view="home"]');
    if(b)setTimeout(function(){loadAll(false)},120);
  },true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){loadAll(false)},120)});else setTimeout(function(){loadAll(false)},120);
})();
`;