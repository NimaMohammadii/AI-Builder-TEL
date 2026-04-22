export function jsonOk(body: unknown = { ok: true }, status = 200): Response {
  return Response.json(body, { status });
}

export function jsonError(error: string, status: number): Response {
  return Response.json({ ok: false, error }, { status });
}
