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
  var buying=false;
  var OWNED_REFRESH_TTL=20000;
  var TELEGRAM_GIFTS_REFRESH_TTL=180000;
  function esc(v){return String(v==null?'':v)}
  function user(){var tg=window.Telegram&&window.Telegram.WebApp;var u=tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user;var id=localStorage.getItem('ownerId')||String((u&&u.id)||'');return {id:String(id||'').trim(),username:u&&u.username?String(u.username):null,firstName:u&&u.first_name?String(u.first_name):null}}
  async function renderMedia(imgWrap,item){
    if(!imgWrap)return;
    if(!item||!item.imageUrl){imgWrap.innerHTML='<span class="market-nft-art"><b></b></span>';return}
    var mediaUrl=esc(item.imageUrl);
    imgWrap.innerHTML='<img class="market-uploaded-image" src="'+mediaUrl+'" alt="" decoding="async" loading="lazy"/>';
  }
  function spec(label,value){return '<div class="market-detail-spec"><span>'+esc(label)+'</span><b>'+esc(value||'-')+'</b></div>'}
  function giftCard(item,owned){
    var src=esc(item&&item.imageUrl||'');
    var img=src?'<img class="market-uploaded-image" src="'+src+'" alt="" decoding="async" loading="lazy"/>':'<span class="market-nft-art"><b></b></span>';
    var source=item&&item.source==='telegram'?'telegram':'vexa';
    var badge=source==='telegram'?'Telegram Gift':(owned?'Owned':'NFT');
    var meta=source==='telegram'?esc(item.description||'Telegram collectible'):esc(item.rarity||'Collectible');
    var cls=owned?' market-owned-card':'';
    return '<button class="market-nft-card game-card market-owned-card-'+source+cls+'" type="button" data-market-owned="'+esc(item.purchaseId||item.id||'')+'" data-market-source="'+source+'" data-market-item="'+esc(item.id||'')+'"><span class="market-nft-image game-image">'+img+'</span><span class="market-nft-info game-info"><span class="market-nft-title-row"><strong>'+esc(item.title||'Gift')+'</strong><em>'+badge+'</em></span><span class="market-owned-meta">'+meta+'</span></span></button>';
  }
  function renderTelegramMarket(){
    var root=document.getElementById('market');if(!root)return;
    var grid=root.querySelector('[data-market-telegram-grid]');var empty=root.querySelector('[data-market-telegram-empty]');
    var gifts=Array.isArray(lastTelegramGifts)?lastTelegramGifts:[];
    gifts.forEach(function(item){if(item&&item.id)marketItemsById[String(item.id)]=item});
    if(grid)grid.innerHTML=gifts.map(function(item){return giftCard(item,false)}).join('');
    if(grid)grid.style.display=gifts.length?'grid':'none';
    if(empty)empty.style.display=gifts.length?'none':'flex';
  }
  function renderOwned(){
    var root=document.getElementById('market');if(!root)return;
    var grid=root.querySelector('[data-market-owned-grid]');var empty=root.querySelector('[data-market-owned-empty]');
    var combined=[].concat(Array.isArray(lastOwned)?lastOwned:[],Array.isArray(lastTelegramGifts)?lastTelegramGifts:[]);
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
    if(title)title.textContent=esc(item.title||'Gift');if(desc)desc.textContent=esc(item.description||'Telegram collectible gift.');if(collection)collection.textContent=esc(item.collection||'Telegram Gifts');if(price)price.textContent=isTelegram?'Telegram':esc(item.price||'0');if(buy){buy.setAttribute('data-market-buy',esc(item.id));buy.disabled=!!isTelegram;buy.classList.remove('loading');var s=buy.querySelector('span');if(s)s.textContent=isTelegram?'Telegram Gift':'Buy NFT'}if(status)status.textContent=isTelegram?'Display only. Transfer is not enabled in Vexa yet.':'';
    if(specs)specs.innerHTML=isTelegram?spec('Type','Telegram Gift')+spec('Model',item.rarity)+spec('Status',item.canTransfer?'Transferable':'Display only'):spec('Rarity',item.rarity)+spec('Total Supply',item.supply)+spec('Benefit',item.utility);
    if(media){media.innerHTML='';await renderMedia(media,item)}
    sheet.classList.add('open');sheet.setAttribute('aria-hidden','false');document.body.classList.add('market-detail-open');
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
    if(tab==='owned'){loadOwned(false);loadTelegramGifts(false)}
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
    var u=user();
    if(!u.id){lastTelegramGifts=[];renderTelegramMarket();renderOwned();return}
    var now=Date.now();
    if(!force&&telegramGiftsLoadedAt&&now-telegramGiftsLoadedAt<TELEGRAM_GIFTS_REFRESH_TTL){renderTelegramMarket();renderOwned();return}
    if(telegramGiftsRequestInFlight)return telegramGiftsRequestInFlight;
    telegramGiftsRequestInFlight=fetch('/app/api/telegram-gifts?userId='+encodeURIComponent(u.id),{cache:'default'})
      .then(function(r){return r.json()})
      .then(function(j){telegramGiftsLoadedAt=Date.now();lastTelegramGifts=Array.isArray(j.gifts)?j.gifts:[];renderTelegramMarket();renderOwned()})
      .catch(function(){lastTelegramGifts=[];renderTelegramMarket();renderOwned()})
      .finally(function(){telegramGiftsRequestInFlight=null});
    return telegramGiftsRequestInFlight;
  }
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeDetail()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){initMarketTabs();loadTelegramGifts(false)});else{initMarketTabs();loadTelegramGifts(false)}
})();
`;
