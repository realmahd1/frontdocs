import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { processTelegramUpdate } from "@/lib/telegram/process-update";
import type { TelegramUpdate } from "@/lib/telegram/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function secretsMatch(received: string | null, expected: string) {
  if (!received) return false;

  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(receivedBuffer, expectedBuffer);
}

export async function GET() {
  return Response.json({
    ok: true,
    service: "telegram-markdown-webhook",
  });
}

export async function POST(request: Request) {
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();

  if (!expectedSecret) {
    return Response.json(
      { ok: false, error: "TELEGRAM_WEBHOOK_SECRET is not configured." },
      { status: 500 }
    );
  }

  const receivedSecret = request.headers.get(
    "x-telegram-bot-api-secret-token"
  );

  if (!secretsMatch(receivedSecret, expectedSecret)) {
    return Response.json(
      { ok: false, error: "Invalid webhook secret." },
      { status: 401 }
    );
  }

  try {
    const update = (await request.json()) as TelegramUpdate;
    const result = await processTelegramUpdate(update);

    if (
      result.status === "created" ||
      result.status === "updated" ||
      result.status === "removed"
    ) {
      revalidatePath("/");
      revalidatePath("/blog");
      revalidatePath(`/blog/${result.articleKey}`);
      revalidatePath("/tag/[tag]", "page");
      revalidatePath("/sitemap.xml");

      if ("previousArticleKey" in result && result.previousArticleKey) {
        revalidatePath(`/blog/${result.previousArticleKey}`);
      }
    }

    return Response.json({ ok: true, result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected webhook error.";

    console.error("Telegram webhook error:", error);

    // Returning 500 makes Telegram retry the idempotent update later.
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
