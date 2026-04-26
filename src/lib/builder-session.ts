import type { AppConfig } from '../types/env';

const PREFIX = 'builder_session:';
const TTL_SECONDS = 60 * 60 * 6;

export async function startBuilderSession(config: AppConfig, chatId: number): Promise<void> {
  await config.chatMemory?.put(`${PREFIX}${chatId}`, JSON.stringify({ active: true, startedAt: Date.now() }), { expirationTtl: TTL_SECONDS });
}

export async function endBuilderSession(config: AppConfig, chatId: number): Promise<void> {
  await config.chatMemory?.delete(`${PREFIX}${chatId}`);
}

export async function isBuilderSessionActive(config: AppConfig, chatId: number): Promise<boolean> {
  const value = await config.chatMemory?.get(`${PREFIX}${chatId}`);
  return Boolean(value);
}
