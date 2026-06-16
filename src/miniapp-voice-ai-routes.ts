import app from './index';
import { plainAiReply } from './ai';
import type { Env } from './types';
import { OPENAI_BASE_URL } from './utils';

type EnvWithVoiceAi = Env & {
  ELEVENLABS_API_KEY?: string;
};

type TranscriptionResult = {
  text?: string;
  error?: {
    message?: string;
  };
};

const VOICE_AI_ELEVENLABS_VOICE_ID = 'TX3LPaxmHKxFdv7VOQHJ';
const VOICE_AI_MAX_AUDIO_BYTES = 10 * 1024 * 1024;
const VOICE_AI_MAX_REPLY_CHARS = 1200;

app.post('/app/api/voice-ai', async (c) => {
  const env = c.env as EnvWithVoiceAi;

  if (!env.OPENAI_API_KEY) {
    return c.json({ error: 'OpenAI API key is not configured.' }, 500);
  }

  if (!env.ELEVENLABS_API_KEY) {
    return c.json({ error: 'ElevenLabs API key is not configured.' }, 500);
  }

  const form = await c.req.formData().catch(() => null);
  const file = form?.get('audio');

  if (!(file instanceof File)) {
    return c.json({ error: 'Audio file is required.' }, 400);
  }

  if (file.size < 1) {
    return c.json({ error: 'Audio file is empty.' }, 400);
  }

  if (file.size > VOICE_AI_MAX_AUDIO_BYTES) {
    return c.json({ error: 'Audio file is too large.' }, 413);
  }

  try {
    const transcript = await transcribeAudio(env, file);
    const reply = await plainAiReply(env, transcript);
    const audio = await createSpeech(env, reply.slice(0, VOICE_AI_MAX_REPLY_CHARS));

    return new Response(audio, {
      headers: {
        'content-type': 'audio/mpeg',
        'cache-control': 'no-store',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Voice AI failed.';
    return c.json({ error: message.slice(0, 300) }, 500);
  }
});

async function transcribeAudio(env: EnvWithVoiceAi, file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file, file.name || 'voice.webm');
  form.append('model', 'whisper-1');

  const response = await fetch(`${OPENAI_BASE_URL}/audio/transcriptions`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: form,
  });

  const data = await response.json().catch(() => null) as TranscriptionResult | null;

  if (!response.ok) {
    throw new Error(data?.error?.message || `Transcription failed with ${response.status}`);
  }

  const text = String(data?.text || '').trim();

  if (!text) {
    throw new Error('Could not understand the voice message.');
  }

  return text;
}

async function createSpeech(env: EnvWithVoiceAi, text: string): Promise<ArrayBuffer> {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_AI_ELEVENLABS_VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': env.ELEVENLABS_API_KEY || '',
      'content-type': 'application/json',
      accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_v3',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs failed with ${response.status}`);
  }

  return response.arrayBuffer();
}
