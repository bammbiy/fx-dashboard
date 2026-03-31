import { useIndices } from "@/hooks/useMarketData";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatChange } from "@/utils/format";

export function IndexList() {
  const { results, loading } = useIndices();

  return (
    <div className="card index-list-card">
      <h3 className="section-label">주요 지수</h3>

      <ul className="index-list" role="list">
        {loading && results.every(r => r.quote === null)
          ? Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="index-row index-row--skeleton">
                <Skeleton width={90}  height={14} />
                <Skeleton width={70}  height={14} />
              </li>
            ))
          : results.map(({ config, quote, error }) => {
              if (error || !quote) {
                return (
                  <li key={config.ticker} className="index-row">
                    <div>
                      <span className="index-name">{config.name}</span>
                      <span className="index-ticker">{config.ticker}</span>
                    </div>
                    <span className="index-na">—</span>
                  </li>
                );
              }

              const { meta } = quote;
              const price    = meta.regularMarketPrice;
              const prev     = meta.chartPreviousClose ?? meta.previousClose ?? price;
              const chgPct   = ((price - prev) / prev) * 100;
              const isUp     = chgPct >= 0;

              return (
                <li key={config.ticker} className="index-row">
                  <div>
                    <span className="index-name">{config.name}</span>
                    <span className="index-ticker">{config.ticker}</span>
                  </div>
                  <div className="index-right">
                    <span className="index-price">
                      {price.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                    </span>
                    <span className={`index-change index-change--${isUp ? "up" : "down"}`}>
                      {formatChange(chgPct)}
                    </span>
                  </div>
                </li>
              );
            })}
      </ul>
    </div>
  );
}
