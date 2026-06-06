import app from './index-with-tgs-overlay';
import './predict-candle-routes';
import './predict-extra-market-routes';
import './predict-routes';
import './predict-entry-loader-routes';
import './section-lock-event-routes';
import './crash-routes';
import './slot-frame';
import { createStarsDeposit, handleStarsSuccessfulPayment, listUserStarsDeposits } from './stars-deposits';
import type { Env, TelegramUpdate } from './types';

export { SectionLockEvents } from './section-lock-events';

const DETAIL_POLISH_SCRIPT = `
(function(){
  try{
    function addStyle(){
      if(document.getElementById('vexa-fragment-detail-polish'))return;
      var style=document.createElement('style');
      style.id='vexa-fragment-detail-polish';
      style.textContent='#market .market-nft-card,#market .market-owned-card{background:rgba(255,255,255,.04)!important;background-image:none!important;box-shadow:0 22px 58px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.12)!important}#market .market-nft-card:before{background:linear-gradient(135deg,rgba(255,255,255,.18),transparent 32%,rgba(255,255,255,.06) 74%,transparent)!important;opacity:.30!important;mix-blend-mode:normal!important}#market .market-nft-art:after,#market [class*="market-nft-art-"]:after{background:radial-gradient(circle at 28% 18%,rgba(255,255,255,.08),transparent 24%)!important}#market .market-loading-orb{width:34px!important;height:34px!important;background:transparent!important;filter:none!important}#market .market-loading-orb:before{inset:0!important;border:2px solid rgba(255,255,255,.22)!important;border-top-color:#fff!important;animation:marketSpin .8s linear infinite!important}#market .market-loading-orb:after{inset:10px!important;border:0!important;background:#fff!important;opacity:.9!important;animation:none!important}#market .market-loading-gem{display:none!important}#marketDetailSheet.vexa-fragment-detail .market-detail-buy{display:none!important}#marketDetailSheet.vexa-fragment-detail .market-detail-status{display:none!important}#marketDetailSheet.vexa-fragment-detail .market-detail-price,#marketDetailSheet.vexa-fragment-detail [data-market-detail-price]{color:#fff!important;text-shadow:none!important;-webkit-text-fill-color:#fff!important}#marketDetailSheet.vexa-fragment-detail .market-detail-price *{color:#fff!important;text-shadow:none!important;-webkit-text-fill-color:#fff!important;filter:none!important}#marketDetailSheet.vexa-fragment-detail .market-detail-price img.market-price-icon{width:34px!important;height:34px!important;object-fit:contain!important;filter:none!important;opacity:.98!important}';
      document.head.appendChild(style);
    }
    function isMarketActive(){
      var market=document.getElementById('market');
      var sheet=document.getElementById('marketDetailSheet');
      return !!((market&&market.classList.contains('active'))||(sheet&&sheet.classList.contains('open')));
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
    setInterval(function(){if(!isMarketActive())return;polishDetail();cleanup()},1200);
  }catch(e){}
})();
`;

async function handleFastTelegramUpdate(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);
  if (request.method !== 'POST' || (url.pathname !== '/telegram' && url.pathname !== '/telegram/webhook')) return null;
  const update = await request.clone().json().catch(() => null) as TelegramUpdate | null;
  if (!update) return null;
  const query = update.pre_checkout_query;
  if (query) {
    const payload = String(query.invoice_payload || '').trim();
    const amount = Math.floor(Number(query.total_amount));
    const ok = /^stars_[0-9a-f]{20}$/.test(payload) && query.currency === 'XTR' && Number.isSafeInteger(amount) && amount >= 1 && amount <= 100000;
    return Response.json({
      method: 'answerPreCheckoutQuery',
      pre_checkout_query_id: query.id,
      ok,
      error_message: ok ? undefined : 'Payment request is no longer valid.',
    });
  }
  const done = update.message?.successful_payment;
  if (done) {
    const userId = update.message?.from?.id ?? update.message?.chat.id ?? '';
    await handleStarsSuccessfulPayment(env, userId, done);
    return Response.json({ ok: true });
  }
  return null;
}

function handleTonConnectManifest(request: Request): Response | null {
  const url = new URL(request.url);
  if (url.pathname !== '/tonconnect-manifest.json' && url.pathname !== '/app/api/tonconnect-manifest.json') return null;
  const origin = url.origin;
  return Response.json({
    url: `${origin}/app`,
    name: 'Vexa FLOW',
    iconUrl: `${origin}/app/api/credit-icon.png`,
  }, {
    headers: {
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
      'content-type': 'application/json; charset=utf-8',
    },
  });
}

async function handleStarsDepositRoute(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);
  if (url.pathname !== '/app/api/stars/deposits') return null;
  try {
    if (request.method === 'POST') {
      const body = await request.json().catch(() => ({})) as { userId?: string; stars?: unknown };
      return Response.json(await createStarsDeposit(env, String(body.userId || ''), body.stars), { headers: { 'cache-control': 'no-store' } });
    }
    if (request.method === 'GET') {
      return Response.json(await listUserStarsDeposits(env, String(url.searchParams.get('userId') || '')), { headers: { 'cache-control': 'no-store' } });
    }
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Stars deposit failed' }, { status: 400, headers: { 'cache-control': 'no-store' } });
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const manifestRoute = handleTonConnectManifest(request);
    if (manifestRoute) return manifestRoute;
    const starsRoute = await handleStarsDepositRoute(request, env);
    if (starsRoute) return starsRoute;
    const fastResponse = await handleFastTelegramUpdate(request, env).catch((error) => {
      console.error('fast telegram update failed', error);
      return Response.json({ ok: true, recovered: true });
    });
    if (fastResponse) return fastResponse;
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
