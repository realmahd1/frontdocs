import fs from "node:fs/promises";
import path from "node:path";
import { blogPaths } from "@/lib/telegram/paths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{ path: string[] }>;
};

const CONTENT_TYPES: Record<string, string> = {
  ".svg": "image/svg+xml; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".txt": "text/plain; charset=utf-8",
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { path: requestedPath } = await params;
  const baseDirectory = path.resolve(blogPaths.generated);
  const filename = path.resolve(baseDirectory, ...requestedPath);

  if (
    filename !== baseDirectory &&
    !filename.startsWith(`${baseDirectory}${path.sep}`)
  ) {
    return new Response("Invalid path", { status: 400 });
  }

  try {
    const data = await fs.readFile(filename);
    const extension = path.extname(filename).toLocaleLowerCase();

    return new Response(data, {
      headers: {
        "Content-Type": CONTENT_TYPES[extension] || "application/octet-stream",
        "Cache-Control": "public, max-age=0, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
