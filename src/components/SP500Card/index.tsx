import { useSP500 } from "@/hooks/useMarketData";
import { MiniChart } from "./MiniChart";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatPrice, formatChange } from "@/utils/format";

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="meta-item">
      <span className="meta-label">{label}</span>
      <span className="meta-value">{value}</span>
    </div>
  );
}

export function SP500Card() {
  const { state } = useSP500();

  if (state.status === "loading") {
    return (
      <div className="card sp500-card">
        <div className="card-header">
          <Skeleton width={120} height={20} />
          <Skeleton width={60} height={14} />
        </div>
        <Skeleton width={200} height={40} style={{ marginTop: 12 }} />
        <Skeleton width="100%" height={72} style={{ marginTop: 16 }} />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="card sp500-card sp500-card--error">
        <p className="error-text">⚠ 시세를 불러올 수 없습니다</p>
        <p className="error-sub">{state.error}</p>
      </div>
    );
  }

  if (state.status !== "success") return null;

  const { meta, closes } = state.data;
  const price  = meta.regularMarketPrice;
  const prev   = meta.chartPreviousClose ?? meta.previousClose ?? price;
  const chg    = price - prev;
  const chgPct = (chg / prev) * 100;
  const isUp   = chg >= 0;
  const sign   = isUp ? "+" : "";

  const isMarketOpen = meta.marketState === "REGULAR";

  return (
    <div className="card sp500-card">
      <div className="card-header">
        <div>
          <h2 className="card-title">S&amp;P 500</h2>
          <span className="card-sub">
            ^GSPC
            <span className={`market-state market-state--${isMarketOpen ? "open" : "closed"}`}>
              {isMarketOpen ? "장 중" : "장 마감"}
            </span>
          </span>
        </div>
        <Badge variant={isUp ? "up" : "down"}>
          {sign}{chg.toFixed(2)} ({sign}{chgPct.toFixed(2)}%)
        </Badge>
      </div>

      <p className="sp-price">{formatPrice(price)}</p>

      {closes.length > 1 && (
        <MiniChart closes={closes} isUp={isUp} />
      )}

      <div className="meta-grid">
        <MetaItem label="시가"     value={formatPrice(meta.regularMarketOpen  ?? prev)} />
        <MetaItem label="고가"     value={formatPrice(meta.regularMarketDayHigh ?? price)} />
        <MetaItem label="저가"     value={formatPrice(meta.regularMarketDayLow  ?? price)} />
        <MetaItem label="전일 종가" value={formatPrice(prev)} />
      </div>

      <p className="card-footer">
        {formatChange(chgPct)} vs 전일 종가
      </p>
    </div>
  );
}
