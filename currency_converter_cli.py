#!/usr/bin/env python3
"""
currency_converter_cli.py — offline currency converter
USD-anchored rate table; cross-rates computed on the fly.
"""

from __future__ import annotations

import argparse
import sys
from typing import Final

# fmt: off
# Spot rates vs USD (approximate mid-market, update as needed)
_USD_RATES: Final[dict[str, float]] = {
    "EUR": 0.9200, "GBP": 0.7800, "JPY": 155.00,
    "KRW": 1370.0, "CNY": 7.200, "CAD": 1.360,
    "AUD": 1.530,  "CHF": 0.900, "HKD": 7.820,
    "SGD": 1.340,  "INR": 83.50, "MXN": 17.10,
    "BRL": 5.050,  "SEK": 10.40, "NOK": 10.60,
}
# fmt: on

# Build the full lookup: USD<>X and X<>Y via USD pivot
_RATES: dict[tuple[str, str], float] = {"USD": {"USD": 1.0}} # type: ignore[assignment]
_RATES = {}

for _ccy, _r in _USD_RATES.items():
    _RATES[("USD", _ccy)] = _r
    _RATES[(_ccy, "USD")] = 1.0 / _r

SUPPORTED: frozenset[str] = frozenset({"USD"} | _USD_RATES.keys())


class ConversionError(ValueError):
    pass


def convert(amount: float, src: str, dst: str) -> float:
    src, dst = src.upper(), dst.upper()

    for ccy in (src, dst):
        if ccy not in SUPPORTED:
            raise ConversionError(f"unknown currency: {ccy}")

    if src == dst:
        return amount

    # direct pair or pivot through USD
    if (src, dst) in _RATES:
        rate = _RATES[(src, dst)]
    else:
        rate = _RATES[(src, "USD")] * _RATES[("USD", dst)]

    return amount * rate


def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="currency_converter",
        description="Offline currency converter (USD-anchored rates).",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="Supported currencies: " + ", ".join(sorted(SUPPORTED)),
    )
    p.add_argument("--amount", type=float, required=True, metavar="NUM",
                   help="amount to convert")
    p.add_argument("--from", dest="src", required=True, metavar="CCY",
                   help="source currency code (e.g. USD)")
    p.add_argument("--to",   dest="dst", required=True, metavar="CCY",
                   help="target currency code (e.g. KRW)")
    p.add_argument("--list", action="store_true",
                   help="list supported currency codes and exit")
    return p


def main() -> None:
    parser = _build_parser()
    args = parser.parse_args()

    if args.list:
        print("Supported currencies:", ", ".join(sorted(SUPPORTED)))
        return

    try:
        result = convert(args.amount, args.src, args.dst)
    except ConversionError as exc:
        parser.error(str(exc))  # prints usage hint and exits with code 2

    src, dst = args.src.upper(), args.dst.upper()
    print(f"{args.amount:,.2f} {src} = {result:,.2f} {dst}")


if __name__ == "__main__":
    main()
