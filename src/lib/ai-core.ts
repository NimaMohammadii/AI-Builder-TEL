import OpenAI from "openai";
import type { AppConfig } from "../types/env";

const OPENAI_TIMEOUT_MS = 12000;
const FRIENDLY_ERROR_MESSAGE = "الان نمی‌تونم جواب بدم، چند لحظه دیگه دوباره امتحان کن.";
const FRIENDLY_IMAGE_ERROR_MESSAGE = "فعلاً نتونستم تصویر را بسازم. دوباره با توضیح دقیق‌تر امتحان کن.";
const HISTORY_LIMIT = 10;
const DEFAULT_XAI_BASE_URL = "https://api.x.ai/v1";

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
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);
  const normalizedHistory = normalizeHistory(history);

  try {
    if (config.provider === "grok") {
      return await generateGrokReply(config, userText, normalizedHistory, controller.signal);
    }
    return await generateGptReply(config, userText, normalizedHistory, controller.signal);
  } catch {
    return FRIENDLY_ERROR_MESSAGE;
  } finally {
    clearTimeout(timer);
  }
}

export async function generateOpenAIImage(config: AppConfig, userText: string): Promise<GeneratedImageResult | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS * 2);
  const prompt = extractImagePrompt(userText) || userText;

  try {
    if (config.provider === "grok") {
      return await generateGrokImage(config, prompt, controller.signal);
    }
    return await generateGptImage(config, prompt, controller.signal);
  } catch {
    return { prompt: FRIENDLY_IMAGE_ERROR_MESSAGE };
  } finally {
    clearTimeout(timer);
  }
}

async function generateGptReply(config: AppConfig, userText: string, history: ConversationTurn[], signal: AbortSignal): Promise<string> {
  const client = new OpenAI({ apiKey: config.openAiApiKey });
  const historyContext = buildHistoryContext(history);
  const userInput = historyContext ? `${historyContext}\n\nپیام جدید کاربر:\n${userText}` : userText;
  const response = await client.responses.create({
    model: config.openAiModel,
    input: [
      { role: "system", content: [{ type: "input_text", text: config.systemPrompt }] },
      { role: "user", content: [{ type: "input_text", text: userInput }] }
    ],
    tools: [{ type: "web_search" }],
    tool_choice: "auto",
    max_output_tokens: 300
  }, { signal });
  const text = response.output_text?.trim();
  return text ? normalizeReply(text) : FRIENDLY_ERROR_MESSAGE;
}

async function generateGrokReply(config: AppConfig, userText: string, history: ConversationTurn[], signal: AbortSignal): Promise<string> {
  const historyContext = buildHistoryContext(history);
  const userInput = historyContext ? `${historyContext}\n\nپیام جدید کاربر:\n${userText}` : userText;
  const baseUrl = (config.xAiBaseUrl || DEFAULT_XAI_BASE_URL).replace(/\/$/, "");
  const live = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.xAiApiKey}`
    },
    body: JSON.stringify({
      model: config.xAiModel,
      messages: [
        { role: "system", content: config.systemPrompt },
        { role: "user", content: userInput }
      ],
      search_parameters: {},
      max_tokens: 300
    }),
    signal
  });
  if (live.ok) {
    const payload = await live.json() as { choices?: Array<{ message?: { content?: string } }> };
    const text = payload.choices?.[0]?.message?.content?.trim();
    if (text) return normalizeReply(text);
  }

  const client = new OpenAI({ apiKey: config.xAiApiKey, baseURL: baseUrl });
  const fallback = await client.chat.completions.create({
    model: config.xAiModel,
    messages: [
      { role: "system", content: config.systemPrompt },
      ...history.map((turn) => ({ role: turn.role, content: turn.text })),
      { role: "user", content: userText }
    ],
    max_tokens: 300
  }, { signal });
  const fallbackText = fallback.choices?.[0]?.message?.content?.trim();
  return fallbackText ? normalizeReply(fallbackText) : FRIENDLY_ERROR_MESSAGE;
}

async function generateGptImage(config: AppConfig, prompt: string, signal: AbortSignal): Promise<GeneratedImageResult | null> {
  const client = new OpenAI({ apiKey: config.openAiApiKey });
  const result = await client.images.generate({ model: config.imageModel, prompt, size: "1024x1024" }, { signal });
  return normalizeImageResult(result.data?.[0], prompt);
}

async function generateGrokImage(config: AppConfig, prompt: string, signal: AbortSignal): Promise<GeneratedImageResult | null> {
  const client = new OpenAI({ apiKey: config.xAiApiKey, baseURL: config.xAiBaseUrl || DEFAULT_XAI_BASE_URL });
  try {
    const base64Result = await client.images.generate({ model: config.xAiImageModel, prompt, response_format: "b64_json" }, { signal });
    const normalized = normalizeImageResult(base64Result.data?.[0], prompt);
    if (normalized) return normalized;
  } catch {
    // Some Grok image models ignore/deny response_format. Fallback below requests default URL payload.
  }

  const urlResult = await client.images.generate({ model: config.xAiImageModel, prompt }, { signal });
  return normalizeImageResult(urlResult.data?.[0], prompt);
}

function normalizeImageResult(item: { b64_json?: string; url?: string; revised_prompt?: string } | undefined, fallbackPrompt: string): GeneratedImageResult | null {
  if (!item) return null;
  if (item.b64_json) {
    const parsed = parseBase64Image(item.b64_json);
    return {
      base64Data: parsed.base64Data,
      mimeType: parsed.mimeType,
      prompt: item.revised_prompt || fallbackPrompt
    };
  }
  if (item.url) return { remoteUrl: item.url, prompt: item.revised_prompt || fallbackPrompt };
  return null;
}

function parseBase64Image(value: string): { base64Data: string; mimeType: string } {
  const dataUri = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (dataUri) {
    return { mimeType: dataUri[1].toLowerCase(), base64Data: dataUri[2] };
  }
  return { mimeType: "image/png", base64Data: value };
}

function normalizeReply(text: string): string {
  return text.replace(/\s{3,}/g, "\n\n").replace(/\u0000/g, "").trim().slice(0, 4000);
}

function normalizeHistory(history: ConversationTurn[]): ConversationTurn[] {
  return history.filter((turn) => turn.role === "user" || turn.role === "assistant").map((turn) => ({ role: turn.role, text: normalizeReply(turn.text) })).filter((turn) => turn.text.length > 0).slice(-HISTORY_LIMIT);
}

function buildHistoryContext(history: ConversationTurn[]): string {
  if (history.length === 0) return "";
  return ["تاریخچه اخیر گفتگو:", ...history.map((turn, index) => `${index + 1}. ${turn.role === "user" ? "کاربر" : "دستیار"}: ${turn.text}`)].join("\n");
}
