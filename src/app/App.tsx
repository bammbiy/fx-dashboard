import { SP500Card }        from "@/components/SP500Card";
import { IndexList }        from "@/components/IndexList";
import { CurrencyConverter } from "@/components/CurrencyConverter";

export function App() {
  return (
    <div className="layout">
      <header className="topbar">
        <span className="topbar__logo">
          FX<span className="topbar__dot">.</span>
        </span>
        <span className="topbar__tagline">Finance Dashboard</span>
      </header>

      <main className="main-grid">
        {/* left column: converter */}
        <section className="col-left" aria-label="환율 변환기">
          <CurrencyConverter />
        </section>

        {/* right column: market data */}
        <aside className="col-right" aria-label="시장 데이터">
          <SP500Card />
          <IndexList />
        </aside>
      </main>

      <footer className="page-footer">
        <span>환율: open.er-api.com (5분 갱신)</span>
        <span>시세: Yahoo Finance (최대 15분 지연)</span>
        <span>참고용 데이터 — 실제 거래와 다를 수 있음</span>
      </footer>
    </div>
  );
}
