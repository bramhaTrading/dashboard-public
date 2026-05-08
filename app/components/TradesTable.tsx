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
  if (!trades.length) {
    return <div className="text-muted text-sm py-8 text-center">No trades yet.</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-mono">
        <thead>
          <tr className="text-[10px] uppercase tracking-[0.16em] text-muted">
            <th className="text-left px-5 py-3 font-semibold">Symbol</th>
            <th className="text-left px-5 py-3 font-semibold">Entry</th>
            <th className="text-left px-5 py-3 font-semibold">Exit</th>
            <th className="text-right px-5 py-3 font-semibold">Size</th>
            <th className="text-right px-5 py-3 font-semibold">P&amp;L</th>
            <th className="text-right px-5 py-3 font-semibold">%</th>
            <th className="text-left px-5 py-3 font-semibold">Reason</th>
            <th className="text-left px-5 py-3 font-semibold">Regime</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => {
            const pnlColor =
              (t.pnl_pct ?? 0) > 0 ? "text-up"
              : (t.pnl_pct ?? 0) < 0 ? "text-down"
              : "text-mid";
            return (
              <tr key={t.id} className="border-t border-border hover:bg-bg3 transition-colors">
                <td className="px-5 py-3 font-bold text-ink">{t.symbol}</td>
                <td className="px-5 py-3 text-mid text-xs">{t.entry_date} <span className="text-muted">@</span> {fmt$(t.entry_price)}</td>
                <td className="px-5 py-3 text-mid text-xs">{t.exit_date ? `${t.exit_date} @ ${fmt$(t.exit_price)}` : <span className="text-gold font-semibold tracking-wider text-[10px]">OPEN</span>}</td>
                <td className="px-5 py-3 text-right text-mid">{fmt$(t.size_usd)}</td>
                <td className={`px-5 py-3 text-right ${pnlColor}`}>{fmt$(t.pnl_usd)}</td>
                <td className={`px-5 py-3 text-right ${pnlColor}`}>{fmtPct(t.pnl_pct)}</td>
                <td className="px-5 py-3 text-muted text-xs">{t.exit_reason ?? "—"}</td>
                <td className="px-5 py-3 text-muted text-xs">{t.regime}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
