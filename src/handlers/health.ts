import { jsonOk } from "../utils/http";

export function handleRoot(): Response {
  return jsonOk({
    ok: true,
    service: "vexa",
    runtime: "cloudflare-workers"
  });
}

export function handleHealth(): Response {
  return jsonOk({
    ok: true,
    status: "healthy",
    uptime: "worker-active"
  });
}
