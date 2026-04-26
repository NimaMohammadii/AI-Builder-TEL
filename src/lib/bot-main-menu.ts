import type { TelegramUiMarkup } from "./telegram-ui";

export const MAIN_MENU_TEXT = [
  "⚡️ Vexa Control Center",
  "",
  "اینجا فقط دو مسیر اصلی داری:",
  "",
  "🔌 کانکت — وضعیت ربات وصل‌شده، پرامپت، اتصال AI و مدیریت ربات",
  "✨ ساخت ربات بدون کدنویسی — هر چیزی می‌خوای با متن بگو تا برای رباتت ساخته و اعمال بشه",
  "",
  "یکی رو انتخاب کن 👇"
].join("\n");

export const BUILDER_START_TEXT = [
  "✨ وارد حالت ساخت بدون کدنویسی شدی",
  "",
  "از اینجا به بعد هر چیزی بنویسی، من به چشم دستور ساخت/ویرایش ربات نگاه می‌کنم.",
  "",
  "مثال:",
  "• برای رباتم منوی شیک بساز",
  "• پرامپتش رو صمیمی‌تر کن",
  "• دکمه پشتیبانی اضافه کن",
  "• جواب‌های ربات رو کوتاه و حرفه‌ای کن",
  "",
  "وقتی کارت تموم شد دکمه «اتمام ساخت» رو بزن."
].join("\n");

export const BUILDER_DONE_TEXT = [
  "✅ حالت ساخت بسته شد",
  "",
  "برگشتی به منوی اصلی."
].join("\n");

export function buildMainMenuKeyboard(): TelegramUiMarkup {
  return {
    keyboard: [
      [{ text: "🔌 کانکت" }],
      [{ text: "✨ ساخت ربات بدون کدنویسی" }]
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
    input_field_placeholder: "یکی از دو گزینه اصلی رو انتخاب کن..."
  };
}

export function buildBuilderKeyboard(): TelegramUiMarkup {
  return {
    keyboard: [[{ text: "✅ اتمام ساخت" }]],
    resize_keyboard: true,
    one_time_keyboard: false,
    input_field_placeholder: "دستور ساخت یا ویرایش رباتت رو بنویس..."
  };
}

export function buildConnectInlineKeyboard(): TelegramUiMarkup {
  return {
    inline_keyboard: [
      [
        { text: "🟢 فعال/غیرفعال AI", callback_data: "connect:toggle_ai" },
        { text: "🗑 حذف ربات", callback_data: "connect:delete_bot" }
      ],
      [
        { text: "🔄 بروزرسانی وضعیت", callback_data: "connect:refresh" }
      ]
    ]
  };
}

export function isMainMenuRequest(text: string): boolean {
  const value = text.trim();
  return ["/start", "/menu", "start", "menu", "منو", "🏠 منوی اصلی"].includes(value);
}

export function isConnectRequest(text: string): boolean {
  return text.trim() === "🔌 کانکت";
}

export function isBuilderStartRequest(text: string): boolean {
  return text.trim() === "✨ ساخت ربات بدون کدنویسی";
}

export function isBuilderDoneRequest(text: string): boolean {
  return text.trim() === "✅ اتمام ساخت";
}
