import type { Env } from "../types/env";
import { runProjectLookup } from "./debug";

export async function getProjectTelegramActionText(env: Env, workspaceId: string | null, text: string): Promise<string | null> {
  if (!workspaceId || !text.trim()) return null;
  const result = await runProjectLookup(env, workspaceId, text);
  if (!result.ok) return null;
  const payload = result.payload as any;
  if (result.intent === "bot_id") return `@${payload.botUsername}:\n${payload.botId}`;
  if (result.intent === "bot_stats") return JSON.stringify(payload, null, 2);
  return null;
}
