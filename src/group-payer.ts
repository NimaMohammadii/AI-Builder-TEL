import type { TelegramUser } from './types';

export function groupStartOwnerId(text: string | undefined): string {
  const match = String(text || '').trim().match(/^\/start\s+vxa_([0-9]{3,32})\b/i);
  return match ? match[1] : '';
}

export function ownerFromStartPayload(ownerId: string, fallback?: TelegramUser): TelegramUser {
  return { id: Number(ownerId), first_name: fallback?.first_name, username: fallback?.username };
}

export function groupAddPayload(ownerId: unknown): string {
  const clean = String(ownerId || '').replace(/[^0-9]/g, '').slice(0, 32);
  return clean ? 'vxa_' + clean : 'true';
}
