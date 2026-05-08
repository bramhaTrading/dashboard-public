import type { Verdict } from "@/lib/types";
import { recoTone } from "./StatusPill";

/**
 * Daily Review — top non-neutral calls from the model with conviction bars
 * and a "today" delta. Mirrors the brand pattern: ticker + call · driver
 * + horizontal conviction meter + today's % move.
 *
 * Conviction is synthesised from research_score (0..10) and confidence (0..10):
 *   conviction = clamp((|score| + confidence) / 2 * 10, 0, 100)
 * Today's % move is left as null until intraday price feed is wired in.
 */

function daysAgo(iso: string): string {
  const dt = new Date(iso);
  const days = Math.max(0, Math.floor((Date.now() - dt.getTime()) / 86_400_000));
  if (days === 0) return "today";
  return `+${days}d`;
}

function conviction(v: Verdict): number {
  const base = (Math.abs(v.research_score) + (v.confidence || 0)) / 2;
  return Math.max(15, Math.min(100, base * 10));
}

function driverText(v: Verdict): string {
  // article_summary in our exporter currently looks like: '["benzinga", "benzinga", ...]'
  // Render it as "n sources · <signal>" if it parses, else use it raw.
  let n = 0;
  try {
    const parsed = JSON.parse(v.article_summary);
    if (Array.isArray(parsed)) n = parsed.length;
  } catch { /* ignore */ }
  const signal = v.fact_summary.replace("signal_type=", "").split(",")[0] || "signal";
  if (n > 0) return `${signal.toLowerCase()} · ${n} source${n === 1 ? "" : "s"}`;
  return signal.toLowerCase();
}

export function DailyReview({ reviews, regime }: { reviews: Verdict[]; regime: string }) {
  const flagged   = reviews.filter((r) => Math.abs(r.research_score) >= 1);
  const top       = flagged.slice(0, 3);
  const flipsToday = 0;   // placeholder until persisted reco-change history exists

  return (
    <div className="surface surface-hover overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
        <span className="w-2 h-2 rounded-full bg-gold pulse-gold" />
        <span className="font-mono text-[10px] font-semibold tracking-[0.18em] text-gold uppercase">
          Daily Review
        </span>
        <span className="ml-auto font-mono text-[10px] text-muted tracking-wider">
          REGIME · <span className="text-ink font-semibold">{regime.toUpperCase()}</span>
        </span>
      </div>

      {/* Rows */}
      {top.length === 0 ? (
        <div className="px-6 py-10 text-center text-mid text-sm">
          No flagged reviews yet. Once the research pipeline ingests live news, calls with non-zero scores will surface here.
        </div>
      ) : (
        <div className="grid grid-cols-[auto_1fr_auto_auto] gap-x-5 px-6 py-4">
          <div className="font-mono text-[9px] text-muted tracking-[0.16em] uppercase pb-3">Ticker</div>
          <div className="font-mono text-[9px] text-muted tracking-[0.16em] uppercase pb-3">Call · Driver</div>
          <div className="font-mono text-[9px] text-muted tracking-[0.16em] uppercase pb-3 text-right">Conviction</div>
          <div className="font-mono text-[9px] text-muted tracking-[0.16em] uppercase pb-3 text-right">Score</div>

          {top.map((r, i) => {
            const conv  = conviction(r);
            const tone  = recoTone(r.arbitrator_recommendation);
            const recoColor =
              tone === "up"   ? "text-up"
              : tone === "down" ? "text-down"
              : "text-gold";
            return (
              <div key={r.id} className="contents">
                {i > 0 && <div className="col-span-4 border-t border-dashed border-border" />}

                <div className="font-mono font-bold text-[15px] text-ink py-4 self-center">{r.ticker}</div>

                <div className="py-4 self-center">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className={`font-mono font-bold text-[12px] tracking-wider ${recoColor}`}>
                      {r.arbitrator_recommendation}
                    </span>
                    <span className="font-mono text-[10px] text-muted">{daysAgo(r.verdict_date)}</span>
                  </div>
                  <div className="text-[12px] text-mid leading-snug">{driverText(r)}</div>
                </div>

                <div className="py-4 self-center min-w-[120px]">
                  <div className="flex items-center gap-3 justify-end">
                    <div className="w-24 h-1.5 rounded-full bg-bg3 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${conv}%`,
                          background: "linear-gradient(90deg, #a8862c 0%, #c9a84c 100%)",
                        }}
                      />
                    </div>
                    <span className="font-mono font-semibold text-[13px] text-ink tabular-nums w-7 text-right">
                      {Math.round(conv)}
                    </span>
                  </div>
                </div>

                <div className="py-4 self-center pl-2 text-right">
                  <span className={`font-mono font-semibold text-[13px] tabular-nums ${
                    r.research_score > 0 ? "text-up" : "text-down"
                  }`}>
                    {r.research_score > 0 ? "+" : ""}{r.research_score}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between px-6 py-3 border-t border-border bg-bg3/40">
        <div className="font-mono text-[11px] text-mid">
          <span className="font-semibold text-ink tabular-nums">{flagged.length}</span> non-neutral{" "}
          <span className="text-muted mx-1">·</span>{" "}
          <span className="font-semibold text-ink tabular-nums">{flipsToday}</span> flips today
        </div>
        <a
          href="#reviews"
          className="font-medium text-[12px] text-gold hover:text-gold-light transition-colors"
        >
          View all reviews →
        </a>
      </div>
    </div>
  );
}
