import type { Trade } from "@/lib/types";

function fmt$(n: number | null | undefined) {
  if (n == null) return "—";
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}
function fmtPct(n: number | null | undefined) {
  if (n == null) return "—";
  return `${(n * 100).toFixed(2)}%`;
}

export function TradesTable({ trades }: { trades: Trade[] }) {
  if (!trades.length) return <div className="text-muted">No trades yet.</div>;
  return (
    <div className="overflow-x-auto rounded border border-border">
      <table className="w-full text-sm font-mono">
        <thead className="bg-elevated text-muted">
          <tr>
            <th className="text-left px-3 py-2">Symbol</th>
            <th className="text-left px-3 py-2">Entry</th>
            <th className="text-left px-3 py-2">Exit</th>
            <th className="text-right px-3 py-2">Size</th>
            <th className="text-right px-3 py-2">P&amp;L</th>
            <th className="text-right px-3 py-2">%</th>
            <th className="text-left px-3 py-2">Reason</th>
            <th className="text-left px-3 py-2">Regime</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => {
            const pnlColor = (t.pnl_pct ?? 0) > 0 ? "text-green" : (t.pnl_pct ?? 0) < 0 ? "text-red" : "text-muted";
            return (
              <tr key={t.id} className="border-t border-border hover:bg-elevated">
                <td className="px-3 py-2 font-bold">{t.symbol}</td>
                <td className="px-3 py-2">{t.entry_date} @ {fmt$(t.entry_price)}</td>
                <td className="px-3 py-2">{t.exit_date ? `${t.exit_date} @ ${fmt$(t.exit_price)}` : "OPEN"}</td>
                <td className="px-3 py-2 text-right">{fmt$(t.size_usd)}</td>
                <td className={`px-3 py-2 text-right ${pnlColor}`}>{fmt$(t.pnl_usd)}</td>
                <td className={`px-3 py-2 text-right ${pnlColor}`}>{fmtPct(t.pnl_pct)}</td>
                <td className="px-3 py-2 text-muted">{t.exit_reason ?? "—"}</td>
                <td className="px-3 py-2 text-muted">{t.regime}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
