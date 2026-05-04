import type { BotFlow, BotFlowButton, BotFlowNode } from './ai';

export type SafeFlowAction =
  | { type: 'add_button'; target?: string; buttonText: string; next?: string; message?: string; keyboard?: 'inline' | 'reply' }
  | { type: 'upsert_node'; id: string; message: string; buttons?: BotFlowButton[]; keyboard?: 'inline' | 'reply'; saveInputAs?: string; next?: string; notifyOwner?: boolean; end?: boolean }
  | { type: 'ask_input'; target?: string; variable: string; prompt: string; nextMessage?: string; notifyOwner?: boolean }
  | { type: 'update_message'; target: string; message: string }
  | { type: 'rename_button'; target?: string; oldText: string; newText: string }
  | { type: 'remove_button'; target?: string; buttonText: string }
  | { type: 'connect_node'; from: string; to: string }
  | { type: 'set_keyboard'; target?: string; keyboard: 'inline' | 'reply' }
  | { type: 'end_node'; target?: string; end: boolean }
  | { type: 'request_contact'; target?: string; buttonText: string; saveAs?: string; nextMessage?: string }
  | { type: 'request_location'; target?: string; buttonText: string; saveAs?: string; nextMessage?: string }
  | { type: 'open_url'; target?: string; buttonText: string; url: string }
  | { type: 'open_web_app'; target?: string; buttonText: string; url: string }
  | { type: 'copy_text'; target?: string; buttonText: string; text: string }
  | { type: 'send_photo'; target?: string; url: string; caption?: string }
  | { type: 'send_video'; target?: string; url: string; caption?: string }
  | { type: 'send_document'; target?: string; url: string; caption?: string }
  | { type: 'notify_owner'; target?: string; enabled?: boolean }
  | { type: 'set_condition'; target?: string; variable: string; equals?: string; exists?: boolean; next: string; elseNext?: string }
  | { type: 'deep_link'; target?: string; buttonText: string; payload: string }
  | { type: 'telegram_stars_payment'; target?: string; buttonText?: string; title: string; description?: string; amount: number; successMessage?: string }
  | { type: 'payment_placeholder'; target?: string; buttonText?: string; title?: string; message?: string }
  | { type: 'inline_mode_note'; target?: string; message?: string };

export function applySafeFlowActions(currentFlow: BotFlow, actions: SafeFlowAction[]): { flow: BotFlow; summary: string } {
  const flow = cloneFlow(currentFlow);
  const applied: string[] = [];

  for (const action of actions.slice(0, 30)) {
    try {
      if (action.type === 'add_button') {
        addButton(flow, action.target, clean(action.buttonText), action.next, action.message, action.keyboard);
        applied.push(`add_button:${action.buttonText}`);
      }
      if (action.type === 'upsert_node') {
        const id = slug(action.id) || uniqueNodeId(flow, 'node');
        flow.nodes[id] = { id, message: action.message || flow.nodes[id]?.message || 'Done.', keyboard: action.keyboard ?? flow.nodes[id]?.keyboard, buttons: sanitizeButtons(action.buttons), saveInputAs: action.saveInputAs, next: action.next ? slug(action.next) || action.next : undefined, notifyOwner: action.notifyOwner, end: action.end ?? (!action.buttons?.length && !action.next) };
        applied.push(`upsert_node:${id}`);
      }
      if (action.type === 'ask_input') {
        const askId = uniqueNodeId(flow, slug(action.variable || 'input'));
        const doneId = uniqueNodeId(flow, `${askId}_done`);
        addButton(flow, action.target, clean(action.prompt).slice(0, 40) || 'Start', askId, undefined, 'reply');
        flow.nodes[askId] = { id: askId, message: action.prompt, saveInputAs: slug(action.variable) || action.variable, next: doneId };
        flow.nodes[doneId] = { id: doneId, message: action.nextMessage || 'Saved.', notifyOwner: action.notifyOwner, end: true };
        addVariable(flow, slug(action.variable) || action.variable);
        applied.push(`ask_input:${action.variable}`);
      }
      if (action.type === 'update_message') {
        const id = resolveTargetNode(flow, action.target);
        flow.nodes[id] = { ...ensureNode(flow, id), message: action.message };
        applied.push(`update_message:${id}`);
      }
      if (action.type === 'rename_button') {
        const id = resolveTargetNode(flow, action.target || action.oldText);
        const node = ensureNode(flow, id);
        flow.nodes[id] = { ...node, buttons: (node.buttons ?? []).map((button) => normalize(button.text) === normalize(action.oldText) ? { ...button, text: action.newText } : button) };
        applied.push(`rename_button:${id}`);
      }
      if (action.type === 'remove_button') {
        const id = resolveTargetNode(flow, action.target || action.buttonText);
        const node = ensureNode(flow, id);
        flow.nodes[id] = { ...node, buttons: (node.buttons ?? []).filter((button) => normalize(button.text) !== normalize(action.buttonText)) };
        applied.push(`remove_button:${id}`);
      }
      if (action.type === 'connect_node') {
        const from = ensureNode(flow, resolveTargetNode(flow, action.from));
        const to = ensureNode(flow, resolveTargetNode(flow, action.to));
        flow.nodes[from.id] = { ...from, next: to.id, end: false };
        applied.push(`connect_node:${from.id}->${to.id}`);
      }
      if (action.type === 'set_keyboard') {
        const id = resolveTargetNode(flow, action.target || flow.start);
        flow.nodes[id] = { ...ensureNode(flow, id), keyboard: action.keyboard };
        applied.push(`set_keyboard:${id}`);
      }
      if (action.type === 'end_node') {
        const id = resolveTargetNode(flow, action.target || flow.start);
        flow.nodes[id] = { ...ensureNode(flow, id), end: action.end };
        applied.push(`end_node:${id}`);
      }
      if (action.type === 'request_contact') {
        const saveAs = slug(action.saveAs || 'contact') || 'contact';
        const nextId = uniqueNodeId(flow, `${saveAs}_saved`);
        addButton(flow, action.target, action.buttonText || 'Share contact', nextId, action.nextMessage || 'Contact received.', 'reply', { requestContact: true });
        flow.nodes[nextId] = { id: nextId, message: action.nextMessage || 'Contact received.', saveInputAs: saveAs, end: true };
        addVariable(flow, saveAs);
        applied.push(`request_contact:${saveAs}`);
      }
      if (action.type === 'request_location') {
        const saveAs = slug(action.saveAs || 'location') || 'location';
        const nextId = uniqueNodeId(flow, `${saveAs}_saved`);
        addButton(flow, action.target, action.buttonText || 'Share location', nextId, action.nextMessage || 'Location received.', 'reply', { requestLocation: true });
        flow.nodes[nextId] = { id: nextId, message: action.nextMessage || 'Location received.', saveInputAs: saveAs, end: true };
        addVariable(flow, saveAs);
        applied.push(`request_location:${saveAs}`);
      }
      if (action.type === 'open_url') {
        addExternalButton(flow, action.target, action.buttonText, { url: action.url });
        applied.push(`open_url:${action.buttonText}`);
      }
      if (action.type === 'open_web_app') {
        addExternalButton(flow, action.target, action.buttonText, { webAppUrl: action.url });
        applied.push(`open_web_app:${action.buttonText}`);
      }
      if (action.type === 'copy_text') {
        addExternalButton(flow, action.target, action.buttonText, { copyText: action.text });
        applied.push(`copy_text:${action.buttonText}`);
      }
      if (action.type === 'send_photo' || action.type === 'send_video' || action.type === 'send_document') {
        const id = resolveTargetNode(flow, action.target || flow.start);
        const mediaType = action.type.replace('send_', '') as 'photo' | 'video' | 'document';
        flow.nodes[id] = { ...ensureNode(flow, id), media: { type: mediaType, url: action.url, caption: action.caption } };
        applied.push(`${action.type}:${id}`);
      }
      if (action.type === 'notify_owner') {
        const id = resolveTargetNode(flow, action.target || flow.start);
        flow.nodes[id] = { ...ensureNode(flow, id), notifyOwner: action.enabled ?? true };
        applied.push(`notify_owner:${id}`);
      }
      if (action.type === 'set_condition') {
        const id = resolveTargetNode(flow, action.target || flow.start);
        const next = ensureNamedNode(flow, action.next);
        const elseNext = action.elseNext ? ensureNamedNode(flow, action.elseNext) : undefined;
        flow.nodes[id] = { ...ensureNode(flow, id), condition: { variable: slug(action.variable) || action.variable, equals: action.equals, exists: action.exists, next, elseNext } };
        applied.push(`condition:${id}`);
      }
      if (action.type === 'deep_link') {
        const payload = encodeURIComponent(action.payload || 'start');
        addExternalButton(flow, action.target, action.buttonText, { url: `https://t.me/share/url?url=start%20${payload}` });
        applied.push(`deep_link:${action.buttonText}`);
      }
      if (action.type === 'telegram_stars_payment') {
        const successId = uniqueNodeId(flow, slug(`${action.title || 'stars'}_paid`));
        flow.nodes[successId] = { id: successId, message: action.successMessage || 'Payment received.', end: true };
        addExternalButton(flow, action.target, action.buttonText || 'Pay with Stars', { starsPayment: { title: clean(action.title || 'Payment'), description: clean(action.description || action.title || 'Telegram Stars payment'), amount: Math.max(1, Math.floor(Number(action.amount) || 1)), payload: `stars:${successId}:${Date.now()}`, successNext: successId } });
        applied.push(`telegram_stars_payment:${action.amount}`);
      }
      if (action.type === 'payment_placeholder') {
        addButton(flow, action.target, action.buttonText || 'Payment', uniqueNodeId(flow, 'payment'), action.message || 'Payment setup needs provider token and invoice settings.', 'inline');
        applied.push('payment_placeholder');
      }
      if (action.type === 'inline_mode_note') {
        addButton(flow, action.target, 'Inline mode', uniqueNodeId(flow, 'inline_mode'), action.message || 'Inline mode must be enabled in BotFather, then configured in code.', 'inline');
        applied.push('inline_mode_note');
      }
    } catch {
      continue;
    }
  }

  repairFlow(flow);
  return { flow, summary: applied.length ? `Applied safe actions: ${applied.join(', ')}` : 'No safe action was applied.' };
}

function addButton(flow: BotFlow, targetHint: string | undefined, buttonText: string, nextHint?: string, message?: string, keyboard?: 'inline' | 'reply', extras: Partial<BotFlowButton> = {}): string {
  const targetId = resolveTargetNode(flow, targetHint || '');
  const target = ensureNode(flow, targetId);
  const nextId = uniqueNodeId(flow, slug(nextHint || buttonText));
  const buttons = Array.isArray(target.buttons) ? target.buttons.filter((button) => normalize(button.text) !== normalize(buttonText)) : [];
  buttons.push({ text: buttonText, next: nextId, ...extras });
  flow.nodes[target.id] = { ...target, keyboard: keyboard ?? target.keyboard, buttons, end: false };
  if (!flow.nodes[nextId]) flow.nodes[nextId] = { id: nextId, message: clean(message || defaultNodeMessage('')) || 'Done.', end: true };
  return nextId;
}

function addExternalButton(flow: BotFlow, targetHint: string | undefined, buttonText: string, extras: Partial<BotFlowButton>): void {
  const targetId = resolveTargetNode(flow, targetHint || '');
  const target = ensureNode(flow, targetId);
  const buttons = Array.isArray(target.buttons) ? target.buttons.filter((button) => normalize(button.text) !== normalize(buttonText)) : [];
  buttons.push({ text: clean(buttonText), ...extras });
  flow.nodes[target.id] = { ...target, keyboard: 'inline', buttons, end: false };
}

export function applySmartFlowFallback(currentFlow: BotFlow, instruction: string): { flow: BotFlow; summary: string } {
  const request = extractRequest(instruction);
  return applySafeFlowActions(currentFlow, [{ type: 'add_button', target: inferTargetHint(request), buttonText: extractButtonText(request) ?? defaultButtonText(request), message: extractMessageText(request) ?? defaultNodeMessage(request), keyboard: wantsReplyKeyboard(request) ? 'reply' : undefined }]);
}

function extractRequest(instruction: string): string {
  const match = instruction.match(/(?:^|\n)request=([\s\S]*?)(?:\n\nhistory=|$)/);
  return (match?.[1] ?? instruction).trim();
}

function inferTargetHint(request: string): string {
  const fa = request.match(/(?:داخل|توی|درون|زیر|بعد از|منوی|بخش|صفحه)\s+(.+?)(?:\s+(?:یه|یک|دکمه|گزینه|منو|اضافه|بساز|بزن|قرار)|$)/i);
  if (fa?.[1]) return clean(fa[1]);
  const en = request.match(/(?:inside|within|under|after|in menu|section|page)\s+(.+?)(?:\s+(?:button|option|menu|add|create|make)|$)/i);
  if (en?.[1]) return clean(en[1]);
  return request;
}

function resolveTargetNode(flow: BotFlow, hint: string): string {
  const requestNorm = normalize(hint || '');
  if (!requestNorm) return flow.nodes[flow.start] ? flow.start : Object.keys(flow.nodes)[0] ?? 'start';
  if (/(منوی اصلی|صفحه اصلی|استارت|start|home|main menu)/i.test(hint) && flow.nodes[flow.start]) return flow.start;
  let best = { id: flow.start, score: 0 };
  for (const node of Object.values(flow.nodes)) {
    let score = 0;
    const nodeId = normalize(node.id);
    const message = normalize(node.message ?? '');
    if (nodeId && requestNorm.includes(nodeId)) score += 5;
    if (message && overlap(requestNorm, message)) score += 2;
    if (node.id !== flow.start && /(داخل|توی|درون|زیر|بعد از|منوی|بخش|صفحه|inside|under|within|after)/i.test(hint)) score += 1;
    if (score > best.score) best = { id: node.id, score };
  }
  for (const node of Object.values(flow.nodes)) {
    for (const button of node.buttons ?? []) {
      const text = normalize(button.text);
      if (!text || !requestNorm.includes(text)) continue;
      const id = button.next && flow.nodes[button.next] ? button.next : node.id;
      const score = /(داخل|توی|درون|منوی|بخش|صفحه|inside|within|in menu)/i.test(hint) ? 10 : 7;
      if (score > best.score) best = { id, score };
    }
  }
  return flow.nodes[best.id] ? best.id : (flow.nodes[flow.start] ? flow.start : Object.keys(flow.nodes)[0] ?? 'start');
}

function ensureNode(flow: BotFlow, id: string): BotFlowNode {
  const existing = flow.nodes[id];
  if (existing) return existing;
  flow.nodes[id] = { id, message: 'Done.', end: true };
  return flow.nodes[id];
}

function ensureNamedNode(flow: BotFlow, hint: string): string {
  const id = slug(hint) || uniqueNodeId(flow, 'node');
  if (!flow.nodes[id]) flow.nodes[id] = { id, message: hint || 'Done.', end: true };
  return id;
}

function sanitizeButtons(buttons?: BotFlowButton[]): BotFlowButton[] | undefined {
  if (!Array.isArray(buttons)) return undefined;
  return buttons.filter((button) => button.text).map((button) => ({ ...button, text: clean(button.text), next: button.next ? slug(button.next) || button.next : undefined }));
}

function addVariable(flow: BotFlow, variable: string): void {
  if (!variable) return;
  if (!flow.variables.includes(variable)) flow.variables.push(variable);
}

function repairFlow(flow: BotFlow): void {
  if (!flow.start || !flow.nodes[flow.start]) flow.start = Object.keys(flow.nodes)[0] ?? 'start';
  if (!flow.nodes[flow.start]) flow.nodes[flow.start] = { id: flow.start, message: 'Start', end: true };
  for (const node of Object.values(flow.nodes)) {
    node.id = node.id || 'node';
    node.message = node.message || 'Done.';
    if (node.next && !flow.nodes[node.next]) delete node.next;
    if (node.buttons) node.buttons = node.buttons.filter((button) => button.text && (button.next ? flow.nodes[button.next] : true));
  }
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
  return String(value || '').replace(/[،,.!?؛:]+$/g, '').trim().slice(0, 300);
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[ي]/g, 'ی').replace(/[ك]/g, 'ک').replace(/[آأإ]/g, 'ا').replace(/[^\p{L}\p{N}]+/gu, ' ').replace(/\s+/g, ' ').trim();
}
