import OpenAI from "openai";
import type { AppConfig } from "../types/env";

const OPENAI_TIMEOUT_MS = 12000;
const FRIENDLY_ERROR_MESSAGE = "الان نمی‌تونم جواب بدم، چند لحظه دیگه دوباره امتحان کن.";
const FRIENDLY_IMAGE_ERROR_MESSAGE = "فعلاً نتونستم تصویر را بسازم. دوباره با توضیح دقیق‌تر امتحان کن.";
const HISTORY_LIMIT = 10;

interface ConversationTurn {
  role: "user" | "assistant";
  text: string;
}

export interface GeneratedImageResult {
  base64Data?: string;
  mimeType?: string;
  remoteUrl?: string;
  prompt: string;
}

export function isImageGenerationRequest(text: string): boolean {
  const normalized = text.toLowerCase().trim();
  return [
    /\b(draw|generate|create|make)\b.+\b(image|photo|picture|art|poster|logo)\b/i,
    /\b(image|photo|picture|art|poster|logo)\b.+\b(of|for)\b/i,
    /(?:تصویر|عکس|تصویرو|عکسو|پوستر|لوگو).*(?:بساز|درست کن|ایجاد کن|تولید کن)/,
    /(?:بساز|درست کن|ایجاد کن|تولید کن).*(?:تصویر|عکس|پوستر|لوگو)/,
    /(?:یه|یک).*(?:تصویر|عکس|پوستر|لوگو).*(?:از|برای)/
  ].some((pattern) => pattern.test(normalized));
}

export function extractImagePrompt(text: string): string {
  return text
    .replace(/^(لطفا|لطفاً|please)\s*/i, "")
    .replace(/(?:برام|برای من)?\s*(?:یه|یک)?\s*(?:تصویر|عکس|پوستر|لوگو)\s*/g, "")
    .replace(/\s*(?:بساز|درست کن|ایجاد کن|تولید کن)\s*/g, " ")
    .replace(/^(?:draw|generate|create|make)\s+(?:an?|the)?\s*(?:image|photo|picture|poster|logo)?\s*(?:of|for)?\s*/i, "")
    .trim();
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

export async function generateOpenAIImage(config: AppConfig, userText: string): Promise<GeneratedImageResult | null> {
  const client = new OpenAI({ apiKey: config.openAiApiKey });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS * 2);
  const prompt = extractImagePrompt(userText) || userText;

  try {
    const result = await client.images.generate(
      {
        model: config.imageModel,
        prompt,
        size: "1024x1024"
      },
      {
        signal: controller.signal
      }
    );

    const item = result.data?.[0] as { b64_json?: string; url?: string; revised_prompt?: string } | undefined;
    if (!item) {
      return null;
    }

    if (item.b64_json) {
      return {
        base64Data: item.b64_json,
        mimeType: "image/png",
        prompt: item.revised_prompt || prompt
      };
    }

    if (item.url) {
      return {
        remoteUrl: item.url,
        prompt: item.revised_prompt || prompt
      };
    }

    return null;
  } catch {
    return {
      prompt: FRIENDLY_IMAGE_ERROR_MESSAGE
    };
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
