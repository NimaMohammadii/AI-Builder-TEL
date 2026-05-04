import type { BotFlow } from './ai';

export function applySmartFlowFallback(currentFlow: BotFlow, instruction: string): { flow: BotFlow; summary: string } {
  const request = extractRequest(instruction);
  const flow = cloneFlow(currentFlow);
  const targetNodeId = resolveTargetNode(flow, request);
  const targetNode = flow.nodes[targetNodeId] ?? flow.nodes[flow.start] ?? Object.values(flow.nodes)[0];
  const buttonText = extractButtonText(request) ?? defaultButtonText(request);
  const message = extractMessageText(request) ?? defaultNodeMessage(request);
  const newNodeId = uniqueNodeId(flow, slug(buttonText));

  const buttons = Array.isArray(targetNode.buttons)
    ? targetNode.buttons.filter((button) => normalize(button.text) !== normalize(buttonText))
    : [];
  buttons.push({ text: buttonText, next: newNodeId });

  flow.nodes[targetNode.id] = {
    ...targetNode,
    keyboard: wantsReplyKeyboard(request) ? 'reply' : targetNode.keyboard,
    buttons,
    end: false,
  };
  flow.nodes[newNodeId] = { id: newNodeId, message, end: true };

  return { flow, summary: `Added ${buttonText} under ${targetNode.id}.` };
}

function extractRequest(instruction: string): string {
  const match = instruction.match(/(?:^|\n)request=([\s\S]*?)(?:\n\nhistory=|$)/);
  return (match?.[1] ?? instruction).trim();
}

function resolveTargetNode(flow: BotFlow, request: string): string {
  const requestNorm = normalize(request);
  if (/(منوی اصلی|صفحه اصلی|استارت|start|home|main menu)/i.test(request) && flow.nodes[flow.start]) return flow.start;

  let best = { id: flow.start, score: 0 };

  for (const node of Object.values(flow.nodes)) {
    let score = 0;
    const nodeId = normalize(node.id);
    const message = normalize(node.message ?? '');
    if (nodeId && requestNorm.includes(nodeId)) score += 4;
    if (message && overlap(requestNorm, message)) score += 2;
    if (node.id !== flow.start && /(داخل|توی|درون|زیر|بعد از|منوی|بخش|صفحه|inside|under|within|after)/i.test(request)) score += 1;
    if (score > best.score) best = { id: node.id, score };
  }

  for (const node of Object.values(flow.nodes)) {
    for (const button of node.buttons ?? []) {
      const text = normalize(button.text);
      if (!text || !requestNorm.includes(text)) continue;
      const id = button.next && flow.nodes[button.next] ? button.next : node.id;
      const score = /(داخل|توی|درون|منوی|بخش|صفحه|inside|within|in menu)/i.test(request) ? 10 : 6;
      if (score > best.score) best = { id, score };
    }
  }

  return flow.nodes[best.id] ? best.id : flow.start;
}

function overlap(request: string, value: string): boolean {
  return value.split(' ').filter((token) => token.length >= 3).some((token) => request.includes(token));
}

function extractButtonText(request: string): string | null {
  const quoted = quotedValues(request)[0];
  if (quoted) return quoted;
  const fa = request.match(/(?:دکمه|گزینه|منو)(?:ی)?\s+(.+?)(?:\s+(?:اضافه|بساز|بزن|قرار|که|با|به|داخل|توی|در|زیر|بعد|بده|نمایش)|$)/i);
  if (fa?.[1]) return clean(fa[1]);
  const en = request.match(/(?:button|option|menu)\s+(.+?)(?:\s+(?:to|inside|under|after|that|which|says|show|add|create|make)|$)/i);
  if (en?.[1]) return clean(en[1]);
  return null;
}

function extractMessageText(request: string): string | null {
  const quoted = quotedValues(request);
  if (quoted.length >= 2) return quoted[1];
  const fa = request.match(/(?:پیام|متن|بگه|بنویسه|نمایش بده)\s+(.+?)(?:\s+(?:بده|ارسال|نمایش|شود|کنه|کند)|$)/i);
  if (fa?.[1]) return clean(fa[1]);
  const en = request.match(/(?:say|says|message|text|show)\s+(.+?)(?:\s+(?:when|after|and|then)|$)/i);
  if (en?.[1]) return clean(en[1]);
  return null;
}

function defaultButtonText(request: string): string {
  if (/کانفیگ|config/i.test(request)) return /[\u0600-\u06FF]/.test(request) ? 'کانفیگ' : 'Config';
  return /[\u0600-\u06FF]/.test(request) ? 'گزینه جدید' : 'New option';
}

function defaultNodeMessage(request: string): string {
  if (/باشه|اوکی|ok|okay/i.test(request)) return /[\u0600-\u06FF]/.test(request) ? 'باشه' : 'OK';
  return /[\u0600-\u06FF]/.test(request) ? 'انجام شد.' : 'Done.';
}

function quotedValues(text: string): string[] {
  return [...text.matchAll(/["“«']([^"”»']{2,100})["”»']/g)].map((m) => m[1].trim()).filter(Boolean);
}

function wantsReplyKeyboard(request: string): boolean {
  return /(کیبورد|keyboard|reply keyboard|دکمه‌های پایین|پایین صفحه)/i.test(request);
}

function cloneFlow(flow: BotFlow): BotFlow {
  return JSON.parse(JSON.stringify(flow)) as BotFlow;
}

function uniqueNodeId(flow: BotFlow, base: string): string {
  const cleanBase = base || 'node';
  if (!flow.nodes[cleanBase]) return cleanBase;
  let i = 2;
  while (flow.nodes[`${cleanBase}_${i}`]) i += 1;
  return `${cleanBase}_${i}`;
}

function slug(text: string): string {
  const ascii = text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (ascii) return ascii.slice(0, 40);
  if (/کانفیگ|config/i.test(text)) return 'config';
  return 'node_' + Math.random().toString(36).slice(2, 8);
}

function clean(value: string): string {
  return value.replace(/[،,.!?؛:]+$/g, '').trim().slice(0, 60);
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[ي]/g, 'ی')
    .replace(/[ك]/g, 'ک')
    .replace(/[آأإ]/g, 'ا')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
