import type { Env } from './types';

export type LiveActivityKind = 'deposit' | 'win' | 'loss' | 'ticket' | 'winner';

export type LiveActivityInput = {
  kind: LiveActivityKind;
  userId: string;
  amountNano?: number;
  section?: string | null;
  quantity?: number;
  rank?: number;
  key?: string;
  action?: string;
  createdAt?: string;
};

export type LiveActivityEvent = {
  id: string;
  kind: LiveActivityKind;
  displayName: string;
  avatarUrl: string | null;
  action: string;
  section: string | null;
  createdAt: string;
};

type AppUserRow = { first_name: string | null; username: string | null };

const RECENT_KEY = 'live-activity:recent:v1';
const RECENT_LIMIT = 12;

export class LiveActivityRoom {
  private sessions = new Set<WebSocket>();

  constructor(private state: DurableObjectState) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (request.headers.get('Upgrade') === 'websocket' && url.pathname === '/connect') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      server.accept();
      this.sessions.add(server);
      server.addEventListener('close', () => this.sessions.delete(server));
      server.addEventListener('error', () => this.sessions.delete(server));
      const recent = await this.state.storage.get<LiveActivityEvent[]>(RECENT_KEY).catch(() => []);
      safeSend(server, { type: 'live-activity:init', events: Array.isArray(recent) ? recent : [] });
      return new Response(null, { status: 101, webSocket: client });
    }

    if (request.method === 'POST' && url.pathname === '/publish') {
      const event = await request.json().catch(() => null) as LiveActivityEvent | null;
      if (!event?.id) return Response.json({ ok: false }, { status: 400 });
      const recent = await this.state.storage.get<LiveActivityEvent[]>(RECENT_KEY).catch(() => []);
      const current = Array.isArray(recent) ? recent : [];
      if (current.some((item) => item.id === event.id)) return Response.json({ ok: true, duplicate: true });
      const next = [event, ...current].slice(0, RECENT_LIMIT);
      await this.state.storage.put(RECENT_KEY, next);
      const payload = { type: 'live-activity:event', event };
      for (const socket of [...this.sessions]) {
        if (!safeSend(socket, payload)) this.sessions.delete(socket);
      }
      return Response.json({ ok: true });
    }

    return new Response('Not found', { status: 404 });
  }
}

export async function publishLiveActivity(env: Env, input: LiveActivityInput): Promise<void> {
  const userId = cleanUserId(input.userId);
  const event = await buildEvent(env, userId, input);
  const id = env.LIVE_ACTIVITY.idFromName('global');
  await env.LIVE_ACTIVITY.get(id).fetch('https://live-activity/publish', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(event),
  });
}

async function buildEvent(env: Env, userId: string, input: LiveActivityInput): Promise<LiveActivityEvent> {
  const row = await env.DB.prepare('SELECT first_name,username FROM app_users WHERE telegram_user_id=? LIMIT 1')
    .bind(userId)
    .first<AppUserRow>()
    .catch(() => null);
  const username = cleanUsername(row?.username);
  const firstName = cleanName(row?.first_name);
  const suffix = userId.slice(-4);
  const displayName = firstName || (username ? `@${username}` : `Player ${suffix || '—'}`);
  const avatarUrl = username ? `https://t.me/i/userpic/320/${encodeURIComponent(username)}.jpg` : null;
  const createdAt = normalizeDate(input.createdAt);
  return {
    id: activityId(input.kind, userId, input.key, createdAt),
    kind: input.kind,
    displayName,
    avatarUrl,
    action: cleanAction(input.action) || actionFor(input),
    section: cleanSection(input.section),
    createdAt,
  };
}

function actionFor(input: LiveActivityInput): string {
  const amount = Math.abs(Math.floor(Number(input.amountNano) || 0));
  const value = amount > 0 ? formatGram(amount) : '';
  const section = cleanSection(input.section);
  const place = section ? ` · ${sectionLabel(section)}` : '';
  if (input.kind === 'deposit') return value ? `Deposited ${value} GRAM` : 'Made a deposit';
  if (input.kind === 'win') return value ? `Won ${value} GRAM${place}` : `Won a game${place}`;
  if (input.kind === 'loss') return value ? `Lost ${value} GRAM${place}` : `Lost a game${place}`;
  if (input.kind === 'ticket') {
    const quantity = Math.max(1, Math.floor(Number(input.quantity) || 1));
    if (!amount && quantity === 1) return 'Claimed a free ticket';
    return `Bought ${quantity} ticket${quantity === 1 ? '' : 's'}`;
  }
  if (input.kind === 'winner') {
    const rank = Math.max(1, Math.floor(Number(input.rank) || 1));
    return value ? `Lottery winner #${rank} · ${value} GRAM` : `Lottery winner #${rank}`;
  }
  return 'Activity';
}

function activityId(kind: LiveActivityKind, userId: string, key: string | undefined, createdAt: string): string {
  if (key) {
    const stable = `${kind}_${userId}_${key}`.replace(/[^0-9A-Za-z_-]/g, '').slice(0, 110);
    if (stable) return `la_${stable}`;
  }
  return `la_${kind}_${Date.parse(createdAt) || Date.now()}_${randomHex(10)}`;
}

function safeSend(socket: WebSocket, payload: unknown): boolean {
  try { socket.send(JSON.stringify(payload)); return true; } catch { return false; }
}

function formatGram(nano: number): string {
  const value = Math.max(0, Number(nano) || 0) / 1_000_000_000;
  if (value >= 1000) return value.toLocaleString('en-US', { maximumFractionDigits: 1 });
  if (value >= 10) return value.toFixed(1).replace(/\.0$/, '');
  return value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function sectionLabel(section: string): string {
  return ({ playzone: 'Play Hub', coinflip: 'Pump', ghostrun: 'Ghost Run' } as Record<string, string>)[section]
    || section.charAt(0).toUpperCase() + section.slice(1);
}

function normalizeDate(value: unknown): string {
  const parsed = Date.parse(String(value || ''));
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : new Date().toISOString();
}

function cleanUserId(value: unknown): string {
  const id = String(value || '').replace(/[^0-9A-Za-z_-]/g, '').slice(0, 80);
  if (!id) throw new Error('Missing live activity user');
  return id;
}

function cleanUsername(value: unknown): string {
  return String(value || '').replace(/^@+/, '').replace(/[^0-9A-Za-z_]/g, '').slice(0, 64);
}

function cleanName(value: unknown): string {
  return String(value || '').replace(/[<>]/g, '').trim().slice(0, 48);
}

function cleanAction(value: unknown): string {
  return String(value || '').replace(/[<>]/g, '').trim().slice(0, 120);
}

function cleanSection(value: unknown): string | null {
  const section = String(value || '').toLowerCase().replace(/[^0-9a-z_-]/g, '').slice(0, 32);
  return section || null;
}

function randomHex(length: number): string {
  const bytes = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((value) => value.toString(16).padStart(2, '0')).join('').slice(0, length);
}
