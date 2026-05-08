import { promises as fs } from "fs";
import path from "path";
import type { Meta, EquityPoint, Trade, Verdict } from "@/lib/types";
import { EquityCurve } from "./components/EquityCurve";
import { TradesTable } from "./components/TradesTable";
import { VerdictsTable } from "./components/VerdictsTable";

async function loadJson<T>(rel: string, fallback: T): Promise<T> {
  try {
    const buf = await fs.readFile(path.join(process.cwd(), "data", rel), "utf-8");
    return JSON.parse(buf) as T;
  } catch {
    return fallback;
  }
}

function fmtPct(n: number | null | undefined, signed = true) {
  if (n == null) return "—";
  const v = (n * 100).toFixed(2);
  if (signed && n > 0) return `+${v}%`;
  return `${v}%`;
}
function fmt$(n: number) {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default async function Page() {
  const meta     = await loadJson<Meta | null>("meta.json", null);
  const equity   = await loadJson<EquityPoint[]>("equity_curve.json", []);
  const trades   = await loadJson<Trade[]>("trades.json", []);
  const verdicts = await loadJson<Verdict[]>("verdicts.json", []);

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <header className="border-b border-border pb-6 mb-8">
        <div className="flex items-baseline justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">bramhaTrading — Paper Portfolio</h1>
            <p className="text-muted mt-2 max-w-2xl">
              Live paper-trading transparency. Every trade and AI verdict — including the wrong ones — published hourly from our autonomous Arya agent.
            </p>
          </div>
          {meta && (
            <div className="text-sm text-muted font-mono">
              Updated {new Date(meta.last_updated).toUTCString()}<br />
              Regime: <span className="text-text">{meta.regime}</span>
            </div>
          )}
        </div>
      </header>

      {meta ? (
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          <Stat label="Equity"        value={fmt$(meta.current_equity)}        sub={`from ${fmt$(meta.starting_capital)}`} />
          <Stat label="Return"        value={fmtPct(meta.total_return_pct)}    sub="cumulative"
                tone={meta.total_return_pct >= 0 ? "green" : "red"} />
          <Stat label="vs SPY α"      value={fmtPct(meta.alpha_pct)}            sub={`SPY ${fmtPct(meta.spy_return_pct, true)}`}
                tone={meta.alpha_pct >= 0 ? "green" : "red"} />
          <Stat label="Sharpe"        value={meta.sharpe?.toFixed(2) ?? "—"}    sub="annualised" />
          <Stat label="Max DD"        value={fmtPct(meta.max_drawdown_pct, false)} sub={`${meta.trade_count} trades`}
                tone="red" />
        </section>
      ) : (
        <section className="text-muted mb-10">No portfolio data yet — the export job has not run.</section>
      )}

      <section className="mb-12">
        <h2 className="text-lg font-bold mb-4">Equity curve</h2>
        <EquityCurve data={equity} />
      </section>

      <section className="mb-12">
        <h2 className="text-lg font-bold mb-4">Recent trades</h2>
        <TradesTable trades={trades.slice(0, 50)} />
      </section>

      <section className="mb-12">
        <h2 className="text-lg font-bold mb-4">AI verdicts</h2>
        <p className="text-muted mb-4 text-sm max-w-2xl">
          Every news article our research POD analyses, with the original recommendation and (when resolved) the 7-day forward return. Wrong ones are not edited or removed.
        </p>
        <VerdictsTable verdicts={verdicts.slice(0, 50)} />
      </section>

      <footer className="border-t border-border pt-6 mt-12 text-xs text-faint">
        <p>
          Paper trading on Alpaca, not advice. Past performance does not predict future results. Source code & methodology on GitHub.
        </p>
      </footer>
    </main>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "green" | "red" }) {
  const toneClass = tone === "green" ? "text-green" : tone === "red" ? "text-red" : "text-text";
  return (
    <div className="bg-surface border border-border rounded p-4">
      <div className="text-xs uppercase tracking-wider text-muted">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${toneClass}`}>{value}</div>
      {sub && <div className="text-xs text-faint mt-1">{sub}</div>}
    </div>
  );
}
