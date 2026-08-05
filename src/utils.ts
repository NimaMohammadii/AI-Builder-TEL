import type { Env } from './types';

export const APP_NAME = 'Vexa Games';
export const PUBLIC_BASE_URL = 'https://v.vexaagent.workers.dev';

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
