import type { Env } from '../types/env';
import { getDb } from '../db/client';
import type { RuntimeBotConfig, RuntimeButton } from './bot-runtime-config';

export type ProgramStepKind = 'ask' | 'message' | 'end';

export interface BotProgramButton extends RuntimeButton {
  flowId?: string;
}

export interface BotProgramStep {
  id: string;
  kind: ProgramStepKind;
  text: string;
  field?: string;
  next?: string;
}

export interface BotProgramFlow {
  id: string;
  title: string;
  triggerLabels?: string[];
  triggerCommands?: string[];
  steps: BotProgramStep[];
  summaryText?: string;
}

export interface BotProgram {
  version: number;
  welcomeText: string;
  aiInstructions: string;
  buttons: BotProgramButton[];
  flows: BotProgramFlow[];
  fallback: {
    aiEnabled: boolean;
    text: string;
  };
}

export interface ProgramExecutionResult {
  handled: boolean;
  text?: string;
  program?: BotProgram;
}

interface SessionState {
  flowId: string;
  stepId: string;
  data: Record<string, string>;
}

export function runtimeConfigFromProgram(program: BotProgram): RuntimeBotConfig {
  return {
    welcomeText: program.welcomeText,
    aiInstructions: program.aiInstructions,
    buttons: program.buttons.map((button) => ({ label: button.label, command: button.command, response: button.response }))
  };
}

export function programFromRuntimeConfig(config: RuntimeBotConfig): BotProgram {
  return {
    version: 1,
    welcomeText: config.welcomeText,
    aiInstructions: config.aiInstructions ?? '',
    buttons: config.buttons.map((button) => ({ ...button })),
    flows: [],
    fallback: {
      aiEnabled: true,
      text: 'این پیام برای ربات تعریف نشده. از دکمه‌ها یا دستورهای موجود استفاده کن.'
    }
  };
}

export function normalizeBotProgram(value: unknown, fallbackConfig: RuntimeBotConfig): BotProgram {
  const input = (value ?? {}) as Partial<BotProgram>;
  const buttonsSource = Array.isArray(input.buttons) ? input.buttons : fallbackConfig.buttons;
  const buttons = buttonsSource.map((button) => normalizeButton(button)).filter(Boolean) as BotProgramButton[];
  const flows = Array.isArray(input.flows) ? input.flows.map((flow) => normalizeFlow(flow)).filter(Boolean) as BotProgramFlow[] : [];
  return {
    version: Number(input.version ?? 1) || 1,
    welcomeText: String(input.welcomeText ?? fallbackConfig.welcomeText ?? 'سلام، خوش آمدید.').slice(0, 1800),
    aiInstructions: String(input.aiInstructions ?? fallbackConfig.aiInstructions ?? '').slice(0, 9000),
    buttons: buttons.length ? buttons : fallbackConfig.buttons.map((button) => ({ ...button })),
    flows,
    fallback: {
      aiEnabled: input.fallback?.aiEnabled !== false,
      text: String(input.fallback?.text ?? 'این پیام برای ربات تعریف نشده. از دکمه‌ها یا دستورهای موجود استفاده کن.').slice(0, 1000)
    }
  };
}

export async function executeBotProgram(env: Env, input: { botId: string; chatId: number; text: string; program: BotProgram }): Promise<ProgramExecutionResult> {
  const text = input.text.trim();
  if (!text) return { handled: true, text: input.program.fallback.text, program: input.program };

  if (isStart(text)) {
    await clearProgramSession(env, input.botId, input.chatId);
    return { handled: true, text: input.program.welcomeText, program: input.program };
  }

  const activeSession = await getProgramSession(env, input.botId, input.chatId);
  if (activeSession) {
    const result = await continueFlow(env, input.botId, input.chatId, input.program, activeSession, text);
    return { handled: true, text: result, program: input.program };
  }

  const flow = findTriggeredFlow(input.program, text);
  if (flow) {
    const firstStep = flow.steps[0];
    if (!firstStep) return { handled: true, text: input.program.fallback.text, program: input.program };
    if (firstStep.kind === 'ask') {
      await saveProgramSession(env, input.botId, input.chatId, { flowId: flow.id, stepId: firstStep.id, data: {} });
      return { handled: true, text: firstStep.text, program: input.program };
    }
    if (firstStep.kind === 'message') {
      const next = nextStep(flow, firstStep);
      if (next?.kind === 'ask') await saveProgramSession(env, input.botId, input.chatId, { flowId: flow.id, stepId: next.id, data: {} });
      return { handled: true, text: [firstStep.text, next?.kind === 'ask' ? next.text : ''].filter(Boolean).join('\n\n'), program: input.program };
    }
    return { handled: true, text: renderSummary(flow, {}), program: input.program };
  }

  const button = input.program.buttons.find((item) => item.label === text || `/${item.command}` === text);
  if (button) return { handled: true, text: button.response, program: input.program };

  return { handled: false, text: input.program.fallback.text, program: input.program };
}

async function continueFlow(env: Env, botId: string, chatId: number, program: BotProgram, session: SessionState, userText: string): Promise<string> {
  const flow = program.flows.find((item) => item.id === session.flowId);
  if (!flow) {
    await clearProgramSession(env, botId, chatId);
    return program.fallback.text;
  }
  const step = flow.steps.find((item) => item.id === session.stepId);
  if (!step) {
    await clearProgramSession(env, botId, chatId);
    return program.fallback.text;
  }

  const data = { ...session.data };
  if (step.kind === 'ask' && step.field) data[step.field] = userText;
  const next = nextStep(flow, step);
  if (!next || next.kind === 'end') {
    await clearProgramSession(env, botId, chatId);
    return renderSummary(flow, data);
  }
  if (next.kind === 'message') {
    const afterMessage = nextStep(flow, next);
    if (afterMessage?.kind === 'ask') {
      await saveProgramSession(env, botId, chatId, { flowId: flow.id, stepId: afterMessage.id, data });
      return [renderTemplate(next.text, data), afterMessage.text].filter(Boolean).join('\n\n');
    }
    await clearProgramSession(env, botId, chatId);
    return renderTemplate(next.text, data);
  }
  await saveProgramSession(env, botId, chatId, { flowId: flow.id, stepId: next.id, data });
  return next.text;
}

function findTriggeredFlow(program: BotProgram, text: string): BotProgramFlow | null {
  const command = text.startsWith('/') ? text.slice(1).toLowerCase() : '';
  return program.flows.find((flow) =>
    flow.triggerLabels?.some((label) => label === text) ||
    flow.triggerCommands?.some((item) => item.toLowerCase() === command) ||
    program.buttons.some((button) => button.flowId === flow.id && (button.label === text || button.command === command))
  ) ?? null;
}

function nextStep(flow: BotProgramFlow, step: BotProgramStep): BotProgramStep | null {
  if (step.next) return flow.steps.find((item) => item.id === step.next) ?? null;
  const index = flow.steps.findIndex((item) => item.id === step.id);
  return index >= 0 ? flow.steps[index + 1] ?? null : null;
}

function renderSummary(flow: BotProgramFlow, data: Record<string, string>): string {
  const template = flow.summaryText || '✅ اطلاعات ثبت شد.\n{summary}';
  const summary = Object.entries(data).map(([key, value]) => `• ${key}: ${value}`).join('\n');
  return renderTemplate(template, { ...data, summary });
}

function renderTemplate(template: string, data: Record<string, string>): string {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => data[key] ?? '');
}

async function saveProgramSession(env: Env, botId: string, chatId: number, state: SessionState): Promise<void> {
  const db = await ensureStateTable(env);
  if (!db) return;
  await db.prepare("INSERT INTO bot_program_sessions (bot_id, chat_id, flow_id, step_id, data, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(bot_id, chat_id) DO UPDATE SET flow_id = excluded.flow_id, step_id = excluded.step_id, data = excluded.data, updated_at = CURRENT_TIMESTAMP")
    .bind(botId, chatId, state.flowId, state.stepId, JSON.stringify(state.data))
    .run();
}

async function getProgramSession(env: Env, botId: string, chatId: number): Promise<SessionState | null> {
  const db = await ensureStateTable(env);
  if (!db) return null;
  const row = await db.prepare("SELECT flow_id, step_id, data FROM bot_program_sessions WHERE bot_id = ? AND chat_id = ? LIMIT 1")
    .bind(botId, chatId)
    .first<{ flow_id: string; step_id: string; data: string }>();
  if (!row) return null;
  try { return { flowId: row.flow_id, stepId: row.step_id, data: JSON.parse(row.data || '{}') }; } catch { return { flowId: row.flow_id, stepId: row.step_id, data: {} }; }
}

async function clearProgramSession(env: Env, botId: string, chatId: number): Promise<void> {
  const db = await ensureStateTable(env);
  if (!db) return;
  await db.prepare("DELETE FROM bot_program_sessions WHERE bot_id = ? AND chat_id = ?").bind(botId, chatId).run();
}

async function ensureStateTable(env: Env): Promise<D1Database | null> {
  const db = getDb(env);
  if (!db) return null;
  await db.prepare("CREATE TABLE IF NOT EXISTS bot_program_sessions (bot_id TEXT NOT NULL, chat_id INTEGER NOT NULL, flow_id TEXT NOT NULL, step_id TEXT NOT NULL, data TEXT NOT NULL DEFAULT '{}', updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (bot_id, chat_id))").run();
  return db;
}

function normalizeButton(value: unknown): BotProgramButton | null {
  const input = value as Partial<BotProgramButton>;
  const label = String(input.label ?? '').trim().slice(0, 80);
  if (!label) return null;
  return {
    label,
    command: sanitizeCommand(String(input.command ?? label)),
    response: String(input.response ?? '').trim().slice(0, 1800) || label,
    flowId: input.flowId ? sanitizeId(String(input.flowId)) : undefined
  };
}

function normalizeFlow(value: unknown): BotProgramFlow | null {
  const input = value as Partial<BotProgramFlow>;
  const id = sanitizeId(String(input.id ?? input.title ?? 'flow'));
  const steps = Array.isArray(input.steps) ? input.steps.map((step) => normalizeStep(step)).filter(Boolean) as BotProgramStep[] : [];
  if (!id || !steps.length) return null;
  return {
    id,
    title: String(input.title ?? id).slice(0, 120),
    triggerLabels: Array.isArray(input.triggerLabels) ? input.triggerLabels.map(String).slice(0, 10) : [],
    triggerCommands: Array.isArray(input.triggerCommands) ? input.triggerCommands.map((item) => sanitizeCommand(String(item))).slice(0, 10) : [],
    steps,
    summaryText: input.summaryText ? String(input.summaryText).slice(0, 1200) : undefined
  };
}

function normalizeStep(value: unknown): BotProgramStep | null {
  const input = value as Partial<BotProgramStep>;
  const id = sanitizeId(String(input.id ?? input.field ?? crypto.randomUUID()));
  const kind = ['ask', 'message', 'end'].includes(String(input.kind)) ? input.kind as ProgramStepKind : 'ask';
  return {
    id,
    kind,
    text: String(input.text ?? '').slice(0, 1000),
    field: input.field ? sanitizeId(String(input.field)) : undefined,
    next: input.next ? sanitizeId(String(input.next)) : undefined
  };
}

function sanitizeId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 48) || 'item';
}

function sanitizeCommand(value: string): string {
  return value.replace(/^\/+/, '').toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 32) || 'menu';
}

function isStart(value: string): boolean {
  return value === '/start' || value === 'start' || value === 'شروع';
}
