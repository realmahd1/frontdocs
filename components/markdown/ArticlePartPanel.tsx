import type { ArticlePart } from "@/lib/markdown-utils";
import { toPersianNumber } from "@/lib/markdown-utils";
import StandardMarkdown from "./StandardMarkdown";

type Props = {
  part: ArticlePart;
  partIndex: number;
  totalParts: number;
  previousPart: ArticlePart | null;
  nextPart: ArticlePart | null;
  onNavigate: (partNumber: number) => void;
};

export default function ArticlePartPanel({
  part,
  partIndex,
  totalParts,
  previousPart,
  nextPart,
  onNavigate,
}: Props) {
  return (
    <section
      key={part.number}
      id={`article-part-panel-${part.number}`}
      className="article-part-panel"
      role="tabpanel"
      aria-labelledby={`article-part-tab-${part.number}`}
    >
      <header className="article-part-header">
        <div className="article-part-badge">
          بخش {toPersianNumber(part.number)}
        </div>

        <div>
          <p>
            قسمت {toPersianNumber(partIndex + 1)} از{" "}
            {toPersianNumber(totalParts)}
          </p>

          <h2>{part.title}</h2>
        </div>
      </header>

      <StandardMarkdown content={part.content} />

      <nav
        className="article-part-navigation"
        aria-label="حرکت بین بخش‌ها"
      >
        <div>
          {previousPart && (
            <button
              type="button"
              className="article-part-nav-button"
              onClick={() => onNavigate(previousPart.number)}
            >
              <span>بخش قبلی</span>
              <strong>{previousPart.title}</strong>
            </button>
          )}
        </div>

        <div>
          {nextPart && (
            <button
              type="button"
              className="article-part-nav-button next"
              onClick={() => onNavigate(nextPart.number)}
            >
              <span>بخش بعدی</span>
              <strong>{nextPart.title}</strong>
            </button>
          )}
        </div>
      </nav>
    </section>
  );
}
