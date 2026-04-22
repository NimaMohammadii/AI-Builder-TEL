import type { AppConfig } from "../config";
import { deleteWebhook, setWebhook } from "../lib/telegram";

export async function handleSetWebhook(config: AppConfig): Promise<Response> {
  const result = await setWebhook(config);
  return Response.json({ ok: result.ok, result }, { status: result.ok ? 200 : 502 });
}

export async function handleDeleteWebhook(config: AppConfig): Promise<Response> {
  const result = await deleteWebhook(config);
  return Response.json({ ok: result.ok, result }, { status: result.ok ? 200 : 502 });
}

export function isAuthorizedDebugRequest(request: Request, adminDebugToken?: string): boolean {
  if (!adminDebugToken) return false;
  const token = request.headers.get("x-admin-token");
  return token === adminDebugToken;
}
