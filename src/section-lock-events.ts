export class SectionLockEvents {
  private clients = new Set<WritableStreamDefaultWriter<Uint8Array>>();
  private encoder = new TextEncoder();

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.endsWith('/broadcast')) return this.broadcast();
    return this.connect(request);
  }

  private connect(request: Request): Response {
    const stream = new TransformStream<Uint8Array, Uint8Array>();
    const writer = stream.writable.getWriter();
    this.clients.add(writer);
    writer.write(this.encoder.encode('event: ready\ndata: 1\n\n')).catch(() => undefined);
    request.signal.addEventListener('abort', () => this.close(writer), { once: true });
    return new Response(stream.readable, {
      headers: {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-store',
        connection: 'keep-alive',
      },
    });
  }

  private async broadcast(): Promise<Response> {
    const payload = this.encoder.encode(`event: locks\ndata: ${Date.now()}\n\n`);
    await Promise.all(Array.from(this.clients).map(async (writer) => {
      try { await writer.write(payload); }
      catch { this.close(writer); }
    }));
    return new Response('ok', { headers: { 'cache-control': 'no-store' } });
  }

  private close(writer: WritableStreamDefaultWriter<Uint8Array>): void {
    this.clients.delete(writer);
    writer.close().catch(() => undefined);
  }
}
