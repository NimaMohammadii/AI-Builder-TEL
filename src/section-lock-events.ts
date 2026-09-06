import type { Env } from './types';
import type { SectionLock } from './section-access';

type LockMessage = { type: 'section-access'; serverNow: number; locks: Record<string, SectionLock> };
type PredictOpsMarketState = { manualPaused: boolean; circuitOpen: boolean; circuitReason: string | null; capacityReached?: boolean };
export type PredictOpsRealtimeState = {
  emergencyPaused: boolean;
  maintenanceMessage: string;
  markets: Record<'bitcoin' | 'gold' | 'oil', PredictOpsMarketState>;
  updatedAt: string | null;
};
type PredictOpsMessage = { type: 'predict-ops'; state: PredictOpsRealtimeState; refreshRound: boolean };

const PREDICT_OPS_STATE_KEY = 'predict-ops:realtime-state:v1';

function messageFor(locks: SectionLock[]): LockMessage {
  return {
    type: 'section-access',
    serverNow: Math.floor(Date.now() / 1000),
    locks: Object.fromEntries(locks.map((lock) => [lock.sectionId, lock])),
  };
}

function predictOpsMessage(state: PredictOpsRealtimeState, refreshRound = false): PredictOpsMessage {
  return { type: 'predict-ops', state, refreshRound };
}

export class SectionLockEvents {
  private sessions = new Map<WebSocket, { admin: boolean }>();

  constructor(private state: DurableObjectState) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (request.headers.get('Upgrade') === 'websocket' && url.pathname === '/connect') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      server.accept();
      const admin = request.headers.get('x-section-lock-admin') === '1';
      this.sessions.set(server, { admin });
      server.addEventListener('close', () => this.sessions.delete(server));
      server.addEventListener('error', () => this.sessions.delete(server));
      try {
        const raw = request.headers.get('x-section-lock-initial') || '[]';
        const locks = admin ? [] : JSON.parse(raw) as SectionLock[];
        server.send(JSON.stringify(messageFor(Array.isArray(locks) ? locks : [])));
      } catch {
        server.send(JSON.stringify(messageFor([])));
      }
      const predictOpsState = await this.state.storage.get<unknown>(PREDICT_OPS_STATE_KEY).catch(() => null);
      if (isPredictOpsRealtimeState(predictOpsState)) {
        try { server.send(JSON.stringify(predictOpsMessage(predictOpsState, false))); } catch { /* socket lifecycle owns cleanup */ }
      }
      return new Response(null, { status: 101, webSocket: client });
    }
    if (request.method === 'POST' && url.pathname === '/publish') {
      const locks = await request.json().catch(() => []) as SectionLock[];
      const payload = JSON.stringify(messageFor(Array.isArray(locks) ? locks : []));
      const emptyPayload = JSON.stringify(messageFor([]));
      for (const [socket, session] of this.sessions) {
        try { socket.send(session.admin ? emptyPayload : payload); } catch { this.sessions.delete(socket); }
      }
      return Response.json({ ok: true });
    }
    if (request.method === 'POST' && url.pathname === '/publish-predict-ops') {
      const body = await request.json().catch(() => null) as { state?: unknown; refreshRound?: unknown } | null;
      if (!isPredictOpsRealtimeState(body?.state)) return Response.json({ ok: false }, { status: 400 });
      const state = body.state;
      const refreshRound = body?.refreshRound === true;
      await this.state.storage.put(PREDICT_OPS_STATE_KEY, state);
      const payload = JSON.stringify(predictOpsMessage(state, refreshRound));
      for (const socket of [...this.sessions.keys()]) {
        try { socket.send(payload); } catch { this.sessions.delete(socket); }
      }
      return Response.json({ ok: true });
    }
    return new Response('Not found', { status: 404 });
  }
}

export async function publishSectionAccess(env: Env, locks: SectionLock[]): Promise<void> {
  const id = env.SECTION_LOCK_EVENTS.idFromName('global');
  await env.SECTION_LOCK_EVENTS.get(id).fetch('https://section-lock-events/publish', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(locks),
  });
}

export async function publishPredictOpsState(env: Env, state: PredictOpsRealtimeState, refreshRound = false): Promise<void> {
  const id = env.SECTION_LOCK_EVENTS.idFromName('global');
  const response = await env.SECTION_LOCK_EVENTS.get(id).fetch('https://section-lock-events/publish-predict-ops', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ state, refreshRound }),
  });
  if (!response.ok) throw new Error('Could not publish Predict Ops state.');
}

function isPredictOpsRealtimeState(value: unknown): value is PredictOpsRealtimeState {
  if (!value || typeof value !== 'object') return false;
  const state = value as Partial<PredictOpsRealtimeState>;
  if (typeof state.emergencyPaused !== 'boolean' || typeof state.maintenanceMessage !== 'string' || !state.markets || typeof state.markets !== 'object') return false;
  for (const market of ['bitcoin', 'gold', 'oil'] as const) {
    const item = state.markets[market] as PredictOpsMarketState | undefined;
    if (!item || typeof item.manualPaused !== 'boolean' || typeof item.circuitOpen !== 'boolean') return false;
    if (item.circuitReason !== null && typeof item.circuitReason !== 'string') return false;
    if (item.capacityReached !== undefined && typeof item.capacityReached !== 'boolean') return false;
  }
  return state.updatedAt === null || typeof state.updatedAt === 'string';
}
