import type { Env, TelegramMessage } from './types';
import { OPENAI_BASE_URL, OPENAI_MODEL } from './utils';

type PhotoSize = { file_id: string; width: number; height: number; file_size?: number };
type PhotoMessage = TelegramMessage & { caption?: string; photo?: PhotoSize[] };

type FileResult = { ok: boolean; result?: { file_path?: string }; description?: string };
type VisionResult = { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } };

const TG_API = ['https://api.telegram.org'].join('');
const TG_FILE_API = ['https://api.telegram.org', 'file'].join('/');

export function getImageModeText(message: TelegramMessage): string {
  const photoMessage = message as PhotoMessage;
  return (photoMessage.caption ?? message.text ?? '').trim();
}

export function messageHasPhoto(message: TelegramMessage): boolean {
  const photoMessage = message as PhotoMessage;
  return Array.isArray(photoMessage.photo) && photoMessage.photo.length > 0;
}

export async function buildImageGenerationPrompt(env: Env, token: string, message: TelegramMessage): Promise<string> {
  const userText = getImageModeText(message);
  const photoMessage = message as PhotoMessage;
  const photo = [...(photoMessage.photo ?? [])].sort((a, b) => (b.file_size ?? b.width * b.height) - (a.file_size ?? a.width * a.height))[0];
  if (!photo) return userText;
  if (!env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is missing for image analysis.');

  const imageUrl = await telegramPhotoDataUrl(token, photo.file_id);
  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'Analyze the reference image and user instruction. Return one polished image generation prompt only.' },
        { role: 'user', content: [{ type: 'text', text: userText || 'Use the attached image as reference.' }, { type: 'image_url', image_url: { url: imageUrl } }] },
      ],
    }),
  });
  const json = (await response.json().catch(() => null)) as VisionResult | null;
  if (!response.ok) throw new Error(json?.error?.message ?? 'Image analysis failed.');
  const prompt = json?.choices?.[0]?.message?.content?.trim();
  if (!prompt) throw new Error('Image analysis returned no prompt.');
  return prompt.slice(0, 3500);
}

async function telegramPhotoDataUrl(token: string, fileId: string): Promise<string> {
  const fileResponse = await fetch(`${TG_API}/bot${token}/getFile`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ file_id: fileId }) });
  const fileJson = (await fileResponse.json()) as FileResult;
  const filePath = fileJson.result?.file_path;
  if (!fileResponse.ok || !fileJson.ok || !filePath) throw new Error(fileJson.description ?? 'Could not load Telegram image.');
  const photoResponse = await fetch(`${TG_FILE_API}/bot${token}/${filePath}`);
  if (!photoResponse.ok) throw new Error('Could not download Telegram image.');
  const bytes = new Uint8Array(await photoResponse.arrayBuffer());
  const type = photoResponse.headers.get('content-type') || 'image/jpeg';
  return `data:${type};base64,${toBase64(bytes)}`;
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  return btoa(binary);
}
