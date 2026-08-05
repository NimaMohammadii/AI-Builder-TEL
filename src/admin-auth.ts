import type { Env } from './types';

const CODE_TTL_SECONDS = 300;
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const MAX_CODE_ATTEMPTS = 3;
const LOCK_SECONDS = 5 * 60;

export function adminSessionCookie(token: string): string {
  return `vexa_admin_session=${encodeURIComponent(token)}; Path=/admin; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly; SameSite=Lax; Secure`;
}

export function clearAdminSessionCookie(): string {
  return 'vexa_admin_session=; Path=/admin; Max-Age=0; HttpOnly; SameSite=Lax; Secure';
}

export function isAdminPassword(env: Env, key: string): boolean {
  return Boolean(env.ADMIN_KEY && key && key === env.ADMIN_KEY);
}

export function adminSessionToken(cookie: string | undefined): string {
  const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin_session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

export async function isAdminSession(env: Env, cookie: string | undefined): Promise<boolean> {
  const token = adminSessionToken(cookie);
  if (!token || token.length < 32) return false;
  return (await env.BOT_CACHE.get(`admin:session:${await sha256Hex(token)}`)) === '1';
}

export async function createAdminPasswordChallenge(env: Env): Promise<
  { ok: true; challengeId: string; expiresIn: number } |
  { ok: false; error: string; status: number; retryAfter?: number }
> {
  const lockKey = 'admin:2fa:lock';
  const lockedUntil = Number(await env.BOT_CACHE.get(lockKey) || 0);
  const now = Date.now();
  if (lockedUntil > now) {
    return {
      ok: false,
      error: 'Too many wrong codes. Try again later.',
      status: 429,
      retryAfter: Math.ceil((lockedUntil - now) / 1000),
    };
  }
  if (!env.BOT_ADMIN || !/^\d+$/.test(env.BOT_ADMIN)) {
    return { ok: false, error: 'BOT_ADMIN numeric Telegram ID is not configured.', status: 500 };
  }
  if (!env.BOT_TOKEN) return { ok: false, error: 'BOT_TOKEN is not configured.', status: 500 };

  const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, '0');
  const challengeId = randomToken(24);
  await env.BOT_CACHE.put(
    `admin:2fa:${challengeId}`,
    JSON.stringify({
      codeHash: await sha256Hex(`${challengeId}:${code}:${env.ADMIN_KEY}`),
      attempts: 0,
      createdAt: now,
    }),
    { expirationTtl: CODE_TTL_SECONDS },
  );
  const sent = await sendTelegramCode(env.BOT_TOKEN, env.BOT_ADMIN, code);
  if (!sent.ok) {
    await env.BOT_CACHE.delete(`admin:2fa:${challengeId}`).catch(() => undefined);
    return { ok: false, error: sent.description || 'Could not send Telegram code.', status: 502 };
  }
  return { ok: true, challengeId, expiresIn: CODE_TTL_SECONDS };
}

export async function verifyAdminCode(
  env: Env,
  challengeId: string,
  code: string,
): Promise<{ ok: true; sessionToken: string } | { ok: false; error: string; status: number }> {
  const cleanId = challengeId.replace(/[^a-zA-Z0-9_-]/g, '');
  const cleanCode = code.replace(/\D/g, '');
  const key = `admin:2fa:${cleanId}`;
  const raw = await env.BOT_CACHE.get(key);
  if (!raw) return { ok: false, error: 'Code expired. Login again.', status: 401 };
  const challenge = JSON.parse(raw) as { codeHash: string; attempts: number; createdAt: number };

  if (cleanCode.length !== 6 || await sha256Hex(`${cleanId}:${cleanCode}:${env.ADMIN_KEY}`) !== challenge.codeHash) {
    const attempts = Number(challenge.attempts || 0) + 1;
    if (attempts >= MAX_CODE_ATTEMPTS) {
      await env.BOT_CACHE.delete(key).catch(() => undefined);
      await env.BOT_CACHE.put('admin:2fa:lock', String(Date.now() + LOCK_SECONDS * 1000), { expirationTtl: LOCK_SECONDS });
      return { ok: false, error: 'Too many wrong codes. Admin login is temporarily locked.', status: 429 };
    }
    challenge.attempts = attempts;
    await env.BOT_CACHE.put(
      key,
      JSON.stringify(challenge),
      { expirationTtl: Math.max(60, CODE_TTL_SECONDS - Math.floor((Date.now() - challenge.createdAt) / 1000)) },
    );
    return { ok: false, error: `Wrong code. ${MAX_CODE_ATTEMPTS - attempts} attempts left.`, status: 401 };
  }

  await env.BOT_CACHE.delete(key).catch(() => undefined);
  const sessionToken = randomToken(32);
  await env.BOT_CACHE.put(`admin:session:${await sha256Hex(sessionToken)}`, '1', { expirationTtl: SESSION_TTL_SECONDS });
  return { ok: true, sessionToken };
}

async function sendTelegramCode(token: string, chatId: string, code: string): Promise<{ ok: boolean; description?: string }> {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `Vexa admin login code: ${code}\nThis code expires in 5 minutes and can be used once.`,
    }),
  });
  return response.json() as Promise<{ ok: boolean; description?: string }>;
}

function randomToken(bytes: number): string {
  const data = new Uint8Array(bytes);
  crypto.getRandomValues(data);
  return Array.from(data, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
