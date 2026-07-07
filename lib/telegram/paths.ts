import path from "node:path";

const root = process.cwd();

export const blogPaths = {
  posts: path.join(
    root,
    "content",
    "posts"
  ),

  fragments: path.join(
    root,
    "content",
    "telegram"
  ),

  generated: path.join(
    root,
    "public",
    "generated"
  ),
};