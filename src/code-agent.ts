import type { ChatHistoryMessage } from './ai';
import type { Env } from './types';
import { OPENAI_BASE_URL, OPENAI_MODEL, id, safeParseJson } from './utils';

export type CodeAgentBotContext = {
  id: string;
  title: string;
  username: string | null;
  status: string;
  updated_at: string;
  settings_json?: string;
};

export type CodeAgentPlan = {
  mode: 'safe_edit' | 'feature_build' | 'infra_change';
  summary: string;
  targetBotId: string | null;
  needsCode: boolean;
  filesToTouch: string[];
  migrations: string[];
  tests: string[];
  risks: string[];
  steps: string[];
};

type ResponsesApiResult = {
  output_text?: string;
  output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>;
};

export async function createCodeAgentJob(env: Env, ownerTelegramId: string, userRequest: string, history: ChatHistoryMessage[], bots: CodeAgentBotContext[]): Promise<{ jobId: string; plan: CodeAgentPlan; message: string }> {
  const plan = await planCodeChange(env, userRequest, history, bots);
  const jobId = id('job');
  await env.DB.prepare('INSERT INTO agent_jobs (id, owner_telegram_id, bot_id, status, mode, user_request, plan_json, logs_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(jobId, ownerTelegramId, plan.targetBotId, 'awaiting_approval', plan.mode, userRequest, JSON.stringify(plan), JSON.stringify([{ at: new Date().toISOString(), event: 'planned' }]))
    .run();
  return { jobId, plan, message: renderPlanMessage(plan) };
}

export async function getCodeAgentJob(env: Env, jobId: string): Promise<{ id: string; owner_telegram_id: string; bot_id: string | null; status: string; mode: string; user_request: string; plan_json: string; result_json: string; logs_json: string } | null> {
  return (await env.DB.prepare('SELECT id, owner_telegram_id, bot_id, status, mode, user_request, plan_json, result_json, logs_json FROM agent_jobs WHERE id = ?').bind(jobId).first()) ?? null;
}

export async function markCodeAgentJobRejected(env: Env, jobId: string): Promise<void> {
  await env.DB.prepare("UPDATE agent_jobs SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(jobId).run();
}

export async function markCodeAgentJobQueued(env: Env, jobId: string): Promise<void> {
  const branchName = `agent/${jobId}`;
  await env.DB.prepare("UPDATE agent_jobs SET status = 'queued', branch_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(branchName, jobId).run();
}

export function renderPlanMessage(plan: CodeAgentPlan): string {
  const parts = [
    `I need to make real code changes for this.`,
    `Plan: ${plan.summary}`,
    plan.steps.length ? `Steps:\n${plan.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}` : '',
    plan.filesToTouch.length ? `Files: ${plan.filesToTouch.join(', ')}` : '',
    plan.migrations.length ? `Database: ${plan.migrations.join(', ')}` : '',
    plan.risks.length ? `Risks: ${plan.risks.join(', ')}` : '',
    `Confirm to create a code job, or reject to cancel.`,
  ].filter(Boolean);
  return parts.join('\n\n').slice(0, 3500);
}

export function parsePlan(value: string): CodeAgentPlan {
  return normalizePlan(safeParseJson<Partial<CodeAgentPlan>>(value, {}), []);
}

async function planCodeChange(env: Env, userRequest: string, history: ChatHistoryMessage[], bots: CodeAgentBotContext[]): Promise<CodeAgentPlan> {
  if (!env.OPENAI_API_KEY) return fallbackPlan(userRequest, bots);
  const response = await fetch(`${OPENAI_BASE_URL}/responses`, {
    method: 'POST',
    headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      instructions: [
        'You are the code-agent planner for AI Builder TEL.',
        'The user wants the agent to build real features by editing the repository, not only changing flow JSON.',
        'Create a safe technical plan. Do not write code here. Return only strict JSON.',
        'Choose mode: safe_edit for small project edits, feature_build for new capabilities, infra_change for database/deploy/security changes.',
        'If a connected bot is clearly targeted, set targetBotId. Otherwise use the latest bot if the request refers to their bot.',
        'JSON shape: {"mode":"safe_edit|feature_build|infra_change","summary":"...","targetBotId":string|null,"needsCode":true,"filesToTouch":[...],"migrations":[...],"tests":[...],"risks":[...],"steps":[...]}',
      ].join('\n'),
      input: JSON.stringify({ userRequest, recentHistory: history.slice(-12), dashboardBots: bots.map((bot) => ({ id: bot.id, title: bot.title, username: bot.username, status: bot.status, updated_at: bot.updated_at })) }),
      max_output_tokens: 900,
      reasoning: { effort: 'low' },
    }),
  });
  const data = (await response.json().catch(() => null)) as ResponsesApiResult | null;
  const text = data ? extractText(data) : null;
  if (!response.ok || !text) return fallbackPlan(userRequest, bots);
  try {
    return normalizePlan(JSON.parse(extractJson(text)) as Partial<CodeAgentPlan>, bots);
  } catch {
    return fallbackPlan(userRequest, bots);
  }
}

function normalizePlan(input: Partial<CodeAgentPlan>, bots: CodeAgentBotContext[]): CodeAgentPlan {
  const modes = new Set(['safe_edit', 'feature_build', 'infra_change']);
  const botIds = new Set(bots.map((bot) => bot.id));
  return {
    mode: modes.has(String(input.mode)) ? input.mode as CodeAgentPlan['mode'] : 'feature_build',
    summary: typeof input.summary === 'string' && input.summary.trim() ? input.summary.slice(0, 500) : 'Build the requested bot capability with real code changes.',
    targetBotId: input.targetBotId && botIds.has(input.targetBotId) ? input.targetBotId : bots[0]?.id ?? null,
    needsCode: input.needsCode !== false,
    filesToTouch: cleanList(input.filesToTouch, ['src/index.ts', 'src/telegram.ts']),
    migrations: cleanList(input.migrations, []),
    tests: cleanList(input.tests, ['npm run build']),
    risks: cleanList(input.risks, ['Requires review before deploy']),
    steps: cleanList(input.steps, ['Create a branch', 'Edit the code', 'Run build/tests', 'Ask for deploy approval']),
  };
}

function fallbackPlan(userRequest: string, bots: CodeAgentBotContext[]): CodeAgentPlan {
  return normalizePlan({ summary: `Build this requested capability with real code: ${userRequest.slice(0, 220)}`, targetBotId: bots[0]?.id ?? null, needsCode: true }, bots);
}

function cleanList(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  return value.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.slice(0, 160)).slice(0, 12);
}

function extractText(data: ResponsesApiResult): string | null {
  if (data.output_text) return data.output_text;
  for (const item of data.output ?? []) {
    if (item.type !== 'message') continue;
    for (const content of item.content ?? []) if (content.type === 'output_text' && content.text) return content.text;
  }
  return null;
}

function extractJson(value: string): string {
  const cleaned = value.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  return start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
}
