import app from './index-with-transactions';
import type { Env } from './types';

const LOTTIE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js';
const TGS_OVERLAY_SCRIPT = `
(function(){
  try {
    var creditLogo='/app/api/uploaded-image/credit-icon.png';
    var fallbackCreditLogo='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"%3E%3Cdefs%3E%3CradialGradient id="g" cx="32%25" cy="24%25" r="70%25"%3E%3Cstop offset="0" stop-color="%23ffffff"/%3E%3Cstop offset=".34" stop-color="%23ffd7e4"/%3E%3Cstop offset=".72" stop-color="%23ff2e63"/%3E%3Cstop offset="1" stop-color="%235b0f24"/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx="32" cy="32" r="28" fill="url(%23g)"/%3E%3Ccircle cx="32" cy="32" r="21" fill="none" stroke="rgba(255,255,255,.72)" stroke-width="3"/%3E%3Cpath d="M35 17 24 35h9l-4 12 13-20h-9l2-10Z" fill="white"/%3E%3C/svg%3E';
    var detailInfoCache={};
    function injectStyle(){
      if(document.getElementById('vexa-fragment-detail-style'))return;
      var style=document.createElement('style');
      style.id='vexa-fragment-detail-style';
      style.textContent='#market .market-detail-backdrop{background:rgba(0,0,0,.12)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}#market .market-detail-card{border:0!important;box-shadow:0 30px 92px rgba(0,0,0,.56),0 0 42px rgba(255,46,99,.09),inset 0 1px 0 rgba(255,255,255,.12)!important;background:rgba(255,255,255,.07)!important;-webkit-backdrop-filter:blur(14px) saturate(1.28)!important;backdrop-filter:blur(14px) saturate(1.28)!important}#market .market-detail-title-main{display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:12px!important;width:100%!important}#market .market-detail-titlebar{align-items:flex-start!important}#market .market-detail-thumb{width:148px!important;height:148px!important;border-radius:28px!important;align-self:center!important;margin:0 auto 2px!important}#market .market-detail-heading{width:100%!important;text-align:left!important}#market .market-detail-kicker{max-width:220px!important}#market .market-detail-titlebar h3{max-width:235px!important;font-size:28px!important}.vexa-fragment-detail-number{display:block;margin-top:5px;color:rgba(255,255,255,.55);font-size:14px;font-weight:650;letter-spacing:-.02em}#market .market-detail-specs.vexa-fragment-specs{grid-template-columns:1fr!important;gap:0!important;border-radius:18px!important;overflow:hidden!important;background:rgba(0,0,0,.16)!important;box-shadow:none!important}#market .market-detail-specs.vexa-fragment-specs .market-detail-spec{display:grid!important;grid-template-columns:96px 1fr auto!important;align-items:center!important;gap:8px!important;border-radius:0!important;min-height:42px!important;padding:9px 12px!important;background:transparent!important;border-bottom:1px solid rgba(255,255,255,.07)!important;box-shadow:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}#market .market-detail-specs.vexa-fragment-specs .market-detail-spec:last-child{border-bottom:0!important}#market .market-detail-specs.vexa-fragment-specs .market-detail-spec span{font-size:13px!important;text-transform:none!important;letter-spacing:0!important;color:rgba(255,255,255,.58)!important}#market .market-detail-specs.vexa-fragment-specs .market-detail-spec b{margin:0!important;font-size:14px!important;color:#fff!important}.vexa-fragment-percent{display:inline-flex;align-items:center;justify-content:center;min-width:32px;height:22px;padding:0 8px;border-radius:999px;background:rgba(45,148,255,.20);color:#7ec8ff;font-size:12px;font-weight:800}@media(max-width:380px){#market .market-detail-thumb{width:132px!important;height:132px!important}#market .market-detail-titlebar h3{font-size:24px!important;max-width:210px!important}}';
      document.head.appendChild(style);
    }
    function tgsUrlFromImage(src){
      try {
        var url = new URL(String(src || ''), location.href);
        if (url.hostname !== 'nft.fragment.com') return '';
        if (url.pathname.indexOf('/gift/') !== 0) return '';
        var clean = url.origin + url.pathname;
        clean = clean.replace(/\.(large|medium|small|thumb)(?=\.(?:png|jpg|jpeg|webp)$)/i, '');
        if (!/\.(png|jpg|jpeg|webp)$/i.test(clean)) return '';
        return clean.replace(/\.(png|jpg|jpeg|webp)$/i, '.tgs');
      } catch (e) { return ''; }
    }
    function giftKeyFromImage(src){
      try{var url=new URL(String(src||''),location.href);var name=(url.pathname.split('/').pop()||'').replace(/\.(large|medium|small|thumb)?\.(png|jpg|jpeg|webp)$/i,'').replace(/\.(png|jpg|jpeg|webp)$/i,'');return name}catch(e){return ''}
    }
    function addDetailOverlay(box, tgsUrl){
      if (!box || !tgsUrl || box.querySelector('[data-vexa-tgs-frame]')) return;
      box.style.position = 'relative';
      var frame = document.createElement('iframe');
      frame.setAttribute('data-vexa-tgs-frame', '1');
      frame.setAttribute('aria-hidden', 'true');
      frame.setAttribute('tabindex', '-1');
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin');
      frame.style.position = 'absolute';
      frame.style.inset = '0';
      frame.style.width = '100%';
      frame.style.height = '100%';
      frame.style.border = '0';
      frame.style.zIndex = '4';
      frame.style.pointerEvents = 'none';
      frame.style.background = 'transparent';
      frame.src = '/app/tgs-frame?url=' + encodeURIComponent(tgsUrl);
      frame.onerror = function(){ try { frame.remove(); } catch(e) {} };
      box.appendChild(frame);
    }
    function scanDetailTgs(){
      try {
        injectStyle();
        var sheet = document.getElementById('marketDetailSheet');
        if (!sheet || !sheet.classList.contains('open')) return;
        var box = sheet.querySelector('[data-market-detail-media]');
        if (!box) return;
        var img = box.querySelector('img[src*="nft.fragment.com/gift/"]');
        if (!img) return;
        var tgsUrl = tgsUrlFromImage(img.getAttribute('src') || img.src || '');
        addDetailOverlay(box, tgsUrl);
        polishDetailSheet(sheet,img);
      } catch (e) {}
    }
    function parseTelegramMeta(text){
      var raw=String(text||'');
      var number=(raw.match(/#\s*\d+/)||[])[0]||'';
      var price=(raw.match(/\d+(?:\.\d+)?\s*TON/i)||[])[0]||'';
      return {number:number.replace(/\s+/g,''),price:price.replace(/\s+/g,' ').trim()};
    }
    function priceButton(price){
      var span=document.createElement('span');
      span.className='market-price-button vexa-fragment-price';
      var img=document.createElement('img');
      img.src=creditLogo;img.alt='';img.decoding='async';
      img.onerror=function(){this.onerror=null;this.src=fallbackCreditLogo};
      var b=document.createElement('b');b.textContent=price||'TON NFT';
      span.appendChild(img);span.appendChild(b);
      return span;
    }
    function polishFragmentCards(){
      try{
        var cards=document.querySelectorAll('.market-nft-card[data-market-source="telegram"]');
        for(var i=0;i<cards.length;i++){
          var card=cards[i];
          if(card.getAttribute('data-fragment-polished')==='1')continue;
          var info=card.querySelector('.market-nft-info');
          var meta=card.querySelector('.market-owned-meta');
          if(!info||!meta)continue;
          var parsed=parseTelegramMeta(meta.textContent||'');
          meta.textContent=parsed.number||'';
          meta.style.fontSize='12px';
          meta.style.opacity='.62';
          meta.style.marginTop='-2px';
          meta.style.display=parsed.number?'block':'none';
          if(!card.querySelector('.vexa-fragment-price'))info.appendChild(priceButton(parsed.price));
          card.setAttribute('data-fragment-polished','1');
        }
      }catch(e){}
    }
    function polishDetailSheet(sheet,img){
      try{
        var desc=sheet.querySelector('[data-market-detail-description]');
        var parsed=parseTelegramMeta(desc&&desc.textContent||'');
        if(desc)desc.textContent=[parsed.number,parsed.price].filter(Boolean).join(' · ');
        var heading=sheet.querySelector('.market-detail-heading');
        if(heading&&parsed.number&&!heading.querySelector('.vexa-fragment-detail-number')){var small=document.createElement('span');small.className='vexa-fragment-detail-number';small.textContent=parsed.number;heading.appendChild(small)}
        var collection=sheet.querySelector('[data-market-detail-collection]');if(collection)collection.textContent='Telegram Gift';
        var key=giftKeyFromImage(img.getAttribute('src')||img.src||'');
        if(key)loadGiftInfo(key).then(function(info){applyGiftInfo(sheet,info)}).catch(function(){});
      }catch(e){}
    }
    function loadGiftInfo(key){
      if(detailInfoCache[key])return detailInfoCache[key];
      detailInfoCache[key]=fetch('/app/api/fragment-gift-info?key='+encodeURIComponent(key),{cache:'force-cache'}).then(function(r){if(!r.ok)throw new Error('info');return r.json()});
      return detailInfoCache[key];
    }
    function specHtml(label,value,percent){return '<div class="market-detail-spec"><span>'+label+'</span><b>'+String(value||'-')+'</b>'+(percent?'<i class="vexa-fragment-percent">'+String(percent)+'</i>':'')+'</div>'}
    function applyGiftInfo(sheet,info){
      try{
        if(!info||!info.ok)return;
        var specs=sheet.querySelector('[data-market-detail-specs]');
        if(specs){specs.classList.add('vexa-fragment-specs');specs.innerHTML=specHtml('Model',info.model&&info.model.name,info.model&&info.model.percent)+specHtml('Backdrop',info.backdrop&&info.backdrop.name,info.backdrop&&info.backdrop.percent)+specHtml('Symbol',info.symbol&&info.symbol.name,info.symbol&&info.symbol.percent)}
      }catch(e){}
    }
    window.VexaMountTgsDetail = scanDetailTgs;
    window.VexaPolishFragmentCards = polishFragmentCards;
    document.addEventListener('click', function(){ setTimeout(scanDetailTgs, 160); setTimeout(polishFragmentCards, 220); }, true);
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){injectStyle();setTimeout(polishFragmentCards,900)});else {injectStyle();setTimeout(polishFragmentCards,900)}
    setInterval(polishFragmentCards,2500);
  } catch (e) {}
})();
`;

app.get('/app/api/fragment-gift-info', async (c) => {
  try {
    const key = validateGiftKey(c.req.query('key') || '');
    const url = `https://fragment.com/gift/${key}`;
    const response = await fetch(url, {
      headers: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
        'user-agent': 'Mozilla/5.0 TelegramMiniApp Fragment Gift Info',
      },
      cf: { cacheTtl: 1800, cacheEverything: true } as never,
    });
    if (!response.ok) return c.json({ ok: false, error: `Fragment failed: ${response.status}` }, 200, { 'cache-control': 'no-store' });
    const html = await response.text();
    return c.json({ ok: true, ...parseFragmentGiftInfo(html) }, 200, { 'cache-control': 'public, max-age=1800' });
  } catch (error) {
    return c.json({ ok: false, error: error instanceof Error ? error.message : 'Gift info failed' }, 200, { 'cache-control': 'no-store' });
  }
});

app.get('/app/api/tgs-json', async (c) => {
  try {
    const url = validateTgsUrl(c.req.query('url') || '');
    const response = await fetch(url, {
      headers: {
        accept: 'application/octet-stream,*/*;q=0.8',
        'user-agent': 'Mozilla/5.0 TelegramMiniApp TGS Renderer',
      },
      cf: { cacheTtl: 3600, cacheEverything: true } as never,
    });
    if (!response.ok) return c.json({ error: `TGS fetch failed: ${response.status}` }, 502, { 'cache-control': 'no-store' });
    const buffer = await response.arrayBuffer();
    const json = await ungzipText(buffer);
    return new Response(json, {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not decode TGS' }, 400, { 'cache-control': 'no-store' });
  }
});

app.get('/app/tgs-frame', async (c) => {
  try {
    const url = validateTgsUrl(c.req.query('url') || '');
    const apiUrl = `/app/api/tgs-json?url=${encodeURIComponent(url)}`;
    return c.html(tgsFrameHtml(apiUrl), 200, {
      'cache-control': 'private, max-age=600',
      'content-security-policy': "default-src 'none'; script-src https://cdnjs.cloudflare.com 'unsafe-inline'; connect-src 'self'; img-src 'self' data: https:; style-src 'unsafe-inline';",
    });
  } catch (error) {
    return c.html('', 400, { 'cache-control': 'no-store' });
  }
});

function validateGiftKey(raw: string): string {
  const key = String(raw || '').trim().toLowerCase();
  if (!/^[a-z0-9-]{3,80}$/.test(key)) throw new Error('Invalid gift key');
  return key;
}

function parseFragmentGiftInfo(html: string): { model: { name: string; percent: string }; backdrop: { name: string; percent: string }; symbol: { name: string; percent: string } } {
  return {
    model: parseAttr(html, 'Model'),
    backdrop: parseAttr(html, 'Backdrop'),
    symbol: parseAttr(html, 'Symbol'),
  };
}

function parseAttr(html: string, label: string): { name: string; percent: string } {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const row = html.match(new RegExp(`<[^>]*>\\s*${escaped}\\s*<\\/[^>]+>[\\s\\S]{0,500}`, 'i'))?.[0] || '';
  const text = cleanText(row);
  const withoutLabel = text.replace(new RegExp(`^\\s*${escaped}\\s*`, 'i'), '').trim();
  const percent = withoutLabel.match(/\d+(?:\.\d+)?%/)?.[0] || '';
  const name = withoutLabel.replace(/\d+(?:\.\d+)?%/g, '').trim();
  return { name, percent };
}

function cleanText(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
}

function validateTgsUrl(raw: string): string {
  const url = new URL(raw);
  if (url.protocol !== 'https:') throw new Error('Invalid TGS URL protocol');
  if (url.hostname !== 'nft.fragment.com') throw new Error('Invalid TGS host');
  if (!url.pathname.startsWith('/gift/')) throw new Error('Invalid TGS path');
  if (!url.pathname.endsWith('.tgs')) throw new Error('Invalid TGS extension');
  return url.toString();
}

async function ungzipText(buffer: ArrayBuffer): Promise<string> {
  if (typeof DecompressionStream === 'undefined') throw new Error('TGS decompression is unavailable');
  const stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).text();
}

function tgsFrameHtml(apiUrl: string): string {
  const safeApi = JSON.stringify(apiUrl);
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#root{margin:0;width:100%;height:100%;overflow:hidden;background:transparent}svg{width:100%!important;height:100%!important;display:block}</style></head><body><div id="root"></div><script src="${LOTTIE_CDN}"></script><script>(function(){try{fetch(${safeApi},{cache:'force-cache'}).then(function(r){if(!r.ok)throw new Error('json');return r.json()}).then(function(data){if(!window.lottie&&!window.bodymovin)throw new Error('lottie');(window.lottie||window.bodymovin).loadAnimation({container:document.getElementById('root'),renderer:'svg',loop:true,autoplay:true,animationData:data});}).catch(function(){document.body.innerHTML='';});}catch(e){document.body.innerHTML='';}})();</script></body></html>`;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const response = await app.fetch(request, env, ctx);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;
    const html = await response.text();
    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.set('cache-control', 'no-store');
    return new Response(html.replace('</body>', `<script>${TGS_OVERLAY_SCRIPT}</script></body>`), {
      status: response.status,
      headers,
    });
  },
};
