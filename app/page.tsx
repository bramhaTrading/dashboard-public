import { promises as fs } from "fs";
import path from "path";
import type { Meta, EquityPoint, Trade, Verdict } from "@/lib/types";
import { EquityCurve } from "./components/EquityCurve";
import { TradesTable } from "./components/TradesTable";
import { ReviewsTable } from "./components/ReviewsTable";

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

  const equityVal = meta?.current_equity ?? 100_000;
  const eqParts   = splitDollars(equityVal);

  // Pull most-recent reviews with non-zero score for the hero review card
  const flagged = reviews.filter((r) => Math.abs(r.research_score) >= 1).slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* ── TOP BAR ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur bg-bg/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full border border-gold-mid grid place-items-center">
              <span className="w-2 h-2 rounded-full bg-gold" />
            </span>
            <span className="font-mono text-xs font-bold tracking-[0.18em] text-gold">
              BRAHMA
            </span>
            <span className="text-mid mx-2 opacity-50">/</span>
            <span className="text-xs text-mid">Paper portfolio &middot; live transparency</span>
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

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section className="flex items-end justify-between flex-wrap gap-8 mb-10">
          <div>
            <div className="font-mono text-[10px] font-semibold tracking-[0.18em] text-gold uppercase mb-3 flex items-center gap-3">
              Live paper portfolio
              <span className="w-7 h-px bg-gold-mid" />
            </div>
            <div className="text-sm text-muted mb-2">Total equity</div>
            <div className="font-mono font-semibold tracking-[-2.5px] leading-none flex items-baseline gap-3">
              <span className="text-3xl text-muted font-medium">$</span>
              <span className="text-6xl text-ink">{eqParts.whole}</span>
              <span className="text-2xl text-muted font-medium">.{eqParts.cents}</span>
            </div>
          </div>

          {meta && (
            <div className="flex border border-border rounded-2xl bg-bg2 overflow-hidden">
              <Stat
                label="Return"
                value={fmtPct(meta.total_return_pct)}
                sub="cumulative"
                tone={meta.total_return_pct >= 0 ? "up" : "down"}
              />
              <Stat
                label="vs SPY α"
                value={fmtPct(meta.alpha_pct)}
                sub={`SPY ${fmtPct(meta.spy_return_pct, true)}`}
                tone={meta.alpha_pct >= 0 ? "up" : "down"}
                divider
              />
              <Stat
                label="Sharpe"
                value={meta.sharpe?.toFixed(2) ?? "—"}
                sub="annualised"
                divider
              />
              <Stat
                label="Max DD"
                value={fmtPct(meta.max_drawdown_pct, false)}
                sub={`${meta.trade_count} trades`}
                tone="down"
                divider
              />
            </div>
          )}
        </section>

        {/* ── ROW: chart + review highlight ─────────────────────────── */}
        <section className="grid lg:grid-cols-[1.55fr_1fr] gap-4 mb-4">

          {/* Chart card */}
          <div className="bg-bg2 border border-border rounded-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h3 className="text-sm font-semibold text-ink">Performance</h3>
                <div className="font-mono text-[10px] text-muted tracking-wider mt-1">
                  EQUITY · USD · vs SPY BUY-AND-HOLD
                </div>
              </div>
              <div className="flex gap-1 p-1 bg-bg3 border border-border rounded-lg">
                {["1W", "1M", "3M", "YTD", "ALL"].map((tf) => (
                  <span
                    key={tf}
                    className={
                      tf === "ALL"
                        ? "px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wider text-gold bg-bg2 rounded-md ring-1 ring-gold-mid"
                        : "px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wider text-muted"
                    }
                  >
                    {tf}
                  </span>
                ))}
              </div>
            </div>
            <div className="px-3 py-2">
              <EquityCurve data={equity} />
            </div>
          </div>

          {/* Daily Review */}
          <div className="bg-bg2 border border-border rounded-card p-6 relative overflow-hidden">
            <div
              className="absolute left-0 top-6 bottom-6 w-0.5 opacity-50"
              style={{
                background:
                  "linear-gradient(180deg, transparent, var(--gold) 30%, var(--gold) 70%, transparent)",
              }}
            />
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2 h-2 rounded-full bg-gold pulse-gold" />
              <span className="font-mono text-[10px] font-semibold tracking-[0.18em] text-gold uppercase">
                Daily Review
              </span>
              {meta && (
                <span className="ml-auto font-mono text-[9px] text-muted tracking-widest">
                  {meta.regime.toUpperCase()}
                </span>
              )}
            </div>

            {flagged.length > 0 ? (
              <>
                <p className="text-base text-ink leading-relaxed mb-4">
                  Latest non-neutral calls from the model:{" "}
                  {flagged.map((r, i) => (
                    <span key={r.id}>
                      <span className="font-mono font-semibold text-gold">{r.ticker}</span>{" "}
                      <span
                        className={
                          r.arbitrator_recommendation === "BUY"
                            ? "font-mono font-semibold text-up"
                            : r.arbitrator_recommendation === "SELL" || r.arbitrator_recommendation === "AVOID"
                            ? "font-mono font-semibold text-down"
                            : "font-mono font-semibold text-mid"
                        }
                      >
                        {r.arbitrator_recommendation}
                      </span>
                      <span className="text-mid">
                        {" "}({r.research_score >= 0 ? "+" : ""}{r.research_score})
                      </span>
                      {i < flagged.length - 1 ? ", " : "."}
                    </span>
                  ))}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {flagged.map((r) => (
                    <span
                      key={r.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] font-semibold tracking-wider bg-bg3 border border-border text-mid"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background:
                            r.arbitrator_recommendation === "BUY"
                              ? "var(--up)"
                              : r.arbitrator_recommendation === "SELL"
                              ? "var(--down)"
                              : "var(--gold)",
                        }}
                      />
                      {r.ticker}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-base text-mid leading-relaxed mb-4">
                No flagged reviews yet. Once the research pipeline ingests live news, calls with non-zero scores will surface here.
              </p>
            )}

            <div className="flex gap-2">
              <a
                href="#reviews"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border border-gold-mid bg-gold-dim text-gold hover:bg-[rgba(168,134,44,0.18)] transition-colors"
              >
                View all reviews →
              </a>
              <a
                href="#trades"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border border-border bg-bg3 text-mid hover:text-ink hover:border-border-h transition-colors"
              >
                Trade log
              </a>
            </div>
          </div>
        </section>

        {/* ── TRADES ───────────────────────────────────────────────── */}
        <section id="trades" className="bg-bg2 border border-border rounded-card overflow-hidden mb-4">
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

        {/* ── REVIEWS ──────────────────────────────────────────────── */}
        <section id="reviews" className="bg-bg2 border border-border rounded-card overflow-hidden mb-12">
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

        {/* ── FOOTER ───────────────────────────────────────────────── */}
        <footer className="border-t border-border pt-6 text-xs text-muted leading-relaxed">
          <p className="max-w-3xl">
            Paper trading on Alpaca, not financial advice. Past performance does not predict future results. The model reviews shown reflect the output of an autonomous research pipeline — every call is preserved, including the wrong ones, on purpose.
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
  label,
  value,
  sub,
  tone,
  divider,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "up" | "down";
  divider?: boolean;
}) {
  const toneClass = tone === "up" ? "text-up" : tone === "down" ? "text-down" : "text-ink";
  return (
    <div className={`px-7 py-4 ${divider ? "border-l border-border" : ""}`}>
      <div className="font-mono text-[9px] font-semibold tracking-[0.16em] text-muted uppercase mb-2">
        {label}
      </div>
      <div className={`font-mono text-lg font-semibold tracking-tight ${toneClass}`}>{value}</div>
      {sub && <div className="font-mono text-[10px] text-muted tracking-wider mt-1">{sub}</div>}
    </div>
  );
}
