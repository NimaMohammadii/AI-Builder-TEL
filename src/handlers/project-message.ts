import type { AppConfig, Env } from "../types/env";
import type { TelegramMessage } from "../types/telegram";

export async function handleProjectMessage(_message: TelegramMessage, _config: AppConfig, _env: Env, _workspaceId: string | null, _managedBotId: string | null, _text: string): Promise<boolean> {
  return false;
}
