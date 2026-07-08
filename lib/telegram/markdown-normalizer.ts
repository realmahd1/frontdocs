import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

function isWordCharacter(
  character: string | undefined
) {
  if (!character) {
    return false;
  }

  return /[\p{L}\p{N}]/u.test(character);
}

function isStandaloneBoldMarker(line: string) {
  return /^\s*(?:\*\*\s*)+$/.test(line);
}

function isExactStandaloneBoldMarker(
  line: string
) {
  return /^\s*\*\*\s*$/.test(line);
}

function countBoldMarkers(line: string) {
  return line.match(/\*\*/g)?.length ?? 0;
}

function removeTelegramSignature(line: string) {
  let result = line;

  result = result.replace(
    /\[\s*👨(?:\uFE0F)?\u200D💻\s*@front_docs\s*\]\(\s*https?:\/\/(?:t\.me|telegram\.me)\/front_docs\/?\s*\)/giu,
    ""
  );

  result = result.replace(
    /👨(?:\uFE0F)?\u200D💻\s*@front_docs/gu,
    ""
  );

  return result.trim()
    ? result.trimEnd()
    : "";
}

function normalizeBalancedBold(line: string) {
  return line.replace(
    /\*\*[ \t]*([^*\n]+?)[ \t]*\*\*/g,
    (
      fullMatch: string,
      innerText: string,
      offset: number,
      source: string
    ) => {
      const beforeCharacter =
        source[offset - 1];

      const afterCharacter =
        source[
          offset + fullMatch.length
        ];

      const prefix =
        isWordCharacter(beforeCharacter)
          ? " "
          : "";

      const suffix =
        isWordCharacter(afterCharacter)
          ? " "
          : "";

      return (
        `${prefix}` +
        `**${innerText.trim()}**` +
        `${suffix}`
      );
    }
  );
}

function normalizeUnbalancedBold(line: string) {
  if (isStandaloneBoldMarker(line)) {
    return "";
  }

  const markers =
    line.match(/\*\*/g) ?? [];

  if (markers.length !== 1) {
    return line;
  }

  const trimmed = line.trim();

  if (
    trimmed.startsWith("**") &&
    !trimmed.endsWith("**") &&
    trimmed.slice(2).trim()
  ) {
    return `${line.trimEnd()}**`;
  }

  if (
    trimmed.endsWith("**") &&
    !trimmed.startsWith("**")
  ) {
    const contentBeforeMarker =
      line.slice(
        0,
        line.lastIndexOf("**")
      );

    if (contentBeforeMarker.trim()) {
      return contentBeforeMarker.trimEnd();
    }

    return "";
  }

  const markerIndex =
    line.indexOf("**");

  const contentBeforeMarker =
    line.slice(0, markerIndex);

  const contentAfterMarker =
    line.slice(markerIndex + 2);

  const characterBeforeMarker =
    line[markerIndex - 1];

  if (
    contentAfterMarker.trim() &&
    (
      !characterBeforeMarker ||
      /[\s([{>]/.test(
        characterBeforeMarker
      )
    )
  ) {
    return `${line.trimEnd()}**`;
  }

  if (
    contentBeforeMarker.trim() &&
    !contentAfterMarker.trim()
  ) {
    return contentBeforeMarker.trimEnd();
  }

  return line;
}

function normalizeBold(line: string) {
  if (isStandaloneBoldMarker(line)) {
    return "";
  }

  let result =
    normalizeBalancedBold(line);

  if (isStandaloneBoldMarker(result)) {
    return "";
  }

  result =
    normalizeUnbalancedBold(result);

  return result;
}

function isBlockquoteContent(line: string) {
  return /^\s*>\s*\S/.test(line);
}

function isEmptyBlockquote(line: string) {
  return /^\s*>\s*$/.test(line);
}


function getBlockquoteIndent(line: string) {
  const match = line.match(/^(\s*)>/);

  return match?.[1] ?? "";
}

function startsMultilineBold(line: string) {
  const trimmed = line.trim();

  return (
    trimmed.startsWith("**") &&
    !trimmed.endsWith("**") &&
    countBoldMarkers(line) % 2 === 1
  );
}

function closesMultilineBold(line: string) {
  const trimmed = line.trim();

  return (
    !isExactStandaloneBoldMarker(line) &&
    trimmed.endsWith("**") &&
    countBoldMarkers(line) % 2 === 1
  );
}

function hasMultilineBoldCloser(
  lines: string[],
  startIndex: number
) {
  for (
    let index = startIndex;
    index < lines.length;
    index += 1
  ) {
    const line = lines[index];

    if (!line.trim()) {
      return false;
    }

    if (/^\s*(`{3,}|~{3,})/.test(line)) {
      return false;
    }

    if (closesMultilineBold(line)) {
      return true;
    }
  }

  return false;
}

function prependBoldMarker(line: string) {
  const indentation =
    line.match(/^(\s*)/)?.[1] ?? "";

  return (
    `${indentation}**` +
    line.trimStart()
  );
}

function splitMarkdownPrefix(line: string) {
  const match = line.match(
    /^(\s*(?:>\s*)*(?:(?:[-+*]\s+|\d+[.)]\s+))?)(.*)$/
  );

  if (!match) {
    return {
      prefix: "",
      content: line,
    };
  }

  return {
    prefix: match[1],
    content: match[2],
  };
}

function removeOpeningBoldMarker(
  line: string
) {
  const {
    prefix,
    content,
  } = splitMarkdownPrefix(line);

  if (!content.startsWith("**")) {
    return line;
  }

  return (
    `${prefix}` +
    content.slice(2)
  );
}

function removeClosingBoldMarker(
  line: string
) {
  return line.replace(
    /\*\*\s*$/,
    ""
  );
}

function addOpeningBoldMarker(
  line: string
) {
  const {
    prefix,
    content,
  } = splitMarkdownPrefix(line);

  return `${prefix}**${content}`;
}

function addClosingBoldMarker(
  line: string
) {
  return `${line.trimEnd()}**`;
}

function wrapParagraphWithBold(
  lines: string[]
) {
  if (!lines.length) {
    return [];
  }

  const result = [...lines];

  result[0] =
    addOpeningBoldMarker(result[0]);

  const lastIndex =
    result.length - 1;

  result[lastIndex] =
    addClosingBoldMarker(
      result[lastIndex]
    );

  return result;
}

type BoldClosingMarker = {
  index: number;
  standalone: boolean;
};

function findParagraphBoldCloser(
  lines: string[],
  startIndex: number
): BoldClosingMarker | null {
  for (
    let index = startIndex;
    index < lines.length;
    index += 1
  ) {
    const line = lines[index];

    if (/^\s*(`{3,}|~{3,})/.test(line)) {
      return null;
    }

    if (isExactStandaloneBoldMarker(line)) {
      return {
        index,
        standalone: true,
      };
    }

    if (closesMultilineBold(line)) {
      return {
        index,
        standalone: false,
      };
    }
  }

  return null;
}

function isParagraphBoldOpeningLine(
  line: string
) {
  if (isExactStandaloneBoldMarker(line)) {
    return true;
  }

  const {
    content,
  } = splitMarkdownPrefix(line);

  const trimmedContent =
    content.trim();

  return (
    trimmedContent.startsWith("**") &&
    countBoldMarkers(content) % 2 === 1
  );
}

function normalizeParagraphSeparatedBoldBlocks(
  markdown: string
) {
  const lines = markdown.split("\n");
  const output: string[] = [];

  let insideCodeFence = false;
  let codeFenceCharacter = "";
  let codeFenceLength = 0;

  let lineIndex = 0;

  while (lineIndex < lines.length) {
    const currentLine =
      lines[lineIndex];

    const fenceMatch =
      currentLine.match(
        /^\s*(`{3,}|~{3,})/
      );

    if (fenceMatch) {
      const fence = fenceMatch[1];
      const character = fence[0];

      if (!insideCodeFence) {
        insideCodeFence = true;
        codeFenceCharacter = character;
        codeFenceLength = fence.length;
      } else if (
        character ===
          codeFenceCharacter &&
        fence.length >=
          codeFenceLength
      ) {
        insideCodeFence = false;
        codeFenceCharacter = "";
        codeFenceLength = 0;
      }

      output.push(currentLine);
      lineIndex += 1;
      continue;
    }

    if (insideCodeFence) {
      output.push(currentLine);
      lineIndex += 1;
      continue;
    }

    if (
      !isParagraphBoldOpeningLine(
        currentLine
      )
    ) {
      output.push(currentLine);
      lineIndex += 1;
      continue;
    }

    const openingOnOwnLine =
      isExactStandaloneBoldMarker(
        currentLine
      );

    const closer =
      findParagraphBoldCloser(
        lines,
        lineIndex + 1
      );

    if (!closer) {
      output.push(currentLine);
      lineIndex += 1;
      continue;
    }

    let contentLines: string[];

    if (openingOnOwnLine) {
      contentLines = lines.slice(
        lineIndex + 1,
        closer.standalone
          ? closer.index
          : closer.index + 1
      );
    } else {
      contentLines = lines.slice(
        lineIndex,
        closer.standalone
          ? closer.index
          : closer.index + 1
      );

      if (contentLines.length) {
        contentLines[0] =
          removeOpeningBoldMarker(
            contentLines[0]
          );
      }
    }

    if (
      !closer.standalone &&
      contentLines.length
    ) {
      const lastIndex =
        contentLines.length - 1;

      contentLines[lastIndex] =
        removeClosingBoldMarker(
          contentLines[lastIndex]
        );
    }

    while (
      contentLines.length &&
      !contentLines[0].trim()
    ) {
      contentLines.shift();
    }

    while (
      contentLines.length &&
      !contentLines[
        contentLines.length - 1
      ].trim()
    ) {
      contentLines.pop();
    }

    const hasParagraphSeparator =
      contentLines.some(
        (line) => !line.trim()
      );

    if (!hasParagraphSeparator) {
      output.push(
        ...lines.slice(
          lineIndex,
          closer.index + 1
        )
      );

      lineIndex =
        closer.index + 1;

      continue;
    }

    const paragraphs: string[][] = [];
    let currentParagraph: string[] = [];

    for (const contentLine of contentLines) {
      if (!contentLine.trim()) {
        if (currentParagraph.length) {
          paragraphs.push(
            currentParagraph
          );

          currentParagraph = [];
        }

        continue;
      }

      currentParagraph.push(
        contentLine
      );
    }

    if (currentParagraph.length) {
      paragraphs.push(
        currentParagraph
      );
    }

    paragraphs.forEach(
      (
        paragraph,
        paragraphIndex
      ) => {
        output.push(
          ...wrapParagraphWithBold(
            paragraph
          )
        );

        if (
          paragraphIndex <
          paragraphs.length - 1
        ) {
          output.push("");
        }
      }
    );

    lineIndex =
      closer.index + 1;
  }

  return output.join("\n");
}

function normalizeMarkdownLines(
  markdown: string
) {
  const lines = markdown.split("\n");
  const output: string[] = [];

  let insideCodeFence = false;
  let codeFenceCharacter = "";
  let codeFenceLength = 0;

  let pendingStandaloneBoldStart = false;

  let insideMultilineBold = false;

  for (
    let lineIndex = 0;
    lineIndex < lines.length;
    lineIndex += 1
  ) {
    const originalLine =
      lines[lineIndex];

    const fenceMatch =
      originalLine.match(
        /^\s*(`{3,}|~{3,})/
      );

    if (fenceMatch) {
      const fence = fenceMatch[1];
      const character = fence[0];

      if (!insideCodeFence) {
        insideCodeFence = true;
        codeFenceCharacter = character;
        codeFenceLength = fence.length;

        pendingStandaloneBoldStart =
          false;

        insideMultilineBold = false;

        output.push(originalLine);
        continue;
      }

      if (
        character ===
          codeFenceCharacter &&
        fence.length >=
          codeFenceLength
      ) {
        insideCodeFence = false;
        codeFenceCharacter = "";
        codeFenceLength = 0;

        output.push(originalLine);
        continue;
      }
    }

    if (insideCodeFence) {
      output.push(originalLine);
      continue;
    }

    let line =
      removeTelegramSignature(
        originalLine
      );

    if (
      isStandaloneBoldMarker(line) &&
      !isExactStandaloneBoldMarker(line)
    ) {
      continue;
    }

    if (isExactStandaloneBoldMarker(line)) {
      const hasCloser =
        hasMultilineBoldCloser(
          lines,
          lineIndex + 1
        );

      if (hasCloser) {
        pendingStandaloneBoldStart =
          true;

        continue;
      }

      continue;
    }

    if (pendingStandaloneBoldStart) {
      line =
        prependBoldMarker(line);

      pendingStandaloneBoldStart =
        false;

      insideMultilineBold =
        countBoldMarkers(line) %
          2 ===
        1;

      line =
        normalizeBalancedBold(line);
    } else if (insideMultilineBold) {
      line =
        normalizeBalancedBold(line);

      if (closesMultilineBold(line)) {
        insideMultilineBold = false;
      }
    } else {
      const isExistingMultilineStart =
        startsMultilineBold(line) &&
        hasMultilineBoldCloser(
          lines,
          lineIndex + 1
        );

      if (isExistingMultilineStart) {
        line =
          normalizeBalancedBold(line);

        insideMultilineBold = true;
      } else {
        line = normalizeBold(line);
      }
    }

    const previousLine =
      output[output.length - 1];

    if (
      isBlockquoteContent(line) &&
      previousLine !== undefined &&
      isBlockquoteContent(
        previousLine
      ) &&
      !isEmptyBlockquote(
        previousLine
      )
    ) {
      const indent =
        getBlockquoteIndent(line);

      output.push(`${indent}>`);
    }

    output.push(line);
  }

  return output.join("\n");
}

export function normalizeGeneratedMarkdown(
  markdown: string
) {
  let normalized = markdown.replace(
    /\r\n?/g,
    "\n"
  );

  normalized =
    normalizeParagraphSeparatedBoldBlocks(
      normalized
    );

  normalized =
    normalizeMarkdownLines(normalized);

  normalized = normalized
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n");

  normalized = normalized.replace(
    /\n{3,}/g,
    "\n\n"
  );

  return normalized.trim();
}

export async function normalizeMarkdownFile(
  filePath: string
) {
  const source = await fs.readFile(
    filePath,
    "utf8"
  );

  const parsed = matter(source);

  const normalizedContent =
    normalizeGeneratedMarkdown(
      parsed.content
    );

  if (
    normalizedContent ===
    parsed.content.trim()
  ) {
    return false;
  }

  const output = matter.stringify(
    `${normalizedContent}\n`,
    parsed.data
  );

  await fs.writeFile(
    filePath,
    output,
    "utf8"
  );

  return true;
}

async function findMarkdownFiles(
  directoryPath: string
): Promise<string[]> {
  const entries = await fs.readdir(
    directoryPath,
    {
      withFileTypes: true,
    }
  );

  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(
      directoryPath,
      entry.name
    );

    if (entry.isDirectory()) {
      const nestedFiles =
        await findMarkdownFiles(
          entryPath
        );

      files.push(...nestedFiles);
      continue;
    }

    if (
      entry.isFile() &&
      entry.name
        .toLowerCase()
        .endsWith(".md")
    ) {
      files.push(entryPath);
    }
  }

  return files.sort(
    (first, second) =>
      first.localeCompare(second)
  );
}

export async function normalizeAllMarkdownFiles(
  directoryPath: string
) {
  const markdownFiles =
    await findMarkdownFiles(
      directoryPath
    );

  const changedFiles: string[] = [];

  for (const filePath of markdownFiles) {
    const changed =
      await normalizeMarkdownFile(
        filePath
      );

    if (changed) {
      changedFiles.push(filePath);
    }
  }

  return {
    total: markdownFiles.length,
    changed: changedFiles.length,
    changedFiles,
  };
}