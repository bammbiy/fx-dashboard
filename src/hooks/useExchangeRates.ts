import { useState, useEffect, useCallback, useRef } from "react";
import type { AsyncState, ExchangeRateResponse } from "@/types";
import { fetchRates, FALLBACK_RATES } from "@/services/exchangeRateApi";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

interface UseExchangeRatesReturn {
  state: AsyncState<ExchangeRateResponse>;
  rates: Record<string, number>;
  refresh: () => Promise<void>;
}

export function useExchangeRates(): UseExchangeRatesReturn {
  const [state, setState] = useState<AsyncState<ExchangeRateResponse>>({
    status: "loading",
  });

  // Keep a stable rates reference so consumers don't re-render on each tick
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    setState(prev =>
      prev.status === "success"
        ? prev // keep stale data visible while refreshing
        : { status: "loading" },
    );

    try {
      const data = await fetchRates("USD");
      setRates({ USD: 1, ...FALLBACK_RATES, ...data.rates });
      setState({ status: "success", data, updatedAt: Date.now() });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setState(prev =>
        prev.status === "success"
          ? prev // keep last good data, don't show error over it
          : { status: "error", error: message },
      );
    }
  }, []);

  useEffect(() => {
    void load();
    timerRef.current = setInterval(() => void load(), REFRESH_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [load]);

  return { state, rates, refresh: load };
}
