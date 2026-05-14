export const MARKET_CONFIG_SCRIPT = `
(function(){
  var marketItemsById={};
  var activeDetailItem=null;
  var ownedRequestInFlight=null;
  var telegramGiftsRequestInFlight=null;
  var ownedLoadedAt=0;
  var telegramGiftsLoadedAt=0;
  var lastOwned=[];
  var lastTelegramGifts=[];
  var telegramGiftsError='';
  var buying=false;
  var currentSort='price_asc';
  var OWNED_REFRESH_TTL=20000;
  var TELEGRAM_GIFTS_REFRESH_TTL=180000;
  var TON_ICON='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"%3E%3Cpath fill="white" d="M11.5 15.5h41c3.9 0 6.2 4.3 4 7.6L36.4 51.7c-2.1 3-6.7 3-8.8 0L7.5 23.1c-2.2-3.3.1-7.6 4-7.6Zm2.6 7 14.6 21.1V22.5H14.1Zm21.2 0v21.1l14.6-21.1H35.3Zm-3.3 24 16.1-24H15.9L32 46.5Z"/%3E%3C/svg%3E';
  function esc(v){return String(v==null?'':v)}
  function user(){var tg=window.Telegram&&window.Telegram.WebApp;var u=tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user;var tgId=String((u&&u.id)||'').trim();var stored=String(localStorage.getItem('ownerId')||'').trim();var id=tgId||stored;return {id:String(id||'').trim(),username:u&&u.username?String(u.username):null,firstName:u&&u.first_name?String(u.first_name):null}}
  function telegramMeta(item){var raw=esc(item&&item.description||'')+' '+esc(item&&item.utility||'')+' '+esc(item&&item.supply||'');var num=(raw.match(/#\s*\d+/)||[])[0]||'';var price=(raw.match(/\d+(?:\.\d+)?(?=\s*TON)/i)||[])[0]||'';return {number:num.replace(/\s+/g,''),price:price.trim()}}
  function itemPrice(item){var n=parseFloat(telegramMeta(item).price);return Number.isFinite(n)?n:999999999}
  function sortedGifts(){var gifts=(Array.isArray(lastTelegramGifts)?lastTelegramGifts:[]).slice();gifts.sort(function(a,b){var pa=itemPrice(a);var pb=itemPrice(b);return currentSort==='price_desc'?pb-pa:pa-pb});return gifts}
  async function renderMedia(imgWrap,item){
    if(!imgWrap)return;
    if(!item||!item.imageUrl){imgWrap.innerHTML='<span class="market-nft-art"><b></b></span>';return}
    var mediaUrl=esc(item.imageUrl);
    imgWrap.innerHTML='<img class="market-uploaded-image" src="'+mediaUrl+'" alt="" decoding="async" loading="lazy"/>';
  }
  function spec(label,value){return '<div class="market-detail-spec"><span>'+esc(label)+'</span><b>'+esc(value||'-')+'</b></div>'}
  function telegramSpecsLoading(){return spec('Model','Loading...')+spec('Backdrop','Loading...')+spec('Symbol','Loading...')}
  function priceButton(value){return '<span class="market-price-button"><img src="'+TON_ICON+'" alt="TON" decoding="async"/><b>'+esc(value||'0')+'</b></span>'}
  function giftCard(item,owned){
    var src=esc(item&&item.imageUrl||'');
    var metaObj=telegramMeta(item);
    var img=src?'<img class="market-uploaded-image" src="'+src+'" alt="" decoding="async" loading="lazy"/>':'<span class="market-nft-art"><b></b></span>';
    var source=item&&item.source==='telegram'?'telegram':'vexa';
    var badge=source==='telegram'?'TON NFT':(owned?'Owned':'NFT');
    var meta=source==='telegram'?metaObj.number:esc(item.rarity||'Collectible');
    var cls=owned?' market-owned-card':'';
    var footer=source==='telegram'?priceButton(metaObj.price):'<span class="market-owned-meta">'+meta+'</span>';
    return '<button class="market-nft-card game-card market-owned-card-'+source+cls+'" type="button" data-market-owned="'+esc(item.purchaseId||item.id||'')+'" data-market-source="'+source+'" data-market-item="'+esc(item.id||'')+'"><span class="market-nft-image game-image">'+img+'</span><span class="market-nft-info game-info"><span class="market-nft-title-row"><strong>'+esc(item.title||'Gift NFT')+'</strong><em>'+badge+'</em></span><span class="market-owned-meta">'+esc(meta)+'</span>'+footer+'</span></button>';
  }
  function renderTelegramMarket(){
    var root=document.getElementById('market');if(!root)return;
    var panel=root.querySelector('[data-market-panel="store"]');
    var grid=root.querySelector('[data-market-telegram-grid]');var empty=root.querySelector('[data-market-telegram-empty]');
    if(panel&&grid&&grid.parentNode&&grid.parentNode.firstElementChild!==grid&&grid.parentNode.firstElementChild&&grid.parentNode.firstElementChild.hasAttribute('data-market-pull')){}
    var gifts=sortedGifts();
    gifts.forEach(function(item){if(item&&item.id)marketItemsById[String(item.id)]=item});
    if(grid)grid.innerHTML=gifts.map(function(item){return giftCard(item,false)}).join('');
    if(grid)grid.style.display=gifts.length?'grid':'none';
    if(empty){var msg=empty.querySelector('p');if(msg)msg.textContent=telegramGiftsError||'TON Gift NFTs will appear here.';empty.style.display=gifts.length?'none':'flex'}
    updateSortUi();
  }
  function renderOwned(){
    var root=document.getElementById('market');if(!root)return;
    var grid=root.querySelector('[data-market-owned-grid]');var empty=root.querySelector('[data-market-owned-empty]');
    var combined=Array.isArray(lastOwned)?lastOwned:[];
    combined.forEach(function(item){if(item&&item.id)marketItemsById[String(item.id)]=item});
    if(grid)grid.innerHTML=combined.map(function(item){return giftCard(item,true)}).join('');
    if(grid)grid.style.display=combined.length?'grid':'none';
    if(empty)empty.style.display=combined.length?'none':'flex';
  }
  async function openDetail(item){
    var sheet=document.getElementById('marketDetailSheet');if(!sheet||!item)return;activeDetailItem=item;
    var isTelegram=item.source==='telegram';var tmeta=telegramMeta(item);
    sheet.classList.remove('is-success');
    var title=sheet.querySelector('[data-market-detail-title]');var desc=sheet.querySelector('[data-market-detail-description]');var collection=sheet.querySelector('[data-market-detail-collection]');var price=sheet.querySelector('[data-market-detail-price]');var specs=sheet.querySelector('[data-market-detail-specs]');var media=sheet.querySelector('[data-market-detail-media]');var buy=sheet.querySelector('[data-market-buy]');var status=sheet.querySelector('[data-market-detail-status]');
    if(title)title.textContent=esc(item.title||'Gift NFT');
    if(desc)desc.textContent=isTelegram?tmeta.number:esc(item.description||'Telegram Gift NFT on TON.');
    if(collection)collection.textContent=isTelegram?'Telegram Gift':esc(item.collection||'TON Gift NFTs');
    if(price)price.textContent=isTelegram?(tmeta.price||'0'):esc(item.price||'0');
    if(isTelegram){var priceBox=sheet.querySelector('.market-detail-price');var priceImg=priceBox&&priceBox.querySelector('img');if(priceImg){priceImg.src=TON_ICON;priceImg.alt='TON'}}
    if(buy){buy.remove()}
    if(status){status.remove()}
    if(specs)specs.innerHTML=isTelegram?telegramSpecsLoading():spec('Rarity',item.rarity)+spec('Total Supply',item.supply)+spec('Benefit',item.utility);
    if(media){media.innerHTML='';await renderMedia(media,item)}
    sheet.classList.add('open');sheet.setAttribute('aria-hidden','false');document.body.classList.add('market-detail-open');
  }
  function showSuccess(){var sheet=document.getElementById('marketDetailSheet');if(!sheet)return;sheet.classList.add('is-success');setTimeout(function(){closeDetail();setMarketTab('owned')},1450)}
  function closeDetail(){var sheet=document.getElementById('marketDetailSheet');if(!sheet)return;sheet.classList.remove('open','is-success');sheet.setAttribute('aria-hidden','true');document.body.classList.remove('market-detail-open');activeDetailItem=null}
  async function handleBuy(){if(buying||!activeDetailItem||activeDetailItem.source==='telegram')return;var u=user();if(!u.id)return;buying=true;try{var r=await fetch('/app/api/market-buy',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({userId:u.id,itemId:activeDetailItem.id})});var j=await r.json().catch(function(){return null});if(!r.ok||!j||j.error)throw new Error((j&&j.error)||'Purchase failed');if(Array.isArray(j.owned)){ownedLoadedAt=Date.now();lastOwned=j.owned;renderOwned()}if(Number.isFinite(Number(j.tonBalanceNano))&&window.VexaTonBalance&&window.VexaTonBalance.write){window.VexaTonBalance.write(Number(j.tonBalanceNano),0,false)}showSuccess()}catch(e){}finally{buying=false}}
  function setMarketTab(tab){var root=document.getElementById('market');if(!root)return;root.querySelectorAll('[data-market-tab]').forEach(function(btn){btn.classList.toggle('active',btn.getAttribute('data-market-tab')===tab)});root.querySelectorAll('[data-market-panel]').forEach(function(panel){panel.classList.toggle('active',panel.getAttribute('data-market-panel')===tab)});var filter=root.querySelector('.market-filter-bar');if(filter)filter.style.display=tab==='store'?'flex':'none';if(tab==='store')loadTelegramGifts(false);if(tab==='owned')loadOwned(false)}
  function updateSortUi(){var root=document.getElementById('market');if(!root)return;var label=root.querySelector('[data-market-sort-label]');if(label)label.textContent=currentSort==='price_desc'?'Price high to low':'Price low to high';root.querySelectorAll('[data-market-sort]').forEach(function(btn){btn.classList.toggle('active',btn.getAttribute('data-market-sort')===currentSort)})}
  function setSort(sort){currentSort=sort==='price_desc'?'price_desc':'price_asc';try{localStorage.setItem('vexa-market-sort',currentSort)}catch(e){}var root=document.getElementById('market');var menu=root&&root.querySelector('[data-market-sort-menu]');if(menu)menu.classList.remove('open');renderTelegramMarket()}
  function initPullRefresh(){var root=document.getElementById('market');if(!root||root.dataset.marketPullReady==='1')return;root.dataset.marketPullReady='1';var scroller=root.querySelector('[data-market-scroll="store"]');var pull=root.querySelector('[data-market-pull]');var pullText=root.querySelector('[data-market-pull-text]');if(!scroller||!pull)return;var startY=0;var pulling=false;var armed=false;scroller.addEventListener('touchstart',function(e){if(scroller.scrollTop<=0&&!telegramGiftsRequestInFlight){startY=e.touches[0].clientY;pulling=true;armed=false}}, {passive:true});scroller.addEventListener('touchmove',function(e){if(!pulling)return;var dy=e.touches[0].clientY-startY;if(dy>44&&scroller.scrollTop<=0){armed=true;pull.classList.add('ready');if(pullText)pullText.textContent='Release to refresh'}}, {passive:true});scroller.addEventListener('touchend',function(){if(!pulling)return;pulling=false;if(armed){pull.classList.remove('ready');pull.classList.add('loading');if(pullText)pullText.textContent='Refreshing';loadTelegramGifts(true).finally(function(){pull.classList.remove('loading','ready');if(pullText)pullText.textContent='Pull to refresh'})}else{pull.classList.remove('ready');if(pullText)pullText.textContent='Pull to refresh'}}, {passive:true})}
  function initMarketTabs(){var root=document.getElementById('market');if(!root||root.dataset.marketTabsReady==='1')return;root.dataset.marketTabsReady='1';try{currentSort=localStorage.getItem('vexa-market-sort')||currentSort}catch(e){}root.addEventListener('click',function(event){var target=event.target;var sortToggle=target&&target.closest?target.closest('[data-market-sort-toggle]'):null;if(sortToggle){event.preventDefault();event.stopPropagation();var menu=root.querySelector('[data-market-sort-menu]');if(menu)menu.classList.toggle('open');return}var sortBtn=target&&target.closest?target.closest('[data-market-sort]'):null;if(sortBtn){event.preventDefault();event.stopPropagation();setSort(sortBtn.getAttribute('data-market-sort'));return}var close=target&&target.closest?target.closest('[data-market-detail-close]'):null;if(close){event.preventDefault();event.stopPropagation();closeDetail();return}var buy=target&&target.closest?target.closest('[data-market-buy]'):null;if(buy){event.preventDefault();event.stopPropagation();handleBuy();return}var card=target&&target.closest?target.closest('.market-nft-card[data-market-item]'):null;if(card){event.preventDefault();event.stopPropagation();var id=card.getAttribute('data-market-item');openDetail(marketItemsById[id]);return}var btn=target&&target.closest?target.closest('[data-market-tab]'):null;if(!btn)return;event.preventDefault();event.stopPropagation();setMarketTab(btn.getAttribute('data-market-tab')||'store')},true);document.addEventListener('click',function(e){if(!root.contains(e.target)){var menu=root.querySelector('[data-market-sort-menu]');if(menu)menu.classList.remove('open')}},true);initPullRefresh();updateSortUi()}
  async function loadOwned(force){var u=user();if(!u.id)return;var now=Date.now();if(!force&&ownedLoadedAt&&now-ownedLoadedAt<OWNED_REFRESH_TTL){renderOwned();return}if(ownedRequestInFlight)return ownedRequestInFlight;ownedRequestInFlight=fetch('/app/api/my-nfts?userId='+encodeURIComponent(u.id),{cache:'default'}).then(function(r){return r.json()}).then(function(j){ownedLoadedAt=Date.now();lastOwned=j.owned||[];renderOwned()}).catch(function(){renderOwned()}).finally(function(){ownedRequestInFlight=null});return ownedRequestInFlight}
  async function loadTelegramGifts(force){var now=Date.now();if(!force&&telegramGiftsLoadedAt&&now-telegramGiftsLoadedAt<TELEGRAM_GIFTS_REFRESH_TTL){renderTelegramMarket();return}if(telegramGiftsRequestInFlight)return telegramGiftsRequestInFlight;telegramGiftsError='';var url='/app/api/ton-gift-market?sort='+encodeURIComponent(currentSort)+(force?'&refresh=1&ts='+Date.now():'');telegramGiftsRequestInFlight=fetch(url,{cache:force?'no-store':'default'}).then(function(r){return r.json().catch(function(){return null}).then(function(j){if(!r.ok||!j||j.error)throw new Error((j&&j.error)||'Could not load TON Gift NFTs');return j})}).then(function(j){telegramGiftsLoadedAt=Date.now();lastTelegramGifts=Array.isArray(j.gifts)?j.gifts:[];renderTelegramMarket()}).catch(function(e){telegramGiftsError=e&&e.message?e.message:'Could not load TON Gift NFTs';lastTelegramGifts=[];renderTelegramMarket()}).finally(function(){telegramGiftsRequestInFlight=null});return telegramGiftsRequestInFlight}
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeDetail()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){initMarketTabs();loadTelegramGifts(false)});else{initMarketTabs();loadTelegramGifts(false)}
})();
`;
