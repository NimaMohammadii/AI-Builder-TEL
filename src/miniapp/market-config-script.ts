export const MARKET_CONFIG_SCRIPT = `
(function(){
  var animationClasses=['market-anim-none','market-anim-spin','market-anim-glow','market-anim-shine','market-anim-pulse','market-anim-spin-glow'];
  var mediaCacheName='vexa-market-images-v1';
  var objectUrls={};
  var marketItemsById={};
  var activeDetailItem=null;
  function esc(v){return String(v==null?'':v)}
  function cleanAnim(v){v=String(v||'none');return ['none','spin','glow','shine','pulse','spin-glow'].indexOf(v)>=0?v:'none'}
  async function cachedImageUrl(url){
    if(!url)return url;
    if(objectUrls[url])return objectUrls[url];
    if(!('caches' in window)||!window.caches)return url;
    try{
      var cache=await caches.open(mediaCacheName);
      var cached=await cache.match(url);
      if(cached){var cachedBlob=await cached.blob();objectUrls[url]=URL.createObjectURL(cachedBlob);return objectUrls[url]}
      var response=await fetch(url,{cache:'force-cache'});
      if(response&&response.ok){await cache.put(url,response.clone());var blob=await response.blob();objectUrls[url]=URL.createObjectURL(blob);cleanupOldMarketImages(cache,url).catch(function(){});return objectUrls[url]}
    }catch(e){}
    return url;
  }
  async function cleanupOldMarketImages(cache,currentUrl){
    try{var currentPath=currentUrl.split('?')[0];var keys=await cache.keys();await Promise.all(keys.map(function(req){var u=req.url||'';if(u.indexOf('/app/api/market-item-media/')<0)return Promise.resolve();if(u.split('?')[0]===currentPath&&u!==currentUrl)return cache.delete(req);return Promise.resolve()}))}catch(e){}
  }
  async function renderMedia(imgWrap,item){
    if(!imgWrap)return;
    if(!item||!item.imageUrl){imgWrap.innerHTML='<span class="market-nft-art"><b></b></span>';return}
    var mediaUrl=await cachedImageUrl(esc(item.imageUrl));
    imgWrap.innerHTML='<img class="market-uploaded-image" src="'+mediaUrl+'" alt="" decoding="async" loading="lazy"/>';
  }
  function spec(label,value){return '<div class="market-detail-spec"><span>'+esc(label)+'</span><b>'+esc(value||'-')+'</b></div>'}
  async function openDetail(item){
    var sheet=document.getElementById('marketDetailSheet');if(!sheet||!item)return;activeDetailItem=item;
    var title=sheet.querySelector('[data-market-detail-title]');var desc=sheet.querySelector('[data-market-detail-description]');var collection=sheet.querySelector('[data-market-detail-collection]');var price=sheet.querySelector('[data-market-detail-price]');var specs=sheet.querySelector('[data-market-detail-specs]');var media=sheet.querySelector('[data-market-detail-media]');var buy=sheet.querySelector('[data-market-buy]');var status=sheet.querySelector('[data-market-detail-status]');
    if(title)title.textContent=esc(item.title||'NFT');if(desc)desc.textContent=esc(item.description||'Vexa internal collectible.');if(collection)collection.textContent=esc(item.collection||'Vexa Collectible');if(price)price.textContent=esc(item.price||'0');if(buy)buy.setAttribute('data-market-buy',esc(item.id));if(status)status.textContent='';
    if(specs)specs.innerHTML=spec('Rarity',item.rarity)+spec('Total Supply',item.supply)+spec('Benefit',item.utility);
    if(media){media.innerHTML='';await renderMedia(media,item)}
    sheet.classList.add('open');sheet.setAttribute('aria-hidden','false');document.body.classList.add('market-detail-open');
  }
  function closeDetail(){var sheet=document.getElementById('marketDetailSheet');if(!sheet)return;sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true');document.body.classList.remove('market-detail-open');activeDetailItem=null}
  function handleBuy(){var status=document.querySelector('[data-market-detail-status]');if(status)status.textContent='Buy will be connected in the next step.'}
  function apply(items){
    if(!Array.isArray(items))return;marketItemsById={};
    items.forEach(function(item){
      if(!item||!item.id)return;marketItemsById[String(item.id)]=item;
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
  }
  function initMarketTabs(){
    var root=document.getElementById('market');
    if(!root||root.dataset.marketTabsReady==='1')return;
    root.dataset.marketTabsReady='1';
    root.addEventListener('click',function(event){
      var target=event.target;
      var close=target&&target.closest?target.closest('[data-market-detail-close]'):null;if(close){event.preventDefault();event.stopPropagation();closeDetail();return}
      var buy=target&&target.closest?target.closest('[data-market-buy]'):null;if(buy){event.preventDefault();event.stopPropagation();handleBuy();return}
      var card=target&&target.closest?target.closest('.market-nft-card[data-market-item]'):null;if(card){event.preventDefault();event.stopPropagation();openDetail(marketItemsById[card.getAttribute('data-market-item')]);return}
      var btn=target&&target.closest?target.closest('[data-market-tab]'):null;
      if(!btn)return;
      event.preventDefault();
      event.stopPropagation();
      setMarketTab(btn.getAttribute('data-market-tab')||'store');
    },true);
  }
  async function loadMarket(){try{initMarketTabs();var r=await fetch('/app/api/market-items',{cache:'no-store'});var j=await r.json();apply(j.items||[])}catch(e){}}
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeDetail()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadMarket);else loadMarket();window.VexaMarketRefresh=loadMarket;
})();
`;
