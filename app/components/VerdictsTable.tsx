import type { Verdict } from "@/lib/types";

function fmtPct(n: number | null | undefined) {
  if (n == null) return "—";
  return `${(n * 100).toFixed(2)}%`;
}

export function VerdictsTable({ verdicts }: { verdicts: Verdict[] }) {
  if (!verdicts.length) return <div className="text-muted">No verdicts yet.</div>;
  return (
    <div className="overflow-x-auto rounded border border-border">
      <table className="w-full text-sm">
        <thead className="bg-elevated text-muted font-mono">
          <tr>
            <th className="text-left px-3 py-2">Date</th>
            <th className="text-left px-3 py-2">Ticker</th>
            <th className="text-left px-3 py-2">Reco</th>
            <th className="text-right px-3 py-2">Score</th>
            <th className="text-right px-3 py-2">Conf</th>
            <th className="text-left px-3 py-2 max-w-md">Article</th>
            <th className="text-right px-3 py-2">7d Outcome</th>
          </tr>
        </thead>
        <tbody>
          {verdicts.map((v) => {
            const recoColor =
              v.arbitrator_recommendation === "BUY"   ? "text-green" :
              v.arbitrator_recommendation === "SELL"  ? "text-red"   :
              v.arbitrator_recommendation === "AVOID" ? "text-red"   : "text-muted";
            const outcomeColor =
              v.outcome_resolved && v.outcome_7d_pct != null
                ? (v.outcome_7d_pct > 0 ? "text-green" : "text-red")
                : "text-faint";
            return (
              <tr key={v.id} className="border-t border-border hover:bg-elevated align-top">
                <td className="px-3 py-2 font-mono text-xs text-muted whitespace-nowrap">
                  {new Date(v.verdict_date).toISOString().slice(0, 10)}
                </td>
                <td className="px-3 py-2 font-bold font-mono">{v.ticker}</td>
                <td className={`px-3 py-2 font-mono font-bold ${recoColor}`}>
                  {v.arbitrator_recommendation}
                </td>
                <td className="px-3 py-2 text-right font-mono">{v.research_score >= 0 ? `+${v.research_score}` : v.research_score}</td>
                <td className="px-3 py-2 text-right font-mono">{v.confidence}</td>
                <td className="px-3 py-2 text-muted max-w-md">{v.article_summary}</td>
                <td className={`px-3 py-2 text-right font-mono ${outcomeColor}`}>
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
