import type { Env } from './types';
import type { SectionLock } from './section-access';

type LockMessage = { type: 'section-access'; serverNow: number; locks: Record<string, SectionLock> };

function messageFor(locks: SectionLock[]): LockMessage {
  return {
    type: 'section-access',
    serverNow: Math.floor(Date.now() / 1000),
    locks: Object.fromEntries(locks.map((lock) => [lock.sectionId, lock])),
  };
}

export class SectionLockEvents {
  private sessions = new Map<WebSocket, { admin: boolean }>();

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
