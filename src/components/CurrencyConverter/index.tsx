import {
  useState,
  useCallback,
  useId,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import type { ConversionEntry } from "@/types";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { crossRate } from "@/services/exchangeRateApi";
import { formatAmount, ratePrecision, formatUtcDate } from "@/utils/format";
import { storageGet, storageSet } from "@/utils/storage";
import { CurrencySelect } from "./CurrencySelect";
import { ConversionHistory } from "./ConversionHistory";
import { Skeleton } from "@/components/ui/Skeleton";

const HISTORY_KEY  = "conv_history";
const HISTORY_MAX  = 20;
const DISPLAY_MAX  = 8;

type Driver = "from" | "to";

function nanToEmpty(v: number): string {
  return isNaN(v) ? "" : String(v);
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function CurrencyConverter() {
  const id = useId();
  const { state, rates } = useExchangeRates();

  const [fromCcy, setFromCcy] = useState("USD");
  const [toCcy,   setToCcy]   = useState("KRW");
  const [fromVal, setFromVal] = useState("");
  const [toVal,   setToVal]   = useState("");
  const [driver,  setDriver]  = useState<Driver>("from");
  const [error,   setError]   = useState<string | null>(null);
  const [history, setHistory] = useState<ConversionEntry[]>(() =>
    storageGet<ConversionEntry[]>(HISTORY_KEY, []),
  );

  // ── conversion logic ───────────────────────────────────────────────────

  const compute = useCallback(
    (amount: number, src: string, dst: string): number | null => {
      const rate = crossRate(rates, src, dst);
      if (rate === null) return null;
      return amount * rate;
    },
    [rates],
  );

  const pushHistory = useCallback(
    (entry: Omit<ConversionEntry, "id" | "timestamp">) => {
      setHistory(prev => {
        // debounce: skip if last entry is the same conversion (within 0.01%)
        const last = prev[0];
        if (
          last &&
          last.srcCcy === entry.srcCcy &&
          last.dstCcy === entry.dstCcy &&
          Math.abs(last.from - entry.from) / (entry.from || 1) < 0.0001
        ) {
          return prev;
        }
        const next: ConversionEntry[] = [
          { ...entry, id: generateId(), timestamp: Date.now() },
          ...prev,
        ].slice(0, HISTORY_MAX);
        storageSet(HISTORY_KEY, next);
        return next;
      });
    },
    [],
  );

  const runConversion = useCallback(
    (raw: string, src: string, dst: string, drv: Driver) => {
      setError(null);

      const amount = parseFloat(raw);
      if (raw === "" || isNaN(amount)) {
        drv === "from" ? setToVal("") : setFromVal("");
        return;
      }

      const rate = crossRate(rates, src, dst);
      if (rate === null) {
        setError(`지원하지 않는 통화 쌍: ${src} → ${dst}`);
        return;
      }

      if (drv === "from") {
        const result = amount * rate;
        const dp     = ratePrecision(dst);
        setToVal(result.toFixed(dp));
        pushHistory({ from: amount, to: result, srcCcy: src, dstCcy: dst, rate });
      } else {
        // inverse: user typed the destination amount
        const inverseRate = 1 / rate;
        const result      = amount * inverseRate;
        const dp          = ratePrecision(src);
        setFromVal(result.toFixed(dp));
        pushHistory({ from: result, to: amount, srcCcy: src, dstCcy: dst, rate });
      }
    },
    [rates, pushHistory],
  );

  // ── handlers ───────────────────────────────────────────────────────────

  function handleFromInput(e: ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setFromVal(v);
    setDriver("from");
    runConversion(v, fromCcy, toCcy, "from");
  }

  function handleToInput(e: ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setToVal(v);
    setDriver("to");
    runConversion(v, fromCcy, toCcy, "to");
  }

  function handleFromCcy(ccy: string) {
    setFromCcy(ccy);
    if (driver === "from") runConversion(fromVal, ccy, toCcy,   "from");
    else                   runConversion(toVal,   ccy, toCcy,   "to");
  }

  function handleToCcy(ccy: string) {
    setToCcy(ccy);
    if (driver === "from") runConversion(fromVal, fromCcy, ccy, "from");
    else                   runConversion(toVal,   fromCcy, ccy, "to");
  }

  function handleSwap() {
    setFromCcy(toCcy);
    setToCcy(fromCcy);
    setFromVal(toVal);
    setToVal(fromVal);
    setDriver(d => (d === "from" ? "to" : "from"));
    // recompute after swap
    runConversion(toVal, toCcy, fromCcy, "from");
  }

  function handleHistorySelect(entry: ConversionEntry) {
    setFromCcy(entry.srcCcy);
    setToCcy(entry.dstCcy);
    setFromVal(String(entry.from));
    setDriver("from");
    runConversion(String(entry.from), entry.srcCcy, entry.dstCcy, "from");
  }

  function handleClearHistory() {
    setHistory([]);
    storageSet(HISTORY_KEY, []);
  }

  // allow Enter on inputs to trigger explicit recalculation
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>, drv: Driver) {
    if (e.key === "Enter") {
      const val = drv === "from" ? fromVal : toVal;
      runConversion(val, fromCcy, toCcy, drv);
    }
  }

  // ── derived display ────────────────────────────────────────────────────

  const currentRate = crossRate(rates, fromCcy, toCcy);
  const rateLabel   =
    currentRate !== null
      ? `1 ${fromCcy} = ${currentRate.toFixed(ratePrecision(toCcy))} ${toCcy}`
      : null;

  const result =
    fromVal && !isNaN(parseFloat(fromVal)) && currentRate !== null
      ? compute(parseFloat(fromVal), fromCcy, toCcy)
      : null;

  const isLoading = state.status === "loading";
  const isLive    = state.status === "success";
  const updatedAt =
    state.status === "success"
      ? formatUtcDate(state.data.time_last_update_utc)
      : null;

  // ── render ─────────────────────────────────────────────────────────────

  return (
    <div className="card converter-card">
      {/* status bar */}
      <div className={`rate-bar ${isLive ? "rate-bar--live" : state.status === "error" ? "rate-bar--warn" : ""}`}>
        {isLoading ? (
          <Skeleton width={180} height={12} />
        ) : isLive ? (
          <>
            <span className="rate-bar__dot" aria-hidden />
            <span>실시간 환율</span>
            {updatedAt && <span className="rate-bar__time">{updatedAt} 기준</span>}
          </>
        ) : (
          <span>⚠ 오프라인 기준환율 사용 중</span>
        )}
      </div>

      <h2 className="card-title">통화 변환기</h2>

      {/* from row */}
      <div className="input-group" role="group" aria-label="변환할 금액과 통화">
        <label htmlFor={`${id}-from`} className="sr-only">금액</label>
        <input
          id={`${id}-from`}
          className="amount-input"
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={fromVal}
          onChange={handleFromInput}
          onKeyDown={e => handleKeyDown(e, "from")}
          min={0}
          aria-label="변환할 금액"
        />
        <CurrencySelect
          id={`${id}-from-ccy`}
          value={fromCcy}
          onChange={handleFromCcy}
        />
      </div>

      {/* swap */}
      <div className="swap-row">
        <div className="divider" role="separator" />
        <button
          className="swap-btn"
          onClick={handleSwap}
          aria-label="통화 방향 전환"
        >
          <span className="swap-icon" aria-hidden>⇅</span>
          SWAP
        </button>
        <div className="divider" role="separator" />
      </div>

      {/* to row */}
      <div className="input-group" role="group" aria-label="변환된 금액과 통화">
        <label htmlFor={`${id}-to`} className="sr-only">변환된 금액</label>
        <input
          id={`${id}-to`}
          className="amount-input"
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={toVal}
          onChange={handleToInput}
          onKeyDown={e => handleKeyDown(e, "to")}
          min={0}
          aria-label="변환된 금액"
        />
        <CurrencySelect
          id={`${id}-to-ccy`}
          value={toCcy}
          onChange={handleToCcy}
        />
      </div>

      {/* error */}
      {error && (
        <p className="input-error" role="alert">{error}</p>
      )}

      {/* result box */}
      <div className="result-box" aria-live="polite" aria-atomic>
        <p className="result-label">환산 결과</p>
        <p className="result-value">
          {result !== null
            ? <>{formatAmount(result, toCcy)} <span className="result-ccy">{toCcy}</span></>
            : "—"}
        </p>
        {rateLabel && (
          <p className="result-rate">{rateLabel}</p>
        )}
      </div>

      {/* history */}
      <ConversionHistory
        entries={history.slice(0, DISPLAY_MAX)}
        onSelect={handleHistorySelect}
        onClear={handleClearHistory}
      />
    </div>
  );
}
