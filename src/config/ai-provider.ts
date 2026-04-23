export type AiProvider = "gpt" | "grok";

// فقط این مقدار را عوض کن
export const ACTIVE_AI_PROVIDER: AiProvider = "gpt";

export function isGrokProvider(provider: AiProvider = ACTIVE_AI_PROVIDER): boolean {
  return provider === "grok";
}
