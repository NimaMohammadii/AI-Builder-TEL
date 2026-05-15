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
  var currentCollection='all';
  var marketNextOffset=0;
  var marketHasMore=true;
  var MARKET_PAGE_LIMIT=90;
  var OWNED_REFRESH_TTL=20000;
  var TELEGRAM_GIFTS_REFRESH_TTL=180000;
  var NFT_PRICE_ICON_URL='/app/api/nft-price-icon.png';
  function esc(v){return String(v==null?'':v)}
  function iconVersion(){return String(window.__vexaNftPriceIconVersion||window.__vexaAppVersion||'1')}
  function user(){var tg=window.Telegram&&window.Telegram.WebApp;var u=tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user;var tgId=String((u&&u.id)||'').trim();var stored=String(localStorage.getItem('ownerId')||'').trim();var id=tgId||stored;return {id:String(id||'').trim(),username:u&&u.username?String(u.username):null,firstName:u&&u.first_name?String(u.first_name):null}}
  function firstTonPrice(raw){raw=esc(raw).replace(/,/g,'.');var m=raw.match(/([0-9]+(?:\\.[0-9]+)?)\\s*(?:TON|Ton|ton)\\b/);if(m&&m[1])return m[1];var p=raw.match(/(?:price|sell price|buy for)[^0-9]{0,40}([0-9]+(?:\\.[0-9]+)?)/i);return p&&p[1]?p[1]:''}
  function telegramMeta(item){var raw=esc(item&&item.description||'')+' '+esc(item&&item.utility||'')+' '+esc(item&&item.supply||'')+' '+esc(item&&item.price||'')+' '+esc(item&&item.badge||'');var num=(raw.match(/#\\s*\\d+/)||[])[0]||'';var price=firstTonPrice(raw);return {number:num.replace(/\\s+/g,''),price:price.trim()}}
  function itemPrice(item){var n=parseFloat(telegramMeta(item).price);return Number.isFinite(n)?n:999999999}
  function collectionName(item){return esc(item&&item.title||'Other').replace(/\s+#?\d+$/,'').trim()||'Other'}
  function collectionKey(name){return esc(name).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'other'}
  function filteredSortedGifts(){var gifts=(Array.isArray(lastTelegramGifts)?lastTelegramGifts:[]).slice();if(currentCollection!=='all'){gifts=gifts.filter(function(item){return collectionKey(collectionName(item))===currentCollection})}gifts.sort(function(a,b){var pa=itemPrice(a);var pb=itemPrice(b);return currentSort==='price_desc'?pb-pa:pa-pb});return gifts}
  function mergeGifts(existing,incoming){var map={};var out=[];(Array.isArray(existing)?existing:[]).forEach(function(item){if(item&&item.id&&!map[item.id]){map[item.id]=1;out.push(item)}});(Array.isArray(incoming)?incoming:[]).forEach(function(item){if(item&&item.id&&!map[item.id]){map[item.id]=1;out.push(item)}});return out}
  async function renderMedia(imgWrap,item){
    if(!imgWrap)return;
    if(!item||!item.imageUrl){imgWrap.innerHTML='<span class="market-nft-art"><b></b></span>';return}
    var mediaUrl=esc(item.imageUrl);
    imgWrap.innerHTML='<img class="market-uploaded-image" src="'+mediaUrl+'" alt="" decoding="async" loading="lazy"/>';
  }
  function priceIcon(){return '<img class="market-price-icon" src="'+NFT_PRICE_ICON_URL+'?v='+iconVersion()+'" alt="TON" decoding="async"/>'}
  function priceButton(value){return '<span class="market-price-button vexa-fragment-price">'+priceIcon()+'<b>'+esc(value||'0')+'</b></span>'}
  function giftCard(item,owned){
    var src=esc(item&&item.imageUrl||'');
    var metaObj=telegramMeta(item);
    var img=src?'<img class="market-uploaded-image" src="'+src+'" alt="" decoding="async" loading="lazy"/>':'<span class="market-nft-art"><b></b></span>';
    var meta=metaObj.number;
    var cls=owned?' market-owned-card':'';
    var footer=priceButton(metaObj.price);
    return '<button class="market-nft-card game-card market-owned-card-telegram'+cls+'" type="button" data-fragment-polished="1" data-market-owned="'+esc(item.purchaseId||item.id||'')+'" data-market-source="telegram" data-market-item="'+esc(item.id||'')+'"><span class="market-nft-image game-image">'+img+'</span><span class="market-nft-info game-info"><span class="market-nft-title-row"><strong>'+esc(item.title||'Gift NFT')+'</strong></span><span class="market-owned-meta">'+esc(meta)+'</span>'+footer+'</span></button>';
  }
  function renderCollectionMenu(){var root=document.getElementById('market');if(!root)return;var menu=root.querySelector('[data-market-collection-menu]');if(!menu)return;var map={};(Array.isArray(lastTelegramGifts)?lastTelegramGifts:[]).forEach(function(item){var name=collectionName(item);map[collectionKey(name)]=name});var keys=Object.keys(map).sort(function(a,b){return map[a].localeCompare(map[b])});var html='<button class="market-collection-option '+(currentCollection==='all'?'active':'')+'" type="button" data-market-collection="all"><span>All collections</span><i>✓</i></button>';keys.forEach(function(k){html+='<button class="market-collection-option '+(currentCollection===k?'active':'')+'" type="button" data-market-collection="'+esc(k)+'"><span>'+esc(map[k])+'</span><i>✓</i></button>'});menu.innerHTML=html;var label=root.querySelector('[data-market-collection-label]');if(label)label.textContent=currentCollection==='all'?'Collections':(map[currentCollection]||'Collections')}
  function renderTelegramMarket(){
    var root=document.getElementById('market');if(!root)return;
    var grid=root.querySelector('[data-market-telegram-grid]');var empty=root.querySelector('[data-market-telegram-empty]');
    renderCollectionMenu();
    var gifts=filteredSortedGifts();
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
    var tmeta=telegramMeta(item);
    sheet.classList.remove('is-success');
    sheet.classList.add('vexa-fragment-detail');
    var title=sheet.querySelector('[data-market-detail-title]');var desc=sheet.querySelector('[data-market-detail-description]');var collection=sheet.querySelector('[data-market-detail-collection]');var price=sheet.querySelector('[data-market-detail-price]');var specs=sheet.querySelector('[data-market-detail-specs]');var media=sheet.querySelector('[data-market-detail-media]');var buy=sheet.querySelector('[data-market-buy]');var status=sheet.querySelector('[data-market-detail-status]');
    if(title)title.textContent=esc(item.title||'Gift NFT');
    if(desc)desc.textContent=tmeta.number||'';
    if(collection)collection.textContent='Telegram Gift';
    if(price)price.textContent=tmeta.price||'0';
    var priceBox=sheet.querySelector('.market-detail-price strong');if(priceBox){var old=priceBox.querySelector('.market-price-icon');if(!old)priceBox.insertAdjacentHTML('afterbegin',priceIcon());else old.src=NFT_PRICE_ICON_URL+'?v='+iconVersion()}
    if(buy){buy.remove()}
    if(status){status.remove()}
    if(specs)specs.innerHTML='<div class="market-detail-spec"><span>Model</span><b>'+esc(item.rarity||'Unknown')+'</b></div><div class="market-detail-spec"><span>Backdrop</span><b>'+esc(item.supply||'Unknown')+'</b></div><div class="market-detail-spec"><span>Symbol</span><b>'+esc(item.utility||'Unknown')+'</b></div>';
    if(media){media.innerHTML='';await renderMedia(media,item)}
    sheet.classList.add('open');sheet.setAttribute('aria-hidden','false');document.body.classList.add('market-detail-open');
    try{window.VexaPolishFragmentDetail&&window.VexaPolishFragmentDetail()}catch(e){}
  }
  function showSuccess(){var sheet=document.getElementById('marketDetailSheet');if(!sheet)return;sheet.classList.add('is-success');setTimeout(function(){closeDetail();setMarketTab('owned')},1450)}
  function closeDetail(){var sheet=document.getElementById('marketDetailSheet');if(!sheet)return;sheet.classList.remove('open','is-success');sheet.setAttribute('aria-hidden','true');document.body.classList.remove('market-detail-open');activeDetailItem=null}
  async function handleBuy(){if(buying||!activeDetailItem||activeDetailItem.source==='telegram')return;var u=user();if(!u.id)return;buying=true;try{var r=await fetch('/app/api/market-buy',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({userId:u.id,itemId:activeDetailItem.id})});var j=await r.json().catch(function(){return null});if(!r.ok||!j||j.error)throw new Error((j&&j.error)||'Purchase failed');if(Array.isArray(j.owned)){ownedLoadedAt=Date.now();lastOwned=j.owned;renderOwned()}if(Number.isFinite(Number(j.tonBalanceNano))&&window.VexaTonBalance&&window.VexaTonBalance.write){window.VexaTonBalance.write(Number(j.tonBalanceNano),0,false)}showSuccess()}catch(e){}finally{buying=false}}
  function setMarketTab(tab){var root=document.getElementById('market');if(!root)return;root.querySelectorAll('[data-market-tab]').forEach(function(btn){btn.classList.toggle('active',btn.getAttribute('data-market-tab')===tab)});root.querySelectorAll('[data-market-panel]').forEach(function(panel){panel.classList.toggle('active',panel.getAttribute('data-market-panel')===tab)});var filter=root.querySelector('.market-filter-bar');if(filter)filter.style.display=tab==='store'?'flex':'none';if(tab==='store')loadTelegramGifts(false,false);if(tab==='owned')loadOwned(false)}
  function updateSortUi(){var root=document.getElementById('market');if(!root)return;var label=root.querySelector('[data-market-sort-label]');if(label)label.textContent=currentSort==='price_desc'?'Price high to low':'Price low to high';root.querySelectorAll('[data-market-sort]').forEach(function(btn){btn.classList.toggle('active',btn.getAttribute('data-market-sort')===currentSort)})}
  function setCollection(collection){currentCollection=collection||'all';try{localStorage.setItem('vexa-market-collection',currentCollection)}catch(e){}var root=document.getElementById('market');var menu=root&&root.querySelector('[data-market-collection-menu]');if(menu)menu.classList.remove('open');renderTelegramMarket()}
  function setSort(sort){currentSort=sort==='price_desc'?'price_desc':'price_asc';marketNextOffset=0;marketHasMore=true;try{localStorage.setItem('vexa-market-sort',currentSort)}catch(e){}var root=document.getElementById('market');var menu=root&&root.querySelector('[data-market-sort-menu]');if(menu)menu.classList.remove('open');loadTelegramGifts(true,false)}
  function toggleSort(){setSort(currentSort==='price_desc'?'price_asc':'price_desc')}
  function initPullRefresh(){var root=document.getElementById('market');if(!root||root.dataset.marketPullReady==='1')return;root.dataset.marketPullReady='1';var scroller=root.querySelector('[data-market-scroll="store"]');var pull=root.querySelector('[data-market-pull]');var pullText=root.querySelector('[data-market-pull-text]');if(!scroller||!pull)return;var startY=0;var pulling=false;var armed=false;scroller.addEventListener('touchstart',function(e){if(scroller.scrollTop<=0&&!telegramGiftsRequestInFlight){startY=e.touches[0].clientY;pulling=true;armed=false}}, {passive:true});scroller.addEventListener('touchmove',function(e){if(!pulling)return;var dy=e.touches[0].clientY-startY;if(dy>44&&scroller.scrollTop<=0){armed=true;pull.classList.add('ready');if(pullText)pullText.textContent='Release to refresh'}}, {passive:true});scroller.addEventListener('touchend',function(){if(!pulling)return;pulling=false;if(armed){pull.classList.remove('ready');pull.classList.add('loading');if(pullText)pullText.textContent='Refreshing';marketNextOffset=0;marketHasMore=true;loadTelegramGifts(true,false).finally(function(){pull.classList.remove('loading','ready');if(pullText)pullText.textContent='Pull to refresh'})}else{pull.classList.remove('ready');if(pullText)pullText.textContent='Pull to refresh'}}, {passive:true})}
  function initInfiniteScroll(){var root=document.getElementById('market');if(!root||root.dataset.marketInfiniteReady==='1')return;root.dataset.marketInfiniteReady='1';var scroller=root.querySelector('[data-market-scroll="store"]');if(!scroller)return;scroller.addEventListener('scroll',function(){if(!marketHasMore||telegramGiftsRequestInFlight)return;if(scroller.scrollTop+scroller.clientHeight>=scroller.scrollHeight-280){loadTelegramGifts(false,true)}},{passive:true})}
  function initMarketTabs(){var root=document.getElementById('market');if(!root||root.dataset.marketTabsReady==='1')return;root.dataset.marketTabsReady='1';try{currentSort=localStorage.getItem('vexa-market-sort')||currentSort;currentCollection=localStorage.getItem('vexa-market-collection')||currentCollection}catch(e){}root.addEventListener('click',function(event){var target=event.target;var collectionToggle=target&&target.closest?target.closest('[data-market-collection-toggle]'):null;if(collectionToggle){event.preventDefault();event.stopPropagation();var cMenu=root.querySelector('[data-market-collection-menu]');var sMenu=root.querySelector('[data-market-sort-menu]');if(sMenu)sMenu.classList.remove('open');if(cMenu)cMenu.classList.toggle('open');return}var collectionBtn=target&&target.closest?target.closest('[data-market-collection]'):null;if(collectionBtn){event.preventDefault();event.stopPropagation();setCollection(collectionBtn.getAttribute('data-market-collection'));return}var sortToggle=target&&target.closest?target.closest('[data-market-sort-toggle]'):null;if(sortToggle){event.preventDefault();event.stopPropagation();var cm=root.querySelector('[data-market-collection-menu]');if(cm)cm.classList.remove('open');toggleSort();return}var sortBtn=target&&target.closest?target.closest('[data-market-sort]'):null;if(sortBtn){event.preventDefault();event.stopPropagation();setSort(sortBtn.getAttribute('data-market-sort'));return}var close=target&&target.closest?target.closest('[data-market-detail-close]'):null;if(close){event.preventDefault();event.stopPropagation();closeDetail();return}var buy=target&&target.closest?target.closest('[data-market-buy]'):null;if(buy){event.preventDefault();event.stopPropagation();handleBuy();return}var card=target&&target.closest?target.closest('.market-nft-card[data-market-item]'):null;if(card){event.preventDefault();event.stopPropagation();var id=card.getAttribute('data-market-item');openDetail(marketItemsById[id]);return}var btn=target&&target.closest?target.closest('[data-market-tab]'):null;if(!btn)return;event.preventDefault();event.stopPropagation();setMarketTab(btn.getAttribute('data-market-tab')||'store')},true);document.addEventListener('click',function(e){if(!root.contains(e.target)){var menu=root.querySelector('[data-market-sort-menu]');var cMenu=root.querySelector('[data-market-collection-menu]');if(menu)menu.classList.remove('open');if(cMenu)cMenu.classList.remove('open')}},true);initPullRefresh();initInfiniteScroll();updateSortUi();renderCollectionMenu()}
  async function loadOwned(force){var u=user();if(!u.id)return;var now=Date.now();if(!force&&ownedLoadedAt&&now-ownedLoadedAt<OWNED_REFRESH_TTL){renderOwned();return}if(ownedRequestInFlight)return ownedRequestInFlight;ownedRequestInFlight=fetch('/app/api/my-nfts?userId='+encodeURIComponent(u.id),{cache:'default'}).then(function(r){return r.json()}).then(function(j){ownedLoadedAt=Date.now();lastOwned=j.owned||[];renderOwned()}).catch(function(){renderOwned()}).finally(function(){ownedRequestInFlight=null});return ownedRequestInFlight}
  async function loadTelegramGifts(force,append){var now=Date.now();if(!append&&!force&&telegramGiftsLoadedAt&&now-telegramGiftsLoadedAt<TELEGRAM_GIFTS_REFRESH_TTL){renderTelegramMarket();return}if(telegramGiftsRequestInFlight)return telegramGiftsRequestInFlight;telegramGiftsError='';var offset=append?marketNextOffset:0;if(force&&!append){offset=0;marketNextOffset=0;marketHasMore=true}var endpoint='/app/api/ton-gift-market-fresh';var url=endpoint+'?sort='+encodeURIComponent(currentSort)+'&offset='+encodeURIComponent(offset)+'&limit='+encodeURIComponent(MARKET_PAGE_LIMIT)+'&ts='+Date.now();telegramGiftsRequestInFlight=fetch(url,{cache:'no-store'}).then(function(r){return r.json().catch(function(){return null}).then(function(j){if(!r.ok||!j||j.error)throw new Error((j&&j.error)||'Could not load TON Gift NFTs');return j})}).then(function(j){telegramGiftsLoadedAt=Date.now();var incoming=Array.isArray(j.gifts)?j.gifts:[];lastTelegramGifts=append?mergeGifts(lastTelegramGifts,incoming):incoming;marketNextOffset=Number.isFinite(Number(j.nextOffset))?Number(j.nextOffset):(offset+incoming.length);marketHasMore=Boolean(j.hasMore)&&incoming.length>0;renderTelegramMarket()}).catch(function(e){telegramGiftsError=e&&e.message?e.message:'Could not load TON Gift NFTs';if(!append)lastTelegramGifts=[];renderTelegramMarket()}).finally(function(){telegramGiftsRequestInFlight=null});return telegramGiftsRequestInFlight}
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeDetail()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){initMarketTabs();loadTelegramGifts(true,false)});else{initMarketTabs();loadTelegramGifts(true,false)}
})();
`;