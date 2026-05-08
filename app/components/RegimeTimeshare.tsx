import type { RegimeTimeshareData, RegimeShare } from "@/lib/types";

/**
 * Refined regime time-share card.
 * - Bar segments ordered calm → stress (left to right) so it reads as a spectrum
 * - "NOW" marker on the bar shows the current state's position
 * - Currently-in banner: state + days-in-state + avg switches/year
 * - Three-bin footer: Calm / Neutral / Stress (Mid + Mid-High no longer dropped)
 */

const REGIME_COLOURS: Record<string, string> = {
  low_vol:      "#15803d",  // calm green
  mid_low_vol:  "#84cc16",  // lime
  mid_vol:      "#a8862c",  // gold neutral
  mid_high_vol: "#d97706",  // amber
  high_vol:     "#b91c1c",  // red
  panic_vol:    "#450a0a",  // dark red panic
};
const REGIME_LABELS: Record<string, string> = {
  low_vol:      "Low",
  mid_low_vol:  "Mid-Low",
  mid_vol:      "Mid",
  mid_high_vol: "Mid-High",
  high_vol:     "High",
  panic_vol:    "Panic",
};
const CALM_STATES    = ["low_vol", "mid_low_vol"];
const NEUTRAL_STATES = ["mid_vol", "mid_high_vol"];
const STRESS_STATES  = ["high_vol", "panic_vol"];

const colourFor = (s: string) => REGIME_COLOURS[s] ?? "#5a574f";
const labelFor  = (s: string) => REGIME_LABELS[s]  ?? s;
const fmtPct    = (n: number, dp = 1) => `${(n * 100).toFixed(dp)}%`;

function bandPct(states: RegimeShare[], band: string[]): number {
  return states
    .filter((s) => band.includes(s.state))
    .reduce((acc, s) => acc + s.pct, 0);
}

/** Cumulative offset (0..1) of `state` within the calm→stress ordering. */
function cumulativeOffset(states: RegimeShare[], state: string): number {
  let off = 0;
  for (const s of states) {
    if (s.state === state) return off + s.pct / 2;   // mid-segment
    off += s.pct;
  }
  return off;
}

export function RegimeTimeshare({ data }: { data: RegimeTimeshareData }) {
  if (!data.states.length) {
    return (
      <div className="surface surface-hover overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-ink">Regime time-share</h3>
        </div>
        <div className="px-6 py-12 text-center text-mid text-sm">
          No HMM regime data yet.
        </div>
      </div>
    );
  }

  const states = data.states;
  const calm    = bandPct(states, CALM_STATES);
  const neutral = bandPct(states, NEUTRAL_STATES);
  const stress  = bandPct(states, STRESS_STATES);
  const nowOffset = data.current_state ? cumulativeOffset(states, data.current_state) : 0.5;

  return (
    <div className="surface surface-hover overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-ink">Regime time-share</h3>
          <div className="font-mono text-[10px] text-muted tracking-wider mt-1">
            HMM STATE DISTRIBUTION · {data.total_days.toLocaleString()} TRADING DAYS
          </div>
        </div>
        <span className="font-mono text-[10px] text-muted tracking-[0.18em] flex items-center gap-2 px-2.5 py-1 border border-border bg-bg3 rounded">
          {states.length}-STATE
        </span>
      </div>

      {/* Currently-in banner */}
      {data.current_state && (
        <div className="flex items-baseline gap-3 px-6 py-4 border-b border-border bg-bg3/40">
          <span className="font-mono text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
            Currently in
          </span>
          <span
            className="w-2.5 h-2.5 rounded-full self-center"
            style={{ background: colourFor(data.current_state) }}
          />
          <span className="text-2xl font-bold text-ink leading-none">
            {labelFor(data.current_state)}
          </span>
          {data.current_state_since && (
            <span className="text-xs text-mid">
              since {new Date(data.current_state_since).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              {" · "}
              <span className="font-mono">{data.days_in_state}d</span>
            </span>
          )}
          {data.avg_switches_per_year != null && (
            <span className="ml-auto text-right">
              <span className="font-mono text-2xl font-bold text-ink leading-none tabular-nums">
                {data.avg_switches_per_year}
              </span>
              <span className="font-mono text-xs text-muted ml-1">/YR</span>
              <div className="font-mono text-[9px] tracking-[0.16em] text-muted uppercase mt-0.5">
                Avg switches
              </div>
            </span>
          )}
        </div>
      )}

      {/* Bar */}
      <div className="px-6 pt-6 pb-2">
        <div className="relative h-7 rounded-md overflow-hidden border border-border bg-bg3 flex">
          {states.map((s, i) => (
            <div
              key={s.state}
              className="relative flex items-center justify-center"
              style={{
                width:       `${s.pct * 100}%`,
                background:  colourFor(s.state),
                borderRight: i < states.length - 1 ? "1px solid rgba(255,255,255,0.6)" : undefined,
              }}
              title={`${labelFor(s.state)} · ${fmtPct(s.pct)}`}
            >
              {s.pct >= 0.07 && (
                <span className="font-mono text-[10px] font-bold tracking-wider text-white/95 px-1 truncate">
                  {labelFor(s.state)} {fmtPct(s.pct)}
                </span>
              )}
            </div>
          ))}
          {/* NOW marker */}
          {data.current_state && (
            <div
              aria-hidden
              className="absolute top-[-6px] bottom-[-6px] w-0.5 bg-ink pointer-events-none"
              style={{ left: `${nowOffset * 100}%`, transform: "translateX(-1px)" }}
            >
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 font-mono text-[8px] font-bold tracking-[0.18em] text-ink bg-bg2 border border-border rounded px-1.5 py-0.5 whitespace-nowrap"
              >
                NOW
              </div>
            </div>
          )}
        </div>

        {/* Spectrum axis labels */}
        <div className="flex justify-between font-mono text-[9px] font-semibold tracking-[0.18em] text-muted mt-2 px-1">
          <span>◂ CALM</span>
          <span>NEUTRAL</span>
          <span>STRESS ▸</span>
        </div>
      </div>

      {/* Per-state legend grid (3 cols × 2 rows) */}
      <div className="px-6 py-4 grid grid-cols-3 gap-x-6 gap-y-2 border-t border-border">
        {states.map((s) => (
          <div key={s.state} className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colourFor(s.state) }} />
            <span className="text-[12px] text-ink truncate flex-1">{labelFor(s.state)}</span>
            <span className="font-mono text-[12px] font-semibold text-ink tabular-nums">{fmtPct(s.pct)}</span>
          </div>
        ))}
      </div>

      {/* Three-bin footer: Calm / Neutral / Stress */}
      <div className="grid grid-cols-3 border-t border-border">
        <BandCell tone="up"   label="Calm"    pct={calm}    sub="Low + Mid-Low" />
        <BandCell tone="gold" label="Neutral" pct={neutral} sub="Mid + Mid-High" divider />
        <BandCell tone="down" label="Stress"  pct={stress}  sub="High + Panic"   divider />
      </div>
    </div>
  );
}

function BandCell({
  label, pct, sub, tone, divider,
}: {
  label: string; pct: number; sub: string;
  tone: "up" | "gold" | "down"; divider?: boolean;
}) {
  const toneClass = tone === "up" ? "text-up" : tone === "down" ? "text-down" : "text-gold";
  const dotClass  = tone === "up" ? "bg-up" : tone === "down" ? "bg-down" : "bg-gold";
  return (
    <div className={`px-5 py-4 ${divider ? "border-l border-border" : ""}`}>
      <div className="flex items-center gap-2 font-mono text-[9px] font-semibold tracking-[0.16em] text-muted uppercase mb-2">
        <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
        {label}
      </div>
      <div className={`font-mono font-bold tracking-tight tabular-nums ${toneClass}`}>
        <span className="text-2xl">{(pct * 100).toFixed(1)}</span>
        <span className="text-sm text-muted ml-0.5 font-medium">%</span>
      </div>
      <div className="text-[11px] text-mid mt-1.5">{sub}</div>
    </div>
  );
}
