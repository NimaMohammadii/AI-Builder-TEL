import type { Env } from './types';

export const APP_NAME = 'Vexa Games';
export const PUBLIC_BASE_URL = 'https://vexa.games';

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export function id(prefix: string): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const value = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${prefix}_${value}`;
}

export function safeParseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function rateLimit(kv: KVNamespace, key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  const bucket = `${key}:${Math.floor(now / windowSeconds)}`;
  const current = Number((await kv.get(bucket)) ?? '0');
  if (current >= limit) return false;
  await kv.put(bucket, String(current + 1), { expirationTtl: windowSeconds + 5 });
  return true;
}

export function gameBotToken(env: Env): string {
  return env.BOT_TOKEN;
}

export async function validateTelegramInitData(initDataInput: unknown, tokenInput: unknown): Promise<string> {
  const initData = String(initDataInput || '').trim();
  const token = String(tokenInput || '').trim();
  if (!initData) throw new Error('Open the Mini App inside Telegram');
  if (!token) throw new Error('Bot token is not configured');

  const params = new URLSearchParams(initData);
  const receivedHash = String(params.get('hash') || '').toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(receivedHash)) throw new Error('Invalid Telegram session');
  params.delete('hash');

  const authDate = Number(params.get('auth_date'));
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(authDate) || authDate <= 0 || authDate > now + 300 || now - authDate > 86400) {
    throw new Error('Telegram session expired');
  }

  const checkString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  const encoder = new TextEncoder();
  const webAppKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode('WebAppData'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const secret = await crypto.subtle.sign('HMAC', webAppKey, encoder.encode(token));
  const secretKey = await crypto.subtle.importKey(
    'raw',
    secret,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', secretKey, encoder.encode(checkString));
  const expected = Array.from(new Uint8Array(signature)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  if (!timingSafeEqual(expected, receivedHash)) throw new Error('Invalid Telegram session');

  let user: { id?: unknown } = {};
  try {
    user = JSON.parse(String(params.get('user') || '{}')) as { id?: unknown };
  } catch {
    throw new Error('Invalid Telegram session');
  }
  const userId = String(user.id ?? '').replace(/[^0-9]/g, '').slice(0, 24);
  if (!userId) throw new Error('Missing Telegram user');
  return userId;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return mismatch === 0;
}
