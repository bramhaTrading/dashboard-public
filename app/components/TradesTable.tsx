import type { Trade } from "@/lib/types";
import { StatusPill, exitReasonPill } from "./StatusPill";

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
            <th className="text-left px-5 py-3 font-semibold">Status</th>
            <th className="text-left px-5 py-3 font-semibold">Entry</th>
            <th className="text-left px-5 py-3 font-semibold">Exit</th>
            <th className="text-right px-5 py-3 font-semibold">Size</th>
            <th className="text-right px-5 py-3 font-semibold">P&amp;L</th>
            <th className="text-right px-5 py-3 font-semibold">%</th>
            <th className="text-left px-5 py-3 font-semibold">Regime</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => {
            const isOpen = t.exit_date == null;
            const pnlColor =
              (t.pnl_pct ?? 0) > 0 ? "text-up"
              : (t.pnl_pct ?? 0) < 0 ? "text-down"
              : "text-mid";
            const status = exitReasonPill(t.exit_reason);
            return (
              <tr key={t.id} className="border-t border-border hover:bg-bg3 transition-colors">
                <td className="px-5 py-3 font-bold text-ink">{t.symbol}</td>
                <td className="px-5 py-3">
                  <StatusPill tone={status.tone} label={status.label} pulse={isOpen} />
                </td>
                <td className="px-5 py-3 text-mid text-xs tabular-nums">
                  {t.entry_date} <span className="text-muted">@</span> {fmt$(t.entry_price)}
                </td>
                <td className="px-5 py-3 text-mid text-xs tabular-nums">
                  {t.exit_date ? <>{t.exit_date} <span className="text-muted">@</span> {fmt$(t.exit_price)}</> : <span className="text-muted">—</span>}
                </td>
                <td className="px-5 py-3 text-right text-mid tabular-nums">{fmt$(t.size_usd)}</td>
                <td className={`px-5 py-3 text-right tabular-nums ${pnlColor}`}>{fmt$(t.pnl_usd)}</td>
                <td className={`px-5 py-3 text-right tabular-nums ${pnlColor}`}>{fmtPct(t.pnl_pct)}</td>
                <td className="px-5 py-3 text-muted text-xs">{t.regime}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
