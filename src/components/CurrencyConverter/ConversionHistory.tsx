import type { ConversionEntry } from "@/types";
import { formatAmount, relativeTime } from "@/utils/format";

interface ConversionHistoryProps {
  entries:  ConversionEntry[];
  onSelect: (entry: ConversionEntry) => void;
  onClear:  () => void;
}

export function ConversionHistory({
  entries,
  onSelect,
  onClear,
}: ConversionHistoryProps) {
  return (
    <section className="history" aria-label="최근 변환 기록">
      <div className="history-header">
        <h3 className="section-label">최근 변환</h3>
        {entries.length > 0 && (
          <button
            className="btn-ghost btn-ghost--danger"
            onClick={onClear}
            aria-label="기록 모두 삭제"
          >
            삭제
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="history-empty">변환 기록이 없습니다</p>
      ) : (
        <ul className="history-list" role="list">
          {entries.map(entry => (
            <li key={entry.id}>
              <button
                className="history-item"
                onClick={() => onSelect(entry)}
                title="클릭하여 재사용"
              >
                <span className="history-from">
                  {formatAmount(entry.from, entry.srcCcy)} {entry.srcCcy}
                </span>
                <span className="history-arrow" aria-hidden>→</span>
                <span className="history-to">
                  {formatAmount(entry.to, entry.dstCcy)} {entry.dstCcy}
                </span>
                <span className="history-time">{relativeTime(entry.timestamp)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
