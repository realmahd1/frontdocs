import type { TelegramMessageEntity } from "./types";

type Boundary = {
  value: string;
  weight: number;
};

function addBoundary(
  target: Map<number, Boundary[]>,
  position: number,
  boundary: Boundary
) {
  const values = target.get(position) || [];
  values.push(boundary);
  target.set(position, values);
}

function longestBacktickRun(value: string) {
  return Math.max(
    0,
    ...Array.from(value.matchAll(/`+/g), (match) => match[0].length)
  );
}

function safeMarkdownUrl(value: string) {
  return value.replace(/\s/g, "%20").replace(/\)/g, "%29");
}

/**
 * Telegram entity offsets and JavaScript string offsets both use UTF-16 code
 * units, so slice positions can be used directly here.
 */
export function telegramTextToMarkdown(
  text: string,
  entities: TelegramMessageEntity[] = []
) {
  const openings = new Map<number, Boundary[]>();
  const closings = new Map<number, Boundary[]>();

  for (const entity of entities) {
    const start = entity.offset;
    const end = entity.offset + entity.length;
    const selectedText = text.slice(start, end);

    let open = "";
    let close = "";

    switch (entity.type) {
      case "bold":
        open = "**";
        close = "**";
        break;
      case "italic":
        open = "_";
        close = "_";
        break;
      case "underline":
        // GFM has no native underline syntax. Bold is the safest portable form.
        open = "**";
        close = "**";
        break;
      case "strikethrough":
        open = "~~";
        close = "~~";
        break;
      case "spoiler":
        open = "**[اسپویلر: ";
        close = "]**";
        break;
      case "code": {
        const marker = "`".repeat(longestBacktickRun(selectedText) + 1);
        open = marker;
        close = marker;
        break;
      }
      case "pre": {
        const marker = "`".repeat(
          Math.max(3, longestBacktickRun(selectedText) + 1)
        );
        const language = entity.language?.trim() || "";
        open = `\n${marker}${language}\n`;
        close = `\n${marker}\n`;
        break;
      }
      case "text_link":
        open = "[";
        close = `](${safeMarkdownUrl(entity.url || "#")})`;
        break;
      case "blockquote":
      case "expandable_blockquote":
        open = "> ";
        for (let position = start; position < end; position += 1) {
          if (text[position] === "\n" && position + 1 < end) {
            addBoundary(openings, position + 1, {
              value: "> ",
              weight: -entity.length,
            });
          }
        }
        break;
      default:
        break;
    }

    if (open) {
      addBoundary(openings, start, {
        value: open,
        // Longer/outer entities open first.
        weight: -entity.length,
      });
    }

    if (close) {
      addBoundary(closings, end, {
        value: close,
        // Shorter/inner entities close first.
        weight: entity.length,
      });
    }
  }

  let result = "";

  for (let index = 0; index <= text.length; index += 1) {
    const closingValues = closings.get(index);
    if (closingValues) {
      result += closingValues
        .sort((a, b) => a.weight - b.weight)
        .map((item) => item.value)
        .join("");
    }

    const openingValues = openings.get(index);
    if (openingValues) {
      result += openingValues
        .sort((a, b) => a.weight - b.weight)
        .map((item) => item.value)
        .join("");
    }

    if (index < text.length) {
      result += text[index];
    }
  }

  return result
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}
