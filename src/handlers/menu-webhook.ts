import type { AppConfig, Env } from "../types/env";
import { handleTelegramWebhook } from "./telegram-webhook";
import { parseUpdate, verifyTelegramWebhookSecret } from "../lib/telegram";
import { sendUiMessage } from "../lib/telegram-ui";
import { buildMainMenuKeyboard, MAIN_MENU_TEXT, mapMenuButtonToText } from "../lib/bot-main-menu";

export async function handleMenuAwareTelegramWebhook(request: Request, config: AppConfig, env: Env, ctx?: ExecutionContext): Promise<Response> {
  const handled = await tryHandleMenu(request.clone(), config);
  if (handled) return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json" } });
  return handleTelegramWebhook(request, config, env, ctx);
}

async function tryHandleMenu(request: Request, config: AppConfig): Promise<boolean> {
  if (!verifyTelegramWebhookSecret(request, config.telegramWebhookSecret)) return false;
  if (!request.headers.get("content-type")?.includes("application/json")) return false;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return false;
  }

  const update = parseUpdate(body);
  const message = update?.message ?? update?.edited_message;
  const text = message?.text || (message as any)?.caption || "";
  if (!message || !text) return false;

  const menuText = mapMenuButtonToText(text);
  if (!menuText) return false;

  await sendUiMessage(config, {
    chatId: message.chat.id,
    text: menuText || MAIN_MENU_TEXT,
    replyToMessageId: message.message_id,
    replyMarkup: buildMainMenuKeyboard()
  });
  return true;
}
