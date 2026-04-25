export const PROJECT_FEATURES_ENABLED = true;

export type ProjectFeatureIntent = "none" | "bot_id" | "bot_stats" | "project_memory" | "bot_menu";

export function detectProjectFeatureIntent(text: string): ProjectFeatureIntent {
  const value = text.toLowerCase();
  if (!value.trim()) return "none";
  if (value.startsWith("/id") || value.includes("numeric id") || value.includes("bot id") || value.includes("آیدی عددی") || value.includes("ایدی عددی")) return "bot_id";
  if (value.startsWith("/stats") || value.includes("stats") || value.includes("چند نفر") || value.includes("آمار") || value.includes("تعداد کاربر")) return "bot_stats";
  if (value.includes("remember") || value.includes("memory") || value.includes("ذخیره کن") || value.includes("یادت باشه") || value.includes("مموری")) return "project_memory";
  if (value.includes("menu") || value.includes("command") || value.includes("button") || value.includes("منو") || value.includes("دکمه") || value.includes("کامند")) return "bot_menu";
  return "none";
}

export function stripMemoryTrigger(text: string): string {
  return text
    .replace(/remember/ig, "")
    .replace(/memory/ig, "")
    .replace(/ذخیره کن/g, "")
    .replace(/یادت باشه/g, "")
    .replace(/مموری/g, "")
    .trim() || text.trim();
}
