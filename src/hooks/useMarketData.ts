import { useState, useEffect, useCallback, useRef } from "react";
import type { AsyncState, Quote, IndexConfig } from "@/types";
import { fetchQuote, fetchAllIndices, SP500_SYM, INDICES } from "@/services/marketApi";

const REFRESH_MS = 2 * 60 * 1000; // 2 minutes

// ── S&P 500 ──────────────────────────────────────────────────────────────

interface UseSP500Return {
  state: AsyncState<Quote>;
  refresh: () => Promise<void>;
}

export function useSP500(): UseSP500Return {
  const [state, setState] = useState<AsyncState<Quote>>({ status: "loading" });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchQuote(SP500_SYM);
      setState({ status: "success", data, updatedAt: Date.now() });
    } catch (err) {
      const error = err instanceof Error ? err.message : "Unknown error";
      setState(prev => (prev.status === "success" ? prev : { status: "error", error }));
    }
  }, []);

  useEffect(() => {
    void load();
    timerRef.current = setInterval(() => void load(), REFRESH_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [load]);

  return { state, refresh: load };
}

// ── Index list ────────────────────────────────────────────────────────────

export interface IndexResult {
  config: IndexConfig;
  quote:  Quote | null;
  error:  string | null;
}

interface UseIndicesReturn {
  results: IndexResult[];
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useIndices(): UseIndicesReturn {
  const [results, setResults] = useState<IndexResult[]>(
    INDICES.map(config => ({ config, quote: null, error: null })),
  );
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const settled = await fetchAllIndices();
    setResults(
      settled.map((r, i) => ({
        config: INDICES[i],
        quote:  r.status === "fulfilled" ? r.value : null,
        error:  r.status === "rejected"  ? String(r.reason) : null,
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    timerRef.current = setInterval(() => void load(), REFRESH_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [load]);

  return { results, loading, refresh: load };
}
