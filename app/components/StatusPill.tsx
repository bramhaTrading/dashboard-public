/**
 * Minimal status indicator — small coloured dot + text label.
 * Inspired by Vercel deployment status (Queued / Building / Error / Ready).
 * No background fill, no border — keeps tables visually quiet so the data
 * carries the weight, not the badge.
 */
type Tone = "up" | "down" | "amber" | "gold" | "sky" | "mid" | "grey";

const dotBg = (tone: Tone) =>
  ({
    up:    "bg-up",
    down:  "bg-down",
    amber: "bg-amber-500",
    gold:  "bg-gold",
    sky:   "bg-sky",
    mid:   "bg-mid",
    grey:  "bg-[#9ca3af]",
  }[tone]);

const txtColor = (tone: Tone) =>
  ({
    up:    "text-up",
    down:  "text-down",
    amber: "text-[#d97706]",
    gold:  "text-gold",
    sky:   "text-sky",
    mid:   "text-mid",
    grey:  "text-mid",
  }[tone]);

export function StatusPill({
  tone,
  label,
  pulse = false,
}: {
  tone:  Tone;
  label: string;
  pulse?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] font-medium tracking-wider whitespace-nowrap">
      <span className={`relative flex w-2 h-2 ${pulse ? "" : ""}`}>
        {pulse && (
          <span className={`absolute inline-flex h-full w-full rounded-full ${dotBg(tone)} opacity-60 animate-ping`} />
        )}
        <span className={`relative inline-flex w-2 h-2 rounded-full ${dotBg(tone)}`} />
      </span>
      <span className={txtColor(tone)}>{label}</span>
    </span>
  );
}

/** Trade exit reason → tone + display label */
export function exitReasonPill(reason: string | null | undefined): { tone: Tone; label: string } {
  if (!reason) return { tone: "amber", label: "Open" };
  const r = reason.toUpperCase();
  if (r.includes("TARGET"))             return { tone: "up",    label: "Target hit" };
  if (r.includes("TRAIL"))              return { tone: "up",    label: "Trailing" };
  if (r.includes("STOP_LOSS") || r === "STOP") return { tone: "down",  label: "Stop loss" };
  if (r.includes("SCORE") || r.includes("DEGRADED")) return { tone: "amber", label: "Degraded" };
  if (r.includes("SWAP"))               return { tone: "sky",   label: "Swap" };
  if (r.includes("CLOSE"))              return { tone: "grey",  label: "Closed" };
  return { tone: "grey", label: reason };
}

/** Recommendation → tone */
export function recoTone(reco: string): Tone {
  if (reco === "BUY")   return "up";
  if (reco === "SELL")  return "down";
  if (reco === "AVOID") return "down";
  return "grey";
}
