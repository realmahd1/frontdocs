import { composeArticle } from "./composer";
import {
  deleteFragment,
  findFragmentByMessage,
  writeFragment,
} from "./fragments";
import { removeMessageMedia, saveTelegramMedia } from "./media";
import { parseTelegramPost } from "./parser";
import type { TelegramMessage, TelegramUpdate } from "./types";

function isoDate(unixSeconds: number | undefined) {
  return new Date((unixSeconds || Math.floor(Date.now() / 1000)) * 1000).toISOString();
}

function isAllowedChannel(message: TelegramMessage) {
  const allowed = process.env.TELEGRAM_ALLOWED_CHANNEL_ID?.trim();
  return !allowed || String(message.chat.id) === allowed;
}

export async function processTelegramUpdate(update: TelegramUpdate) {
  const message = update.channel_post || update.edited_channel_post;
  const updateType = update.edited_channel_post
    ? "edited_channel_post"
    : update.channel_post
      ? "channel_post"
      : "ignored";

  if (!message) {
    return { status: "ignored", reason: "unsupported_update" };
  }

  if (!isAllowedChannel(message)) {
    return { status: "ignored", reason: "channel_not_allowed" };
  }

  const chatId = String(message.chat.id);
  const existing = await findFragmentByMessage(chatId, message.message_id);
  const parsed = parseTelegramPost(message);

  // Removing #blog from an edited post unpublishes that fragment.
  if (!parsed.publish || parsed.remove) {
    if (!existing) {
      return {
        status: "ignored",
        reason: parsed.remove ? "nothing_to_delete" : "missing_blog_hashtag",
      };
    }

    await deleteFragment(existing);
    await removeMessageMedia(existing.articleKey, message.message_id);
    const oldArticle = await composeArticle(existing.articleKey);

    return {
      status: "removed",
      updateType,
      articleKey: existing.articleKey,
      article: oldArticle,
    };
  }

  const oldArticleKey = existing?.articleKey;

  if (existing && existing.articleKey !== parsed.articleKey) {
    await deleteFragment(existing);
    await removeMessageMedia(existing.articleKey, message.message_id);
  }

  const media = await saveTelegramMedia(
    message,
    parsed.articleKey,
    parsed.title || parsed.articleKey
  );
  const body = [parsed.body, ...media.map((item) => item.markdown)]
    .filter(Boolean)
    .join("\n\n");

  await writeFragment(
    {
      telegramChatId: chatId,
      telegramMessageId: message.message_id,
      telegramMediaGroupId: message.media_group_id,
      articleKey: parsed.articleKey,
      partNumber: parsed.partNumber,
      title: parsed.title,
      description: parsed.description,
      author: parsed.author,
      customCover: parsed.customCover,
      tags: parsed.tags,
      publishedAt: existing?.publishedAt || isoDate(message.date),
      updatedAt: isoDate(message.edit_date || message.date),
    },
    body
  );

  if (oldArticleKey && oldArticleKey !== parsed.articleKey) {
    await composeArticle(oldArticleKey);
  }

  const article = await composeArticle(parsed.articleKey);

  return {
    status: existing ? "updated" : "created",
    updateType,
    articleKey: parsed.articleKey,
    article,
    media: media.map((item) => item.publicUrl),
    previousArticleKey:
      oldArticleKey && oldArticleKey !== parsed.articleKey
        ? oldArticleKey
        : undefined,
  };
}
