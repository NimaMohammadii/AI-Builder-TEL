import type { TelegramUiMarkup } from "./telegram-ui";
import { AI_MENU_BUTTON_TEXT } from "./ai-control-menu";

export const MAIN_MENU_TEXT = [
  "⚡️ Vexa Control Center",
  "",
  "مسیرهای اصلی:",
  "",
  "🔌 کانکت — وضعیت ربات وصل‌شده و مدیریت اتصال",
  "🤖 AI — وضعیت AI، پرامپت و کنترل هوش مصنوعی ربات کاربر",
  "✨ ساخت ربات بدون کدنویسی — هر چیزی می‌خوای با متن بگو تا برای رباتت ساخته و اعمال بشه",
  "",
  "یکی رو انتخاب کن 👇"
].join("\n");

export const BUILDER_START_TEXT = [
  "✨ وارد حالت ساخت بدون کدنویسی شدی",
  "",
  "از اینجا به بعد هر چیزی بنویسی، من به چشم دستور ساخت/ویرایش ربات نگاه می‌کنم.",
  "",
  "نکته مهم:",
  "• هر دستور جدید روی ساختار قبلی ادیت و اضافه می‌شود.",
  "• اگر می‌خوای از صفر بسازی، دکمه «ریست ربات» رو بزن.",
  "• هر ربات فضای کد و رفتار مخصوص خودش را دارد.",
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

export const BUILDER_RESET_TEXT = [
  "♻️ ربات ریست شد",
  "",
  "همه منوها، کامندها، تنظیمات اجرایی، دستورهای ساخت و حافظه‌های مربوط به ساخت این ربات پاک شدند.",
  "حالا می‌تونی از صفر دوباره بسازیش."
].join("\n");

export function buildMainMenuKeyboard(): TelegramUiMarkup {
  return {
    keyboard: [
      [{ text: "🔌 کانکت" }, { text: AI_MENU_BUTTON_TEXT }],
      [{ text: "✨ ساخت ربات بدون کدنویسی" }]
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
    input_field_placeholder: "یکی از گزینه‌های اصلی رو انتخاب کن..."
  };
}

export function buildBuilderKeyboard(): TelegramUiMarkup {
  return {
    keyboard: [[{ text: "✅ اتمام ساخت" }, { text: "♻️ ریست ربات" }]],
    resize_keyboard: true,
    one_time_keyboard: false,
    input_field_placeholder: "دستور ساخت یا ویرایش رباتت رو بنویس..."
  };
}

export function buildConnectInlineKeyboard(): TelegramUiMarkup {
  return {
    inline_keyboard: [
      [
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

export function isBuilderResetRequest(text: string): boolean {
  return text.trim() === "♻️ ریست ربات";
}
