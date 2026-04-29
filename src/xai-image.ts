import type { Env } from './types';

const BASE = 'https://api.x.ai/v1';
const MODEL = 'grok-imagine-image';

type ExtendedEnv = Env & { XAI_API_KEY?: string };

export async function createXaiImage(env: Env, prompt: string): Promise<{ url?: string; b64?: string }> {
  const key = (env as ExtendedEnv).XAI_API_KEY;
  if (!key) throw new Error('XAI_API_KEY is missing.');

  const res = await fetch(`${BASE}/images/generations`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${key}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ model: MODEL, prompt, n: 1 }),
  });

  const json = await res.json().catch(() => null) as any;
  if (!res.ok) throw new Error(json?.error?.message ?? 'Image generation failed.');

  const item = json?.data?.[0];
  if (item?.url) return { url: item.url };
  if (item?.b64_json) return { b64: item.b64_json };
  throw new Error('No image returned.');
}
