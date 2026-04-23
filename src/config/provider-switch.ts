import type { AiProvider } from "../types/env";

export const ACTIVE_AI_PROVIDER: AiProvider = "gpt";

export function getActiveAiProvider(): AiProvider {
  return ACTIVE_AI_PROVIDER;
}
