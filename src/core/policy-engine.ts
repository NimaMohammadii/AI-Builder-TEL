// Basic policy engine for Vexa

import { Rule } from '../domain/entities';

export interface PolicyContext {
  chatId: number;
  messageText?: string;
  userId: number;
}

export function evaluateRules(rules: Rule[], ctx: PolicyContext) {
  return rules.filter((rule) => {
    if (!rule.enabled) return false;

    if (rule.triggerType === 'message_contains') {
      const keyword = rule.triggerConfig.keyword;
      return ctx.messageText?.includes(keyword);
    }

    return false;
  });
}
