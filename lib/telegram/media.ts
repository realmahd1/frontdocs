import fs from "node:fs/promises";
import path from "node:path";
import { blogPaths } from "./paths";
import { ensureDirectory, writeFileAtomic } from "./fs-utils";
import type { TelegramMessage } from "./types";

type SavedMedia = {
  markdown: string;
  publicUrl: string;
  filePath: string;
};

type TelegramGetFileResult = {
  ok: boolean;
  description?: string;
  result?: {
    file_id: string;
    file_unique_id: string;
    file_size?: number;
    file_path?: string;
  };
};

function getBotToken() {
  const value = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!value) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured.");
  }
  return value;
}

function safeOriginalFilename(filename: string | undefined) {
  if (!filename) return undefined;

  const extension = path.extname(filename).slice(0, 12);
  const base = path
    .basename(filename, extension)
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}._-]+/gu, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);

  return `${base || "file"}${extension.toLocaleLowerCase()}`;
}

function extensionFromMime(mimeType: string | undefined) {
  const known: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "application/pdf": ".pdf",
    "text/plain": ".txt",
    "application/zip": ".zip",
  };

  return known[mimeType || ""] || "";
}

async function getTelegramFilePath(fileId: string) {
  const token = getBotToken();
  const response = await fetch(
    `https://api.telegram.org/bot${token}/getFile?file_id=${encodeURIComponent(fileId)}`,
    { cache: "no-store" }
  );

  const payload = (await response.json()) as TelegramGetFileResult;
  if (!response.ok || !payload.ok || !payload.result?.file_path) {
    throw new Error(payload.description || "Telegram getFile failed.");
  }

  return payload.result.file_path;
}

async function downloadTelegramFile(filePath: string) {
  const token = getBotToken();
  const response = await fetch(
    `https://api.telegram.org/file/bot${token}/${filePath}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(`Telegram file download failed with ${response.status}.`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

export async function removeMessageMedia(slug: string, messageId: number) {
  const directory = path.join(blogPaths.generated, "media", slug);

  try {
    const files = await fs.readdir(directory);
    await Promise.all(
      files
        .filter((filename) => filename.startsWith(`${messageId}-`))
        .map((filename) => fs.rm(path.join(directory, filename), { force: true }))
    );
  } catch {
    // Media directory does not exist yet.
  }
}

export async function saveTelegramMedia(
  message: TelegramMessage,
  slug: string,
  altText: string
): Promise<SavedMedia[]> {
  const candidates: Array<{
    fileId: string;
    filename?: string;
    mimeType?: string;
    image: boolean;
  }> = [];

  if (message.photo?.length) {
    const photo = [...message.photo].sort(
      (a, b) => b.width * b.height - a.width * a.height
    )[0];

    candidates.push({
      fileId: photo.file_id,
      filename: `${message.message_id}-photo.jpg`,
      mimeType: "image/jpeg",
      image: true,
    });
  }

  if (message.document) {
    candidates.push({
      fileId: message.document.file_id,
      filename: message.document.file_name,
      mimeType: message.document.mime_type,
      image: message.document.mime_type?.startsWith("image/") || false,
    });
  }

  if (!candidates.length) {
    return [];
  }

  const outputDirectory = path.join(blogPaths.generated, "media", slug);
  await ensureDirectory(outputDirectory);
  await removeMessageMedia(slug, message.message_id);

  const saved: SavedMedia[] = [];

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    const telegramPath = await getTelegramFilePath(candidate.fileId);
    const telegramExtension = path.extname(telegramPath).slice(0, 12);
    const original = safeOriginalFilename(candidate.filename);
    const extension =
      path.extname(original || "") ||
      telegramExtension ||
      extensionFromMime(candidate.mimeType) ||
      ".bin";
    const filename = `${message.message_id}-${index + 1}${extension.toLocaleLowerCase()}`;
    const destination = path.join(outputDirectory, filename);
    const bytes = await downloadTelegramFile(telegramPath);

    await writeFileAtomic(destination, bytes);

    const publicUrl = `/generated/media/${encodeURIComponent(slug)}/${encodeURIComponent(filename)}`;
    const label = candidate.filename || altText || "فایل پیوست";

    saved.push({
      publicUrl,
      filePath: destination,
      markdown: candidate.image
        ? `![${altText.replace(/[\[\]]/g, "")}](${publicUrl})`
        : `[دانلود ${label.replace(/[\[\]]/g, "")}](${publicUrl})`,
    });
  }

  return saved;
}
