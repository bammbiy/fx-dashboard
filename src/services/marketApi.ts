import axios from "axios";
import type { Quote, IndexConfig } from "@/types";

const PROXY   = "https://corsproxy.io/?url=";
const YF_BASE = "https://query1.finance.yahoo.com/v8/finance/chart/";

export const SP500_SYM = "%5EGSPC";

export const INDICES: IndexConfig[] = [
  { sym: "%5EGSPC", name: "S&P 500",    ticker: "^GSPC" },
  { sym: "%5EIXIC", name: "NASDAQ",     ticker: "^IXIC" },
  { sym: "%5EDJI",  name: "다우존스",   ticker: "^DJI"  },
  { sym: "%5EKS11", name: "KOSPI",      ticker: "^KS11" },
  { sym: "%5EN225", name: "니케이 225", ticker: "^N225" },
  { sym: "%5EFCHI", name: "CAC 40",     ticker: "^FCHI" },
];

interface YahooChartResponse {
  chart: {
    result: Array<{
      meta: {
        regularMarketPrice:    number;
        regularMarketOpen?:    number;
        regularMarketDayHigh?: number;
        regularMarketDayLow?:  number;
        chartPreviousClose?:   number;
        previousClose?:        number;
        marketState?:          string;
        currency?:             string;
      };
      indicators: {
        quote: Array<{ close: (number | null)[] }>;
      };
    }>;
    error: null | { code: string; description: string };
  };
}

export async function fetchQuote(encodedSym: string): Promise<Quote> {
  const targetUrl = `${YF_BASE}${encodedSym}?interval=1d&range=10d`;
  const { data }  = await axios.get<YahooChartResponse>(
    PROXY + encodeURIComponent(targetUrl),
    { timeout: 10_000 },
  );

  if (data.chart.error) {
    throw new Error(data.chart.error.description);
  }

  const result = data.chart.result[0];
  const closes = result.indicators.quote[0].close.filter(
    (v): v is number => v !== null,
  );

  return { meta: result.meta, closes };
}

/**
 * Fetch all configured indices in parallel.
 * Each result is either resolved (Quote) or rejected (Error).
 */
export async function fetchAllIndices(): Promise<
  PromiseSettledResult<Quote & { config: IndexConfig }>[]
> {
  return Promise.allSettled(
    INDICES.map(cfg => fetchQuote(cfg.sym).then(q => ({ ...q, config: cfg }))),
  );
}
