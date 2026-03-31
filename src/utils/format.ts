const ZERO_DP_CURRENCIES = new Set([
  "JPY", "KRW", "IDR", "VND", "THB", "PHP", "TWD",
]);

/**
 * Format a numeric amount according to the target currency's
 * conventional decimal places, using Korean locale separators.
 */
export function formatAmount(amount: number, currency: string): string {
  const dp = ZERO_DP_CURRENCIES.has(currency) ? 0 : 2;
  return new Intl.NumberFormat("ko-KR", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  }).format(amount);
}

/** Format a stock price in US locale with exactly 2 decimal places. */
export function formatPrice(price: number): string {
  return price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Format a percentage change with sign and 2 decimal places. */
export function formatChange(pct: number): string {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

/**
 * Return the conventional decimal places for a given exchange rate.
 * Rates to high-value currencies (JPY, KRW…) need fewer decimals.
 */
export function ratePrecision(currency: string): number {
  return ZERO_DP_CURRENCIES.has(currency) ? 0 : 4;
}

/** Relative time string, e.g. "3분 전" */
export function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const min  = Math.floor(diff / 60_000);
  if (min < 1)  return "방금 전";
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24)  return `${hr}시간 전`;
  return `${Math.floor(hr / 24)}일 전`;
}

/** UTC date string → Korean locale short format */
export function formatUtcDate(utcString: string): string {
  return new Date(utcString).toLocaleString("ko-KR", {
    month:  "short",
    day:    "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });
}
