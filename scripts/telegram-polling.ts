import fs from "node:fs/promises";
import path from "node:path";
import { processTelegramUpdate } from "../lib/telegram/process-update";
import type { TelegramUpdate } from "../lib/telegram/types";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();
const API_BASE = BOT_TOKEN
  ? `https://api.telegram.org/bot${BOT_TOKEN}`
  : "";
const POLL_TIMEOUT = Math.min(
  50,
  Math.max(1, Number(process.env.TELEGRAM_POLL_TIMEOUT || 30))
);
const OFFSET_FILE = path.join(
  process.cwd(),
  "storage",
  "telegram-polling-offset.txt"
);

let stopping = false;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function telegramRequest<T>(
  method: string,
  body?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(`${API_BASE}/${method}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body || {}),
  });

  const result = (await response.json()) as {
    ok: boolean;
    result?: T;
    description?: string;
    error_code?: number;
    parameters?: {
      retry_after?: number;
    };
  };

  if (!response.ok || !result.ok) {
    const retryAfter = result.parameters?.retry_after;
    const error = new Error(
      result.description || `Telegram API request failed: ${method}`
    ) as Error & {
      status?: number;
      retryAfter?: number;
    };

    error.status = result.error_code || response.status;
    error.retryAfter = retryAfter;
    throw error;
  }

  return result.result as T;
}

async function readOffset(): Promise<number> {
  try {
    const value = await fs.readFile(OFFSET_FILE, "utf8");
    const offset = Number(value.trim());
    return Number.isFinite(offset) && offset >= 0 ? offset : 0;
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === "ENOENT") {
      return 0;
    }
    throw error;
  }
}

async function writeOffset(offset: number) {
  await fs.mkdir(path.dirname(OFFSET_FILE), { recursive: true });
  await fs.writeFile(OFFSET_FILE, String(offset), "utf8");
}

async function removeWebhook() {
  const result = await telegramRequest<boolean>("deleteWebhook", {
    drop_pending_updates: false,
  });

  if (!result) {
    throw new Error("Telegram webhook could not be removed.");
  }
}

async function getUpdates(offset: number): Promise<TelegramUpdate[]> {
  return telegramRequest<TelegramUpdate[]>("getUpdates", {
    offset,
    limit: 100,
    timeout: POLL_TIMEOUT,
    allowed_updates: ["channel_post", "edited_channel_post"],
  });
}

async function run() {
  if (!BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN is missing in .env.local");
  }

  await removeWebhook();

  let offset = await readOffset();
  let retryDelayMs = 1_000;

  console.log("Telegram polling started.");
  console.log(`Long-poll timeout: ${POLL_TIMEOUT}s`);
  console.log(`Starting offset: ${offset}`);
  console.log("Press Ctrl+C to stop.\n");

  while (!stopping) {
    try {
      const updates = await getUpdates(offset);
      retryDelayMs = 1_000;

      if (!updates.length) {
        continue;
      }

      for (const update of updates) {
        if (stopping) {
          break;
        }

        try {
          const result = await processTelegramUpdate(update);
          console.log(
            JSON.stringify(
              {
                updateId: update.update_id,
                ...result,
              },
              null,
              2
            )
          );
        } catch (error) {
          console.error(
            `Failed to process Telegram update ${update.update_id}:`,
            error
          );
        } finally {
          // Moving the offset forward prevents this update from being fetched again.
          // The article writer is idempotent by Telegram message id, so a rare retry
          // after a crash is also safe.
          offset = update.update_id + 1;
          await writeOffset(offset);
        }
      }
    } catch (error) {
      const requestError = error as Error & {
        status?: number;
        retryAfter?: number;
      };

      if (stopping) {
        break;
      }

      if (requestError.status === 409) {
        console.error(
          "Telegram returned 409 Conflict. Stop every other polling process and make sure no webhook is active."
        );
      } else {
        console.error("Telegram polling error:", requestError.message);
      }

      const waitMs = requestError.retryAfter
        ? requestError.retryAfter * 1_000
        : retryDelayMs;

      await sleep(waitMs);
      retryDelayMs = Math.min(retryDelayMs * 2, 30_000);
    }
  }

  console.log("Telegram polling stopped.");
}

function stop() {
  stopping = true;
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
