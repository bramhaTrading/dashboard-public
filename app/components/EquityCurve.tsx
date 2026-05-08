"use client";
import {
  Area,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { EquityPoint } from "@/lib/types";

function fmt$k(v: number) {
  return `$${(v / 1000).toFixed(0)}k`;
}
function fmt$(n: number) {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

interface TipProps {
  active?: boolean;
  payload?: Array<{ payload: EquityPoint; value: number; name: string }>;
}

function CustomTip({ active, payload }: TipProps) {
  if (!active || !payload || !payload.length) return null;
  const p   = payload[0].payload;
  const eq  = p.equity;
  const spy = p.spy_equiv;
  const diff = eq - spy;
  return (
    <div className="font-mono bg-white border border-gold-mid rounded-lg px-3 py-2 shadow-md">
      <div className="text-[9px] text-muted tracking-[0.12em] uppercase mb-1">{p.date}</div>
      <div className="text-[13px] text-ink font-semibold tabular-nums">{fmt$(eq)}</div>
      <div className={`text-[10px] tabular-nums mt-0.5 ${diff >= 0 ? "text-up" : "text-down"}`}>
        {diff >= 0 ? "+" : ""}{fmt$(diff)} vs SPY
      </div>
    </div>
  );
}

export function EquityCurve({ data }: { data: EquityPoint[] }) {
  if (!data.length) {
    return (
      <div className="h-[300px] grid place-items-center text-muted text-sm">
        No equity data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
        <defs>
          <linearGradient id="aryaArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#a8862c" stopOpacity={0.28} />
            <stop offset="60%"  stopColor="#c9a84c" stopOpacity={0.10} />
            <stop offset="100%" stopColor="#a8862c" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="aryaStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#a8862c" />
            <stop offset="100%" stopColor="#c9a84c" />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(20,18,12,0.04)" vertical={false} />
        <XAxis
          dataKey="date"
          stroke="#8a8780"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          tickFormatter={(d: string) => d.slice(5)}
        />
        <YAxis
          stroke="#8a8780"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          tickFormatter={fmt$k}
          domain={["auto", "auto"]}
          width={56}
        />
        <Tooltip content={<CustomTip />} cursor={{ stroke: "rgba(168,134,44,0.42)", strokeDasharray: "3 3" }} />
        <Area
          type="monotone"
          dataKey="equity"
          stroke="url(#aryaStroke)"
          strokeWidth={2.5}
          fill="url(#aryaArea)"
          dot={false}
          activeDot={{ r: 4, fill: "#a8862c", strokeWidth: 0 }}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="spy_equiv"
          stroke="rgba(90,87,79,0.35)"
          strokeWidth={1}
          strokeDasharray="3 4"
          dot={false}
          activeDot={false}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
