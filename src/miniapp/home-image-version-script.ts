export const HOME_IMAGE_VERSION_SCRIPT = `
(function(){
  var FINANCE_KEY='vexaHomeFinanceImageUrl:v2';
  var FINANCE_META_KEY='vexaHomeFinanceImageUpdatedAt:v2';
  var INTRO_KEY='vexaHomeIntroImageUrl:v1';
  var INTRO_META_KEY='vexaHomeIntroImageUpdatedAt:v1';
  var TTL=900000;
  var DEFAULT_FINANCE_URL='/app/api/home-finance-image-cached.png?v=default';
  var DEFAULT_INTRO_URL='/app/api/home-intro-image-cached.png?v=default';
  var FALLBACK_INTRO_SVG='data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 500"><defs><radialGradient id="a" cx="20%" cy="8%" r="75%"><stop stop-color="#8b1d3b"/><stop offset=".48" stop-color="#250711"/><stop offset="1" stop-color="#050507"/></radialGradient><radialGradient id="b" cx="88%" cy="28%" r="55%"><stop stop-color="#ff5b8a" stop-opacity=".38"/><stop offset=".7" stop-color="#7e1430" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient><linearGradient id="c" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#fff" stop-opacity=".17"/><stop offset="1" stop-color="#fff" stop-opacity=".035"/></linearGradient></defs><rect width="1200" height="500" rx="56" fill="url(#a)"/><rect width="1200" height="500" rx="56" fill="url(#b)"/><rect x="64" y="58" width="1072" height="384" rx="48" fill="url(#c)" stroke="#fff" stroke-opacity=".14"/><g fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M925 92l55 28 55-28-55-28-55 28z"/><path d="M980 332c42-50 42-100 0-150-42 50-42 100 0 150z"/><circle cx="170" cy="352" r="58"/><path d="M110 352h120M170 292v120"/></g><circle cx="955" cy="248" r="112" fill="#7e1430" fill-opacity=".22"/><path d="M930 164h96l-48 137-48-137z" fill="#fff" fill-opacity=".92"/><path d="M948 184h60l-30 86-30-86z" fill="#0096ff" fill-opacity=".60"/><text x="126" y="232" fill="#fff" font-family="Arial,sans-serif" font-size="70" font-weight="800">Vexa Flow</text><text x="130" y="294" fill="#fff" fill-opacity=".68" font-family="Arial,sans-serif" font-size="31" font-weight="600">Play, predict and manage TON in one place</text><rect x="130" y="330" width="220" height="54" rx="27" fill="#fff" fill-opacity=".92"/><text x="162" y="366" fill="#21050d" font-family="Arial,sans-serif" font-size="22" font-weight="800">Vexa Game</text></svg>');
  var FALLBACK_FINANCE_SVG='data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><radialGradient id="a" cx="28%" cy="18%" r="80%"><stop stop-color="#8b1d3b"/><stop offset="1" stop-color="#050507"/></radialGradient></defs><rect width="600" height="600" rx="64" fill="url(#a)"/><circle cx="300" cy="300" r="128" fill="#0096ff"/><path d="M224 210h152L300 410 224 210z" fill="#fff"/><path d="M255 235h90l-45 118-45-118z" fill="#0096ff" fill-opacity=".22"/></svg>');
  var financeInFlight=null;
  var introInFlight=null;

  function normalizeUrl(url){
    return String(url||'').replace(/([?&])rt=\d+(&?)/,'$1').replace(/[?&]$/,'');
  }

  function ensureIntroImageStyle(){
    if(document.getElementById('homeIntroImageStyle'))return;
    var style=document.createElement('style');
    style.id='homeIntroImageStyle';
    style.textContent=[
      '#home .home-intro-card{min-height:156px!important;display:grid!important;place-items:stretch!important;padding:6px!important;overflow:hidden!important;box-sizing:border-box!important;background-image:none!important}',
      '#home .home-intro-card h2,#home .home-intro-card p{display:none!important}',
      '#home .home-intro-image-frame{width:100%!important;height:100%!important;min-height:144px!important;display:block!important;overflow:hidden!important;border:1px solid rgba(255,255,255,.18)!important;border-radius:24px!important;background:rgba(255,255,255,.04)!important;box-shadow:none!important;box-sizing:border-box!important}',
      '#home .home-intro-image-frame img.home-intro-image{display:block!important;width:100%!important;height:100%!important;min-height:144px!important;object-fit:cover!important;object-position:center!important;border-radius:23px!important;background:transparent!important;border:0!important;box-shadow:none!important}'
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
    img.onerror=function(){
      if(img.getAttribute('src')!==FALLBACK_INTRO_SVG)img.setAttribute('src',FALLBACK_INTRO_SVG);
    };
    return img;
  }

  function applyIntro(url){
    ensureIntroImageStyle();
    var next=normalizeUrl(url||DEFAULT_INTRO_URL);
    var img=ensureIntroImageElement();
    if(img&&img.getAttribute('src')!==next)img.setAttribute('src',next);
    var card=document.querySelector('#home .home-intro-card');
    if(card)card.style.backgroundImage='none';
    window.setTimeout(function(){
      if(!img)return;
      if(!img.complete || img.naturalWidth===0){
        img.setAttribute('src',FALLBACK_INTRO_SVG);
      }
    },900);
  }

  function applyFinance(url){
    var next=normalizeUrl(url||DEFAULT_FINANCE_URL);
    document.querySelectorAll('.home-finance-visual img').forEach(function(img){
      img.onerror=function(){if(img.getAttribute('src')!==FALLBACK_FINANCE_SVG)img.setAttribute('src',FALLBACK_FINANCE_SVG)};
      if(img.getAttribute('src')!==next)img.setAttribute('src',next);
      img.loading='eager';
      img.decoding='async';
      window.setTimeout(function(){if(!img.complete||img.naturalWidth===0)img.setAttribute('src',FALLBACK_FINANCE_SVG)},900);
    });
  }

  function read(key){try{return localStorage.getItem(key)||''}catch(e){return ''}}
  function write(key,metaKey,url){try{localStorage.setItem(key,normalizeUrl(url));localStorage.setItem(metaKey,String(Date.now()))}catch(e){}}
  function fresh(metaKey){var last=Number(localStorage.getItem(metaKey)||0);return Boolean(last&&Date.now()-last<TTL)}
  function homeActive(){var h=document.getElementById('home');return Boolean(h&&h.classList.contains('active'))}

  function loadIntro(force){
    var cached=read(INTRO_KEY);
    applyIntro(cached||DEFAULT_INTRO_URL);
    if(!force&&cached&&fresh(INTRO_META_KEY))return Promise.resolve(cached);
    if(!force&&!homeActive())return Promise.resolve(cached||DEFAULT_INTRO_URL);
    if(introInFlight)return introInFlight;
    introInFlight=fetch('/app/api/home-intro-image-meta',{cache:'no-store',headers:{accept:'application/json'}})
      .then(function(r){return r.json()})
      .then(function(data){
        if(data&&data.url){write(INTRO_KEY,INTRO_META_KEY,data.url);applyIntro(data.url);return data.url}
        return cached||DEFAULT_INTRO_URL;
      })
      .catch(function(){applyIntro(FALLBACK_INTRO_SVG);return FALLBACK_INTRO_SVG})
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
        if(data&&data.url){write(FINANCE_KEY,FINANCE_META_KEY,data.url);applyFinance(data.url);return data.url}
        return cached||DEFAULT_FINANCE_URL;
      })
      .catch(function(){applyFinance(FALLBACK_FINANCE_SVG);return FALLBACK_FINANCE_SVG})
      .finally(function(){financeInFlight=null});
    return financeInFlight;
  }

  function loadAll(force){return Promise.all([loadIntro(force),loadFinance(force)])}
  window.VexaRefreshHomeIntroImage=function(){return loadIntro(true)};
  window.VexaRefreshHomeFinanceImage=function(){return loadFinance(true)};
  applyIntro(read(INTRO_KEY)||DEFAULT_INTRO_URL);
  applyFinance(read(FINANCE_KEY)||DEFAULT_FINANCE_URL);
  document.addEventListener('click',function(e){var b=e.target&&e.target.closest&&e.target.closest('[data-view="home"]');if(b)setTimeout(function(){loadAll(false)},120)},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){loadAll(false)},120)});else setTimeout(function(){loadAll(false)},120);
})();
`;