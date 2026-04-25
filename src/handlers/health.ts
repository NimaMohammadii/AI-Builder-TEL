import { SITE_HTML } from "../site-html";
import { jsonOk } from "../utils/http";

export function handleRoot(): Response {
  return new Response(SITE_HTML, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=60"
    }
  });
}

export function handleHealth(): Response {
  return jsonOk({
    ok: true,
    status: "healthy",
    uptime: "worker-active"
  });
}
