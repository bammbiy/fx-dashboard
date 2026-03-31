// ── Exchange Rate ──────────────────────────────────────────────────────────

export interface ExchangeRateResponse {
  result:              "success" | "error";
  base_code:           string;
  rates:               Record<string, number>;
  time_last_update_utc: string;
}

export interface ConversionEntry {
  id:       string;
  from:     number;
  to:       number;
  srcCcy:   string;
  dstCcy:   string;
  rate:     number;
  timestamp: number;
}

// ── Market / Yahoo Finance ────────────────────────────────────────────────

export interface QuoteMeta {
  regularMarketPrice:    number;
  regularMarketOpen?:    number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?:  number;
  chartPreviousClose?:   number;
  previousClose?:        number;
  marketState?:          "REGULAR" | "PRE" | "POST" | "CLOSED";
  currency?:             string;
}

export interface Quote {
  meta:   QuoteMeta;
  closes: number[];
}

export interface IndexConfig {
  sym:  string; // URL-encoded Yahoo Finance symbol
  name: string;
  ticker: string;
}

// ── Async state wrapper ────────────────────────────────────────────────────

export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T; updatedAt: number }
  | { status: "error"; error: string };
