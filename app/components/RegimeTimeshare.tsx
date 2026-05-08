import type { RegimeTimeshareData, RegimeShare } from "@/lib/types";

/**
 * "Market climate" card (formerly Regime time-share — renamed for less
 * technical framing). Same data: HMM volatility states distributed over
 * trading-day history, ordered calm → stress so the bar reads as a spectrum.
 *
 * Visual elements:
 *  - Currently-in banner with days-in-state + avg switches/year
 *  - Spectrum bar (no inline labels — segments are pure colour)
 *  - Vertical NOW marker positioned at the current state's mid-segment
 *  - 2-col paired legend (Low/Mid-Low, Mid/Mid-High, High/Panic)
 *  - Three-bin footer (Calm / Neutral / Stress)
 */

const REGIME_COLOURS: Record<string, string> = {
  low_vol:      "#15803d",
  mid_low_vol:  "#84cc16",
  mid_vol:      "#a8862c",
  mid_high_vol: "#d97706",
  high_vol:     "#b91c1c",
  panic_vol:    "#450a0a",
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

const bandPct = (states: RegimeShare[], band: string[]) =>
  states.filter((s) => band.includes(s.state)).reduce((a, s) => a + s.pct, 0);

const cumulativeOffset = (states: RegimeShare[], state: string) => {
  let off = 0;
  for (const s of states) {
    if (s.state === state) return off + s.pct / 2;
    off += s.pct;
  }
  return off;
};

const PAIRS: Array<[string, string]> = [
  ["low_vol",      "mid_low_vol"],
  ["mid_vol",      "mid_high_vol"],
  ["high_vol",     "panic_vol"],
];

export function RegimeTimeshare({ data }: { data: RegimeTimeshareData }) {
  if (!data.states.length) {
    return (
      <div className="surface surface-hover overflow-hidden h-full">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-ink">Market climate</h3>
        </div>
        <div className="px-6 py-12 text-center text-mid text-sm">No HMM regime data yet.</div>
      </div>
    );
  }

  const states = data.states;
  const stateMap = Object.fromEntries(states.map((s) => [s.state, s]));
  const calm    = bandPct(states, CALM_STATES);
  const neutral = bandPct(states, NEUTRAL_STATES);
  const stress  = bandPct(states, STRESS_STATES);
  const nowOffset = data.current_state ? cumulativeOffset(states, data.current_state) : 0.5;

  return (
    <div className="surface surface-hover overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-ink">Market climate</h3>
          <div className="font-mono text-[10px] text-muted tracking-wider mt-1">
            HMM STATE DISTRIBUTION · {data.total_days.toLocaleString()} TRADING DAYS
          </div>
        </div>
        <span className="font-mono text-[10px] text-muted tracking-[0.18em] px-2.5 py-1 border border-border bg-bg3 rounded">
          {states.length}-STATE
        </span>
      </div>

      {/* Currently in */}
      {data.current_state && (
        <div className="flex items-baseline gap-3 px-6 py-4 border-b border-border bg-bg3/40">
          <span className="font-mono text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
            Currently in
          </span>
          <span className="w-2.5 h-2.5 rounded-full self-center" style={{ background: colourFor(data.current_state) }} />
          <span className="text-2xl font-bold text-ink leading-none">{labelFor(data.current_state)}</span>
          {data.current_state_since && (
            <span className="text-xs text-mid">
              since {new Date(data.current_state_since).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              {" · "}<span className="font-mono">{data.days_in_state}d</span>
            </span>
          )}
          {data.avg_switches_per_year != null && (
            <span className="ml-auto text-right">
              <span className="font-mono text-2xl font-bold text-ink leading-none tabular-nums">{data.avg_switches_per_year}</span>
              <span className="font-mono text-xs text-muted ml-1">/YR</span>
              <div className="font-mono text-[9px] tracking-[0.16em] text-muted uppercase mt-0.5">Avg switches</div>
            </span>
          )}
        </div>
      )}

      {/* Spectrum bar */}
      <div className="px-6 pt-6 pb-3">
        <div className="relative h-6 rounded-md overflow-hidden border border-border bg-bg3 flex">
          {states.map((s, i) => (
            <div
              key={s.state}
              style={{
                width:       `${s.pct * 100}%`,
                background:  colourFor(s.state),
                borderRight: i < states.length - 1 ? "1px solid rgba(255,255,255,0.55)" : undefined,
              }}
              title={`${labelFor(s.state)} · ${fmtPct(s.pct)}`}
            />
          ))}
          {/* NOW marker — vertical line with caps */}
          {data.current_state && (
            <div
              aria-hidden
              className="absolute inset-y-[-4px] pointer-events-none"
              style={{ left: `${nowOffset * 100}%`, width: 0 }}
            >
              <div className="absolute -top-1 -bottom-1 left-1/2 -translate-x-1/2 w-[3px] rounded-full bg-ink" />
            </div>
          )}
        </div>

        {/* Spectrum axis labels */}
        <div className="flex justify-between font-mono text-[9px] font-semibold tracking-[0.18em] text-muted mt-3 px-0.5">
          <span>◂ CALM</span>
          <span>NEUTRAL</span>
          <span>STRESS ▸</span>
        </div>
      </div>

      {/* 2-col paired legend (3 rows) */}
      <div className="px-6 pb-5">
        <div className="grid grid-cols-2 gap-x-8">
          {PAIRS.map(([a, b], i) => (
            <div key={i} className="contents">
              <LegendRow s={stateMap[a]} divider={i > 0} />
              <LegendRow s={stateMap[b]} divider={i > 0} />
            </div>
          ))}
        </div>
      </div>

      {/* Three-bin footer (Calm / Neutral / Stress) — pushed to bottom */}
      <div className="grid grid-cols-3 border-t border-border mt-auto">
        <BandCell tone="up"   label="Calm"    pct={calm}    sub="Low + Mid-Low" />
        <BandCell tone="gold" label="Neutral" pct={neutral} sub="Mid + Mid-High" divider />
        <BandCell tone="down" label="Stress"  pct={stress}  sub="High + Panic"   divider />
      </div>
    </div>
  );
}

function LegendRow({ s, divider }: { s: RegimeShare | undefined; divider?: boolean }) {
  if (!s) return <div />;
  return (
    <div className={`flex items-center gap-2.5 py-2 ${divider ? "border-t border-border" : ""}`}>
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colourFor(s.state) }} />
      <span className="text-[13px] text-ink flex-1 truncate">{labelFor(s.state)}</span>
      <span className="font-mono text-[12px] font-semibold text-ink tabular-nums">{fmtPct(s.pct)}</span>
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
