import type { Verdict } from "@/lib/types";

function fmtPct(n: number | null | undefined) {
  if (n == null) return "—";
  return `${(n * 100).toFixed(2)}%`;
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
            <th className="text-left px-5 py-3 font-semibold max-w-md">Source</th>
            <th className="text-right px-5 py-3 font-semibold">7d Outcome</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((v) => {
            const recoColor =
              v.arbitrator_recommendation === "BUY"   ? "text-up"
              : v.arbitrator_recommendation === "SELL"  ? "text-down"
              : v.arbitrator_recommendation === "AVOID" ? "text-down" : "text-mid";
            const outcomeColor =
              v.outcome_resolved && v.outcome_7d_pct != null
                ? (v.outcome_7d_pct > 0 ? "text-up" : "text-down")
                : "text-muted";
            return (
              <tr key={v.id} className="border-t border-border hover:bg-bg3 align-top transition-colors">
                <td className="px-5 py-3 font-mono text-xs text-muted whitespace-nowrap">
                  {new Date(v.verdict_date).toISOString().slice(0, 10)}
                </td>
                <td className="px-5 py-3 font-bold font-mono text-ink">{v.ticker}</td>
                <td className={`px-5 py-3 font-mono font-bold ${recoColor}`}>
                  {v.arbitrator_recommendation}
                </td>
                <td className="px-5 py-3 text-right font-mono text-mid">
                  {v.research_score >= 0 ? `+${v.research_score}` : v.research_score}
                </td>
                <td className="px-5 py-3 text-right font-mono text-mid">{v.confidence}</td>
                <td className="px-5 py-3 text-muted max-w-md text-xs truncate">{v.article_summary}</td>
                <td className={`px-5 py-3 text-right font-mono ${outcomeColor}`}>
                  {v.outcome_resolved ? fmtPct(v.outcome_7d_pct) : "pending"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
