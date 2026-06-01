import type { Env } from './types';

const ROOM_NAME = 'global';
const USER_DELAY_MS = 6000;
const HISTORY_KEY = 'plinko-live-history';
const RESULT_DEDUPE_PREFIX = 'plinko-live-result-key-';
const RESULT_DEDUPE_MS = 2500;
const HISTORY_LIMIT = 50;

type LiveEnv = Env & { PLINKO_LIVE?: DurableObjectNamespace };
type LiveInput = { userId?: unknown; name?: unknown; photoUrl?: unknown; amount?: unknown };
type ResultInput = {
  id?: unknown;
  userId?: unknown;
  name?: unknown;
  photoUrl?: unknown;
  amount?: unknown;
  multiplier?: unknown;
  total?: unknown;
};

type PlinkoResult = {
  id: string;
  userId: string;
  name: string;
  photoUrl: string;
  amount: number;
  multiplier: number;
  total: number;
  createdAt: number;
};

export function registerPlinkoLiveRoutes(app: { get: Function; post: Function }): void {
  app.get('/app/api/plinko/live/ws', async (c: { env: LiveEnv; req: { raw: Request } }) => {
    const stub = getRoom(c.env);
    return stub ? stub.fetch(c.req.raw) : json({ error: 'Live is not configured.' }, 503);
  });

  app.post('/app/api/plinko/live/send', async (c: { env: LiveEnv; req: { raw: Request } }) => {
    const stub = getRoom(c.env);
    return stub ? stub.fetch(c.req.raw) : json({ error: 'Live is not configured.' }, 503);
  });

  app.post('/app/api/plinko/live/result', async (c: { env: LiveEnv; req: { raw: Request } }) => {
    const stub = getRoom(c.env);
    return stub ? stub.fetch(c.req.raw) : json({ error: 'Live is not configured.' }, 503);
  });
}

export class PlinkoLiveRoom {
  private sockets = new Set<WebSocket>();

  constructor(private state: DurableObjectState, private env: Env) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname.endsWith('/ws')) return this.connect(request);
    if (request.method === 'POST' && url.pathname.endsWith('/send')) return this.send(request);
    if (request.method === 'POST' && url.pathname.endsWith('/result')) return this.result(request);
    return json({ error: 'Not found' }, 404);
  }

  private async connect(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade') !== 'websocket') return json({ error: 'Expected websocket.' }, 426);
    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    server.accept();
    this.sockets.add(server);
    server.addEventListener('close', () => this.sockets.delete(server));
    server.addEventListener('error', () => this.sockets.delete(server));
    safeSend(server, { type: 'plinko-history', events: await this.history() });
    return new Response(null, { status: 101, webSocket: client });
  }

  private async send(request: Request): Promise<Response> {
    const body = await request.json().catch(() => ({})) as LiveInput;
    const userId = cleanUserId(body.userId);
    if (!userId) return json({ error: 'Missing user.' }, 400);

    const now = Date.now();
    const key = 'plinko-live-user-' + userId;
    const last = Number(await this.state.storage.get<number>(key).catch(() => 0)) || 0;
    const waitMs = USER_DELAY_MS - (now - last);
    if (waitMs > 0) return json({ error: 'Wait a moment.', waitMs }, 429);
    await this.state.storage.put(key, now);

    const event = {
      id: crypto.randomUUID(),
      userId,
      name: cleanName(body.name),
      photoUrl: cleanPhotoUrl(body.photoUrl),
      amount: cleanAmount(body.amount),
      createdAt: now,
      seed: Math.floor(Math.random() * 1000000000),
    };
    this.publish({ type: 'plinko-ball', event });
    return json({ ok: true, event });
  }

  private async result(request: Request): Promise<Response> {
    const body = await request.json().catch(() => ({})) as ResultInput;
    const amount = cleanAmount(body.amount);
    const multiplier = cleanMultiplier(body.multiplier);
    if (!amount || !multiplier) return json({ error: 'Invalid result.' }, 400);
    const total = cleanAmount(Number(body.total) || amount * multiplier);
    const result: PlinkoResult = {
      id: cleanId(body.id) || crypto.randomUUID(),
      userId: cleanUserId(body.userId),
      name: cleanName(body.name),
      photoUrl: cleanPhotoUrl(body.photoUrl),
      amount,
      multiplier,
      total,
      createdAt: Date.now(),
    };

    const dedupeKey = RESULT_DEDUPE_PREFIX + naturalResultKey(result);
    const last = Number(await this.state.storage.get<number>(dedupeKey).catch(() => 0)) || 0;
    if (Date.now() - last < RESULT_DEDUPE_MS) return json({ ok: true, duplicate: true, event: result });
    await this.state.storage.put(dedupeKey, Date.now());

    const history = await this.history();
    const next = [result, ...history.filter((item) => item.id !== result.id)].slice(0, HISTORY_LIMIT);
    await this.state.storage.put(HISTORY_KEY, next);
    this.publish({ type: 'plinko-result', event: result });
    return json({ ok: true, event: result });
  }

  private async history(): Promise<PlinkoResult[]> {
    const history = await this.state.storage.get<PlinkoResult[]>(HISTORY_KEY).catch(() => null);
    return Array.isArray(history) ? history.slice(0, HISTORY_LIMIT) : [];
  }

  private publish(value: unknown): void {
    const text = JSON.stringify(value);
    for (const socket of this.sockets) {
      try { socket.send(text); } catch { this.sockets.delete(socket); }
    }
  }
}

function getRoom(env: LiveEnv): DurableObjectStub | null {
  if (!env.PLINKO_LIVE) return null;
  return env.PLINKO_LIVE.get(env.PLINKO_LIVE.idFromName(ROOM_NAME));
}

function cleanId(value: unknown): string {
  return String(value || '').replace(/[^a-zA-Z0-9_:-]/g, '').slice(0, 120);
}

function cleanUserId(value: unknown): string {
  return String(value || '').replace(/[^a-zA-Z0-9_:-]/g, '').slice(0, 80);
}

function cleanName(value: unknown): string {
  return String(value || 'Player').replace(/[<>]/g, '').trim().slice(0, 80) || 'Player';
}

function cleanPhotoUrl(value: unknown): string {
  const url = String(value || '').trim();
  return /^https:\/\//i.test(url) ? url.slice(0, 500) : '';
}

function cleanAmount(value: unknown): number {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.min(1000000, Math.round(amount * 10000) / 10000);
}

function cleanMultiplier(value: unknown): number {
  const multiplier = Number(value);
  if (!Number.isFinite(multiplier) || multiplier < 0) return 0;
  return Math.min(1000000, Math.round(multiplier * 10000) / 10000);
}

function naturalResultKey(result: PlinkoResult): string {
  return [result.userId, result.name, result.photoUrl, result.amount, result.multiplier, result.total].join('|').slice(0, 700);
}

function safeSend(socket: WebSocket, value: unknown): void {
  try { socket.send(JSON.stringify(value)); } catch {}
}

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}
