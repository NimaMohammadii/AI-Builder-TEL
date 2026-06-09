import type { Hono } from 'hono';
import type { Env } from './types';
import { getReferralDashboard, registerReferral } from './referrals';
import { gameBotToken } from './utils';

type PreparedInlineMessageResponse = { ok: boolean; result?: { id?: string }; description?: string };

export function registerReferralRoutes(app: Hono<{ Bindings: Env }>): void {
  app.get('/app/api/referral', async (c) => {
    try {
      const userId = c.req.query('userId') || '';
      return c.json(await getReferralDashboard(c.env, userId), 200, { 'cache-control': 'no-store' });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Could not load referral data' }, 400, { 'cache-control': 'no-store' });
    }
  });

  app.post('/app/api/referral/claim', async (c) => {
    try {
      const body = await c.req.json() as { userId?: unknown; ref?: unknown; referrerId?: unknown };
      const referrerId = body.referrerId ?? body.ref;
      return c.json(await registerReferral(c.env, body.userId, referrerId), 200, { 'cache-control': 'no-store' });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Could not register referral' }, 400, { 'cache-control': 'no-store' });
    }
  });

  app.post('/app/api/referral/share', async (c) => {
    try {
      const body = await c.req.json() as { userId?: unknown; name?: unknown };
      const userId = cleanReferralUserId(body.userId);
      const name = cleanReferralName(body.name);
      const inviteUrl = await referralMiniAppUrl(c.env, userId);
      const messageText = `<b>🚀 Join me on Vexa FLOW</b>\n\n🎁 Play TON games, unlock rewards, and start earning.\n\n🤖 Tap the button below to open the app.`;
      const fallbackText = `${name} invited you to Vexa FLOW. Open the app and start playing TON games.`;
      const token = gameBotToken(c.env);
      const numericUserId = Number(userId);
      if (!token || !Number.isSafeInteger(numericUserId) || numericUserId <= 0) throw new Error('Telegram share is available only inside Telegram.');
      const response = await telegramApiWithToken<PreparedInlineMessageResponse>(token, 'savePreparedInlineMessage', {
        user_id: numericUserId,
        result: {
          type: 'article',
          id: `ref_${userId}_${Date.now()}`.slice(0, 64),
          title: 'Invite to Vexa FLOW',
          description: 'Send a stylish invite with an Open App button.',
          input_message_content: {
            message_text: messageText,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          },
          reply_markup: {
            inline_keyboard: [[{ text: '🚀 Open Vexa App', url: inviteUrl }]],
          },
        },
        allow_user_chats: true,
        allow_bot_chats: false,
        allow_group_chats: true,
        allow_channel_chats: false,
      });
      if (!response.ok || !response.result?.id) throw new Error(response.description || 'Telegram could not prepare referral invite');
      return c.json({ ok: true, preparedMessageId: response.result.id, inviteUrl, fallbackText }, 200, { 'cache-control': 'no-store' });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Could not prepare referral invite' }, 400, { 'cache-control': 'no-store' });
    }
  });
}

function cleanReferralUserId(value: unknown): string {
  const userId = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
  if (!userId) throw new Error('Telegram user not found');
  return userId;
}

function cleanReferralName(value: unknown): string {
  const name = String(value || 'A friend').replace(/[<>]/g, '').trim().slice(0, 80);
  return name || 'A friend';
}

async function referralMiniAppUrl(env: Env, userId: string): Promise<string> {
  const username = await getGameBotUsername(env);
  const shortName = String(env.TELEGRAM_MINI_APP_SHORT_NAME || '').replace(/[^0-9A-Za-z_]/g, '').trim();
  const appPath = shortName ? `/${shortName}` : '';
  return `https://t.me/${username}${appPath}?startapp=${encodeURIComponent(`ref_${userId}`)}`;
}

async function getGameBotUsername(env: Env): Promise<string> {
  const configured = String(env.GAME_BOT_USERNAME || '').replace(/^@/, '').replace(/[^0-9A-Za-z_]/g, '').trim();
  if (configured) return configured;
  const token = gameBotToken(env);
  if (!token) throw new Error('Telegram bot token is not configured');
  const tokenId = String(token).split(':')[0].replace(/[^0-9A-Za-z_-]/g, '') || 'default';
  const cacheKey = `telegram:game-bot-username:${tokenId}`;
  const cached = await env.BOT_CACHE.get(cacheKey).catch(() => null);
  if (cached) return cached;
  const response = await telegramApiWithToken<{ ok: boolean; result?: { username?: string }; description?: string }>(token, 'getMe', {});
  const username = String(response.result?.username || '').replace(/^@/, '').replace(/[^0-9A-Za-z_]/g, '').trim();
  if (!response.ok || !username) throw new Error(response.description || 'Telegram bot username is not available');
  await env.BOT_CACHE.put(cacheKey, username, { expirationTtl: 86400 }).catch(() => undefined);
  return username;
}

async function telegramApiWithToken<T>(token: string, method: string, payload: unknown): Promise<T> {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  return response.json() as Promise<T>;
}
