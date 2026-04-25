import type { AppConfig, Env } from "../types/env";
import { deleteWebhook, setWebhook } from "../lib/telegram";
import { jsonOk } from "../utils/http";
import { findWorkspaceBotByWorkspaceId } from "../repositories/telegram-bots";
import { createBotCommandMenu, detectProjectIntent, extractMemoryContent, getBotStats, saveBotMemory } from "../repositories/bot-intelligence";

export async function handleSetWebhook(config: AppConfig): Promise<Response> {
  const result = await setWebhook(config);
  return jsonOk({ ok: result.ok, result }, result.ok ? 200 : 502);
}

export async function handleDeleteWebhook(config: AppConfig): Promise<Response> {
  const result = await deleteWebhook(config);
  return jsonOk({ ok: result.ok, result }, result.ok ? 200 : 502);
}

export async function runProjectLookup(env: Env, workspaceId: string, text: string): Promise<{ ok: boolean; intent: string; payload?: unknown; error?: string }> {
  const intent = detectProjectIntent(text);
  const bot = await findWorkspaceBotByWorkspaceId(env, workspaceId);

  if (intent === "bot_id") {
    if (!bot) return { ok: false, intent, error: "bot_not_found" };
    return { ok: true, intent, payload: { botUsername: bot.bot_username, botId: bot.telegram_bot_id } };
  }

  if (intent === "bot_stats") {
    if (!bot) return { ok: false, intent, error: "bot_not_found" };
    const stats = await getBotStats(env, bot.id);
    return { ok: true, intent, payload: { botUsername: bot.bot_username, stats } };
  }

  return { ok: false, intent };
}

export async function handleProjectAdminAction(request: Request, env: Env): Promise<Response> {
  const body = await request.json().catch(() => ({})) as { workspaceId?: string; text?: string };
  const workspaceId = body.workspaceId;
  const text = body.text ?? "";
  if (!workspaceId || !text.trim()) return jsonOk({ ok: false, error: "missing_workspace_or_text" }, 400);

  const intent = detectProjectIntent(text);
  const bot = await findWorkspaceBotByWorkspaceId(env, workspaceId);

  if (intent === "bot_id") {
    if (!bot) return jsonOk({ ok: false, error: "bot_not_found" }, 404);
    return jsonOk({ ok: true, intent, botUsername: bot.bot_username, botId: bot.telegram_bot_id });
  }

  if (intent === "bot_stats") {
    if (!bot) return jsonOk({ ok: false, error: "bot_not_found" }, 404);
    const stats = await getBotStats(env, bot.id);
    return jsonOk({ ok: true, intent, botUsername: bot.bot_username, stats });
  }

  if (intent === "bot_menu") {
    if (!bot) return jsonOk({ ok: false, error: "bot_not_found" }, 404);
    const menu = await createBotCommandMenu(env, { workspaceId, botId: bot.id, requestText: text });
    return jsonOk({ ok: true, intent, menu });
  }

  if (intent === "project_memory") {
    const id = await saveBotMemory(env, {
      workspaceId,
      botId: bot?.id ?? null,
      title: "Project memory",
      content: extractMemoryContent(text),
      sourceType: "project_memory",
      metadata: { source: "admin_action" }
    });
    return jsonOk({ ok: Boolean(id), intent, memoryId: id });
  }

  return jsonOk({ ok: false, intent: "none" }, 400);
}

export function isAuthorizedDebugRequest(request: Request, adminDebugToken?: string): boolean {
  if (!adminDebugToken) return false;
  const token = request.headers.get("x-admin-token");
  return token === adminDebugToken;
}
