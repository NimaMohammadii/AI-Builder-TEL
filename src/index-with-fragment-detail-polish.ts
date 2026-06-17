import app from './index-with-tgs-overlay';
import './predict-candle-routes';
import './predict-extra-market-routes';
import './predict-routes';
import './predict-entry-loader-routes';
import './section-lock-event-routes';
import './vexa-voice-message-routes';
import './crash-routes';
import './slot-frame';
import { createStarsDeposit, handleStarsSuccessfulPayment, listUserStarsDeposits } from './stars-deposits';
import type { Env, TelegramUpdate, TelegramUser } from './types';
import { PUBLIC_BASE_URL, gameBotToken } from './utils';

export { SectionLockEvents } from './section-lock-events';

type RegionConfig = { code: string; label: string; language: string; timezone: string };
type TelegramMessageResult = { ok: boolean; result?: { message_id?: number }; description?: string };

const REGIONS: RegionConfig[] = [
  { code: 'US', label: '🇺🇸 United States', language: 'en', timezone: 'America/New_York' },
  { code: 'TR', label: '🇹🇷 Turkey', language: 'tr', timezone: 'Europe/Istanbul' },
  { code: 'DE', label: '🇩🇪 Germany', language: 'de', timezone: 'Europe/Berlin' },
  { code: 'AE', label: '🇦🇪 UAE', language: 'ar', timezone: 'Asia/Dubai' },
  { code: 'SA', label: '🇸🇦 Saudi Arabia', language: 'ar', timezone: 'Asia/Riyadh' },
  { code: 'RU', label: '🇷🇺 Russia', language: 'ru', timezone: 'Europe/Moscow' },
  { code: 'IN', label: '🇮🇳 India', language: 'en', timezone: 'Asia/Kolkata' },
  { code: 'BR', label: '🇧🇷 Brazil', language: 'pt', timezone: 'America/Sao_Paulo' },
  { code: 'IR', label: '🇮🇷 Iran', language: 'fa', timezone: 'Asia/Tehran' },
  { code: 'OTHER', label: '🌍 Other', language: 'en', timezone: 'UTC' },
];

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

async function handleGameBotRegionUpdate(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);
  if (request.method !== 'POST' || url.pathname !== '/telegram/game-webhook') return null;
  const update = await request.clone().json().catch(() => null) as TelegramUpdate | null;
  if (!update) return Response.json({ ok: true, ignored: true });
  const token = gameBotToken(env);
  const callback = update.callback_query;
  if (callback) {
    const chatId = callback.message?.chat.id ?? callback.from.id;
    const messageId = callback.message?.message_id ?? 0;
    const userId = String(callback.from.id);
    const data = callback.data || '';
    await telegram(token, 'answerCallbackQuery', { callback_query_id: callback.id }).catch(() => undefined);
    if (data.startsWith('region:')) {
      const region = regionByCode(data.slice('region:'.length));
      if (!region) {
        await sendRegionMenu(env, token, chatId, userId, 'Choose your region 🌍');
        return Response.json({ ok: true, bot: 'game', region: false });
      }
      await saveGameUserRegion(env, callback.from, region);
      await editOpenMiniAppMenu(env, token, chatId, userId, messageId, `Region saved: ${region.label}\nLanguage: ${region.language.toUpperCase()}\nTimezone: ${region.timezone}`);
      return Response.json({ ok: true, bot: 'game', region: region.code });
    }
    return Response.json({ ok: true, bot: 'game', ignored: true });
  }
  const message = update.message;
  const chatId = message?.chat.id;
  const user = message?.from;
  if (!chatId || !user?.id) return Response.json({ ok: true, ignored: true, bot: 'game' });
  const userId = String(user.id);
  const text = message.text?.trim() || '';
  await trackGameChatUser(env, user).catch(() => undefined);
  if (text === '/region') {
    await deleteTelegramMessage(token, chatId, message.message_id).catch(() => undefined);
    await sendRegionMenu(env, token, chatId, userId, 'Change your region 🌍');
    return Response.json({ ok: true, bot: 'game', command: 'region' });
  }
  const region = await getGameUserRegion(env, userId);
  if (!region || text === '/start') {
    await deleteTelegramMessage(token, chatId, message.message_id).catch(() => undefined);
    if (!region) await sendRegionMenu(env, token, chatId, userId, 'Choose your region 🌍');
    else await sendOpenMiniApp(env, token, chatId, userId, `Your region: ${region.label}\nUse /region to change it.`);
    return Response.json({ ok: true, bot: 'game', command: text || 'message' });
  }
  await sendOpenMiniApp(env, token, chatId, userId, 'Open the mini app.');
  return Response.json({ ok: true, bot: 'game' });
}

function regionByCode(code: string): RegionConfig | null {
  const cleaned = String(code || '').trim().toUpperCase();
  return REGIONS.find((region) => region.code === cleaned) || null;
}

async function ensureAppUserRegionColumns(env: Env): Promise<void> {
  await env.DB.prepare('ALTER TABLE app_users ADD COLUMN region_code TEXT').run().catch(() => undefined);
  await env.DB.prepare('ALTER TABLE app_users ADD COLUMN language_code TEXT').run().catch(() => undefined);
  await env.DB.prepare('ALTER TABLE app_users ADD COLUMN timezone TEXT').run().catch(() => undefined);
  await env.DB.prepare('ALTER TABLE app_users ADD COLUMN bot_menu_message_id INTEGER').run().catch(() => undefined);
}

async function trackGameChatUser(env: Env, user: TelegramUser): Promise<void> {
  await ensureAppUserRegionColumns(env);
  await env.DB.prepare(`INSERT INTO app_users (telegram_user_id, first_name, username, last_seen_at, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(telegram_user_id) DO UPDATE SET first_name = excluded.first_name, username = excluded.username, last_seen_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP`)
    .bind(String(user.id), cleanText(user.first_name, 120), cleanText(user.username, 80))
    .run();
}

async function getGameUserRegion(env: Env, userId: string): Promise<RegionConfig | null> {
  await ensureAppUserRegionColumns(env);
  const row = await env.DB.prepare('SELECT region_code FROM app_users WHERE telegram_user_id = ?').bind(userId).first<{ region_code: string | null }>().catch(() => null);
  return row?.region_code ? regionByCode(row.region_code) : null;
}

async function saveGameUserRegion(env: Env, user: TelegramUser, region: RegionConfig): Promise<void> {
  await ensureAppUserRegionColumns(env);
  await env.DB.prepare(`INSERT INTO app_users (telegram_user_id, first_name, username, region_code, language_code, timezone, current_section, last_seen_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'telegram_region', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(telegram_user_id) DO UPDATE SET first_name = excluded.first_name, username = excluded.username, region_code = excluded.region_code, language_code = excluded.language_code, timezone = excluded.timezone, current_section = 'telegram_region', last_seen_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP`)
    .bind(String(user.id), cleanText(user.first_name, 120), cleanText(user.username, 80), region.code, region.language, region.timezone)
    .run();
}

function cleanText(value: unknown, max: number): string | null {
  const text = String(value || '').replace(/[\u0000-\u001f<>]/g, '').trim();
  return text ? text.slice(0, max) : null;
}

async function sendRegionMenu(env: Env, token: string, chatId: number, userId: string, text: string): Promise<void> {
  const rows: Array<Array<{ text: string; callback_data: string }>> = [];
  for (let i = 0; i < REGIONS.length; i += 2) rows.push(REGIONS.slice(i, i + 2).map((region) => ({ text: region.label, callback_data: `region:${region.code}` })));
  await deleteLastGameMenu(env, token, chatId, userId);
  const sent = await telegram<TelegramMessageResult>(token, 'sendMessage', {
    chat_id: chatId,
    text: `${text}\n\nYou can change it anytime with /region.`,
    reply_markup: { inline_keyboard: rows },
  });
  await saveGameMenuMessageId(env, userId, sent.result?.message_id || 0);
}

async function sendOpenMiniApp(env: Env, token: string, chatId: number, userId: string, text: string): Promise<void> {
  await deleteLastGameMenu(env, token, chatId, userId);
  const sent = await telegram<TelegramMessageResult>(token, 'sendMessage', {
    chat_id: chatId,
    text,
    reply_markup: { inline_keyboard: [[{ text: 'Open Mini App', web_app: { url: `${PUBLIC_BASE_URL}/app` } }]] },
  });
  await saveGameMenuMessageId(env, userId, sent.result?.message_id || 0);
}

async function editOpenMiniAppMenu(env: Env, token: string, chatId: number, userId: string, messageId: number, text: string): Promise<void> {
  if (!messageId) return sendOpenMiniApp(env, token, chatId, userId, text);
  await deleteLastGameMenu(env, token, chatId, userId, messageId);
  const edited = await telegram<{ ok: boolean; description?: string }>(token, 'editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text,
    reply_markup: { inline_keyboard: [[{ text: 'Open Mini App', web_app: { url: `${PUBLIC_BASE_URL}/app` } }]] },
  });
  if (!edited.ok) return sendOpenMiniApp(env, token, chatId, userId, text);
  await saveGameMenuMessageId(env, userId, messageId);
}

async function deleteLastGameMenu(env: Env, token: string, chatId: number, userId: string, keepMessageId = 0): Promise<void> {
  await ensureAppUserRegionColumns(env);
  const row = await env.DB.prepare('SELECT bot_menu_message_id FROM app_users WHERE telegram_user_id = ?').bind(userId).first<{ bot_menu_message_id: number | null }>().catch(() => null);
  const oldMessageId = Math.floor(Number(row?.bot_menu_message_id || 0));
  if (oldMessageId > 0 && oldMessageId !== keepMessageId) await deleteTelegramMessage(token, chatId, oldMessageId).catch(() => undefined);
  if (oldMessageId !== keepMessageId) await saveGameMenuMessageId(env, userId, 0);
}

async function saveGameMenuMessageId(env: Env, userId: string, messageId: number): Promise<void> {
  await ensureAppUserRegionColumns(env);
  await env.DB.prepare(`INSERT INTO app_users (telegram_user_id, bot_menu_message_id, last_seen_at, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(telegram_user_id) DO UPDATE SET bot_menu_message_id = excluded.bot_menu_message_id, last_seen_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP`)
    .bind(userId, Math.max(0, Math.floor(Number(messageId) || 0)))
    .run();
}

async function deleteTelegramMessage(token: string, chatId: number, messageId: number): Promise<void> {
  if (!messageId) return;
  await telegram(token, 'deleteMessage', { chat_id: chatId, message_id: messageId });
}

function handleTonConnectManifest(request: Request): Response | null {
  const url = new URL(request.url);
  const origin = url.origin;
  if (url.pathname !== '/tonconnect-manifest.json' && url.pathname !== '/app/api/tonconnect-manifest.json') return null;
  return Response.json({ url: origin, name: 'Vexa FLOW', iconUrl: `${origin}/app/api/credit-icon.png` }, { headers: { 'cache-control': 'public, max-age=3600' } });
}

async function telegram<T = { ok: boolean; description?: string }>(token: string, method: string, payload: unknown): Promise<T> {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  return response.json() as Promise<T>;
}

app.fetch = async (request: Request, env: Env, ctx: ExecutionContext) => {
  const manifest = handleTonConnectManifest(request);
  if (manifest) return manifest;
  const fast = await handleFastTelegramUpdate(request, env);
  if (fast) return fast;
  const gameRegion = await handleGameBotRegionUpdate(request, env);
  if (gameRegion) return gameRegion;
  return app.request(request, env, ctx);
};

export default app;
