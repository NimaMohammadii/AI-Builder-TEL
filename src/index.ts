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

      if (request.method === 'POST' && url.pathname === '/setup') {
        await ensureSchema(env);
        const result = await setWebhook(config.telegramBotToken, config.publicWebhookBase);
        return json({ ok: result.ok, result, webhook: `${config.publicWebhookBase}/telegram/core` }, result.ok ? 200 : 502);
      }

      if (request.method === 'POST' && url.pathname.startsWith('/telegram/')) {
        const update = parseUpdate(await request.json());
        const route = url.pathname.slice('/telegram/'.length).trim().toLowerCase();

        if (route === 'core') {
          if (update.callback_query) await handleBuilderCallback(env, config, update.callback_query);
          const message = update.message ?? update.edited_message;
          if (message) await handleBuilderMessage(env, config, message);
          return json({ ok: true });
        }

        const message = update.message ?? update.edited_message;
        if (message) await handleCustomerMessage(env, config, route, message);
        return json({ ok: true });
      }

      return json({ ok: false, error: 'not_found' }, 404);
    } catch (error) {
      return json({ ok: false, error: error instanceof Error ? error.message : 'internal_error' }, 500);
    }
  }
};

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}
