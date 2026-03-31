# Finance Dashboard

환율 변환과 주요 주가 지수를 한 화면에서 확인하는 금융 대시보드.  
CLI 환율 계산기를 기반으로 React + TypeScript 웹 앱으로 확장했습니다.

---

## 실행

```bash
npm install
npm run dev
```

빌드:

```bash
npm run build
npm run preview
```

---

## 기능

- **실시간 환율** — open.er-api.com (ECB 기준, 5분 자동 갱신)  
- **양방향 변환** — 결과 칸에 직접 입력해도 역산
- **SWAP** — 통화 방향 즉시 전환
- **변환 기록** — localStorage 저장, 클릭 재사용, 상대 시간 표시
- **S&P 500** — 실시간 현재가·등락·고저·전일종가·스파크라인
- **주요 지수** — NASDAQ, 다우존스, KOSPI, 니케이225, CAC40 (2분 자동 갱신)
- **오프라인 fallback** — 네트워크 없으면 내장 기준환율로 자동 전환

---

## 기술 스택

| 역할 | 라이브러리 |
|------|-----------|
| UI 프레임워크 | React 18 + TypeScript |
| 빌드 도구 | Vite 5 |
| 차트 | Recharts |
| HTTP | Axios |

---

## 프로젝트 구조

```
src/
├── app/
│   └── App.tsx                   # 최상위 레이아웃
├── components/
│   ├── CurrencyConverter/
│   │   ├── index.tsx             # 메인 변환기 (양방향 입력, 상태 관리)
│   │   ├── CurrencySelect.tsx    # 통화 드롭다운
│   │   └── ConversionHistory.tsx # 변환 기록 리스트
│   ├── SP500Card/
│   │   ├── index.tsx             # S&P 500 상세 카드
│   │   └── MiniChart.tsx         # Recharts 스파크라인
│   ├── IndexList/
│   │   └── index.tsx             # 주요 지수 리스트
│   └── ui/
│       ├── Badge.tsx             # up / down / neutral 뱃지
│       └── Skeleton.tsx          # 로딩 스켈레톤
├── hooks/
│   ├── useExchangeRates.ts       # 환율 fetch + 자동 갱신
│   └── useMarketData.ts          # S&P 500 + 지수 fetch
├── services/
│   ├── exchangeRateApi.ts        # open.er-api 래퍼, crossRate 계산
│   └── marketApi.ts              # Yahoo Finance via corsproxy.io
├── types/
│   └── index.ts                  # 공유 타입 정의
├── utils/
│   ├── format.ts                 # 숫자·날짜 포맷 함수
│   └── storage.ts                # 타입 안전 localStorage 래퍼
├── styles/
│   └── global.css                # 디자인 토큰 + 전체 스타일
└── main.tsx
```

---

## 데이터 출처

| 데이터 | API | 갱신 주기 |
|--------|-----|----------|
| 환율 | [open.er-api.com](https://open.er-api.com) | 5분 |
| 주가 지수 | Yahoo Finance via corsproxy.io | 2분 |

> 참고용 데이터입니다. 실제 거래에는 공식 채널을 이용하세요.

---

## 개선 포인트

- 환율 히스토리 차트 (날짜 범위 선택)
- 즐겨찾기 통화 쌍 고정
- 기본 통화 사용자 설정
- PWA / 오프라인 캐시 (Service Worker)
