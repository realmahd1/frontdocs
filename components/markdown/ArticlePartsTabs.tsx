import type { ArticlePart } from "@/lib/markdown-utils";
import { toPersianNumber } from "@/lib/markdown-utils";

type Props = {
  parts: ArticlePart[];
  activePartNumber: number;
  onSelect: (partNumber: number) => void;
};

export default function ArticlePartsTabs({
  parts,
  activePartNumber,
  onSelect,
}: Props) {
  return (
    <div
      className="article-parts-tabs"
      role="tablist"
      aria-label="بخش‌های مقاله"
    >
      {parts.map((part) => {
        const isActive =
          part.number === activePartNumber;

        return (
          <button
            key={part.number}
            id={`article-part-tab-${part.number}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`article-part-panel-${part.number}`}
            tabIndex={isActive ? 0 : -1}
            className={
              isActive
                ? "article-part-tab is-active"
                : "article-part-tab"
            }
            onClick={() => onSelect(part.number)}
          >
            <span className="article-part-number">
              {toPersianNumber(part.number)}
            </span>

            <span className="article-part-tab-text">
              <strong>
                بخش {toPersianNumber(part.number)}
              </strong>
            </span>
          </button>
        );
      })}
    </div>
  );
}
