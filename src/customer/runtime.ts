import type { BotProgram, Env, ProgramFlow, ProgramStep } from '../types';
import { clearSession, getSession, saveSession } from '../db';

export interface RuntimeResult {
  handled: boolean;
  text: string;
}

export async function runProgram(env: Env, input: { botId: string; chatId: number; text: string; program: BotProgram }): Promise<RuntimeResult> {
  const text = input.text.trim();
  if (isStart(text)) {
    await clearSession(env, input.botId, input.chatId);
    return { handled: true, text: input.program.welcomeText };
  }

  const session = await getSession(env, input.botId, input.chatId);
  if (session) {
    const flow = input.program.flows.find((item) => item.id === session.flow_id);
    const step = flow?.steps.find((item) => item.id === session.step_id);
    if (flow && step) return { handled: true, text: await continueFlow(env, input.botId, input.chatId, flow, step, session.data_json, text) };
    await clearSession(env, input.botId, input.chatId);
  }

  const flow = findFlow(input.program, text);
  if (flow) return { handled: true, text: await startFlow(env, input.botId, input.chatId, flow) };

  const button = input.program.buttons.find((item) => item.label === text || `/${item.command}` === text);
  if (button) return { handled: true, text: button.response };

  return { handled: false, text: input.program.fallbackText };
}

async function startFlow(env: Env, botId: string, chatId: number, flow: ProgramFlow): Promise<string> {
  const first = flow.steps[0];
  if (!first) return flow.summaryText;
  if (first.kind === 'ask') {
    await saveSession(env, { bot_id: botId, chat_id: String(chatId), flow_id: flow.id, step_id: first.id, data_json: '{}' });
    return first.text;
  }
  if (first.kind === 'message') {
    const next = getNextStep(flow, first);
    if (next?.kind === 'ask') {
      await saveSession(env, { bot_id: botId, chat_id: String(chatId), flow_id: flow.id, step_id: next.id, data_json: '{}' });
      return [first.text, next.text].join('\n\n');
    }
    return first.text;
  }
  return renderSummary(flow, {});
}

async function continueFlow(env: Env, botId: string, chatId: number, flow: ProgramFlow, step: ProgramStep, dataJson: string, userText: string): Promise<string> {
  const data = safeJson(dataJson);
  if (step.kind === 'ask' && step.field) data[step.field] = userText;
  const next = getNextStep(flow, step);
  if (!next || next.kind === 'end') {
    await clearSession(env, botId, chatId);
    return renderSummary(flow, data);
  }
  if (next.kind === 'message') {
    const after = getNextStep(flow, next);
    if (after?.kind === 'ask') {
      await saveSession(env, { bot_id: botId, chat_id: String(chatId), flow_id: flow.id, step_id: after.id, data_json: JSON.stringify(data) });
      return [renderTemplate(next.text, data), after.text].join('\n\n');
    }
    await clearSession(env, botId, chatId);
    return renderTemplate(next.text, data);
  }
  await saveSession(env, { bot_id: botId, chat_id: String(chatId), flow_id: flow.id, step_id: next.id, data_json: JSON.stringify(data) });
  return next.text;
}

function findFlow(program: BotProgram, text: string): ProgramFlow | null {
  const command = text.startsWith('/') ? text.slice(1).toLowerCase() : '';
  return program.flows.find((flow) =>
    flow.triggerLabels.includes(text) ||
    flow.triggerCommands.includes(command) ||
    program.buttons.some((button) => button.flowId === flow.id && (button.label === text || button.command === command))
  ) ?? null;
}

function getNextStep(flow: ProgramFlow, step: ProgramStep): ProgramStep | null {
  if (step.next) return flow.steps.find((item) => item.id === step.next) ?? null;
  const index = flow.steps.findIndex((item) => item.id === step.id);
  return index >= 0 ? flow.steps[index + 1] ?? null : null;
}

function renderSummary(flow: ProgramFlow, data: Record<string, string>): string {
  const summary = Object.entries(data).map(([key, value]) => `• ${key}: ${value}`).join('\n');
  return renderTemplate(flow.summaryText || '✅ ثبت شد:\n{summary}', { ...data, summary });
}

function renderTemplate(template: string, data: Record<string, string>): string {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => data[key] ?? '');
}

function safeJson(value: string): Record<string, string> {
  try { return JSON.parse(value) as Record<string, string>; } catch { return {}; }
}

function isStart(value: string): boolean {
  return value === '/start' || value === 'start' || value === 'شروع';
}
