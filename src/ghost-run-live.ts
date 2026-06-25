import type { Env } from './types';

const ROOM_NAME = 'global';
const BETTING_MS = 6500;
const ROUND_MS = 24000;
const EPOCH_MS = Date.UTC(2026, 0, 1, 0, 0, 0, 0);

type LiveEnv = Env & { GHOST_RUN_LIVE?: DurableObjectNamespace };

type GhostRunState = {
  type: 'ghost-state';
  serverNow: number;
  epochMs: number;
  roundId: number;
  roundStartedAt: number;
  bettingMs: number;
  roundMs: number;
  crashPoint: number;
  crashAt: number;
  phase: 'betting' | 'running' | 'ended';
};

export function registerGhostRunLiveRoutes(app: { get: Function }): void {
  app.get('/app/api/ghost-run/live/ws', async (c: { env: LiveEnv; req: { raw: Request } }) => {
    return fetchRoomOrFallback(c.env, c.req.raw, localConnect);
  });
}

export class GhostRunLiveRoom {
  private sockets = new Set<WebSocket>();

  constructor(private state: DurableObjectState, private env: Env) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname.endsWith('/ws')) return this.connect(request);
    return json({ error: 'Not found' }, 404);
  }

  async alarm(): Promise<void> {
    this.publish(stateAt(Date.now()));
    await this.scheduleNextStateAlarm();
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
    safeSend(server, stateAt(Date.now()));
    await this.scheduleNextStateAlarm();
    return new Response(null, { status: 101, webSocket: client });
  }

  private async scheduleNextStateAlarm(): Promise<void> {
    const now = Date.now();
    const state = stateAt(now);
    const nextBoundary = state.phase === 'betting' ? state.roundStartedAt + BETTING_MS : state.phase === 'running' ? state.crashAt : state.roundStartedAt + ROUND_MS;
    await this.state.storage.setAlarm(Math.max(now + 250, nextBoundary + 20)).catch(() => undefined);
  }

  private publish(value: unknown): void {
    const text = JSON.stringify(value);
    for (const socket of this.sockets) {
      try { socket.send(text); } catch { this.sockets.delete(socket); }
    }
  }
}

async function fetchRoomOrFallback(env: LiveEnv, request: Request, fallback: (request: Request) => Promise<Response>): Promise<Response> {
  const fallbackRequest = request.clone();
  const stub = getRoom(env);
  if (!stub) return fallback(fallbackRequest);
  try { return await stub.fetch(request); } catch (error) {
    console.error('ghost run live room failed', error);
    return fallback(fallbackRequest);
  }
}

async function localConnect(request: Request): Promise<Response> {
  if (request.headers.get('Upgrade') !== 'websocket') return json({ error: 'Expected websocket.' }, 426);
  const pair = new WebSocketPair();
  const client = pair[0];
  const server = pair[1];
  server.accept();
  safeSend(server, stateAt(Date.now()));
  return new Response(null, { status: 101, webSocket: client });
}

function getRoom(env: LiveEnv): DurableObjectStub | null {
  if (!env.GHOST_RUN_LIVE) return null;
  return env.GHOST_RUN_LIVE.get(env.GHOST_RUN_LIVE.idFromName(ROOM_NAME));
}

function stateAt(now: number): GhostRunState {
  const elapsed = Math.max(0, now - EPOCH_MS);
  const roundId = Math.floor(elapsed / ROUND_MS);
  const roundStartedAt = EPOCH_MS + roundId * ROUND_MS;
  const crashPoint = crashPointForRound(roundId);
  const crashAt = roundStartedAt + BETTING_MS + crashTimeMs(crashPoint);
  const phase = now < roundStartedAt + BETTING_MS ? 'betting' : now < crashAt ? 'running' : 'ended';
  return { type: 'ghost-state', serverNow: now, epochMs: EPOCH_MS, roundId, roundStartedAt, bettingMs: BETTING_MS, roundMs: ROUND_MS, crashPoint, crashAt, phase };
}

function crashTimeMs(crashPoint: number): number {
  let low = 0;
  let high = ROUND_MS - BETTING_MS - 900;
  for (let i = 0; i < 24; i += 1) {
    const mid = (low + high) / 2;
    if (multiplierAt(mid / 1000) >= crashPoint) high = mid;
    else low = mid;
  }
  return Math.max(800, Math.floor(high));
}

function multiplierAt(t: number): number {
  return 1 + t * 0.038 + Math.pow(t, 1.12) * 0.020;
}

function crashPointForRound(roundId: number): number {
  const r = seededUnit('ghost-crash:' + roundId);
  const n = seededUnit('ghost-crash-tail:' + roundId);
  if (r < 0.84) return round2(1.08 + Math.pow(n, 0.82) * 0.92);
  if (r < 0.97) return round2(2.02 + Math.pow(n, 1.55) * 2.2);
  return round2(4.25 + Math.pow(n, 2.3) * 5.75);
}

function seededUnit(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h += h << 13; h ^= h >>> 7; h += h << 3; h ^= h >>> 17; h += h << 5;
  return ((h >>> 0) % 1000000) / 1000000;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function safeSend(socket: WebSocket, value: unknown): void {
  try { socket.send(JSON.stringify(value)); } catch {}
}

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } });
}
