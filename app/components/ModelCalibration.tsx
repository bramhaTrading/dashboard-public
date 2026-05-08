"use client";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { Calibration } from "@/lib/types";

/**
 * Model Calibration card.
 * X-axis: research_score buckets (negative → strong-sell ... positive → strong-buy)
 * Y-axis: average 7-day forward return for resolved verdicts in that bucket.
 *
 * If the model has signal, bars slope up-and-right. Empty/flat is the honest
 * answer when not enough verdicts have resolved yet — we render an explicit
 * empty-state instead of faking a chart.
 */

function fmtPct(n: number | null | undefined, dp = 2) {
  if (n == null) return "—";
  return `${(n * 100).toFixed(dp)}%`;
}

interface TipProps {
  active?: boolean;
  payload?: Array<{ payload: { label: string; avg_outcome_pct: number | null; count: number } }>;
}
function Tip({ active, payload }: TipProps) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  return (
    <div className="font-mono bg-white border border-gold-mid rounded-md px-3 py-2 shadow-md">
      <div className="text-[10px] text-muted tracking-[0.12em] uppercase mb-1">Score · {p.label}</div>
      <div className="text-[13px] text-ink font-semibold tabular-nums">{fmtPct(p.avg_outcome_pct)}</div>
      <div className="text-[10px] text-muted tabular-nums">{p.count} resolved</div>
    </div>
  );
}

export function ModelCalibration({ data }: { data: Calibration }) {
  const hasData = data.resolved_count > 0;

  return (
    <div className="surface surface-hover overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-ink">Model calibration</h3>
          <div className="font-mono text-[10px] text-muted tracking-wider mt-1">
            7-DAY FORWARD RETURN BY CONVICTION SCORE
          </div>
        </div>
        <span className="font-mono text-[10px] text-muted tracking-[0.18em] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-gold" />
          {data.resolved_count} RESOLVED
        </span>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 border-b border-border">
        <Stat
          label="Directional"
          value={data.directional_accuracy != null ? fmtPct(data.directional_accuracy, 1) : "—"}
          sub={data.directional_accuracy != null ? "score sign vs outcome" : "n/a yet"}
          tone={
            data.directional_accuracy == null ? "ink"
            : data.directional_accuracy >= 0.55 ? "up"
            : data.directional_accuracy <= 0.45 ? "down" : "gold"
          }
        />
        <Stat
          label="Median 7d"
          value={data.median_outcome_pct != null ? fmtPct(data.median_outcome_pct) : "—"}
          sub="across resolved calls"
          tone={
            data.median_outcome_pct == null ? "ink"
            : data.median_outcome_pct > 0 ? "up" : "down"
          }
          divider
        />
        <Stat
          label="Resolved"
          value={data.resolved_count.toString()}
          sub="7d outcome known"
          tone="ink"
          divider
        />
      </div>

      {/* Chart */}
      <div className="px-3 py-2 h-[220px]">
        {!hasData ? (
          <div className="h-full grid place-items-center text-center text-mid text-sm px-6">
            No verdicts have a 7-day outcome resolved yet. Once the news pipeline ingests
            live calls and the 7-day window closes, this chart fills in.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.buckets} margin={{ top: 16, right: 12, left: 0, bottom: 8 }}>
              <XAxis
                dataKey="label"
                stroke="#8a8780"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#8a8780"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                width={48}
                tickFormatter={(v: number) => `${(v * 100).toFixed(1)}%`}
                domain={["auto", "auto"]}
              />
              <Tooltip content={<Tip />} cursor={{ fill: "rgba(168,134,44,0.08)" }} />
              <ReferenceLine y={0} stroke="rgba(20,18,12,0.20)" strokeWidth={1} />
              <Bar dataKey="avg_outcome_pct" radius={[4, 4, 0, 0]}>
                {data.buckets.map((b, i) => {
                  const v = b.avg_outcome_pct ?? 0;
                  const fill = v > 0 ? "#15803d" : v < 0 ? "#b91c1c" : "#a8862c";
                  return <Cell key={i} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function Stat({
  label, value, sub, tone, divider,
}: {
  label: string; value: string; sub: string;
  tone?: "up" | "down" | "gold" | "ink"; divider?: boolean;
}) {
  const toneClass =
    tone === "up"   ? "text-up"
    : tone === "down" ? "text-down"
    : tone === "gold" ? "text-gold"
    : "text-ink";
  return (
    <div className={`px-5 py-4 ${divider ? "border-l border-border" : ""}`}>
      <div className="font-mono text-[9px] font-semibold tracking-[0.16em] text-muted uppercase mb-2">{label}</div>
      <div className={`font-mono text-lg font-bold tracking-tight tabular-nums ${toneClass}`}>{value}</div>
      <div className="text-[11px] text-mid mt-1.5">{sub}</div>
    </div>
  );
}
