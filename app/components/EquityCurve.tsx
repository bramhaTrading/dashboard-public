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
  Legend,
} from "recharts";
import type { EquityPoint } from "@/lib/types";

function fmt$k(v: number) {
  return `$${(v / 1000).toFixed(0)}k`;
}

export function EquityCurve({ data }: { data: EquityPoint[] }) {
  if (!data.length) {
    return (
      <div className="h-[280px] grid place-items-center text-muted text-sm">
        No equity data yet. The exporter has not run.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
        <defs>
          <linearGradient id="aryaArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a8862c" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#a8862c" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="aryaStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a8862c" />
            <stop offset="100%" stopColor="#c9a84c" />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(20,18,12,0.05)" strokeDasharray="0" vertical={false} />
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
          domain={["dataMin - 500", "dataMax + 500"]}
          width={48}
        />
        <Tooltip
          contentStyle={{
            background: "#fff",
            border: "1px solid rgba(168,134,44,0.32)",
            borderRadius: 8,
            color: "#1c1a14",
            fontFamily: "Geist Mono, monospace",
            fontSize: 12,
            padding: "8px 12px",
          }}
          formatter={(value: number, name: string) => [
            `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            name === "equity" ? "bramhaTrading" : "SPY",
          ]}
          labelStyle={{ color: "#8a8780", fontSize: 10, letterSpacing: "0.08em" }}
        />
        <Area
          type="monotone"
          dataKey="equity"
          stroke="url(#aryaStroke)"
          strokeWidth={2}
          fill="url(#aryaArea)"
          dot={false}
          activeDot={{ r: 4, fill: "#a8862c" }}
        />
        <Line
          type="monotone"
          dataKey="spy_equiv"
          stroke="#5a574f"
          strokeWidth={1.4}
          strokeDasharray="4 4"
          dot={false}
          activeDot={{ r: 3, fill: "#5a574f" }}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, color: "#5a574f", paddingTop: 8 }}
          formatter={(v: string) => (v === "equity" ? "bramhaTrading" : "SPY")}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
