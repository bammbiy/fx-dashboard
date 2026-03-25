# FX. — Currency Converter

실시간 환율 기반 통화 변환 도구. 웹 UI + CLI 두 가지 버전.

---

## 파일 구성

```
.
├── index.html                 # 웹 UI (브라우저에서 바로 실행)
├── currency_converter_cli.py  # CLI 버전 (Python 3.9+)
├── requirements.txt           # 외부 의존성 없음
└── README.md
```

---

## 웹 UI (`index.html`)

`index.html`을 브라우저에서 열면 바로 실행됩니다. 서버 불필요.

### 기능

- **실시간 환율** — Frankfurter API (ECB 기준)로 자동 로드, 오프라인 시 내장 fallback 사용
- **실시간 입력 변환** — 금액 입력 시 즉시 변환, 양방향 (결과 칸에 입력해도 역산)
- **SWAP** — 통화 방향 한 번에 전환
- **S&P 500 실시간 시세** — 현재가·등락·시고저·전일종가·5일 미니차트
- **주요 지수** — NASDAQ, 다우존스, KOSPI, 니케이225, CAC40
- **변환 기록** — localStorage 자동 저장 (최대 20건), 클릭 시 재사용
- **자동 갱신** — 시세 2분, 환율 1시간 주기로 자동 업데이트

### 지원 통화 (21종)

USD · EUR · GBP · JPY · KRW · CNY · CAD · AUD · CHF · HKD · SGD · INR · MXN · BRL · SEK · NOK · THB · PHP · IDR · VND · TWD

---

## CLI (`currency_converter_cli.py`)

### 요구사항

- Python 3.9+
- 외부 패키지 없음

### 사용법

```bash
# 기본 변환
python currency_converter_cli.py --amount 1000 --from USD --to KRW

# 역방향
python currency_converter_cli.py --amount 50000 --from JPY --to EUR

# 지원 통화 목록
python currency_converter_cli.py --list
```

### 출력 예시

```
1,000.00 USD = 1,370,000 KRW
```

### 옵션

| 옵션 | 설명 |
|------|------|
| `--amount` | 변환할 금액 (필수) |
| `--from`   | 출발 통화 코드 (필수) |
| `--to`     | 도착 통화 코드 (필수) |
| `--list`   | 지원 통화 목록 출력 후 종료 |

---

## 데이터 출처

| 데이터 | 출처 | 갱신 주기 |
|--------|------|-----------|
| 환율 | Frankfurter API (ECB) | 영업일 기준 일 1회 |
| 주식 시세 | Yahoo Finance | 최대 15분 지연 |

> 환율·시세는 참고용입니다. 실제 거래 시 공식 채널을 이용하세요.

---

## 라이선스

MIT
