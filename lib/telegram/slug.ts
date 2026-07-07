export function slugify(input: string): string {
  return input
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("en")
    .replace(/[\u200c\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

export function safeFilePart(input: string): string {
  const value = slugify(input);
  return value || "untitled";
}
