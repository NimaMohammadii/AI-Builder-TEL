export type TelegramChatType = "private" | "group" | "supergroup" | "channel";

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  username?: string;
  first_name?: string;
  language_code?: string;
}

export interface TelegramChat {
  id: number;
  type: TelegramChatType;
  title?: string;
  username?: string;
}

export interface TelegramEntity {
  offset: number;
  length: number;
  type:
    | "mention"
    | "hashtag"
    | "cashtag"
    | "bot_command"
    | "url"
    | "email"
    | "phone_number"
    | "bold"
    | "italic"
    | "underline"
    | "strikethrough"
    | "spoiler"
    | "code"
    | "pre"
    | "text_link"
    | "text_mention";
}

export interface TelegramMessage {
  message_id: number;
  date: number;
  text?: string;
  caption?: string;
  from?: TelegramUser;
  chat: TelegramChat;
  entities?: TelegramEntity[];
  caption_entities?: TelegramEntity[];
  photo?: Array<{ file_id?: string }>;
  reply_to_message?: {
    message_id: number;
    from?: TelegramUser;
    photo?: Array<{ file_id?: string }>;
  };
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
}

export interface TelegramApiSuccess<T> {
  ok: true;
  result: T;
}

export interface TelegramApiError {
  ok: false;
  error_code: number;
  description: string;
}

export type TelegramApiResponse<T> = TelegramApiSuccess<T> | TelegramApiError;
