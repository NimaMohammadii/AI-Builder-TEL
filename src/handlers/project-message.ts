import type { AppConfig, Env } from "../types/env";
import type { TelegramMessage } from "../types/telegram";
import { detectProjectFeatureIntent } from "../lib/project-enabled";

export async function handleProjectMessage(_message: TelegramMessage, _config: AppConfig, _env: Env, _workspaceId: string | null, _managedBotId: string | null, text: string): Promise<boolean> {
  const intent = detectProjectFeatureIntent(text);
  return intent !== "none" ? false : false;
}
