import type { AppConfig } from "../types/env";
import { deleteWebhook, setWebhook } from "../lib/telegram";
import { jsonOk } from "../utils/http";

export async function handleSetWebhook(config: AppConfig): Promise<Response> {
  const result = await setWebhook(config);
  return jsonOk({ ok: result.ok, result }, result.ok ? 200 : 502);
}

export async function handleDeleteWebhook(config: AppConfig): Promise<Response> {
  const result = await deleteWebhook(config);
  return jsonOk({ ok: result.ok, result }, result.ok ? 200 : 502);
}

export function isAuthorizedDebugRequest(request: Request, adminDebugToken?: string): boolean {
  if (!adminDebugToken) return false;
  const token = request.headers.get("x-admin-token");
  return token === adminDebugToken;
}
