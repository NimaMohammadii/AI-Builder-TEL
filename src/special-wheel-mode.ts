import { adminUsersJson } from './admin-users';
import { formatTonAmount } from './admin-finance-controls';
import type { Env, TelegramCallbackQuery } from './types';

type TgApi = <T = unknown>(token: string, method: string, payload: unknown) => Promise<T>;
type AdminUser = Record<string, unknown>;

const STATE_KEY = 'admin:special-wheel-mode';

export async function isSpecialWheelEnabled(env: Env): Promise<boolean> {
  return (await env.BOT_CACHE.get(STATE_KEY).catch(() => null)) === 'on';
}

export async function setSpecialWheelEnabled(env: Env, enabled: boolean): Promise<void> {
  await env.BOT_CACHE.put(STATE_KEY, enabled ? 'on' : 'off');
}

function isBotAdmin(env: Env, userId: unknown): boolean {
  const admins = String(env.BOT_ADMIN ?? '').split(/[\s,;]+/).map((item) => item.trim()).filter(Boolean);
  return admins.includes(String(userId ?? ''));
}

export async function specialWheelStatusResponse(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId') || '';
  const enabled = await isSpecialWheelEnabled(env);
  return Response.json(
    { ok: true, active: enabled && !isBotAdmin(env, userId) },
    { headers: { 'cache-control': 'no-store, no-cache, must-revalidate' } },
  );
}

export async function sendSpecialWheelAdminHome(
  env: Env,
  token: string,
  chatId: number,
  tg: TgApi,
  userId: unknown,
  messageId?: number,
): Promise<boolean> {
  if (!isBotAdmin(env, userId)) return false;

  const [data, enabled] = await Promise.all([adminUsersJson(env), isSpecialWheelEnabled(env)]);
  const users = data.users as AdminUser[];
  const text = [
    '🛡 پنل مدیریت ربات گیم',
    '',
    `👥 تعداد کل کاربران: ${data.stats.total ?? users.length}`,
    `🟢 آنلاین: ${data.stats.online ?? 0}   ⚪️ غیرفعال: ${data.stats.inactive ?? 0}`,
    `💎 مجموع موجودی: ${formatTonAmount(data.stats.totalTonBalanceNano)} TON`,
    '',
    `🎡 صفحه موقت گردونه: ${enabled ? 'فعال ✅' : 'غیرفعال ❌'}`,
    '',
    'از منوی زیر بخش موردنظر را انتخاب کنید.',
  ].join('\n');

  const payload = {
    chat_id: chatId,
    text,
    reply_markup: {
      inline_keyboard: [
        [{
          text: enabled ? '❌ غیرفعال کردن صفحه گردونه' : '✅ فعال کردن صفحه گردونه',
          callback_data: `botadmin:specialwheel:${enabled ? 'off' : 'on'}`,
        }],
        [{ text: '👥 لیست کاربران', callback_data: 'botadmin:users:0' }],
        [{ text: '↩️ بخش کاربران برگشتی', callback_data: 'botadmin:returns' }],
        [{ text: '📊 آمار مالی و آنلاین', callback_data: 'botadmin:financestats' }],
        [{ text: '⚙️ حدود واریز/برداشت', callback_data: 'botadmin:financelimits' }],
        [{ text: '🌍 تنظیمات رجین', callback_data: 'botadmin:regionsettings' }],
        [{ text: '📣 پیام همگانی در چت ربات', callback_data: 'botadmin:askbroadcast' }],
      ],
    },
    disable_web_page_preview: true,
  };

  if (messageId) {
    const edited = await tg(token, 'editMessageText', { ...payload, message_id: messageId }).then(() => true).catch(() => false);
    if (edited) return true;
  }
  await tg(token, 'sendMessage', payload);
  return true;
}

export async function handleSpecialWheelAdminCallback(
  env: Env,
  token: string,
  q: TelegramCallbackQuery,
  tg: TgApi,
): Promise<boolean> {
  const data = q.data ?? '';
  if (data !== 'botadmin:home' && !data.startsWith('botadmin:specialwheel:')) return false;
  if (!isBotAdmin(env, q.from.id)) return true;

  const chatId = q.message?.chat.id ?? q.from.id;
  const messageId = q.message?.message_id;

  if (data === 'botadmin:home') {
    await tg(token, 'answerCallbackQuery', { callback_query_id: q.id }).catch(() => undefined);
    await sendSpecialWheelAdminHome(env, token, chatId, tg, q.from.id, messageId);
    return true;
  }

  const enabled = data.endsWith(':on');
  await setSpecialWheelEnabled(env, enabled);
  await tg(token, 'answerCallbackQuery', {
    callback_query_id: q.id,
    text: enabled ? 'صفحه گردونه برای کاربران فعال شد.' : 'صفحه گردونه غیرفعال شد.',
  }).catch(() => undefined);
  await sendSpecialWheelAdminHome(env, token, chatId, tg, q.from.id, messageId);
  return true;
}

export const SPECIAL_WHEEL_OVERLAY = `
<div id="specialWheelOverlay" aria-hidden="true">
  <style>
    #specialWheelOverlay{position:fixed;left:0;right:0;bottom:0;top:var(--special-wheel-header-height,92px);z-index:2147483646;display:none;align-items:center;justify-content:center;background:#000;color:#fff;padding:22px 24px calc(24px + env(safe-area-inset-bottom));box-sizing:border-box;overflow:hidden}
    #specialWheelOverlay.active{display:flex}
    body.special-wheel-active main.app>header.top{position:fixed!important;z-index:2147483647!important;left:0!important;right:0!important;top:0!important;width:100%!important;box-sizing:border-box!important;background:#000!important}
    body.special-wheel-active nav.tabs{visibility:hidden!important;pointer-events:none!important}
    #specialWheelOverlay .special-wheel-content{width:100%;max-width:520px;display:grid;justify-items:center;gap:30px;transform:translateY(-1.5vh)}
    #specialWheelOverlay .special-wheel-stage{position:relative;width:min(78vw,312px);aspect-ratio:1}
    #specialWheelOverlay .special-wheel-rotor{position:absolute;inset:0;border-radius:50%;overflow:hidden;background:conic-gradient(from -30deg,#f4efe6 0 60deg,#171717 60deg 120deg,#d7c7ae 120deg 180deg,#0b0b0b 180deg 240deg,#ece5da 240deg 300deg,#202020 300deg 360deg);border:1px solid rgba(255,255,255,.22);box-shadow:0 28px 72px rgba(0,0,0,.62),inset 0 0 0 8px rgba(0,0,0,.2);will-change:transform;transform:rotate(0deg)}
    #specialWheelOverlay .special-wheel-rotor:after{content:"";position:absolute;inset:9px;border-radius:50%;border:1px solid rgba(255,255,255,.16);pointer-events:none}
    #specialWheelOverlay .special-wheel-prize{position:absolute;z-index:2;left:50%;top:50%;width:76px;margin-left:-38px;margin-top:-13px;text-align:center;color:#f7f2e9;font-family:Georgia,'Times New Roman',serif;font-size:12px;font-weight:700;line-height:1.05;letter-spacing:.035em;text-transform:uppercase;text-shadow:0 1px 5px rgba(0,0,0,.8);transform:rotate(var(--wheel-angle)) translateY(-112px) rotate(calc(-1 * var(--wheel-angle)))}
    #specialWheelOverlay .special-wheel-prize:nth-of-type(1),#specialWheelOverlay .special-wheel-prize:nth-of-type(3),#specialWheelOverlay .special-wheel-prize:nth-of-type(5){color:#111;text-shadow:none}
    #specialWheelOverlay .special-wheel-prize .gram-value{display:block;font-size:17px;font-weight:700;letter-spacing:-.02em;text-transform:none}
    #specialWheelOverlay .special-wheel-prize .gram-name{display:block;margin-top:2px;font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase}
    #specialWheelOverlay .special-wheel-prize.special-wheel-word{font-size:10px;line-height:1.15;letter-spacing:.08em}
    #specialWheelOverlay .special-wheel-hub{position:absolute;z-index:3;left:50%;top:50%;width:38px;height:38px;margin:-19px;border-radius:50%;background:#050505;border:1px solid rgba(255,255,255,.3);box-shadow:0 6px 20px rgba(0,0,0,.58),inset 0 1px 0 rgba(255,255,255,.14)}
    #specialWheelOverlay .special-wheel-pointer{position:absolute;z-index:6;left:50%;top:-3px;width:0;height:0;transform:translateX(-50%);border-left:11px solid transparent;border-right:11px solid transparent;border-top:24px solid #f5efe5;filter:drop-shadow(0 5px 8px rgba(0,0,0,.7))}
    #specialWheelOverlay .special-wheel-spin{width:min(78vw,320px);height:58px;border:1px solid rgba(255,255,255,.13);border-radius:18px;background:#3b0715;color:#f7e7eb;font-family:Georgia,'Times New Roman',serif;font-size:17px;font-weight:700;letter-spacing:.11em;text-transform:uppercase;box-shadow:0 12px 24px rgba(0,0,0,.52),inset 0 1px 0 rgba(255,255,255,.08);transition:transform .18s ease,opacity .18s ease}
    #specialWheelOverlay .special-wheel-spin:active{transform:scale(.975)}
    #specialWheelOverlay .special-wheel-spin:disabled{opacity:.62}
  </style>
  <div class="special-wheel-content">
    <div class="special-wheel-stage">
      <span class="special-wheel-pointer" aria-hidden="true"></span>
      <div class="special-wheel-rotor" data-special-wheel-rotor>
        <span class="special-wheel-prize" style="--wheel-angle:0deg"><span class="gram-value">9</span><span class="gram-name">Gram</span></span>
        <span class="special-wheel-prize special-wheel-word" style="--wheel-angle:60deg">NO PRIZE</span>
        <span class="special-wheel-prize" style="--wheel-angle:120deg"><span class="gram-value">4</span><span class="gram-name">Gram</span></span>
        <span class="special-wheel-prize special-wheel-word" style="--wheel-angle:180deg">SPIN AGAIN</span>
        <span class="special-wheel-prize" style="--wheel-angle:240deg"><span class="gram-value">0.5</span><span class="gram-name">Gram</span></span>
        <span class="special-wheel-prize special-wheel-word" style="--wheel-angle:300deg">NO PRIZE</span>
        <i class="special-wheel-hub" aria-hidden="true"></i>
      </div>
    </div>
    <button class="special-wheel-spin" type="button" data-special-wheel-spin>Spin</button>
  </div>
</div>
<script>
(function(){
  var overlay=document.getElementById('specialWheelOverlay');
  if(!overlay)return;
  var rotor=overlay.querySelector('[data-special-wheel-rotor]');
  var button=overlay.querySelector('[data-special-wheel-spin]');
  var rotation=0;
  var spinning=false;
  function userId(){
    try{return String(window.Telegram&&Telegram.WebApp&&Telegram.WebApp.initDataUnsafe&&Telegram.WebApp.initDataUnsafe.user&&Telegram.WebApp.initDataUnsafe.user.id||'')}catch(e){return ''}
  }
  function syncHeaderHeight(){
    var header=document.querySelector('main.app>header.top');
    if(!header)return;
    var height=Math.max(72,Math.ceil(header.getBoundingClientRect().bottom));
    overlay.style.setProperty('--special-wheel-header-height',height+'px');
  }
  function apply(active){
    overlay.classList.toggle('active',!!active);
    overlay.setAttribute('aria-hidden',active?'false':'true');
    document.body.classList.toggle('special-wheel-active',!!active);
    if(active)syncHeaderHeight();
    document.documentElement.style.overflow=active?'hidden':'';
    document.body.style.overflow=active?'hidden':'';
  }
  async function refresh(){
    try{
      var response=await fetch('/app/api/special-wheel-mode?userId='+encodeURIComponent(userId())+'&t='+Date.now(),{cache:'no-store'});
      if(!response.ok)return;
      var data=await response.json();
      apply(data.active===true);
    }catch(e){}
  }
  if(button&&rotor){
    button.addEventListener('click',function(){
      if(spinning)return;
      spinning=true;
      button.disabled=true;
      rotation+=1440+Math.floor(Math.random()*360);
      rotor.style.transition='transform 4.2s cubic-bezier(.12,.72,.08,1)';
      rotor.style.transform='rotate('+rotation+'deg)';
      setTimeout(function(){spinning=false;button.disabled=false},4300);
    });
  }
  window.addEventListener('resize',syncHeaderHeight);
  refresh();
  setInterval(refresh,2000);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)refresh()});
})();
</script>`;
