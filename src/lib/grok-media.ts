import OpenAI from "openai";
import type { AppConfig } from "../types/env";

const DEFAULT_XAI_BASE_URL = "https://api.x.ai/v1";
const VIDEO_MODEL = "grok-imagine-video";
const VIDEO_DURATION_SECONDS = 5;
const VIDEO_RESOLUTION = "480p";
const VIDEO_POLL_INTERVAL_MS = 3000;
const VIDEO_POLL_TIMEOUT_MS = 120000;

export interface GeneratedVideoResult {
  videoUrl?: string;
  prompt: string;
  aspectRatio: string;
}

export function isVideoGenerationRequest(text: string): boolean {
  const normalized = text.toLowerCase().trim();
  return [
    /\b(video|clip|animation|animate)\b/i,
    /(?:ویدیو|کلیپ|انیمیشن|متحرک)/
  ].some((pattern) => pattern.test(normalized));
}

export function isImageAnalysisRequest(message: { text?: string; caption?: string; photo?: unknown[]; reply_to_message?: { photo?: unknown[] } }): boolean {
  const text = (message.text ?? message.caption ?? "").toLowerCase();
  const hasPhoto = Array.isArray(message.photo) && message.photo.length > 0;
  const hasReplyPhoto = Array.isArray(message.reply_to_message?.photo) && message.reply_to_message!.photo!.length > 0;
  if (!hasPhoto && !hasReplyPhoto) return false;
  return /(?:تحلیل|بررسی|آنالیز|انالیز|توضیح|explain|analyze|analyse|describe)/i.test(text) || text.trim().length === 0;
}

export function chooseAspectRatio(text: string): string {
  const normalized = text.toLowerCase();
  if (/9:16|عمودی|استوری|portrait/.test(normalized)) return "9:16";
  if (/16:9|افقی|یوتیوب|landscape/.test(normalized)) return "16:9";
  if (/4:3/.test(normalized)) return "4:3";
  if (/3:4/.test(normalized)) return "3:4";
  if (/3:2/.test(normalized)) return "3:2";
  if (/2:3/.test(normalized)) return "2:3";
  return "1:1";
}

export async function analyzeImageWithGrok(config: AppConfig, imageUrl: string, prompt: string): Promise<string> {
  const client = new OpenAI({
    apiKey: config.xAiApiKey,
    baseURL: config.xAiBaseUrl || DEFAULT_XAI_BASE_URL
  });

  const response = await client.responses.create({
    model: config.xAiModel,
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: config.systemPrompt }]
      },
      {
        role: "user",
        content: [
          { type: "input_image", image_url: imageUrl, detail: "high" },
          { type: "input_text", text: prompt || "این تصویر را دقیق تحلیل کن." }
        ]
      }
    ]
  });

  return response.output_text?.trim() || "نتونستم تصویر را تحلیل کنم.";
}

export async function generateVideoWithGrok(config: AppConfig, prompt: string, imageUrl?: string): Promise<GeneratedVideoResult | null> {
  const aspectRatio = chooseAspectRatio(prompt);
  const url = `${(config.xAiBaseUrl || DEFAULT_XAI_BASE_URL).replace(/\/$/, "")}/videos/generations`;
  const payload: Record<string, unknown> = {
    model: VIDEO_MODEL,
    prompt,
    duration: VIDEO_DURATION_SECONDS,
    resolution: VIDEO_RESOLUTION,
    aspect_ratio: aspectRatio
  };

  if (imageUrl) {
    payload.image = { url: imageUrl };
  }

  const createResponse = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.xAiApiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!createResponse.ok) {
    return null;
  }

  const created = await createResponse.json() as { id?: string; request_id?: string; status?: string; url?: string };
  if (created.url) {
    return { videoUrl: created.url, prompt, aspectRatio };
  }

  const requestId = created.id || created.request_id;
  if (!requestId) {
    return null;
  }

  const startedAt = Date.now();
  const pollUrl = `${(config.xAiBaseUrl || DEFAULT_XAI_BASE_URL).replace(/\/$/, "")}/videos/${requestId}`;

  while (Date.now() - startedAt < VIDEO_POLL_TIMEOUT_MS) {
    await new Promise((resolve) => setTimeout(resolve, VIDEO_POLL_INTERVAL_MS));

    const pollResponse = await fetch(pollUrl, {
      headers: {
        authorization: `Bearer ${config.xAiApiKey}`
      }
    });

    if (!pollResponse.ok) {
      continue;
    }

    const status = await pollResponse.json() as { status?: string; url?: string; video_url?: string };
    if (status.url || status.video_url) {
      return { videoUrl: status.url || status.video_url, prompt, aspectRatio };
    }

    if (status.status === "failed" || status.status === "expired") {
      return null;
    }
  }

  return null;
}
