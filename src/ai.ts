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
    language: 'en',
    tone: 'premium',
    startScreen: 'home',
    screens: [
      {
        id: 'home',
        title: 'Home',
        message: `Welcome. This bot is powered by AI.\n\nPurpose: ${prompt.slice(0, 600)}`,
        buttons: [
          { text: 'Products / Services', action: { type: 'products' } },
          { text: 'AI Support', action: { type: 'support' } },
          { text: 'About', action: { type: 'menu', target: 'about' } },
        ],
      },
      {
        id: 'about',
        title: 'About',
        message: 'This bot was built with AI Builder TEL and can be improved from the Mini App workspace.',
        buttons: [{ text: 'Back', action: { type: 'menu', target: 'home' } }],
      },
    ],
    aiSupport: {
      enabled: true,
      systemPrompt: 'You are a helpful Telegram business assistant. Be concise, safe, and practical.',
      handoffMessage: 'This needs a human review. Your message has been saved.',
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
            'You design production-grade Telegram bot blueprints for a no-code builder. Never create phishing, spam, credential theft, impersonation, or scam flows. Keep UI concise. Use English UI copy unless the user explicitly asks for another language. ' + blueprintSchemaHint,
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

export async function improveBlueprint(env: Env, currentBlueprint: BotBlueprint, instruction: string): Promise<{ blueprint: BotBlueprint; summary: string }> {
  if (!env.OPENAI_API_KEY) {
    return { blueprint: currentBlueprint, summary: 'AI is not configured yet.' };
  }

  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.25,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are the AI engineer inside a no-code Telegram bot builder. Apply the user request to the existing bot blueprint. Return only JSON with keys "summary" and "blueprint". Never add unsafe phishing, credential theft, spam, impersonation, or scam behavior. The blueprint must match this schema: ' + blueprintSchemaHint,
        },
        {
          role: 'user',
          content: JSON.stringify({ currentBlueprint, instruction }),
        },
      ],
    }),
  });

  if (!response.ok) return { blueprint: currentBlueprint, summary: 'I could not apply the change. Please try again.' };
  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) return { blueprint: currentBlueprint, summary: 'No change was produced.' };

  try {
    const parsed = JSON.parse(content) as { blueprint?: BotBlueprint; summary?: string };
    const blueprint = normalizeBlueprint(parsed.blueprint ?? currentBlueprint, instruction);
    return { blueprint, summary: parsed.summary ?? 'Changes applied.' };
  } catch {
    return { blueprint: currentBlueprint, summary: 'I could not parse the AI change safely.' };
  }
}

export async function aiReply(env: Env, systemPrompt: string, message: string): Promise<string> {
  if (!env.OPENAI_API_KEY) return 'AI is not configured yet. Set OPENAI_API_KEY in Cloudflare Secrets.';

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

  if (!response.ok) return 'I could not generate a response right now. Please try again.';
  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content?.slice(0, 3500) ?? 'No response was generated.';
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
