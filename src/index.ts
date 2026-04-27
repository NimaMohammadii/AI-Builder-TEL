import { loadConfig } from './config';
import { handleBuilderCallback, handleBuilderMessage } from './builder/handler';
import { handleCustomerMessage } from './customer/handler';
import { ensureSchema } from './db';
import { parseUpdate, setWebhook } from './telegram';
import type { Env } from './types';

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
        await ensureSchema(env);
        const result = await setWebhook(config.telegramBotToken, config.publicWebhookBase);
        return json({ ok: result.ok, result, webhook: `${config.publicWebhookBase}/telegram/core` }, result.ok ? 200 : 502);
      }

      if (request.method === 'POST' && isTelegramPath(url.pathname)) {
        const update = parseUpdate(await request.json());
        const route = getTelegramRoute(url.pathname);

        if (route.kind === 'core') {
          if (update.callback_query) await handleBuilderCallback(env, config, update.callback_query);
          const message = update.message ?? update.edited_message;
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

function isTelegramPath(pathname: string): boolean {
  return pathname === '/telegram/core' || pathname === '/telegram/webhook' || pathname.startsWith('/telegram/');
}

function getTelegramRoute(pathname: string): { kind: 'core' } | { kind: 'customer'; username: string } {
  const clean = pathname.replace(/\/+$/, '');

  // New core route.
  if (clean === '/telegram/core') return { kind: 'core' };

  // Legacy core routes from the old project. These must keep working so the bot does not go silent after rebuilds.
  if (clean === '/telegram/webhook' || clean === '/telegram/webhook/_core') return { kind: 'core' };

  // Legacy customer route: /telegram/webhook/<bot_username>
  const legacyPrefix = '/telegram/webhook/';
  if (clean.startsWith(legacyPrefix)) {
    const username = clean.slice(legacyPrefix.length).trim().toLowerCase().replace(/^@/, '');
    return username ? { kind: 'customer', username } : { kind: 'core' };
  }

  // New customer route: /telegram/<bot_username>
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
