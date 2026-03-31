import type { ChangeEvent } from "react";

export const CURRENCIES: Record<string, string> = {
  USD: "🇺🇸 USD", KRW: "🇰🇷 KRW", EUR: "🇪🇺 EUR", JPY: "🇯🇵 JPY",
  GBP: "🇬🇧 GBP", CNY: "🇨🇳 CNY", CAD: "🇨🇦 CAD", AUD: "🇦🇺 AUD",
  CHF: "🇨🇭 CHF", HKD: "🇭🇰 HKD", SGD: "🇸🇬 SGD", INR: "🇮🇳 INR",
  MXN: "🇲🇽 MXN", BRL: "🇧🇷 BRL", SEK: "🇸🇪 SEK", NOK: "🇳🇴 NOK",
  THB: "🇹🇭 THB", PHP: "🇵🇭 PHP", IDR: "🇮🇩 IDR", VND: "🇻🇳 VND",
  TWD: "🇹🇼 TWD",
};

interface CurrencySelectProps {
  value:    string;
  onChange: (value: string) => void;
  id?:      string;
}

export function CurrencySelect({ value, onChange, id }: CurrencySelectProps) {
  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    onChange(e.target.value);
  }

  return (
    <select
      id={id}
      className="ccy-select"
      value={value}
      onChange={handleChange}
      aria-label="통화 선택"
    >
      {Object.entries(CURRENCIES).map(([code, label]) => (
        <option key={code} value={code}>
          {label}
        </option>
      ))}
    </select>
  );
}
