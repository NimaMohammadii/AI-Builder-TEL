import type { Env } from './types';
import type { SectionLock } from './section-access';

type LockMessage = { type: 'section-access'; serverNow: number; locks: Record<string, SectionLock> };
type UserControlBlock = { sectionId: string; blocked: boolean; expiresAt: string | null; remainingMs: number | null };
export type RealtimeUserControls = { userId: string; sectionBlocks: UserControlBlock[] };
type UserControlsMessage = { type: 'user-controls'; controls: RealtimeUserControls };
type PredictOpsMarketState = { manualPaused: boolean; circuitOpen: boolean; circuitReason: string | null; capacityReached?: boolean };
export type PredictOpsRealtimeState = {
  emergencyPaused: boolean;
  maintenanceMessage: string;
  markets: Record<'bitcoin' | 'gold' | 'oil', PredictOpsMarketState>;
  updatedAt: string | null;
};
type PredictOpsMessage = { type: 'predict-ops'; state: PredictOpsRealtimeState; refreshRound: boolean };
type SectionAccessPublishBody = { locks?: unknown; userControls?: unknown };

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
  private sessions = new Map<WebSocket, { admin: boolean; userId: string }>();

  constructor(private state: DurableObjectState) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (request.headers.get('Upgrade') === 'websocket' && url.pathname === '/connect') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      server.accept();
      const admin = request.headers.get('x-section-lock-admin') === '1';
      const userId = cleanUserId(request.headers.get('x-section-lock-user'));
      this.sessions.set(server, { admin, userId });
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
      const body = await request.json().catch(() => null) as SectionAccessPublishBody | null;
      if (!body || typeof body !== 'object') return Response.json({ ok: false }, { status: 400 });
      let handled = false;

      if (body.locks !== undefined) {
        if (!Array.isArray(body.locks)) return Response.json({ ok: false }, { status: 400 });
        const locks = body.locks as SectionLock[];
        const payload = JSON.stringify(messageFor(locks));
        const emptyPayload = JSON.stringify(messageFor([]));
        for (const [socket, session] of this.sessions) {
          try { socket.send(session.admin ? emptyPayload : payload); } catch { this.sessions.delete(socket); }
        }
        handled = true;
      }

      if (body.userControls !== undefined) {
        if (!isRealtimeUserControls(body.userControls)) return Response.json({ ok: false }, { status: 400 });
        const controls = body.userControls;
        const payload = JSON.stringify({ type: 'user-controls', controls } satisfies UserControlsMessage);
        for (const [socket, session] of this.sessions) {
          if (session.userId !== controls.userId) continue;
          try { socket.send(payload); } catch { this.sessions.delete(socket); }
        }
        handled = true;
      }

      return handled ? Response.json({ ok: true }) : Response.json({ ok: false }, { status: 400 });
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
  const response = await env.SECTION_LOCK_EVENTS.get(id).fetch('https://section-lock-events/publish', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ locks }),
  });
  if (!response.ok) throw new Error('Could not publish section access state.');
}

export async function publishUserControls(env: Env, controls: RealtimeUserControls): Promise<void> {
  const id = env.SECTION_LOCK_EVENTS.idFromName('global');
  const response = await env.SECTION_LOCK_EVENTS.get(id).fetch('https://section-lock-events/publish', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ userControls: controls }),
  });
  if (!response.ok) throw new Error('Could not publish user access state.');
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

function isRealtimeUserControls(value: unknown): value is RealtimeUserControls {
  if (!value || typeof value !== 'object') return false;
  const controls = value as Partial<RealtimeUserControls>;
  const userId = cleanUserId(controls.userId);
  if (!userId || !Array.isArray(controls.sectionBlocks)) return false;
  return controls.sectionBlocks.every((item) => {
    if (!item || typeof item !== 'object') return false;
    const block = item as Partial<UserControlBlock>;
    if (!String(block.sectionId || '').trim() || typeof block.blocked !== 'boolean') return false;
    if (block.expiresAt !== null && typeof block.expiresAt !== 'string') return false;
    return block.remainingMs === null || (typeof block.remainingMs === 'number' && Number.isFinite(block.remainingMs) && block.remainingMs >= 0);
  });
}

function cleanUserId(value: unknown): string {
  return String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
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
