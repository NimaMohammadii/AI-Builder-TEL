import type { Env } from './types';

export const APP_NAME = 'AI Builder TEL';
export const PUBLIC_BASE_URL = 'https://builder-tel.vexaagent.workers.dev';
export const OPENAI_BASE_URL = 'https://api.openai.com/v1';
export const OPENAI_MODEL = 'gpt-4.1-mini';

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

export async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function rateLimit(kv: KVNamespace, key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  const bucket = `${key}:${Math.floor(now / windowSeconds)}`;
  const current = Number((await kv.get(bucket)) ?? '0');
  if (current >= limit) return false;
  await kv.put(bucket, String(current + 1), { expirationTtl: windowSeconds + 5 });
  return true;
}

export function aiBotToken(env: Env): string {
  return env.AI_BOT_TOKEN || env.TELEGRAM_BOT_TOKEN;
}

export function gameBotToken(env: Env): string {
  return env.GAME_BOT_TOKEN || env.TELEGRAM_BOT_TOKEN;
}

export async function encryptUserToken(env: Env, token: string): Promise<string> {
  const key = await encryptionKey(env);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(token));
  return `v1:${base64(iv)}:${base64(new Uint8Array(encrypted))}`;
}

export async function decryptUserToken(env: Env, encryptedToken: string): Promise<string> {
  if (encryptedToken === 'env:TELEGRAM_BOT_TOKEN') return env.TELEGRAM_BOT_TOKEN;
  if (encryptedToken === 'env:AI_BOT_TOKEN') return aiBotToken(env);
  if (encryptedToken === 'env:GAME_BOT_TOKEN') return gameBotToken(env);
  if (!encryptedToken.startsWith('v1:')) return encryptedToken;
  const [, ivB64, dataB64] = encryptedToken.split(':');
  if (!ivB64 || !dataB64) throw new Error('Invalid encrypted token');
  const key = await encryptionKey(env);
  const iv = unbase64(ivB64);
  const data = unbase64(dataB64);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return new TextDecoder().decode(decrypted);
}

async function encryptionKey(env: Env): Promise<CryptoKey> {
  const seed = `${env.OPENAI_API_KEY}:ai-builder-tel-token-key`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(seed));
  return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

function base64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function unbase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}