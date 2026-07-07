import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { blogPaths } from "./paths";
import { ensureDirectory, removeEmptyDirectory, writeFileAtomic } from "./fs-utils";

export type TelegramFragmentData = {
  telegramChatId: string;
  telegramMessageId: number;
  telegramMediaGroupId?: string;
  articleKey: string;
  partNumber: number;
  title?: string;
  description?: string;
  author: string;
  customCover?: string;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
};

export type TelegramFragment = TelegramFragmentData & {
  body: string;
  filePath: string;
};

function fragmentPath(articleKey: string, messageId: number) {
  return path.join(blogPaths.fragments, articleKey, `${messageId}.md`);
}

export async function writeFragment(
  data: TelegramFragmentData,
  body: string
) {
  const filename = fragmentPath(data.articleKey, data.telegramMessageId);
  const serializableData = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  );
  const output = matter.stringify(`${body.trim()}\n`, serializableData);
  await writeFileAtomic(filename, output);
  return filename;
}

export async function findFragmentByMessage(
  chatId: string,
  messageId: number
): Promise<TelegramFragment | null> {
  await ensureDirectory(blogPaths.fragments);

  const articleDirectories = await fs.readdir(blogPaths.fragments, {
    withFileTypes: true,
  });

  for (const directory of articleDirectories) {
    if (!directory.isDirectory()) continue;

    const filename = fragmentPath(directory.name, messageId);

    try {
      const source = await fs.readFile(filename, "utf8");
      const parsed = matter(source);
      const data = parsed.data as Partial<TelegramFragmentData>;

      if (
        String(data.telegramChatId) === String(chatId) &&
        Number(data.telegramMessageId) === messageId
      ) {
        return {
          ...(data as TelegramFragmentData),
          body: parsed.content.trim(),
          filePath: filename,
        };
      }
    } catch {
      // This article folder does not contain this message.
    }
  }

  return null;
}

export async function deleteFragment(fragment: TelegramFragment) {
  await fs.rm(fragment.filePath, { force: true });
  await removeEmptyDirectory(path.dirname(fragment.filePath));
}

export async function readArticleFragments(articleKey: string) {
  const directory = path.join(blogPaths.fragments, articleKey);

  try {
    const filenames = (await fs.readdir(directory)).filter((filename) =>
      filename.endsWith(".md")
    );

    const fragments = await Promise.all(
      filenames.map(async (filename): Promise<TelegramFragment> => {
        const filePath = path.join(directory, filename);
        const source = await fs.readFile(filePath, "utf8");
        const parsed = matter(source);

        return {
          ...(parsed.data as TelegramFragmentData),
          body: parsed.content.trim(),
          filePath,
        };
      })
    );

    return fragments.sort(
      (a, b) =>
        a.partNumber - b.partNumber ||
        a.telegramMessageId - b.telegramMessageId
    );
  } catch {
    return [];
  }
}
