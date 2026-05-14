import app from './index-with-tgs-overlay';
import type { Env } from './types';

const DETAIL_POLISH_SCRIPT = `
(function(){
  try {
    var TON_SVG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"%3E%3Cpath fill="white" d="M10.7 13.5h42.6c3.3 0 5.4 3.6 3.7 6.4L35.6 52.8c-1.6 2.5-5.6 2.5-7.2 0L7 19.9c-1.7-2.8.4-6.4 3.7-6.4Zm4.8 7.1 13.4 20.6V20.6H15.5Zm19.6 0v20.6l13.4-20.6H35.1Zm-3.1 24 15.5-24h-31l15.5 24Z"/%3E%3C/svg%3E';
    function addStyle(){
      if(document.getElementById('vexa-fragment-detail-polish'))return;
      var style=document.createElement('style');
      style.id='vexa-fragment-detail-polish';
      style.textContent='@keyframes vexaDetailPop{0%{opacity:0;transform:translateY(24px) scale(.94);filter:blur(10px)}58%{opacity:1;transform:translateY(-3px) scale(1.012);filter:blur(0)}100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}}#marketDetailSheet.vexa-fragment-detail .market-detail-card{animation:vexaDetailPop .42s cubic-bezier(.18,.9,.22,1) both!important;transform-origin:center 58%!important}#marketDetailSheet.vexa-fragment-detail .market-detail-buy{display:none!important}#marketDetailSheet.vexa-fragment-detail .market-detail-status{display:none!important}#marketDetailSheet.vexa-fragment-detail .market-detail-price,#marketDetailSheet.vexa-fragment-detail [data-market-detail-price]{color:#fff!important;text-shadow:none!important;-webkit-text-fill-color:#fff!important}#marketDetailSheet.vexa-fragment-detail .market-detail-price *{color:#fff!important;text-shadow:none!important;-webkit-text-fill-color:#fff!important;filter:none!important}#marketDetailSheet.vexa-fragment-detail .market-detail-price img{width:24px!important;height:24px!important;object-fit:contain!important;filter:none!important;opacity:.96!important}#marketDetailSheet.vexa-fragment-detail .market-detail-price b,#marketDetailSheet.vexa-fragment-detail .market-detail-price strong,#marketDetailSheet.vexa-fragment-detail [data-market-detail-price]{font-weight:800!important;letter-spacing:-.02em!important}';
      document.head.appendChild(style);
    }
    function isFragmentDetail(sheet){
      if(!sheet||!sheet.classList.contains('open'))return false;
      return Boolean(sheet.querySelector('[data-market-detail-media] img[src*="nft.fragment.com/gift/"]'));
    }
    function polishDetail(){
      try {
        addStyle();
        var sheet=document.getElementById('marketDetailSheet');
        if(!isFragmentDetail(sheet))return;
        sheet.classList.add('vexa-fragment-detail');
        var priceRow=sheet.querySelector('.market-detail-price');
        if(priceRow){
          var imgs=priceRow.querySelectorAll('img');
          for(var i=0;i<imgs.length;i++){imgs[i].src=TON_SVG;imgs[i].alt='TON';}
        }
        var buy=sheet.querySelector('.market-detail-buy');
        if(buy)buy.style.display='none';
        var status=sheet.querySelector('.market-detail-status');
        if(status)status.style.display='none';
      } catch(e) {}
    }
    function cleanup(){
      try{var sheet=document.getElementById('marketDetailSheet');if(sheet&&!sheet.classList.contains('open'))sheet.classList.remove('vexa-fragment-detail')}catch(e){}
    }
    window.VexaPolishFragmentDetail = polishDetail;
    document.addEventListener('click',function(){setTimeout(polishDetail,120);setTimeout(cleanup,500)},true);
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
