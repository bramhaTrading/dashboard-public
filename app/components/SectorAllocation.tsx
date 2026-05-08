import type { SectorAllocation as Alloc, AllocationStats } from "@/lib/types";

const SECTOR_COLORS: Record<string, string> = {
  "Technology":            "#a8862c",
  "Financial Services":    "#2563eb",
  "Healthcare":            "#15803d",
  "Consumer Cyclical":     "#7c3aed",
  "Consumer Defensive":    "#0d9488",
  "Industrials":           "#1c1a14",
  "Energy":                "#b45309",
  "Basic Materials":       "#a78bfa",
  "Utilities":             "#64748b",
  "Real Estate":           "#dc2626",
  "Communication Services":"#c9a84c",
  "Unknown":               "#8a8780",
};

const colourFor = (s: string) => SECTOR_COLORS[s] ?? "#5a574f";

const fmt$    = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const fmtPct  = (n: number, dp = 1) => `${(n * 100).toFixed(dp)}%`;

export function SectorAllocation({
  data,
  stats,
}: {
  data:  Alloc[];
  stats: AllocationStats | null;
}) {
  if (!data.length) {
    return <div className="text-muted text-sm py-12 text-center">No open positions.</div>;
  }

  const top = data[0];
  const flag = top.pct >= 0.30;

  return (
    <div>
      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden border border-border mb-5 bg-bg3">
        {data.map((s, i) => (
          <div
            key={s.sector}
            style={{
              width: `${s.pct * 100}%`,
              background: colourFor(s.sector),
              borderRight: i < data.length - 1 ? "1px solid rgba(255,255,255,0.6)" : undefined,
            }}
            title={`${s.sector} · ${fmtPct(s.pct)}`}
          />
        ))}
      </div>

      {/* Sector list */}
      <div className="space-y-2.5 mb-6">
        {data.map((s) => (
          <div key={s.sector} className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colourFor(s.sector) }} />
            <span className="text-[13px] text-ink flex-1 truncate">{s.sector}</span>
            <span className="font-mono text-[11px] text-mid tabular-nums">{fmt$(s.value_usd)}</span>
            <span className="font-mono text-[12px] font-semibold text-ink tabular-nums w-12 text-right">
              {fmtPct(s.pct)}
            </span>
          </div>
        ))}
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-4 border-t border-border">
          <Cell
            label="Top sector"
            big={fmtPct(stats.top_sector_pct)}
            sub={`${stats.top_sector}`}
            tone="gold"
          />
          <Cell
            label="Top 3 share"
            big={fmtPct(stats.top3_share)}
            sub="target ≤ 80%"
            tone={stats.top3_share > 0.80 ? "down" : "ink"}
            divider
          />
          <Cell
            label="Sectors held"
            big={`${stats.sectors_held}`}
            bigSuffix={`/${stats.gics_total}`}
            sub={stats.missing_sectors.length ? `no ${stats.missing_sectors.join(", ").toLowerCase()}` : "all sectors"}
            tone="ink"
            divider
          />
          <Cell
            label="HHI"
            big={stats.hhi.toFixed(2)}
            sub={hhiBand(stats.hhi)}
            tone={stats.hhi >= 0.30 ? "down" : stats.hhi >= 0.18 ? "gold" : "up"}
            divider
          />
        </div>
      )}

      {/* Flag bar */}
      {flag && stats?.top_position && (
        <div className="mt-4 flex items-center justify-between gap-3 px-4 py-2.5 rounded-md border border-gold-mid bg-gold-dim">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-gold border border-gold-mid bg-bg2 px-2 py-1 rounded">
              FLAG
            </span>
            <span className="text-[12px] text-ink truncate">
              <span className="font-semibold">{top.sector}</span>{" "}
              <span className="text-mid">&gt; {fmtPct(top.pct, 0)} —</span>{" "}
              driven by <span className="font-mono font-semibold">{stats.top_position.symbol}</span>{" "}
              at <span className="font-mono font-semibold">{fmtPct(stats.top_position.pct_of_book)}</span> of book.
            </span>
          </div>
          <a href="#trades" className="font-mono text-[10px] tracking-[0.18em] text-gold whitespace-nowrap hover:text-gold-light transition-colors">
            REVIEW NEXT REBAL
          </a>
        </div>
      )}
    </div>
  );
}

function hhiBand(hhi: number): string {
  if (hhi < 0.10) return "well diversified";
  if (hhi < 0.18) return "moderate concentration";
  if (hhi < 0.30) return "concentrated";
  return "highly concentrated";
}

function Cell({
  label, big, bigSuffix, sub, tone, divider,
}: {
  label: string;
  big: string;
  bigSuffix?: string;
  sub: string;
  tone?: "up" | "down" | "gold" | "ink";
  divider?: boolean;
}) {
  const toneClass =
    tone === "up"   ? "text-up"
    : tone === "down" ? "text-down"
    : tone === "gold" ? "text-gold"
    : "text-ink";
  return (
    <div className={`px-5 py-4 ${divider ? "border-l border-border" : ""}`}>
      <div className="font-mono text-[9px] font-semibold tracking-[0.16em] text-muted uppercase mb-2">
        {label}
      </div>
      <div className={`font-mono font-bold tracking-tight tabular-nums ${toneClass}`}>
        <span className="text-2xl">{big}</span>
        {bigSuffix && <span className="text-sm text-muted ml-0.5 font-medium">{bigSuffix}</span>}
      </div>
      <div className="text-[11px] text-mid mt-1.5 leading-snug">{sub}</div>
    </div>
  );
}
