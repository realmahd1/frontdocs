import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const POSTS_DIRECTORY = path.join(process.cwd(), "content", "posts");

type Frontmatter = {
  title?: string;
  description?: string;
  date?: string;
  updatedAt?: string;
  author?: string;
  cover?: string;
  tags?: string[];
  draft?: boolean;
};

export type PostSummary = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updatedAt?: string;
  author: string;
  cover?: string;
  tags: string[];
  readingTime: number;
};

export type Post = PostSummary & {
  content: string;
};

function ensurePostsDirectory() {
  if (!fs.existsSync(POSTS_DIRECTORY)) {
    fs.mkdirSync(POSTS_DIRECTORY, { recursive: true });
  }
}

function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim().replace(/^#/, ""))
    .filter(Boolean);
}

function calculateReadingTime(content: string): number {
  const words = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`\-[\]()]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 180));
}

function createDescription(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function parsePostFile(filename: string): Post | null {
  const fullPath = path.join(POSTS_DIRECTORY, filename);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const frontmatter = data as Frontmatter;

  if (frontmatter.draft) {
    return null;
  }

  const slug = filename.replace(/\.md$/, "");
  const title = frontmatter.title?.trim() || slug;
  const description =
    frontmatter.description?.trim() || createDescription(content);
  const date = frontmatter.date || new Date(0).toISOString();

  return {
    slug,
    title,
    description,
    date,
    updatedAt: frontmatter.updatedAt,
    author: frontmatter.author?.trim() || "نویسنده",
    cover: frontmatter.cover,
    tags: normalizeTags(frontmatter.tags),
    readingTime: calculateReadingTime(content),
    content,
  };
}

export function getAllPosts(): PostSummary[] {
  ensurePostsDirectory();

  return fs
    .readdirSync(POSTS_DIRECTORY)
    .filter((filename) => filename.endsWith(".md"))
    .map(parsePostFile)
    .filter((post): post is Post => Boolean(post))
    .sort(
      (first, second) =>
        new Date(second.date).getTime() - new Date(first.date).getTime()
    )
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      updatedAt: post.updatedAt,
      author: post.author,
      cover: post.cover,
      tags: post.tags,
      readingTime: post.readingTime,
    }));
}

export function getPostBySlug(slug: string): Post | null {
  ensurePostsDirectory();

  const safeSlug = path.basename(decodeURIComponent(slug));
  const filename = `${safeSlug}.md`;
  const fullPath = path.join(POSTS_DIRECTORY, filename);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  return parsePostFile(filename);
}

export function getAllTags(): string[] {
  return Array.from(
    new Set(getAllPosts().flatMap((post) => post.tags))
  ).sort((a, b) => a.localeCompare(b, "fa"));
}

export function getPostsByTag(tag: string): PostSummary[] {
  const normalizedTag = tag.toLocaleLowerCase();

  return getAllPosts().filter((post) =>
    post.tags.some(
      (postTag) => postTag.toLocaleLowerCase() === normalizedTag
    )
  );
}

export function formatPersianDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsedDate);
}
