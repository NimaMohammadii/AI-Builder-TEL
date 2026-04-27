import type { AppConfig, BotProgram } from './types';

export function defaultProgram(prompt = 'مثل یک ربات تلگرام حرفه‌ای پاسخ بده.'): BotProgram {
  return {
    version: 1,
    welcomeText: 'سلام 👋\nبه ربات خوش اومدی. از دکمه‌های زیر استفاده کن یا پیامت رو بنویس.',
    aiInstructions: prompt,
    buttons: [
      { label: 'راهنما', command: 'help', response: 'راهنما آماده است. درخواستت را بنویس تا راهنمایی‌ات کنم.' }
    ],
    flows: [],
    fallbackText: 'این پیام برای ربات تعریف نشده. از دکمه‌ها استفاده کن یا پیام واضح‌تری بفرست.'
  };
}

export async function planBotProgram(config: AppConfig, input: { ownerRequest: string; currentProgram?: BotProgram | null }): Promise<BotProgram> {
  const fallback = input.currentProgram ?? defaultProgram(input.ownerRequest);
  const prompt = [
    'You build executable Telegram bot programs for a no-code builder.',
    'Return JSON only. No markdown, no explanation.',
    'Schema:',
    JSON.stringify({
      version: 1,
      welcomeText: 'string',
      aiInstructions: 'string',
      buttons: [{ label: 'string', command: 'english_slug', response: 'string', flowId: 'optional_flow_id' }],
      flows: [{
        id: 'english_id',
        title: 'string',
        triggerLabels: ['button label'],
        triggerCommands: ['english_command'],
        steps: [
          { id: 'ask_name', kind: 'ask', text: 'question text', field: 'name', next: 'ask_phone' },
          { id: 'done', kind: 'end', text: 'done' }
        ],
        summaryText: '✅ ثبت شد:\n{summary}'
      }],
      fallbackText: 'string'
    }),
    'Rules:',
    '- If owner asks for anything multi-step, create a real flow with ask steps.',
    '- Buttons that start flows must include flowId.',
    '- Keep existing useful program parts unless owner asks reset.',
    '- Use Persian for user-facing texts.',
    '- Customer bots must never include builder/admin/connect features unless explicitly requested for that customer bot.',
    'Current program:',
    JSON.stringify(input.currentProgram ?? null),
    'Owner request:',
    input.ownerRequest
  ].join('\n');

  try {
    const text = await callOpenAI(config, prompt, 5200);
    return normalizeProgram(JSON.parse(extractJson(text)), fallback);
  } catch {
    return fallback;
  }
}

export async function answerWithAI(config: AppConfig, input: { program: BotProgram; userText: string }): Promise<string> {
  const prompt = [
    'You are the AI fallback for a Telegram bot. Answer only as the customer bot.',
    'Do not output code or JSON.',
    'Program instructions:',
    input.program.aiInstructions,
    'Buttons:',
    input.program.buttons.map((b) => `${b.label}: ${b.response}`).join('\n'),
    'User message:',
    input.userText
  ].join('\n');
  try {
    return (await callOpenAI(config, prompt, 900)).slice(0, 3500);
  } catch {
    return input.program.fallbackText;
  }
}

async function callOpenAI(config: AppConfig, prompt: string, maxOutputTokens: number): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${config.openAiApiKey}`
    },
    body: JSON.stringify({
      model: config.openAiModel,
      input: [
        { role: 'system', content: [{ type: 'input_text', text: 'Follow the user instruction exactly.' }] },
        { role: 'user', content: [{ type: 'input_text', text: prompt }] }
      ],
      max_output_tokens: maxOutputTokens
    })
  });
  const payload = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
  if (!response.ok) throw new Error('openai_failed');
  if (payload.output_text) return payload.output_text;
  const chunks: string[] = [];
  for (const item of payload.output ?? []) for (const content of item.content ?? []) if (content.text) chunks.push(content.text);
  return chunks.join('\n');
}

function extractJson(text: string): string {
  const clean = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('no_json');
  return clean.slice(start, end + 1);
}

export function normalizeProgram(raw: unknown, fallback: BotProgram): BotProgram {
  const input = raw as Partial<BotProgram>;
  const buttons = Array.isArray(input.buttons) ? input.buttons.map((b) => ({
    label: String(b.label ?? '').trim().slice(0, 80),
    command: slug(String(b.command ?? b.label ?? 'menu')),
    response: String(b.response ?? '').trim().slice(0, 1500) || 'انتخاب شد.',
    flowId: b.flowId ? slug(String(b.flowId)) : undefined
  })).filter((b) => b.label) : fallback.buttons;
  const flows = Array.isArray(input.flows) ? input.flows.map((f) => ({
    id: slug(String(f.id ?? f.title ?? 'flow')),
    title: String(f.title ?? f.id ?? 'Flow').slice(0, 120),
    triggerLabels: Array.isArray(f.triggerLabels) ? f.triggerLabels.map(String).slice(0, 10) : [],
    triggerCommands: Array.isArray(f.triggerCommands) ? f.triggerCommands.map((x) => slug(String(x))).slice(0, 10) : [],
    steps: Array.isArray(f.steps) ? f.steps.map((s) => ({
      id: slug(String(s.id ?? s.field ?? 'step')),
      kind: ['ask', 'message', 'end'].includes(String(s.kind)) ? s.kind : 'ask',
      text: String(s.text ?? '').slice(0, 1000),
      field: s.field ? slug(String(s.field)) : undefined,
      next: s.next ? slug(String(s.next)) : undefined
    })).filter((s) => s.text) : [],
    summaryText: String(f.summaryText ?? '✅ ثبت شد:\n{summary}').slice(0, 1200)
  })).filter((f) => f.id && f.steps.length) : fallback.flows;
  return {
    version: 1,
    welcomeText: String(input.welcomeText ?? fallback.welcomeText).slice(0, 1800),
    aiInstructions: String(input.aiInstructions ?? fallback.aiInstructions).slice(0, 9000),
    buttons: buttons.length ? buttons : fallback.buttons,
    flows,
    fallbackText: String(input.fallbackText ?? fallback.fallbackText).slice(0, 1000)
  };
}

function slug(value: string): string {
  return value.toLowerCase().replace(/^\/+/, '').replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 48) || 'item';
}
