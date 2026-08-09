export const HOME_IMAGE_VERSION_SCRIPT = `
(function(){
  var observer=null;
  var css=[
    '#home #homeLuckyCodeSection .home-lottery-slot-card,#home .home-lucky-card .home-lottery-slot-card{width:100%!important;height:88px!important;min-height:88px!important;max-height:88px!important;margin:0 0 10px!important;border:0!important;outline:0!important;border-radius:22px!important;overflow:hidden!important;padding:0!important;position:relative!important;box-sizing:border-box!important}',
    '#home #homeLuckyCodeSection .home-lottery-slot-image,#home .home-lucky-card .home-lottery-slot-image{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;display:block!important;object-fit:cover!important;object-position:center!important;border:0!important;outline:0!important;border-radius:22px!important;background:transparent!important;box-shadow:none!important;opacity:1!important}',
    '#home #homeLuckyCodeSection .home-live-winners-list,#home .home-lucky-card .home-live-winners-list{height:auto!important;max-height:none!important;overflow:visible!important;overscroll-behavior-y:auto!important;padding:0 2px 16px!important;scroll-padding-bottom:0!important;box-sizing:border-box!important}',
    '#home #homeLuckyCodeSection .home-live-winner-card,#home .home-lucky-card .home-live-winner-card{position:relative!important;overflow:hidden!important}',
    '#home #homeLuckyCodeSection .home-live-winner-card:before,#home .home-lucky-card .home-live-winner-card:before,#home #homeLuckyCodeSection .home-live-winner-card:after,#home .home-lucky-card .home-live-winner-card:after,#home #homeLuckyCodeSection .home-live-winner-user strong:after,#home .home-lucky-card .home-live-winner-user strong:after{display:none!important;content:none!important}',
    '#home #homeLuckyCodeSection .home-live-winner-card:nth-child(-n+3)>:not(.vexa-premium-corner),#home .home-lucky-card .home-live-winner-card:nth-child(-n+3)>:not(.vexa-premium-corner){position:relative!important;z-index:3!important}',
    '#home .vexa-premium-corner{display:none!important;content:none!important}',
    '#home .vexa-premium-corner:before{content:""!important;position:absolute!important;inset:-18px!important;border-radius:32px!important;background:radial-gradient(circle at 82% 72%,rgba(92,10,35,.72),rgba(42,4,16,.40) 34%,rgba(42,4,16,.18) 54%,rgba(8,0,4,.04) 78%,rgba(8,0,4,0) 100%),linear-gradient(135deg,rgba(92,10,35,.18),rgba(255,255,255,.035) 45%,rgba(0,0,0,.14))!important;box-shadow:0 0 46px rgba(92,10,35,.34),inset 0 -22px 36px rgba(92,10,35,.18)!important}',
    '#home .vexa-premium-corner.is-blue:before{background:radial-gradient(circle at 82% 72%,rgba(8,26,112,.74),rgba(4,12,58,.42) 34%,rgba(4,12,58,.19) 54%,rgba(0,3,18,.05) 78%,rgba(0,3,18,0) 100%),linear-gradient(135deg,rgba(8,26,112,.18),rgba(255,255,255,.035) 45%,rgba(0,0,0,.14))!important;box-shadow:0 0 46px rgba(8,26,112,.38),inset 0 -22px 36px rgba(8,26,112,.20)!important}',
    '#home .vexa-premium-corner.is-bronze:before{background:radial-gradient(circle at 82% 72%,rgba(106,63,8,.74),rgba(62,34,4,.42) 34%,rgba(62,34,4,.19) 54%,rgba(18,9,0,.05) 78%,rgba(18,9,0,0) 100%),linear-gradient(135deg,rgba(106,63,8,.18),rgba(255,255,255,.035) 45%,rgba(0,0,0,.14))!important;box-shadow:0 0 46px rgba(106,63,8,.38),inset 0 -22px 36px rgba(106,63,8,.20)!important}',
    '#home .vexa-premium-star{position:absolute!important;z-index:5!important;color:rgba(255,225,235,.86)!important;font-size:10px!important;line-height:1!important;text-shadow:0 0 9px rgba(255,210,225,.35),0 5px 12px rgba(0,0,0,.62)!important;filter:drop-shadow(0 0 5px rgba(92,10,35,.36))!important;animation:none!important}',
    '#home .vexa-premium-corner.is-blue .vexa-premium-star{color:rgba(220,232,255,.88)!important;text-shadow:0 0 9px rgba(160,190,255,.38),0 5px 12px rgba(0,0,0,.62)!important;filter:drop-shadow(0 0 5px rgba(8,26,112,.42))!important}',
    '#home .vexa-premium-corner.is-bronze .vexa-premium-star{color:rgba(255,231,190,.88)!important;text-shadow:0 0 9px rgba(255,190,90,.34),0 5px 12px rgba(0,0,0,.62)!important;filter:drop-shadow(0 0 5px rgba(106,63,8,.42))!important}',
    '#home .vexa-premium-star:nth-child(1){right:14px!important;bottom:10px!important;font-size:12px!important}#home .vexa-premium-star:nth-child(2){right:50px!important;bottom:8px!important;font-size:9px!important}#home .vexa-premium-star:nth-child(3){right:30px!important;bottom:34px!important;font-size:10px!important}#home .vexa-premium-star:nth-child(4){right:92px!important;bottom:13px!important;font-size:8px!important}#home .vexa-premium-star:nth-child(5){right:66px!important;bottom:48px!important;font-size:9px!important}',
  ].join('');
  var introAppliedUrl='';
  var tonLogoAppliedUrl='';
  var homeSlotAppliedUrl='';
  var tonLogoInFlight=null;
  var introInFlight=null;
  var homeSlotInFlight=null;
  var tonLogoCheckedAt=0;
  var homeSlotCheckedAt=0;
  var META_CACHE_MS=300000;
  var TON_META_KEY='vexaTonLogoMeta:v1';
  var INTRO_META_KEY='vexaHomeIntroImageMeta:v1';
  var HOME_SLOT_META_KEY='vexaHomeLotterySlotMeta:v1';
  function cacheIntro(url){try{if(!url||!('caches'in window))return;var req=new Request(url,{cache:'force-cache'});caches.open('vexa-home-intro-images-v1').then(function(cache){cache.match(req).then(function(hit){if(hit)return;fetch(req,{cache:'force-cache'}).then(function(res){if(res&&res.ok)cache.put(req,res.clone())}).catch(function(){})}).catch(function(){})}).catch(function(){})}catch(e){}}
  function setRewardsIntroAspect(url){try{var img=new Image();img.onload=function(){if(!img.naturalWidth||!img.naturalHeight)return;var ratio=img.naturalWidth+'/'+img.naturalHeight;document.querySelectorAll('#rewards .rewards-home-intro-card,#rewards .rewards-home-intro-image-frame').forEach(function(n){n.style.setProperty('--rewards-intro-aspect',ratio);n.style.setProperty('aspect-ratio',ratio,'important');n.style.setProperty('height','auto','important');n.style.setProperty('min-height','0','important')})};img.src=url}catch(e){}}
  function applyIntroUrl(url){if(!url)return;if(introAppliedUrl!==url){introAppliedUrl=url;cacheIntro(url);setRewardsIntroAspect(url)}var bg='url("'+String(url).replace(/"/g,'')+'")';var nodes=document.querySelectorAll('#home .home-intro-card');for(var i=0;i<nodes.length;i++)nodes[i].style.setProperty('background-image',bg,'important');var frames=document.querySelectorAll('#home .home-intro-image-frame,#rewards .home-intro-image-frame,#rewards .rewards-home-intro-image-frame');for(var j=0;j<frames.length;j++){frames[j].style.setProperty('background-image',bg,'important');if(frames[j].classList&&frames[j].classList.contains('rewards-home-intro-image-frame')){frames[j].style.setProperty('background-size','100% 100%','important');frames[j].style.setProperty('background-position','center center','important')}}var rewardCards=document.querySelectorAll('#rewards .rewards-home-intro-card');for(var k=0;k<rewardCards.length;k++){rewardCards[k].style.setProperty('background-image','none','important');rewardCards[k].style.setProperty('--rewards-intro-bg',bg)}}
  function applyTonLogo(url){if(!url)return;tonLogoAppliedUrl=url;var icons=document.querySelectorAll('.ton-mini-icon img');for(var i=0;i<icons.length;i++){if(icons[i].getAttribute('src')!==url)icons[i].setAttribute('src',url)}}
  function applyHomeSlotUrl(url){
    if(!url)return false;
    homeSlotAppliedUrl=url;
    var nodes=document.querySelectorAll('#home .home-lottery-slot-image');
    var applied=false;
    for(var i=0;i<nodes.length;i++){
      var img=nodes[i];
      if(img.getAttribute('data-vexa-home-slot-url')===url){applied=true;continue}
      img.setAttribute('data-vexa-home-slot-url',url);
      img.setAttribute('data-vexa-home-slot-retry','0');
      img.onload=function(){this.setAttribute('data-vexa-home-slot-retry','0')};
      img.onerror=function(){
        if(this.getAttribute('data-vexa-home-slot-retry')==='1')return;
        this.setAttribute('data-vexa-home-slot-retry','1');
        var wanted=this.getAttribute('data-vexa-home-slot-url')||'';
        if(!wanted)return;
        this.src=wanted+(wanted.indexOf('?')>=0?'&':'?')+'retry='+Date.now();
      };
      if(img.getAttribute('src')!==url)img.setAttribute('src',url);
      applied=true;
    }
    return applied;
  }
  function readMeta(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch(e){return null}}
  function saveMeta(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch(e){}}
  function loadHomeSlotVersion(force){
    try{
      var cached=readMeta(HOME_SLOT_META_KEY);
      if(cached&&cached.url)applyHomeSlotUrl(cached.url);
      if(!force&&homeSlotCheckedAt)return Promise.resolve(cached);
      if(homeSlotInFlight)return homeSlotInFlight;
      homeSlotInFlight=fetch('/app/api/home-lottery-slot-meta',{cache:'no-store',credentials:'same-origin',headers:{'accept':'application/json'}})
        .then(function(r){return r.ok?r.json():null})
        .then(function(meta){
          homeSlotCheckedAt=Date.now();
          if(meta&&meta.hasImage&&meta.url){var next={url:meta.url,version:meta.version||'',checkedAt:homeSlotCheckedAt};saveMeta(HOME_SLOT_META_KEY,next);applyHomeSlotUrl(meta.url);return next}
          return cached;
        })
        .catch(function(){return cached})
        .finally(function(){homeSlotInFlight=null});
      return homeSlotInFlight;
    }catch(e){return Promise.resolve(null)}
  }
  function loadTonLogo(force){
    try{
      var cached=readMeta(TON_META_KEY);if(cached&&cached.url){applyTonLogo(cached.url);tonLogoCheckedAt=Math.max(tonLogoCheckedAt,Number(cached.checkedAt)||0)}
      var now=Date.now();if(!force&&tonLogoAppliedUrl&&tonLogoCheckedAt&&now-tonLogoCheckedAt<META_CACHE_MS)return Promise.resolve(cached);
      if(tonLogoInFlight)return tonLogoInFlight;
      tonLogoInFlight=fetch('/app/api/uploaded-images?context=home',{cache:'no-store',headers:{'accept':'application/json'}})
        .then(function(r){return r.ok?r.json():null})
        .then(function(meta){tonLogoCheckedAt=Date.now();if(meta&&meta.tonIconUrl){var next={url:meta.tonIconUrl,checkedAt:tonLogoCheckedAt};saveMeta(TON_META_KEY,next);applyTonLogo(meta.tonIconUrl);return next}return meta})
        .catch(function(){return cached})
        .finally(function(){tonLogoInFlight=null});
      return tonLogoInFlight;
    }catch(e){return Promise.resolve(null)}
  }
  function loadIntroImageVersion(force){
    try{
      var cached=readMeta(INTRO_META_KEY);if(cached&&cached.url)applyIntroUrl(cached.url);
      if(!force&&cached&&cached.checkedAt&&Date.now()-Number(cached.checkedAt)<META_CACHE_MS)return Promise.resolve(cached);
      if(introInFlight)return introInFlight;
      introInFlight=fetch('/app/api/home-intro-image-meta',{headers:{'accept':'application/json'}})
        .then(function(r){return r.ok?r.json():null})
        .then(function(meta){if(meta&&meta.url){meta.checkedAt=Date.now();saveMeta(INTRO_META_KEY,meta);applyIntroUrl(meta.url)}return meta})
        .catch(function(){return cached})
        .finally(function(){introInFlight=null});
      return introInFlight;
    }catch(e){return Promise.resolve(null)}
  }
  function style(){var s=document.getElementById('home-lottery-slot-size-fix');if(!s){s=document.createElement('style');s.id='home-lottery-slot-size-fix';document.head.appendChild(s)}if(s.textContent!==css)s.textContent=css}
  function premium(card,tone){if(!card)return false;var b=card.querySelector('.vexa-premium-corner');if(b)b.remove();card.classList.remove('is-blue','is-bronze');return true}
  function apply(){style();loadHomeSlotVersion(false);loadTonLogo(false);loadIntroImageVersion(false);var roots=Array.prototype.slice.call(document.querySelectorAll('#home #homeLuckyCodeSection,#home .home-lucky-card'));if(!roots.length)return false;var done=false;roots.forEach(function(r){done=premium(r.querySelector('.home-live-winner-card:nth-child(1)'),'red')||done;done=premium(r.querySelector('.home-live-winner-card:nth-child(2)'),'blue')||done;done=premium(r.querySelector('.home-live-winner-card:nth-child(3)'),'bronze')||done});return done}
  function watch(){if(apply())return;if(observer||!window.MutationObserver)return;var home=document.querySelector('main.app')||document.body;observer=new MutationObserver(function(){if(apply()&&observer){observer.disconnect();observer=null}});observer.observe(home,{childList:true,subtree:true})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch,{once:true});else watch();
  window.VexaRefreshHomeLotteryChrome=apply;window.VexaRefreshHomeIntroImage=function(){return loadIntroImageVersion(true)};window.VexaRefreshTonLogo=function(){return loadTonLogo(true)};window.VexaRefreshHomeLotterySlotImage=function(){homeSlotCheckedAt=0;return loadHomeSlotVersion(true)};
})();
`;
