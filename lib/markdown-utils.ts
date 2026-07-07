export type ArticlePart = {
  number: number;
  title: string;
  content: string;
};

export function toPersianNumber(value: number) {
  return new Intl.NumberFormat("fa-IR", {
    useGrouping: false,
  }).format(value);
}

function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (character) =>
      String("۰۱۲۳۴۵۶۷۸۹".indexOf(character))
    )
    .replace(/[٠-٩]/g, (character) =>
      String("٠١٢٣٤٥٦٧٨٩".indexOf(character))
    );
}

function extractPartTitle(
  markdown: string,
  partNumber: number
) {
  const headingPattern =
    /^\s{0,3}#{1,3}\s+(.+?)\s*$/m;

  const headingMatch =
    markdown.match(headingPattern);

  if (!headingMatch) {
    return {
      title: `بخش ${toPersianNumber(partNumber)}`,
      content: markdown.trim(),
    };
  }

  return {
    title: headingMatch[1]
      .replace(/[*_`]/g, "")
      .trim(),

    content: markdown
      .replace(headingMatch[0], "")
      .trim(),
  };
}

export function parseArticleParts(
  markdown: string
): ArticlePart[] {
  const markerPattern =
    /<!--\s*FRONTDOCS_PART:(\d+)\s*-->/g;

  const matches = [
    ...markdown.matchAll(markerPattern),
  ];

  if (!matches.length) {
    return [];
  }

  return matches.map((match, index) => {
    const partNumber = Number(match[1]);

    const contentStart =
      (match.index ?? 0) +
      match[0].length;

    const contentEnd =
      index + 1 < matches.length
        ? matches[index + 1].index
        : markdown.length;

    const partMarkdown = markdown
      .slice(contentStart, contentEnd)
      .trim();

    const extracted = extractPartTitle(
      partMarkdown,
      partNumber
    );

    return {
      number: partNumber,
      title: extracted.title,
      content: extracted.content,
    };
  });
}

export function getPartNumberFromQuery(
  parts: ArticlePart[]
) {
  const defaultPartNumber =
    parts[0]?.number ?? 1;

  if (typeof window === "undefined") {
    return defaultPartNumber;
  }

  const searchParams =
    new URLSearchParams(
      window.location.search
    );

  const rawPart =
    searchParams.get("part");

  if (!rawPart) {
    return defaultPartNumber;
  }

  const requestedPartNumber = Number(
    normalizeDigits(rawPart)
  );

  if (
    !Number.isInteger(requestedPartNumber)
  ) {
    return defaultPartNumber;
  }

  const requestedPartExists =
    parts.some(
      (part) =>
        part.number ===
        requestedPartNumber
    );

  return requestedPartExists
    ? requestedPartNumber
    : defaultPartNumber;
}

export type HistoryMode = "push" | "replace";

export function updatePartQuery(
  partNumber: number,
  mode: HistoryMode = "push"
) {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(
    window.location.href
  );

  url.searchParams.set(
    "part",
    String(partNumber)
  );

  const relativeUrl =
    `${url.pathname}` +
    `${url.search}` +
    `${url.hash}`;

  const historyState = {
    ...window.history.state,
    frontDocsPart: partNumber,
  };

  if (mode === "replace") {
    window.history.replaceState(
      historyState,
      "",
      relativeUrl
    );

    return;
  }

  window.history.pushState(
    historyState,
    "",
    relativeUrl
  );
}

export function scrollToPartPanel() {
  window.requestAnimationFrame(() => {
    document
      .querySelector(
        ".article-part-panel"
      )
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  });
}
