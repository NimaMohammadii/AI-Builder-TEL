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
  const headerType = photoResponse.headers.get('content-type') || '';
  const type = normalizeImageMimeType(headerType, filePath, bytes);
  return `data:${type};base64,${toBase64(bytes)}`;
}

function normalizeImageMimeType(headerType: string, filePath: string, bytes: Uint8Array): string {
  const cleanHeader = headerType.split(';')[0]?.trim().toLowerCase() ?? '';
  if (cleanHeader.startsWith('image/')) return cleanHeader;

  const path = filePath.toLowerCase();
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.webp')) return 'image/webp';
  if (path.endsWith('.gif')) return 'image/gif';
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';

  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png';
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return 'image/webp';
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return 'image/gif';

  return 'image/jpeg';
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  return btoa(binary);
}
