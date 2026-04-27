import { loadConfig } from './config';
import { handleBuilderCallback, handleBuilderMessage } from './builder/handler';
import { handleCustomerMessage } from './customer/handler';
import { ensureSchema } from './db';
import { getMe, mainMenuKeyboard, parseUpdate, sendMessage, setWebhook, telegramApi } from './telegram';
import type { Env, TelegramMessage } from './types';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const config = loadConfig(env, request);
      const url = new URL(request.url);

      if (request.method === 'GET' && url.pathname === '/') {
        return json({ ok: true, service: 'AI Builder TEL v2' });
      }

      if (request.method === 'GET' && url.pathname === '/health') {
        await ensureSchema(env);
        return json({ ok: true });
      }

      if ((request.method === 'POST' || request.method === 'GET') && (url.pathname === '/setup' || url.pathname === '/debug/set-webhook')) {
        const schema = await safeEnsureSchema(env);
        const result = await setWebhook(config.telegramBotToken, config.publicWebhookBase);
        return json({ ok: result.ok, result, schema, webhook: `${config.publicWebhookBase}/telegram/core` }, result.ok ? 200 : 502);
      }

      if (request.method === 'GET' && url.pathname === '/debug/telegram') {
        const me = await getMe(config.telegramBotToken);
        const webhook = await telegramApi<{ result?: unknown }>(config.telegramBotToken, 'getWebhookInfo', {});
        return json({ ok: Boolean(me), me, webhook });
      }

      if (request.method === 'POST' && isTelegramPath(url.pathname)) {
        const update = parseUpdate(await request.json());
        const route = getTelegramRoute(url.pathname);

        if (route.kind === 'core') {
          const message = update.message ?? update.edited_message;
          if (message && isCoreStart(message)) {
            await safeCoreStart(config.telegramBotToken, message);
            await safeEnsureSchema(env);
            return json({ ok: true, route: 'core', safeStart: true });
          }
          if (update.callback_query) await handleBuilderCallback(env, config, update.callback_query);
          if (message) await handleBuilderMessage(env, config, message);
          return json({ ok: true, route: 'core' });
        }

        const message = update.message ?? update.edited_message;
        if (message) await handleCustomerMessage(env, config, route.username, message);
        return json({ ok: true, route: route.username });
      }

      return json({ ok: false, error: 'not_found' }, 404);
    } catch (error) {
      return json({ ok: false, error: error instanceof Error ? error.message : 'internal_error' }, 500);
    }
  }
};

async function safeEnsureSchema(env: Env): Promise<{ ok: boolean; error?: string }> {
  try {
    await ensureSchema(env);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'schema_error' };
  }
}

async function safeCoreStart(token: string, message: TelegramMessage): Promise<void> {
  await sendMessage(token, {
    chatId: message.chat.id,
    text: ['⚡️ پنل ساخت ربات', '', '🔌 کانکت: اتصال ربات کاربر', '🤖 AI: تنظیم هوش مصنوعی ربات متصل', '✨ ساخت ربات بدون کدنویسی: هر چیزی می‌خوای بنویس تا ساخته شود'].join('\n'),
    replyMarkup: mainMenuKeyboard()
  });
}

function isCoreStart(message: TelegramMessage): boolean {
  const text = (message.text ?? '').trim();
  return ['/start', '/menu', 'start', 'منو'].includes(text);
}

function isTelegramPath(pathname: string): boolean {
  return pathname === '/telegram/core' || pathname === '/telegram/webhook' || pathname.startsWith('/telegram/');
}

function getTelegramRoute(pathname: string): { kind: 'core' } | { kind: 'customer'; username: string } {
  const clean = pathname.replace(/\/+$/, '');

  if (clean === '/telegram/core') return { kind: 'core' };
  if (clean === '/telegram/webhook' || clean === '/telegram/webhook/_core') return { kind: 'core' };

  const legacyPrefix = '/telegram/webhook/';
  if (clean.startsWith(legacyPrefix)) {
    const username = clean.slice(legacyPrefix.length).trim().toLowerCase().replace(/^@/, '');
    return username ? { kind: 'customer', username } : { kind: 'core' };
  }

  const prefix = '/telegram/';
  const username = clean.startsWith(prefix) ? clean.slice(prefix.length).trim().toLowerCase().replace(/^@/, '') : '';
  if (!username || username === 'core') return { kind: 'core' };
  return { kind: 'customer', username };
}

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}
