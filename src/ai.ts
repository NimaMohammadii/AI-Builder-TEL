import type { BotBlueprint, Env } from './types';
import { OPENAI_BASE_URL, OPENAI_MODEL } from './utils';

const blueprintSchemaHint = `Return only valid JSON matching this shape:
{
  "version": 1,
  "botType": "sales" | "support" | "vip" | "custom",
  "language": "fa" | "en" | "multi",
  "tone": "friendly" | "formal" | "premium" | "bold",
  "startScreen": "home",
  "screens": [
    {
      "id": "home",
      "title": "...",
      "message": "...",
      "buttons": [
        { "text": "...", "action": { "type": "products" } },
        { "text": "...", "action": { "type": "support" } },
        { "text": "...", "action": { "type": "ai_chat", "prompt": "..." } },
        { "text": "...", "action": { "type": "menu", "target": "about" } }
      ]
    }
  ],
  "aiSupport": {
    "enabled": true,
    "systemPrompt": "...",
    "handoffMessage": "..."
  },
  "safety": {
    "blockedTopics": ["phishing", "credential theft", "financial scam", "spam"],
    "requireHumanFor": ["refund", "legal", "medical", "high risk financial advice"]
  }
}`;

export function defaultBlueprint(prompt: string): BotBlueprint {
  return {
    version: 1,
    botType: 'custom',
    language: 'fa',
    tone: 'premium',
    startScreen: 'home',
    screens: [
      {
        id: 'home',
        title: 'خانه',
        message: `سلام. من ربات هوشمند شما هستم.\n\nهدف ربات: ${prompt.slice(0, 600)}`,
        buttons: [
          { text: 'محصولات / خدمات', action: { type: 'products' } },
          { text: 'پشتیبانی هوشمند', action: { type: 'support' } },
          { text: 'درباره ما', action: { type: 'menu', target: 'about' } },
        ],
      },
      {
        id: 'about',
        title: 'درباره ما',
        message: 'این ربات با AI Builder TEL ساخته شده و قابل توسعه است.',
        buttons: [{ text: 'بازگشت', action: { type: 'menu', target: 'home' } }],
      },
    ],
    aiSupport: {
      enabled: true,
      systemPrompt: 'You are a helpful Telegram business assistant. Be concise, safe, and practical.',
      handoffMessage: 'این مورد نیاز به بررسی ادمین دارد. پیام شما ثبت شد.',
    },
    safety: {
      blockedTopics: ['phishing', 'credential theft', 'spam', 'financial scam'],
      requireHumanFor: ['refund', 'legal', 'medical', 'high risk financial advice'],
    },
  };
}

export async function buildBlueprint(env: Env, userPrompt: string): Promise<BotBlueprint> {
  if (!env.OPENAI_API_KEY) return defaultBlueprint(userPrompt);

  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.35,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You design production-grade Telegram bot blueprints for a no-code builder. Never create phishing, spam, credential theft, impersonation, or scam flows. Keep UI concise. Prefer Persian unless user asks otherwise. ' + blueprintSchemaHint,
        },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) return defaultBlueprint(userPrompt);
  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) return defaultBlueprint(userPrompt);

  try {
    const parsed = JSON.parse(content) as BotBlueprint;
    return normalizeBlueprint(parsed, userPrompt);
  } catch {
    return defaultBlueprint(userPrompt);
  }
}

export async function aiReply(env: Env, systemPrompt: string, message: string): Promise<string> {
  if (!env.OPENAI_API_KEY) return 'پاسخ AI هنوز فعال نشده. OPENAI_API_KEY را در Cloudflare Secrets تنظیم کن.';

  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.45,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
    }),
  });

  if (!response.ok) return 'فعلاً نتونستم جواب AI بسازم. چند لحظه بعد دوباره امتحان کن.';
  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content?.slice(0, 3500) ?? 'جوابی تولید نشد.';
}

function normalizeBlueprint(input: Partial<BotBlueprint>, prompt: string): BotBlueprint {
  const fallback = defaultBlueprint(prompt);
  const screens = Array.isArray(input.screens) && input.screens.length > 0 ? input.screens : fallback.screens;
  const hasStart = screens.some((screen) => screen.id === (input.startScreen ?? 'home'));

  return {
    version: 1,
    botType: input.botType ?? fallback.botType,
    language: input.language ?? fallback.language,
    tone: input.tone ?? fallback.tone,
    startScreen: hasStart ? input.startScreen ?? 'home' : screens[0]?.id ?? 'home',
    screens,
    aiSupport: input.aiSupport ?? fallback.aiSupport,
    safety: input.safety ?? fallback.safety,
  };
}
