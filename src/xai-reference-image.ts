import type { Env } from './types';

const BASE = 'https://api.x.ai/v1';
const MODEL = 'grok-imagine-image';

type ExtendedEnv = Env & { XAI_API_KEY?: string };

type XaiImageResponse = {
  data?: Array<{ url?: string; b64_json?: string }>;
  error?: { message?: string } | string;
};

export type ReferenceImageInput = {
  bytes: Uint8Array;
  mimeType: string;
  filename: string;
};

export async function createXaiImageFromReference(env: Env, prompt: string, image: ReferenceImageInput): Promise<{ url?: string; b64?: string }> {
  const key = (env as ExtendedEnv).XAI_API_KEY;
  if (!key) throw new Error('XAI_API_KEY is missing.');

  const safePrompt = prompt || 'Use the uploaded image as the visual reference and generate a high quality result.';
  const dataUrl = `data:${image.mimeType};base64,${toBase64(image.bytes)}`;

  const payloads = [
    {
      model: MODEL,
      prompt: safePrompt,
      n: 1,
      image: { type: 'image_url', url: dataUrl },
    },
    {
      model: MODEL,
      prompt: safePrompt,
      n: 1,
      images: [{ type: 'image_url', url: dataUrl }],
    },
    {
      model: MODEL,
      prompt: safePrompt,
      n: 1,
      image: dataUrl,
    },
  ];

  const errors: string[] = [];
  for (const payload of payloads) {
    const result = await callXaiImageEdit(key, payload);
    if (result.ok) return result.image;
    errors.push(result.error);
  }

  throw new Error(`xAI image reference generation failed: ${errors.join(' | ')}`.slice(0, 900));
}

async function callXaiImageEdit(apiKey: string, payload: unknown): Promise<{ ok: true; image: { url?: string; b64?: string } } | { ok: false; error: string }> {
  const res = await fetch(`${BASE}/images/edits`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  const json = safeJson<XaiImageResponse>(text);

  if (!res.ok) {
    return { ok: false, error: extractXaiError(res.status, text, json) };
  }

  const item = json?.data?.[0];
  if (item?.url) return { ok: true, image: { url: item.url } };
  if (item?.b64_json) return { ok: true, image: { b64: item.b64_json } };

  return { ok: false, error: `HTTP ${res.status}: no image returned. Body: ${text.slice(0, 300)}` };
}

function extractXaiError(status: number, rawText: string, json: XaiImageResponse | null): string {
  const message = typeof json?.error === 'string' ? json.error : json?.error?.message;
  if (message) return `HTTP ${status}: ${message}`;
  return `HTTP ${status}: ${rawText.slice(0, 300) || 'empty response'}`;
}

function safeJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}
