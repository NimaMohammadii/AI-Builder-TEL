import type { AppConfig } from "../types/env";

const CHAT_MEMORY_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const CHAT_MEMORY_MAX_TURNS = 12;

interface ConversationTurn {
  role: "user" | "assistant";
  text: string;
}

export async function readConversationHistory(config: AppConfig, chatId: number): Promise<ConversationTurn[]> {
  if (!config.chatMemory) return [];

  const raw = await config.chatMemory.get(getChatMemoryKey(chatId), "json");
  if (!Array.isArray(raw)) return [];

  return raw
    .filter(isConversationTurn)
    .map((turn) => ({ role: turn.role, text: sanitizeText(turn.text) }))
    .filter((turn) => turn.text.length > 0)
    .slice(-CHAT_MEMORY_MAX_TURNS);
}

export async function writeConversationHistory(
  config: AppConfig,
  chatId: number,
  history: ConversationTurn[],
  userText: string,
  assistantText: string
): Promise<void> {
  if (!config.chatMemory) return;

  const nextHistory = [...history, { role: "user", text: sanitizeText(userText) }, { role: "assistant", text: sanitizeText(assistantText) }]
    .filter((turn) => turn.text.length > 0)
    .slice(-CHAT_MEMORY_MAX_TURNS);

  await config.chatMemory.put(getChatMemoryKey(chatId), JSON.stringify(nextHistory), {
    expirationTtl: CHAT_MEMORY_TTL_SECONDS
  });
}

function getChatMemoryKey(chatId: number): string {
  return `chat:${chatId}:history`;
}

function sanitizeText(text: string): string {
  return text.replace(/\u0000/g, "").trim().slice(0, 4000);
}

function isConversationTurn(value: unknown): value is ConversationTurn {
  if (!value || typeof value !== "object") return false;
  const maybeTurn = value as Partial<ConversationTurn>;
  return (
    (maybeTurn.role === "user" || maybeTurn.role === "assistant") &&
    typeof maybeTurn.text === "string"
  );
}
