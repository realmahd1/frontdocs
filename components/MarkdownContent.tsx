"use client";

import { useEffect, useMemo, useState } from "react";
import type { HistoryMode } from "@/lib/markdown-utils";
import {
  parseArticleParts,
  getPartNumberFromQuery,
  updatePartQuery,
  scrollToPartPanel,
} from "@/lib/markdown-utils";
import StandardMarkdown from "./markdown/StandardMarkdown";
import ArticlePartsTabs from "./markdown/ArticlePartsTabs";
import ArticlePartPanel from "./markdown/ArticlePartPanel";

type Props = {
  content: string;
};

export default function MarkdownContent({ content }: Props) {
  const parts = useMemo(
    () => parseArticleParts(content),
    [content]
  );

  const [activePartNumber, setActivePartNumber] =
    useState(parts[0]?.number ?? 1);

  useEffect(() => {
    if (!parts.length) return;

    const syncPartWithUrl = () => {
      setActivePartNumber(getPartNumberFromQuery(parts));
    };

    syncPartWithUrl();
    window.addEventListener("popstate", syncPartWithUrl);
    return () => window.removeEventListener("popstate", syncPartWithUrl);
  }, [parts]);

  function selectPart(
    partNumber: number,
    options?: { historyMode?: HistoryMode; scroll?: boolean }
  ) {
    if (!parts.some((p) => p.number === partNumber)) return;

    setActivePartNumber(partNumber);
    updatePartQuery(
      partNumber,
      options?.historyMode ?? "push"
    );

    if (options?.scroll !== false) {
      scrollToPartPanel();
    }
  }

  if (!parts.length) {
    return <StandardMarkdown content={content} />;
  }

  const activePart =
    parts.find((p) => p.number === activePartNumber) ?? parts[0];

  const activeIndex = parts.findIndex(
    (p) => p.number === activePart.number
  );

  return (
    <div className="article-parts">
      <ArticlePartsTabs
        parts={parts}
        activePartNumber={activePart.number}
        onSelect={selectPart}
      />

      <ArticlePartPanel
        part={activePart}
        partIndex={activeIndex}
        totalParts={parts.length}
        previousPart={activeIndex > 0 ? parts[activeIndex - 1] : null}
        nextPart={
          activeIndex < parts.length - 1
            ? parts[activeIndex + 1]
            : null
        }
        onNavigate={selectPart}
      />
    </div>
  );
}
