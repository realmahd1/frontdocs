export type TelegramMessageEntity = {
  type: string;
  offset: number;
  length: number;
  url?: string;
  language?: string;
};

export type TelegramPhotoSize = {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  file_size?: number;
};

export type TelegramDocument = {
  file_id: string;
  file_unique_id: string;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
};

export type TelegramChat = {
  id: number;
  type: string;
  title?: string;
  username?: string;
};

export type TelegramMessage = {
  message_id: number;
  date: number;
  edit_date?: number;
  media_group_id?: string;
  chat: TelegramChat;
  text?: string;
  caption?: string;
  entities?: TelegramMessageEntity[];
  caption_entities?: TelegramMessageEntity[];
  photo?: TelegramPhotoSize[];
  document?: TelegramDocument;
};

export type TelegramUpdate = {
  update_id: number;
  channel_post?: TelegramMessage;
  edited_channel_post?: TelegramMessage;
};

export type ParsedTelegramPost = {
  publish: boolean;
  remove: boolean;
  articleKey: string;
  partNumber: number;
  title?: string;
  description?: string;
  author: string;
  customCover?: string;
  tags: string[];
  body: string;
};
