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
  var OWNED_REFRESH_TTL=20000;
  var TELEGRAM_GIFTS_REFRESH_TTL=180000;
  var creditLogo='/app/api/uploaded-image/credit-icon.png';
  var fallbackCreditLogo='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"%3E%3Cdefs%3E%3CradialGradient id="g" cx="32%25" cy="24%25" r="70%25"%3E%3Cstop offset="0" stop-color="%23ffffff"/%3E%3Cstop offset=".34" stop-color="%23ffd7e4"/%3E%3Cstop offset=".72" stop-color="%23ff2e63"/%3E%3Cstop offset="1" stop-color="%235b0f24"/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx="32" cy="32" r="28" fill="url(%23g)"/%3E%3Ccircle cx="32" cy="32" r="21" fill="none" stroke="rgba(255,255,255,.72)" stroke-width="3"/%3E%3Cpath d="M35 17 24 35h9l-4 12 13-20h-9l2-10Z" fill="white"/%3E%3C/svg%3E';
  function esc(v){return String(v==null?'':v)}
  function user(){var tg=window.Telegram&&window.Telegram.WebApp;var u=tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user;var tgId=String((u&&u.id)||'').trim();var stored=String(localStorage.getItem('ownerId')||'').trim();var id=tgId||stored;return {id:String(id||'').trim(),username:u&&u.username?String(u.username):null,firstName:u&&u.first_name?String(u.first_name):null}}
  function cleanTelegramDescription(item){var text=esc(item&&item.description||'');return text.replace(/\s*·\s*For sale on Fragment/gi,'').replace(/For sale on Fragment/gi,'').trim()}
  function giftNumber(item){var supply=esc(item&&item.supply||'');var desc=esc(item&&item.description||'');var found=(supply.match(/#\s*\d+/)||desc.match(/#\s*\d+/)||[])[0]||'';return found.replace(/\s+/g,'')}
  function giftPrice(item){var utility=esc(item&&item.utility||'');var desc=esc(item&&item.description||'');var found=(utility.match(/\d+(?:\.\d+)?\s*TON/i)||desc.match(/\d+(?:\.\d+)?\s*TON/i)||[])[0]||'';return found.replace(/\s+/g,' ').trim()||'TON NFT'}
  function priceButton(value){return '<span class="market-price-button"><img src="'+creditLogo+'" alt="" decoding="async" onerror="this.onerror=null;this.src=\''+fallbackCreditLogo+'\'"/><b>'+esc(value)+'</b></span>'}
  async function renderMedia(imgWrap,item){
    if(!imgWrap)return;
    if(!item||!item.imageUrl){imgWrap.innerHTML='<span class="market-nft-art"><b></b></span>';return}
    var mediaUrl=esc(item.imageUrl);
    imgWrap.innerHTML='<img class="market-uploaded-image" src="'+mediaUrl+'" alt="" decoding="async" loading="lazy"/>';
    if(window.VexaMountTgsDetail)try{window.VexaMountTgsDetail()}catch(e){}
  }
  function spec(label,value){return '<div class="market-detail-spec"><span>'+esc(label)+'</span><b>'+esc(value||'-')+'</b></div>'}
  function giftCard(item,owned){
    var src=esc(item&&item.imageUrl||'');
    var img=src?'<img class="market-uploaded-image" src="'+src+'" alt="" decoding="async" loading="lazy"/>':'<span class="market-nft-art"><b></b></span>';
    var source=item&&item.source==='telegram'?'telegram':'vexa';
    var badge=source==='telegram'?'TON NFT':(owned?'Owned':'NFT');
    var cls=owned?' market-owned-card':'';
    if(source==='telegram'){
      var number=giftNumber(item);
      var price=giftPrice(item);
      return '<button class="market-nft-card game-card market-owned-card-'+source+cls+'" type="button" data-market-owned="'+esc(item.purchaseId||item.id||'')+'" data-market-source="'+source+'" data-market-item="'+esc(item.id||'')+'"><span class="market-nft-image game-image">'+img+'</span><span class="market-nft-info game-info"><span class="market-nft-title-row"><strong>'+esc(item.title||'Gift NFT')+'</strong><em>'+badge+'</em></span>'+(number?'<span class="market-owned-meta">'+esc(number)+'</span>':'')+priceButton(price)+'</span></button>';
    }
    var meta=esc(item.rarity||'Collectible');
    return '<button class="market-nft-card game-card market-owned-card-'+source+cls+'" type="button" data-market-owned="'+esc(item.purchaseId||item.id||'')+'" data-market-source="'+source+'" data-market-item="'+esc(item.id||'')+'"><span class="market-nft-image game-image">'+img+'</span><span class="market-nft-info game-info"><span class="market-nft-title-row"><strong>'+esc(item.title||'Gift NFT')+'</strong><em>'+badge+'</em></span><span class="market-owned-meta">'+meta+'</span></span></button>';
  }
  function renderTelegramMarket(){
    var root=document.getElementById('market');if(!root)return;
    var panel=root.querySelector('[data-market-panel="store"]');
    var grid=root.querySelector('[data-market-telegram-grid]');var empty=root.querySelector('[data-market-telegram-empty]');
    if(panel&&grid&&grid.parentNode===panel&&panel.firstElementChild!==grid)panel.insertBefore(grid,panel.firstElementChild);
    if(panel&&grid&&empty&&empty.parentNode===panel&&empty.previousElementSibling!==grid)panel.insertBefore(empty,grid.nextSibling);
    var gifts=Array.isArray(lastTelegramGifts)?lastTelegramGifts:[];
    gifts.forEach(function(item){if(item&&item.id)marketItemsById[String(item.id)]=item});
    if(grid)grid.innerHTML=gifts.map(function(item){return giftCard(item,false)}).join('');
    if(grid)grid.style.display=gifts.length?'grid':'none';
    if(empty){var msg=empty.querySelector('p');if(msg)msg.textContent=telegramGiftsError||'TON Gift NFTs will appear here.';empty.style.display=gifts.length?'none':'flex'}
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
    var isTelegram=item.source==='telegram';
    sheet.classList.remove('is-success');
    var title=sheet.querySelector('[data-market-detail-title]');var desc=sheet.querySelector('[data-market-detail-description]');var collection=sheet.querySelector('[data-market-detail-collection]');var price=sheet.querySelector('[data-market-detail-price]');var specs=sheet.querySelector('[data-market-detail-specs]');var media=sheet.querySelector('[data-market-detail-media]');var buy=sheet.querySelector('[data-market-buy]');var status=sheet.querySelector('[data-market-detail-status]');
    if(title)title.textContent=esc(item.title||'Gift NFT');if(desc)desc.textContent=isTelegram?cleanTelegramDescription(item):esc(item.description||'Telegram Gift NFT on TON.');if(collection)collection.textContent=isTelegram?'Telegram Gift':esc(item.collection||'TON Gift NFTs');if(price)price.textContent=isTelegram?giftPrice(item):esc(item.price||'0');if(buy){buy.setAttribute('data-market-buy',esc(item.id));buy.disabled=!!isTelegram;buy.classList.remove('loading');var s=buy.querySelector('span');if(s)s.textContent=isTelegram?giftPrice(item):'Buy NFT'}if(status)status.textContent=isTelegram?'Display only. Buying/listing will be added with TON Connect next.':'';
    if(specs)specs.innerHTML=isTelegram?spec('Type','TON Gift NFT')+spec('Number',giftNumber(item)||'-')+spec('Status','On-chain NFT'):spec('Rarity',item.rarity)+spec('Total Supply',item.supply)+spec('Benefit',item.utility);
    if(media){media.innerHTML='';await renderMedia(media,item)}
    sheet.classList.add('open');sheet.setAttribute('aria-hidden','false');document.body.classList.add('market-detail-open');
    if(window.VexaMountTgsDetail)setTimeout(function(){try{window.VexaMountTgsDetail()}catch(e){}},80);
  }
  function showSuccess(){
    var sheet=document.getElementById('marketDetailSheet');if(!sheet)return;
    var buy=sheet.querySelector('[data-market-buy]');if(buy){buy.disabled=false;buy.classList.remove('loading')}
    sheet.classList.add('is-success');
    setTimeout(function(){closeDetail();setMarketTab('owned')},1450);
  }
  function closeDetail(){var sheet=document.getElementById('marketDetailSheet');if(!sheet)return;sheet.classList.remove('open','is-success');sheet.setAttribute('aria-hidden','true');document.body.classList.remove('market-detail-open');activeDetailItem=null}
  async function handleBuy(){
    if(buying||!activeDetailItem||activeDetailItem.source==='telegram')return;
    var u=user();var status=document.querySelector('[data-market-detail-status]');var buy=document.querySelector('[data-market-buy]');
    if(!u.id){if(status)status.textContent='Open inside Telegram to buy.';return}
    buying=true;
    if(status)status.textContent='Processing purchase...';
    if(buy){buy.disabled=true;buy.classList.add('loading');var s=buy.querySelector('span');if(s)s.textContent='Buying...'}
    try{
      var r=await fetch('/app/api/market-buy',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({userId:u.id,itemId:activeDetailItem.id})});
      var j=await r.json().catch(function(){return null});
      if(!r.ok||!j||j.error)throw new Error((j&&j.error)||'Purchase failed');
      if(Array.isArray(j.owned)){ownedLoadedAt=Date.now();lastOwned=j.owned;renderOwned()}
      if(Number.isFinite(Number(j.tonBalanceNano))&&window.VexaTonBalance&&window.VexaTonBalance.write){window.VexaTonBalance.write(Number(j.tonBalanceNano),0,false)}
      showSuccess();
    }catch(e){
      if(status)status.textContent=e&&e.message?e.message:'Purchase failed';
      if(buy){buy.disabled=false;buy.classList.remove('loading');var bs=buy.querySelector('span');if(bs)bs.textContent='Buy NFT'}
    }finally{buying=false}
  }
  function setMarketTab(tab){
    var root=document.getElementById('market');
    if(!root)return;
    root.querySelectorAll('[data-market-tab]').forEach(function(btn){btn.classList.toggle('active',btn.getAttribute('data-market-tab')===tab)});
    root.querySelectorAll('[data-market-panel]').forEach(function(panel){panel.classList.toggle('active',panel.getAttribute('data-market-panel')===tab)});
    if(tab==='store')loadTelegramGifts(false);
    if(tab==='owned')loadOwned(false)
  }
  function initMarketTabs(){
    var root=document.getElementById('market');
    if(!root||root.dataset.marketTabsReady==='1')return;
    root.dataset.marketTabsReady='1';
    root.addEventListener('click',function(event){
      var target=event.target;
      var close=target&&target.closest?target.closest('[data-market-detail-close]'):null;if(close){event.preventDefault();event.stopPropagation();closeDetail();return}
      var buy=target&&target.closest?target.closest('[data-market-buy]'):null;if(buy){event.preventDefault();event.stopPropagation();handleBuy();return}
      var card=target&&target.closest?target.closest('.market-nft-card[data-market-item]'):null;if(card){event.preventDefault();event.stopPropagation();var id=card.getAttribute('data-market-item');openDetail(marketItemsById[id]);return}
      var btn=target&&target.closest?target.closest('[data-market-tab]'):null;
      if(!btn)return;
      event.preventDefault();
      event.stopPropagation();
      setMarketTab(btn.getAttribute('data-market-tab')||'store');
    },true);
  }
  async function loadOwned(force){
    var u=user();if(!u.id)return;
    var now=Date.now();
    if(!force&&ownedLoadedAt&&now-ownedLoadedAt<OWNED_REFRESH_TTL){renderOwned();return}
    if(ownedRequestInFlight)return ownedRequestInFlight;
    ownedRequestInFlight=fetch('/app/api/my-nfts?userId='+encodeURIComponent(u.id),{cache:'default'})
      .then(function(r){return r.json()})
      .then(function(j){ownedLoadedAt=Date.now();lastOwned=j.owned||[];renderOwned()})
      .catch(function(){renderOwned()})
      .finally(function(){ownedRequestInFlight=null});
    return ownedRequestInFlight;
  }
  async function loadTelegramGifts(force){
    var now=Date.now();
    if(!force&&telegramGiftsLoadedAt&&now-telegramGiftsLoadedAt<TELEGRAM_GIFTS_REFRESH_TTL){renderTelegramMarket();return}
    if(telegramGiftsRequestInFlight)return telegramGiftsRequestInFlight;
    telegramGiftsError='';
    telegramGiftsRequestInFlight=fetch('/app/api/ton-gift-market',{cache:'default'})
      .then(function(r){return r.json().catch(function(){return null}).then(function(j){if(!r.ok||!j||j.error)throw new Error((j&&j.error)||'Could not load TON Gift NFTs');return j})})
      .then(function(j){telegramGiftsLoadedAt=Date.now();lastTelegramGifts=Array.isArray(j.gifts)?j.gifts:[];renderTelegramMarket()})
      .catch(function(e){telegramGiftsError=e&&e.message?e.message:'Could not load TON Gift NFTs';lastTelegramGifts=[];renderTelegramMarket()})
      .finally(function(){telegramGiftsRequestInFlight=null});
    return telegramGiftsRequestInFlight;
  }
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeDetail()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){initMarketTabs();loadTelegramGifts(false)});else{initMarketTabs();loadTelegramGifts(false)}
})();
`;
