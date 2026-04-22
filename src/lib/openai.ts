import OpenAI from "openai";
import type { AppConfig } from "../types/env";

const OPENAI_TIMEOUT_MS = 12000;
const FRIENDLY_ERROR_MESSAGE = "الان نمی‌تونم جواب بدم، چند لحظه دیگه دوباره امتحان کن.";
const HISTORY_LIMIT = 10;

interface ConversationTurn {
  role: "user" | "assistant";
  text: string;
}

export async function generateOpenAIReply(config: AppConfig, userText: string, history: ConversationTurn[] = []): Promise<string> {
  const client = new OpenAI({ apiKey: config.openAiApiKey });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);
  const normalizedHistory = normalizeHistory(history);

  try {
    const historyContext = buildHistoryContext(normalizedHistory);
    const userInput = historyContext ? `${historyContext}\n\nپیام جدید کاربر:\n${userText}` : userText;

    const response = await client.responses.create(
      {
        model: config.openAiModel,
        input: [
          { role: "system", content: [{ type: "input_text", text: config.systemPrompt }] },
          { role: "user", content: [{ type: "input_text", text: userInput }] }
        ],
        tools: [{ type: "web_search" }],
        tool_choice: "auto",
        max_output_tokens: 300
      },
      {
        signal: controller.signal
      }
    );

    const text = response.output_text?.trim();
    if (!text) return FRIENDLY_ERROR_MESSAGE;
    return normalizeReply(text);
  } catch {
    return FRIENDLY_ERROR_MESSAGE;
  } finally {
    clearTimeout(timer);
  }
}

function normalizeReply(text: string): string {
  return text.replace(/\s{3,}/g, "\n\n").replace(/\u0000/g, "").trim().slice(0, 4000);
}

function normalizeHistory(history: ConversationTurn[]): ConversationTurn[] {
  return history
    .filter((turn) => turn.role === "user" || turn.role === "assistant")
    .map((turn) => ({ role: turn.role, text: normalizeReply(turn.text) }))
    .filter((turn) => turn.text.length > 0)
    .slice(-HISTORY_LIMIT);
}

function buildHistoryContext(history: ConversationTurn[]): string {
  if (history.length === 0) return "";
  return [
    "تاریخچه اخیر گفتگو:",
    ...history.map((turn, index) => `${index + 1}. ${turn.role === "user" ? "کاربر" : "دستیار"}: ${turn.text}`)
  ].join("\n");
}
