import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { generateCoverSvg } from "../lib/telegram/cover";
import { blogPaths } from "../lib/telegram/paths";
import { ensureDirectory, writeFileAtomic } from "../lib/telegram/fs-utils";

type PostFrontmatter = {
  title?: string;
  tags?: string[];
  cover?: string;
  draft?: boolean;
};

async function main() {
  await ensureDirectory(blogPaths.posts);
  await ensureDirectory(path.join(blogPaths.generated, "covers"));

  const filenames = (await fs.readdir(blogPaths.posts)).filter((filename) =>
    filename.endsWith(".md")
  );

  let generated = 0;
  let skipped = 0;

  for (const filename of filenames) {
    const slug = filename.replace(/\.md$/, "");
    const postFile = path.join(blogPaths.posts, filename);
    const source = await fs.readFile(postFile, "utf8");
    const parsed = matter(source);
    const data = parsed.data as PostFrontmatter;

    if (data.draft) {
      skipped += 1;
      console.log(`Skipped draft: ${slug}`);
      continue;
    }

    const publicCover = `/generated/covers/${encodeURIComponent(slug)}-cover.svg`;
    const hasCustomCover = Boolean(data.cover && data.cover !== publicCover);

    if (hasCustomCover) {
      skipped += 1;
      console.log(`Skipped custom cover: ${slug}`);
      continue;
    }

    const title = data.title?.trim() || slug;
    const tags = Array.isArray(data.tags)
      ? data.tags.filter((tag): tag is string => typeof tag === "string")
      : [];
    const coverFile = path.join(
      blogPaths.generated,
      "covers",
      `${slug}-cover.svg`
    );

    const svg = await generateCoverSvg({ title, tags, slug });
    await writeFileAtomic(coverFile, svg);

    if (data.cover !== publicCover) {
      const updated = matter.stringify(parsed.content, {
        ...parsed.data,
        cover: publicCover,
      });
      await writeFileAtomic(postFile, updated);
    }

    generated += 1;
    console.log(`Generated: ${coverFile}`);
  }

  console.log(`Done. Generated: ${generated}, skipped: ${skipped}`);
}

main().catch((error) => {
  console.error("Cover regeneration failed:", error);
  process.exitCode = 1;
});
