import { promises as fs } from "fs";
import path from "path";
import type {
  Meta, EquityPoint, Trade, Verdict,
  SectorAllocation as Alloc, AllocationStats,
  Calibration, RegimeTimeshareData,
} from "@/lib/types";
import { EquityCurve } from "./components/EquityCurve";
import { TradesTable } from "./components/TradesTable";
import { ReviewsTable } from "./components/ReviewsTable";
import { SectorAllocation } from "./components/SectorAllocation";
import { DailyReview } from "./components/DailyReview";
import { ModelCalibration } from "./components/ModelCalibration";
import { RegimeTimeshare } from "./components/RegimeTimeshare";

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

function splitDollars(n: number) {
  const fixed = n.toFixed(2);
  const [whole, cents] = fixed.split(".");
  const formatted = Number(whole).toLocaleString();
  return { whole: formatted, cents };
}

export default async function Page() {
  const meta     = await loadJson<Meta | null>("meta.json", null);
  const equity   = await loadJson<EquityPoint[]>("equity_curve.json", []);
  const trades   = await loadJson<Trade[]>("trades.json", []);
  const reviews  = await loadJson<Verdict[]>("verdicts.json", []);
  const alloc    = await loadJson<Alloc[]>("sector_allocation.json", []);
  const stats    = await loadJson<AllocationStats | null>("allocation_stats.json", null);
  const calib    = await loadJson<Calibration>("calibration.json", {
    buckets: [], resolved_count: 0, directional_accuracy: null, median_outcome_pct: null,
  });
  const regimes  = await loadJson<RegimeTimeshareData>("regime_timeshare.json", {
    states: [], total_days: 0,
    current_state: null, current_state_since: null, days_in_state: 0,
    avg_switches_per_year: null,
  });

  const equityVal = meta?.current_equity ?? 100_000;
  const eqParts   = splitDollars(equityVal);

  return (
    <div className="min-h-screen">
      {/* TOP BAR */}
      <header className="sticky top-0 z-50 glass-bar">
        <div className="max-w-7xl mx-auto px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full border border-gold-mid grid place-items-center">
              <span className="w-2 h-2 rounded-full bg-gold" />
            </span>
            <span className="font-mono text-xs font-bold tracking-[0.18em] text-gold">BRAHMA</span>
            <span className="text-mid mx-2 opacity-50">/</span>
            <span className="text-xs text-mid">Paper portfolio · live transparency</span>
          </div>
          {meta && (
            <div className="font-mono text-[10px] text-muted tracking-wider hidden md:flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-gold pulse-gold" />
              UPDATED {new Date(meta.last_updated).toUTCString().slice(5, 22)} UTC
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-10">

        {/* HERO */}
        <section className="flex items-end justify-between flex-wrap gap-8 mb-10">
          <div>
            <div className="font-mono text-[10px] font-semibold tracking-[0.18em] text-gold uppercase mb-3 flex items-center gap-3">
              Live paper portfolio
              <span className="w-7 h-px bg-gold-mid" />
            </div>
            <div className="text-sm text-muted mb-2">Total equity</div>
            <div className="font-mono font-semibold tracking-[-2.5px] leading-none flex items-baseline gap-3">
              <span className="text-3xl text-muted font-medium">$</span>
              <span className="text-6xl text-ink tabular-nums">{eqParts.whole}</span>
              <span className="text-2xl text-muted font-medium tabular-nums">.{eqParts.cents}</span>
            </div>
          </div>

          {meta && (
            <div className="surface flex overflow-hidden">
              <Stat label="Return" value={fmtPct(meta.total_return_pct)} sub="cumulative"
                tone={meta.total_return_pct >= 0 ? "up" : "down"} />
              <Stat label="vs SPY α" value={fmtPct(meta.alpha_pct)} sub={`SPY ${fmtPct(meta.spy_return_pct, true)}`}
                tone={meta.alpha_pct >= 0 ? "up" : "down"} divider />
              <Stat label="Sharpe" value={meta.sharpe?.toFixed(2) ?? "—"} sub="annualised" divider />
              <Stat label="Max DD" value={fmtPct(meta.max_drawdown_pct, false)} sub={`${meta.trade_count} trades`}
                tone="down" divider />
            </div>
          )}
        </section>

        {/* ROW: chart + daily review */}
        <section className="grid lg:grid-cols-[1.55fr_1fr] gap-4 mb-4">

          <div className="surface surface-hover overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h3 className="text-sm font-semibold text-ink">Performance</h3>
                <div className="font-mono text-[10px] text-muted tracking-wider mt-1">
                  EQUITY · USD · vs SPY BUY-AND-HOLD
                </div>
              </div>
              <div className="flex gap-1 p-1 bg-bg3 border border-border rounded-lg">
                {["1W", "1M", "3M", "YTD", "ALL"].map((tf) => (
                  <span key={tf} className={
                    tf === "ALL"
                      ? "px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wider text-gold bg-bg2 rounded-md ring-1 ring-gold-mid"
                      : "px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wider text-muted"
                  }>
                    {tf}
                  </span>
                ))}
              </div>
            </div>
            <div className="px-3 py-2">
              <EquityCurve data={equity} />
            </div>
          </div>

          <DailyReview reviews={reviews} regime={meta?.regime ?? "unknown"} />
        </section>

        {/* ROW: Allocation + Market climate */}
        <section className="grid lg:grid-cols-[1.55fr_1fr] gap-4 mb-4">
          <div className="surface surface-hover p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-ink">Allocation by sector</h3>
                <div className="font-mono text-[10px] text-muted tracking-wider mt-1">
                  OPEN POSITIONS · WEIGHTED BY USD SIZE
                </div>
              </div>
              <span className="font-mono text-[10px] text-muted tracking-[0.18em] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                LIVE
              </span>
            </div>
            <SectorAllocation data={alloc} stats={stats} />
          </div>

          <RegimeTimeshare data={regimes} />
        </section>

        {/* ROW: Calibration full width */}
        <section className="mb-4">
          <ModelCalibration data={calib} />
        </section>

        {/* TRADES */}
        <section id="trades" className="surface overflow-hidden mb-4">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h3 className="text-sm font-semibold text-ink">Trade log</h3>
              <div className="font-mono text-[10px] text-muted tracking-wider mt-1">
                {trades.length} TRADES · OPEN, CLOSED, EVERY OUTCOME
              </div>
            </div>
            <div className="font-mono text-[10px] text-muted tracking-[0.18em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              ALPACA PAPER
            </div>
          </div>
          <TradesTable trades={trades.slice(0, 50)} />
        </section>

        {/* REVIEWS */}
        <section id="reviews" className="surface overflow-hidden mb-12">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h3 className="text-sm font-semibold text-ink">Model reviews</h3>
              <div className="font-mono text-[10px] text-muted tracking-wider mt-1">
                {reviews.length} REVIEWS · WITH 7-DAY FORWARD OUTCOMES WHEN RESOLVED
              </div>
            </div>
            <div className="font-mono text-[10px] text-muted tracking-[0.18em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              FACT · ADVERSARY · ARBITRATOR
            </div>
          </div>
          <ReviewsTable reviews={reviews.slice(0, 50)} />
        </section>

        <footer className="border-t border-border pt-6 text-xs text-muted leading-relaxed">
          <p className="max-w-3xl">
            Paper trading on Alpaca, not financial advice. Past performance does not predict future results. Every model review and trade is preserved — including the wrong ones — on purpose.
          </p>
          <p className="mt-3 font-mono text-[10px] text-muted tracking-[0.16em]">
            © BRAHMA TRADING · BUILT IN PUBLIC
          </p>
        </footer>
      </main>
    </div>
  );
}

function Stat({
  label, value, sub, tone, divider,
}: {
  label: string; value: string; sub?: string;
  tone?: "up" | "down"; divider?: boolean;
}) {
  const toneClass = tone === "up" ? "text-up" : tone === "down" ? "text-down" : "text-ink";
  return (
    <div className={`px-7 py-4 ${divider ? "border-l border-border" : ""}`}>
      <div className="font-mono text-[9px] font-semibold tracking-[0.16em] text-muted uppercase mb-2">{label}</div>
      <div className={`font-mono text-lg font-semibold tracking-tight tabular-nums ${toneClass}`}>{value}</div>
      {sub && <div className="font-mono text-[10px] text-muted tracking-wider mt-1">{sub}</div>}
    </div>
  );
}
