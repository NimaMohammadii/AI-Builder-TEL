import type { Env } from './types';

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export function id(prefix: string): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const value = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${prefix}_${value}`;
}

export function safeParseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function assertAdmin(env: Env, request: Request): Response | null {
  const configured = env.ADMIN_API_KEY;
  if (!configured) return json({ error: 'ADMIN_API_KEY is not configured' }, 500);
  const provided = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (provided !== configured) return json({ error: 'Unauthorized' }, 401);
  return null;
}

export async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function rateLimit(env: Env, key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  const bucket = `${key}:${Math.floor(now / windowSeconds)}`;
  const current = Number((await env.RATE_LIMITS.get(bucket)) ?? '0');
  if (current >= limit) return false;
  await env.RATE_LIMITS.put(bucket, String(current + 1), { expirationTtl: windowSeconds + 5 });
  return true;
}

export async function encryptToken(env: Env, token: string): Promise<string> {
  const key = env.TOKEN_ENCRYPTION_KEY;
  if (!key) return `plain:${token}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key));
  const cryptoKey = await crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, new TextEncoder().encode(token));
  return `v1:${btoa(String.fromCharCode(...iv))}:${btoa(String.fromCharCode(...new Uint8Array(encrypted)))}`;
}

export async function decryptToken(env: Env, encryptedToken: string): Promise<string> {
  if (encryptedToken.startsWith('plain:')) return encryptedToken.slice(6);
  const key = env.TOKEN_ENCRYPTION_KEY;
  if (!key) throw new Error('TOKEN_ENCRYPTION_KEY is required to decrypt bot tokens');
  const [, ivB64, dataB64] = encryptedToken.split(':');
  if (!ivB64 || !dataB64) throw new Error('Invalid encrypted token');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key));
  const cryptoKey = await crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['decrypt']);
  const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));
  const data = Uint8Array.from(atob(dataB64), (c) => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, data);
  return new TextDecoder().decode(decrypted);
}
