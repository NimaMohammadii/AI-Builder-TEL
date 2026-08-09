import app from './index';
import type { Env } from './types';

const CACHE_LONG = 'public, max-age=31536000, immutable';
const CACHE_NONE = 'no-store';
const PREDICT_LOADING_IMAGE_KEY = 'predict/loading-entry-image';
const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

app.get('/app/api/predict-loading-image.png', async (c) => getPredictLoadingImage(c.env));

async function predictLoadingImageJson(env: Env): Promise<{ ok: boolean; hasImage: boolean; imageUrl: string }> {
  const head = await env.ASSETS.head(PREDICT_LOADING_IMAGE_KEY).catch(() => null);
  const version = head?.customMetadata?.version || '1';
  return { ok: true, hasImage: Boolean(head), imageUrl: head ? `/app/api/predict-loading-image.png?v=${version}` : '' };
}

async function getPredictLoadingImage(env: Env): Promise<Response> {
  const object = await env.ASSETS.get(PREDICT_LOADING_IMAGE_KEY).catch(() => null);
  if (!object) return new Response('Not found', { status: 404, headers: { 'cache-control': CACHE_NONE } });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', CACHE_LONG);
  if (!headers.get('content-type')) headers.set('content-type', object.customMetadata?.contentType || 'image/png');
  return new Response(object.body, { headers });
}
