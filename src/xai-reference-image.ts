import type { Env } from './types';

const BASE = 'https://api.x.ai/v1';
const MODEL = 'grok-imagine-image';

type ExtendedEnv = Env & { XAI_API_KEY?: string };

export type ReferenceImageInput = {
  bytes: Uint8Array;
  mimeType: string;
  filename: string;
};

export async function createXaiImageFromReference(env: Env, prompt: string, image: ReferenceImageInput): Promise<{ url?: string; b64?: string }> {
  const key = (env as ExtendedEnv).XAI_API_KEY;
  if (!key) throw new Error('XAI_API_KEY is missing.');

  const form = new FormData();
  form.append('model', MODEL);
  form.append('prompt', prompt || 'Use the uploaded image as the visual reference.');
  form.append('n', '1');
  form.append('image', new Blob([image.bytes], { type: image.mimeType }), image.filename);

  const res = await fetch(`${BASE}/images/edits`, {
    method: 'POST',
    headers: { authorization: `Bearer ${key}` },
    body: form,
  });

  const json = await res.json().catch(() => null) as any;
  if (!res.ok) throw new Error(json?.error?.message ?? 'xAI image reference generation failed.');

  const item = json?.data?.[0];
  if (item?.url) return { url: item.url };
  if (item?.b64_json) return { b64: item.b64_json };
  throw new Error('No image returned.');
}
