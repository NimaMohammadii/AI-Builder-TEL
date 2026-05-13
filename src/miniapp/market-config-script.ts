export const MARKET_CONFIG_SCRIPT = `
(function(){
  var animationClasses=['market-anim-none','market-anim-spin','market-anim-glow','market-anim-shine','market-anim-pulse','market-anim-spin-glow'];
  var mediaCacheName='vexa-market-media-v1';
  var objectUrls={};
  var keepAliveTimer=null;
  function esc(v){return String(v==null?'':v)}
  function cleanAnim(v){v=String(v||'none');return ['none','spin','glow','shine','pulse','spin-glow'].indexOf(v)>=0?v:'none'}
  function forcePlay(video){
    if(!video)return;
    try{
      video.muted=true;video.defaultMuted=true;video.autoplay=true;video.loop=true;video.playsInline=true;video.controls=false;
      video.setAttribute('muted','');video.setAttribute('autoplay','');video.setAttribute('loop','');video.setAttribute('playsinline','');video.setAttribute('webkit-playsinline','');
      video.removeAttribute('controls');
      if(video.readyState>=2&&video.paused)video.play&&video.play().catch(function(){});
      if(video.readyState>=2&&!video.paused&&video.currentTime>=Math.max(.1,video.duration-.08))video.currentTime=0;
    }catch(e){}
  }
  function forceAllMarketVideos(){document.querySelectorAll('#market video.market-uploaded-video').forEach(forcePlay)}
  function ensureVideoKeepAlive(){if(keepAliveTimer)return;keepAliveTimer=setInterval(function(){if(!document.hidden)forceAllMarketVideos()},900)}
  function prepareMarketVideo(video){
    if(!video)return;
    try{
      video.muted=true;video.defaultMuted=true;video.autoplay=true;video.loop=true;video.playsInline=true;video.controls=false;
      video.setAttribute('muted','');video.setAttribute('autoplay','');video.setAttribute('loop','');video.setAttribute('playsinline','');video.setAttribute('webkit-playsinline','');
      video.removeAttribute('controls');
      var play=function(){forcePlay(video)};
      video.onpause=play;
      video.onended=function(){try{video.currentTime=0}catch(e){} play()};
      video.addEventListener('pause',play);video.addEventListener('ended',video.onended);video.addEventListener('stalled',play);video.addEventListener('suspend',play);
      video.addEventListener('loadedmetadata',play,{once:true});video.addEventListener('canplay',play,{once:true});video.addEventListener('loadeddata',play,{once:true});
      setTimeout(play,40);setTimeout(play,160);setTimeout(play,420);setTimeout(play,900);setTimeout(play,1600);
      ensureVideoKeepAlive();
    }catch(e){}
  }
  async function cachedMediaUrl(url){
    if(!url)return url;
    if(objectUrls[url])return objectUrls[url];
    if(!('caches' in window)||!window.caches)return url;
    try{
      var cache=await caches.open(mediaCacheName);
      var cached=await cache.match(url);
      if(cached){var cachedBlob=await cached.blob();objectUrls[url]=URL.createObjectURL(cachedBlob);return objectUrls[url]}
      var response=await fetch(url,{cache:'force-cache'});
      if(response&&response.ok){await cache.put(url,response.clone());var blob=await response.blob();objectUrls[url]=URL.createObjectURL(blob);cleanupOldMarketMedia(cache,url).catch(function(){});return objectUrls[url]}
    }catch(e){}
    return url;
  }
  async function cleanupOldMarketMedia(cache,currentUrl){
    try{var currentPath=currentUrl.split('?')[0];var keys=await cache.keys();await Promise.all(keys.map(function(req){var u=req.url||'';if(u.indexOf('/app/api/market-item-media/')<0)return Promise.resolve();if(u.split('?')[0]===currentPath&&u!==currentUrl)return cache.delete(req);return Promise.resolve()}))}catch(e){}
  }
  async function renderMedia(imgWrap,item){
    if(!imgWrap||!item.imageUrl)return;
    var mediaUrl=await cachedMediaUrl(esc(item.imageUrl));
    if(item.mediaType==='video'){
      imgWrap.innerHTML='<video class="market-uploaded-video" muted autoplay loop playsinline webkit-playsinline preload="auto" disablepictureinpicture controlslist="nodownload nofullscreen noremoteplayback"></video>';
      var video=imgWrap.querySelector('video');
      if(video){prepareMarketVideo(video);video.src=mediaUrl;video.load();prepareMarketVideo(video);forcePlay(video)}
    }else imgWrap.innerHTML='<img class="market-uploaded-image" src="'+mediaUrl+'" alt="" decoding="async"/>';
  }
  function apply(items){
    if(!Array.isArray(items))return;
    items.forEach(function(item){
      if(!item||!item.id)return;
      var card=document.querySelector('#market .market-nft-card[data-market-item="'+CSS.escape(String(item.id))+'"]');
      if(!card)return;
      var title=card.querySelector('.market-nft-title-row strong');
      var badge=card.querySelector('.market-nft-title-row em');
      var price=card.querySelector('.market-price-button b');
      var imgWrap=card.querySelector('.market-nft-image');
      var anim=cleanAnim(item.animation);
      animationClasses.forEach(function(cls){card.classList.remove(cls)});
      card.classList.add('market-anim-'+anim);card.setAttribute('data-market-animation',anim);
      if(title&&item.title)title.textContent=esc(item.title);
      if(badge&&item.stock!==undefined&&item.stock!==null)badge.textContent='Stock '+esc(item.stock);
      if(price&&item.price)price.textContent=esc(item.price);
      if(imgWrap&&item.imageUrl)renderMedia(imgWrap,item).catch(function(){});
    });
  }
  function setMarketTab(tab){
    var root=document.getElementById('market');
    if(!root)return;
    root.querySelectorAll('[data-market-tab]').forEach(function(btn){btn.classList.toggle('active',btn.getAttribute('data-market-tab')===tab)});
    root.querySelectorAll('[data-market-panel]').forEach(function(panel){panel.classList.toggle('active',panel.getAttribute('data-market-panel')===tab)});
    if(tab==='store')setTimeout(forceAllMarketVideos,60);
  }
  function initMarketTabs(){
    var root=document.getElementById('market');
    if(!root||root.dataset.marketTabsReady==='1')return;
    root.dataset.marketTabsReady='1';
    root.addEventListener('click',function(event){
      var target=event.target;
      var btn=target&&target.closest?target.closest('[data-market-tab]'):null;
      if(!btn)return;
      event.preventDefault();
      event.stopPropagation();
      setMarketTab(btn.getAttribute('data-market-tab')||'store');
    },true);
  }
  async function loadMarket(){try{initMarketTabs();var r=await fetch('/app/api/market-items',{cache:'no-store'});var j=await r.json();apply(j.items||[])}catch(e){}}
  document.addEventListener('visibilitychange',function(){if(!document.hidden)forceAllMarketVideos()});
  document.addEventListener('touchstart',forceAllMarketVideos,{capture:true,passive:true});
  document.addEventListener('click',forceAllMarketVideos,{capture:true,passive:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadMarket);else loadMarket();
  window.VexaMarketRefresh=loadMarket;
})();
`;
