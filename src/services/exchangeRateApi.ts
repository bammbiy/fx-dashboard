import axios from "axios";
import type { ExchangeRateResponse } from "@/types";

const BASE_URL = "https://open.er-api.com/v6/latest";

// Offline fallback snapshot (USD-base). Updated whenever live data loads.
export const FALLBACK_RATES: Record<string, number> = {
  USD: 1,     KRW: 1370,  EUR: 0.920, JPY: 155.0, GBP: 0.780,
  CNY: 7.200, CAD: 1.360, AUD: 1.530, CHF: 0.900, HKD: 7.820,
  SGD: 1.340, INR: 83.50, MXN: 17.10, BRL: 5.050, SEK: 10.40,
  NOK: 10.60, THB: 35.20, PHP: 56.80, IDR: 15850,  VND: 25100,
  TWD: 32.30,
};

export async function fetchRates(base = "USD"): Promise<ExchangeRateResponse> {
  const { data } = await axios.get<ExchangeRateResponse>(`${BASE_URL}/${base}`, {
    timeout: 8_000,
  });

  if (data.result !== "success") {
    throw new Error("API returned non-success result");
  }

  return data;
}

/**
 * Compute the cross rate from `src` to `dst` using a USD-based rate table.
 * Returns null when either currency is missing from the table.
 */
export function crossRate(
  rates: Record<string, number>,
  src: string,
  dst: string,
): number | null {
  if (src === dst) return 1;

  // rates are expressed as "1 USD = N [currency]"
  const srcToUSD = src === "USD" ? 1 : rates[src] ? 1 / rates[src] : null;
  const usdToDst = rates[dst] ?? null;

  if (srcToUSD === null || usdToDst === null) return null;
  return srcToUSD * usdToDst;
}
