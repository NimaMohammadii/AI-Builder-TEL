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

type ResponsesApiResult = {
  output_text?: string;
  output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>;
};

export async function decideBuilderAgentAction(env: Env, userText: string, history: ChatHistoryMessage[], bots: AgentDashboardBot[]): Promise<AgentDecision> {
  if (!env.OPENAI_API_KEY) return fallbackDecision(bots);

  const dashboard = {
    connected_bots_count: bots.length,
    bots,
    latest_bot_id: bots[0]?.id ?? null,
  };

  const response = await fetch(`${OPENAI_BASE_URL}/responses`, {
    method: 'POST',
    headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      instructions: [
        'You are the action planner for a Telegram bot-builder agent.',
        'Read the dashboard data, connected bots, recent chat history, and the latest user message.',
        'Decide what the agent should do next for the user Telegram bot.',
        'Return only JSON. No markdown. No explanation outside JSON.',
        'Allowed actions: reply, edit_bot, publish_bot, activate_bot, pause_bot.',
        'Use edit_bot whenever the user wants to change, build, reset, recreate, add, remove, configure, or improve their Telegram bot behavior.',
        'The bot runtime is driven by DB state: blueprint_json and settings.flow. Real bot changes must be made there, not in the repository.',
        'Use targetBotId only when a connected bot should be acted on. If the user refers to their bot without naming it, choose the latest connected bot.',
        'If no connected bot exists and the user wants bot work, choose reply with targetBotId null.',
        'Do not rely on keyword matching; infer intent from meaning and conversation context.',
        'JSON shape: {"action":"reply|edit_bot|publish_bot|activate_bot|pause_bot","targetBotId":string|null,"confidence":0.0-1.0,"reason":"short"}',
      ].join('\n'),
      input: JSON.stringify({ dashboard, recent_history: history.slice(-12), latest_user_message: userText }),
      max_output_tokens: 220,
      reasoning: { effort: 'low' },
    }),
  });

  const data = (await response.json().catch(() => null)) as ResponsesApiResult | null;
  const text = data ? extractText(data) : null;
  if (!response.ok || !text) return fallbackDecision(bots);

  try {
    const parsed = JSON.parse(text) as Partial<AgentDecision>;
    return normalizeDecision(parsed, bots);
  } catch {
    return fallbackDecision(bots);
  }
}

function normalizeDecision(input: Partial<AgentDecision>, bots: AgentDashboardBot[]): AgentDecision {
  const allowed = new Set(['reply', 'edit_bot', 'publish_bot', 'activate_bot', 'pause_bot']);
  const action = allowed.has(String(input.action)) ? input.action as AgentDecision['action'] : 'reply';
  const botIds = new Set(bots.map((bot) => bot.id));
  const targetBotId = input.targetBotId && botIds.has(input.targetBotId) ? input.targetBotId : (action === 'reply' ? null : bots[0]?.id ?? null);
  return {
    action,
    targetBotId,
    confidence: typeof input.confidence === 'number' ? Math.max(0, Math.min(1, input.confidence)) : 0.5,
    reason: typeof input.reason === 'string' ? input.reason.slice(0, 160) : 'AI decision',
  };
}

function fallbackDecision(bots: AgentDashboardBot[]): AgentDecision {
  return { action: 'reply', targetBotId: bots[0]?.id ?? null, confidence: 0.2, reason: 'planner fallback' };
}

function extractText(data: ResponsesApiResult): string | null {
  if (data.output_text) return data.output_text;
  for (const item of data.output ?? []) {
    if (item.type !== 'message') continue;
    for (const content of item.content ?? []) {
      if (content.type === 'output_text' && content.text) return content.text;
    }
  }
  return null;
}
