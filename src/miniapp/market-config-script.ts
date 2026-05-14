export const MARKET_CONFIG_SCRIPT = `
(function(){
  var marketItemsById={};
  var activeDetailItem=null;
  var marketRequestInFlight=null;
  var ownedRequestInFlight=null;
  var telegramGiftsRequestInFlight=null;
  var marketLoadedAt=0;
  var ownedLoadedAt=0;
  var telegramGiftsLoadedAt=0;
  var lastOwned=[];
  var lastTelegramGifts=[];
  var buying=false;
  var MARKET_REFRESH_TTL=60000;
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
  function ownedCard(item){
    var src=esc(item&&item.imageUrl||'');
    var img=src?'<img class="market-uploaded-image" src="'+src+'" alt="" decoding="async" loading="lazy"/>':'<span class="market-nft-art"><b></b></span>';
    var source=item&&item.source==='telegram'?'telegram':'vexa';
    var badge=source==='telegram'?'Telegram Gift':'Owned';
    var meta=source==='telegram'?esc(item.description||'Telegram collectible'):esc(item.rarity||'Collectible');
    return '<button class="market-nft-card game-card market-owned-card market-owned-card-'+source+'" type="button" data-market-owned="'+esc(item.purchaseId||item.id||'')+'" data-market-source="'+source+'" data-market-item="'+esc(item.id||'')+'"><span class="market-nft-image game-image">'+img+'</span><span class="market-nft-info game-info"><span class="market-nft-title-row"><strong>'+esc(item.title||'NFT')+'</strong><em>'+badge+'</em></span><span class="market-owned-meta">'+meta+'</span></span></button>';
  }
  function renderOwned(){
    var root=document.getElementById('market');if(!root)return;
    var grid=root.querySelector('[data-market-owned-grid]');var empty=root.querySelector('[data-market-owned-empty]');
    var combined=[].concat(Array.isArray(lastOwned)?lastOwned:[],Array.isArray(lastTelegramGifts)?lastTelegramGifts:[]);
    if(grid)grid.innerHTML=combined.map(ownedCard).join('');
    if(grid)grid.style.display=combined.length?'grid':'none';
    if(empty)empty.style.display=combined.length?'none':'flex';
  }
  async function openDetail(item){
    var sheet=document.getElementById('marketDetailSheet');if(!sheet||!item)return;activeDetailItem=item;
    var isTelegram=item.source==='telegram';
    sheet.classList.remove('is-success');
    var title=sheet.querySelector('[data-market-detail-title]');var desc=sheet.querySelector('[data-market-detail-description]');var collection=sheet.querySelector('[data-market-detail-collection]');var price=sheet.querySelector('[data-market-detail-price]');var specs=sheet.querySelector('[data-market-detail-specs]');var media=sheet.querySelector('[data-market-detail-media]');var buy=sheet.querySelector('[data-market-buy]');var status=sheet.querySelector('[data-market-detail-status]');
    if(title)title.textContent=esc(item.title||'NFT');if(desc)desc.textContent=esc(item.description||'Vexa internal collectible.');if(collection)collection.textContent=esc(item.collection||'Vexa Collectible');if(price)price.textContent=isTelegram?'Telegram':esc(item.price||'0');if(buy){buy.setAttribute('data-market-buy',esc(item.id));buy.disabled=!!isTelegram;buy.classList.remove('loading');var s=buy.querySelector('span');if(s)s.textContent=isTelegram?'Telegram Gift':'Buy NFT'}if(status)status.textContent=isTelegram?'Display only. Transfer is not enabled in Vexa yet.':'';
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
      if(Array.isArray(j.items)){marketLoadedAt=Date.now();apply(j.items)}
      if(Array.isArray(j.owned)){ownedLoadedAt=Date.now();lastOwned=j.owned;renderOwned()}
      if(Number.isFinite(Number(j.tonBalanceNano))&&window.VexaTonBalance&&window.VexaTonBalance.write){window.VexaTonBalance.write(Number(j.tonBalanceNano),0,false)}
      showSuccess();
    }catch(e){
      if(status)status.textContent=e&&e.message?e.message:'Purchase failed';
      if(buy){buy.disabled=false;buy.classList.remove('loading');var bs=buy.querySelector('span');if(bs)bs.textContent='Buy NFT'}
    }finally{buying=false}
  }
  function apply(items){
    if(!Array.isArray(items))return;marketItemsById={};
    items.forEach(function(item){
      if(!item||!item.id)return;marketItemsById[String(item.id)]=item;
      var card=document.querySelector('#market .market-nft-card[data-market-item="'+CSS.escape(String(item.id))+'"]:not(.market-owned-card)');
      if(!card)return;
      var title=card.querySelector('.market-nft-title-row strong');
      var badge=card.querySelector('.market-nft-title-row em');
      var price=card.querySelector('.market-price-button b');
      var imgWrap=card.querySelector('.market-nft-image');
      card.removeAttribute('data-market-animation');
      card.classList.remove('market-anim-none','market-anim-spin','market-anim-glow','market-anim-shine','market-anim-pulse','market-anim-spin-glow');
      card.classList.toggle('is-sold-out',Math.floor(Number(item.stock)||0)<=0);
      if(title&&item.title)title.textContent=esc(item.title);
      if(badge&&item.stock!==undefined&&item.stock!==null)badge.textContent='Stock '+esc(item.stock);
      if(price&&item.price)price.textContent=esc(item.price);
      if(imgWrap&&item.imageUrl&&imgWrap.dataset.marketImageUrl!==String(item.imageUrl)){
        imgWrap.dataset.marketImageUrl=String(item.imageUrl);
        renderMedia(imgWrap,item).catch(function(){});
      }
    });
  }
  function setMarketTab(tab){
    var root=document.getElementById('market');
    if(!root)return;
    root.querySelectorAll('[data-market-tab]').forEach(function(btn){btn.classList.toggle('active',btn.getAttribute('data-market-tab')===tab)});
    root.querySelectorAll('[data-market-panel]').forEach(function(panel){panel.classList.toggle('active',panel.getAttribute('data-market-panel')===tab)});
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
      var card=target&&target.closest?target.closest('.market-nft-card[data-market-item]'):null;if(card){event.preventDefault();event.stopPropagation();var source=card.getAttribute('data-market-source');var id=card.getAttribute('data-market-item');var list=source==='telegram'?lastTelegramGifts:lastOwned;var ownedItem=Array.isArray(list)?list.find(function(x){return x&&String(x.id)===String(id)}):null;openDetail(ownedItem||marketItemsById[id]);return}
      var btn=target&&target.closest?target.closest('[data-market-tab]'):null;
      if(!btn)return;
      event.preventDefault();
      event.stopPropagation();
      setMarketTab(btn.getAttribute('data-market-tab')||'store');
    },true);
  }
  async function loadMarket(force){
    initMarketTabs();
    var now=Date.now();
    if(!force&&marketLoadedAt&&now-marketLoadedAt<MARKET_REFRESH_TTL)return;
    if(marketRequestInFlight)return marketRequestInFlight;
    marketRequestInFlight=fetch('/app/api/market-items',{cache:'default'})
      .then(function(r){return r.json()})
      .then(function(j){marketLoadedAt=Date.now();apply(j.items||[])})
      .catch(function(){})
      .finally(function(){marketRequestInFlight=null});
    return marketRequestInFlight;
  }
  async function loadOwned(force){
    var u=user();if(!u.id)return;
    var now=Date.now();
    if(!force&&ownedLoadedAt&&now-ownedLoadedAt<OWNED_REFRESH_TTL)return;
    if(ownedRequestInFlight)return ownedRequestInFlight;
    ownedRequestInFlight=fetch('/app/api/my-nfts?userId='+encodeURIComponent(u.id),{cache:'default'})
      .then(function(r){return r.json()})
      .then(function(j){ownedLoadedAt=Date.now();lastOwned=j.owned||[];renderOwned()})
      .catch(function(){})
      .finally(function(){ownedRequestInFlight=null});
    return ownedRequestInFlight;
  }
  async function loadTelegramGifts(force){
    var u=user();if(!u.id)return;
    var now=Date.now();
    if(!force&&telegramGiftsLoadedAt&&now-telegramGiftsLoadedAt<TELEGRAM_GIFTS_REFRESH_TTL)return;
    if(telegramGiftsRequestInFlight)return telegramGiftsRequestInFlight;
    telegramGiftsRequestInFlight=fetch('/app/api/telegram-gifts?userId='+encodeURIComponent(u.id),{cache:'default'})
      .then(function(r){return r.json()})
      .then(function(j){telegramGiftsLoadedAt=Date.now();lastTelegramGifts=j.gifts||[];renderOwned()})
      .catch(function(){})
      .finally(function(){telegramGiftsRequestInFlight=null});
    return telegramGiftsRequestInFlight;
  }
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeDetail()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){loadMarket(false)});else loadMarket(false);
})();
`;
