import http from 'node:http';
import vm from 'node:vm';

const PORT = Number(process.env.PORT || 8788);
const RUNNER_SECRET = process.env.RUNNER_SECRET;

const json = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1024 * 1024) {
        reject(new Error('Body too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });

const safeError = (err) => (err && err.message ? String(err.message).slice(0, 300) : 'Execution failed');

const server = http.createServer(async (req, res) => {
  if (req.method !== 'POST' || req.url !== '/run-agent') {
    return json(res, 404, { ok: false, error: 'Not found' });
  }

  if (RUNNER_SECRET) {
    const auth = req.headers.authorization || '';
    if (auth !== `Bearer ${RUNNER_SECRET}`) {
      return json(res, 401, { ok: false, error: 'Unauthorized' });
    }
  }

  try {
    const raw = await readBody(req);
    const input = JSON.parse(raw || '{}');

    const { type, code, state: initialState, ctx: incomingCtx } = input;
    if (!['start', 'message', 'callback'].includes(type)) {
      return json(res, 400, { ok: false, error: 'Invalid type' });
    }
    if (typeof code !== 'string' || !code.trim()) {
      return json(res, 400, { ok: false, error: 'Invalid code' });
    }

    const actions = [];
    const state = initialState && typeof initialState === 'object' ? { ...initialState } : {};
    const baseCtx = incomingCtx && typeof incomingCtx === 'object' ? incomingCtx : {};

    const ctx = {
      text: baseCtx.text,
      data: baseCtx.data,
      userId: baseCtx.userId,
      chatId: baseCtx.chatId,
      message: baseCtx.message,
      callback: baseCtx.callback,
      reply(text, options = {}) {
        const replyMarkup = options.reply_markup || (
          Array.isArray(options.buttons) ? { inline_keyboard: options.buttons } : undefined
        );

        actions.push({
          method: 'sendMessage',
          payload: {
            chat_id: baseCtx.chatId,
            text,
            parse_mode: options.parse_mode,
            reply_markup: replyMarkup
          }
        });
      },
      answer(text) {
        if (baseCtx.callback && baseCtx.callback.id) {
          actions.push({
            method: 'answerCallbackQuery',
            payload: {
              callback_query_id: baseCtx.callback.id,
              text
            }
          });
        }
      },
      telegram(method, payload) {
        actions.push({ method, payload });
      },
      getState() {
        return state;
      },
      setState(next) {
        const obj = next && typeof next === 'object' ? next : {};
        for (const key of Object.keys(state)) delete state[key];
        Object.assign(state, obj);
      },
      patchState(partial) {
        if (partial && typeof partial === 'object') {
          Object.assign(state, partial);
        }
      },
      button(text, data) {
        return { text, callback_data: data };
      },
      urlButton(text, url) {
        return { text, url };
      },
      webAppButton(text, url) {
        return { text, web_app: { url } };
      },
      async fetchJson(url, init) {
        const r = await fetch(url, init);
        return r.json();
      }
    };

    const limitedConsole = {
      log: (...args) => console.log('[agent]', ...args),
      error: (...args) => console.error('[agent]', ...args)
    };

    const sandbox = vm.createContext({
      console: limitedConsole,
      URL,
      setTimeout,
      clearTimeout,
      fetch
    });

    const wrappedCode = `
      (async () => {
        const __factory = async () => {
${code}
        };
        return await __factory();
      })()
    `;

    const script = new vm.Script(wrappedCode, { filename: 'agent-code.vm.js' });
    const handlers = await script.runInContext(sandbox, { timeout: 1000 });

    if (!handlers || typeof handlers !== 'object') {
      return json(res, 400, { ok: false, error: 'Code must return handlers' });
    }

    const fn = type === 'start' ? handlers.onStart : type === 'message' ? handlers.onMessage : handlers.onCallback;
    if (typeof fn === 'function') {
      await fn(ctx);
    }

    return json(res, 200, { ok: true, state, actions });
  } catch (err) {
    return json(res, 500, { ok: false, error: safeError(err) });
  }
});

server.listen(PORT, () => {
  console.log(`Agent runner listening on :${PORT}`);
});
