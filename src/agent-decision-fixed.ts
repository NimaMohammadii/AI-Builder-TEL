import type { ChatHistoryMessage } from './ai';
import type { Env } from './types';
import { OPENAI_BASE_URL, OPENAI_MODEL } from './utils';

export type AgentDashboardBot = {
  id: string;
  title: string;
  username: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  flowName?: string | null;
  flowDescription?: string | null;
};

export type AgentDecision = {
  action: 'reply' | 'edit_bot' | 'publish_bot' | 'activate_bot' | 'pause_bot';
  targetBotId: string | null;
  confidence: number;
  reason: string;
};

type ResponsesApiResult = { output_text?: string; output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }> };

export async function decideBuilderAgentAction(env: Env, userText: string, history: ChatHistoryMessage[], bots: AgentDashboardBot[]): Promise<AgentDecision> {
  if (!env.OPENAI_API_KEY) return fallback(userText, bots);
  try {
    const response = await fetch(`${OPENAI_BASE_URL}/responses`, {
      method: 'POST',
      headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        instructions: [
          'Return strict JSON only.',
          'You are the intent router for a real Telegram bot builder agent.',
          'The user may speak naturally, indirectly, or in Persian. You must infer their intent from meaning, not keywords.',
          'Choose one action: reply, edit_bot, publish_bot, activate_bot, pause_bot.',
          'Choose edit_bot whenever the user wants the connected bot to be created, built, changed, reset, configured, extended, or made to behave differently.',
          'Choose edit_bot even when the current flow is empty. Empty flow means the bot is waiting to be built, not that the user needs instructions.',
          'Do not answer with guidance when the user is asking the agent to do the work. Route to edit_bot so the system can create a confirmation proposal and then apply the change.',
          'Choose reply only for questions, explanations, status checks, or conversation where no real bot change is requested.',
          'Choose publish_bot, activate_bot, or pause_bot only when the user clearly asks for those state/webhook actions.',
          'A normal reply must never say a real bot change has been applied.',
          'Runtime source of truth is settings.flow only.',
          'If the user refers to their bot and a connected bot exists, choose the latest bot unless the user clearly identifies another bot.',
          'Shape: {"action":"reply|edit_bot|publish_bot|activate_bot|pause_bot","targetBotId":string|null,"confidence":0.0-1.0,"reason":"short"}',
        ].join('\n'),
        input: JSON.stringify({ bots, latest_bot_id: bots[0]?.id ?? null, recent_history: history.slice(-12), latest_user_message: userText }),
        max_output_tokens: 220,
      }),
    });
    const data = (await response.json().catch(() => null)) as ResponsesApiResult | null;
    const text = data ? extractText(data) : null;
    if (!response.ok || !text) return fallback(userText, bots);
    const parsed = JSON.parse(extractJson(text)) as Partial<AgentDecision>;
    return normalize(parsed, userText, bots);
  } catch {
    return fallback(userText, bots);
  }
}

function normalize(input: Partial<AgentDecision>, userText: string, bots: AgentDashboardBot[]): AgentDecision {
  const allowed = new Set(['reply', 'edit_bot', 'publish_bot', 'activate_bot', 'pause_bot']);
  let action = allowed.has(String(input.action)) ? input.action as AgentDecision['action'] : 'reply';
  if (action === 'reply' && bots.length && isEditIntent(userText)) action = 'edit_bot';
  const validIds = new Set(bots.map((b) => b.id));
  const targetBotId = input.targetBotId && validIds.has(input.targetBotId) ? input.targetBotId : (action === 'reply' ? null : bots[0]?.id ?? null);
  return { action, targetBotId, confidence: typeof input.confidence === 'number' ? Math.max(0, Math.min(1, input.confidence)) : 0.5, reason: typeof input.reason === 'string' ? input.reason.slice(0, 160) : 'decision' };
}

function fallback(userText: string, bots: AgentDashboardBot[]): AgentDecision {
  if (bots.length && isEditIntent(userText)) return { action: 'edit_bot', targetBotId: bots[0].id, confidence: 0.55, reason: 'forced real edit path' };
  return { action: 'reply', targetBotId: null, confidence: 0.2, reason: 'fallback reply' };
}

function isEditIntent(text: string): boolean {
  const t = text.toLowerCase();
  return ['ربات','تلگرام','منو','دکمه','بساز','ساخت','اضافه','حذف','تغییر','ویرایش','پرداخت','استار','فرم','پیام','bot','telegram','menu','button','build','create','add','remove','edit','change','payment','stars','form','flow'].some((word) => t.includes(word));
}

function extractText(data: ResponsesApiResult): string | null {
  if (data.output_text) return data.output_text;
  for (const item of data.output ?? []) for (const content of item.content ?? []) if (content.type === 'output_text' && content.text) return content.text;
  return null;
}

function extractJson(value: string): string {
  const cleaned = value.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  return start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
}
