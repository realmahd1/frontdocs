import path from "node:path";

function resolveFromProject(value: string | undefined, fallback: string) {
  return path.resolve(
    /* turbopackIgnore: true */ process.cwd(),
    value?.trim() || fallback
  );
}

export const blogPaths = {
  posts: resolveFromProject(process.env.BLOG_POSTS_DIR, "content/posts"),
  fragments: resolveFromProject(
    process.env.TELEGRAM_FRAGMENTS_DIR,
    "content/telegram"
  ),
  generated: resolveFromProject(
    process.env.BLOG_GENERATED_DIR,
    "storage/generated"
  ),
};
