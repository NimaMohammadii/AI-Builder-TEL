export function handleRoot(): Response {
  return Response.json({
    ok: true,
    service: "vexa",
    runtime: "cloudflare-workers"
  });
}

export function handleHealth(): Response {
  return Response.json({
    ok: true,
    status: "healthy",
    uptime: "worker-active"
  });
}
