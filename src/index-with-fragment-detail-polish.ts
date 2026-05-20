import app from './index-with-tgs-overlay';
import './predict-routes';
import './crash-routes';
import type { Env } from './types';

const DETAIL_POLISH_SCRIPT = `
(function(){
  try{
    function addStyle(){
      if(document.getElementById('vexa-fragment-detail-polish'))return;
      var style=document.createElement('style');
      style.id='vexa-fragment-detail-polish';
      style.textContent='#marketDetailSheet.vexa-fragment-detail .market-detail-buy{display:none!important}#marketDetailSheet.vexa-fragment-detail .market-detail-status{display:none!important}#marketDetailSheet.vexa-fragment-detail .market-detail-price,#marketDetailSheet.vexa-fragment-detail [data-market-detail-price]{color:#fff!important;text-shadow:none!important;-webkit-text-fill-color:#fff!important}#marketDetailSheet.vexa-fragment-detail .market-detail-price *{color:#fff!important;text-shadow:none!important;-webkit-text-fill-color:#fff!important;filter:none!important}#marketDetailSheet.vexa-fragment-detail .market-detail-price img.market-price-icon{width:34px!important;height:34px!important;object-fit:contain!important;filter:none!important;opacity:.98!important}';
      document.head.appendChild(style);
    }
    function isFragmentDetail(sheet){
      if(!sheet||!sheet.classList.contains('open'))return false;
      return Boolean(sheet.querySelector('[data-market-detail-media]'));
    }
    function polishDetail(){
      try{
        addStyle();
        var sheet=document.getElementById('marketDetailSheet');
        if(!isFragmentDetail(sheet))return;
        sheet.classList.add('vexa-fragment-detail');
        var priceRow=sheet.querySelector('.market-detail-price');
        if(priceRow){
          var img=priceRow.querySelector('img.market-price-icon');
          if(img&&img.getAttribute('src').indexOf('/app/api/nft-price-icon.png')===-1){
            img.src='/app/api/nft-price-icon.png?v='+(window.__vexaNftPriceIconVersion||window.__vexaAppVersion||Date.now());
            img.alt='TON';
          }
        }
        var buy=sheet.querySelector('.market-detail-buy');
        if(buy)buy.style.display='none';
        var status=sheet.querySelector('.market-detail-status');
        if(status)status.style.display='none';
      }catch(e){}
    }
    function cleanup(){
      try{var sheet=document.getElementById('marketDetailSheet');if(sheet&&!sheet.classList.contains('open'))sheet.classList.remove('vexa-fragment-detail')}catch(e){}
    }
    window.VexaPolishFragmentDetail=polishDetail;
    document.addEventListener('click',function(){setTimeout(polishDetail,120);setTimeout(cleanup,500)},true);
    document.addEventListener('keydown',function(){setTimeout(cleanup,120)},true);
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){addStyle();setTimeout(polishDetail,600)});else{addStyle();setTimeout(polishDetail,600)}
    setInterval(function(){polishDetail();cleanup()},1200);
  }catch(e){}
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
    return new Response(html.replace('</body>', `<script>${DETAIL_POLISH_SCRIPT}</script></body>`), { status: response.status, headers });
  },
};