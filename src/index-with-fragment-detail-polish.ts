import app from './index-with-tgs-overlay';
import type { Env } from './types';

const DETAIL_POLISH_SCRIPT = `
(function(){
  try {
    var lastMarketItemId='';
    var marketCache=null;
    var marketCacheAt=0;
    function addStyle(){
      if(document.getElementById('vexa-fragment-detail-polish'))return;
      var style=document.createElement('style');
      style.id='vexa-fragment-detail-polish';
      style.textContent='@keyframes vexaDetailPop{0%{opacity:0;transform:translateY(24px) scale(.94);filter:blur(10px)}58%{opacity:1;transform:translateY(-3px) scale(1.012);filter:blur(0)}100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}}#marketDetailSheet.vexa-fragment-detail .market-detail-card{animation:vexaDetailPop .42s cubic-bezier(.18,.9,.22,1) both!important;transform-origin:center 58%!important}#marketDetailSheet.vexa-fragment-detail .market-detail-buy{display:none!important}#marketDetailSheet.vexa-fragment-detail .market-detail-status{display:none!important}#marketDetailSheet.vexa-fragment-detail .market-detail-price,#marketDetailSheet.vexa-fragment-detail [data-market-detail-price]{color:#fff!important;text-shadow:none!important;-webkit-text-fill-color:#fff!important}#marketDetailSheet.vexa-fragment-detail .market-detail-price *{color:#fff!important;text-shadow:none!important;-webkit-text-fill-color:#fff!important;filter:none!important}#marketDetailSheet.vexa-fragment-detail .market-detail-price img.market-price-icon{width:34px!important;height:34px!important;object-fit:contain!important;filter:none!important;opacity:.98!important}#marketDetailSheet.vexa-fragment-detail .market-detail-price b,#marketDetailSheet.vexa-fragment-detail .market-detail-price strong,#marketDetailSheet.vexa-fragment-detail [data-market-detail-price]{font-weight:800!important;letter-spacing:-.02em!important}';
      document.head.appendChild(style);
    }
    function esc(v){return String(v==null?'':v)}
    function isFragmentDetail(sheet){
      if(!sheet||!sheet.classList.contains('open'))return false;
      return Boolean(sheet.querySelector('[data-market-detail-media]'));
    }
    function rememberClickedItem(e){
      try{
        var card=e.target&&e.target.closest?e.target.closest('.market-nft-card[data-market-item]'):null;
        if(card)lastMarketItemId=card.getAttribute('data-market-item')||'';
      }catch(err){}
    }
    async function loadMarketMap(){
      var now=Date.now();
      if(marketCache&&now-marketCacheAt<60000)return marketCache;
      var r=await fetch('/app/api/ton-gift-market-fresh?limit=180&offset=0&ts='+now,{cache:'no-store'});
      var j=await r.json().catch(function(){return null});
      var map={};
      if(j&&Array.isArray(j.gifts))j.gifts.forEach(function(item){if(item&&item.id)map[String(item.id)]=item});
      marketCache=map;marketCacheAt=now;
      return map;
    }
    function spec(label,value){return '<div class="market-detail-spec"><span>'+esc(label)+'</span><b>'+esc(value||'Unknown')+'</b></div>'}
    function injectSpecs(sheet,item){
      var specs=sheet&&sheet.querySelector('[data-market-detail-specs]');
      if(!specs||!item)return;
      specs.innerHTML=spec('Model',item.rarity||'Unknown')+spec('Backdrop',item.supply||'Unknown')+spec('Symbol',item.utility||'Unknown');
    }
    function injectAnimatedMedia(sheet,item){
      if(!item||!item.animationUrl)return;
      var media=sheet&&sheet.querySelector('[data-market-detail-media]');
      if(!media)return;
      var url=esc(item.animationUrl||item.imageUrl||'');
      if(!url)return;
      if(/\.(mp4|webm|mov)(\?|#|$)/i.test(url))media.innerHTML='<video class="market-uploaded-image" src="'+url+'" autoplay loop muted playsinline></video>';
      else if(url!==item.imageUrl)media.innerHTML='<img class="market-uploaded-image" src="'+url+'" alt="" decoding="async" loading="lazy"/>';
    }
    async function hydrateDetail(sheet){
      try{
        if(!lastMarketItemId)return;
        var map=await loadMarketMap();
        var item=map[lastMarketItemId];
        if(!item)return;
        injectSpecs(sheet,item);
        injectAnimatedMedia(sheet,item);
      }catch(e){}
    }
    function polishDetail(){
      try {
        addStyle();
        var sheet=document.getElementById('marketDetailSheet');
        if(!isFragmentDetail(sheet))return;
        sheet.classList.add('vexa-fragment-detail');
        var priceRow=sheet.querySelector('.market-detail-price');
        if(priceRow){
          var img=priceRow.querySelector('img.market-price-icon');
          if(img && img.getAttribute('src').indexOf('/app/api/nft-price-icon.png') === -1){
            img.src='/app/api/nft-price-icon.png?v='+(window.__vexaNftPriceIconVersion||window.__vexaAppVersion||Date.now());
            img.alt='TON';
          }
        }
        var buy=sheet.querySelector('.market-detail-buy');
        if(buy)buy.style.display='none';
        var status=sheet.querySelector('.market-detail-status');
        if(status)status.style.display='none';
        hydrateDetail(sheet);
      } catch(e) {}
    }
    function cleanup(){
      try{var sheet=document.getElementById('marketDetailSheet');if(sheet&&!sheet.classList.contains('open'))sheet.classList.remove('vexa-fragment-detail')}catch(e){}
    }
    window.VexaPolishFragmentDetail = polishDetail;
    document.addEventListener('click',function(e){rememberClickedItem(e);setTimeout(polishDetail,120);setTimeout(cleanup,500)},true);
    document.addEventListener('keydown',function(){setTimeout(cleanup,120)},true);
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){addStyle();setTimeout(polishDetail,600)});else{addStyle();setTimeout(polishDetail,600)}
    setInterval(function(){polishDetail();cleanup()},1200);
  } catch(e) {}
})();
`;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const response = await app.fetch(request, env, ctx);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;
    const html = await response.text();
    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.set('cache-control', 'no-store');
    return new Response(html.replace('</body>', `<script>${DETAIL_POLISH_SCRIPT}</script></body>`), {
      status: response.status,
      headers,
    });
  },
};