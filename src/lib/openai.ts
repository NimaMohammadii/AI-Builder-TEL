import OpenAI from "openai";
import type { AppConfig } from "../config";

const OPENAI_TIMEOUT_MS = 12000;
const FRIENDLY_ERROR_MESSAGE = "الان نمی‌تونم جواب بدم، چند لحظه دیگه دوباره امتحان کن.";

export async function generateOpenAIReply(config: AppConfig, userText: string): Promise<string> {
  const client = new OpenAI({ apiKey: config.openAiApiKey });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  try {
    const response = await client.responses.create(
      {
        model: config.openAiModel,
        input: [
          { role: "system", content: [{ type: "input_text", text: config.systemPrompt }] },
          { role: "user", content: [{ type: "input_text", text: userText }] }
        ],
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
