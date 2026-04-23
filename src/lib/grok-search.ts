import type { AppConfig } from "../types/env";

const DEFAULT_XAI_BASE_URL = "https://api.x.ai/v1";
const FRIENDLY_ERROR_MESSAGE = "الان نمی‌تونم جواب بدم، چند لحظه دیگه دوباره امتحان کن.";

export async function generateGrokReplyWithSearch(config: AppConfig, userText: string): Promise<string> {
  const response = await fetch(`${(config.xAiBaseUrl || DEFAULT_XAI_BASE_URL).replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.xAiApiKey}`
    },
    body: JSON.stringify({
      model: config.xAiModel,
      messages: [
        { role: "system", content: config.systemPrompt },
        { role: "user", content: userText }
      ],
      search_parameters: {},
      max_tokens: 300
    })
  });

  if (!response.ok) {
    return FRIENDLY_ERROR_MESSAGE;
  }

  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  return payload.choices?.[0]?.message?.content?.trim() || FRIENDLY_ERROR_MESSAGE;
}
