import type { Verdict } from "@/lib/types";
import { StatusPill, recoTone } from "./StatusPill";

function fmtPct(n: number | null | undefined) {
  if (n == null) return "—";
  const pct = n * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
}

export function ReviewsTable({ reviews }: { reviews: Verdict[] }) {
  if (!reviews.length) {
    return <div className="text-muted text-sm py-8 text-center">No reviews yet.</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-[0.16em] text-muted font-mono">
            <th className="text-left px-5 py-3 font-semibold">Date</th>
            <th className="text-left px-5 py-3 font-semibold">Ticker</th>
            <th className="text-left px-5 py-3 font-semibold">Call</th>
            <th className="text-right px-5 py-3 font-semibold">Score</th>
            <th className="text-right px-5 py-3 font-semibold">Conf</th>
            <th className="text-left px-5 py-3 font-semibold">Source</th>
            <th className="text-right px-5 py-3 font-semibold">7d Outcome</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((v) => {
            const pending = !v.outcome_resolved || v.outcome_7d_pct == null;
            const outcomeTone = pending
              ? "amber"
              : (v.outcome_7d_pct ?? 0) > 0
                ? "up"
                : "down";
            const outcomeLabel = pending ? "Pending" : fmtPct(v.outcome_7d_pct);
            const recoLabel    = v.arbitrator_recommendation.charAt(0) + v.arbitrator_recommendation.slice(1).toLowerCase();
            return (
              <tr key={v.id} className="border-t border-border hover:bg-bg3 align-middle transition-colors">
                <td className="px-5 py-3 font-mono text-xs text-muted whitespace-nowrap tabular-nums">
                  {new Date(v.verdict_date).toISOString().slice(0, 10)}
                </td>
                <td className="px-5 py-3 font-bold font-mono text-ink">{v.ticker}</td>
                <td className="px-5 py-3">
                  <StatusPill tone={recoTone(v.arbitrator_recommendation)} label={recoLabel} />
                </td>
                <td className="px-5 py-3 text-right font-mono text-mid tabular-nums">
                  {v.research_score >= 0 ? `+${v.research_score}` : v.research_score}
                </td>
                <td className="px-5 py-3 text-right font-mono text-mid tabular-nums">{v.confidence}</td>
                <td className="px-5 py-3 text-muted max-w-md text-xs truncate">{v.article_summary}</td>
                <td className="px-5 py-3 text-right">
                  <StatusPill tone={outcomeTone} label={outcomeLabel} pulse={pending} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
