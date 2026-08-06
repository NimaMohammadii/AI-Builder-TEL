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
    #specialWheelOverlay{position:fixed;inset:0;z-index:2147483646;display:none;align-items:center;justify-content:center;background:#000;color:#fff;padding:24px;box-sizing:border-box;overflow:hidden}
    #specialWheelOverlay.active{display:flex}
    #specialWheelOverlay .special-wheel-content{width:100%;max-width:520px;display:grid;justify-items:center;gap:34px;transform:translateY(-2vh)}
    #specialWheelOverlay .special-wheel-stage{position:relative;width:min(74vw,286px);aspect-ratio:1}
    #specialWheelOverlay .special-wheel-rotor{position:absolute;inset:0;border-radius:50%;overflow:hidden;background:conic-gradient(from -30deg,#f4f4f4 0 60deg,#181818 60deg 120deg,#d9d9d9 120deg 180deg,#101010 180deg 240deg,#bdbdbd 240deg 300deg,#080808 300deg 360deg);border:1px solid rgba(255,255,255,.22);box-shadow:0 26px 70px rgba(0,0,0,.58),inset 0 0 0 7px rgba(0,0,0,.18);will-change:transform;transform:rotate(0deg)}
    #specialWheelOverlay .special-wheel-rotor:after{content:"";position:absolute;inset:8px;border-radius:50%;border:1px solid rgba(255,255,255,.18);pointer-events:none}
    #specialWheelOverlay .special-wheel-prize{position:absolute;z-index:2;left:50%;top:50%;width:56px;margin-left:-28px;margin-top:-9px;text-align:center;color:#fff;font-size:12px;font-weight:900;text-shadow:0 1px 4px rgba(0,0,0,.72);transform:rotate(var(--wheel-angle)) translateY(-100px) rotate(calc(-1 * var(--wheel-angle)))}
    #specialWheelOverlay .special-wheel-prize:nth-of-type(1),#specialWheelOverlay .special-wheel-prize:nth-of-type(3),#specialWheelOverlay .special-wheel-prize:nth-of-type(5){color:#050505;text-shadow:none}
    #specialWheelOverlay .special-wheel-hub{position:absolute;z-index:3;left:50%;top:50%;width:34px;height:34px;margin:-17px;border-radius:50%;background:#050505;border:1px solid rgba(255,255,255,.28);box-shadow:0 5px 18px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.12)}
    #specialWheelOverlay .special-wheel-pointer{position:absolute;z-index:6;left:50%;top:-3px;width:0;height:0;transform:translateX(-50%);border-left:11px solid transparent;border-right:11px solid transparent;border-top:23px solid #fff;filter:drop-shadow(0 5px 8px rgba(0,0,0,.65))}
    #specialWheelOverlay .special-wheel-spin{width:min(78vw,320px);height:58px;border:1px solid rgba(255,255,255,.13);border-radius:18px;background:#3b0715;color:#ffdce5;font-size:18px;font-weight:900;letter-spacing:-.035em;box-shadow:0 12px 24px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.08);transition:transform .18s ease,opacity .18s ease}
    #specialWheelOverlay .special-wheel-spin:active{transform:scale(.975)}
    #specialWheelOverlay .special-wheel-spin:disabled{opacity:.62}
  </style>
  <div class="special-wheel-content">
    <div class="special-wheel-stage">
      <span class="special-wheel-pointer" aria-hidden="true"></span>
      <div class="special-wheel-rotor" data-special-wheel-rotor>
        <span class="special-wheel-prize" style="--wheel-angle:0deg">WIN</span>
        <span class="special-wheel-prize" style="--wheel-angle:60deg">LOSE</span>
        <span class="special-wheel-prize" style="--wheel-angle:120deg">WIN</span>
        <span class="special-wheel-prize" style="--wheel-angle:180deg">LOSE</span>
        <span class="special-wheel-prize" style="--wheel-angle:240deg">WIN</span>
        <span class="special-wheel-prize" style="--wheel-angle:300deg">LOSE</span>
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
  function apply(active){
    overlay.classList.toggle('active',!!active);
    overlay.setAttribute('aria-hidden',active?'false':'true');
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
  refresh();
  setInterval(refresh,2000);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)refresh()});
})();
</script>`;
