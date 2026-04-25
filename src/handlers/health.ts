import { jsonOk } from "../utils/http";

const HTML_SOURCE_URL = "https://raw.githubusercontent.com/NimaMohammadii/AI-Builder-TEL/main/HTML";

export async function handleRoot(): Promise<Response> {
  const html = await fetch(HTML_SOURCE_URL, {
    headers: {
      accept: "text/html,text/plain,*/*"
    }
  });

  if (!html.ok) {
    return jsonOk({
      ok: false,
      error: "html_file_unavailable",
      status: html.status
    }, 502);
  }

  return new Response(await html.text(), {
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
