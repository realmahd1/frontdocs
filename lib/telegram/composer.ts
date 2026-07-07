import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { generateCoverSvg } from "./cover";
import { blogPaths } from "./paths";
import {
  ensureDirectory,
  writeFileAtomic,
  withFileLock,
} from "./fs-utils";
import { readArticleFragments } from "./fragments";

const MESSAGE_DIVIDER = "\n\n---\n\n";

function uniqueTags(tags: string[]) {
  const values = new Map<string, string>();

  for (const tag of tags) {
    const cleaned = tag.trim().replace(/^#/, "");

    if (cleaned) {
      values.set(
        cleaned.toLocaleLowerCase(),
        cleaned
      );
    }
  }

  return [...values.values()];
}

function plainText(markdown: string) {
  return markdown
    /*
     * حذف Commentها و Markerهای داخلی:
     * <!-- FRONTDOCS_PART:1 -->
     */
    .replace(/<!--[\s\S]*?-->/g, " ")

    /*
     * حذف Code Block
     */
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/~~~[\s\S]*?~~~/g, " ")

    /*
     * حذف تصویر Markdown
     */
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")

    /*
     * تبدیل لینک Markdown به متن لینک
     */
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")

    /*
     * حذف تگ‌های HTML احتمالی
     */
    .replace(/<[^>]+>/g, " ")

    /*
     * حذف علامت Heading
     */
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")

    /*
     * حذف علامت Blockquote
     */
    .replace(/^\s{0,3}>\s?/gm, "")

    /*
     * حذف Bulletهای لیست
     */
    .replace(/^\s*[-+*]\s+/gm, "")

    /*
     * حذف فرمت‌های باقی‌مانده Markdown
     */
    .replace(/[*_`~|]/g, " ")

    /*
     * یکسان‌کردن فاصله‌ها و خطوط
     */
    .replace(/\s+/g, " ")
    .trim();
}
const TELEGRAM_SIGNATURE_PATTERNS = [
  /*
   * حالت متن ساده:
   * 👨‍💻@front_docs
   */
  /(?:\r?\n|\s)*👨(?:\uFE0F)?\u200D💻\s*@front_docs\s*$/iu,

  /*
   * حالتی که Username به لینک Markdown تبدیل شده:
   * 👨‍💻[@front_docs](https://t.me/front_docs)
   */
  /(?:\r?\n|\s)*👨(?:\uFE0F)?\u200D💻\s*\[@front_docs\]\(https?:\/\/(?:t\.me|telegram\.me)\/front_docs\/?\)\s*$/iu,

  /*
   * حالتی که کل امضا لینک شده:
   * [👨‍💻@front_docs](https://t.me/front_docs)
   */
  /(?:\r?\n|\s)*\[👨(?:\uFE0F)?\u200D💻\s*@front_docs\]\(https?:\/\/(?:t\.me|telegram\.me)\/front_docs\/?\)\s*$/iu,
];

function cleanFragmentBody(markdown: string) {
  let cleaned = markdown.trim();

  for (const pattern of TELEGRAM_SIGNATURE_PATTERNS) {
    cleaned = cleaned.replace(pattern, "").trim();
  }

  return cleaned;
}
function truncateText(
  value: string,
  maxLength = 180
) {
  const text = value.trim();

  if (text.length <= maxLength) {
    return text;
  }

  const sliced = text.slice(0, maxLength + 1);
  const lastSpaceIndex = sliced.lastIndexOf(" ");

  const result =
    lastSpaceIndex > maxLength * 0.7
      ? sliced.slice(0, lastSpaceIndex)
      : sliced.slice(0, maxLength);

  return `${result.trim()}…`;
}
export async function composeArticle(
  articleKey: string
) {
  return withFileLock(
    `article:${articleKey}`,
    async () => {
      const fragments =
        await readArticleFragments(articleKey);

      const postFile = path.join(
        blogPaths.posts,
        `${articleKey}.md`
      );

      const coverFile = path.join(
        blogPaths.generated,
        "covers",
        `${articleKey}-cover.svg`
      );

      if (!fragments.length) {
        await fs.rm(postFile, {
          force: true,
        });

        await fs.rm(coverFile, {
          force: true,
        });

        return {
          articleKey,
          deleted: true as const,
        };
      }

      const title =
        fragments
          .find(
            (fragment) =>
              fragment.title?.trim()
          )
          ?.title?.trim() || articleKey;

      const author =
        fragments
          .find(
            (fragment) =>
              fragment.author?.trim()
          )
          ?.author?.trim() ||
        process.env.BLOG_DEFAULT_AUTHOR?.trim() ||
        "نویسنده";

      const tags = uniqueTags(
        fragments.flatMap(
          (fragment) =>
            fragment.tags || []
        )
      );

      /*
       * تمام پیام‌هایی که partNumber یکسان دارند
       * داخل یک بخش قرار می‌گیرند.
       *
       * مثلاً:
       *
       * message 101 => partNumber: 1
       * message 102 => partNumber: 1
       * message 103 => partNumber: 2
       *
       * خروجی:
       *
       * یک بخش برای Part 1
       * یک بخش برای Part 2
       */
      const fragmentsByPart = new Map<
        number,
        Array<(typeof fragments)[number]>
      >();

      fragments.forEach(
        (fragment, fragmentIndex) => {
          const fragmentBody =
            cleanFragmentBody(fragment.body);

          /*
           * اگر پیام فقط شامل امضا بوده باشد،
           * وارد مقاله نمی‌شود.
           */
          if (!fragmentBody) {
            return;
          }

          const partNumber =
            fragment.partNumber ??
            fragmentIndex + 1;

          const currentPartFragments =
            fragmentsByPart.get(partNumber) ??
            [];

          currentPartFragments.push({
            ...fragment,
            body: fragmentBody,
          });

          fragmentsByPart.set(
            partNumber,
            currentPartFragments
          );
        }
      );

      const body = [
        ...fragmentsByPart.entries(),
      ]
        /*
         * ترتیب بخش‌ها:
         * Part 1، Part 2، Part 3 و ...
         */
        .sort(
          (
            [firstPartNumber],
            [secondPartNumber]
          ) =>
            firstPartNumber -
            secondPartNumber
        )
        .map(
          ([
            partNumber,
            partFragments,
          ]) => {
            /*
             * ترتیب پیام‌های داخل هر بخش همان
             * ترتیبی است که از readArticleFragments
             * دریافت شده است.
             */
            const partBody = partFragments
              .map((fragment) =>
                fragment.body.trim()
              )
              .filter(Boolean)
              .join(MESSAGE_DIVIDER);

            return [
              `<!-- FRONTDOCS_PART:${partNumber} -->`,
              "",
              partBody,
            ].join("\n");
          }
        )
        .join("\n---\n");

      const explicitDescription = fragments
        .find(
          (fragment) =>
            fragment.description?.trim()
        )
        ?.description?.trim();

      const description =
        explicitDescription ||
        truncateText(plainText(body), 180);

      const publishedAt = fragments
        .map(
          (fragment) =>
            fragment.publishedAt
        )
        .sort()[0];

      const updatedAt =
        fragments
          .map(
            (fragment) =>
              fragment.updatedAt
          )
          .sort()
          .at(-1) || publishedAt;

      const customCover = fragments
        .find(
          (fragment) =>
            fragment.customCover?.trim()
        )
        ?.customCover?.trim();

      let cover = customCover;

      if (!cover) {
        await ensureDirectory(
          path.dirname(coverFile)
        );

        await writeFileAtomic(
          coverFile,
          await generateCoverSvg({
            title,
            tags,
            slug: articleKey,
          })
        );

        cover =
          `/generated/covers/` +
          `${encodeURIComponent(articleKey)}` +
          `-cover.svg`;
      }

      const frontmatter = {
        title,
        description,
        date: publishedAt,
        updatedAt,
        author,
        cover,
        tags,
        draft: false,

        telegramMessageIds:
          fragments.map(
            (fragment) =>
              fragment.telegramMessageId
          ),
      };

      const output = matter.stringify(
        `${body}\n`,
        frontmatter
      );

      await ensureDirectory(
        blogPaths.posts
      );

      await writeFileAtomic(
        postFile,
        output
      );

      return {
        articleKey,
        deleted: false as const,
        postFile,

        coverFile: customCover
          ? undefined
          : coverFile,

        fragments: fragments.length,

        /*
         * تعداد بخش‌های واقعی مقاله، نه تعداد
         * پیام‌های تلگرام.
         */
        parts: fragmentsByPart.size,
      };
    }
  );
}