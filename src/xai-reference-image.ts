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

  const res = await fetch(`${BASE}/images/edits`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${key}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      prompt: prompt || 'Use the uploaded image as the visual reference and generate a high quality result.',
      image: {
        type: 'image_url',
        url: `data:${image.mimeType};base64,${toBase64(image.bytes)}`,
      },
    }),
  });

  const json = await res.json().catch(() => null) as any;
  if (!res.ok) throw new Error(json?.error?.message ?? 'xAI image reference generation failed.');

  const item = json?.data?.[0];
  if (item?.url) return { url: item.url };
  if (item?.b64_json) return { b64: item.b64_json };
  throw new Error('No image returned.');
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}
