import type { Env } from './types';
import { getPlayZoneCardVisibility, isPlayZoneVisibilityAdmin, setPlayZoneCardVisibility } from './play-zone-card-visibility';

type Callback = { id: string; data?: string; from: { id: number }; message?: { message_id: number; chat: { id: number } } };
type Update = { callback_query?: Callback };
type Button = { text: string; callback_data: string };

export async function handlePlayZoneCardAdminRequest(request: Request, env: Env): Promise<Response | null> {
  if (request.method !== 'POST' || new URL(request.url).pathname !== '/telegram/webhook') return null;
  const update = await request.clone().json().catch(() => null) as Update | null;
  const callback = update?.callback_query;
  const data = String(callback?.data || '');
  if (!callback || (data !== 'botadmin:playcards' && !data.startsWith('botadmin:playcard:'))) return null;
  if (!env.BOT_TOKEN || !isPlayZoneVisibilityAdmin(env, callback.from.id)) return ok();
  await tg(env.BOT_TOKEN, 'answerCallbackQuery', { callback_query_id: callback.id }).catch(() => undefined);
  const chatId = callback.message?.chat.id ?? callback.from.id;
  const messageId = callback.message?.message_id;
  try {
    if (data.startsWith('botadmin:playcard:')) {
      const [, , gameId, action] = data.split(':');
      await setPlayZoneCardVisibility(env, gameId, action === 'show');
    }
    await sendMenu(env, env.BOT_TOKEN, chatId, messageId);
  } catch (error) {
    await tg(env.BOT_TOKEN, 'sendMessage', { chat_id: chatId, text: `❌ ${error instanceof Error ? error.message : 'ذخیره تنظیمات ناموفق بود.'}` }).catch(() => undefined);
  }
  return ok();
}

async function sendMenu(env: Env, token: string, chatId: number, messageId?: number): Promise<void> {
  const state = await getPlayZoneCardVisibility(env);
  const rows: Button[][] = state.cards.map((card) => [{
    text: `${card.visible ? '👁' : '🚫'} ${card.label} — ${card.visible ? 'نمایش' : 'مخفی'}`,
    callback_data: `botadmin:playcard:${card.id}:${card.visible ? 'hide' : 'show'}`,
  }]);
  rows.push([{ text: '⬅️ منوی اصلی', callback_data: 'botadmin:home' }]);
  await upsert(token, chatId, messageId, '🎮 نمایش کارت‌های Play Hub\n\nبا لمس هر بازی، کارت آن برای همه کاربران، از جمله ادمین، مخفی یا دوباره نمایش داده می‌شود.', rows);
}

async function upsert(token: string, chatId: number, messageId: number | undefined, text: string, keyboard: Button[][]): Promise<void> {
  const payload = { chat_id: chatId, text, reply_markup: { inline_keyboard: keyboard } };
  if (messageId && await tg(token, 'editMessageText', { ...payload, message_id: messageId }).then(() => true).catch(() => false)) return;
  await tg(token, 'sendMessage', payload);
}

async function tg(token: string, method: string, payload: unknown): Promise<unknown> {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  const result = await response.json().catch(() => ({})) as { ok?: boolean; description?: string };
  if (!response.ok || !result.ok) throw new Error(result.description || `Telegram ${method} failed`);
  return result;
}

function ok(): Response { return Response.json({ ok: true }, { headers: { 'cache-control': 'no-store' } }); }
