import { slugify } from "./slug";
import { telegramTextToMarkdown } from "./markdown";
import type {
  ParsedTelegramPost,
  TelegramMessage,
  TelegramMessageEntity,
} from "./types";

const META_PATTERNS = {
  title: /^(?:عنوان|title)\s*[:：]\s*(.+)$/iu,
  description: /^(?:خلاصه|توضیح|description|excerpt)\s*[:：]\s*(.+)$/iu,
  slug: /^(?:اسلاگ|slug)\s*[:：]\s*(.+)$/iu,
  author: /^(?:نویسنده|author)\s*[:：]\s*(.+)$/iu,
  cover: /^(?:کاور|cover)\s*[:：]\s*(.+)$/iu,
  tags: /^(?:تگ(?:‌|\s|-)*ها|tags)\s*[:：]\s*(.+)$/iu,
};

function getTextAndEntities(message: TelegramMessage) {
  if (typeof message.text === "string") {
    return {
      text: message.text,
      entities: message.entities || [],
    };
  }

  return {
    text: message.caption || "",
    entities: message.caption_entities || [],
  };
}

function extractHashtags(text: string, entities: TelegramMessageEntity[]) {
  const fromEntities = entities
    .filter((entity) => entity.type === "hashtag")
    .map((entity) => text.slice(entity.offset, entity.offset + entity.length));

  const values =
    fromEntities.length > 0
      ? fromEntities
      : Array.from(text.matchAll(/(?:^|\s)(#[\p{L}\p{N}_]+)/gu), (match) =>
          match[1]
        );

  return values.map((value) => value.replace(/^#/, "").trim()).filter(Boolean);
}

function parseMetadata(text: string) {
  const metadata: {
    title?: string;
    description?: string;
    slug?: string;
    author?: string;
    cover?: string;
    tags: string[];
  } = { tags: [] };

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    let match: RegExpMatchArray | null;

    if ((match = line.match(META_PATTERNS.title))) {
      metadata.title = match[1].trim();
    } else if ((match = line.match(META_PATTERNS.description))) {
      metadata.description = match[1].trim();
    } else if ((match = line.match(META_PATTERNS.slug))) {
      metadata.slug = match[1].trim();
    } else if ((match = line.match(META_PATTERNS.author))) {
      metadata.author = match[1].trim();
    } else if ((match = line.match(META_PATTERNS.cover))) {
      metadata.cover = match[1].trim();
    } else if ((match = line.match(META_PATTERNS.tags))) {
      metadata.tags.push(
        ...match[1]
          .split(/[,،]/)
          .map((value) => value.trim().replace(/^#/, ""))
          .filter(Boolean)
      );
    }
  }

  return metadata;
}

function isMetadataLine(line: string) {
  return Object.values(META_PATTERNS).some((pattern) => pattern.test(line.trim()));
}

function isOnlyHashtags(line: string) {
  return /^(?:\s*#[\p{L}\p{N}_]+\s*)+$/u.test(line);
}

function cleanMarkdownBody(markdown: string) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => !isMetadataLine(line))
    .filter((line) => !isOnlyHashtags(line.trim()))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function inferTitle(text: string) {
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || isMetadataLine(line) || isOnlyHashtags(line)) {
      continue;
    }

    return line
      .replace(/^#{1,6}\s*/, "")
      .replace(/[*_`~]/g, "")
      .trim()
      .slice(0, 120);
  }

  return undefined;
}

function uniqueTags(tags: string[]) {
  const unique = new Map<string, string>();

  for (const tag of tags) {
    const cleaned = tag.trim().replace(/^#/, "");
    if (!cleaned) continue;
    unique.set(cleaned.toLocaleLowerCase(), cleaned);
  }

  return [...unique.values()];
}

export function parseTelegramPost(message: TelegramMessage): ParsedTelegramPost {
  const { text, entities } = getTextAndEntities(message);
  const hashtags = extractHashtags(text, entities);
  const normalized = hashtags.map((tag) => tag.toLocaleLowerCase("en"));
  const metadata = parseMetadata(text);

  const publish = normalized.some((tag) => tag === "blog" || tag === "وبلاگ");
  const remove = normalized.some(
    (tag) => tag === "delete" || tag === "حذف" || tag === "unpublish"
  );

  const articleTag = hashtags.find((tag) =>
    /^(?:post|article|مقاله)_/iu.test(tag)
  );
  const articleTagValue = articleTag?.replace(/^(?:post|article|مقاله)_/iu, "");

  const partTag = hashtags.find((tag) =>
    /^(?:part|بخش)_?\d+$/iu.test(tag)
  );
  const partNumber = partTag
    ? Number(partTag.match(/\d+/)?.[0] || 1)
    : 1;

  const title = metadata.title || inferTitle(text);
  const articleKey = slugify(
    metadata.slug || articleTagValue || title || `telegram-${message.message_id}`
  );

  const controlTag = (tag: string) =>
    /^(?:blog|وبلاگ|delete|حذف|unpublish|draft|پیش_نویس)$/iu.test(tag) ||
    /^(?:post|article|مقاله)_/iu.test(tag) ||
    /^(?:part|بخش)_?\d+$/iu.test(tag) ||
    /^cover_auto$/iu.test(tag);

  const tags = uniqueTags([
    ...metadata.tags,
    ...hashtags.filter((tag) => !controlTag(tag)),
  ]);

  const customCover =
    metadata.cover && !/^(?:auto|خودکار)$/iu.test(metadata.cover)
      ? metadata.cover
      : undefined;

  return {
    publish,
    remove,
    articleKey,
    partNumber: Number.isFinite(partNumber) && partNumber > 0 ? partNumber : 1,
    title,
    description: metadata.description,
    author:
      metadata.author || process.env.BLOG_DEFAULT_AUTHOR?.trim() || "نویسنده",
    customCover,
    tags,
    body: cleanMarkdownBody(telegramTextToMarkdown(text, entities)),
  };
}
