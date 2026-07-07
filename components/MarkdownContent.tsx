"use client";

import { useMemo, useState } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

type Props = {
  content: string;
};

type ArticlePart = {
  number: number;
  title: string;
  content: string;
};

const markdownComponents: Components = {
  a({ href, children, ...props }) {
    const isExternal = href?.startsWith("http");

    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer noopener" : undefined}
        {...props}
      >
        {children}
      </a>
    );
  },

  img({ src, alt, ...props }) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src || ""}
        alt={alt || ""}
        loading="lazy"
        {...props}
      />
    );
  },
};

function toPersianNumber(value: number) {
  return new Intl.NumberFormat("fa-IR", {
    useGrouping: false,
  }).format(value);
}

function extractPartTitle(
  markdown: string,
  partNumber: number
) {
  const headingPattern =
    /^\s{0,3}#{1,3}\s+(.+?)\s*$/m;

  const headingMatch = markdown.match(
    headingPattern
  );

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

    /*
     * Heading اول حذف می‌شود چون عنوان بخش را
     * بالای Card نمایش می‌دهیم.
     */
    content: markdown
      .replace(headingMatch[0], "")
      .trim(),
  };
}

function parseArticleParts(
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
      (match.index ?? 0) + match[0].length;

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

function StandardMarkdown({
  content,
}: {
  content: string;
}) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default function MarkdownContent({
  content,
}: Props) {
  const parts = useMemo(
    () => parseArticleParts(content),
    [content]
  );

  const [activePartNumber, setActivePartNumber] =
    useState(parts[0]?.number ?? 1);

  /*
   * پست‌هایی که part ندارند مثل قبل نمایش
   * داده می‌شوند.
   */
  if (!parts.length) {
    return <StandardMarkdown content={content} />;
  }

  const activePart =
    parts.find(
      (part) =>
        part.number === activePartNumber
    ) ?? parts[0];

  const activeIndex = parts.findIndex(
    (part) =>
      part.number === activePart.number
  );

  const previousPart =
    activeIndex > 0
      ? parts[activeIndex - 1]
      : null;

  const nextPart =
    activeIndex < parts.length - 1
      ? parts[activeIndex + 1]
      : null;

  return (
    <div className="article-parts">
      <div
        className="article-parts-tabs"
        role="tablist"
        aria-label="بخش‌های مقاله"
      >
        {parts.map((part) => {
          const isActive =
            part.number === activePart.number;

          return (
            <button
              key={part.number}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={
                isActive
                  ? "article-part-tab is-active"
                  : "article-part-tab"
              }
              onClick={() =>
                setActivePartNumber(part.number)
              }
            >
              <span className="article-part-number">
                {toPersianNumber(part.number)}
              </span>

              <span className="article-part-tab-text">
                <small>
                  بخش{" "}
                  {toPersianNumber(part.number)}
                </small>

                <strong>{part.title}</strong>
              </span>
            </button>
          );
        })}
      </div>

      <section
        key={activePart.number}
        className="article-part-panel"
        role="tabpanel"
      >
        <header className="article-part-header">
          <div className="article-part-badge">
            بخش{" "}
            {toPersianNumber(
              activePart.number
            )}
          </div>

          <div>
            <p>
              قسمت{" "}
              {toPersianNumber(
                activeIndex + 1
              )}{" "}
              از{" "}
              {toPersianNumber(parts.length)}
            </p>

            <h2>{activePart.title}</h2>
          </div>
        </header>

        <StandardMarkdown
          content={activePart.content}
        />

        <nav
          className="article-part-navigation"
          aria-label="حرکت بین بخش‌ها"
        >
          <div>
            {previousPart && (
              <button
                type="button"
                className="article-part-nav-button"
                onClick={() =>
                  setActivePartNumber(
                    previousPart.number
                  )
                }
              >
                <span>بخش قبلی</span>
                <strong>
                  {previousPart.title}
                </strong>
              </button>
            )}
          </div>

          <div>
            {nextPart && (
              <button
                type="button"
                className="article-part-nav-button next"
                onClick={() =>
                  setActivePartNumber(
                    nextPart.number
                  )
                }
              >
                <span>بخش بعدی</span>
                <strong>
                  {nextPart.title}
                </strong>
              </button>
            )}
          </div>
        </nav>
      </section>
    </div>
  );
}