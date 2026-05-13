export const MARKET_CONFIG_SCRIPT = `
(function(){
  var animationClasses=['market-anim-none','market-anim-spin','market-anim-glow','market-anim-shine','market-anim-pulse','market-anim-spin-glow'];
  function esc(v){return String(v==null?'':v)}
  function cleanAnim(v){v=String(v||'none');return ['none','spin','glow','shine','pulse','spin-glow'].indexOf(v)>=0?v:'none'}
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
      card.classList.add('market-anim-'+anim);
      card.setAttribute('data-market-animation',anim);
      if(title&&item.title)title.textContent=esc(item.title);
      if(badge&&item.stock!==undefined&&item.stock!==null)badge.textContent='Stock '+esc(item.stock);
      if(price&&item.price)price.textContent=esc(item.price);
      if(imgWrap&&item.imageUrl){
        imgWrap.innerHTML='<img class="market-uploaded-image" src="'+esc(item.imageUrl)+'" alt="" decoding="async"/>';
      }
    });
  }
  async function loadMarket(){
    try{var r=await fetch('/app/api/market-items',{cache:'no-store'});var j=await r.json();apply(j.items||[])}catch(e){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadMarket);else loadMarket();
  window.VexaMarketRefresh=loadMarket;
})();
`;
